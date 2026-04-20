/**
 * AdmissionLetterPDF.jsx
 * ─────────────────────────────────────────────────────────────────
 * Renders a formal Kenyan school Admission Letter as a PDF.
 * Uses @react-pdf/renderer (already installed as a dependency).
 *
 * Props:
 *   admission    – full admission object (from AdmissionSerializer)
 *   institution  – InstitutionProfile object (from /api/institution/)
 *
 * Layout:
 *   [Logo | School Name + Motto + Contact]  [Student Photo]
 *   ─────────────────────────────────────────────────────────
 *   Ref / Date block
 *   Address block (to parent)
 *   Body text
 *   Signature block  [Signature image]  [Stamp image]
 *   ─────────────────────────────────────────────────────────
 *   Footer bar
 */
import React from 'react';
import {
    Document, Page, Text, View, StyleSheet, Image, Font
} from '@react-pdf/renderer';

// ── Helpers ─────────────────────────────────────────────────────────────────
const today = () => {
    const d = new Date();
    return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
};

const capitalise = (str = '') =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

// ── Styles ───────────────────────────────────────────────────────────────────
const mkStyles = (primary = '#4f46e5', secondary = '#f59e0b') =>
    StyleSheet.create({
        page: {
            fontFamily: 'Helvetica',
            fontSize: 10,
            color: '#1e293b',
            paddingTop: 32,
            paddingBottom: 48,
            paddingHorizontal: 44,
            backgroundColor: '#ffffff',
        },

        // ── Letterhead ──────────────────────────────────────────────────────
        letterhead: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 4,
        },
        lhLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
        lhLogo: { width: 64, height: 64, objectFit: 'contain', marginRight: 12 },
        lhLogoPlaceholder: {
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: primary, marginRight: 12,
            alignItems: 'center', justifyContent: 'center',
        },
        lhInitials: { color: '#fff', fontSize: 22, fontFamily: 'Helvetica-Bold' },
        lhText: { flex: 1 },
        schoolName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: primary, textTransform: 'uppercase', letterSpacing: 0.5 },
        schoolMotto: { fontSize: 8.5, color: secondary, fontFamily: 'Helvetica-Oblique', marginTop: 2 },
        schoolContact: { fontSize: 7.5, color: '#64748b', marginTop: 3, lineHeight: 1.5 },
        studentPhoto: { width: 70, height: 80, objectFit: 'cover', borderRadius: 4, border: `1 solid #e2e8f0` },
        photoPlaceholder: {
            width: 70, height: 80, borderRadius: 4,
            backgroundColor: '#f1f5f9', border: `1 solid #e2e8f0`,
            alignItems: 'center', justifyContent: 'center',
        },
        photoPlaceholderText: { fontSize: 7, color: '#94a3b8', textAlign: 'center' },

        // ── Divider ─────────────────────────────────────────────────────────
        divider: { height: 2, backgroundColor: primary, marginVertical: 8 },
        dividerThin: { height: 0.5, backgroundColor: '#cbd5e1', marginVertical: 6 },

        // ── Ref row ─────────────────────────────────────────────────────────
        refRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
        refText: { fontSize: 9, color: '#475569' },
        refBold: { fontFamily: 'Helvetica-Bold' },

        // ── Address block ───────────────────────────────────────────────────
        addressBlock: { marginBottom: 10 },
        addressLine: { fontSize: 9.5, lineHeight: 1.6, color: '#334155' },

        // ── RE: line ────────────────────────────────────────────────────────
        reBlock: { backgroundColor: '#f0f4ff', padding: '6 10', borderRadius: 3, marginVertical: 8 },
        reText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: primary, textTransform: 'uppercase', letterSpacing: 0.3 },

        // ── Body ────────────────────────────────────────────────────────────
        bodyText: { fontSize: 9.5, lineHeight: 1.8, color: '#334155', marginBottom: 7 },
        bodyBold: { fontFamily: 'Helvetica-Bold' },

        // ── Checklist ───────────────────────────────────────────────────────
        listTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#334155', marginBottom: 4, marginTop: 6 },
        listItem: { flexDirection: 'row', marginBottom: 3 },
        listBullet: { width: 12, fontSize: 9 },
        listText: { flex: 1, fontSize: 9, lineHeight: 1.7, color: '#475569' },

        // ── Signature block ──────────────────────────────────────────────────
        sigRow: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end', marginTop: 24, gap: 40 },
        sigBlock: { position: 'relative' },
        sigImage: { width: 120, height: 48, objectFit: 'contain' },
        sigLine: { height: 1, backgroundColor: '#334155', width: 160, marginTop: 4 },
        sigName: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginTop: 3 },
        sigTitle: { fontSize: 8.5, color: '#64748b', marginTop: 1, letterSpacing: 0.5, textTransform: 'uppercase' },
        stampImage: { width: 72, height: 72, objectFit: 'contain', opacity: 0.85, position: 'absolute', right: -40, bottom: 0 },

        // ── Footer ──────────────────────────────────────────────────────────
        footer: {
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: primary, paddingVertical: 6, paddingHorizontal: 44,
            flexDirection: 'row', justifyContent: 'space-between',
        },
        footerText: { fontSize: 7.5, color: 'rgba(255,255,255,0.85)' },
        pageNum: { fontSize: 7.5, color: 'rgba(255,255,255,0.6)' },

        // ── Confidential ribbon ─────────────────────────────────────────────
        confidential: {
            position: 'absolute', top: 14, right: 44,
            backgroundColor: secondary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 2,
        },
        confidentialText: { fontSize: 7, color: '#fff', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
    });

