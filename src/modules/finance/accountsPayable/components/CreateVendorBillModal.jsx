import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, ShoppingBag, Calendar, DollarSign, FileText } from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import { formatKES } from '../utils/formatters';

// Expense account keyword mappings for auto-suggestion
const EXPENSE_ACCOUNT_KEYWORDS = {
    // Internet/Hosting expenses
    'hosting': ['hosting', 'internet', 'web hosting', 'server', 'cloud'],
    'internet': ['hosting', 'internet', 'web hosting', 'bandwidth', 'connectivity'],
    'web': ['hosting', 'internet', 'web hosting'],
    'server': ['hosting', 'internet', 'server', 'cloud'],
    'cloud': ['hosting', 'cloud', 'server', 'aws', 'azure'],
    // Utilities
    'electricity': ['electricity', 'power', 'utility', 'utilities'],
    'power': ['electricity', 'power', 'utility'],
    'water': ['water', 'utility', 'utilities'],
    'utility': ['utility', 'utilities', 'electricity', 'water'],
    // Telecommunications
    'phone': ['telephone', 'phone', 'communication', 'airtime'],
    'telephone': ['telephone', 'phone', 'communication'],
    'airtime': ['telephone', 'phone', 'airtime', 'communication'],
    'mobile': ['telephone', 'mobile', 'phone'],
    // Transport & Travel
    'transport': ['transport', 'travel', 'fuel', 'vehicle'],
    'travel': ['travel', 'transport', 'accommodation'],
    'fuel': ['fuel', 'transport', 'vehicle', 'petrol', 'diesel'],
    'vehicle': ['vehicle', 'transport', 'fuel', 'motor'],
    // Office & Stationery
    'stationery': ['stationery', 'office', 'supplies', 'printing'],
    'office': ['office', 'stationery', 'supplies'],
    'printing': ['printing', 'stationery', 'office'],
    'supplies': ['supplies', 'stationery', 'office'],
    // Repairs & Maintenance
    'repair': ['repair', 'maintenance', 'service'],
    'maintenance': ['maintenance', 'repair', 'service'],
    'service': ['service', 'maintenance', 'repair'],
    // Food & Catering
    'food': ['food', 'catering', 'meals', 'kitchen'],
    'catering': ['catering', 'food', 'meals'],
    'meals': ['meals', 'food', 'catering'],
    'kitchen': ['kitchen', 'food', 'catering'],
    // Cleaning
    'cleaning': ['cleaning', 'sanitation', 'janitorial'],
    'sanitation': ['sanitation', 'cleaning'],
    // Security
    'security': ['security', 'guard', 'surveillance'],
    'guard': ['security', 'guard'],
    // Training & Professional
    'training': ['training', 'professional development', 'workshop'],
    'workshop': ['workshop', 'training', 'seminar'],
    'seminar': ['seminar', 'training', 'workshop'],
    // Insurance
    'insurance': ['insurance', 'premium'],
    // Rent
    'rent': ['rent', 'lease', 'rental'],
    'lease': ['lease', 'rent', 'rental'],
    // Bank charges
    'bank': ['bank charge', 'bank fee', 'transaction fee'],
    // General
    'subscription': ['subscription', 'license', 'software'],
    'license': ['license', 'subscription', 'software'],
    'software': ['software', 'subscription', 'license'],
};

