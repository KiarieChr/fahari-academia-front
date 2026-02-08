import React from 'react';
import { incomeAccounts, paymentMethods } from '../../data/mockReceiptData';

const GeneralReceiptForm = ({ data, onChange }) => {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value, receiptType: 'General' });
    };

    return (
        <div className="row g-3">
            {/* Payer Name */}
            <div className="col-md-12">
                <label className="form-label">Payer Name <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={data.payerName || ''}
                    onChange={(e) => handleChange('payerName', e.target.value)}
                    placeholder="Individual or organization name"
                    required
                />
            </div>

            {/* Income Account */}
            <div className="col-md-6">
                <label className="form-label">Income Account <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.incomeAccount || ''}
                    onChange={(e) => handleChange('incomeAccount', e.target.value)}
                    required
                >
                    <option value="">Select Income Account...</option>
                    {incomeAccounts.map(acc => (
                        <option key={acc.id} value={acc.name}>
                            {acc.name} ({acc.code})
                        </option>
                    ))}
                </select>
            </div>

            {/* Amount */}
            <div className="col-md-6">
                <label className="form-label">Amount (KES) <span className="text-danger">*</span></label>
                <input
                    type="number"
                    className="form-control"
                    value={data.amount || ''}
                    onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                />
            </div>

            {/* Description */}
            <div className="col-md-12">
                <label className="form-label">Description <span className="text-danger">*</span></label>
                <input
                    type="text"
                    className="form-control"
                    value={data.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="What is this payment for?"
                    required
                />
            </div>

            {/* Payment Method */}
            <div className="col-md-6">
                <label className="form-label">Payment Method <span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    value={data.paymentMethod || ''}
                    onChange={(e) => handleChange('paymentMethod', e.target.value)}
                    required
                >
                    <option value="">Select Method...</option>
                    {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </div>

            {/* Reference Number */}
            <div className="col-md-6">
                <label className="form-label">
                    Reference {data.paymentMethod && data.paymentMethod !== 'Cash' && <span className="text-danger">*</span>}
                </label>
                <input
                    type="text"
                    className="form-control"
                    value={data.reference || ''}
                    onChange={(e) => handleChange('reference', e.target.value)}
                    placeholder="Reference number"
                    required={data.paymentMethod && data.paymentMethod !== 'Cash'}
                />
            </div>

            {/* Notes */}
            <div className="col-md-12">
                <label className="form-label">Notes</label>
                <textarea
                    className="form-control"
                    rows="2"
                    value={data.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                ></textarea>
            </div>
        </div>
    );
};

export default GeneralReceiptForm;
