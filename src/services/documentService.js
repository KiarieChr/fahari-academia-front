/**
 * documentService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles all document generation, downloading, emailing, and WhatsApp sharing
 * for school letters (Admission Letter, Offer Letter, Registration Confirmation).
 *
 * PDF generation is done entirely in the browser via @react-pdf/renderer.
 * The backend is only called for email delivery.
 */
import React from 'react';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { api } from './api';
import AdmissionLetterPDF from '../modules/students/admission/components/documents/AdmissionLetterPDF';
import OfferLetterPDF from '../modules/students/admission/components/documents/OfferLetterPDF';
import RegistrationConfirmationPDF from '../modules/students/admission/components/documents/RegistrationConfirmationPDF';

// ── Helpers ──────────────────────────────────────────────────────────────────
const DOC_META = {
    admission_letter: {
        label: 'Admission Letter',
        short: 'ADM',
        component: AdmissionLetterPDF,
    },
    offer_letter: {
        label: 'Offer Letter',
        short: 'OFR',
        component: OfferLetterPDF,
    },
    registration_confirmation: {
        label: 'Registration Confirmation',
        short: 'REG',
        component: RegistrationConfirmationPDF,
    },
};

/**
 * Renders a PDF component to a Blob.
 * @param {string}  docType     – 'admission_letter' | 'offer_letter' | 'registration_confirmation'
 * @param {object}  admission   – full admission object from the API
 * @param {object}  institution – InstitutionProfile from /api/institution/
 * @returns {Blob}
 */
const renderToBlob = async (docType, admission, institution) => {
    const meta = DOC_META[docType];
    if (!meta) throw new Error(`Unknown doc type: ${docType}`);
    const element = React.createElement(meta.component, { admission, institution });
    return pdf(element).toBlob();
};

/**
 * Builds a safe filename: e.g. "ADM001_admission_letter.pdf"
 */
const buildFilename = (admission, docType) => {
    const admNo = (admission.admission_number || `id${admission.id}`).replace(/\//g, '-');
    return `${admNo}_${docType}.pdf`;
};

/**
 * Triggers a browser download for a Blob.
 */
const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

// ── Public API ────────────────────────────────────────────────────────────────
export const documentService = {
    // ─────────────────────────────────────────────────────────────────────────
    // generateAndDownload
    // Renders the PDF in the browser and triggers a file download.
    // ─────────────────────────────────────────────────────────────────────────
    generateAndDownload: async (docType, admission, institution) => {
        const blob = await renderToBlob(docType, admission, institution);
        triggerDownload(blob, buildFilename(admission, docType));
        return blob;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // sendEmail
    // Renders the PDF then POSTs it as multipart to the backend email endpoint.
    // ─────────────────────────────────────────────────────────────────────────
    sendEmail: async (docType, admission, institution, recipientEmail = null) => {
        const blob = await renderToBlob(docType, admission, institution);
        const filename = buildFilename(admission, docType);

        const formData = new FormData();
        formData.append('pdf_file', blob, filename);
        formData.append('doc_type', docType);
        if (recipientEmail) formData.append('recipient_email', recipientEmail);

        const response = await api.post(
            `/api/student-management/admissions/${admission.id}/send_document/`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data || response;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // getWhatsAppLink
    // Builds a wa.me URL with a pre-filled message. No API key needed.
    // ─────────────────────────────────────────────────────────────────────────
    getWhatsAppLink: (admission, institution, docType) => {
        const meta = DOC_META[docType] || { label: 'School Document' };
        const studentName = admission.student_name || admission.applicant_name || 'your child';
        const schoolName = institution?.name || 'the school';
        const phone = (admission.guardian_phone || '').replace(/\D/g, ''); // digits only

        const message = [
            `Dear ${admission.guardian_name || 'Parent/Guardian'},`,
            ``,
            `${schoolName} has generated the *${meta.label}* for *${studentName}*.`,
            ``,
            `Admission No: *${admission.admission_number || '—'}*`,
            ``,
            `Please contact the school office to collect your copy or for any queries.`,
            ``,
            `${institution?.phone ? `Tel: ${institution.phone}` : ''}`,
            `${institution?.email ? `Email: ${institution.email}` : ''}`,
        ].filter(l => l !== undefined).join('\n');

        const encoded = encodeURIComponent(message);
        return phone
            ? `https://wa.me/${phone}?text=${encoded}`
            : `https://wa.me/?text=${encoded}`;  // fallback if no phone — opens dialog
    },

    // ─────────────────────────────────────────────────────────────────────────
    // bulkDownloadZip
    // Renders multiple PDFs and bundles them into a ZIP archive.
    // onProgress(current, total) callback for UI progress bar.
    // ─────────────────────────────────────────────────────────────────────────
    bulkDownloadZip: async (docType, admissions, institution, onProgress = null) => {
        const zip = new JSZip();
        const meta = DOC_META[docType] || { label: 'Documents' };

        for (let i = 0; i < admissions.length; i++) {
            const admission = admissions[i];
            if (onProgress) onProgress(i + 1, admissions.length);
            const blob = await renderToBlob(docType, admission, institution);
            const filename = buildFilename(admission, docType);
            zip.file(filename, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        const dateStr = new Date().toISOString().slice(0, 10);
        triggerDownload(zipBlob, `${meta.label.replace(/ /g, '_')}_${dateStr}.zip`);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // bulkSendAll
    // Renders PDFs and emails each parent. Reports progress.
    // Returns { sent, failed, skipped, details }
    // onProgress(current, total, result) — called after each send attempt
    // ─────────────────────────────────────────────────────────────────────────
    bulkSendAll: async (docType, admissions, institution, onProgress = null) => {
        const results = [];

        for (let i = 0; i < admissions.length; i++) {
            const admission = admissions[i];
            const recipientEmail = admission.guardian_email;

            if (!recipientEmail) {
                const result = { id: admission.id, status: 'skipped', reason: 'No email address' };
                results.push(result);
                if (onProgress) onProgress(i + 1, admissions.length, result);
                continue;
            }

            try {
                const blob = await renderToBlob(docType, admission, institution);
                const filename = buildFilename(admission, docType);
                const formData = new FormData();
                formData.append('pdf_file', blob, filename);
                formData.append('doc_type', docType);
                formData.append('recipient_email', recipientEmail);

                await api.post(
                    `/api/student-management/admissions/${admission.id}/send_document/`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                const result = { id: admission.id, status: 'sent', sent_to: recipientEmail };
                results.push(result);
                if (onProgress) onProgress(i + 1, admissions.length, result);
            } catch (err) {
                const result = {
                    id: admission.id,
                    status: 'error',
                    reason: err.response?.data?.error || err.message,
                };
                results.push(result);
                if (onProgress) onProgress(i + 1, admissions.length, result);
            }
        }

        const sent = results.filter(r => r.status === 'sent').length;
        const failed = results.filter(r => r.status === 'error').length;
        const skipped = results.filter(r => r.status === 'skipped').length;

        return { sent, failed, skipped, total: results.length, details: results };
    },

    /** Convenience: get human-readable label for a doc type */
    getDocLabel: (docType) => DOC_META[docType]?.label || docType,

    /** All supported doc types */
    DOC_TYPES: Object.keys(DOC_META).map(key => ({ value: key, ...DOC_META[key] })),
};

export default documentService;
