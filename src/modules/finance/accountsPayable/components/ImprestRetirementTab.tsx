/**
 * Imprest Retirement Tab
 * 
 * Manages imprest retirement workflow:
 * - View outstanding imprest vouchers
 * - Submit retirement with expense lines
 * - Approve and post retirements
 */

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Eye, CheckCircle, ArrowUpRight,
    Clock, User, Wallet, Receipt, AlertCircle, FileText
} from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import CreateImprestRetirementModal from './CreateImprestRetirementModal';

const ImprestRetirementTab = () => {
    const [retirements, setRetirements] = useState([]);
    const [pendingImprests, setPendingImprests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('retirements'); // 'retirements' | 'pending'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [retirementsRes, vouchersRes] = await Promise.all([
                financeService.getImprestRetirements().catch(() => null),
                financeService.getPaymentVouchers({ voucher_type: 'IMPREST', status: 'PAID' }).catch(() => null)
            ]);

            const retirements = retirementsRes?.results || retirementsRes || [];
            setRetirements(retirements);

            // Filter out vouchers that already have retirements
            const allImprests = vouchersRes?.results || vouchersRes || [];
            const retiredVoucherIds = new Set(retirements.map(r => r.voucher));
            const pending = allImprests.filter(v => !retiredVoucherIds.has(v.id));
            setPendingImprests(pending);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (retirement) => {
        if (!window.confirm('Approve this retirement?')) return;
        try {
            await financeService.approveImprestRetirement(retirement.id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to approve');
        }
    };

    const handlePost = async (retirement) => {
        if (!window.confirm('Post this retirement to the General Ledger?')) return;
        try {
            await financeService.postImprestRetirement(retirement.id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to post');
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

    const getStatusBadge = (status) => {
        const styles = {
            SUBMITTED: { bg: 'bg-warning-subtle', text: 'text-warning', label: 'Pending Approval' },
            APPROVED: { bg: 'bg-info-subtle', text: 'text-info', label: 'Approved' },
            POSTED: { bg: 'bg-success-subtle', text: 'text-success', label: 'Posted' },
            REJECTED: { bg: 'bg-danger-subtle', text: 'text-danger', label: 'Rejected' }
        };
        const style = styles[status] || styles.SUBMITTED;
        return (
            <span className={`badge ${style.bg} ${style.text}`}>{style.label}</span>
        );
    };

    const filteredRetirements = retirements.filter(r =>
        r.voucher_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.staff_member_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPending = pendingImprests.filter(v =>
        v.voucher_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.staff_member_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Summary Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div
                        className={`card border-0 cursor-pointer ${activeView === 'pending' ? 'bg-warning' : 'bg-warning-subtle'}`}
                        onClick={() => setActiveView('pending')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className={`small ${activeView === 'pending' ? 'text-white' : 'text-warning-emphasis'}`}>
                                        Outstanding Imprests
                                    </div>
                                    <div className={`h4 mb-0 ${activeView === 'pending' ? 'text-white' : ''}`}>
                                        {pendingImprests.length}
                                    </div>
                                </div>
                                <Wallet size={32} className={activeView === 'pending' ? 'text-white opacity-75' : 'text-warning opacity-50'} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div
                        className={`card border-0 cursor-pointer ${activeView === 'retirements' ? 'bg-primary' : 'bg-primary-subtle'}`}
                        onClick={() => setActiveView('retirements')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className={`small ${activeView === 'retirements' ? 'text-white' : 'text-primary-emphasis'}`}>
                                        Retirements
                                    </div>
                                    <div className={`h4 mb-0 ${activeView === 'retirements' ? 'text-white' : ''}`}>
                                        {retirements.length}
                                    </div>
                                </div>
                                <Receipt size={32} className={activeView === 'retirements' ? 'text-white opacity-75' : 'text-primary opacity-50'} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 bg-info-subtle">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="small text-info-emphasis">Total Outstanding</div>
                                    <div className="h5 mb-0">
                                        {formatCurrency(pendingImprests.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0))}
                                    </div>
                                </div>
                                <AlertCircle size={32} className="text-info opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="input-group" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text bg-white">
                        <Search size={16} />
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : activeView === 'pending' ? (
                /* Outstanding Imprests Table */
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                        <h6 className="mb-0">Outstanding Imprests Awaiting Retirement</h6>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Voucher #</th>
                                    <th>Staff Member</th>
                                    <th>Issue Date</th>
                                    <th className="text-end">Amount</th>
                                    <th>Description</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPending.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <CheckCircle size={40} className="mb-2 text-success opacity-50" />
                                            <div>All imprests have been retired</div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPending.map(voucher => (
                                        <tr key={voucher.id}>
                                            <td>
                                                <code>{voucher.voucher_number}</code>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <User size={14} className="text-muted" />
                                                    {voucher.staff_member_name || voucher.payee_display}
                                                </div>
                                            </td>
                                            <td>{formatDate(voucher.payment_date)}</td>
                                            <td className="text-end font-monospace fw-medium">
                                                {formatCurrency(voucher.amount)}
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {voucher.description?.substring(0, 50)}
                                                    {voucher.description?.length > 50 ? '...' : ''}
                                                </small>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => {
                                                        setSelectedVoucher(voucher);
                                                        setShowCreateModal(true);
                                                    }}
                                                >
                                                    <Receipt size={14} className="me-1" />
                                                    Retire
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Retirements Table */
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                        <h6 className="mb-0">Imprest Retirements</h6>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Voucher #</th>
                                    <th>Staff Member</th>
                                    <th>Retirement Date</th>
                                    <th className="text-end">Original</th>
                                    <th className="text-end">Retired</th>
                                    <th className="text-end">Surrender</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRetirements.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            <FileText size={40} className="mb-2 opacity-50" />
                                            <div>No retirements found</div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRetirements.map(retirement => (
                                        <tr key={retirement.id}>
                                            <td>
                                                <code>{retirement.voucher_number}</code>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <User size={14} className="text-muted" />
                                                    {retirement.staff_member_name}
                                                </div>
                                            </td>
                                            <td>{formatDate(retirement.retirement_date)}</td>
                                            <td className="text-end font-monospace">
                                                {formatCurrency(retirement.original_amount)}
                                            </td>
                                            <td className="text-end font-monospace">
                                                {formatCurrency(retirement.total_retired)}
                                            </td>
                                            <td className="text-end font-monospace">
                                                {formatCurrency(retirement.surrender_amount)}
                                            </td>
                                            <td>{getStatusBadge(retirement.status)}</td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    {retirement.status === 'SUBMITTED' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-info"
                                                            onClick={() => handleApprove(retirement)}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    )}

                                                    {retirement.status === 'APPROVED' && (
                                                        <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => handlePost(retirement)}
                                                            title="Post to GL"
                                                        >
                                                            <ArrowUpRight size={14} />
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

            {/* Create Retirement Modal */}
            {showCreateModal && selectedVoucher && (
                <CreateImprestRetirementModal
                    show={showCreateModal}
                    voucher={selectedVoucher}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedVoucher(null);
                    }}
                    onCreated={() => {
                        setShowCreateModal(false);
                        setSelectedVoucher(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

export default ImprestRetirementTab;
