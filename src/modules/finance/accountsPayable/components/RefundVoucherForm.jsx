import React, { useState } from 'react';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { formatKES } from '../utils/formatters';

const RefundVoucherForm = ({ voucherData, chartOfAccounts, customerInvoices, onSubmit, onBack }) => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [formData, setFormData] = useState({
        paymentMethod: 'M-Pesa',
        referenceNumber: '',
        refundReason: '',
        refundAmount: 0
    });

    const overpaidInvoices = customerInvoices.filter(inv => inv.status === 'Overpaid');

    const handleInvoiceSelect = (invoiceId) => {
        const invoice = overpaidInvoices.find(inv => inv.id === invoiceId);
        setSelectedInvoice(invoice);
        setFormData({
            ...formData,
            refundAmount: invoice ? Math.abs(invoice.balance) : 0
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedInvoice) return;

        const account = chartOfAccounts.find(acc => acc.code === '2100');

        const voucherPayload = {
            payee: selectedInvoice.name,
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber,
            description: `Refund for overpayment - ${selectedInvoice.invoiceNumber}`,
            linkedInvoice: selectedInvoice.id,
            refundReason: formData.refundReason,
            totalAmount: formData.refundAmount,
            lineItems: [{
                account: account?.code || '2100',
                accountName: account?.name || 'Student Deposits',
                amount: formData.refundAmount,
                notes: `Refund: ${selectedInvoice.invoiceNumber}`,
                linkedInvoice: selectedInvoice.id
            }]
        };

        onSubmit(voucherPayload);
    };

    const isValid = selectedInvoice && formData.refundAmount > 0 &&
        formData.refundAmount <= Math.abs(selectedInvoice?.balance) &&
        formData.refundReason.trim() !== '';

    return (
        <form onSubmit={handleSubmit}>
            {/* Alert */}
            <div className="alert alert-warning mb-4">
                <AlertCircle size={18} className="me-2" />
                <strong>Refund Voucher:</strong> Select a customer invoice with overpayment to process a refund.
            </div>

            {overpaidInvoices.length === 0 && (
                <div className="alert alert-info">
                    No overpaid invoices found. All customer invoices are balanced.
                </div>
            )}

            {overpaidInvoices.length > 0 && (
                <>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Select Invoice <span className="text-danger">*</span></label>
                        <select
                            className="form-select"
                            onChange={(e) => handleInvoiceSelect(e.target.value)}
                            required
                        >
                            <option value="">-- Select Overpaid Invoice --</option>
                            {overpaidInvoices.map(invoice => (
                                <option key={invoice.id} value={invoice.id}>
                                    {invoice.invoiceNumber} - {invoice.name} ({invoice.customerType}) - Overpaid: {formatKES(Math.abs(invoice.balance))}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Invoice Details */}
                    {selectedInvoice && (
                        <>
                            <div className="card bg-light border-0 mb-4">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">Invoice Details</h6>
                                    <div className="row">
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted">Customer Name:</small>
                                            <div className="fw-bold">{selectedInvoice.name}</div>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted">Customer Type:</small>
                                            <div>
                                                <span className={`badge ${selectedInvoice.customerType === 'Student' ? 'bg-primary' : 'bg-info'}`}>
                                                    {selectedInvoice.customerType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted">Invoice Number:</small>
                                            <div className="fw-bold">{selectedInvoice.invoiceNumber}</div>
                                        </div>
                                        <div className="col-md-6 mb-2">
                                            <small className="text-muted">Admission/Ref No:</small>
                                            <div>{selectedInvoice.admissionNo}</div>
                                        </div>
                                        <div className="col-md-4 mb-2">
                                            <small className="text-muted">Invoice Amount:</small>
                                            <div className="fw-bold">{formatKES(selectedInvoice.amount)}</div>
                                        </div>
                                        <div className="col-md-4 mb-2">
                                            <small className="text-muted">Amount Paid:</small>
                                            <div className="fw-bold text-success">{formatKES(selectedInvoice.paidAmount)}</div>
                                        </div>
                                        <div className="col-md-4 mb-2">
                                            <small className="text-muted">Overpayment:</small>
                                            <div className="fw-bold text-danger">{formatKES(Math.abs(selectedInvoice.balance))}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Refund Details */}
                            <div className="row g-3 mb-4">
                                <div className="col-12">
                                    <label className="form-label fw-bold">Reason for Refund <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Explain the reason for this refund..."
                                        value={formData.refundReason}
                                        onChange={(e) => setFormData({ ...formData, refundReason: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Refund Amount (KES) <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="0.00"
                                        value={formData.refundAmount}
                                        onChange={(e) => setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })}
                                        max={Math.abs(selectedInvoice.balance)}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    <small className="text-muted">
                                        Maximum refundable: {formatKES(Math.abs(selectedInvoice.balance))}
                                    </small>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Payment Method <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        required
                                    >
                                        <option value="M-Pesa">M-Pesa</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Reference Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., REF-STD-045"
                                        value={formData.referenceNumber}
                                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Validation Alert */}
                            {formData.refundAmount > Math.abs(selectedInvoice.balance) && (
                                <div className="alert alert-danger">
                                    <AlertCircle size={18} className="me-2" />
                                    Refund amount cannot exceed the overpayment amount of {formatKES(Math.abs(selectedInvoice.balance))}.
                                </div>
                            )}

                            {/* Summary */}
                            <div className="card border-danger mb-4">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">Refund Summary</h6>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Customer:</span>
                                        <span className="fw-bold">{selectedInvoice.name}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Overpayment Amount:</span>
                                        <span className="fw-bold text-danger">{formatKES(Math.abs(selectedInvoice.balance))}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Refund Amount:</span>
                                        <span className="fw-bold text-primary">{formatKES(formData.refundAmount)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between pt-2 border-top">
                                        <span>Payment Method:</span>
                                        <span className="fw-bold">{formData.paymentMethod}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Actions */}
            <div className="d-flex justify-content-between pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={onBack}>
                    <ChevronLeft size={18} />
                    Back
                </button>
                <button type="submit" className="btn btn-danger d-flex align-items-center gap-2" disabled={!isValid}>
                    <Save size={18} />
                    Create Refund Voucher
                </button>
            </div>
        </form>
    );
};

export default RefundVoucherForm;
