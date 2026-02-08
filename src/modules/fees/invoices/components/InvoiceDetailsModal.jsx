import React from 'react';
import { Printer, Download, Mail, X, FileText } from 'lucide-react';
import { formatKES, getInvoiceStatusBadge } from '../utils/invoiceUtils';

const InvoiceDetailsModal = ({ show, onClose, invoice }) => {
    if (!show || !invoice) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <FileText size={20} className="me-2" />
                            Invoice {invoice.id}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        {/* Header / School Info */}
                        <div className="d-flex justify-content-between mb-4">
                            <div>
                                <h4 className="fw-bold text-primary">FAHARI ACADEMY</h4>
                                <p className="mb-0 small text-muted">P.O. Box 12345, Nairobi</p>
                                <p className="mb-0 small text-muted">info@fahari.co.ke | +254 700 000 000</p>
                            </div>
                            <div className="text-end">
                                <h2 className="text-muted fw-light mb-0">INVOICE</h2>
                                <span className={`badge bg-${getInvoiceStatusBadge(invoice.status)} fs-6 mt-2`}>
                                    {invoice.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <hr />

                        {/* Bill To & Details */}
                        <div className="row g-4 mb-4">
                            <div className="col-sm-6">
                                <h6 className="fw-bold text-uppercase text-muted small">Bill To:</h6>
                                <h5 className="mb-1">{invoice.studentName}</h5>
                                <p className="mb-0 text-muted">Adm No: {invoice.admissionNumber}</p>
                                <p className="mb-0 text-muted">Class: {invoice.className}</p>
                            </div>
                            <div className="col-sm-6 text-sm-end">
                                <div className="mb-2">
                                    <span className="fw-bold text-muted small me-2">Date Issued:</span>
                                    <span>{new Date(invoice.dateIssued).toLocaleDateString()}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="fw-bold text-muted small me-2">Due Date:</span>
                                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="fw-bold text-muted small me-2">Term:</span>
                                    <span>{invoice.term} {invoice.year}</span>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '5%' }}>#</th>
                                        <th style={{ width: '55%' }}>Description</th>
                                        <th style={{ width: '20%' }}>Account</th>
                                        <th style={{ width: '20%' }} className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td><small className="text-muted">{item.accountId}</small></td>
                                            <td className="text-end">{formatKES(item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="text-end fw-bold">Total Amount</td>
                                        <td className="text-end fw-bold">{formatKES(invoice.totalAmount)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className="text-end text-success">Amount Paid</td>
                                        <td className="text-end text-success">-{formatKES(invoice.paidAmount)}</td>
                                    </tr>
                                    <tr className="table-active">
                                        <td colSpan="3" className="text-end fw-bold fs-5">Balance Due</td>
                                        <td className="text-end fw-bold fs-5 text-danger">{formatKES(invoice.balance)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Footer Notes */}
                        <div className="alert alert-light border">
                            <h6 className="fw-bold small">Remarks / Payment Instructions:</h6>
                            <p className="mb-0 small text-muted">
                                {invoice.remarks || 'Please pay via Bank Account: 1234567890 (KCB) or M-PESA Paybill: 123456.'}
                            </p>
                        </div>

                        <div className="text-center mt-3">
                            <small className="text-muted">Generated by {invoice.generatedBy} on {new Date(invoice.dateIssued).toLocaleString()}</small>
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-between">
                        <div>
                            {invoice.status !== 'Paid' && (
                                <span className="small text-danger fw-bold">
                                    <AlertTriangle size={14} className="me-1" />
                                    Payment Overdue if past {new Date(invoice.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary">
                                <Printer size={16} className="me-2" /> Print
                            </button>
                            <button type="button" className="btn btn-outline-primary">
                                <Download size={16} className="me-2" /> Download PDF
                            </button>
                            <button type="button" className="btn btn-primary">
                                <Mail size={16} className="me-2" /> Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Start Icon fix
import { AlertTriangle } from 'lucide-react';

export default InvoiceDetailsModal;
