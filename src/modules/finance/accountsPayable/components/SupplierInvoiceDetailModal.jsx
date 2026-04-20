/**
 * Supplier Invoice Detail Modal
 * 
 * Displays invoice details with approval/posting history.
 */

import React, { useState, useEffect } from 'react';
import {
    X, Building2, Calendar, FileText, CheckCircle,
    XCircle, ArrowUpRight, Clock, User, Download, Printer, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { financeService } from '../../../../services/financeService';
import ConfirmDialog from './ConfirmDialog';

const SupplierInvoiceDetailModal = ({ show, invoice: initialInvoice, onClose, onUpdated }) => {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({ show: false });
    const [voidReason, setVoidReason] = useState('');

    // Sync invoice state when initialInvoice changes
    useEffect(() => {
        if (initialInvoice) {
            setInvoice(initialInvoice);
        }
    }, [initialInvoice]);

    useEffect(() => {
        if (show && initialInvoice?.id) {
            loadInvoice();
        }
    }, [show, initialInvoice?.id]);

    const loadInvoice = async () => {
        setLoading(true);
        try {
            const res = await financeService.getSupplierInvoice(initialInvoice.id);
            // Handle both wrapped and unwrapped responses
            const data = res?.data || res;
            if (data && data.id) {
                setInvoice(data);
            }
        } catch (err) {
            console.error('Failed to load invoice:', err);
            toast.error('Failed to load invoice details');
        } finally {
            setLoading(false);
        }
    };

    const showApproveConfirm = () => {
        setConfirmDialog({
            show: true,
            title: 'Approve Invoice',
            message: `Are you sure you want to approve invoice ${invoice.invoice_number}?`,
            confirmText: 'Approve',
            confirmVariant: 'info',
            onConfirm: executeApprove
        });
    };

    const executeApprove = async () => {
        setConfirmDialog({ show: false });
        setActionLoading(true);
        try {
            const res = await financeService.approveSupplierInvoice(invoice.id);
            const data = res?.data || res;
            if (data && data.id) {
                setInvoice(data);
            }
            toast.success(`Invoice ${invoice.invoice_number} approved successfully`);
            onUpdated?.();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to approve invoice');
        } finally {
            setActionLoading(false);
        }
    };

    const showPostConfirm = () => {
        setConfirmDialog({
            show: true,
            title: 'Post to General Ledger',
            message: `Post invoice ${invoice.invoice_number} (${formatCurrency(invoice.total_amount)}) to the General Ledger? This action cannot be undone.`,
            confirmText: 'Post to GL',
            confirmVariant: 'primary',
            onConfirm: executePost
        });
    };

    const executePost = async () => {
        setConfirmDialog({ show: false });
        setActionLoading(true);
        try {
            const res = await financeService.postSupplierInvoice(invoice.id);
            const data = res?.data || res;
            if (data && data.id) {
                setInvoice(data);
            }
            toast.success(`Invoice ${invoice.invoice_number} posted to General Ledger`);
            onUpdated?.();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post invoice');
        } finally {
            setActionLoading(false);
        }
    };

    const showVoidConfirm = () => {
        setVoidReason('');
        setConfirmDialog({
            show: true,
            title: 'Void Invoice',
            isVoid: true,
            confirmText: 'Void Invoice',
            confirmVariant: 'danger',
            onConfirm: executeVoid
        });
    };

    const executeVoid = async () => {
        if (!voidReason.trim()) {
            toast.warning('Please enter a reason for voiding');
            return;
        }
        setConfirmDialog({ show: false });
        setActionLoading(true);
        try {
            const res = await financeService.voidSupplierInvoice(invoice.id, voidReason);
            const data = res?.data || res;
            if (data && data.id) {
                setInvoice(data);
            }
            toast.success(`Invoice ${invoice.invoice_number} has been voided`);
            onUpdated?.();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to void invoice');
        } finally {
            setActionLoading(false);
            setVoidReason('');
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
        return dateStr ? new Date(dateStr).toLocaleDateString() : '-';
    };

    const formatDateTime = (dateStr) => {
        return dateStr ? new Date(dateStr).toLocaleString() : '-';
    };

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: { bg: 'bg-secondary', icon: FileText },
            APPROVED: { bg: 'bg-info', icon: CheckCircle },
            POSTED: { bg: 'bg-primary', icon: ArrowUpRight },
            PAID: { bg: 'bg-success', icon: CheckCircle },
            VOID: { bg: 'bg-danger', icon: XCircle }
        };
        const style = styles[status] || styles.DRAFT;
        const Icon = style.icon;

        return (
            <span className={`badge ${style.bg} d-flex align-items-center gap-1`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    if (!show || !invoice) return null;

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h5 className="mb-1">Invoice {invoice.invoice_number}</h5>
                        <small className="text-muted">{invoice.supplier_name}</small>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {getStatusBadge(invoice.status)}
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 180px)', overflowY: 'auto' }}>
                            {/* Invoice Header Info */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <small className="text-muted d-block mb-1">Supplier</small>
                                            <div className="d-flex align-items-center gap-2">
                                                <Building2 size={16} />
                                                <strong>{invoice.supplier_name}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <small className="text-muted d-block mb-1">Invoice Date</small>
                                            <div className="d-flex align-items-center gap-2">
                                                <Calendar size={16} />
                                                {formatDate(invoice.invoice_date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <small className="text-muted d-block mb-1">Due Date</small>
                                            <div className="d-flex align-items-center gap-2">
                                                <Clock size={16} />
                                                {formatDate(invoice.due_date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mb-4">
                                <h6>Line Items</h6>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Description</th>
                                                <th>GL Account</th>
                                                <th className="text-end">Qty</th>
                                                <th className="text-end">Unit Price</th>
                                                <th className="text-end">VAT</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.lines?.map((line, idx) => (
                                                <tr key={idx}>
                                                    <td>{line.description}</td>
                                                    <td><small>{line.gl_account_name}</small></td>
                                                    <td className="text-end">{line.quantity}</td>
                                                    <td className="text-end font-monospace">
                                                        {formatCurrency(line.unit_price)}
                                                    </td>
                                                    <td className="text-end">
                                                        <span className="badge bg-secondary-subtle text-secondary">
                                                            {line.vat_display}
                                                        </span>
                                                    </td>
                                                    <td className="text-end font-monospace">
                                                        {formatCurrency(parseFloat(line.amount) + parseFloat(line.vat_amount || 0))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="table-light">
                                                <td colSpan="5" className="text-end"><strong>Subtotal</strong></td>
                                                <td className="text-end font-monospace">{formatCurrency(invoice.subtotal)}</td>
                                            </tr>
                                            <tr className="table-light">
                                                <td colSpan="5" className="text-end"><strong>VAT</strong></td>
                                                <td className="text-end font-monospace">{formatCurrency(invoice.vat_amount)}</td>
                                            </tr>
                                            <tr className="table-primary">
                                                <td colSpan="5" className="text-end"><strong>Total</strong></td>
                                                <td className="text-end font-monospace fw-bold">{formatCurrency(invoice.total_amount)}</td>
                                            </tr>
                                            {parseFloat(invoice.balance) !== parseFloat(invoice.total_amount) && (
                                                <tr className="table-success">
                                                    <td colSpan="5" className="text-end"><strong>Balance Due</strong></td>
                                                    <td className="text-end font-monospace fw-bold">{formatCurrency(invoice.balance)}</td>
                                                </tr>
                                            )}
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div className="mb-4">
                                <h6>Audit Trail</h6>
                                <div className="list-group list-group-flush">
                                    {invoice.approved_by_name && (
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div className="d-flex align-items-center gap-2">
                                                <CheckCircle size={16} className="text-info" />
                                                <span>Approved by <strong>{invoice.approved_by_name}</strong></span>
                                            </div>
                                            <small className="text-muted">{formatDateTime(invoice.approved_at)}</small>
                                        </div>
                                    )}
                                    {invoice.posted_by_name && (
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div className="d-flex align-items-center gap-2">
                                                <ArrowUpRight size={16} className="text-primary" />
                                                <span>Posted by <strong>{invoice.posted_by_name}</strong></span>
                                            </div>
                                            <small className="text-muted">{formatDateTime(invoice.posted_at)}</small>
                                        </div>
                                    )}
                                    {invoice.journal_entry && (
                                        <div className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div className="d-flex align-items-center gap-2">
                                                <FileText size={16} className="text-success" />
                                                <span>Journal Entry: <code>JE-{invoice.journal_entry}</code></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {invoice.notes && (
                                <div className="mb-4">
                                    <h6>Notes</h6>
                                    <div className="p-3 bg-light rounded">
                                        <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
                                            {invoice.notes}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="modal-footer">
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary d-flex align-items-center gap-1">
                                    <Printer size={14} /> Print
                                </button>
                                <button className="btn btn-outline-secondary d-flex align-items-center gap-1">
                                    <Download size={14} /> Export PDF
                                </button>
                            </div>
                            <div className="d-flex gap-2">
                                {invoice.status === 'DRAFT' && (
                                    <>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={showVoidConfirm}
                                            disabled={actionLoading}
                                        >
                                            <XCircle size={14} className="me-1" /> Void
                                        </button>
                                        <button
                                            className="btn btn-info text-white"
                                            onClick={showApproveConfirm}
                                            disabled={actionLoading}
                                        >
                                            <CheckCircle size={14} className="me-1" /> Approve
                                        </button>
                                    </>
                                )}
                                {invoice.status === 'APPROVED' && (
                                    <>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={showVoidConfirm}
                                            disabled={actionLoading}
                                        >
                                            <XCircle size={14} className="me-1" /> Void
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={showPostConfirm}
                                            disabled={actionLoading}
                                        >
                                            <ArrowUpRight size={14} className="me-1" /> Post to GL
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Confirmation Dialog */}
                <ConfirmDialog
                    show={confirmDialog.show}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmText={confirmDialog.confirmText}
                    confirmVariant={confirmDialog.confirmVariant}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog({ show: false })}
                >
                    {confirmDialog.isVoid && (
                        <div className="mt-3">
                            <div className="d-flex align-items-center gap-2 mb-2 text-danger">
                                <AlertTriangle size={16} />
                                <span className="small">This action cannot be undone.</span>
                            </div>
                            <label className="form-label small">Reason for voiding <span className="text-danger">*</span></label>
                            <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                value={voidReason}
                                onChange={(e) => setVoidReason(e.target.value)}
                                placeholder="Enter reason..."
                                autoFocus
                            />
                        </div>
                    )}
                </ConfirmDialog>
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
                    justify-content: space-between;
                }
            `}</style>
        </div>
    );
};

export default SupplierInvoiceDetailModal;
