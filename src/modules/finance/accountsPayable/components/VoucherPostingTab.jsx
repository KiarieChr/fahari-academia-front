import React, { useState } from 'react';
import { Search, CheckCircle, Eye, Lock } from 'lucide-react';
import { formatKES, formatDate, getStatusBadgeClass } from '../utils/formatters';
import PostingPreviewModal from './PostingPreviewModal';

const VoucherPostingTab = ({ vouchers, onVoucherPosted }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('Approved');
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const filteredVouchers = vouchers.filter(voucher => {
        const matchesSearch = voucher.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            voucher.payee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Approved' && voucher.approvalStatus === 'Approved' && voucher.postingStatus === 'Unposted') ||
            (filterStatus === 'Posted' && voucher.postingStatus === 'Posted');
        return matchesSearch && matchesStatus;
    });

    const handlePreviewPosting = (voucher) => {
        setSelectedVoucher(voucher);
        setShowPreviewModal(true);
    };

    const handlePostVoucher = (voucher) => {
        onVoucherPosted(voucher.id);
        setShowPreviewModal(false);
    };

    const readyToPost = filteredVouchers.filter(v => v.approvalStatus === 'Approved' && v.postingStatus === 'Unposted');

    return (
        <div>
            {/* Info Alert */}
            <div className="alert alert-info d-flex align-items-center mb-3">
                <CheckCircle size={20} className="me-2" />
                <div>
                    <strong>Voucher Posting:</strong> Review and post approved vouchers to the general ledger.
                    {readyToPost.length > 0 && (
                        <span className="ms-2 fw-bold">{readyToPost.length} voucher{readyToPost.length > 1 ? 's' : ''} ready to post.</span>
                    )}
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
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="Approved">Ready to Post</option>
                    <option value="Posted">Posted</option>
                    <option value="All">All Vouchers</option>
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
                            <th className="text-end">Amount</th>
                            <th>Approval Status</th>
                            <th>Posting Status</th>
                            <th>Approved By</th>
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
                                    <td className="text-muted small">{voucher.approvedBy || '-'}</td>
                                    <td>
                                        {voucher.postingStatus === 'Posted' ? (
                                            <button className="btn btn-sm btn-outline-secondary" disabled>
                                                <Lock size={16} className="me-1" />
                                                Locked
                                            </button>
                                        ) : voucher.approvalStatus === 'Approved' ? (
                                            <button
                                                className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                                onClick={() => handlePreviewPosting(voucher)}
                                            >
                                                <CheckCircle size={16} />
                                                Post
                                            </button>
                                        ) : (
                                            <button className="btn btn-sm btn-outline-secondary" disabled>
                                                Pending Approval
                                            </button>
                                        )}
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
                        <div className="text-muted small">Ready to Post</div>
                        <div className="fw-bold text-warning">{readyToPost.length}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Posted</div>
                        <div className="fw-bold text-success">
                            {filteredVouchers.filter(v => v.postingStatus === 'Posted').length}
                        </div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Total Amount</div>
                        <div className="fw-bold">{formatKES(filteredVouchers.reduce((sum, v) => sum + v.totalAmount, 0))}</div>
                    </div>
                </div>
            </div>

            {/* Posting Preview Modal */}
            {showPreviewModal && selectedVoucher && (
                <PostingPreviewModal
                    voucher={selectedVoucher}
                    onClose={() => setShowPreviewModal(false)}
                    onPost={handlePostVoucher}
                />
            )}
        </div>
    );
};

export default VoucherPostingTab;
