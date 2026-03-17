/**
 * Payment Vouchers Tab (Enhanced)
 * 
 * Comprehensive payment voucher management with:
 * - AP, General, Imprest, and Refund voucher types
 * - Approval workflow integration
 * - Real-time status tracking
 */

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Eye, CheckCircle, XCircle,
    Clock, ArrowUpRight, CreditCard, FileText, User,
    Building2, Wallet, RefreshCcw, MoreVertical, Ban
} from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import CreatePaymentVoucherModal from './CreatePaymentVoucherModal';
import PaymentVoucherDetailModal from './PaymentVoucherDetailModal';

const EnhancedPaymentVouchersTab = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const [voucherStats, setVoucherStats] = useState([]);

    useEffect(() => {
        loadData();
    }, [typeFilter, statusFilter]);

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (typeFilter) params.voucher_type = typeFilter;
            if (statusFilter) params.status = statusFilter;

            const [vouchersRes, pendingRes, statsRes] = await Promise.all([
                financeService.getPaymentVouchers(params).catch(() => null),
                financeService.getPendingApprovalVouchers().catch(() => null),
                financeService.getVouchersByType().catch(() => null)
            ]);

            setVouchers(vouchersRes?.results || vouchersRes || []);
            setPendingCount((pendingRes?.results || pendingRes || []).length);
            setVoucherStats(statsRes || []);
        } catch (err) {
            console.error('Failed to load vouchers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (voucher) => {
        const comments = window.prompt('Enter approval comments (optional):');
        try {
            await financeService.approvePaymentVoucher(voucher.id, 'APPROVED', comments || '');
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to approve');
        }
    };

    const handleReject = async (voucher) => {
        const comments = window.prompt('Enter rejection reason:');
        if (!comments) {
            alert('Rejection reason is required');
            return;
        }
        try {
            await financeService.approvePaymentVoucher(voucher.id, 'REJECTED', comments);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to reject');
        }
    };

    const handlePay = async (voucher) => {
        if (!window.confirm(`Process payment for ${voucher.voucher_number}?`)) return;
        try {
            await financeService.payPaymentVoucher(voucher.id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to process payment');
        }
    };

    const handleVoid = async (voucher) => {
        const reason = window.prompt('Enter void reason:');
        if (!reason) return;
        try {
            await financeService.voidPaymentVoucher(voucher.id, reason);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to void');
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

    const getTypeBadge = (type) => {
        const styles = {
            AP: { bg: 'bg-primary-subtle', text: 'text-primary', icon: Building2, label: 'AP Payment' },
            GENERAL: { bg: 'bg-info-subtle', text: 'text-info', icon: CreditCard, label: 'General' },
            IMPREST: { bg: 'bg-warning-subtle', text: 'text-warning', icon: Wallet, label: 'Imprest' },
            REFUND: { bg: 'bg-success-subtle', text: 'text-success', icon: RefreshCcw, label: 'Refund' }
        };
        const style = styles[type] || styles.GENERAL;
        const Icon = style.icon;

        return (
            <span className={`badge ${style.bg} ${style.text} d-flex align-items-center gap-1`}>
                <Icon size={12} />
                {style.label}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const styles = {
            DRAFT: { bg: 'bg-secondary-subtle', text: 'text-secondary', icon: FileText },
            PENDING_APPROVAL: { bg: 'bg-warning-subtle', text: 'text-warning', icon: Clock },
            APPROVED: { bg: 'bg-info-subtle', text: 'text-info', icon: CheckCircle },
            PAID: { bg: 'bg-success-subtle', text: 'text-success', icon: CheckCircle },
            VOID: { bg: 'bg-danger-subtle', text: 'text-danger', icon: XCircle }
        };
        const style = styles[status] || styles.DRAFT;
        const Icon = style.icon;

        return (
            <span className={`badge ${style.bg} ${style.text} d-flex align-items-center gap-1`}>
                <Icon size={12} />
                {status.replace('_', ' ')}
            </span>
        );
    };

    const filteredVouchers = vouchers.filter(v =>
        v.voucher_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.payee_display?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 bg-warning-subtle">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="small text-warning-emphasis">Pending Approval</div>
                                    <div className="h4 mb-0">{pendingCount}</div>
                                </div>
                                <Clock size={28} className="text-warning opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
                {voucherStats.slice(0, 3).map((stat, idx) => (
                    <div key={idx} className="col-md-3">
                        <div className="card border-0 bg-light">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="small text-muted">{stat.voucher_type} Vouchers</div>
                                        <div className="h5 mb-0">{stat.count}</div>
                                        <small className="text-muted">{formatCurrency(stat.total_amount)}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex gap-2 flex-wrap">
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <span className="input-group-text bg-white">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search vouchers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select"
                        style={{ maxWidth: '150px' }}
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="AP">AP Payment</option>
                        <option value="GENERAL">General</option>
                        <option value="IMPREST">Imprest</option>
                        <option value="REFUND">Refund</option>
                    </select>
                    <select
                        className="form-select"
                        style={{ maxWidth: '180px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PAID">Paid</option>
                        <option value="VOID">Void</option>
                    </select>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={16} />
                    New Voucher
                </button>
            </div>

            {/* Vouchers Table */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Voucher #</th>
                                    <th>Type</th>
                                    <th>Payee</th>
                                    <th>Date</th>
                                    <th className="text-end">Amount</th>
                                    <th>Status</th>
                                    <th>Next Approval</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            <CreditCard size={40} className="mb-2 opacity-50" />
                                            <div>No vouchers found</div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVouchers.map(voucher => (
                                        <tr key={voucher.id}>
                                            <td>
                                                <button
                                                    className="btn btn-link p-0 text-decoration-none"
                                                    onClick={() => setSelectedVoucher(voucher)}
                                                >
                                                    {voucher.voucher_number}
                                                </button>
                                            </td>
                                            <td>{getTypeBadge(voucher.voucher_type)}</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <User size={14} className="text-muted" />
                                                    <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                                        {voucher.payee_display}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <small>{formatDate(voucher.payment_date)}</small>
                                            </td>
                                            <td className="text-end font-monospace fw-medium">
                                                {formatCurrency(voucher.amount)}
                                            </td>
                                            <td>{getStatusBadge(voucher.status)}</td>
                                            <td>
                                                {voucher.next_approval ? (
                                                    <span className="badge bg-secondary-subtle text-secondary">
                                                        {voucher.next_approval}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        onClick={() => setSelectedVoucher(voucher)}
                                                        title="View"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    {voucher.status === 'PENDING_APPROVAL' && (
                                                        <>
                                                            <button
                                                                className="btn btn-sm btn-outline-success"
                                                                onClick={() => handleApprove(voucher)}
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={14} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleReject(voucher)}
                                                                title="Reject"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {voucher.status === 'APPROVED' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handlePay(voucher)}
                                                            title="Process Payment"
                                                        >
                                                            <ArrowUpRight size={14} />
                                                        </button>
                                                    )}

                                                    {['DRAFT', 'PENDING_APPROVAL', 'APPROVED'].includes(voucher.status) && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleVoid(voucher)}
                                                            title="Void"
                                                        >
                                                            <Ban size={14} />
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
                <CreatePaymentVoucherModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => {
                        setShowCreateModal(false);
                        loadData();
                    }}
                />
            )}

            {/* Detail Modal */}
            {selectedVoucher && (
                <PaymentVoucherDetailModal
                    show={!!selectedVoucher}
                    voucher={selectedVoucher}
                    onClose={() => setSelectedVoucher(null)}
                    onUpdated={loadData}
                />
            )}
        </div>
    );
};

export default EnhancedPaymentVouchersTab;