// ── Document ─────────────────────────────────────────────────────────────────
const AdmissionLetterPDF = ({ admission = {}, institution = {} }) => {
    const primary = institution.primary_color || '#4f46e5';
    const secondary = institution.secondary_color || '#f59e0b';
    const styles = mkStyles(primary, secondary);

    const studentName = admission.student_name || admission.applicant_name || 'Student';
    const guardianName = admission.guardian_name || 'Parent/Guardian';
    const admNo = admission.admission_number || '—';
    const className = admission.class_name || admission.applying_for_grade_name || '—';
    const admDate = admission.admission_date
        ? new Date(admission.admission_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
        : today();

    const principalName = institution.principal_name || 'THE PRINCIPAL';
    const principalTitle = institution.principal_title || 'PRINCIPAL';
    const schoolInitials = (institution.name || 'S').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

    const addressLines = [
        institution.address_line_1, institution.address_line_2,
        institution.city, institution.county,
        institution.postal_code ? `P.O. Box ${institution.postal_code}` : '',
        institution.phone ? `Tel: ${institution.phone}` : '',
        institution.email,
    ].filter(Boolean);

    const items = [
        'Birth Certificate (certified copy)',
        'Previous school leaving certificate / report card',
        'Passport-size photographs (4 copies)',
        'NHIF / health insurance card (if applicable)',
        'Immunisation card',
        'Fee payment receipt (as specified in the Fee Structure)',
    ];

    return (
        <Document title={`Admission Letter — ${studentName}`} author={institution.name}>
            <Page size="A4" style={styles.page}>

                {/* Confidential tag */}
                <View style={styles.confidential}>
                    <Text style={styles.confidentialText}>OFFICIAL</Text>
                </View>

                {/* ── Letterhead ── */}
                <View style={styles.letterhead}>
                    <View style={styles.lhLeft}>
                        {institution.logo
                            ? <Image src={institution.logo} style={styles.lhLogo} />
                            : (
                                <View style={styles.lhLogoPlaceholder}>
                                    <Text style={styles.lhInitials}>{schoolInitials}</Text>
                                </View>
                            )
                        }
                        <View style={styles.lhText}>
                            <Text style={styles.schoolName}>{institution.name || 'School Name'}</Text>
                            {institution.motto ? <Text style={styles.schoolMotto}>"{institution.motto}"</Text> : null}
                            <Text style={styles.schoolContact}>{addressLines.join('  |  ')}</Text>
                        </View>
                    </View>

                    {/* Student passport photo */}
                    {admission.passport_photo_url
                        ? <Image src={admission.passport_photo_url} style={styles.studentPhoto} />
                        : (
                            <View style={styles.photoPlaceholder}>
                                <Text style={styles.photoPlaceholderText}>Passport{'\n'}Photo</Text>
                            </View>
                        )
                    }
                </View>

                <View style={styles.divider} />

                {/* ── Ref + Date ── */}
                <View style={styles.refRow}>
                    <Text style={styles.refText}>
                        <Text style={styles.refBold}>Ref: </Text>ADM/{admNo}/{new Date().getFullYear()}
                    </Text>
                    <Text style={styles.refText}>
                        <Text style={styles.refBold}>Date: </Text>{today()}
                    </Text>
                </View>

                {/* ── Address block ── */}
                <View style={styles.addressBlock}>
                    <Text style={styles.addressLine}>{guardianName}</Text>
                    {admission.guardian_phone ? <Text style={styles.addressLine}>Tel: {admission.guardian_phone}</Text> : null}
                    {admission.guardian_email ? <Text style={styles.addressLine}>{admission.guardian_email}</Text> : null}
                </View>

                <Text style={styles.bodyText}>Dear {guardianName},</Text>

                {/* ── RE: line ── */}
                <View style={styles.reBlock}>
                    <Text style={styles.reText}>
                        RE: ADMISSION OF {studentName.toUpperCase()} — {className.toUpperCase()}
                    </Text>
                </View>

                {/* ── Body ── */}
                <Text style={styles.bodyText}>
                    We are pleased to inform you that, following a careful review of the application submitted on behalf
                    of <Text style={styles.bodyBold}>{studentName}</Text>, the School Admissions Committee has resolved
                    to <Text style={styles.bodyBold}>offer admission</Text> to {institution.name || 'this institution'} with
                    effect from <Text style={styles.bodyBold}>{admDate}</Text>.
                </Text>
                <Text style={styles.bodyText}>
                    The student has been assigned to <Text style={styles.bodyBold}>{className}</Text> with
                    Admission Number <Text style={styles.bodyBold}>{admNo}</Text>.
                    Please retain this letter as it will be required during the reporting and registration process.
                </Text>
                <Text style={styles.bodyText}>
                    Kindly ensure that the student reports on the date communicated at the beginning of term, accompanied
                    by all required documents and items as listed below:
                </Text>

                {/* Required items */}
                <Text style={styles.listTitle}>Required Documents &amp; Items:</Text>
                {items.map((item, i) => (
                    <View key={i} style={styles.listItem}>
                        <Text style={styles.listBullet}>{i + 1}.</Text>
                        <Text style={styles.listText}>{item}</Text>
                    </View>
                ))}

                <Text style={[styles.bodyText, { marginTop: 10 }]}>
                    We look forward to welcoming {studentName.split(' ')[0]} to the {institution.name || 'school'} family.
                    For any enquiries, please do not hesitate to contact the school office.
                </Text>

                <Text style={styles.bodyText}>Yours faithfully,</Text>

                {/* ── Signature block ── */}
                <View style={styles.sigRow}>
                    <View style={styles.sigBlock}>
                        {institution.signature_image
                            ? <Image src={institution.signature_image} style={styles.sigImage} />
                            : <View style={{ height: 48 }} />
                        }
                        <View style={styles.sigLine} />
                        <Text style={styles.sigName}>{principalName}</Text>
                        <Text style={styles.sigTitle}>{principalTitle}</Text>
                        <Text style={[styles.sigTitle, { marginTop: 1 }]}>{institution.name || ''}</Text>
                        {/* Stamp overlaid */}
                        {institution.stamp_image
                            ? <Image src={institution.stamp_image} style={styles.stampImage} />
                            : null
                        }
                    </View>
                </View>

                <View style={[styles.dividerThin, { marginTop: 20 }]} />
                <Text style={[styles.refText, { textAlign: 'center', color: '#94a3b8', fontSize: 7.5 }]}>
                    This is an official letter generated by {institution.name || 'the school'}.
                    Admission Number: {admNo}
                </Text>

                {/* ── Footer ── */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        {institution.name}  |  {institution.email}  |  {institution.phone}
                    </Text>
                    <Text style={styles.pageNum} render={({ pageNumber, totalPages }) =>
                        `Page ${pageNumber} of ${totalPages}`
                    } />
                </View>

            </Page>
        </Document>
    );
};

export default AdmissionLetterPDF;
