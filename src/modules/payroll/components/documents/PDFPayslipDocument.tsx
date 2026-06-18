import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 20,
    marginBottom: 25,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  institutionInfo: {
    flex: 1,
    paddingLeft: 15,
  },
  logo: {
    width: 65,
    height: 65,
    objectFit: 'contain',
  },
  institutionName: {
    fontSize: 22,
    fontWeight: 'black',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  institutionDetails: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  titleWrapper: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'black',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 6,
  },
  employeeCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 25,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  employeeAvatarWrapper: {
    width: 90,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    objectFit: 'cover',
  },
  employeeGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    paddingVertical: 18,
    backgroundColor: '#f8fafc',
  },
  gridCell: {
    width: '50%',
    marginBottom: 8,
  },
  cellLabel: {
    fontSize: 8,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cellValue: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  financialsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    width: '48%',
  },
  columnHeaderContainer: {
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 10,
  },
  columnHeaderEarn: {
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#047857', // Emerald
  },
  columnHeaderDed: {
    fontWeight: 'bold',
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#b91c1c', // Red
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowLabel: {
    color: '#475569',
  },
  rowValue: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  reliefLabel: {
    color: '#64748b',
    fontSize: 9,
    fontStyle: 'italic',
  },
  reliefValue: {
    fontWeight: 'bold',
    color: '#059669',
    fontSize: 9,
  },
  columnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    marginTop: 10,
    paddingTop: 8,
  },
  footerLabel: {
    fontWeight: 'bold',
    color: '#334155',
  },
  footerValue: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  netPayWrapper: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  netPayLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  netPayAmount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  smallHeader: {
    color: '#94a3b8',
    fontSize: 9,
    marginBottom: 4,
  },
  smallValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statutoryFooter: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  statutoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statutoryText: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: 'bold',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 10,
  }
});

const fmt = (num) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(num);

const PDFPayslipDocument = ({ activeBreakdown, institution }) => {
  const emp = activeBreakdown?.employee || {};
  const summary = activeBreakdown?.summary || {};
  const earnings = activeBreakdown?.earnings || [];
  const deductions = activeBreakdown?.deductions || [];
  const reliefs = activeBreakdown?.reliefs || [];

  const institutionName = institution?.name || 'Fahari Academia';
  const logoUrl = institution?.logo || null;
  const employerKra = institution?.tax_pin || 'P051234567Z'; // fallback
  const shifRate = institution?.shif_rate || '2.75%';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <View style={styles.institutionInfo}>
              <Text style={styles.institutionName}>{institutionName}</Text>
              <Text style={styles.institutionDetails}>{institution?.address || 'P.O Box 1234 - 00100, Nairobi, Kenya'}</Text>
              <Text style={styles.institutionDetails}>{institution?.email || 'info@fahari.co.ke'} | {institution?.phone || '+254 712 345 678'}</Text>
            </View>
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Payslip</Text>
            <Text style={styles.subtitle}>Payroll - {activeBreakdown?.period}</Text>
          </View>
        </View>

        {/* Employee Card */}
        <View style={styles.employeeCard}>
          {emp.profile_image && (
            <View style={styles.employeeAvatarWrapper}>
               <Image src={emp.profile_image} style={styles.employeeAvatar} />
            </View>
          )}
          <View style={styles.employeeGrid}>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Employee Name</Text>
              <Text style={styles.cellValue}>{emp.name}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Employee ID</Text>
              <Text style={styles.cellValue}>{emp.employee_no}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Department</Text>
              <Text style={styles.cellValue}>{emp.department}</Text>
            </View>
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>KRA PIN</Text>
              <Text style={styles.cellValue}>{emp.kra_pin}</Text>
            </View>
          </View>
        </View>

        {/* Financials Split */}
        <View style={styles.financialsWrapper}>
          
          {/* Earnings side */}
          <View style={styles.column}>
            <View style={[styles.columnHeaderContainer, { borderBottomColor: '#a7f3d0' }]}>
              <Text style={styles.columnHeaderEarn}>Earnings</Text>
            </View>
            
            {earnings.map((e, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rowLabel}>{e.description}</Text>
                <Text style={styles.rowValue}>{fmt(e.amount)}</Text>
              </View>
            ))}
            
            <View style={styles.columnFooter}>
              <Text style={styles.footerLabel}>Gross Pay</Text>
              <Text style={styles.footerValue}>{fmt(summary.gross_pay)}</Text>
            </View>
          </View>

          {/* Deductions side */}
          <View style={styles.column}>
            <View style={[styles.columnHeaderContainer, { borderBottomColor: '#fecaca' }]}>
              <Text style={styles.columnHeaderDed}>Deductions</Text>
            </View>
            
            {deductions.map((d, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.rowLabel}>{d.description}</Text>
                <Text style={styles.rowValue}>{fmt(d.amount)}</Text>
              </View>
            ))}

            {reliefs && reliefs.length > 0 && (
              <View style={{ marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#f1f5f9', borderTopStyle: 'dashed' }}>
                <Text style={[styles.cellLabel, { marginBottom: 4 }]}>Reliefs Applied (Reduces PAYE)</Text>
                {reliefs.map((r, i) => (
                  <View key={`r-${i}`} style={styles.row}>
                    <Text style={styles.reliefLabel}>{r.description}</Text>
                    <Text style={styles.reliefValue}>-{fmt(r.amount)}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.columnFooter}>
              <Text style={styles.footerLabel}>Total Deductions</Text>
              <Text style={styles.footerValue}>{fmt(summary.total_deductions)}</Text>
            </View>
          </View>

        </View>

        {/* Net Pay Final block */}
        <View style={styles.netPayWrapper}>
           <View>
             <Text style={styles.netPayLabel}>Net Pay Disbursed</Text>
             <Text style={styles.netPayAmount}>{fmt(summary.net_pay)}</Text>
           </View>
           <View style={{ alignItems: 'flex-end' }}>
             <Text style={styles.smallHeader}>Payment Date</Text>
             <Text style={styles.smallValue}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
           </View>
        </View>

        {/* Statutory Footer */}
        <View style={styles.statutoryFooter}>
          <View style={styles.statutoryGrid}>
             <Text style={styles.statutoryText}>Employer KRA PIN: {employerKra}</Text>
             <Text style={styles.statutoryText}>SHIF Contribution Rate: {shifRate}</Text>
          </View>
          <Text style={styles.footerNote}>This is a system generated payslip. Signature not required. Compliant with KRA & SHIF regulations.</Text>
        </View>

      </Page>
    </Document>
  );
};

export default PDFPayslipDocument;
