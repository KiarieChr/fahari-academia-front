import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import { toast } from 'react-toastify';

const CashbookSettings = ({ cashbooks: initialCashbooks, accounts }) => {
    const [cashbooks, setCashbooks] = useState([]);

    // Update local state when props change
    React.useEffect(() => {
        if (initialCashbooks) setCashbooks(initialCashbooks);
    }, [initialCashbooks]);

    const [showModal, setShowModal] = useState(false);
    const [editingCashbook, setEditingCashbook] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        currency: 'KES',
        account: '', // Should be string ID
        accountNumber: '',
        is_active: true,
        is_default: false,
        voucher_prefix: 'PV',
        opening_balance: 0,
        opening_balance_date: new Date().toISOString().split('T')[0]
    });

    const handleAdd = () => {
        setEditingCashbook(null);
        setFormData({
            name: '',
            currency: 'KES',
            account: '',
            type: 'Cash',
            accountNumber: '',
            isActive: true,
            isDefault: false
        });
        setShowModal(true);
    };

    const handleEdit = (cashbook) => {
        setEditingCashbook(cashbook);
        setFormData(cashbook);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.account) {
            toast.error("Please fill in all required fields (Name and Linked Account)");
            return;
        }

        try {
            if (editingCashbook) {
                // api.js returns the unwrapped data object directly (no .data wrapper)
                const updated = await financeService.updateCashbook(editingCashbook.id, formData);
                setCashbooks(cashbooks.map(cb => cb.id === editingCashbook.id ? updated : cb));
                toast.success("Cashbook updated successfully");
            } else {
                const created = await financeService.createCashbook(formData);
                setCashbooks([...cashbooks, created]);
                toast.success("Cashbook created successfully");
            }
            setShowModal(false);
        } catch (error) {
            console.error("Failed to save cashbook", error);
            toast.error("Error saving cashbook: " + (error?.data?.detail || error?.message || 'Unknown error'));
        }
    };

    const handleToggleActive = (id) => {
        const cb = cashbooks.find(c => c.id === id);
        if (cb) {
            financeService.updateCashbook(id, { is_active: !cb.is_active })
                .then(updated => {
                    setCashbooks(cashbooks.map(c => c.id === id ? { ...c, ...updated } : c));
                })
                .catch(err => toast.error('Failed to update status: ' + (err?.message || 'Unknown error')));
        }
    };

    const handleSetDefault = (id) => {
        financeService.updateCashbook(id, { is_default: true })
            .then(() => {
                setCashbooks(cashbooks.map(cb => ({ ...cb, is_default: cb.id === id })));
            })
            .catch(err => toast.error('Failed to set default: ' + (err?.message || 'Unknown error')));
    };

    const getAccountName = (id) => {
        if (!accounts) return id;
        const acc = accounts.find(a => a.id === id);
        return acc ? `${acc.code} - ${acc.name}` : id;
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h6 className="fw-bold mb-1">Cashbook Management</h6>
                        <small className="text-muted">Configure cash and bank accounts for transactions</small>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={handleAdd}>
                        <Plus size={16} className="me-1" /> Add Cashbook
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Prefix</th>
                                <th>Linked Account</th>
                                <th className="text-end">Current Balance</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Default</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cashbooks.map((cashbook) => (
                                <tr key={cashbook.id}>
                                    <td className="fw-medium">{cashbook.name}</td>
                                    <td>
                                        <span className={`badge ${cashbook.type === 'Cash' ? 'bg-success' :
                                            cashbook.type === 'Bank' ? 'bg-primary' : 'bg-info'
                                            }`}>
                                            {cashbook.type}
                                        </span>
                                    </td>
                                    <td><span className="badge bg-light text-dark border">{cashbook.voucher_prefix || 'PV'}</span></td>
                                    <td>{getAccountName(cashbook.account)}</td>
                                    <td className="text-end">KES {(cashbook.currentBalance || 0).toLocaleString()}</td>
                                    <td className="text-center">
                                        <button
                                            className={`btn btn-sm ${cashbook.is_active ? 'btn-success' : 'btn-secondary'}`}
                                            onClick={() => handleToggleActive(cashbook.id)}
                                        >
                                            {cashbook.is_active ? <Check size={14} /> : <X size={14} />}
                                        </button>
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="radio"
                                            name="defaultCashbook"
                                            checked={cashbook.is_default || false}
                                            onChange={() => handleSetDefault(cashbook.id)}
                                            className="form-check-input"
                                        />
                                    </td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-1"
                                            onClick={() => handleEdit(cashbook)}
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1300 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editingCashbook ? 'Edit' : 'Add'} Cashbook</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Cashbook Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type *</label>
                                    <select
                                        className="form-select"
                                        value={formData.type || 'Cash'}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                        <option value="Mobile Money">Mobile Money</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Linked Chart of Account *</label>
                                    <select
                                        className="form-select"
                                        value={formData.account || ''}
                                        onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                    >
                                        <option value="">Select GL Account...</option>
                                        {accounts && accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.code} - {acc.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-8">
                                        <label className="form-label">Opening Balance</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.opening_balance || ''}
                                            onChange={(e) => setFormData({ ...formData, opening_balance: parseFloat(e.target.value) })}
                                            disabled={editingCashbook !== null}
                                        />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label">As Of Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.opening_balance_date || ''}
                                            onChange={(e) => setFormData({ ...formData, opening_balance_date: e.target.value })}
                                            disabled={editingCashbook !== null}
                                        />
                                    </div>
                                    {editingCashbook && (
                                        <div className="col-12 text-muted small">
                                            Opening balance cannot be changed after creation.
                                        </div>
                                    )}
                                    {editingCashbook && (
                                        <div className="col-12 text-muted small">
                                            Opening balance cannot be changed after creation.
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Voucher Prefix</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.voucher_prefix || 'PV'}
                                        onChange={(e) => setFormData({ ...formData, voucher_prefix: e.target.value })}
                                        placeholder="e.g. PV, CPV"
                                    />
                                    <div className="form-text">Used for payment voucher numbering (e.g. PV-001)</div>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="isActive"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="isActive">Active</label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="isDefault"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    />
                                    <label className="form-check-label" htmlFor="isDefault">Default for Payments</label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashbookSettings;

