import React, { useState, useEffect } from 'react';
import { Search, Eye, RefreshCw, Download, Plus, ArrowUpRight, AlertCircle, FileText, CheckCircle, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatKES, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { financeService } from '../../../../services/financeService';
import CustomerInvoiceModal from './CustomerInvoiceModal';

const CustomerInvoicesTab = ({ onCreateRefund, onCreateInvoice }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [posting, setPosting] = useState(null);

    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({ show: false, type: '', invoice: null });

    useEffect(() => {
        loadInvoices();
    }, [filterStatus]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const params = filterStatus ? { status: filterStatus } : {};
            const res = await financeService.getInvoices(params);
            setInvoices(res?.results || res || []);
        } catch (error) {
            console.error("Failed to load invoices", error);
            toast.error("Failed to load invoices");
        } finally {
            setLoading(false);
        }
    };

    const showPostConfirm = (invoice) => {
        setConfirmDialog({ show: true, type: 'post', invoice });
    };

    const showVoidConfirm = (invoice) => {
        setConfirmDialog({ show: true, type: 'void', invoice });
    };

    const showIssueConfirm = (invoice) => {
        setConfirmDialog({ show: true, type: 'issue', invoice });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({ show: false, type: '', invoice: null });
    };

    const handleConfirmAction = async () => {
        const { type, invoice } = confirmDialog;
        closeConfirmDialog();

        if (type === 'post') {
            await executePostToLedger(invoice);
        } else if (type === 'void') {
            await executeVoidInvoice(invoice);
        } else if (type === 'issue') {
            await executeIssueInvoice(invoice);
        }
    };

    const executePostToLedger = async (invoice) => {
        setPosting(invoice.id);
        try {
            await financeService.postInvoice(invoice.id);
            toast.success(`Invoice ${invoice.invoice_number} posted to ledger successfully`);
            loadInvoices();
        } catch (error) {
            console.error("Failed to post invoice", error);
            toast.error(error.data?.error || error.message || "Failed to post invoice");
        } finally {
            setPosting(null);
        }
    };

    const executeVoidInvoice = async (invoice) => {
        try {
            await financeService.voidInvoice(invoice.id);
            toast.success(`Invoice ${invoice.invoice_number} has been voided`);
            loadInvoices();
        } catch (error) {
            console.error("Failed to void invoice", error);
            toast.error(error.data?.error || error.message || "Failed to void invoice");
        }
    };

    const executeIssueInvoice = async (invoice) => {
        try {
            await financeService.issueInvoice(invoice.id);
            toast.success(`Invoice ${invoice.invoice_number} has been issued. You can now post it to the ledger.`);
            loadInvoices();
        } catch (error) {
            console.error("Failed to issue invoice", error);
            toast.error(error.data?.error || error.message || "Failed to issue invoice");
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const i_name = (inv.customer_name || inv.name || '').toLowerCase();
        const i_number = (inv.invoice_number || inv.invoiceNumber || '').toLowerCase();

        const matchesSearch = i_name.includes(searchTerm.toLowerCase()) ||
            i_number.includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    // Group invoices by posting status
    const unpostedInvoices = filteredInvoices.filter(inv => !inv.journal_entry && inv.status !== 'VOID');
    const overpaidInvoices = filteredInvoices.filter(inv => inv.status === 'Overpaid');

    const getStatusBadge = (invoice) => {
        if (invoice.status === 'VOID') {
            return <span className="badge bg-danger">Void</span>;
        }
        if (invoice.status === 'PROFORMA') {
            return <span className="badge bg-secondary">Proforma</span>;
        }
        if (!invoice.journal_entry) {
            return <span className="badge bg-warning text-dark">Unposted</span>;
        }
        return <span className={getStatusBadgeClass(invoice.status)}>{invoice.status}</span>;
    };

    return (
        <div>
            {/* Alert for unposted invoices */}
            {unpostedInvoices.length > 0 && (
                <div className="alert alert-info d-flex align-items-center mb-3">
                    <AlertCircle size={20} className="me-2" />
                    <div>
                        <strong>Unposted Invoices:</strong> {unpostedInvoices.length} invoice{unpostedInvoices.length > 1 ? 's have' : ' has'} not been posted to the ledger.
                        <span className="ms-2">Use the <ArrowUpRight size={14} className="d-inline" /> button to post.</span>
                    </div>
                </div>
            )}

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
            <div className="d-flex gap-3 mb-3 align-items-center flex-wrap">
                <div className="flex-grow-1 position-relative" style={{ minWidth: '250px' }}>
                    <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                    <input
                        type="text"
                        className="form-control ps-5"
                        placeholder="Search by name or invoice number..."
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
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft (Unposted)</option>
                    <option value="ISSUED">Issued (Posted)</option>
                    <option value="PROFORMA">Proforma</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PAID">Paid</option>
                    <option value="VOID">Void</option>
                </select>
                <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <Download size={18} />
                    Export
                </button>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onCreateInvoice}>
                    <Plus size={18} />
                    New Invoice
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="ap-table-card">
                    <table className="ap-table table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th className="text-end">Amount</th>
                                <th>Status</th>
                                <th>Posted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-4">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td className="fw-bold">{invoice.invoice_number}</td>
                                        <td>{invoice.customer_name}</td>
                                        <td className="text-muted small">{formatDate(invoice.date_issued)}</td>
                                        <td className="text-end fw-medium">{formatKES(invoice.total_amount)}</td>
                                        <td>{getStatusBadge(invoice)}</td>
                                        <td>
                                            {invoice.journal_entry ? (
                                                <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                                                    <CheckCircle size={12} /> Yes
                                                </span>
                                            ) : (
                                                <span className="badge bg-secondary-subtle text-secondary d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                                                    <FileText size={12} /> No
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleViewInvoice(invoice)}
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </button>

                                                {/* Post button - only for unposted, non-void, non-proforma */}
                                                {!invoice.journal_entry && invoice.status !== 'VOID' && invoice.status !== 'PROFORMA' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-success"
                                                        onClick={() => showPostConfirm(invoice)}
                                                        title="Post to Ledger"
                                                        disabled={posting === invoice.id}
                                                    >
                                                        {posting === invoice.id ? (
                                                            <span className="spinner-border spinner-border-sm"></span>
                                                        ) : (
                                                            <ArrowUpRight size={14} />
                                                        )}
                                                    </button>
                                                )}

                                                {/* Issue button - only for PROFORMA invoices */}
                                                {invoice.status === 'PROFORMA' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={() => showIssueConfirm(invoice)}
                                                        title="Issue Invoice (Convert from Proforma)"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                )}

                                                {/* Void button - only for non-paid */}
                                                {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => showVoidConfirm(invoice)}
                                                        title="Void Invoice"
                                                    >
                                                        ×
                                                    </button>
                                                )}

                                                {/* Refund button - only for overpaid */}
                                                {invoice.status === 'Overpaid' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-warning"
                                                        onClick={() => onCreateRefund?.(invoice)}
                                                        title="Create Refund"
                                                    >
                                                        <RefreshCw size={14} />
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
            )}

            {/* Summary Footer */}
            <div className="mt-3 p-3 bg-light rounded">
                <div className="row text-center">
                    <div className="col">
                        <div className="text-muted small">Total Invoices</div>
                        <div className="fw-bold">{filteredInvoices.length}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Total Amount</div>
                        <div className="fw-bold">{formatKES(filteredInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0))}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Unposted</div>
                        <div className="fw-bold text-warning">{unpostedInvoices.length}</div>
                    </div>
                    <div className="col">
                        <div className="text-muted small">Posted</div>
                        <div className="fw-bold text-success">{filteredInvoices.filter(i => i.journal_entry).length}</div>
                    </div>
                </div>
            </div>

            {/* Invoice Detail Modal */}
            {showModal && selectedInvoice && (
                <CustomerInvoiceModal
                    invoice={selectedInvoice}
                    onClose={() => setShowModal(false)}
                    onCreateRefund={onCreateRefund}
                />
            )}

            {/* Confirmation Dialog */}
            {confirmDialog.show && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {confirmDialog.type === 'post' ? 'Post to Ledger' : 
                                     confirmDialog.type === 'issue' ? 'Issue Invoice' : 'Void Invoice'}
                                </h5>
                                <button type="button" className="btn-close" onClick={closeConfirmDialog}></button>
                            </div>
                            <div className="modal-body">
                                {confirmDialog.type === 'post' ? (
                                    <p>
                                        Are you sure you want to post invoice <strong>{confirmDialog.invoice?.invoice_number}</strong> to the General Ledger?
                                        <br />
                                        <small className="text-muted">This will create journal entries for this invoice.</small>
                                    </p>
                                ) : confirmDialog.type === 'issue' ? (
                                    <p>
                                        Are you sure you want to issue invoice <strong>{confirmDialog.invoice?.invoice_number}</strong>?
                                        <br />
                                        <small className="text-muted">This will convert the proforma to an official invoice. You can then post it to the ledger.</small>
                                    </p>
                                ) : (
                                    <p>
                                        Are you sure you want to void invoice <strong>{confirmDialog.invoice?.invoice_number}</strong>?
                                        <br />
                                        <small className="text-danger">This action cannot be undone.</small>
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeConfirmDialog}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${confirmDialog.type === 'void' ? 'btn-danger' : confirmDialog.type === 'issue' ? 'btn-info' : 'btn-success'}`}
                                    onClick={handleConfirmAction}
                                >
                                    {confirmDialog.type === 'post' ? 'Post to Ledger' : 
                                     confirmDialog.type === 'issue' ? 'Issue Invoice' : 'Void Invoice'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerInvoicesTab;
