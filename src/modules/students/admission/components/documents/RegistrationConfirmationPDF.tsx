/**
 * RegistrationConfirmationPDF.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enrollment / Registration Confirmation letter.
 * Includes a two-column student details card with passport photo sidebar.
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

        divider: { height: 2, backgroundColor: primary, marginVertical: 8 },
        dividerThin: { height: 0.5, backgroundColor: '#cbd5e1', marginVertical: 6 },
        refRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
        refText: { fontSize: 9, color: '#475569' },
        refBold: { fontFamily: 'Helvetica-Bold' },

        reBlock: { backgroundColor: '#f0f4ff', padding: '6 10', borderRadius: 3, marginVertical: 8 },
        reText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: primary, textTransform: 'uppercase', letterSpacing: 0.3 },

        bodyText: { fontSize: 9.5, lineHeight: 1.8, color: '#334155', marginBottom: 7 },
        bodyBold: { fontFamily: 'Helvetica-Bold' },

        // ── Student Card ─────────────────────────────────────────────────────
        studentCard: {
            flexDirection: 'row',
            border: `1 solid ${primary}`,
            borderRadius: 6,
            overflow: 'hidden',
            marginVertical: 12,
        },
        cardPhotoCol: {
            width: 100,
            backgroundColor: primary,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
        },
        cardPhoto: { width: 72, height: 88, borderRadius: 4, objectFit: 'cover', border: `2 solid rgba(255,255,255,0.4)` },
        cardPhotoPlaceholder: { width: 72, height: 88, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
        cardPhotoText: { color: 'rgba(255,255,255,0.7)', fontSize: 7, textAlign: 'center' },
        cardPhotoName: { color: '#fff', fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginTop: 6 },
        cardPhotoAdmNo: { color: 'rgba(255,255,255,0.7)', fontSize: 7, textAlign: 'center', marginTop: 2 },

        cardInfoCol: { flex: 1, padding: '10 14', backgroundColor: '#fafbff' },
        cardTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 4 },
        cardRow: { flexDirection: 'row', marginBottom: 5 },
        cardLabel: { width: '45%', fontSize: 8.5, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 },
        cardValue: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e293b' },

        // ── Confirmed badge ──────────────────────────────────────────────────
        confirmedBadge: {
            backgroundColor: '#dcfce7',
            border: `1 solid #86efac`,
            borderRadius: 4,
            padding: '8 14',
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 8,
        },
        confirmedText: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#166534' },
        confirmedSub: { fontSize: 8.5, color: '#15803d', marginTop: 2 },

        // ── Info row ─────────────────────────────────────────────────────────
        infoTable: { marginVertical: 6 },
        infoRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9', paddingVertical: 5 },
        infoLabel: { width: '40%', fontSize: 9, color: '#64748b' },
        infoValue: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e293b' },

        feeBox: { backgroundColor: '#fffbeb', border: `1 solid #fde68a`, borderRadius: 4, padding: '7 12', marginVertical: 8 },
        feeText: { fontSize: 9, color: '#92400e', lineHeight: 1.7 },

        sigBlock: { position: 'relative', marginTop: 24 },
        sigImage: { width: 120, height: 48, objectFit: 'contain' },
        sigLine: { height: 1, backgroundColor: '#334155', width: 160, marginTop: 4 },
        sigName: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginTop: 3 },
        sigTitle: { fontSize: 8.5, color: '#64748b', marginTop: 1, letterSpacing: 0.5, textTransform: 'uppercase' },
        stampImage: { width: 72, height: 72, objectFit: 'contain', opacity: 0.85, position: 'absolute', right: -80, bottom: 0 },

        footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: primary, paddingVertical: 6, paddingHorizontal: 44, flexDirection: 'row', justifyContent: 'space-between' },
        footerText: { fontSize: 7.5, color: 'rgba(255,255,255,0.85)' },
        pageNum: { fontSize: 7.5, color: 'rgba(255,255,255,0.6)' },

        confidential: { position: 'absolute', top: 14, right: 44, backgroundColor: '#16a34a', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 2 },
        confidentialText: { fontSize: 7, color: '#fff', fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
    });

const RegistrationConfirmationPDF = ({ admission = {}, institution = {} }) => {
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
        institution.address_line_1, institution.city,
        institution.phone ? `Tel: ${institution.phone}` : '',
        institution.email,
    ].filter(Boolean);

    const genderMap = { M: 'Male', F: 'Female' };

    const details = [
        { label: 'Full Name', value: studentName },
        { label: 'Admission No.', value: admNo },
        { label: 'Class / Grade', value: className },
        { label: 'Date of Admission', value: admDate },
        { label: 'Gender', value: genderMap[admission.student_gender] || admission.student_gender || '—' },
        { label: 'Nationality', value: admission.student_nationality || 'Kenyan' },
        { label: 'Parent / Guardian', value: guardianName },
        { label: 'Contact', value: admission.guardian_phone || '—' },
    ].filter(d => d.value && d.value !== '—');

    return (
        <Document title={`Registration Confirmation — ${studentName}`} author={institution.name}>
            <Page size="A4" style={styles.page}>

                <View style={styles.confidential}>
                    <Text style={styles.confidentialText}>CONFIRMED</Text>
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
                </View>

                <View style={styles.divider} />

                <View style={styles.refRow}>
                    <Text style={styles.refText}><Text style={styles.refBold}>Ref: </Text>REG/{admNo}/{new Date().getFullYear()}</Text>
                    <Text style={styles.refText}><Text style={styles.refBold}>Date: </Text>{today()}</Text>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 9.5, lineHeight: 1.6, color: '#334155' }}>{guardianName}</Text>
                    {admission.guardian_phone ? <Text style={{ fontSize: 9.5, color: '#334155' }}>Tel: {admission.guardian_phone}</Text> : null}
                </View>

                <Text style={styles.bodyText}>Dear {guardianName},</Text>

                <View style={styles.reBlock}>
                    <Text style={styles.reText}>RE: REGISTRATION CONFIRMATION — {studentName.toUpperCase()}</Text>
                </View>

                {/* Confirmed badge */}
                <View style={styles.confirmedBadge}>
                    <View>
                        <Text style={styles.confirmedText}>✓ Enrollment Confirmed</Text>
                        <Text style={styles.confirmedSub}>
                            {studentName} has been successfully registered at {institution.name || 'the institution'} with effect from {admDate}.
                        </Text>
                    </View>
                </View>

                {/* Student details card with photo */}
                <View style={styles.studentCard}>
                    {/* Photo sidebar */}
                    <View style={styles.cardPhotoCol}>
                        {admission.passport_photo_url
                            ? <Image src={admission.passport_photo_url} style={styles.cardPhoto} />
                            : <View style={styles.cardPhotoPlaceholder}><Text style={styles.cardPhotoText}>Passport{'\n'}Photo</Text></View>
                        }
                        <Text style={styles.cardPhotoName}>{studentName.split(' ')[0]}</Text>
                        <Text style={styles.cardPhotoAdmNo}>{admNo}</Text>
                    </View>

                    {/* Info grid */}
                    <View style={styles.cardInfoCol}>
                        <Text style={styles.cardTitle}>Student Details</Text>
                        {details.map((d, i) => (
                            <View key={i} style={styles.cardRow}>
                                <Text style={styles.cardLabel}>{d.label}</Text>
                                <Text style={styles.cardValue}>{d.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.bodyText}>
                    This letter serves as official confirmation that the above-named student is duly registered and enrolled
                    at {institution.name || 'this institution'}. Please retain this document for your records as it may be
                    required for official purposes.
                </Text>

                {/* Fee reminder */}
                <View style={styles.feeBox}>
                    <Text style={styles.feeText}>
                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>Fee Reminder: </Text>
                        Kindly ensure all outstanding fees are settled before or on the first day of the term.
                        Contact the Bursar's office for the current fee structure and payment options including M-Pesa.
                    </Text>
                </View>

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
                    System-generated registration confirmation — {today()} — Ref: REG/{admNo}/{new Date().getFullYear()}
                </Text>

                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>{institution.name}  |  {institution.email}  |  {institution.phone}</Text>
                    <Text style={styles.pageNum} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
};

export default RegistrationConfirmationPDF;
