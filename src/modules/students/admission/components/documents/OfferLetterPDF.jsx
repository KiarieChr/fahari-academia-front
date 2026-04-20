/**
 * OfferLetterPDF.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Conditional offer letter — subject to payment of fees and submission of docs.
 * Same letterhead layout as AdmissionLetterPDF but with offer-specific content.
 */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const today = () =>
    new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

const mkStyles = (primary = '#4f46e5', secondary = '#f59e0b') =>
    StyleSheet.create({
        page: { fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b', paddingTop: 32, paddingBottom: 48, paddingHorizontal: 44, backgroundColor: '#ffffff' },
        letterhead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
        lhLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
        lhLogo: { width: 64, height: 64, objectFit: 'contain', marginRight: 12 },
        lhLogoPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: primary, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
        lhInitials: { color: '#fff', fontSize: 22, fontFamily: 'Helvetica-Bold' },
        lhText: { flex: 1 },
        schoolName: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: primary, textTransform: 'uppercase', letterSpacing: 0.5 },
        schoolMotto: { fontSize: 8.5, color: secondary, fontFamily: 'Helvetica-Oblique', marginTop: 2 },
        schoolContact: { fontSize: 7.5, color: '#64748b', marginTop: 3, lineHeight: 1.5 },
        studentPhoto: { width: 70, height: 80, objectFit: 'cover', borderRadius: 4 },
        photoPlaceholder: { width: 70, height: 80, borderRadius: 4, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
        photoPlaceholderText: { fontSize: 7, color: '#94a3b8', textAlign: 'center' },
        divider: { height: 2, backgroundColor: primary, marginVertical: 8 },
        dividerThin: { height: 0.5, backgroundColor: '#cbd5e1', marginVertical: 6 },
        refRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
        refText: { fontSize: 9, color: '#475569' },
        refBold: { fontFamily: 'Helvetica-Bold' },
        addressLine: { fontSize: 9.5, lineHeight: 1.6, color: '#334155' },

        // Offer-specific
        offerBox: { backgroundColor: '#f0fdf4', border: `1 solid #86efac`, borderRadius: 4, padding: '8 12', marginVertical: 10 },
        offerTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
        offerBody: { fontSize: 9.5, color: '#166534', lineHeight: 1.7 },

        reBlock: { backgroundColor: '#f0f4ff', padding: '6 10', borderRadius: 3, marginVertical: 8 },
        reText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: primary, textTransform: 'uppercase', letterSpacing: 0.3 },

        bodyText: { fontSize: 9.5, lineHeight: 1.8, color: '#334155', marginBottom: 7 },
        bodyBold: { fontFamily: 'Helvetica-Bold' },

        // Table for deadline
        deadlineTable: { flexDirection: 'row', borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
        dtLabel: { width: '40%', backgroundColor: primary, padding: '6 10' },
        dtLabelText: { color: '#fff', fontSize: 9, fontFamily: 'Helvetica-Bold' },
        dtValue: { flex: 1, backgroundColor: '#f8fafc', padding: '6 10', border: `1 solid #e2e8f0` },
        dtValueText: { fontSize: 9, color: '#334155', fontFamily: 'Helvetica-Bold' },

        listTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#334155', marginBottom: 4, marginTop: 6 },
        listItem: { flexDirection: 'row', marginBottom: 3 },
        listBullet: { width: 12, fontSize: 9 },
        listText: { flex: 1, fontSize: 9, lineHeight: 1.7, color: '#475569' },

        warningBox: { backgroundColor: '#fff7ed', border: `1 solid #fed7aa`, borderRadius: 4, padding: '6 10', marginVertical: 8 },
        warningText: { fontSize: 9, color: '#9a3412', lineHeight: 1.7 },

        sigBlock: { position: 'relative', marginTop: 24 },
        sigImage: { width: 120, height: 48, objectFit: 'contain' },
        sigLine: { height: 1, backgroundColor: '#334155', width: 160, marginTop: 4 },
        sigName: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginTop: 3 },
        sigTitle: { fontSize: 8.5, color: '#64748b', marginTop: 1, letterSpacing: 0.5, textTransform: 'uppercase' },
        stampImage: { width: 72, height: 72, objectFit: 'contain', opacity: 0.85, position: 'absolute', right: -80, bottom: 0 },

        footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: primary, paddingVertical: 6, paddingHorizontal: 44, flexDirection: 'row', justifyContent: 'space-between' },
        footerText: { fontSize: 7.5, color: 'rgba(255,255,255,0.85)' },
        pageNum: { fontSize: 7.5, color: 'rgba(255,255,255,0.6)' },

        confidential: { position: 'absolute', top: 14, right: 44, backgroundColor: secondary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 2 },
        confidentialText: { fontSize: 7, color: '#fff', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
    });

