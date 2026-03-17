/**
 * Create Payment Voucher Modal
 * 
 * Supports all voucher types:
 * - AP: Pay supplier invoices
 * - GENERAL: General expense payments
 * - IMPREST: Cash advances to staff
 * - REFUND: Student/customer refunds
 */

import React, { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, AlertCircle, Building2,
    CreditCard, Wallet, RefreshCcw, User, Save
} from 'lucide-react';
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

const VOUCHER_TYPES = [
    { value: 'AP', label: 'AP Payment', icon: Building2, description: 'Pay supplier invoice' },
    { value: 'GENERAL', label: 'General Payment', icon: CreditCard, description: 'Direct expense payment' },
    { value: 'IMPREST', label: 'Imprest/Cash Advance', icon: Wallet, description: 'Cash advance to staff' },
    { value: 'REFUND', label: 'Refund', icon: RefreshCcw, description: 'Customer/student refund' }
];

const PAYMENT_METHODS = [
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'CASH', label: 'Cash' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money (M-Pesa)' }
];

const CreatePaymentVoucherModal = ({ show, onClose, onCreated, prefilledData }) => {
    const [step, setStep] = useState(1); // 1: Select type, 2: Fill details
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Reference data
    const [supplierInvoices, setSupplierInvoices] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);

    // Form state
    const [voucherType, setVoucherType] = useState('');
    const [formData, setFormData] = useState({
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        payment_method: 'BANK_TRANSFER',
        bank_account: '',
        cheque_number: '',
        payment_reference: '',
        // AP specific
        supplier_invoice: '',
        // Imprest specific
        staff_member: '',
        imprest_account: '',
        // Refund specific
        payee_name: '',
        refund_reason: '',
        notes: ''
    });

    // Lines for GENERAL/IMPREST
    const [lines, setLines] = useState([
        { description: '', amount: '', gl_account: '' }
    ]);

    useEffect(() => {
        if (show) {
            loadReferenceData();
            if (prefilledData) {
                setVoucherType(prefilledData.voucher_type || '');
                setFormData(prev => ({ ...prev, ...prefilledData }));
                setStep(2);
            }
        }
    }, [show]);

    const loadReferenceData = async () => {
        setLoading(true);
        try {
            const [invoicesRes, accountsRes, methodsRes] = await Promise.all([
                financeService.getSupplierInvoices({ status: 'POSTED' }).catch(err => { console.error('Supplier invoices error:', err); return null; }),
                financeService.getAccounts().catch(err => { console.error('Accounts error:', err); return null; }),
                financeService.getPaymentMethods().catch(err => { console.error('Payment methods error:', err); return null; })
            ]);

            // Only unpaid invoices with balance
            const invoices = (invoicesRes?.results || invoicesRes || [])
                .filter(inv => inv && parseFloat(inv.balance) > 0);
            setSupplierInvoices(invoices);

            const allAccounts = accountsRes?.results || accountsRes || [];
           
            setAccounts(allAccounts);

            setPaymentMethods(methodsRes?.results || methodsRes || PAYMENT_METHODS);
        } catch (err) {
            console.error('Failed to load reference data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-fill amount from supplier invoice
        if (name === 'supplier_invoice' && value) {
            const invoice = supplierInvoices.find(i => i.id == value);
            if (invoice) {
                setFormData(prev => ({
                    ...prev,
                    amount: invoice.balance,
                    description: `Payment for invoice ${invoice.invoice_number} - ${invoice.supplier_name}`
                }));
            }
        }
    };

    // Function to suggest expense account based on description
    const suggestExpenseAccount = (description) => {
        if (!description || !accounts.length) return null;

        const descLower = description.toLowerCase();
        const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE');

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
        setLines(prev => [...prev, { description: '', amount: '', gl_account: '' }]);
    };

    const removeLine = (index) => {
        if (lines.length === 1) return;
        setLines(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotalFromLines = () => {
        return lines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
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
            const payload = {
                voucher_type: voucherType,
                payment_date: formData.payment_date,
                payment_method: formData.payment_method,
                bank_account: formData.bank_account || null,
                cheque_number: formData.cheque_number || null,
                payment_reference: formData.payment_reference || null,
                description: formData.description,
                notes: formData.notes
            };

            // Type-specific fields
            if (voucherType === 'AP') {
                payload.supplier_invoice = parseInt(formData.supplier_invoice);
                payload.amount = parseFloat(formData.amount);
            } else if (voucherType === 'GENERAL') {
                payload.payee_name = formData.payee_name;
                payload.amount = calculateTotalFromLines();
                payload.lines = lines.filter(l => l.description && l.amount && l.gl_account)
                    .map(l => ({
                        description: l.description,
                        amount: parseFloat(l.amount),
                        gl_account: parseInt(l.gl_account)
                    }));
            } else if (voucherType === 'IMPREST') {
                payload.staff_member = parseInt(formData.staff_member) || null;
                payload.imprest_account = parseInt(formData.imprest_account) || null;
                payload.payee_name = formData.payee_name;
                payload.amount = parseFloat(formData.amount);
            } else if (voucherType === 'REFUND') {
                payload.payee_name = formData.payee_name;
                payload.refund_reason = formData.refund_reason;
                payload.amount = parseFloat(formData.amount);
            }

            await financeService.createPaymentVoucher(payload);
            onCreated();
        } catch (err) {
            console.error('Failed to create voucher:', err);
            setError(err.response?.data?.error || err.message || 'Failed to create voucher');
        } finally {
            setSaving(false);
        }
    };

    const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE');
    const assetAccounts = accounts.filter(a => a.type === 'ASSET');
    const bankAccounts = paymentMethods.filter(m => m.account);

    if (!show) return null;

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container" style={{ maxWidth: step === 1 ? '600px' : '800px', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header">
                    <h5 className="mb-0">
                        {step === 1 ? 'Select Voucher Type' : `New ${VOUCHER_TYPES.find(t => t.value === voucherType)?.label}`}
                    </h5>
                    <button className="btn-close" onClick={onClose}></button>
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
                ) : step === 1 ? (
                    /* Step 1: Type Selection */
                    <div className="modal-body">
                        <div className="row g-3">
                            {VOUCHER_TYPES.map(type => {
                                const Icon = type.icon;
                                return (
                                    <div key={type.value} className="col-md-6">
                                        <div
                                            className={`card h-100 cursor-pointer border-2 ${voucherType === type.value ? 'border-primary bg-primary-subtle' : ''
                                                }`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setVoucherType(type.value)}
                                        >
                                            <div className="card-body text-center">
                                                <Icon size={32} className={`mb-2 ${voucherType === type.value ? 'text-primary' : 'text-muted'
                                                    }`} />
                                                <h6 className="mb-1">{type.label}</h6>
                                                <small className="text-muted">{type.description}</small>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="d-flex justify-content-end mt-4">
                            <button
                                className="btn btn-primary"
                                onClick={() => setStep(2)}
                                disabled={!voucherType}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Step 2: Voucher Details */
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 180px)', overflowY: 'auto' }}>
                            {/* Common Fields */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Payment Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="payment_date"
                                        value={formData.payment_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Payment Method <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        name="payment_method"
                                        value={formData.payment_method}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        {PAYMENT_METHODS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.payment_method === 'CHEQUE' && (
                                    <div className="col-md-6">
                                        <label className="form-label">Cheque Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="cheque_number"
                                            value={formData.cheque_number}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                )}

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Bank Account <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        name="bank_account"
                                        value={formData.bank_account}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option key="_default_bank" value="">Select Bank Account</option>
                                        {paymentMethods.map((pm, index) => (
                                            <option key={`bank_${pm.id || pm.value || index}`} value={pm.id || pm.value}>
                                                {pm.name || pm.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* AP Payment Fields */}
                            {voucherType === 'AP' && (
                                <div className="mb-4">
                                    <h6 className="border-bottom pb-2 mb-3">
                                        <Building2 size={16} className="me-2" />
                                        Supplier Invoice
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-8">
                                            <label className="form-label">
                                                Select Invoice <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                name="supplier_invoice"
                                                value={formData.supplier_invoice}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option key="_default_invoice" value="">Select Invoice to Pay</option>
                                                {supplierInvoices.map(inv => (
                                                    <option key={`inv_${inv.id}`} value={inv.id}>
                                                        {inv.invoice_number} - {inv.supplier_name} (Balance: {formatCurrency(inv.balance)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Amount</label>
                                            <div className="input-group">
                                                <span className="input-group-text">KES</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleInputChange}
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* General Payment Fields */}
                            {voucherType === 'GENERAL' && (
                                <div className="mb-4">
                                    <h6 className="border-bottom pb-2 mb-3">
                                        <CreditCard size={16} className="me-2" />
                                        Payment Details
                                    </h6>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Payee Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="payee_name"
                                                value={formData.payee_name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Expense Lines */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label mb-0">Expense Lines</label>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={addLine}
                                        >
                                            <Plus size={14} /> Add Line
                                        </button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Description</th>
                                                    <th>Expense Account</th>
                                                    <th>Amount</th>
                                                    <th></th>
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
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={line.gl_account}
                                                                onChange={(e) => handleLineChange(index, 'gl_account', e.target.value)}
                                                            >
                                                                <option key="_default_exp" value="">Select</option>
                                                                {expenseAccounts.map(acc => (
                                                                    <option key={`exp_${acc.id}`} value={acc.id}>
                                                                        {acc.code} - {acc.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                value={line.amount}
                                                                onChange={(e) => handleLineChange(index, 'amount', e.target.value)}
                                                                step="0.01"
                                                            />
                                                        </td>
                                                        <td>
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
                                            <tfoot className="bg-light">
                                                <tr>
                                                    <td colSpan="4" className="ps-4 py-3">
                                                        <button
                                                            type="button"
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

                                    {/* Total Summary Card */}
                                    <div className="card border-0 shadow-sm bg-warning text-dark mt-3">
                                        <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="small opacity-75 mb-1">Total Payment</div>
                                                <div className="h3 fw-bold mb-0">{formatKES ? formatKES(calculateTotalFromLines()) : formatCurrency(calculateTotalFromLines())}</div>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-muted d-block">{lines.filter(l => l.amount).length} line item(s)</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Imprest Fields */}
                            {voucherType === 'IMPREST' && (
                                <div className="mb-4">
                                    <h6 className="border-bottom pb-2 mb-3">
                                        <Wallet size={16} className="me-2" />
                                        Imprest Details
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Staff Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="payee_name"
                                                value={formData.payee_name}
                                                onChange={handleInputChange}
                                                placeholder="Name of staff receiving imprest"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Amount <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text">KES</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleInputChange}
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Imprest Account</label>
                                            <select
                                                className="form-select"
                                                name="imprest_account"
                                                value={formData.imprest_account}
                                                onChange={handleInputChange}
                                            >
                                                <option key="_default_imprest" value="">Select Imprest Account</option>
                                                {assetAccounts.filter(a => a.name?.toLowerCase().includes('imprest')).map(acc => (
                                                    <option key={`imprest_${acc.id}`} value={acc.id}>
                                                        {acc.code} - {acc.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Refund Fields */}
                            {voucherType === 'REFUND' && (
                                <div className="mb-4">
                                    <h6 className="border-bottom pb-2 mb-3">
                                        <RefreshCcw size={16} className="me-2" />
                                        Refund Details
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Payee Name <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="payee_name"
                                                value={formData.payee_name}
                                                onChange={handleInputChange}
                                                placeholder="Student/Parent name"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                Amount <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text">KES</span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="amount"
                                                    value={formData.amount}
                                                    onChange={handleInputChange}
                                                    step="0.01"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">
                                                Refund Reason <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                name="refund_reason"
                                                rows="2"
                                                value={formData.refund_reason}
                                                onChange={handleInputChange}
                                                placeholder="Reason for refund..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description & Notes */}
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        rows="2"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                                Back
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Voucher'
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
                }
                .modal-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-body {
                    padding: 1.5rem;
                }
                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e9ecef;
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
};

export default CreatePaymentVoucherModal;
