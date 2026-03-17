import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, User, Calendar, DollarSign, FileText, Zap } from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import { formatKES } from '../utils/formatters';
import QuickAddCustomerModal from './QuickAddCustomerModal.jsx';

// Income account keyword mappings for auto-suggestion (Kenyan school context)
const INCOME_ACCOUNT_KEYWORDS = {
    // School Fees
    'tuition': ['tuition', 'school fee', 'fees income'],
    'school fee': ['tuition', 'school fee', 'fees income'],
    'fee': ['tuition', 'school fee', 'fees income'],
    // Boarding
    'boarding': ['boarding', 'accommodation', 'hostel'],
    'hostel': ['boarding', 'hostel', 'accommodation'],
    'accommodation': ['boarding', 'accommodation', 'hostel'],
    // Transport
    'transport': ['transport', 'bus', 'vehicle'],
    'bus': ['transport', 'bus'],
    // Meals/Catering
    'lunch': ['meals', 'lunch', 'catering'],
    'meals': ['meals', 'lunch', 'catering'],
    'catering': ['catering', 'meals'],
    'food': ['meals', 'catering', 'food'],
    // Uniform
    'uniform': ['uniform', 'clothing'],
    'clothing': ['uniform', 'clothing'],
    // Books & Supplies
    'book': ['books', 'stationery', 'supplies'],
    'stationery': ['books', 'stationery', 'supplies'],
    'supplies': ['supplies', 'stationery'],
    // Activities
    'activity': ['activities', 'extra-curricular', 'sports'],
    'sports': ['sports', 'activities', 'extra-curricular'],
    'extra': ['extra-curricular', 'activities'],
    'club': ['clubs', 'activities'],
    // Exams
    'exam': ['examination', 'exam', 'assessment'],
    'examination': ['examination', 'exam'],
    'assessment': ['assessment', 'examination'],
    'kcse': ['examination', 'kcse', 'exam'],
    'kcpe': ['examination', 'kcpe', 'exam'],
    // Computer/Lab
    'computer': ['computer', 'ict', 'lab'],
    'ict': ['computer', 'ict'],
    'lab': ['laboratory', 'lab', 'science'],
    'laboratory': ['laboratory', 'lab'],
    // Medical
    'medical': ['medical', 'health', 'clinic'],
    'health': ['health', 'medical'],
    'clinic': ['clinic', 'medical'],
    // Library
    'library': ['library', 'books'],
    // Registration
    'registration': ['registration', 'admission'],
    'admission': ['admission', 'registration'],
    // Misc
    'donation': ['donation', 'contribution'],
    'contribution': ['contribution', 'donation'],
    'development': ['development', 'building', 'infrastructure'],
    'building': ['building', 'development', 'infrastructure'],
};

