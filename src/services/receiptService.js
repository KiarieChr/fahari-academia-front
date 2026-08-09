// src/services/receiptService.js
/**
 * Receipt Service - API layer for Receipt Book Dashboard
 * Handles data transformation between backend (snake_case) and frontend (camelCase)
 */

import { api } from './api';

export const receiptService = {
    /**
     * Get list of receipts with filters
     * @param {Object} filters - Filter criteria
     * @param {number} page - Page number
     * @param {number} pageSize - Items per page
     * @returns {Promise} Promise resolving to receipt list
     */
    getReceipts: async (filters = {}, page = 1, pageSize = 20) => {
        const params = {
            page,
            page_size: pageSize,
        };

        // Add filters if provided
        if (filters.startDate) params.date_from = filters.startDate;
        if (filters.endDate) params.date_to = filters.endDate;
        if (filters.receiptType && filters.receiptType !== 'All') {
            // Convert display name to backend choice value
            const typeMap = {
                'Student Fee': 'STUDENT_FEE',
                'Student Non-Fee': 'STUDENT_NON_FEE',
                'Sponsor': 'SPONSOR',
                'General': 'GENERAL'
            };
            params.receipt_type = typeMap[filters.receiptType] || filters.receiptType;
        }
        if (filters.paymentMethod && filters.paymentMethod !== 'All') params.payment_method = filters.paymentMethod;
        if (filters.status && filters.status !== 'All') params.status = filters.status;
        if (filters.searchTerm) params.search = filters.searchTerm;

        const response = await api.get('/api/fees/receipts/', { params });

        // Transform to camelCase
        return {
            count: response.count,
            next: response.next,
            previous: response.previous,
            results: response.results.map(receipt => ({
                id: receipt.id,
                receiptNumber: receipt.receipt_number,
                date: receipt.date,
                receiptType: receipt.receipt_type,
                payerName: receipt.payer_name,
                studentId: receipt.student_id,
                studentName: receipt.student_name,
                admissionNo: receipt.admission_no,
                amount: receipt.amount,
                amountAllocated: receipt.amount_allocated || 0,
                paymentMethod: receipt.payment_method,
                reference: receipt.reference,
                issuedBy: receipt.issued_by,
                status: receipt.status,
                printCount: receipt.print_count,
                feeCategory: receipt.fee_category,
                term: receipt.term,
                year: receipt.year,
                nonFeeCategory: receipt.non_fee_category,
                description: receipt.description,
                sponsorshipType: receipt.sponsorship_type,
                allocationRule: receipt.allocation_rule,
                incomeAccount: receipt.income_account,
                notes: receipt.notes,
                attachments: [], // TODO: Implement attachments
                createdAt: receipt.created_at,
                reversalReason: receipt.reversal_reason,
            })),
        };
    },

    /**
     * Get receipt summary statistics for dashboard
     * @returns {Promise} Promise resolving to summary data
     */
    getSummary: async () => {
        const response = await api.get('/api/fees/receipts/summary/');

        // Transform to camelCase
        return {
            totalReceiptsToday: response.total_receipts_today,
            totalReceiptsTerm: response.total_receipts_term,
            totalAmountToday: response.total_amount_today,
            totalAmountTerm: response.total_amount_term,
            studentFeeReceipts: {
                count: response.student_fee_receipts.count,
                amount: response.student_fee_receipts.amount,
            },
            nonFeeReceipts: {
                count: response.non_fee_receipts.count,
                amount: response.non_fee_receipts.amount,
            },
            sponsorReceipts: {
                count: response.sponsor_receipts.count,
                amount: response.sponsor_receipts.amount,
            },
            generalReceipts: {
                count: response.general_receipts.count,
                amount: response.general_receipts.amount,
            },
            paymentMethodBreakdown: response.payment_method_breakdown,
            lastReceiptNumber: response.last_receipt_number,
            nextReceiptNumber: response.next_receipt_number,
            activeReceiptBook: response.active_receipt_book,
            todayTrend: response.today_trend,
            termTrend: response.term_trend,
        };
    },

    /**
     * Create a new receipt
     * @param {Object} receiptData - Receipt data
     * @returns {Promise} Promise resolving to created receipt
     */
    createReceipt: async (receiptData) => {
        // receiptData.receiptType already comes in as backend value (e.g. 'GENERAL', 'STUDENT_FEE')
        // because CreateReceiptModal.transformToServiceFormat already maps it.
        const payload = {
            receipt_type: receiptData.receiptType,  // already snake_case backend value

            payer_name: receiptData.payerName,
            student_id: receiptData.studentId || null,
            amount_received: receiptData.amount,
            payment_method_id: receiptData.paymentMethodId,
            reference: receiptData.reference || '',
            notes: receiptData.notes || '',
            received_date: receiptData.date,
            // Always create as DRAFT — the modal's handleSave posts it via /post/ if status=Issued
            status: 'DRAFT',

            // Allocations
            allocations: receiptData.allocations || [],

            // Type-specific fields
            fee_category: receiptData.feeCategory || null,
            term_id: receiptData.termId || null,
            academic_year_id: receiptData.academicYearId || null,
            non_fee_category: receiptData.nonFeeCategory || null,
            description: receiptData.description || '',
            sponsorship_type: receiptData.sponsorshipType || null,
            sponsorship_id: receiptData.sponsorshipId || null,
            allocation_rule: receiptData.allocationRule || null,
            income_account_id: receiptData.incomeAccountId || null,
        };

        const response = await api.post('/api/fees/receipts/', payload);
        return response;
    },

    /**
     * Post a draft receipt (make it official)
     * @param {number} id - Receipt ID
     * @returns {Promise} Promise resolving to posted receipt
     */
    postReceipt: async (id) => {
        const response = await api.post(`/api/fees/receipts/${id}/post/`);
        return response;
    },

    /**
     * Reverse a receipt
     * @param {number} id - Receipt ID
     * @param {string} reason - Reversal reason
     * @returns {Promise} Promise resolving to reversed receipt
     */
    reverseReceipt: async (id, reason) => {
        const response = await api.post(`/api/fees/receipts/${id}/reverse/`, { reason });
        return response;
    },

    /**
     * Track receipt print
     * @param {number} id - Receipt ID
     * @returns {Promise} Promise resolving to updated receipt
     */
    trackPrint: async (id) => {
        const response = await api.post(`/api/fees/receipts/${id}/print/`);
        return response;
    },

    /**
     * Get single receipt details
     * @param {number} id - Receipt ID
     * @returns {Promise} Promise resolving to receipt details
     */
    getReceiptDetails: async (id) => {
        const response = await api.get(`/api/fees/receipts/${id}/`);
        return response;
    },

    /**
    * Import receipts from CSV/Excel file
    * @param {File} file - Uploaded file
    * @returns {Promise} Promise resolving to import results
    */
    importReceipts: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/fees/receipts/import/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response;
    },

    /**
     * Allocate a portion of a Sponsor receipt to a student
     * @param {number} id - Sponsor receipt ID
     * @param {Object} allocationData - Allocation details { studentId, amount }
     * @returns {Promise}
     */
    allocateSponsorship: async (id, allocationData) => {
        const payload = {
            student_id: allocationData.studentId,
            amount: allocationData.amount
        };
        const response = await api.post(`/api/fees/receipts/${id}/allocate_sponsor/`, payload);
        return response;
    },

    /**
     * Get next receipt number (if not in summary)
     * @returns {Promise} Promise resolving to next receipt number
     */
    getNextReceiptNumber: async () => {
        const response = await api.get('/api/fees/receipts/next-number/');
        return response.next_receipt_number;
    },
};
