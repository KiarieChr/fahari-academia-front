import React, { useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { financeService } from '../../../../services/financeService';

const PaymentMethodSettings = ({ methods: initialMethods, accounts }) => {
    const [methods, setMethods] = useState([]);

    React.useEffect(() => {
        if (initialMethods) setMethods(initialMethods);
    }, [initialMethods]);

    const handleToggleActive = async (id) => {
        const method = methods.find(m => m.id === id);
        try {
            const res = await financeService.updatePaymentMethod(id, { is_active: !method.is_active });
            setMethods(methods.map(m => m.id === id ? res.data : m));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleUpdateAccount = async (id, accountId) => {
        try {
            const res = await financeService.updatePaymentMethod(id, { account: accountId });
            setMethods(methods.map(m => m.id === id ? res.data : m));
        } catch (error) {
            console.error("Failed to update account link", error);
            alert("Failed to update GL account");
        }
    };

    const handleToggleFlag = async (id, field) => {
        const method = methods.find(m => m.id === id);
        try {
            const res = await financeService.updatePaymentMethod(id, { [field]: !method[field] });
            setMethods(methods.map(m => m.id === id ? res.data : m));
        } catch (error) {
            console.error(`Failed to update ${field}`, error);
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newMethod, setNewMethod] = useState({
        name: '',
        code: 'BANK',
        account: '',
        account_number: '',
        is_active: true,
        is_for_payment: true,
        is_for_receipt: true,
        is_sponsorship_clearing: false,
        is_application_fee: false
    });

    const handleAddMethod = async () => {
        if (!newMethod.name) {
            alert('Please fill in method name');
            return;
        }
        if (!newMethod.account) {
            alert('Please select a GL account');
            return;
        }

        try {
            const res = await financeService.createPaymentMethod(newMethod);
            setMethods([...methods, res.data]);
            setShowAddModal(false);
            setNewMethod({
                name: '',
                code: 'BANK',
                account: '',
                account_number: '',
                is_active: true,
                is_for_payment: true,
                is_for_receipt: true,
                is_sponsorship_clearing: false,
                is_application_fee: false
            });
        } catch (error) {
            console.error("Failed to create method", error);
            alert("Error: " + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h6 className="fw-bold mb-1">Payment Methods Configuration</h6>
                        <small className="text-muted">Link payment methods to GL Accounts and configure usage</small>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={16} className="me-2" />
                        Add Payment Method
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Method</th>
                                <th>Type</th>
                                <th>Account No.</th>
                                <th style={{ width: '25%' }}>GL Account</th>
                                <th className="text-center">Pay</th>
                                <th className="text-center">Rcv</th>
                                <th className="text-center">Spon.</th>
                                <th className="text-center">App.</th>
                                <th className="text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {methods.filter(m => m).map((method) => (
                                <tr key={method.id || Math.random()}>
                                    <td className="fw-medium">{method.name || 'Unnamed Method'}</td>
                                    <td>
                                        <span className="badge bg-secondary">{method.code}</span>
                                    </td>
                                    <td className="small text-muted">{method.account_number || '-'}</td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={method.account || ''}
                                            onChange={(e) => handleUpdateAccount(method.id, e.target.value)}
                                        >
                                            <option value="">Select GL Account...</option>
                                            {accounts && accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.code} - {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    {/* Toggles for Flags */}
                                    <td className="text-center">
                                        <div className="form-check form-switch d-flex justify-content-center">
                                            <input className="form-check-input" type="checkbox" checked={method.is_for_payment} onChange={() => handleToggleFlag(method.id, 'is_for_payment')} />
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check form-switch d-flex justify-content-center">
                                            <input className="form-check-input" type="checkbox" checked={method.is_for_receipt} onChange={() => handleToggleFlag(method.id, 'is_for_receipt')} />
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check form-switch d-flex justify-content-center">
                                            <input className="form-check-input" type="checkbox" checked={method.is_sponsorship_clearing} onChange={() => handleToggleFlag(method.id, 'is_sponsorship_clearing')} />
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <div className="form-check form-switch d-flex justify-content-center">
                                            <input className="form-check-input" type="checkbox" checked={method.is_application_fee} onChange={() => handleToggleFlag(method.id, 'is_application_fee')} />
                                        </div>
                                    </td>

                                    <td className="text-center">
                                        <button
                                            className={`btn btn-sm ${method.is_active ? 'btn-success' : 'btn-secondary'}`}
                                            onClick={() => handleToggleActive(method.id)}
                                        >
                                            {method.is_active ? <Check size={14} /> : <X size={14} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Payment Method Modal */}
            {showAddModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Payment Method</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Method Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newMethod.name}
                                        onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                                        placeholder="e.g., Equity Bank"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Code / Type *</label>
                                    <select
                                        className="form-select"
                                        value={newMethod.code}
                                        onChange={(e) => setNewMethod({ ...newMethod, code: e.target.value })}
                                    >
                                        <option value="BANK">Bank Transfer</option>
                                        <option value="CASH">Cash</option>
                                        <option value="MPESA">Mobile Money</option>
                                        <option value="CHEQUE">Cheque</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Account No. / Paybill / Till</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newMethod.account_number || ''}
                                        onChange={(e) => setNewMethod({ ...newMethod, account_number: e.target.value })}
                                        placeholder="e.g. 1234567890"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">GL Account *</label>
                                    <select
                                        className="form-select"
                                        value={newMethod.account}
                                        onChange={(e) => setNewMethod({ ...newMethod, account: e.target.value })}
                                    >
                                        <option value="">Select GL Account...</option>
                                        {accounts && accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="row g-2 mb-3">
                                    <div className="col-6">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="canPay" checked={newMethod.is_for_payment} onChange={(e) => setNewMethod({ ...newMethod, is_for_payment: e.target.checked })} />
                                            <label className="form-check-label" htmlFor="canPay">Can Pay</label>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="canRcv" checked={newMethod.is_for_receipt} onChange={(e) => setNewMethod({ ...newMethod, is_for_receipt: e.target.checked })} />
                                            <label className="form-check-label" htmlFor="canRcv">Can Receive</label>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="isSpon" checked={newMethod.is_sponsorship_clearing} onChange={(e) => setNewMethod({ ...newMethod, is_sponsorship_clearing: e.target.checked })} />
                                            <label className="form-check-label" htmlFor="isSpon">Sponsorship Clearing</label>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="isApp" checked={newMethod.is_application_fee} onChange={(e) => setNewMethod({ ...newMethod, is_application_fee: e.target.checked })} />
                                            <label className="form-check-label" htmlFor="isApp">Application Fee</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={handleAddMethod}>Add Method</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethodSettings;