const CreateVendorBillModal = ({ show, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [expenseAccounts, setExpenseAccounts] = useState([]);
    const [showNewVendorForm, setShowNewVendorForm] = useState(false);
    const [newVendor, setNewVendor] = useState({ name: '', email: '', phone: '', address: '', tax_id: '' });
    const [creatingVendor, setCreatingVendor] = useState(false);

    const [formData, setFormData] = useState({
        vendor: '',
        date_received: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        bill_number: '',
        notes: '',
        lines: [
            { description: '', amount: 0, expense_account: '' }
        ]
    });

    useEffect(() => {
        if (show) {
            loadDependencies();
            // Reset form when modal opens
            setFormData({
                vendor: '',
                date_received: new Date().toISOString().split('T')[0],
                due_date: new Date().toISOString().split('T')[0],
                bill_number: '',
                notes: '',
                lines: [{ description: '', amount: 0, expense_account: '' }]
            });
            setShowNewVendorForm(false);
            setNewVendor({ name: '', email: '', phone: '', address: '', tax_id: '' });
        }
    }, [show]);

    const loadDependencies = async () => {
        try {
            const [vendRes, accRes] = await Promise.all([
                financeService.getVendors().catch(() => null),
                financeService.getAccounts().catch(() => null)
            ]);

            setVendors(vendRes?.results || vendRes || []);

            // Filter for EXPENSE or ASSET accounts
            const allAccounts = accRes?.results || accRes || [];
            const expAccs = allAccounts.filter(acc => ['EXPENSE', 'ASSET'].includes(acc.type));
            setExpenseAccounts(expAccs);

        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    const handleCreateVendor = async () => {
        if (!newVendor.name.trim()) {
            alert('Please enter the vendor name');
            return;
        }
        setCreatingVendor(true);
        try {
            const created = await financeService.createVendor(newVendor);
            // Add to vendors list and select it
            setVendors(prev => [...prev, created]);
            setFormData(prev => ({ ...prev, vendor: created.id }));
            setShowNewVendorForm(false);
            setNewVendor({ name: '', email: '', phone: '', address: '', tax_id: '' });
        } catch (error) {
            console.error("Failed to create vendor", error);
            alert("Error creating vendor: " + (error.message || 'Unknown error'));
        } finally {
            setCreatingVendor(false);
        }
    };

    // Function to suggest expense account based on description
    const suggestExpenseAccount = (description) => {
        if (!description || !expenseAccounts.length) return null;

        const descLower = description.toLowerCase();

        // Find matching keywords in description
        for (const [keyword, relatedTerms] of Object.entries(EXPENSE_ACCOUNT_KEYWORDS)) {
            if (descLower.includes(keyword)) {
                // Search accounts for matching keywords
                for (const term of relatedTerms) {
                    const matchingAccount = expenseAccounts.find(acc =>
                        acc.name?.toLowerCase().includes(term) ||
                        acc.code?.toLowerCase().includes(term)
                    );
                    if (matchingAccount) {
                        return matchingAccount.id;
                    }
                }
            }
        }

        return null;
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.lines];
        newLines[index][field] = value;

        // Auto-suggest expense account when description changes
        if (field === 'description' && value && !newLines[index].expense_account) {
            const suggestedAccount = suggestExpenseAccount(value);
            if (suggestedAccount) {
                newLines[index].expense_account = suggestedAccount;
            }
        }

        setFormData({ ...formData, lines: newLines });
    };

    const addLine = () => {
        setFormData({
            ...formData,
            lines: [...formData.lines, { description: '', amount: 0, expense_account: '' }]
        });
    };

    const removeLine = (index) => {
        if (formData.lines.length > 1) {
            const newLines = formData.lines.filter((_, i) => i !== index);
            setFormData({ ...formData, lines: newLines });
        }
    };

    const calculateTotal = () => {
        return formData.lines.reduce((sum, line) => sum + Number(line.amount), 0);
    };

    const handleSubmit = async () => {
        if (!formData.vendor) return alert("Please select a vendor");
        if (!formData.bill_number) return alert("Please enter the vendor's bill number");
        if (formData.lines.some(l => !l.expense_account || !l.description || Number(l.amount) <= 0)) {
            return alert("Please complete all line items (Account, Description, Amount > 0)");
        }

        setLoading(true);
        try {
            // Format data for API - ensure correct types
            const payload = {
                vendor: parseInt(formData.vendor, 10),
                bill_number: formData.bill_number.trim(),
                date_received: formData.date_received,
                due_date: formData.due_date,
                notes: formData.notes || '',
                lines: formData.lines.map(line => ({
                    description: line.description.trim(),
                    amount: parseFloat(line.amount),
                    expense_account: parseInt(line.expense_account, 10)
                }))
            };

            await financeService.createBill(payload);
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to create bill", error);
            const errorMsg = error.data?.detail || error.data?.message ||
                (typeof error.data === 'object' ? JSON.stringify(error.data) : error.message);
            alert("Error: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-dark text-white border-0 py-3 px-4">
                        <div className="d-flex align-items-center gap-2">
                            <ShoppingBag size={20} className="text-warning" />
                            <h5 className="modal-title fw-bold mb-0 text-white">Record Vendor Bill</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        {/* Header Details */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label small text-muted fw-bold">Vendor</label>
                                        <div className="d-flex gap-2">
                                            <select
                                                className="form-select"
                                                value={formData.vendor}
                                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                            >
                                                <option value="">Select Vendor...</option>
                                                {vendors.map(v => (
                                                    <option key={v.id} value={v.id}>{v.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                className="btn btn-outline-primary"
                                                type="button"
                                                onClick={() => setShowNewVendorForm(!showNewVendorForm)}
                                                title="Add New Vendor"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small text-muted fw-bold">Bill / Invoice No.</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. INV-987"
                                            value={formData.bill_number}
                                            onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small text-muted fw-bold">Date Received</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.date_received}
                                            onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small text-muted fw-bold">Due Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.due_date}
                                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* New Vendor Form (collapsible) */}
                        {showNewVendorForm && (
                            <div className="card border-primary mb-4">
                                <div className="card-header bg-primary text-white py-2">
                                    <h6 className="mb-0">Add New Vendor</h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small">Vendor Name *</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="e.g. ABC Supplies Ltd"
                                                value={newVendor.name}
                                                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small">Email</label>
                                            <input
                                                type="email"
                                                className="form-control form-control-sm"
                                                placeholder="vendor@example.com"
                                                value={newVendor.email}
                                                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small">Phone</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="+254..."
                                                value={newVendor.phone}
                                                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small">Tax ID (KRA PIN)</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="A000000000A"
                                                value={newVendor.tax_id}
                                                onChange={(e) => setNewVendor({ ...newVendor, tax_id: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small">Address</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                placeholder="Physical or postal address"
                                                value={newVendor.address}
                                                onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-2 d-flex align-items-end">
                                            <button
                                                className="btn btn-success btn-sm w-100"
                                                onClick={handleCreateVendor}
                                                disabled={creatingVendor}
                                            >
                                                {creatingVendor ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    'Create Vendor'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Line Items */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom-0 py-3">
                                <h6 className="fw-bold mb-0 text-primary">Bill Items (Expense Allocation)</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="ps-4" style={{ width: '30%' }}>Expense/Asset Account</th>
                                                <th style={{ width: '40%' }}>Description</th>
                                                <th className="text-end" style={{ width: '20%' }}>Amount</th>
                                                <th style={{ width: '10%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.lines.map((line, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={line.expense_account}
                                                            onChange={(e) => handleLineChange(idx, 'expense_account', e.target.value)}
                                                        >
                                                            <option value="">Select Account...</option>
                                                            {expenseAccounts.map(acc => (
                                                                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Item description"
                                                            value={line.description}
                                                            onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm text-end"
                                                            min="0"
                                                            step="0.01"
                                                            value={line.amount}
                                                            onChange={(e) => handleLineChange(idx, 'amount', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        {formData.lines.length > 1 && (
                                                            <button
                                                                className="btn btn-link text-danger p-0"
                                                                onClick={() => removeLine(idx)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-light">
                                            <tr>
                                                <td colSpan="4" className="ps-4 py-3">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary border-dashed"
                                                        onClick={addLine}
                                                    >
                                                        <Plus size={14} className="me-1" /> Add Line Item
                                                    </button>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Summary & Actions */}
                        <div className="row align-items-center">
                            <div className="col-md-7">
                                <label className="form-label small text-muted fw-bold">Notes</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    placeholder="Add notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="col-md-5">
                                <div className="card border-0 shadow-sm bg-warning text-dark">
                                    <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="small opacity-75 mb-1">Total Payable</div>
                                            <div className="h3 fw-bold mb-0">{formatKES(calculateTotal())}</div>
                                        </div>
                                        <div className="vr bg-dark opacity-25 mx-3" style={{ height: '40px' }}></div>
                                        <button
                                            className="btn btn-dark fw-bold px-4 py-2 shadow-sm"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Save size={18} className="me-2" />}
                                            Save Bill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateVendorBillModal;
