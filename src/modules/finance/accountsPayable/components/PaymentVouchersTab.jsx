import React, { useState } from 'react';
import { Search, Plus, Eye, Filter } from 'lucide-react';
import { formatKES, formatDate, getStatusBadgeClass } from '../utils/formatters';
import VoucherCreationModal from './VoucherCreationModal';

const PaymentVouchersTab = ({ vouchers, onVoucherCreated, procurementInvoices, customerInvoices, chartOfAccounts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [prefilledData, setPrefilledData] = useState(null);

    const filteredVouchers = vouchers.filter(voucher => {
        const matchesSearch = voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            voucher.payee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || voucher.voucherType === filterType;
        const matchesStatus = filterStatus === 'All' || voucher.approvalStatus === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleCreateVoucher = (prefillData = null) => {
        setPrefilledData(prefillData);
        setShowCreateModal(true);
    };

    return (
        <div>
            {/* Header Actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => handleCreateVoucher()}
                    >
                        <Plus size={18} />
                        New Payment Voucher
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex gap-3 mb-3 align-items-center">
                <div className="flex-grow-1 position-relative">
                    <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                    <input
                        type="text"
                        className="form-control ps-5"
                        placeholder="Search by voucher number or payee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="form-select"
                    style={{ width: '200px' }}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="All">All Types</option>
                    <option value="General Payment">General Payment</option>
                    <option value="AP Payment">AP Payment</option>
                    <option value="Refund Payment">Refund Payment</option>
                </select>
                <select
                    className="form-select"
                    style={{ width: '200px' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Approval">Pending Approval</option>
                </select>
            </div>

            {/* Table */}
            <div className="ap-table-card">
                <table className="ap-table table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Voucher No</th>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Payee</th>
                            <th>Description</th>
                            <th className="text-end">Amount</th>
                            <th>Approval</th>
                            <th>Posting</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVouchers.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center text-muted py-4">
                                    No vouchers found
                                </td>
                            </tr>
                        ) : (
                            filteredVouchers.map((voucher) => (
                                <tr key={voucher.id}>
                                    <td className="fw-bold text-primary">{voucher.voucherNumber}</td>
                                    <td>{formatDate(voucher.voucherDate)}</td>
                                    <td>
                                        <span className={`badge ${voucher.voucherType === 'General Payment' ? 'bg-secondary' :
                                                voucher.voucherType === 'AP Payment' ? 'bg-primary' :
                                                    'bg-danger'
                                            }`}>
                                            {voucher.voucherType}
                                        </span>
                                    </td>
                                    <td>{voucher.payee}</td>
                                    <td>
                                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={voucher.description}>
                                            {voucher.description}
                                        </div>
                                    </td>
                                    <td className="text-end fw-bold">{formatKES(voucher.totalAmount)}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(voucher.approvalStatus)}>
                                            {voucher.approvalStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(voucher.postingStatus)}>
                                            {voucher.postingStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div className="mt-3 p-3 bg-light rounded">
                <div className="row text-center">
                    <div className="col">
                        <div className="text-muted small">Total Vouchers</div>
                        <div className="fw-bold">{filteredVouchers.length}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Approved</div>
                        <div className="fw-bold text-success">
                            {filteredVouchers.filter(v => v.approvalStatus === 'Approved').length}
                        </div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Pending</div>
                        <div className="fw-bold text-warning">
                            {filteredVouchers.filter(v => v.approvalStatus === 'Pending Approval').length}
                        </div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Total Amount</div>
                        <div className="fw-bold">{formatKES(filteredVouchers.reduce((sum, v) => sum + v.totalAmount, 0))}</div>
                    </div>
                </div>
            </div>

            {/* Voucher Creation Modal */}
            {showCreateModal && (
                <VoucherCreationModal
                    onClose={() => {
                        setShowCreateModal(false);
                        setPrefilledData(null);
                    }}
                    onVoucherCreated={onVoucherCreated}
                    prefilledData={prefilledData}
                    procurementInvoices={procurementInvoices}
                    customerInvoices={customerInvoices}
                    chartOfAccounts={chartOfAccounts}
                />
            )}
        </div>
    );
};

export default PaymentVouchersTab;
