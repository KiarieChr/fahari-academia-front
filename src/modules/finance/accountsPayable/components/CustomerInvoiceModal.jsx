import React from 'react';
import { X, User, FileText, Calendar, DollarSign, RefreshCw, Printer } from 'lucide-react';
import { formatKES, formatDate } from '../utils/formatters';

const CustomerInvoiceModal = ({ invoice, onClose, onCreateRefund }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content shadow-lg">
                    <div className="modal-header border-0 pb-0 d-print-none">
                        <h5 className="modal-title fw-bold">Invoice Details</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 position-relative" id="printable-invoice">
                        {/* Watermarks */}
                        {invoice.status === 'PROFORMA' && (
                            <div className="position-absolute top-50 start-50 translate-middle text-muted opacity-25" style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', fontSize: '5rem', fontWeight: 'bold', zIndex: 0, pointerEvents: 'none' }}>
                                PROFORMA
                            </div>
                        )}
                        {invoice.is_recurring && (
                            <div className="position-absolute top-0 end-0 m-3 badge bg-info-subtle text-info border border-info">
                                RECURRING
                            </div>
                        )}

                        {/* Invoice Header (Branding for Print) */}
                        <div className="d-none d-print-block mb-4 text-center">
                            <h2 className="fw-bold">SkyLearn Institution</h2>
                            <p className="text-muted small mb-0">P.O Box 123-00100, Nairobi, Kenya</p>
                            <p className="text-muted small">info@skylearn.edu.ke | +254 700 000 000</p>
                            <hr />
                        </div>

                        {/* Header Info */}
                        <div className="row mb-4 position-relative" style={{ zIndex: 1 }}>
                            <div className="col-md-6">
                                <h6 className="text-muted small text-uppercase fw-bold mb-3">Bill To</h6>
                                <div className="mb-1 fw-bold fs-5">{invoice.name || invoice.customer_name}</div>
                                <div className="text-muted small">
                                    <span className={`badge ${invoice.customerType === 'Student' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'} me-2`}>
                                        {invoice.customerType || 'Customer'}
                                    </span>
                                    {invoice.admissionNo}
                                </div>
                                {invoice.email && <div className="text-muted small mt-1">{invoice.email}</div>}
                                {invoice.phone && <div className="text-muted small">{invoice.phone}</div>}
                            </div>
                            <div className="col-md-6 text-md-end">
                                <h6 className="text-muted small text-uppercase fw-bold mb-3">Invoice Details</h6>
                                <div className="row g-2">
                                    <div className="col-6 col-md-12">
                                        <span className="text-muted small me-2">Invoice No:</span>
                                        <span className="fw-bold">{invoice.invoiceNumber || invoice.invoice_number}</span>
                                    </div>
                                    <div className="col-6 col-md-12">
                                        <span className="text-muted small me-2">Date Issued:</span>
                                        <span className="fw-bold">{formatDate(invoice.dateIssued || invoice.date_issued)}</span>
                                    </div>
                                    <div className="col-6 col-md-12">
                                        <span className="text-muted small me-2">Due Date:</span>
                                        <span className="fw-bold text-danger">{formatDate(invoice.dueDate || invoice.due_date)}</span>
                                    </div>
                                    <div className="col-6 col-md-12">
                                        <span className="text-muted small me-2">Status:</span>
                                        <span className={`badge ${invoice.status === 'PROFORMA' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered border-light table-striped-columns">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col" className="text-uppercase small fw-bold">Description</th>
                                        <th scope="col" className="text-end text-uppercase small fw-bold" style={{ width: '100px' }}>Qty</th>
                                        <th scope="col" className="text-end text-uppercase small fw-bold" style={{ width: '150px' }}>Unit Price</th>
                                        <th scope="col" className="text-end text-uppercase small fw-bold" style={{ width: '150px' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.lines && invoice.lines.map((line, idx) => (
                                        <tr key={idx}>
                                            <td>{line.description}</td>
                                            <td className="text-end">{line.quantity}</td>
                                            <td className="text-end">{formatKES(line.unit_price)}</td>
                                            <td className="text-end fw-bold">{formatKES(line.amount)}</td>
                                        </tr>
                                    ))}
                                    {!invoice.lines && (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted">No line items details available</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <td colSpan="3" className="text-end fw-bold">Total Amount</td>
                                        <td className="text-end fw-bold fs-5">{formatKES(invoice.amount || invoice.total_amount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Payment History (Screen Only) */}
                        <div className="d-print-none">
                            <h6 className="fw-bold mb-3">Payment History</h6>
                            <div className="table-responsive mb-3 border rounded">
                                <table className="table table-sm mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.paymentHistory && invoice.paymentHistory.length > 0 ? (
                                            invoice.paymentHistory.map((payment, index) => (
                                                <tr key={index}>
                                                    <td>{formatDate(payment.date)}</td>
                                                    <td className="fw-bold text-success">{formatKES(payment.amount)}</td>
                                                    <td>
                                                        <span className="badge bg-secondary">{payment.method}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-3">No payments recorded</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Overpayment Alert */}
                        {invoice.status === 'Overpaid' && (
                            <div className="alert alert-danger d-flex align-items-center d-print-none">
                                <RefreshCw size={20} className="me-2" />
                                <div className="flex-grow-1">
                                    <strong>Overpayment Detected:</strong> This customer has overpaid by {formatKES(Math.abs(invoice.balance))}.
                                    A refund voucher should be created.
                                </div>
                            </div>
                        )}

                        {/* Footer Notes */}
                        {invoice.notes && (
                            <div className="mt-4 p-3 bg-light rounded small text-muted">
                                <strong>Notes:</strong> {invoice.notes}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-top bg-light d-print-none">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        {invoice.status === 'Overpaid' && (
                            <button
                                type="button"
                                className="btn btn-danger d-flex align-items-center gap-2"
                                onClick={() => {
                                    onCreateRefund(invoice);
                                    onClose();
                                }}
                            >
                                <RefreshCw size={18} />
                                Create Refund Voucher
                            </button>
                        )}
                        <button type="button" className="btn btn-primary" onClick={handlePrint}>
                            <Printer size={18} className="me-2" />
                            Print Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerInvoiceModal;
