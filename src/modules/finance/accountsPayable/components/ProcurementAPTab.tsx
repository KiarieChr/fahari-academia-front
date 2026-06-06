import React, { useState } from 'react';
import { Search, Plus, Filter, CheckCircle, Lock } from 'lucide-react';
import { formatKES, formatDate, getStatusBadgeClass } from '../utils/formatters';

const ProcurementAPTab = ({ invoices, onCreateVoucher, onCreateBill }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredInvoices = invoices.filter(inv => {
        const v_name = (inv.vendor_name || inv.supplierName || '').toLowerCase();
        const b_number = (inv.bill_number || inv.invoiceNumber || '').toLowerCase();

        const matchesSearch = v_name.includes(searchTerm.toLowerCase()) ||
            b_number.includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || (inv.status || inv.approvalStatus) === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const availableForVoucher = filteredInvoices.filter(inv => !inv.linkedToVoucher && inv.approvalStatus === 'Approved');

    return (
        <div>
            {/* Info Alert */}
            <div className="alert alert-info d-flex align-items-center mb-3">
                <CheckCircle size={20} className="me-2" />
                <div>
                    <strong>Procurement Integration:</strong> Pick approved invoices from procurement to create payment vouchers.
                    {availableForVoucher.length > 0 && (
                        <span className="ms-2 fw-bold">{availableForVoucher.length} invoice{availableForVoucher.length > 1 ? 's' : ''} ready for voucher creation.</span>
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
                        placeholder="Search by supplier, invoice number, or procurement ref..."
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
                <button className="btn btn-warning text-dark d-flex align-items-center gap-2 ms-auto" onClick={onCreateBill}>
                    <Plus size={18} />
                    Record Bill
                </button>
            </div>

            {/* Table */}
            <div className="ap-table-card">
                <table className="ap-table table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Procurement Ref</th>
                            <th>Supplier Name</th>
                            <th>Invoice Number</th>
                            <th>Description</th>
                            <th className="text-end">Amount</th>
                            <th className="text-end">VAT</th>
                            <th className="text-end">Total</th>
                            <th>Approval Status</th>
                            <th>Due Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center text-muted py-4">
                                    No procurement invoices found
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="fw-bold text-primary">{invoice.procurementRef || '-'}</td>
                                    <td>{invoice.vendor_name || invoice.supplierName}</td>
                                    <td className="text-muted">{invoice.bill_number || invoice.invoiceNumber}</td>
                                    <td>
                                        <div className="text-truncate" style={{ maxWidth: '200px' }} title={invoice.notes || invoice.description}>
                                            {invoice.notes || invoice.description || 'Bill'}
                                        </div>
                                    </td>
                                    <td className="text-end">{formatKES(invoice.total_amount || invoice.amount)}</td>
                                    <td className="text-end">-</td>
                                    <td className="text-end fw-bold">{formatKES(invoice.total_amount || invoice.totalAmount)}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(invoice.status || invoice.approvalStatus)}>
                                            {invoice.status || invoice.approvalStatus}
                                        </span>
                                    </td>
                                    <td>{formatDate(invoice.due_date || invoice.dueDate)}</td>
                                    <td>
                                        {invoice.linkedToVoucher ? (
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                disabled
                                                title={`Linked to ${invoice.voucherRef}`}
                                            >
                                                <Lock size={16} className="me-1" />
                                                Linked
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                onClick={() => onCreateVoucher(invoice)}
                                            >
                                                <Plus size={16} />
                                                Create Voucher
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
                        <div className="text-muted small">Total Invoices</div>
                        <div className="fw-bold">{filteredInvoices.length}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Approved</div>
                        <div className="fw-bold text-success">
                            {filteredInvoices.filter(inv => inv.approvalStatus === 'Approved').length}
                        </div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Available for Voucher</div>
                        <div className="fw-bold text-primary">{availableForVoucher.length}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Total Amount</div>
                        <div className="fw-bold">{formatKES(filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcurementAPTab;