const OfferLetterPDF = ({ admission = {}, institution = {} }) => {
    const primary = institution.primary_color || '#4f46e5';
    const secondary = institution.secondary_color || '#f59e0b';
    const styles = mkStyles(primary, secondary);

    const studentName = admission.student_name || admission.applicant_name || 'Student';
    const guardianName = admission.guardian_name || 'Parent/Guardian';
    const admNo = admission.admission_number || '—';
    const className = admission.class_name || admission.applying_for_grade_name || '—';

    const principalName = institution.principal_name || 'THE PRINCIPAL';
    const principalTitle = institution.principal_title || 'PRINCIPAL';
    const schoolInitials = (institution.name || 'S').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

    const addressLines = [
        institution.address_line_1, institution.city,
        institution.phone ? `Tel: ${institution.phone}` : '',
        institution.email,
    ].filter(Boolean);

    // Calculate a deadline 14 days from today
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);
    const deadlineStr = deadline.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

    const requiredDocs = [
        'Certified copy of Birth Certificate',
        'Original Primary/Junior School Leaving Certificate',
        '4 recent passport-size photographs',
        'Medical examination form (available at the school office)',
        'Immunisation / vaccination records',
        'Transfer letter from previous school (if applicable)',
    ];

    return (
        <Document title={`Offer Letter — ${studentName}`} author={institution.name}>
            <Page size="A4" style={styles.page}>

                <View style={styles.confidential}>
                    <Text style={styles.confidentialText}>CONDITIONAL OFFER</Text>
                </View>

                {/* Letterhead */}
                <View style={styles.letterhead}>
                    <View style={styles.lhLeft}>
                        {institution.logo
                            ? <Image src={institution.logo} style={styles.lhLogo} />
                            : <View style={styles.lhLogoPlaceholder}><Text style={styles.lhInitials}>{schoolInitials}</Text></View>
                        }
                        <View style={styles.lhText}>
                            <Text style={styles.schoolName}>{institution.name || 'School Name'}</Text>
                            {institution.motto ? <Text style={styles.schoolMotto}>"{institution.motto}"</Text> : null}
                            <Text style={styles.schoolContact}>{addressLines.join('  |  ')}</Text>
                        </View>
                    </View>
                    {admission.passport_photo_url
                        ? <Image src={admission.passport_photo_url} style={styles.studentPhoto} />
                        : <View style={styles.photoPlaceholder}><Text style={styles.photoPlaceholderText}>Passport{'\n'}Photo</Text></View>
                    }
                </View>

                <View style={styles.divider} />

                <View style={styles.refRow}>
                    <Text style={styles.refText}><Text style={styles.refBold}>Ref: </Text>OFR/{admNo}/{new Date().getFullYear()}</Text>
                    <Text style={styles.refText}><Text style={styles.refBold}>Date: </Text>{today()}</Text>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={styles.addressLine}>{guardianName}</Text>
                    {admission.guardian_phone ? <Text style={styles.addressLine}>Tel: {admission.guardian_phone}</Text> : null}
                    {admission.guardian_email ? <Text style={styles.addressLine}>{admission.guardian_email}</Text> : null}
                </View>

                <Text style={styles.bodyText}>Dear {guardianName},</Text>

                <View style={styles.reBlock}>
                    <Text style={styles.reText}>RE: CONDITIONAL OFFER OF ADMISSION — {studentName.toUpperCase()}</Text>
                </View>

                {/* Green offer box */}
                <View style={styles.offerBox}>
                    <Text style={styles.offerTitle}>✓ Offer of Admission</Text>
                    <Text style={styles.offerBody}>
                        We are pleased to offer <Text style={{ fontFamily: 'Helvetica-Bold' }}>{studentName}</Text> a place
                        at {institution.name || 'this institution'} in <Text style={{ fontFamily: 'Helvetica-Bold' }}>{className}</Text>.
                        This offer is conditional upon receipt of all required documents and the prescribed admission fee deposit by the deadline below.
                    </Text>
                </View>

                {/* Deadline table */}
                <View style={styles.deadlineTable}>
                    <View style={styles.dtLabel}><Text style={styles.dtLabelText}>Response Deadline</Text></View>
                    <View style={styles.dtValue}><Text style={styles.dtValueText}>{deadlineStr}</Text></View>
                </View>
                <View style={styles.deadlineTable}>
                    <View style={styles.dtLabel}><Text style={styles.dtLabelText}>Fee Deposit Required</Text></View>
                    <View style={styles.dtValue}><Text style={styles.dtValueText}>As per the current Fee Structure (contact the bursar's office)</Text></View>
                </View>

                <Text style={[styles.listTitle, { marginTop: 8 }]}>Required Documents (submit before the deadline):</Text>
                {requiredDocs.map((doc, i) => (
                    <View key={i} style={styles.listItem}>
                        <Text style={styles.listBullet}>☐</Text>
                        <Text style={styles.listText}>{doc}</Text>
                    </View>
                ))}

                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>Important: </Text>
                        This offer will lapse automatically if the above requirements are not met by <Text style={{ fontFamily: 'Helvetica-Bold' }}>{deadlineStr}</Text>.
                        The school reserves the right to withdraw this offer and allocate the place to another candidate.
                    </Text>
                </View>

                <Text style={styles.bodyText}>
                    To accept this offer, please complete the attached Acceptance Form, attach the required fee receipt and documents,
                    and return them to the school office in person or by registered mail.
                </Text>

                <Text style={styles.bodyText}>Yours faithfully,</Text>

                {/* Signature block */}
                <View style={styles.sigBlock}>
                    {institution.signature_image
                        ? <Image src={institution.signature_image} style={styles.sigImage} />
                        : <View style={{ height: 48 }} />
                    }
                    <View style={styles.sigLine} />
                    <Text style={styles.sigName}>{principalName}</Text>
                    <Text style={styles.sigTitle}>{principalTitle}</Text>
                    <Text style={[styles.sigTitle, { marginTop: 1 }]}>{institution.name || ''}</Text>
                    {institution.stamp_image
                        ? <Image src={institution.stamp_image} style={styles.stampImage} />
                        : null
                    }
                </View>

                <View style={[styles.dividerThin, { marginTop: 20 }]} />
                <Text style={{ fontSize: 7.5, textAlign: 'center', color: '#94a3b8' }}>
                    This conditional offer was generated on {today()} — Ref: OFR/{admNo}/{new Date().getFullYear()}
                </Text>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>{institution.name}  |  {institution.email}  |  {institution.phone}</Text>
                    <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
};

export default OfferLetterPDF;
