import React, { useState } from 'react';
import { Search, Eye, Download } from 'lucide-react';
import { formatKES, formatDate, getStatusBadgeClass } from '../utils/formatters';

const RefundsTab = ({ refunds }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredRefunds = refunds.filter(refund => {
        const matchesSearch = refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            refund.refundNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            refund.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || refund.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            {/* Info */}
            <div className="alert alert-info mb-3">
                <strong>Refunds Management:</strong> Track all refund vouchers issued to students and sponsors for overpayments.
            </div>

            {/* Filters */}
            <div className="d-flex gap-3 mb-3 align-items-center">
                <div className="flex-grow-1 position-relative">
                    <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                    <input
                        type="text"
                        className="form-control ps-5"
                        placeholder="Search by customer name, refund number, or admission no..."
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
                    <option value="All">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Approval">Pending Approval</option>
                </select>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <Download size={18} />
                    Export
                </button>
            </div>

            {/* Table */}
            <div className="ap-table-card">
                <table className="ap-table table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Refund No</th>
                            <th>Date</th>
                            <th>Customer Type</th>
                            <th>Customer Name</th>
                            <th>Admission/Ref No</th>
                            <th>Linked Invoice</th>
                            <th className="text-end">Refund Amount</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Voucher Ref</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRefunds.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center text-muted py-4">
                                    No refunds found
                                </td>
                            </tr>
                        ) : (
                            filteredRefunds.map((refund) => (
                                <tr key={refund.id}>
                                    <td className="fw-bold text-primary">{refund.refundNumber}</td>
                                    <td>{formatDate(refund.refundDate)}</td>
                                    <td>
                                        <span className={`badge ${refund.customerType === 'Student' ? 'bg-primary' : 'bg-info'}`}>
                                            {refund.customerType}
                                        </span>
                                    </td>
                                    <td>{refund.customerName}</td>
                                    <td className="text-muted">{refund.admissionNo}</td>
                                    <td className="text-muted small">{refund.linkedInvoice}</td>
                                    <td className="text-end fw-bold text-danger">{formatKES(refund.refundAmount)}</td>
                                    <td>
                                        <span className="badge bg-secondary">{refund.paymentMethod}</span>
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(refund.status)}>
                                            {refund.status}
                                        </span>
                                    </td>
                                    <td className="text-muted small">{refund.voucherRef || 'Pending'}</td>
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
                        <div className="text-muted small">Total Refunds</div>
                        <div className="fw-bold">{filteredRefunds.length}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Approved</div>
                        <div className="fw-bold text-success">
                            {filteredRefunds.filter(r => r.status === 'Approved').length}
                        </div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Pending</div>
                        <div className="fw-bold text-warning">
                            {filteredRefunds.filter(r => r.status === 'Pending Approval').length}
                        </div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Total Amount</div>
                        <div className="fw-bold text-danger">{formatKES(filteredRefunds.reduce((sum, r) => sum + r.refundAmount, 0))}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundsTab;
