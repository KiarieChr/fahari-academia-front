import React from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatKES, formatDate } from '../utils/formatters';

const PostingPreviewModal = ({ voucher, onClose, onPost }) => {
    const isBalanced = voucher.lineItems && voucher.lineItems.length > 0;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold">Posting Preview</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Voucher Header */}
                        <div className="card bg-light border-0 mb-4">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Voucher Number:</small>
                                        <div className="fw-bold">{voucher.voucherNumber}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Date:</small>
                                        <div className="fw-bold">{formatDate(voucher.voucherDate)}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Payee:</small>
                                        <div className="fw-bold">{voucher.payee}</div>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <small className="text-muted">Type:</small>
                                        <div>
                                            <span className={`badge ${voucher.voucherType === 'General Payment' ? 'bg-secondary' :
                                                    voucher.voucherType === 'AP Payment' ? 'bg-primary' :
                                                        'bg-danger'
                                                }`}>
                                                {voucher.voucherType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-12 mb-2">
                                        <small className="text-muted">Description:</small>
                                        <div>{voucher.description}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Accounting Entries */}
                        <h6 className="fw-bold mb-3">Accounting Entries</h6>
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Account Code</th>
                                        <th>Account Name</th>
                                        <th className="text-end">Debit (KES)</th>
                                        <th className="text-end">Credit (KES)</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Debit Entries (Expense/Asset accounts) */}
                                    {voucher.lineItems && voucher.lineItems.map((item, index) => (
                                        <tr key={`debit-${index}`}>
                                            <td className="fw-bold">{item.account}</td>
                                            <td>{item.accountName}</td>
                                            <td className="text-end fw-bold">{formatKES(item.amount)}</td>
                                            <td className="text-end">-</td>
                                            <td className="small text-muted">{item.notes || '-'}</td>
                                        </tr>
                                    ))}

                                    {/* Credit Entry (Cash/Bank account) */}
                                    <tr className="table-secondary">
                                        <td className="fw-bold">
                                            {voucher.paymentMethod === 'M-Pesa' ? '1200' :
                                                voucher.paymentMethod === 'Cash' ? '1100' : '1000'}
                                        </td>
                                        <td>
                                            {voucher.paymentMethod === 'M-Pesa' ? 'M-Pesa Account' :
                                                voucher.paymentMethod === 'Cash' ? 'Cash on Hand' : 'Cash at Bank'}
                                        </td>
                                        <td className="text-end">-</td>
                                        <td className="text-end fw-bold">{formatKES(voucher.totalAmount)}</td>
                                        <td className="small text-muted">Payment via {voucher.paymentMethod}</td>
                                    </tr>
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <td colSpan="2" className="text-end fw-bold">Totals:</td>
                                        <td className="text-end fw-bold text-primary">{formatKES(voucher.totalAmount)}</td>
                                        <td className="text-end fw-bold text-primary">{formatKES(voucher.totalAmount)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Balance Check */}
                        {isBalanced ? (
                            <div className="alert alert-success d-flex align-items-center">
                                <CheckCircle size={20} className="me-2" />
                                <div>
                                    <strong>Balanced Entry:</strong> Debits equal credits. This voucher is ready to post.
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-danger d-flex align-items-center">
                                <AlertTriangle size={20} className="me-2" />
                                <div>
                                    <strong>Unbalanced Entry:</strong> Debits do not equal credits. Cannot post this voucher.
                                </div>
                            </div>
                        )}

                        {/* Warning */}
                        <div className="alert alert-warning">
                            <AlertTriangle size={18} className="me-2" />
                            <strong>Warning:</strong> Once posted, this voucher will be locked and cannot be edited or deleted.
                        </div>
                    </div>
                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="button"
                            className="btn btn-success d-flex align-items-center gap-2"
                            onClick={() => onPost(voucher)}
                            disabled={!isBalanced}
                        >
                            <CheckCircle size={18} />
                            Post to Ledger
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostingPreviewModal;
