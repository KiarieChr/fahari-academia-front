/**
 * Payment Voucher Detail Modal
 * 
 * Displays voucher details with:
 * - Payment information
 * - Line items
 * - Approval workflow history
 * - Action buttons (approve, post, void)
 */

import React, { useState, useEffect } from 'react';
import {
    X, CheckCircle, XCircle, Clock, FileText, Building2,
    CreditCard, Wallet, RefreshCcw, User, AlertCircle,
    Printer, Download, ArrowRight, Shield
} from 'lucide-react';
import { financeService } from '../../../../services/financeService';

const STATUS_COLORS = {
    DRAFT: 'secondary',
    PENDING: 'warning',
    APPROVED: 'info',
    POSTED: 'success',
    PAID: 'success',
    VOIDED: 'danger',
    REJECTED: 'danger'
};

const STATUS_ICONS = {
    DRAFT: Clock,
    PENDING: Clock,
    APPROVED: CheckCircle,
    POSTED: FileText,
    PAID: CheckCircle,
    VOIDED: XCircle,
    REJECTED: XCircle
};

const VOUCHER_TYPE_ICONS = {
    AP: Building2,
    GENERAL: CreditCard,
    IMPREST: Wallet,
    REFUND: RefreshCcw
};

const PaymentVoucherDetailModal = ({ show, voucher: initialVoucher, voucherId, onClose, onUpdated }) => {
    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    // Determine the ID to use for API calls
    const effectiveId = voucherId || initialVoucher?.id;

    useEffect(() => {
        if (show) {
            // If we have an initial voucher object, use it directly
            if (initialVoucher) {
                setVoucher(initialVoucher);
                setLoading(false);
            } else if (effectiveId) {
                // Otherwise fetch from API
                loadVoucher();
            }
        }
    }, [show, effectiveId, initialVoucher]);

    const loadVoucher = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await financeService.getPaymentVoucher(effectiveId);
            setVoucher(data);
        } catch (err) {
            setError('Failed to load voucher details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleApprove = async () => {
        setActionLoading('approve');
        try {
            await financeService.approvePaymentVoucher(effectiveId, 'APPROVED', '');
            await loadVoucher();
            onUpdated?.();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to approve voucher');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a rejection reason');
            return;
        }
        setActionLoading('reject');
        try {
            await financeService.approvePaymentVoucher(effectiveId, 'REJECTED', rejectionReason);
            await loadVoucher();
            setShowRejectForm(false);
            setRejectionReason('');
            onUpdated?.();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reject voucher');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePost = async () => {
        setActionLoading('post');
        try {
            await financeService.payPaymentVoucher(effectiveId);
            await loadVoucher();
            onUpdated?.();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to post voucher');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePayment = async () => {
        setActionLoading('pay');
        try {
            await financeService.payPaymentVoucher(effectiveId);
            await loadVoucher();
            onUpdated?.();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process payment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleVoid = async () => {
        const reason = window.prompt('Enter reason for voiding:');
        if (!reason) return;
        setActionLoading('void');
        try {
            await financeService.voidPaymentVoucher(effectiveId, reason);
            await loadVoucher();
            onUpdated?.();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to void voucher');
        } finally {
            setActionLoading(null);
        }
    };

    const StatusIcon = voucher ? STATUS_ICONS[voucher.status] : Clock;
    const TypeIcon = voucher ? VOUCHER_TYPE_ICONS[voucher.voucher_type] : FileText;

    if (!show) return null;

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container" style={{ maxWidth: '900px', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header">
                    <div className="d-flex align-items-center gap-2">
                        {!loading && voucher && (
                            <>
                                <TypeIcon size={20} className="text-primary" />
                                <h5 className="mb-0">{voucher.voucher_number}</h5>
                                <span className={`badge bg-${STATUS_COLORS[voucher.status]}`}>
                                    {voucher.status}
                                </span>
                            </>
                        )}
                    </div>
                    <button className="btn-close" onClick={onClose}></button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger m-3 mb-0 d-flex align-items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                        <button className="btn-close ms-auto" onClick={() => setError(null)}></button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : voucher ? (
                    <div className="modal-body" style={{ maxHeight: 'calc(90vh - 150px)', overflowY: 'auto' }}>
                        {/* Summary Cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <div className="card bg-light border-0">
                                    <div className="card-body text-center">
                                        <small className="text-muted">Amount</small>
                                        <h4 className="mb-0 text-primary">
                                            {formatCurrency(voucher.amount)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card bg-light border-0">
                                    <div className="card-body text-center">
                                        <small className="text-muted">Type</small>
                                        <h5 className="mb-0">
                                            {voucher.voucher_type_display || voucher.voucher_type}
                                        </h5>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card bg-light border-0">
                                    <div className="card-body text-center">
                                        <small className="text-muted">Payment Date</small>
                                        <h5 className="mb-0">{formatDate(voucher.payment_date)}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Payment Details</h6>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Payee</small>
                                        <strong>{voucher.payee_name || voucher.supplier_name || '-'}</strong>
                                    </div>
                                    <div className="col-md-6">
                                        <small className="text-muted d-block">Payment Method</small>
                                        <strong>{voucher.payment_method_display || voucher.payment_method}</strong>
                                    </div>
                                    {voucher.cheque_number && (
                                        <div className="col-md-6">
                                            <small className="text-muted d-block">Cheque Number</small>
                                            <strong>{voucher.cheque_number}</strong>
                                        </div>
                                    )}
                                    {voucher.payment_reference && (
                                        <div className="col-md-6">
                                            <small className="text-muted d-block">Payment Reference</small>
                                            <strong>{voucher.payment_reference}</strong>
                                        </div>
                                    )}
                                    {voucher.bank_account_name && (
                                        <div className="col-md-6">
                                            <small className="text-muted d-block">Bank Account</small>
                                            <strong>{voucher.bank_account_name}</strong>
                                        </div>
                                    )}
                                    <div className="col-12">
                                        <small className="text-muted d-block">Description</small>
                                        <span>{voucher.description || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        {voucher.lines && voucher.lines.length > 0 && (
                            <div className="card mb-4">
                                <div className="card-header bg-white">
                                    <h6 className="mb-0">Line Items</h6>
                                </div>
                                <div className="card-body p-0">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>#</th>
                                                    <th>Description</th>
                                                    <th>GL Account</th>
                                                    <th className="text-end">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {voucher.lines.map((line, index) => (
                                                    <tr key={line.id || index}>
                                                        <td>{index + 1}</td>
                                                        <td>{line.description}</td>
                                                        <td>
                                                            <code>{line.gl_account_code}</code>
                                                            <small className="text-muted d-block">
                                                                {line.gl_account_name}
                                                            </small>
                                                        </td>
                                                        <td className="text-end font-monospace">
                                                            {formatCurrency(line.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="table-light">
                                                    <td colSpan="3" className="text-end fw-bold">Total:</td>
                                                    <td className="text-end font-monospace fw-bold">
                                                        {formatCurrency(voucher.amount)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Approval Workflow */}
                        <div className="card mb-4">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                    <Shield size={16} className="me-2" />
                                    Approval Workflow
                                </h6>
                                {voucher.current_approval_level && (
                                    <small className="text-muted">
                                        Level {voucher.current_approval_level} of {voucher.required_approval_levels}
                                    </small>
                                )}
                            </div>
                            <div className="card-body">
                                {voucher.approvals && voucher.approvals.length > 0 ? (
                                    <div className="approval-timeline">
                                        {voucher.approvals.map((approval, index) => (
                                            <div key={approval.id || index} className="d-flex gap-3 mb-3">
                                                <div className={`approval-dot ${approval.action === 'APPROVED' ? 'bg-success' :
                                                        approval.action === 'REJECTED' ? 'bg-danger' :
                                                            'bg-secondary'
                                                    }`}></div>
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between">
                                                        <strong>
                                                            Level {approval.level} - {approval.action}
                                                        </strong>
                                                        <small className="text-muted">
                                                            {formatDateTime(approval.action_date)}
                                                        </small>
                                                    </div>
                                                    <div className="text-muted">
                                                        <User size={14} className="me-1" />
                                                        {approval.approver_name}
                                                    </div>
                                                    {approval.notes && (
                                                        <small className="d-block text-muted mt-1">
                                                            "{approval.notes}"
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        <Clock size={24} className="mb-2" />
                                        <p className="mb-0">No approval actions yet</p>
                                    </div>
                                )}

                                {/* Rejection Form */}
                                {showRejectForm && (
                                    <div className="mt-3 p-3 bg-danger-subtle rounded">
                                        <label className="form-label">Rejection Reason</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Please provide reason for rejection..."
                                        />
                                        <div className="d-flex gap-2 mt-2">
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={handleReject}
                                                disabled={actionLoading === 'reject'}
                                            >
                                                {actionLoading === 'reject' ? (
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                ) : (
                                                    <XCircle size={14} className="me-1" />
                                                )}
                                                Confirm Rejection
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={() => setShowRejectForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audit Trail */}
                        <div className="card">
                            <div className="card-header bg-white">
                                <h6 className="mb-0">Audit Trail</h6>
                            </div>
                            <div className="card-body">
                                <div className="row g-3 small">
                                    <div className="col-md-6">
                                        <span className="text-muted">Created By:</span>
                                        <strong className="d-block">{voucher.created_by_name || '-'}</strong>
                                    </div>
                                    <div className="col-md-6">
                                        <span className="text-muted">Created Date:</span>
                                        <strong className="d-block">{formatDateTime(voucher.created_at)}</strong>
                                    </div>
                                    {voucher.posted_by_name && (
                                        <>
                                            <div className="col-md-6">
                                                <span className="text-muted">Posted By:</span>
                                                <strong className="d-block">{voucher.posted_by_name}</strong>
                                            </div>
                                            <div className="col-md-6">
                                                <span className="text-muted">Posted Date:</span>
                                                <strong className="d-block">{formatDateTime(voucher.posted_date)}</strong>
                                            </div>
                                        </>
                                    )}
                                    {voucher.journal_entry && (
                                        <div className="col-md-12">
                                            <span className="text-muted">Journal Entry:</span>
                                            <strong className="d-block">
                                                <FileText size={14} className="me-1" />
                                                {voucher.journal_entry_number}
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted">
                        <AlertCircle size={48} className="mb-2" />
                        <p>Voucher not found</p>
                    </div>
                )}

                {/* Footer with Actions */}
                {voucher && (
                    <div className="modal-footer">
                        {/* Print/Export */}
                        <div className="me-auto d-flex gap-2">
                            <button className="btn btn-outline-secondary btn-sm">
                                <Printer size={14} /> Print
                            </button>
                            <button className="btn btn-outline-secondary btn-sm">
                                <Download size={14} /> PDF
                            </button>
                        </div>

                        {/* Workflow Actions */}
                        {voucher.status === 'PENDING' && (
                            <>
                                <button
                                    className="btn btn-success"
                                    onClick={handleApprove}
                                    disabled={actionLoading === 'approve'}
                                >
                                    {actionLoading === 'approve' ? (
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                    ) : (
                                        <CheckCircle size={16} className="me-1" />
                                    )}
                                    Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={showRejectForm}
                                >
                                    <XCircle size={16} className="me-1" />
                                    Reject
                                </button>
                            </>
                        )}

                        {voucher.status === 'APPROVED' && (
                            <button
                                className="btn btn-primary"
                                onClick={handlePost}
                                disabled={actionLoading === 'post'}
                            >
                                {actionLoading === 'post' ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                    <ArrowRight size={16} className="me-1" />
                                )}
                                Post to GL
                            </button>
                        )}

                        {voucher.status === 'POSTED' && (
                            <button
                                className="btn btn-success"
                                onClick={handlePayment}
                                disabled={actionLoading === 'pay'}
                            >
                                {actionLoading === 'pay' ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                    <CreditCard size={16} className="me-1" />
                                )}
                                Mark as Paid
                            </button>
                        )}

                        {['DRAFT', 'PENDING', 'APPROVED'].includes(voucher.status) && (
                            <button
                                className="btn btn-outline-danger"
                                onClick={handleVoid}
                                disabled={actionLoading === 'void'}
                            >
                                {actionLoading === 'void' ? (
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                ) : (
                                    <XCircle size={16} className="me-1" />
                                )}
                                Void
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                    padding: 1rem;
                }
                .modal-container {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                }
                .modal-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                }
                .approval-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-top: 4px;
                }
                .approval-timeline {
                    position: relative;
                }
                .approval-timeline::before {
                    content: '';
                    position: absolute;
                    left: 5px;
                    top: 16px;
                    bottom: 16px;
                    width: 2px;
                    background: #e9ecef;
                }
            `}</style>
        </div>
    );
};

export default PaymentVoucherDetailModal;
