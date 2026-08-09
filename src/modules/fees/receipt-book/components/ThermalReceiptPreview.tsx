import React, { useRef } from 'react';
import { Printer } from 'lucide-react';
import QRCode from 'qrcode';

/**
 * ThermalReceiptPreview Component
 * Displays a visual preview of how the thermal receipt will look
 */
const ThermalReceiptPreview = ({ receipt, schoolInfo }) => {
    const styles = {
        container: {
            width: '80mm',
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            backgroundColor: 'white',
            padding: '10px',
            border: '1px dashed #ccc',
            margin: '0 auto',
        },
        center: {
            textAlign: 'center',
        },
        bold: {
            fontWeight: 'bold',
        },
        separator: {
            borderTop: '1px solid #000',
            margin: '5px 0',
        },
        row: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2px',
        },
        amount: {
            fontSize: '18px',
            fontWeight: 'bold',
            margin: '10px 0',
        },
    };

    const formatCurrency = (amount) => {
        return 'KES ' + parseFloat(amount).toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-KE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={{ ...styles.center, ...styles.bold, fontSize: '16px' }}>
                {schoolInfo?.name || 'SCHOOL NAME'}
            </div>
            <div style={styles.center}>
                {schoolInfo?.address || 'P.O. Box 123, Nairobi'}
            </div>
            <div style={styles.center}>
                Tel: {schoolInfo?.phone || '0712345678'}
            </div>
            {schoolInfo?.email && (
                <div style={styles.center}>{schoolInfo.email}</div>
            )}

            <div style={styles.separator}></div>

            {/* Title */}
            <div style={{ ...styles.center, ...styles.bold }}>
                OFFICIAL RECEIPT
            </div>

            <div style={styles.separator}></div>

            {/* Receipt Details */}
            <div style={styles.row}>
                <span>Receipt No:</span>
                <span>{receipt.receiptNumber || receipt.receipt_number}</span>
            </div>
            <div style={styles.row}>
                <span>Date:</span>
                <span>{formatDateTime(receipt.date || receipt.received_date)}</span>
            </div>

            <div style={styles.separator}></div>

            {/* Payer Info */}
            <div style={styles.bold}>PAYER INFORMATION</div>
            <div style={styles.row}>
                <span>Name:</span>
                <span>{receipt.payerName || receipt.payer_name}</span>
            </div>
            {(receipt.studentName || receipt.student_name) && (
                <>
                    <div style={styles.row}>
                        <span>Student:</span>
                        <span>{receipt.studentName || receipt.student_name}</span>
                    </div>
                    <div style={styles.row}>
                        <span>Admission:</span>
                        <span>{receipt.admissionNo || receipt.admission_number || 'N/A'}</span>
                    </div>
                </>
            )}

            <div style={styles.separator}></div>

            {/* Payment Details */}
            <div style={styles.bold}>PAYMENT DETAILS</div>
            <div style={styles.row}>
                <span>Type:</span>
                <span>{receipt.receiptType || receipt.receipt_type || 'General'}</span>
            </div>
            <div style={styles.row}>
                <span>Method:</span>
                <span>{receipt.paymentMethod || receipt.payment_method?.name || 'Cash'}</span>
            </div>
            {receipt.reference && (
                <div style={styles.row}>
                    <span>Ref:</span>
                    <span>{receipt.reference}</span>
                </div>
            )}

            <div style={styles.separator}></div>

            {/* Amount */}
            <div style={{ ...styles.center, ...styles.amount }}>
                {formatCurrency(receipt.amount || receipt.amount_received)}
            </div>

            <div style={styles.separator}></div>

            {/* Allocations */}
            {receipt.allocations && receipt.allocations.length > 0 && (
                <>
                    <div style={styles.bold}>PAYMENT BREAKDOWN</div>
                    {receipt.allocations.map((allocation, index) => (
                        <div key={index} style={styles.row}>
                            <span>{allocation.fee_category || allocation.fee_item}:</span>
                            <span>{formatCurrency(allocation.amount)}</span>
                        </div>
                    ))}
                    <div style={styles.separator}></div>
                </>
            )}

            {/* Notes */}
            {receipt.notes && (
                <>
                    <div>Notes: {receipt.notes}</div>
                    <div style={styles.separator}></div>
                </>
            )}

            {/* Footer */}
            <div style={styles.center}>
                Received By: {receipt.issuedBy || receipt.received_by || 'System'}
            </div>

            <div style={styles.separator}></div>

            <div style={{ ...styles.center, ...styles.bold }}>
                THANK YOU!
            </div>
            {schoolInfo?.motto && (
                <div style={styles.center}>{schoolInfo.motto}</div>
            )}

            {/* QR Code would go here */}
            <div style={{ ...styles.center, margin: '10px 0' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    border: '1px solid #ccc',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                }}>
                    QR CODE
                </div>
            </div>

            <div style={{ ...styles.center, fontSize: '10px' }}>
                Powered by Fahari School ERP
            </div>
        </div>
    );
};

export default ThermalReceiptPreview;
