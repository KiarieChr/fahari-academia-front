import React, { useState } from 'react';
import { Search, Eye, RefreshCw, Download, Plus } from 'lucide-react';
import { formatKES, formatDate, getStatusBadgeClass } from '../utils/formatters';
import CustomerInvoiceModal from './CustomerInvoiceModal';

const CustomerInvoicesTab = ({ invoices, onCreateRefund, onCreateInvoice }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const filteredInvoices = invoices.filter(inv => {
        const i_name = (inv.customer_name || inv.name || '').toLowerCase();
        const i_number = (inv.invoice_number || inv.invoiceNumber || '').toLowerCase();

        const matchesSearch = i_name.includes(searchTerm.toLowerCase()) ||
            i_number.includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    const overpaidInvoices = invoices.filter(inv => inv.status === 'Overpaid');

    return (
        <div>
            {/* Alert for overpayments */}
            {overpaidInvoices.length > 0 && (
                <div className="alert alert-warning d-flex align-items-center mb-3">
                    <RefreshCw size={20} className="me-2" />
                    <div>
                        <strong>Overpayment Alert:</strong> {overpaidInvoices.length} customer{overpaidInvoices.length > 1 ? 's have' : ' has'} overpaid.
                        <span className="ms-2">Review and process refunds.</span>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="d-flex gap-3 mb-3 align-items-center">
                <div className="flex-grow-1 position-relative">
                    <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                    <input
                        type="text"
                        className="form-control ps-5"
                        placeholder="Search by name, admission no, or invoice number..."
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
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Overpaid">Overpaid</option>
                </select>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <Download size={18} />
                    Export
                </button>
                <button className="btn btn-primary d-flex align-items-center gap-2 ms-auto" onClick={onCreateInvoice}>
                    <Plus size={18} />
                    New Invoice
                </button>
            </div>

            {/* Table */}
            <div className="ap-table-card">
                <table className="ap-table table table-hover mb-0">
                    <thead>
                        <tr>
                            <th>Invoice Number</th>
                            <th>Customer Type</th>
                            <th>Name</th>
                            <th>Admission/Ref No</th>
                            <th className="text-end">Amount</th>
                            <th className="text-end">Paid</th>
                            <th className="text-end">Balance</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center text-muted py-4">
                                    No invoices found
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td className="fw-bold">{invoice.invoice_number || invoice.invoiceNumber}</td>
                                    <td>
                                        <span className={`badge bg-info`}>
                                            General
                                        </span>
                                    </td>
                                    <td>{invoice.customer_name || invoice.name}</td>
                                    <td className="text-muted">-</td>
                                    <td className="text-end">{formatKES(invoice.total_amount || invoice.amount)}</td>
                                    <td className="text-end">{formatKES(0)}</td>
                                    <td className={`text-end fw-bold text-success`}>
                                        {formatKES(invoice.total_amount || invoice.amount)}
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(invoice.status)}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => handleViewInvoice(invoice)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
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
                        <div className="text-muted small">Total Amount</div>
                        <div className="fw-bold">{formatKES(filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0))}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Total Paid</div>
                        <div className="fw-bold text-success">{formatKES(filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0))}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Outstanding</div>
                        <div className="fw-bold text-warning">
                            {formatKES(filteredInvoices.reduce((sum, inv) => sum + Math.max(inv.balance, 0), 0))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedInvoice && (
                <CustomerInvoiceModal
                    invoice={selectedInvoice}
                    onClose={() => setShowModal(false)}
                    onCreateRefund={onCreateRefund}
                />
            )}
        </div>
    );
};

export default CustomerInvoicesTab;
