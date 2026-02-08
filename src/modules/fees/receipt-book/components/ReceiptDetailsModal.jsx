import React from 'react';
import { X, Printer, Download, Mail, RotateCcw, FileText } from 'lucide-react';
import { formatKES, formatDateTime, getReceiptStatusBadge, getReceiptTypeBadge, getPaymentMethodIcon } from '../utils/receiptUtils';

const ReceiptDetailsModal = ({ show, receipt, onClose, onPrint, onReverse, userRole = 'Bursar' }) => {
    if (!show || !receipt) return null;

    const canReverse = receipt.status !== 'Reversed' && receipt.status !== 'Draft' &&
        ['Bursar', 'Accountant'].includes(userRole);

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Receipt Details</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Receipt Header */}
                        <div className="card border-0 bg-light mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h4 className="mb-1">{receipt.receiptNumber}</h4>
                                        <p className="text-muted mb-0">{formatDateTime(receipt.date)}</p>
                                    </div>
                                    <div className="text-end">
                                        <span className={getReceiptStatusBadge(receipt.status)}>
                                            {receipt.status}
                                        </span>
                                        <br />
                                        <span className={`${getReceiptTypeBadge(receipt.receiptType)} mt-2`}>
                                            {receipt.receiptType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payer Information */}
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3">Payer Information</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Payer Name:</strong><br />
                                        {receipt.payerName}
                                    </p>
                                </div>
                                {receipt.studentName && (
                                    <div className="col-md-6">
                                        <p className="mb-2">
                                            <strong>Student:</strong><br />
                                            {receipt.studentName} ({receipt.admissionNo})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3">Payment Details</h6>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <td className="fw-semibold" style={{ width: '40%' }}>Amount</td>
                                            <td className="text-end fs-5 fw-bold text-success">{formatKES(receipt.amount)}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold">Payment Method</td>
                                            <td>
                                                {getPaymentMethodIcon(receipt.paymentMethod)} {receipt.paymentMethod}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold">Reference</td>
                                            <td>{receipt.reference || '-'}</td>
                                        </tr>
                                        {receipt.feeCategory && (
                                            <tr>
                                                <td className="fw-semibold">Fee Category</td>
                                                <td>{receipt.feeCategory}</td>
                                            </tr>
                                        )}
                                        {receipt.term && (
                                            <tr>
                                                <td className="fw-semibold">Term / Year</td>
                                                <td>{receipt.term} {receipt.year}</td>
                                            </tr>
                                        )}
                                        {receipt.nonFeeCategory && (
                                            <tr>
                                                <td className="fw-semibold">Non-Fee Category</td>
                                                <td>{receipt.nonFeeCategory}</td>
                                            </tr>
                                        )}
                                        {receipt.description && (
                                            <tr>
                                                <td className="fw-semibold">Description</td>
                                                <td>{receipt.description}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Audit Trail */}
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3">Audit Information</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Issued By:</strong><br />
                                        {receipt.issuedBy}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Print Count:</strong><br />
                                        {receipt.printCount} time(s)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reversal Information */}
                        {receipt.status === 'Reversed' && receipt.reversalReason && (
                            <div className="alert alert-danger">
                                <h6 className="alert-heading">Receipt Reversed</h6>
                                <p className="mb-0"><strong>Reason:</strong> {receipt.reversalReason}</p>
                            </div>
                        )}

                        {/* Notes */}
                        {receipt.notes && (
                            <div className="mb-4">
                                <h6 className="fw-bold mb-2">Notes</h6>
                                <p className="text-muted">{receipt.notes}</p>
                            </div>
                        )}

                        {/* Attachments */}
                        {receipt.attachments && receipt.attachments.length > 0 && (
                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">Attachments</h6>
                                <div className="list-group">
                                    {receipt.attachments.map((attachment, index) => (
                                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <FileText size={18} className="me-2" />
                                                {attachment}
                                            </div>
                                            <button className="btn btn-sm btn-outline-primary">
                                                <Download size={14} className="me-1" />
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                        {receipt.status !== 'Reversed' && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-info"
                                    onClick={() => alert('Email functionality coming soon')}
                                >
                                    <Mail size={16} className="me-1" />
                                    Email Receipt
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => onPrint(receipt)}
                                >
                                    <Printer size={16} className="me-1" />
                                    {receipt.printCount > 0 ? 'Reprint' : 'Print'}
                                </button>
                                {canReverse && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => onReverse(receipt)}
                                    >
                                        <RotateCcw size={16} className="me-1" />
                                        Reverse Receipt
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetailsModal;
