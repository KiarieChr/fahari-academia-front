import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e293b',
    paddingBottom: 15,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  companyDetails: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 2,
  },
  titleWrapper: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
  },
  gridCell: {
    width: '45%',
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
  footerNote: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  }
});

/**
 * A perfectly adaptable React PDF Document for Payslips
 * Takes a `config` object which maps to the saved backend PayslipTemplate JSON format
 * Takes `data` object containing employee/payroll values.
 */
const PDFPayslipDocument = ({ config = {}, data = {} }) => {
  // Extract customizable config with safe fallbacks
  const companyName = config.companyName || 'Fahari Academia';
  const showBankDetails = config.showBankDetails !== undefined ? config.showBankDetails : true;
  const showYTD = config.showYTD !== undefined ? config.showYTD : true;
  const showLeaveBalance = config.showLeaveBalance !== undefined ? config.showLeaveBalance : true;
  const footerNote = config.footerNote || 'This is a system generated payslip. Signature not required.';

  // In a real flow, data would be injected here. For the Settings Preview, use dummy data.
  const previewData = {
    employeeName: data.employeeName || 'John Doe',
    designation: data.designation || 'Senior Lecturer',
    employeeId: data.employeeId || 'EMP-00123',
    kraPin: data.kraPin || 'A123456789Z',
    department: data.department || 'Science Faculty',
    bankAccount: data.bankAccount || 'Equity Bank - 123***789',
    period: data.period || 'December 2025',
    paymentDate: data.paymentDate || '30 Dec 2025',
    netPay: data.netPay || '80,380.00'
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.companyDetails}>P.O Box 1234 - 00100, Nairobi, Kenya</Text>
            <Text style={styles.companyDetails}>info@fahari.co.ke | +254 712 345 678</Text>
          </View>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Payslip</Text>
            <Text style={styles.subtitle}>{previewData.period}</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Employee Name</Text>
            <Text style={styles.cellValue}>{previewData.employeeName}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Designation</Text>
            <Text style={styles.cellValue}>{previewData.designation}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Employee ID</Text>
            <Text style={styles.cellValue}>{previewData.employeeId}</Text>
          </View>
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>KRA PIN</Text>
            <Text style={styles.cellValue}>{previewData.kraPin}</Text>
          </View>
          
          <View style={styles.gridCell}>
            <Text style={styles.cellLabel}>Department</Text>
            <Text style={styles.cellValue}>{previewData.department}</Text>
          </View>

          {showBankDetails && (
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Bank Account</Text>
              <Text style={styles.cellValue}>{previewData.bankAccount}</Text>
            </View>
          )}

          {showLeaveBalance && (
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>Leave Balance</Text>
              <Text style={styles.cellValue}>14 Days</Text>
            </View>
          )}
        </View>

        {/* Financials Split */}
        <View style={styles.financialsWrapper}>
          
          {/* Earnings side */}
          <View style={styles.column}>
            <View style={[styles.columnHeaderContainer, { borderBottomColor: '#a7f3d0' }]}>
              <Text style={styles.columnHeaderEarn}>Earnings</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Basic Salary</Text>
              <Text style={styles.rowValue}>80,000.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>House Allowance</Text>
              <Text style={styles.rowValue}>20,000.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Commuter Allowance</Text>
              <Text style={styles.rowValue}>5,000.00</Text>
            </View>
            
            <View style={styles.columnFooter}>
              <Text style={styles.footerLabel}>Gross Pay</Text>
              <Text style={styles.footerValue}>108,000.00</Text>
            </View>

            {showYTD && (
              <View style={[styles.row, { marginTop: 10 }]}>
                <Text style={[styles.rowLabel, { fontSize: 8 }]}>YTD Gross Earnings</Text>
                <Text style={[styles.rowValue, { fontSize: 8 }]}>1,296,000.00</Text>
              </View>
            )}
          </View>

          {/* Deductions side */}
          <View style={styles.column}>
            <View style={[styles.columnHeaderContainer, { borderBottomColor: '#fecaca' }]}>
              <Text style={styles.columnHeaderDed}>Deductions</Text>
            </View>
            
            <View style={styles.row}>
              <Text style={styles.rowLabel}>PAYE</Text>
              <Text style={styles.rowValue}>18,450.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>NSSF</Text>
              <Text style={styles.rowValue}>1,080.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>SHIF / NHIF</Text>
              <Text style={styles.rowValue}>2,970.00</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>HELB</Text>
              <Text style={styles.rowValue}>3,500.00</Text>
            </View>

            <View style={styles.columnFooter}>
              <Text style={styles.footerLabel}>Total Deductions</Text>
              <Text style={styles.footerValue}>27,620.00</Text>
            </View>

            {showYTD && (
              <View style={[styles.row, { marginTop: 10 }]}>
                <Text style={[styles.rowLabel, { fontSize: 8 }]}>YTD Total Deductions</Text>
                <Text style={[styles.rowValue, { fontSize: 8 }]}>331,440.00</Text>
              </View>
            )}
          </View>

        </View>

        {/* Net Pay Final block */}
        <View style={styles.netPayWrapper}>
           <View>
             <Text style={styles.netPayLabel}>Net Pay Disbursed</Text>
             <Text style={styles.netPayAmount}>KES {previewData.netPay}</Text>
           </View>
           <View style={{ alignItems: 'flex-end' }}>
             <Text style={styles.smallHeader}>Payment Date</Text>
             <Text style={styles.smallValue}>{previewData.paymentDate}</Text>
           </View>
        </View>

        {/* Footer info */}
        <Text style={styles.footerNote}>{footerNote}</Text>

      </Page>
    </Document>
  );
};

export default PDFPayslipDocument;
