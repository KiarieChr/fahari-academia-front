import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { depositSources, cashbooks } from '../data/mockBankingData';

const AddCashDepositModal = ({ show, onHide, onSave, deposit }) => {
    const [formData, setFormData] = useState({
        source: 'Fees',
        amount: '',
        expectedBankingDate: '',
        actualBankingDate: '',
        linkedCashbook: 'CB-001',
        term: 'Term 1',
        month: 'January',
        year: '2026',
        status: 'Planned',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (deposit) {
            setFormData(deposit);
        } else {
            // Reset form for new deposit
            setFormData({
                source: 'Fees',
                amount: '',
                expectedBankingDate: '',
                actualBankingDate: '',
                linkedCashbook: 'CB-001',
                term: 'Term 1',
                month: 'January',
                year: '2026',
                status: 'Planned',
                notes: ''
            });
        }
        setErrors({});
    }, [deposit, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.expectedBankingDate) {
            newErrors.expectedBankingDate = 'Expected banking date is required';
        }

        if (formData.status === 'Banked' && !formData.actualBankingDate) {
            newErrors.actualBankingDate = 'Actual banking date is required when status is Banked';
        }

        if (formData.actualBankingDate && formData.expectedBankingDate) {
            const expected = new Date(formData.expectedBankingDate);
            const actual = new Date(formData.actualBankingDate);
            if (actual < expected) {
                newErrors.actualBankingDate = 'Actual date cannot be before expected date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            onSave({
                ...formData,
                amount: parseFloat(formData.amount)
            });
        }
    };

    if (!show) return null;

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {deposit ? 'Edit Cash Deposit' : 'Add Cash Deposit'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                {/* Source */}
                                <div className="col-md-6">
                                    <label className="form-label">Source <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        required
                                    >
                                        {depositSources.map(source => (
                                            <option key={source} value={source}>{source}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount */}
                                <div className="col-md-6">
                                    <label className="form-label">Amount (KES) <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        required
                                    />
                                    {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                                </div>

                                {/* Expected Banking Date */}
                                <div className="col-md-6">
                                    <label className="form-label">Expected Banking Date <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.expectedBankingDate ? 'is-invalid' : ''}`}
                                        name="expectedBankingDate"
                                        value={formData.expectedBankingDate}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.expectedBankingDate && <div className="invalid-feedback">{errors.expectedBankingDate}</div>}
                                </div>

                                {/* Actual Banking Date */}
                                <div className="col-md-6">
                                    <label className="form-label">Actual Banking Date</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.actualBankingDate ? 'is-invalid' : ''}`}
                                        name="actualBankingDate"
                                        value={formData.actualBankingDate}
                                        onChange={handleChange}
                                        disabled={formData.status === 'Planned'}
                                    />
                                    {errors.actualBankingDate && <div className="invalid-feedback">{errors.actualBankingDate}</div>}
                                    {formData.status === 'Planned' && (
                                        <small className="text-muted">Available when status is Banked</small>
                                    )}
                                </div>

                                {/* Linked Cashbook */}
                                <div className="col-md-6">
                                    <label className="form-label">Linked Cashbook</label>
                                    <select
                                        className="form-select"
                                        name="linkedCashbook"
                                        value={formData.linkedCashbook}
                                        onChange={handleChange}
                                    >
                                        {cashbooks.map(cb => (
                                            <option key={cb.id} value={cb.code}>{cb.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Term */}
                                <div className="col-md-6">
                                    <label className="form-label">Term</label>
                                    <select
                                        className="form-select"
                                        name="term"
                                        value={formData.term}
                                        onChange={handleChange}
                                    >
                                        <option value="Term 1">Term 1</option>
                                        <option value="Term 2">Term 2</option>
                                        <option value="Term 3">Term 3</option>
                                    </select>
                                </div>

                                {/* Month */}
                                <div className="col-md-6">
                                    <label className="form-label">Month</label>
                                    <select
                                        className="form-select"
                                        name="month"
                                        value={formData.month}
                                        onChange={handleChange}
                                    >
                                        {months.map(month => (
                                            <option key={month} value={month}>{month}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="col-md-6">
                                    <label className="form-label">Status <span className="text-danger">*</span></label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                id="statusPlanned"
                                                value="Planned"
                                                checked={formData.status === 'Planned'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="statusPlanned">
                                                Planned
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                id="statusBanked"
                                                value="Banked"
                                                checked={formData.status === 'Banked'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="statusBanked">
                                                Banked
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                id="statusDelayed"
                                                value="Delayed"
                                                checked={formData.status === 'Delayed'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="statusDelayed">
                                                Delayed
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="col-12">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Additional notes about this deposit..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {deposit ? 'Update Deposit' : 'Add Deposit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCashDepositModal;
