import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, Save } from 'lucide-react';
import { formatKES } from '../utils/formatters';

const GeneralVoucherForm = ({ voucherData, chartOfAccounts, onSubmit, onBack }) => {
    const [formData, setFormData] = useState({
        payee: '',
        paymentMethod: 'Bank Transfer',
        referenceNumber: '',
        description: '',
        lineItems: [{ account: '', accountName: '', amount: '', notes: '' }]
    });

    const paymentMethods = ['Cash', 'Bank Transfer', 'M-Pesa', 'Cheque'];

    const handleAddLineItem = () => {
        setFormData({
            ...formData,
            lineItems: [...formData.lineItems, { account: '', accountName: '', amount: '', notes: '' }]
        });
    };

    const handleRemoveLineItem = (index) => {
        const newLineItems = formData.lineItems.filter((_, i) => i !== index);
        setFormData({ ...formData, lineItems: newLineItems });
    };

    const handleLineItemChange = (index, field, value) => {
        const newLineItems = [...formData.lineItems];
        newLineItems[index][field] = value;

        // Auto-fill account name when account is selected
        if (field === 'account') {
            const account = chartOfAccounts.find(acc => acc.code === value);
            if (account) {
                newLineItems[index].accountName = account.name;
            }
        }

        setFormData({ ...formData, lineItems: newLineItems });
    };

    const calculateTotal = () => {
        return formData.lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const totalAmount = calculateTotal();
        onSubmit({ ...formData, totalAmount });
    };

    const isValid = formData.payee && formData.description &&
        formData.lineItems.length > 0 &&
        formData.lineItems.every(item => item.account && item.amount > 0);

    return (
        <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
                {/* Voucher Header */}
                <div className="col-md-6">
                    <label className="form-label fw-bold">Voucher Number</label>
                    <input type="text" className="form-control" value={voucherData.voucherNumber} disabled />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold">Voucher Date</label>
                    <input type="date" className="form-control" value={voucherData.voucherDate} disabled />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-bold">Payee <span className="text-danger">*</span></label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter payee name"
                        value={formData.payee}
                        onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                        required
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-bold">Payment Method <span className="text-danger">*</span></label>
                    <select
                        className="form-select"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        required
                    >
                        {paymentMethods.map(method => (
                            <option key={method} value={method}>{method}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-bold">Reference Number</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., CHQ-001234"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-bold">Term</label>
                    <select className="form-select" value={voucherData.term} disabled>
                        <option>Term 1</option>
                        <option>Term 2</option>
                        <option>Term 3</option>
                    </select>
                </div>

                <div className="col-12">
                    <label className="form-label fw-bold">Description <span className="text-danger">*</span></label>
                    <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Brief description of the payment"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    ></textarea>
                </div>
            </div>

            {/* Line Items */}
            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">Line Items</h6>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={handleAddLineItem}
                    >
                        <Plus size={16} />
                        Add Line
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '25%' }}>Account <span className="text-danger">*</span></th>
                                <th style={{ width: '25%' }}>Account Name</th>
                                <th style={{ width: '20%' }}>Amount (KES) <span className="text-danger">*</span></th>
                                <th style={{ width: '25%' }}>Notes</th>
                                <th style={{ width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.lineItems.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={item.account}
                                            onChange={(e) => handleLineItemChange(index, 'account', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Account</option>
                                            {chartOfAccounts.filter(acc => acc.type === 'Expense').map(acc => (
                                                <option key={acc.code} value={acc.code}>
                                                    {acc.code} - {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={item.accountName}
                                            disabled
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            placeholder="0.00"
                                            value={item.amount}
                                            onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Optional notes"
                                            value={item.notes}
                                            onChange={(e) => handleLineItemChange(index, 'notes', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        {formData.lineItems.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveLineItem(index)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="table-light">
                            <tr>
                                <td colSpan="2" className="text-end fw-bold">Total Amount:</td>
                                <td className="fw-bold text-primary">{formatKES(calculateTotal())}</td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

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

export default GeneralVoucherForm;