const CreateCustomerInvoiceModal = ({ show, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [incomeAccounts, setIncomeAccounts] = useState([]);
    const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
    const [autoPost, setAutoPost] = useState(true); // Default to auto-post

    const [formData, setFormData] = useState({
        customer: '',
        date_issued: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        notes: '',
        status: 'DRAFT',
        is_recurring: false,
        lines: [
            { description: '', quantity: 1, unit_price: 0, income_account: '' }
        ]
    });

    useEffect(() => {
        if (show) {
            loadDependencies();
            // Reset form
            setFormData({
                customer: '',
                date_issued: new Date().toISOString().split('T')[0],
                due_date: new Date().toISOString().split('T')[0],
                invoice_number: `INV-${Date.now().toString().slice(-6)}`,
                notes: '',
                status: 'DRAFT',
                is_recurring: false,
                lines: [{ description: '', quantity: 1, unit_price: 0, income_account: '' }]
            });
            setAutoPost(true);
        }
    }, [show]);

    const loadDependencies = async () => {
        try {
            const [custRes, accRes] = await Promise.all([
                financeService.getCustomers().catch(() => null),
                financeService.getAccounts().catch(() => null)
            ]);

            setCustomers(custRes?.results || custRes || []);

            // Filter for INCOME accounts
            const allAccounts = accRes?.results || accRes || [];
            const incomeAccs = allAccounts.filter(acc => acc.type === 'INCOME');
            setIncomeAccounts(incomeAccs);

        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    // Function to suggest income account based on description
    const suggestIncomeAccount = (description) => {
        if (!description || !incomeAccounts.length) return null;

        const descLower = description.toLowerCase();

        // Find matching keywords in description
        for (const [keyword, relatedTerms] of Object.entries(INCOME_ACCOUNT_KEYWORDS)) {
            if (descLower.includes(keyword)) {
                // Search accounts for matching keywords
                for (const term of relatedTerms) {
                    const matchingAccount = incomeAccounts.find(acc =>
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

        // Auto-suggest income account when description changes
        if (field === 'description' && value && !newLines[index].income_account) {
            const suggestedAccount = suggestIncomeAccount(value);
            if (suggestedAccount) {
                newLines[index].income_account = suggestedAccount;
            }
        }

        setFormData({ ...formData, lines: newLines });
    };

    const addLine = () => {
        setFormData({
            ...formData,
            lines: [...formData.lines, { description: '', quantity: 1, unit_price: 0, income_account: '' }]
        });
    };

    const removeLine = (index) => {
        if (formData.lines.length > 1) {
            const newLines = formData.lines.filter((_, i) => i !== index);
            setFormData({ ...formData, lines: newLines });
        }
    };

    const calculateTotal = () => {
        return formData.lines.reduce((sum, line) => sum + (Number(line.quantity) * Number(line.unit_price)), 0);
    };

    const handleCustomerAdded = (newCustomer) => {
        setCustomers([...customers, newCustomer]);
        setFormData({ ...formData, customer: newCustomer.id });
    };

    const handleSubmit = async () => {
        if (!formData.customer) return alert("Please select a customer");
        if (formData.lines.some(l => !l.income_account || !l.description || Number(l.unit_price) <= 0)) {
            return alert("Please complete all line items (Account, Description, Price > 0)");
        }

        setLoading(true);
        try {
            // Format data for API
            const payload = {
                customer: parseInt(formData.customer, 10),
                invoice_number: formData.invoice_number.trim(),
                date_issued: formData.date_issued,
                due_date: formData.due_date,
                status: formData.status,
                is_recurring: formData.is_recurring,
                notes: formData.notes || '',
                auto_post: autoPost && formData.status !== 'PROFORMA', // Only auto-post if not proforma
                lines: formData.lines.map(line => ({
                    description: line.description.trim(),
                    quantity: parseFloat(line.quantity) || 1,
                    unit_price: parseFloat(line.unit_price),
                    income_account: parseInt(line.income_account, 10)
                }))
            };

            await financeService.createInvoice(payload);
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to create invoice", error);
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
                            <Plus size={20} className="text-info" />
                            <h5 className="modal-title fw-bold mb-0 text-white">Create New Invoice</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4 bg-light">
                        {/* Header Details */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label className="form-label small text-muted fw-bold mb-0">Customer</label>
                                            <button
                                                className="btn btn-link p-0 text-primary small fw-bold"
                                                style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                                                onClick={() => setShowAddCustomerModal(true)}
                                            >
                                                + New Customer
                                            </button>
                                        </div>
                                        <select
                                            className="form-select"
                                            value={formData.customer}
                                            onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                        >
                                            <option value="">Select Customer...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small text-muted fw-bold">Invoice Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.invoice_number}
                                            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small text-muted fw-bold">Date Issued</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={formData.date_issued}
                                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
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
                                    <div className="col-md-12">
                                        <div className="d-flex gap-4 flex-wrap">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="autoPostCheck"
                                                    checked={autoPost}
                                                    onChange={(e) => setAutoPost(e.target.checked)}
                                                    disabled={formData.status === 'PROFORMA'}
                                                />
                                                <label className="form-check-label small fw-bold d-flex align-items-center gap-1" htmlFor="autoPostCheck">
                                                    <Zap size={14} className="text-success" />
                                                    Auto-Post to Ledger
                                                </label>
                                                <div className="form-text small text-muted" style={{ fontSize: '0.7rem' }}>
                                                    Automatically creates journal entry
                                                </div>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="proformaCheck"
                                                    checked={formData.status === 'PROFORMA'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'PROFORMA' : 'DRAFT' })}
                                                />
                                                <label className="form-check-label small fw-bold" htmlFor="proformaCheck">
                                                    Mark as Proforma Invoice
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="recurringCheck"
                                                    checked={formData.is_recurring || false}
                                                    onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                                                />
                                                <label className="form-check-label small fw-bold" htmlFor="recurringCheck">
                                                    Recurrent Invoice
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom-0 py-3">
                                <h6 className="fw-bold mb-0 text-primary">Invoice Items</h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="bg-light text-muted small text-uppercase">
                                            <tr>
                                                <th className="ps-4" style={{ width: '25%' }}>Income Account</th>
                                                <th style={{ width: '30%' }}>Description</th>
                                                <th style={{ width: '10%' }}>Qty</th>
                                                <th style={{ width: '15%' }}>Unit Price</th>
                                                <th className="text-end" style={{ width: '15%' }}>Amount</th>
                                                <th style={{ width: '5%' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.lines.map((line, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-4">
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={line.income_account}
                                                            onChange={(e) => handleLineChange(idx, 'income_account', e.target.value)}
                                                        >
                                                            <option value="">Select Account...</option>
                                                            {incomeAccounts.map(acc => (
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
                                                            className="form-control form-control-sm"
                                                            min="1"
                                                            value={line.quantity}
                                                            onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            min="0"
                                                            step="0.01"
                                                            value={line.unit_price}
                                                            onChange={(e) => handleLineChange(idx, 'unit_price', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-end fw-bold">
                                                        {formatKES(line.quantity * line.unit_price)}
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
                                                <td colSpan="6" className="ps-4 py-3">
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
                                    placeholder="Add notes for the customer..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="col-md-5">
                                <div className="card border-0 shadow-sm bg-primary text-white">
                                    <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="small opacity-75 mb-1">Total Amount</div>
                                            <div className="h3 fw-bold mb-0">{formatKES(calculateTotal())}</div>
                                        </div>
                                        <div className="vr bg-white opacity-25 mx-3" style={{ height: '40px' }}></div>
                                        <button
                                            className="btn btn-light text-primary fw-bold px-4 py-2 shadow-sm"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Save size={18} className="me-2" />}
                                            Save Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <QuickAddCustomerModal
                show={showAddCustomerModal}
                onClose={() => setShowAddCustomerModal(false)}
                onSave={handleCustomerAdded}
            />
        </div>
    );
};

export default CreateCustomerInvoiceModal;
