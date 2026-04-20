import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { financeService } from '../../services/financeService';

const AccountModal = ({ show, onClose, onSave, account = null, accounts = [] }) => {
    if (!show) return null;

    const isEdit = !!account;
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'ASSET',
        sub_type: '',
        parent: '',
        description: '',
        is_active: true,
        is_student_related: false,
        available_in_payroll: false
    });

    const [types, setTypes] = useState([]);
    const [subTypes, setSubTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load options on mount
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [tRes, stRes] = await Promise.all([
                    financeService.getAccountTypes(),
                    financeService.getAccountSubTypes()
                ]);
                // API Service returns payload directly. Backend views return lists.
                setTypes(Array.isArray(tRes) ? tRes : (tRes.results || []));
                setSubTypes(Array.isArray(stRes) ? stRes : (stRes.results || []));
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        loadOptions();
    }, []);

    // Initialize form on open
    useEffect(() => {
        if (account) {
            setFormData({
                name: account.name,
                code: account.code,
                type: account.type,
                sub_type: account.sub_type,
                parent: account.parent || '',
                description: account.description || '',
                is_active: account.is_active,
                is_student_related: account.is_student_related || false,
                available_in_payroll: account.available_in_payroll || false
            });
        } else {
            // Default state for new account
            setFormData({
                name: '',
                code: '',
                type: 'ASSET',
                sub_type: '',
                parent: '',
                description: '',
                is_active: true,
                is_student_related: false,
                available_in_payroll: false
            });
        }
        setError(null);
    }, [account, show]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare payload
            const payload = {
                ...formData,
                parent: formData.parent || null // Send null if empty string
            };

            // If editing, might need ID. If creating, just payload.
            // onSave will handle the actual API call usually, or we do it here.
            // Let's pass payload to parent to keep logic centralized or do it here.
            // Doing it here is self-contained.

            if (isEdit) {
                await financeService.updateAccount(account.id, payload);
            } else {
                await financeService.createAccount(payload);
            }

            onSave(); // Refresh parent
            onClose();
        } catch (err) {
            console.error(err);
            const errData = err.data || err.response?.data || {};
            const msg = errData.detail
                || errData.message
                || errData.code?.[0]
                || errData.name?.[0]
                || (errData.non_field_errors && errData.non_field_errors[0])
                || Object.values(errData).flat().find(v => typeof v === 'string')
                || err.message
                || "Failed to save account.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Filter sub-types based on selected type? 
    // The backend enums are global, but logical filtering helps UX.
    // For now, show all or rely on backend validation? 
    // Let's show all for simplicity unless we have a mapping. 
    // Ideally we map Type -> Allowed SubTypes. We don't have that map on frontend yet.

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0 p-4 pb-0">
                        <h5 className="fw-bold">{isEdit ? 'Edit Account' : 'Create New Ledger Account'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <form id="accountForm" onSubmit={handleSubmit} className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Account Name <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. M-Pesa Fees Collection"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Account Code <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 1130"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Account Type <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    {types.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Sub-Type <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    name="sub_type"
                                    value={formData.sub_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Sub-Type...</option>
                                    {subTypes.map(st => (
                                        <option key={st.value} value={st.value}>{st.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Parent Account</label>
                                <select
                                    className="form-select"
                                    name="parent"
                                    value={formData.parent}
                                    onChange={handleChange}
                                >
                                    <option value="">None (Top Level)</option>
                                    {accounts
                                        .filter(a => a.id !== account?.id) // Prevent self-parenting
                                        .map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))}
                                </select>
                                <div className="form-text small">Postings are only allowed to accounts with NO children.</div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Status</label>
                                <div className="form-check form-switch pt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="isActiveSwitch"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="isActiveSwitch">
                                        Active
                                    </label>
                                </div>
                            </div>
                            {/* Conditional Field for Student Related */}
                            {['INCOME', 'ASSET'].includes(formData.type) && (
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Configuration</label>
                                    <div className="form-check pt-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="isStudentRelated"
                                            name="is_student_related"
                                            checked={formData.is_student_related}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="isStudentRelated">
                                            Student Related Account
                                        </label>
                                    </div>
                                </div>
                            )}
                            {/* Payroll availability for Expense & Liability accounts */}
                            {['EXPENSE', 'LIABILITY'].includes(formData.type) && (
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Payroll</label>
                                    <div className="form-check pt-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="availableInPayroll"
                                            name="available_in_payroll"
                                            checked={formData.available_in_payroll}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="availableInPayroll">
                                            Available in Payroll
                                        </label>
                                    </div>
                                </div>
                            )}
                            <div className="col-md-12">
                                <label className="form-label small fw-bold">Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="2"
                                    placeholder="Notes for auditors or accountants..."
                                ></textarea>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer border-0 p-4 pt-0">
                        <button type="button" className="btn btn-outline-secondary btn-sm px-4" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" form="accountForm" className="btn btn-primary btn-sm px-4 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                            <Save size={16} /> {loading ? 'Saving...' : (isEdit ? 'Update Account' : 'Create Account')}
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default AccountModal;
