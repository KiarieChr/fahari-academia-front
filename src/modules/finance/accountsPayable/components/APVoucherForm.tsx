import React, { useState } from 'react';
import { ChevronLeft, Save, AlertCircle } from 'lucide-react';
import { formatKES } from '../utils/formatters';

const APVoucherForm = ({ voucherData, chartOfAccounts, procurementInvoices, onSubmit, onBack }) => {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [formData, setFormData] = useState({
        paymentMethod: 'Bank Transfer',
        referenceNumber: '',
        partialPayment: false,
        paymentAmount: 0
    });

    const availableInvoices = procurementInvoices.filter(
        inv => !inv.linkedToVoucher && inv.approvalStatus === 'Approved'
    );

    const handleInvoiceSelect = (invoiceId) => {
        const invoice = availableInvoices.find(inv => inv.id === invoiceId);
        setSelectedInvoice(invoice);
        setFormData({
            ...formData,
            paymentAmount: invoice ? invoice.totalAmount : 0
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedInvoice) return;

        const account = chartOfAccounts.find(acc => acc.code === '5000' || acc.type === 'Expense');

        const voucherPayload = {
            payee: selectedInvoice.supplierName,
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber,
            description: `Payment for ${selectedInvoice.description}`,
            linkedInvoice: selectedInvoice.id,
            totalAmount: formData.paymentAmount,
            lineItems: [{
                account: account?.code || '5000',
                accountName: account?.name || 'Expense',
                amount: formData.paymentAmount,
                notes: `Invoice: ${selectedInvoice.invoiceNumber}`,
                linkedInvoice: selectedInvoice.id
            }]
        };

        onSubmit(voucherPayload);
    };

    const isValid = selectedInvoice && formData.paymentAmount > 0 && formData.paymentAmount <= selectedInvoice?.totalAmount;

    return (
        <form onSubmit={handleSubmit}>
            {/* Invoice Selection */}
            <div className="alert alert-info mb-4">
                <AlertCircle size={18} className="me-2" />
                <strong>Select an approved procurement invoice</strong> to create a payment voucher.
            </div>

            <div className="mb-4">
                <label className="form-label fw-bold">Select Invoice <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                    required
                >
                    <option value="">-- Select Procurement Invoice --</option>
                    {availableInvoices.map(invoice => (
                        <option key={invoice.id} value={invoice.id}>
                            {invoice.procurementRef} - {invoice.supplierName} - {invoice.invoiceNumber} ({formatKES(invoice.totalAmount)})
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
                                    <small className="text-muted">Supplier:</small>
                                    <div className="fw-bold">{selectedInvoice.supplierName}</div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted">Invoice Number:</small>
                                    <div className="fw-bold">{selectedInvoice.invoiceNumber}</div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted">Description:</small>
                                    <div>{selectedInvoice.description}</div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <small className="text-muted">Procurement Ref:</small>
                                    <div className="text-primary fw-bold">{selectedInvoice.procurementRef}</div>
                                </div>
                                <div className="col-md-4 mb-2">
                                    <small className="text-muted">Amount:</small>
                                    <div className="fw-bold">{formatKES(selectedInvoice.amount)}</div>
                                </div>
                                <div className="col-md-4 mb-2">
                                    <small className="text-muted">VAT:</small>
                                    <div className="fw-bold">{formatKES(selectedInvoice.vat)}</div>
                                </div>
                                <div className="col-md-4 mb-2">
                                    <small className="text-muted">Total Amount:</small>
                                    <div className="fw-bold text-primary">{formatKES(selectedInvoice.totalAmount)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Payment Method <span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                required
                            >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="M-Pesa">M-Pesa</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-bold">Reference Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g., TXN-123456"
                                value={formData.referenceNumber}
                                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                            />
                        </div>

                        <div className="col-12">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="partialPayment"
                                    checked={formData.partialPayment}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        partialPayment: e.target.checked,
                                        paymentAmount: e.target.checked ? 0 : selectedInvoice.totalAmount
                                    })}
                                />
                                <label className="form-check-label" htmlFor="partialPayment">
                                    This is a partial payment
                                </label>
                            </div>
                        </div>

                        {formData.partialPayment && (
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Payment Amount (KES) <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0.00"
                                    value={formData.paymentAmount}
                                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) || 0 })}
                                    max={selectedInvoice.totalAmount}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <small className="text-muted">
                                    Maximum: {formatKES(selectedInvoice.totalAmount)}
                                </small>
                            </div>
                        )}

                        {!formData.partialPayment && (
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Payment Amount (KES)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formatKES(selectedInvoice.totalAmount)}
                                    disabled
                                />
                                <small className="text-muted">Full payment</small>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="card border-primary mb-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Payment Summary</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Invoice Total:</span>
                                <span className="fw-bold">{formatKES(selectedInvoice.totalAmount)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Payment Amount:</span>
                                <span className="fw-bold text-primary">{formatKES(formData.paymentAmount)}</span>
                            </div>
                            {formData.partialPayment && (
                                <div className="d-flex justify-content-between pt-2 border-top">
                                    <span>Outstanding Balance:</span>
                                    <span className="fw-bold text-warning">
                                        {formatKES(selectedInvoice.totalAmount - formData.paymentAmount)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Actions */}
            <div className="d-flex justify-content-between pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={onBack}>
                    <ChevronLeft size={18} />
                    Back
                </button>
                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={!isValid}>
                    <Save size={18} />
                    Create Voucher
                </button>
            </div>
        </form>
    );
};

export default APVoucherForm;
