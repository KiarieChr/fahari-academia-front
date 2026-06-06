import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { kenyanBanks, bankAccounts } from '../data/mockBankingData';

const AddChequeDepositModal = ({ show, onHide, onSave, deposit }) => {
    const [formData, setFormData] = useState({
        chequeNumber: '',
        bankName: 'KCB Bank',
        drawerName: '',
        amount: '',
        receivedDate: '',
        expectedClearingDate: '',
        actualClearingDate: '',
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Received',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (deposit) {
            setFormData(deposit);
        } else {
            setFormData({
                chequeNumber: '',
                bankName: 'KCB Bank',
                drawerName: '',
                amount: '',
                receivedDate: '',
                expectedClearingDate: '',
                actualClearingDate: '',
                linkedBankAccount: 'ACC-001',
                term: 'Term 1',
                year: '2026',
                status: 'Received',
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
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.chequeNumber.trim()) {
            newErrors.chequeNumber = 'Cheque number is required';
        }

        if (!formData.drawerName.trim()) {
            newErrors.drawerName = 'Drawer name is required';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.receivedDate) {
            newErrors.receivedDate = 'Received date is required';
        }

        if (!formData.expectedClearingDate) {
            newErrors.expectedClearingDate = 'Expected clearing date is required';
        }

        if (formData.receivedDate && formData.expectedClearingDate) {
            const received = new Date(formData.receivedDate);
            const expected = new Date(formData.expectedClearingDate);
            if (expected < received) {
                newErrors.expectedClearingDate = 'Expected clearing date cannot be before received date';
            }
        }

        if (formData.status === 'Cleared' && !formData.actualClearingDate) {
            newErrors.actualClearingDate = 'Actual clearing date is required when status is Cleared';
        }

        if (formData.actualClearingDate && formData.receivedDate) {
            const received = new Date(formData.receivedDate);
            const actual = new Date(formData.actualClearingDate);
            if (actual < received) {
                newErrors.actualClearingDate = 'Actual clearing date cannot be before received date';
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

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {deposit ? 'Edit Cheque Deposit' : 'Add Cheque Deposit'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                {/* Cheque Number */}
                                <div className="col-md-6">
                                    <label className="form-label">Cheque Number <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.chequeNumber ? 'is-invalid' : ''}`}
                                        name="chequeNumber"
                                        value={formData.chequeNumber}
                                        onChange={handleChange}
                                        placeholder="e.g., 001234"
                                        required
                                    />
                                    {errors.chequeNumber && <div className="invalid-feedback">{errors.chequeNumber}</div>}
                                </div>

                                {/* Bank Name */}
                                <div className="col-md-6">
                                    <label className="form-label">Bank Name <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        required
                                    >
                                        {kenyanBanks.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Drawer Name */}
                                <div className="col-md-6">
                                    <label className="form-label">Drawer Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.drawerName ? 'is-invalid' : ''}`}
                                        name="drawerName"
                                        value={formData.drawerName}
                                        onChange={handleChange}
                                        placeholder="e.g., John Doe or ABC Company"
                                        required
                                    />
                                    {errors.drawerName && <div className="invalid-feedback">{errors.drawerName}</div>}
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

                                {/* Received Date */}
                                <div className="col-md-6">
                                    <label className="form-label">Received Date <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.receivedDate ? 'is-invalid' : ''}`}
                                        name="receivedDate"
                                        value={formData.receivedDate}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.receivedDate && <div className="invalid-feedback">{errors.receivedDate}</div>}
                                </div>

                                {/* Expected Clearing Date */}
                                <div className="col-md-6">
                                    <label className="form-label">Expected Clearing Date <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.expectedClearingDate ? 'is-invalid' : ''}`}
                                        name="expectedClearingDate"
                                        value={formData.expectedClearingDate}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors.expectedClearingDate && <div className="invalid-feedback">{errors.expectedClearingDate}</div>}
                                    <small className="text-muted">Typically 3 business days after deposit</small>
                                </div>

                                {/* Actual Clearing Date */}
                                <div className="col-md-6">
                                    <label className="form-label">Actual Clearing Date</label>
                                    <input
                                        type="date"
                                        className={`form-control ${errors.actualClearingDate ? 'is-invalid' : ''}`}
                                        name="actualClearingDate"
                                        value={formData.actualClearingDate}
                                        onChange={handleChange}
                                        disabled={formData.status === 'Received'}
                                    />
                                    {errors.actualClearingDate && <div className="invalid-feedback">{errors.actualClearingDate}</div>}
                                    {formData.status === 'Received' && (
                                        <small className="text-muted">Available when status is Deposited or Cleared</small>
                                    )}
                                </div>

                                {/* Linked Bank Account */}
                                <div className="col-md-6">
                                    <label className="form-label">Linked Bank Account</label>
                                    <select
                                        className="form-select"
                                        name="linkedBankAccount"
                                        value={formData.linkedBankAccount}
                                        onChange={handleChange}
                                    >
                                        {bankAccounts.map(acc => (
                                            <option key={acc.id} value={acc.code}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status */}
                                <div className="col-12">
                                    <label className="form-label">Status <span className="text-danger">*</span></label>
                                    <div className="d-flex gap-3 flex-wrap">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                id="statusReceived"
                                                value="Received"
                                                checked={formData.status === 'Received'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="statusReceived">
                                                <span className="badge bg-info">Received</span>
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                id="statusDeposited"
                                                value="Deposited"
                                                checked={formData.status === 'Deposited'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="statusDeposited">
                                                <span className="badge bg-warning">Deposited</span>
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                id="statusCleared"
                                                value="Cleared"
                                                checked={formData.status === 'Cleared'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="statusCleared">
                                                <span className="badge bg-success">Cleared</span>
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="status"
                                                id="statusBounced"
                                                value="Bounced"
                                                checked={formData.status === 'Bounced'}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="statusBounced">
                                                <span className="badge bg-danger">Bounced</span>
                                            </label>
                                        </div>
                                    </div>
                                    {formData.status === 'Bounced' && (
                                        <div className="alert alert-warning d-flex align-items-center gap-2 mt-2 mb-0">
                                            <AlertTriangle size={16} />
                                            <small>Bounced cheque - follow up with drawer for alternative payment</small>
                                        </div>
                                    )}
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
                                        placeholder="Additional notes about this cheque..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {deposit ? 'Update Cheque' : 'Add Cheque'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddChequeDepositModal;
