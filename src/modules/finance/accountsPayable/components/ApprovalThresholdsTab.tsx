import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Settings, Loader2, Edit2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { financeService } from '../../../../services/financeService';
import { formatKES } from '../utils/formatters';

const VOUCHER_TYPE_OPTIONS = [
    { value: 'AP', label: 'AP Payment' },
    { value: 'GENERAL', label: 'General Payment' },
    { value: 'IMPREST', label: 'Imprest' },
    { value: 'REFUND', label: 'Refund' },
];

const ROLE_OPTIONS = [
    'ACCOUNTANT',
    'FINANCE_OFFICER',
    'FINANCE_MANAGER',
    'BURSAR',
    'PRINCIPAL',
    'DIRECTOR',
];

const emptyThreshold = {
    name: '',
    min_amount: '',
    max_amount: '',
    required_roles: [],
    voucher_types: [],
    is_active: true,
};

const ApprovalThresholdsTab = () => {
    const [thresholds, setThresholds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...emptyThreshold });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadThresholds();
    }, []);

    const loadThresholds = async () => {
        setLoading(true);
        try {
            const res = await financeService.getApprovalThresholds();
            setThresholds(res?.results || res || []);
        } catch (err) {
            toast.error('Failed to load approval thresholds');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (threshold) => {
        setForm({
            name: threshold.name,
            min_amount: threshold.min_amount,
            max_amount: threshold.max_amount,
            required_roles: threshold.required_roles || [],
            voucher_types: threshold.voucher_types || [],
            is_active: threshold.is_active,
        });
        setEditingId(threshold.id);
        setShowForm(true);
    };

    const handleNew = () => {
        setForm({ ...emptyThreshold });
        setEditingId(null);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...emptyThreshold });
    };

    const toggleRole = (role) => {
        setForm(prev => ({
            ...prev,
            required_roles: prev.required_roles.includes(role)
                ? prev.required_roles.filter(r => r !== role)
                : [...prev.required_roles, role]
        }));
    };

    const toggleVoucherType = (type) => {
        setForm(prev => ({
            ...prev,
            voucher_types: prev.voucher_types.includes(type)
                ? prev.voucher_types.filter(t => t !== type)
                : [...prev.voucher_types, type]
        }));
    };

    const handleSave = async () => {
        if (!form.name || !form.min_amount || !form.max_amount) {
            toast.warning('Please fill in name and amount range');
            return;
        }
        if (form.required_roles.length === 0) {
            toast.warning('Please select at least one approval role');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                min_amount: parseFloat(form.min_amount),
                max_amount: parseFloat(form.max_amount),
            };
            if (editingId) {
                await financeService.updateApprovalThreshold(editingId, payload);
                toast.success('Threshold updated');
            } else {
                await financeService.createApprovalThreshold(payload);
                toast.success('Threshold created');
            }
            handleCancel();
            loadThresholds();
        } catch (err) {
            toast.error('Failed to save threshold');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this approval threshold?')) return;
        try {
            await financeService.deleteApprovalThreshold(id);
            toast.success('Threshold deleted');
            loadThresholds();
        } catch (err) {
            toast.error('Failed to delete threshold');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Loader2 className="spin" size={24} />
                <span className="ms-2 text-muted">Loading thresholds...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="fw-bold mb-1">
                        <Settings size={20} className="me-2" />
                        Approval Thresholds
                    </h5>
                    <p className="text-muted small mb-0">
                        Configure amount-based approval chains for payment vouchers
                    </p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleNew}>
                        <Plus size={16} /> Add Threshold
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">{editingId ? 'Edit Threshold' : 'New Threshold'}</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Name</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Level 1 - Basic"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Min Amount (KES)</label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={form.min_amount}
                                    onChange={e => setForm({ ...form, min_amount: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold">Max Amount (KES)</label>
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={form.max_amount}
                                    onChange={e => setForm({ ...form, max_amount: e.target.value })}
                                    placeholder="100000"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Required Approval Roles (in order)</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {ROLE_OPTIONS.map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            className={`btn btn-sm ${form.required_roles.includes(role) ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => toggleRole(role)}
                                        >
                                            {role.replace(/_/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                                {form.required_roles.length > 0 && (
                                    <div className="mt-2 small text-muted">
                                        Chain: {form.required_roles.join(' → ')}
                                    </div>
                                )}
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Applies to Voucher Types</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {VOUCHER_TYPE_OPTIONS.map(vt => (
                                        <button
                                            key={vt.value}
                                            type="button"
                                            className={`btn btn-sm ${form.voucher_types.includes(vt.value) ? 'btn-info' : 'btn-outline-secondary'}`}
                                            onClick={() => toggleVoucherType(vt.value)}
                                        >
                                            {vt.label}
                                        </button>
                                    ))}
                                </div>
                                {form.voucher_types.length === 0 && (
                                    <div className="mt-1 small text-muted">All types if none selected</div>
                                )}
                            </div>
                            <div className="col-md-4">
                                <div className="form-check mt-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={form.is_active}
                                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                        id="threshold-active"
                                    />
                                    <label className="form-check-label small" htmlFor="threshold-active">Active</label>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-primary btn-sm d-flex align-items-center gap-1" onClick={handleSave} disabled={saving}>
                                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button className="btn btn-secondary btn-sm d-flex align-items-center gap-1" onClick={handleCancel}>
                                <X size={14} /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {thresholds.length === 0 && !showForm ? (
                <div className="text-center py-5 text-muted">
                    <Settings size={48} className="mb-3 opacity-25" />
                    <p>No approval thresholds configured.</p>
                    <p className="small">Add thresholds to enforce multi-level approval for payment vouchers.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th className="text-end">Min Amount</th>
                                <th className="text-end">Max Amount</th>
                                <th>Approval Chain</th>
                                <th>Voucher Types</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {thresholds.map(t => (
                                <tr key={t.id}>
                                    <td className="fw-bold">{t.name}</td>
                                    <td className="text-end">{formatKES(t.min_amount)}</td>
                                    <td className="text-end">{formatKES(t.max_amount)}</td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-1">
                                            {(t.required_roles || []).map((role, i) => (
                                                <span key={i} className="badge bg-primary-subtle text-primary">
                                                    {i > 0 && '→ '}{role.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        {(t.voucher_types || []).length === 0
                                            ? <span className="text-muted small">All</span>
                                            : (t.voucher_types || []).map((vt, i) => (
                                                <span key={i} className="badge bg-info-subtle text-info me-1">{vt}</span>
                                            ))
                                        }
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge ${t.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                                            {t.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="btn-group btn-group-sm">
                                            <button className="btn btn-outline-primary" onClick={() => handleEdit(t)}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="btn btn-outline-danger" onClick={() => handleDelete(t.id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApprovalThresholdsTab;
