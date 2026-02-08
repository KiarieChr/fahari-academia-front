import React, { useState, useEffect } from 'react';
import { X, AlertCircle, TrendingUp } from 'lucide-react';
import { billingFrequencies, appliesTo } from '../data/mockFeeStructureData';
import { checkAccountMapping } from '../utils/feeStructureUtils';

const AddEditFeeItemModal = ({
    show, onClose, onSave,
    feeItem, classId, term, academicYear,
    incomeAccounts = [], feeCategories = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        accountId: '',
        amount: '',
        mandatory: true,
        frequency: 'Termly',
        appliesTo: 'All Students',
        description: '',
        status: 'Active'
    });

    const [validation, setValidation] = useState({ isValid: true, errors: [] });
    const [accountValidation, setAccountValidation] = useState(null);

    useEffect(() => {
        if (feeItem) {
            setFormData({
                name: feeItem.name || '',
                category: feeItem.category || '',
                accountId: feeItem.accountId || '',
                amount: feeItem.amount || '',
                mandatory: feeItem.mandatory !== undefined ? feeItem.mandatory : true,
                frequency: feeItem.frequency || 'Termly',
                appliesTo: feeItem.appliesTo || 'All Students',
                description: feeItem.description || '',
                status: feeItem.status || 'Active'
            });
        } else {
            // Reset form for new item
            setFormData({
                name: '',
                category: '',
                accountId: '',
                amount: '',
                mandatory: true,
                frequency: 'Termly',
                appliesTo: 'All Students',
                description: '',
                status: 'Active'
            });
        }
    }, [feeItem, show]);

    useEffect(() => {
        if (formData.accountId && formData.category) {
            const result = checkAccountMapping(formData.accountId, formData.category, incomeAccounts, feeCategories);
            setAccountValidation(result);
        } else {
            setAccountValidation(null);
        }
    }, [formData.accountId, formData.category]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setFormData(prev => ({ ...prev, category: categoryId }));

        // Auto-suggest account based on category
        const category = feeCategories.find(cat => cat.id === categoryId);
        if (category && category.suggestedAccount) {
            const suggestedAcc = incomeAccounts.find(acc => acc.code === category.suggestedAccount);
            if (suggestedAcc) {
                setFormData(prev => ({ ...prev, accountId: suggestedAcc.id }));
            }
        }
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.name.trim()) errors.push('Fee item name is required');
        if (!formData.category) errors.push('Fee category is required');
        if (!formData.accountId) errors.push('Chart of Accounts mapping is required');
        if (!formData.amount || formData.amount <= 0) errors.push('Amount must be greater than 0');

        setValidation({ isValid: errors.length === 0, errors });
        return errors.length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const feeItemData = {
            ...formData,
            amount: parseFloat(formData.amount),
            classId,
            term,
            academicYear
        };

        onSave(feeItemData);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header bg-light">
                        <h5 className="modal-title d-flex align-items-center">
                            {feeItem ? <TrendingUp className="me-2" size={20} /> : <TrendingUp className="me-2" size={20} />}
                            {feeItem ? 'Edit Fee Item' : 'Add Fee Item'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <form id="feeItemForm" onSubmit={handleSubmit}>
                            {!validation.isValid && (
                                <div className="alert alert-danger">
                                    <AlertCircle size={16} className="me-2" />
                                    {validation.errors.map((error, index) => (
                                        <div key={index}>{error}</div>
                                    ))}
                                </div>
                            )}

                            {/* Context Info */}
                            <div className="alert alert-primary mb-3 d-flex align-items-center">
                                <AlertCircle size={16} className="me-2" />
                                <div>
                                    <strong>Target:</strong> {classId} &bull; {term} &bull; {academicYear}
                                </div>
                            </div>

                            <div className="row g-3">
                                {/* Fee Item Name */}
                                <div className="col-md-12">
                                    <label className="form-label fw-bold">Fee Item Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Tuition Fee, Boarding Fee"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {/* Fee Category */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Fee Category *</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleCategoryChange}
                                        required
                                    >
                                        <option value="">Select Category...</option>
                                        {feeCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Chart of Accounts */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Linked Income Account *</label>
                                    <select
                                        className="form-select"
                                        name="accountId"
                                        value={formData.accountId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Account...</option>
                                        {incomeAccounts.filter(acc => acc.is_active && acc.is_student_related).map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.code} - {acc.name}
                                            </option>
                                        ))}
                                    </select>
                                    {accountValidation && accountValidation.warning && (
                                        <div className="form-text text-warning">
                                            <AlertCircle size={12} className="me-1" />
                                            {accountValidation.message}
                                        </div>
                                    )}
                                    {accountValidation && !accountValidation.isValid && (
                                        <div className="form-text text-danger">
                                            <AlertCircle size={12} className="me-1" />
                                            {accountValidation.message}
                                        </div>
                                    )}
                                </div>

                                {/* Amount */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Amount (KES) *</label>
                                    <div className="input-group">
                                        <span className="input-group-text">KES</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            min="0"
                                            step="1"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Billing Frequency */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Billing Frequency</label>
                                    <select
                                        className="form-select"
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleChange}
                                    >
                                        {billingFrequencies.map(freq => (
                                            <option key={freq} value={freq}>{freq}</option>
                                        ))}
                                    </select>
                                    <div className="form-text text-muted small">
                                        {formData.frequency === 'Annual' && 'Divided across 3 terms'}
                                        {formData.frequency === 'Once' && 'One-time charge'}
                                        {formData.frequency === 'Termly' && 'Recurs every term'}
                                    </div>
                                </div>

                                {/* Mandatory/Optional */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Configuration</label>
                                    <div className="form-check form-switch pt-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="mandatory"
                                            checked={formData.mandatory}
                                            onChange={handleChange}
                                            id="mandatoryInfo"
                                        />
                                        <label className="form-check-label" htmlFor="mandatoryInfo">
                                            {formData.mandatory ? 'Mandatory Fee' : 'Optional Fee'}
                                        </label>
                                    </div>
                                </div>

                                {/* Applies To */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Applies To</label>
                                    <select
                                        className="form-select"
                                        name="appliesTo"
                                        value={formData.appliesTo}
                                        onChange={handleChange}
                                    >
                                        {appliesTo.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div className="col-md-12">
                                    <label className="form-label fw-bold">Description / Notes</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Optional notes about this fee item"
                                    ></textarea>
                                </div>

                                {/* Status */}
                                {feeItem && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold">Status</label>
                                        <select
                                            className="form-select"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Disabled">Disabled</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer bg-light">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            <X size={18} className="me-1" /> Cancel
                        </button>
                        <button type="submit" form="feeItemForm" className="btn btn-primary d-flex align-items-center">
                            <TrendingUp size={18} className="me-2" />
                            {feeItem ? 'Update Fee Item' : 'Add Fee Item'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditFeeItemModal;
