/**
 * Unified Supplier Invoice / AP Bill Modal
 * 
 * Features:
 *  - Searchable GL account dropdown with type-ahead
 *  - GL account suggestions appear as you type the description
 *  - VAT handling (0%, 8%, 16%)
 *  - Qty × Unit Price line items
 *  - File attachment support
 *  - Auto due-date from supplier payment terms
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, AlertCircle, Save, FileText, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { financeService } from '../../../../services/financeService';
import { formatKES, EXPENSE_ACCOUNT_KEYWORDS, VAT_RATES } from '../utils/formatters';

const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ─── Searchable GL Account Picker ────────────────────────────────────────────
const GLAccountPicker = ({ accounts, value, onChange, placeholder = 'Search accounts...', suggestedIds = [] }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    const selectedAccount = accounts.find(a => String(a.id) === String(value));

    useEffect(() => {
        const handleClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filtered = accounts.filter(acc => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            acc.name?.toLowerCase().includes(q) ||
            acc.code?.toLowerCase().includes(q) ||
            acc.sub_type?.toLowerCase().replace(/_/g, ' ').includes(q)
        );
    });

    // Split into suggested (top) and rest
    const suggested = suggestedIds.length > 0
        ? filtered.filter(a => suggestedIds.includes(a.id))
        : [];
    const rest = suggestedIds.length > 0
        ? filtered.filter(a => !suggestedIds.includes(a.id))
        : filtered;

    // Group the rest by type
    const grouped = rest.reduce((g, acc) => {
        const t = acc.type || 'OTHER';
        if (!g[t]) g[t] = [];
        g[t].push(acc);
        return g;
    }, {});
    const typeLabels = { EXPENSE: 'Expense Accounts', LIABILITY: 'Liability Accounts', ASSET: 'Asset Accounts' };

    const handleSelect = (acc) => {
        onChange(String(acc.id));
        setSearch('');
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
        setSearch('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <button
                type="button"
                className={`form-select form-select-sm text-start ${!value ? 'text-muted' : ''}`}
                onClick={handleOpen}
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '2rem' }}
            >
                {selectedAccount ? `${selectedAccount.code} - ${selectedAccount.name}` : placeholder}
            </button>

            {open && (
                <div className="border rounded shadow-lg bg-white"
                    style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1080, maxHeight: '280px', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="p-2 border-bottom" style={{ flexShrink: 0 }}>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white border-end-0"><Search size={14} className="text-muted" /></span>
                            <input ref={inputRef} type="text" className="form-control form-control-sm border-start-0"
                                placeholder="Type to search accounts..." value={search}
                                onChange={(e) => setSearch(e.target.value)} autoFocus />
                        </div>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {filtered.length === 0 ? (
                            <div className="text-muted text-center py-3 small">No accounts found</div>
                        ) : (
                            <>
                                {suggested.length > 0 && (
                                    <div>
                                        <div className="px-3 py-1 bg-success bg-opacity-10 text-success small fw-bold" style={{ fontSize: '0.7rem' }}>
                                            ★ Suggested from description
                                        </div>
                                        {suggested.map(acc => (
                                            <button key={acc.id} type="button"
                                                className={`dropdown-item px-3 py-1 d-flex justify-content-between align-items-center ${String(acc.id) === String(value) ? 'active' : ''}`}
                                                onClick={() => handleSelect(acc)} style={{ fontSize: '0.85rem' }}>
                                                <span><span className="fw-bold text-success me-1" style={{ fontSize: '0.75rem' }}>{acc.code}</span>{acc.name}</span>
                                                <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '0.65rem' }}>{acc.type}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {Object.entries(grouped).map(([type, accs]) => (
                                    <div key={type}>
                                        <div className="px-3 py-1 bg-light text-muted small fw-bold sticky-top" style={{ fontSize: '0.7rem' }}>
                                            {typeLabels[type] || type}
                                        </div>
                                        {accs.map(acc => (
                                            <button key={acc.id} type="button"
                                                className={`dropdown-item px-3 py-1 d-flex justify-content-between align-items-center ${String(acc.id) === String(value) ? 'active' : ''}`}
                                                onClick={() => handleSelect(acc)} style={{ fontSize: '0.85rem' }}>
                                                <span><span className="fw-bold text-primary me-1" style={{ fontSize: '0.75rem' }}>{acc.code}</span>{acc.name}</span>
                                                <span className="badge bg-light text-muted" style={{ fontSize: '0.65rem' }}>{acc.sub_type?.replace(/_/g, ' ')}</span>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Description Input with GL Suggestion Chips ──────────────────────────────
const DescriptionInput = ({ value, onChange, accounts, onSelectSuggestion, currentAccount }) => {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (!value || value.length < 2 || !accounts.length) {
            setSuggestions([]);
            return;
        }
        const descLower = value.toLowerCase();
        const matchedIds = new Set();

        // Direct name match on accounts
        accounts.forEach(acc => {
            if (acc.name?.toLowerCase().includes(descLower) || descLower.includes(acc.name?.toLowerCase().split(' ')[0])) {
                matchedIds.add(acc.id);
            }
        });

        // Keyword-based match
        for (const [keyword, relatedTerms] of Object.entries(EXPENSE_ACCOUNT_KEYWORDS)) {
            if (descLower.includes(keyword)) {
                for (const term of relatedTerms) {
                    const match = accounts.find(acc =>
                        acc.name?.toLowerCase().includes(term) ||
                        acc.code?.toLowerCase().includes(term)
                    );
                    if (match) matchedIds.add(match.id);
                }
            }
        }

        // Remove current selection from suggestions
        if (currentAccount) matchedIds.delete(Number(currentAccount));

        const matched = accounts.filter(a => matchedIds.has(a.id)).slice(0, 4);
        setSuggestions(matched);
    }, [value, accounts, currentAccount]);

    return (
        <div>
            <input
                type="text"
                className="form-control form-control-sm"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. Office stationery, internet..."
                required
            />
            {suggestions.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mt-1">
                    {suggestions.map(acc => (
                        <button
                            key={acc.id}
                            type="button"
                            className="badge bg-primary bg-opacity-10 text-primary border-0 d-flex align-items-center gap-1"
                            style={{ fontSize: '0.65rem', cursor: 'pointer', padding: '2px 6px' }}
                            onClick={() => onSelectSuggestion(acc.id)}
                            title={`Set GL: ${acc.code} - ${acc.name}`}
                        >
                            → {acc.code} {acc.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────
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
        if (show) loadData();
    }, [show]);

    // Auto-calculate due date from supplier payment terms
    useEffect(() => {
        if (formData.supplier && formData.invoice_date) {
            const supplier = suppliers.find(s => String(s.id) === String(formData.supplier));
            if (supplier) {
                try {
                    const dueDate = new Date(formData.invoice_date);
                    if (!isNaN(dueDate.getTime())) {
                        dueDate.setDate(dueDate.getDate() + (supplier.payment_terms || 30));
                        setFormData(prev => ({
                            ...prev,
                            due_date: `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`
                        }));
                    }
                } catch (e) { /* ignore */ }
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

            const allAccounts = Array.isArray(accountsRes) ? accountsRes : (accountsRes?.results || []);
            setAccounts(allAccounts.filter(acc => acc.type === 'EXPENSE' || acc.type === 'LIABILITY'));
        } catch (err) {
            setError('Failed to load form data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Get suggested account IDs for a description (used by GLAccountPicker)
    const getSuggestedAccountIds = useCallback((description) => {
        if (!description || !accounts.length) return [];
        const descLower = description.toLowerCase();
        const ids = new Set();

        // Direct name match
        accounts.forEach(acc => {
            if (acc.name?.toLowerCase().includes(descLower) || descLower.includes(acc.name?.toLowerCase().split(' ')[0])) {
                ids.add(acc.id);
            }
        });

        // Keyword match
        for (const [keyword, relatedTerms] of Object.entries(EXPENSE_ACCOUNT_KEYWORDS)) {
            if (descLower.includes(keyword)) {
                for (const term of relatedTerms) {
                    const match = accounts.find(a =>
                        a.name?.toLowerCase().includes(term) || a.code?.toLowerCase().includes(term)
                    );
                    if (match) ids.add(match.id);
                }
            }
        }
        return [...ids];
    }, [accounts]);

    const handleLineChange = (index, field, value) => {
        setLines(prev => prev.map((line, i) => {
            if (i !== index) return line;
            const updated = { ...line, [field]: value };

            // Auto-set GL account on first description typed if no account selected
            if (field === 'description' && value && !line.gl_account) {
                const ids = getSuggestedAccountIds(value);
                if (ids.length > 0) updated.gl_account = ids[0];
            }
            return updated;
        }));
    };

    const handleSuggestionSelect = (index, accountId) => {
        setLines(prev => prev.map((line, i) =>
            i === index ? { ...line, gl_account: accountId } : line
        ));
    };

    const addLine = () => {
        setLines(prev => [...prev, { description: '', quantity: 1, unit_price: '', gl_account: '', vat_rate: 16 }]);
    };

    const removeLine = (index) => {
        if (lines.length === 1) return;
        setLines(prev => prev.filter((_, i) => i !== index));
    };

    const calcAmount = (line) => (parseFloat(line.quantity) || 0) * (parseFloat(line.unit_price) || 0);
    const calcVAT = (line) => calcAmount(line) * ((parseFloat(line.vat_rate) || 0) / 100);

    const totals = (() => {
        let subtotal = 0, vatTotal = 0;
        lines.forEach(l => { subtotal += calcAmount(l); vatTotal += calcVAT(l); });
        return { subtotal, vatTotal, total: subtotal + vatTotal };
    })();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const validLines = lines.filter(l => l.description && l.unit_price && l.gl_account);
            if (validLines.length === 0) throw new Error('At least one complete line item is required');

            const lineData = validLines.map(l => ({
                description: l.description,
                quantity: parseFloat(l.quantity) || 1,
                unit_price: parseFloat(l.unit_price),
                gl_account: parseInt(l.gl_account),
                vat_rate: parseFloat(l.vat_rate) || 0
            }));

            let payload;
            if (attachment) {
                payload = new FormData();
                payload.append('supplier', formData.supplier);
                payload.append('invoice_number', formData.invoice_number);
                payload.append('invoice_date', formData.invoice_date);
                payload.append('due_date', formData.due_date);
                if (formData.purchase_order_ref) payload.append('purchase_order_ref', formData.purchase_order_ref);
                if (formData.notes) payload.append('notes', formData.notes);
                payload.append('attachment', attachment);
                payload.append('lines', JSON.stringify(lineData));
            } else {
                payload = { ...formData, lines: lineData };
            }

            await financeService.createSupplierInvoice(payload);
            toast.success('Supplier invoice created successfully');
            onCreated();
        } catch (err) {
            // Extract meaningful error message from DRF validation errors
            let errorMsg = err.data?.error || err.data?.detail;
            if (!errorMsg && err.data && typeof err.data === 'object') {
                // Flatten DRF field errors like {"lines": [{"gl_account": ["..."]}]}
                const msgs = [];
                for (const [field, val] of Object.entries(err.data)) {
                    if (Array.isArray(val)) {
                        val.forEach(v => typeof v === 'string' ? msgs.push(`${field}: ${v}`) : msgs.push(...Object.entries(v).map(([k, errs]) => `${k}: ${errs}`)));
                    } else if (typeof val === 'object') {
                        msgs.push(...Object.entries(val).map(([k, errs]) => `${k}: ${errs}`));
                    }
                }
                errorMsg = msgs.join('; ') || err.message || 'Failed to create invoice';
            }
            errorMsg = errorMsg || err.message || 'Failed to create invoice';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return createPortal(
        <div className="sinv-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="sinv-container" style={{ maxWidth: '1100px', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="sinv-header">
                    <div>
                        <h5 className="mb-0">New Supplier Invoice</h5>
                        <small className="text-muted">Record a supplier invoice / AP bill for GL posting</small>
                    </div>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}><X size={18} /></button>
                </div>

                {error && (
                    <div className="alert alert-danger m-3 mb-0 d-flex align-items-center gap-2">
                        <AlertCircle size={16} /> {error}
                        <button className="btn-close ms-auto" onClick={() => setError(null)}></button>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="sinv-body">
                            {/* Header Fields */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">Supplier <span className="text-danger">*</span></label>
                                    <select className="form-select" name="supplier" value={formData.supplier} onChange={handleInputChange} required>
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">PO Reference</label>
                                    <input type="text" className="form-control" name="purchase_order_ref" value={formData.purchase_order_ref} onChange={handleInputChange} placeholder="PO-XXXX" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">Invoice # <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" name="invoice_number" value={formData.invoice_number} onChange={handleInputChange} placeholder="From supplier's document" required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">Invoice Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" name="invoice_date" value={formData.invoice_date} onChange={handleInputChange} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold small">Due Date <span className="text-danger">*</span></label>
                                    <input type="date" className="form-control" name="due_date" value={formData.due_date} onChange={handleInputChange} required />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="mb-0 fw-bold">Line Items / Vote Heads</h6>
                                    <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" onClick={addLine}>
                                        <Plus size={14} /> Add Line
                                    </button>
                                </div>

                                <div className="table-responsive" style={{ overflowX: 'auto', overflow: 'visible' }}>
                                    <table className="table table-bordered mb-0" style={{ minWidth: '950px' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ minWidth: '200px' }}>Description</th>
                                                <th style={{ minWidth: '200px' }}>GL Account / Vote Head</th>
                                                <th style={{ minWidth: '120px', width: '120px' }}>Qty</th>
                                                <th style={{ minWidth: '120px', width: '120px' }}>Unit Price</th>
                                                <th style={{ minWidth: '100px', width: '100px' }}>VAT</th>
                                                <th style={{ minWidth: '110px', width: '110px' }}>Amount</th>
                                                <th style={{ width: '30px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lines.map((line, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ overflow: 'visible' }}>
                                                        <DescriptionInput
                                                            value={line.description}
                                                            onChange={(val) => handleLineChange(idx, 'description', val)}
                                                            accounts={accounts}
                                                            onSelectSuggestion={(accId) => handleSuggestionSelect(idx, accId)}
                                                            currentAccount={line.gl_account}
                                                        />
                                                    </td>
                                                    <td style={{ overflow: 'visible' }}>
                                                        <GLAccountPicker
                                                            accounts={accounts}
                                                            value={line.gl_account}
                                                            onChange={(val) => handleLineChange(idx, 'gl_account', val)}
                                                            placeholder="Search account..."
                                                            suggestedIds={getSuggestedAccountIds(line.description)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control form-control-sm"
                                                            value={line.quantity} onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                                                            min="0.01" step="0.01" style={{ minWidth: '80px' }} />
                                                    </td>
                                                    <td>
                                                        <input type="number" className="form-control form-control-sm"
                                                            value={line.unit_price} onChange={(e) => handleLineChange(idx, 'unit_price', e.target.value)}
                                                            min="0" step="0.01" placeholder="0.00" required />
                                                    </td>
                                                    <td>
                                                        <select className="form-select form-select-sm" value={line.vat_rate}
                                                            onChange={(e) => handleLineChange(idx, 'vat_rate', e.target.value)}>
                                                            {VAT_RATES.map(r => (
                                                                <option key={r.value} value={r.value}>{r.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="text-end font-monospace align-middle small">
                                                        {formatKES(calcAmount(line) + calcVAT(line))}
                                                    </td>
                                                    <td className="text-center">
                                                        <button type="button" className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeLine(idx)} disabled={lines.length === 1}>
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
                                <div className="col-md-5">
                                    <div className="card border-0 shadow-sm bg-warning bg-opacity-10">
                                        <div className="card-body p-3">
                                            <div className="d-flex justify-content-between mb-1 small">
                                                <span>Subtotal:</span>
                                                <span className="font-monospace fw-semibold">{formatKES(totals.subtotal)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-1 small">
                                                <span>VAT:</span>
                                                <span className="font-monospace fw-semibold">{formatKES(totals.vatTotal)}</span>
                                            </div>
                                            <hr className="my-1" />
                                            <div className="d-flex justify-content-between">
                                                <span className="fw-bold">Total Payable:</span>
                                                <span className="font-monospace fw-bold">{formatKES(totals.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attachment + Notes */}
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">Attachment</label>
                                    <div className="input-group input-group-sm">
                                        <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAttachment(e.target.files[0])} />
                                        {attachment && (
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setAttachment(null)}><X size={14} /></button>
                                        )}
                                    </div>
                                    {attachment && (
                                        <small className="text-muted d-flex align-items-center gap-1 mt-1"><FileText size={14} /> {attachment.name}</small>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small">Notes</label>
                                    <textarea className="form-control" name="notes" rows="2" value={formData.notes} onChange={handleInputChange} placeholder="Additional notes..." />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sinv-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={saving}>
                                {saving ? <><span className="spinner-border spinner-border-sm"></span> Saving...</> : <><Save size={16} /> Create Invoice</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <style>{`
                .sinv-backdrop {
                    position: fixed; inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 1050; padding: 1rem;
                }
                .sinv-container {
                    background: white; border-radius: 12px; width: 100%;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    display: flex; flex-direction: column;
                }
                .sinv-header {
                    padding: 1rem 1.5rem; border-bottom: 1px solid #e9ecef;
                    display: flex; justify-content: space-between; align-items: center;
                    flex-shrink: 0;
                }
                .sinv-body {
                    padding: 1.5rem; overflow-y: auto; flex: 1;
                    max-height: calc(90vh - 140px);
                }
                .sinv-footer {
                    padding: 1rem 1.5rem; border-top: 1px solid #e9ecef;
                    display: flex; justify-content: flex-end; gap: 0.5rem;
                    flex-shrink: 0;
                }
                .table-responsive { border: 1px solid #dee2e6; border-radius: 6px; }
            `}</style>
        </div>,
        document.body
    );
};

export default CreateSupplierInvoiceModal;
