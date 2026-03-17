/**
 * Supplier Invoices Tab
 * 
 * Manages supplier invoices with approval and posting workflow.
 * Supports IPSAS/IFRS compliant accrual accounting.
 */

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, FileText, CheckCircle,
    XCircle, Clock, AlertTriangle, Eye, MoreVertical,
    Calendar, Building2, ArrowUpRight, Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { financeService } from '../../../../services/financeService';
import CreateSupplierInvoiceModal from './CreateSupplierInvoiceModal';
import SupplierInvoiceDetailModal from './SupplierInvoiceDetailModal';

// Confirmation Dialog Component
const ConfirmDialog = ({ show, title, message, confirmText, confirmVariant, onConfirm, onCancel, children }) => {
    if (!show) return null;
    
    return (
        <div className="confirm-dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="confirm-dialog">
                <div className="confirm-dialog-header">
                    <h6 className="mb-0">{title}</h6>
                </div>
                <div className="confirm-dialog-body">
                    {message && <p className="mb-0">{message}</p>}
                    {children}
                </div>
                <div className="confirm-dialog-footer">
                    <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
                    <button className={`btn btn-${confirmVariant || 'primary'} btn-sm`} onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
            <style>{`
                .confirm-dialog-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1060;
                }
                .confirm-dialog {
                    background: white;
                    border-radius: 8px;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                }
                .confirm-dialog-header {
                    padding: 1rem;
                    border-bottom: 1px solid #e9ecef;
                }
                .confirm-dialog-body {
                    padding: 1rem;
                }
                .confirm-dialog-footer {
                    padding: 0.75rem 1rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

const SupplierInvoicesTab = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [agingData, setAgingData] = useState(null);
    
    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({ show: false });
    const [pendingInvoice, setPendingInvoice] = useState(null);
    const [voidReason, setVoidReason] = useState('');

    useEffect(() => {
        loadData();
    }, [statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = statusFilter ? { status: statusFilter } : {};
            const [invoicesRes, agingRes] = await Promise.all([
                financeService.getSupplierInvoices(params).catch(() => null),
                financeService.getAPAging().catch(() => null)
            ]);
            setInvoices(invoicesRes?.results || invoicesRes || []);
            setAgingData(agingRes);
        } catch (err) {
            console.error('Failed to load invoices:', err);
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

    // Approval flow
    const showApproveConfirm = (invoice) => {
        setPendingInvoice(invoice);
        setConfirmDialog({
            show: true,
            type: 'approve',
            title: 'Approve Invoice',
            message: `Approve invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total_amount)}?`,
            confirmText: 'Approve',
            confirmVariant: 'info'
        });
    };

    const executeApprove = async () => {
        setConfirmDialog({ show: false });
        try {
            await financeService.approveSupplierInvoice(pendingInvoice.id);
            toast.success(`Invoice ${pendingInvoice.invoice_number} approved`);
            loadData();
        } catch (err) {
            console.error('Failed to approve:', err);
            toast.error(err.response?.data?.error || 'Failed to approve invoice');
        }
        setPendingInvoice(null);
    };

    // Post flow
    const showPostConfirm = (invoice) => {
        setPendingInvoice(invoice);
        setConfirmDialog({
            show: true,
            type: 'post',
            title: 'Post to General Ledger',
            message: `Post invoice ${invoice.invoice_number} (${formatCurrency(invoice.total_amount)}) to the General Ledger? This action cannot be undone.`,
            confirmText: 'Post to GL',
            confirmVariant: 'primary'
        });
    };

    const executePost = async () => {
        setConfirmDialog({ show: false });
        try {
            await financeService.postSupplierInvoice(pendingInvoice.id);
            toast.success(`Invoice ${pendingInvoice.invoice_number} posted to GL`);
            loadData();
        } catch (err) {
            console.error('Failed to post:', err);
            toast.error(err.response?.data?.error || 'Failed to post invoice');
        }
        setPendingInvoice(null);
    };

    // Void flow
    const showVoidConfirm = (invoice) => {
        setPendingInvoice(invoice);
        setVoidReason('');
        setConfirmDialog({
            show: true,
            type: 'void',
            title: 'Void Invoice',
            confirmText: 'Void Invoice',
            confirmVariant: 'danger'
        });
    };

    const executeVoid = async () => {
        if (!voidReason.trim()) {
            toast.warning('Please enter a reason for voiding');
            return;
        }
        setConfirmDialog({ show: false });
        try {
            await financeService.voidSupplierInvoice(pendingInvoice.id, voidReason);
            toast.success(`Invoice ${pendingInvoice.invoice_number} voided`);
            loadData();
        } catch (err) {
            console.error('Failed to void:', err);
            toast.error(err.response?.data?.error || 'Failed to void invoice');
        }
        setPendingInvoice(null);
        setVoidReason('');
    };

    const handleConfirm = () => {
        switch (confirmDialog.type) {
            case 'approve': executeApprove(); break;
            case 'post': executePost(); break;
            case 'void': executeVoid(); break;
            default: setConfirmDialog({ show: false });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: { bg: 'bg-secondary-subtle', text: 'text-secondary', icon: FileText },
            APPROVED: { bg: 'bg-info-subtle', text: 'text-info', icon: CheckCircle },
            POSTED: { bg: 'bg-primary-subtle', text: 'text-primary', icon: ArrowUpRight },
            PAID: { bg: 'bg-success-subtle', text: 'text-success', icon: CheckCircle },
            VOID: { bg: 'bg-danger-subtle', text: 'text-danger', icon: XCircle }
        };
        const style = styles[status] || styles.DRAFT;
        const Icon = style.icon;

        return (
            <span className={`badge ${style.bg} ${style.text} d-flex align-items-center gap-1`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    const getDueDateStyle = (dueDate, status) => {
        if (status === 'PAID' || status === 'VOID') return '';

        const today = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-danger fw-bold';
        if (diffDays <= 7) return 'text-warning';
        return '';
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Aging Summary */}
            {agingData && (
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card border-0 bg-success-subtle">
                            <div className="card-body">
                                <div className="small text-success-emphasis">Current (0-30 days)</div>
                                <div className="h5 mb-0 text-success">{formatCurrency(agingData.current)}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-info-subtle">
                            <div className="card-body">
                                <div className="small text-info-emphasis">31-60 Days</div>
                                <div className="h5 mb-0 text-info">{formatCurrency(agingData['31_60'])}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-warning-subtle">
                            <div className="card-body">
                                <div className="small text-warning-emphasis">61-90 Days</div>
                                <div className="h5 mb-0 text-warning">{formatCurrency(agingData['61_90'])}</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 bg-danger-subtle">
                            <div className="card-body">
                                <div className="small text-danger-emphasis">Over 90 Days</div>
                                <div className="h5 mb-0 text-danger">{formatCurrency(agingData.over_90)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex gap-2">
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-white">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search invoices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select"
                        style={{ maxWidth: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="APPROVED">Approved</option>
                        <option value="POSTED">Posted</option>
                        <option value="PAID">Paid</option>
                        <option value="VOID">Void</option>
                    </select>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={16} />
                    New Invoice
                </button>
            </div>

            {/* Invoices Table */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Supplier</th>
                                    <th>Date</th>
                                    <th>Due Date</th>
                                    <th className="text-end">Amount</th>
                                    <th className="text-end">Balance</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            <FileText size={40} className="mb-2 opacity-50" />
                                            <div>No invoices found</div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map(invoice => (
                                        <tr key={invoice.id}>
                                            <td>
                                                <button
                                                    className="btn btn-link p-0 text-decoration-none"
                                                    onClick={() => setSelectedInvoice(invoice)}
                                                >
                                                    {invoice.invoice_number}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Building2 size={14} className="text-muted" />
                                                    {invoice.supplier_name}
                                                </div>
                                            </td>
                                            <td>
                                                <small>{new Date(invoice.invoice_date).toLocaleDateString()}</small>
                                            </td>
                                            <td className={getDueDateStyle(invoice.due_date, invoice.status)}>
                                                <small className="d-flex align-items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(invoice.due_date).toLocaleDateString()}
                                                    {invoice.days_until_due < 0 && invoice.status !== 'PAID' && (
                                                        <AlertTriangle size={12} className="text-danger" />
                                                    )}
                                                </small>
                                            </td>
                                            <td className="text-end font-monospace">
                                                {formatCurrency(invoice.total_amount)}
                                            </td>
                                            <td className="text-end font-monospace">
                                                {formatCurrency(invoice.balance)}
                                            </td>
                                            <td>{getStatusBadge(invoice.status)}</td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setSelectedInvoice(invoice)}
                                                        title="View"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    {invoice.status === 'DRAFT' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-info"
                                                            onClick={() => showApproveConfirm(invoice)}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    )}

                                                    {invoice.status === 'APPROVED' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => showPostConfirm(invoice)}
                                                            title="Post to GL"
                                                        >
                                                            <ArrowUpRight size={14} />
                                                        </button>
                                                    )}

                                                    {['DRAFT', 'APPROVED'].includes(invoice.status) && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => showVoidConfirm(invoice)}
                                                            title="Void"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateSupplierInvoiceModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        loadData();
                    }}
                />
            )}

            {/* Detail Modal */}
            {selectedInvoice && (
                <SupplierInvoiceDetailModal
                    show={!!selectedInvoice}
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                    onUpdated={loadData}
                />
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog
                show={confirmDialog.show}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                confirmVariant={confirmDialog.confirmVariant}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmDialog({ show: false })}
            >
                {confirmDialog.type === 'void' && (
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
    );
};

export default SupplierInvoicesTab;
