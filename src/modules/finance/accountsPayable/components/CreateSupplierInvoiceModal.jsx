/**
 * Create Supplier Invoice Modal
 * 
 * Supports creating supplier invoices with VAT handling (0%, 8%, 16%).
 * Links to GL expense accounts and budget lines.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Calculator, AlertCircle, Save, Upload, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
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

const VAT_RATES = [
    { value: 0, label: '0% (Exempt)' },
    { value: 8, label: '8% (Reduced)' },
    { value: 16, label: '16% (Standard)' }
];

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    try {
        return new Date().toISOString().split('T')[0];
    } catch (e) {
        // Fallback formatting
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};

const CreateSupplierInvoiceModal = ({ show, onClose, onCreated }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [attachment, setAttachment] = useState(null);

    const [formData, setFormData] = useState({
        supplier: '',
        invoice_number: '',
        invoice_date: getTodayDate(),
        due_date: '',
        purchase_order_ref: '',
        notes: ''
    });

    const [lines, setLines] = useState([
        { description: '', quantity: 1, unit_price: '', gl_account: '', vat_rate: 16 }
    ]);

    useEffect(() => {
        if (show) {
            loadData();
        }
    }, [show]);

    useEffect(() => {
        // Auto-calculate due date when supplier changes
        if (formData.supplier && formData.invoice_date) {
            const supplier = suppliers.find(s => s.id == formData.supplier);
            if (supplier) {
                try {
                    const dueDate = new Date(formData.invoice_date);
                    if (!isNaN(dueDate.getTime())) {
                        dueDate.setDate(dueDate.getDate() + (supplier.payment_terms || 30));
                        const year = dueDate.getFullYear();
                        const month = String(dueDate.getMonth() + 1).padStart(2, '0');
                        const day = String(dueDate.getDate()).padStart(2, '0');
                        setFormData(prev => ({
                            ...prev,
                            due_date: `${year}-${month}-${day}`
                        }));
                    }
                } catch (e) {
                    console.error('Error calculating due date:', e);
                }
            }
        }
    }, [formData.supplier, formData.invoice_date, suppliers]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [suppliersRes, accountsRes] = await Promise.all([
                financeService.getSuppliers({ is_active: true }).catch(() => null),
                financeService.getAccounts().catch(() => null)
            ]);
            setSuppliers(suppliersRes?.results || suppliersRes || []);

            // Filter for expense accounts
            const allAccounts = accountsRes?.results || accountsRes || [];
            const expenseAccounts = allAccounts.filter(acc =>
                acc.type === 'EXPENSE' || acc.type === 'ASSET'
            );
            setAccounts(expenseAccounts);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Function to suggest expense account based on description
    const suggestExpenseAccount = (description) => {
        if (!description || !accounts.length) return null;

        const descLower = description.toLowerCase();

        // Find matching keywords in description
        for (const [keyword, relatedTerms] of Object.entries(EXPENSE_ACCOUNT_KEYWORDS)) {
            if (descLower.includes(keyword)) {
                // Search accounts for matching keywords
                for (const term of relatedTerms) {
                    const matchingAccount = accounts.find(acc =>
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
        setLines(prev => prev.map((line, i) => {
            if (i !== index) return line;

            const updatedLine = { ...line, [field]: value };

            // Auto-suggest expense account when description changes
            if (field === 'description' && value && !line.gl_account) {
                const suggestedAccount = suggestExpenseAccount(value);
                if (suggestedAccount) {
                    updatedLine.gl_account = suggestedAccount;
                }
            }

            return updatedLine;
        }));
    };

    const addLine = () => {
        setLines(prev => [...prev, {
            description: '',
            quantity: 1,
            unit_price: '',
            gl_account: '',
            vat_rate: 16
        }]);
    };

    const removeLine = (index) => {
        if (lines.length === 1) return;
        setLines(prev => prev.filter((_, i) => i !== index));
    };

    const calculateLineAmount = (line) => {
        const qty = parseFloat(line.quantity) || 0;
        const price = parseFloat(line.unit_price) || 0;
        return qty * price;
    };

    const calculateLineVAT = (line) => {
        const amount = calculateLineAmount(line);
        const vatRate = parseFloat(line.vat_rate) || 0;
        return amount * (vatRate / 100);
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let vatTotal = 0;

        lines.forEach(line => {
            subtotal += calculateLineAmount(line);
            vatTotal += calculateLineVAT(line);
        });

        return {
            subtotal,
            vatTotal,
            total: subtotal + vatTotal
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            // Validate lines
            const validLines = lines.filter(l => l.description && l.unit_price && l.gl_account);
            if (validLines.length === 0) {
                throw new Error('At least one complete line item is required');
            }

            // Use FormData if there's an attachment
            let payload;
            if (attachment) {
                payload = new FormData();
                payload.append('supplier', formData.supplier);
                payload.append('invoice_number', formData.invoice_number);
                payload.append('invoice_date', formData.invoice_date);
                payload.append('due_date', formData.due_date);
                if (formData.purchase_order_ref) {
                    payload.append('purchase_order_ref', formData.purchase_order_ref);
                }
                if (formData.notes) {
                    payload.append('notes', formData.notes);
                }
                payload.append('attachment', attachment);
                payload.append('lines', JSON.stringify(validLines.map(l => ({
                    description: l.description,
                    quantity: parseFloat(l.quantity) || 1,
                    unit_price: parseFloat(l.unit_price),
                    gl_account: parseInt(l.gl_account),
                    vat_rate: parseFloat(l.vat_rate) || 0
                }))));
            } else {
                payload = {
                    ...formData,
                    lines: validLines.map(l => ({
                        description: l.description,
                        quantity: parseFloat(l.quantity) || 1,
                        unit_price: parseFloat(l.unit_price),
                        gl_account: parseInt(l.gl_account),
                        vat_rate: parseFloat(l.vat_rate) || 0
                    }))
                };
            }

            await financeService.createSupplierInvoice(payload);
            toast.success('Supplier invoice created successfully');
            onCreated();
        } catch (err) {
            console.error('Failed to create invoice:', err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to create invoice';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const totals = calculateTotals();

    if (!show) return null;

    return createPortal(
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container" style={{ maxWidth: '1100px', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header">
                    <h5 className="mb-0">New Supplier Invoice</h5>
                    <button className="btn btn-outline-secondary" onClick={onClose}><X size={18} /></button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger m-3 mb-0 d-flex align-items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                        <button className="btn-close ms-auto" onClick={() => setError(null)}></button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Header Fields */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Supplier <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} ({s.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">PO Reference</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="purchase_order_ref"
                                        value={formData.purchase_order_ref}
                                        onChange={handleInputChange}
                                        placeholder="PO-XXXX"
                                    />
                                    <small className="text-muted">Purchase order reference from supplier's document</small>

                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Supplier Invoice # <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="invoice_number"
                                        value={formData.invoice_number}
                                        onChange={handleInputChange}
                                        placeholder="e.g. INV-001234"
                                        required
                                    />
                                    <small className="text-muted">Invoice number from supplier's document</small>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Invoice Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="invoice_date"
                                        value={formData.invoice_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Due Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">Line Items</h6>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                        onClick={addLine}
                                    >
                                        <Plus size={14} /> Add Line
                                    </button>
                                </div>

                                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                                    <table className="table table-bordered mb-0" style={{ minWidth: '920px' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ minWidth: '200px' }}>Description</th>
                                                <th style={{ minWidth: '200px' }}>GL Account</th>
                                                <th style={{ minWidth: '100px', width: '100px' }}>Qty</th>
                                                <th style={{ minWidth: '140px', width: '140px' }}>Unit Price</th>
                                                <th style={{ minWidth: '120px', width: '120px' }}>VAT</th>
                                                <th style={{ minWidth: '110px', width: '110px' }}>Amount</th>
                                                <th style={{ minWidth: '50px', width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lines.map((line, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={line.description}
                                                            onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                                                            placeholder="Description"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={line.gl_account}
                                                            onChange={(e) => handleLineChange(index, 'gl_account', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select</option>
                                                            {accounts.map(acc => (
                                                                <option key={acc.id} value={acc.id}>
                                                                    {acc.code} - {acc.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={line.quantity}
                                                            onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                                                            min="0.01"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={line.unit_price}
                                                            onChange={(e) => handleLineChange(index, 'unit_price', e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={line.vat_rate}
                                                            onChange={(e) => handleLineChange(index, 'vat_rate', e.target.value)}
                                                        >
                                                            {VAT_RATES.map(rate => (
                                                                <option key={rate.value} value={rate.value}>
                                                                    {rate.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="text-end font-monospace align-middle">
                                                        {formatCurrency(calculateLineAmount(line) + calculateLineVAT(line))}
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeLine(index)}
                                                            disabled={lines.length === 1}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="row justify-content-end mb-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm bg-warning text-dark">
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <span className="font-monospace fw-semibold">{formatKES ? formatKES(totals.subtotal) : formatCurrency(totals.subtotal)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>VAT:</span>
                                                <span className="font-monospace fw-semibold">{formatKES ? formatKES(totals.vatTotal) : formatCurrency(totals.vatTotal)}</span>
                                            </div>
                                            <hr className="my-2 bg-dark opacity-25" />
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-bold">Total Payable:</span>
                                                <span className="font-monospace fw-bold h5 mb-0">{formatKES ? formatKES(totals.total) : formatCurrency(totals.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attachment */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">Attachment (Invoice Scan)</label>
                                    <div className="input-group">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setAttachment(e.target.files[0])}
                                        />
                                        {attachment && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => setAttachment(null)}
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {attachment && (
                                        <small className="text-muted d-flex align-items-center gap-1 mt-1">
                                            <FileText size={14} /> {attachment.name}
                                        </small>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        rows="2"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Additional notes or comments..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Invoice'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style>{`
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                    padding: 1rem;
                }
                .modal-container {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                }
                .modal-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }
                .modal-body {
                    padding: 1.5rem;
                    overflow-y: auto;
                    flex: 1;
                    max-height: calc(90vh - 140px);
                }
                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .table-responsive {
                    border: 1px solid #dee2e6;
                    border-radius: 6px;
                }
                .table-responsive::-webkit-scrollbar {
                    height: 8px;
                }
                .table-responsive::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .table-responsive::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 4px;
                }
                .table-responsive::-webkit-scrollbar-thumb:hover {
                    background: #a1a1a1;
                }
            `}</style>
        </div>,
        document.body
    );
};

export default CreateSupplierInvoiceModal;
