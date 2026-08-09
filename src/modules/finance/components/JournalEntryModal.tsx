import React, { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Trash2,
    Link,
    Upload,
    CheckCircle2,
    AlertCircle,
    Building2,
    Smartphone,
    Users,
    TrendingDown,
    Save
} from 'lucide-react';
import { financeService } from '../../../services/financeService';
import { toast } from 'react-toastify';

const JournalEntryModal = ({ show, onClose, onSave }) => { // Added onSave prop
    const [lines, setLines] = useState([
        { account: '', debit: '', credit: '', description: '' }, // Changed notes to description to match backend
        { account: '', debit: '', credit: '', description: '' }
    ]);
    const [header, setHeader] = useState({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: ''
    });

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    // Allow small float diffs or strict? strict for now.
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

    useEffect(() => {
        if (show) {
            loadAccounts();
        }
    }, [show]);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await financeService.getAccounts();
            // api.js returns the body directly.
            const data = Array.isArray(res) ? res : (res.results || []);
            setAccounts(data);
        } catch (err) {
            console.error("Failed to load accounts", err);
            // toast.error?
        } finally {
            setLoading(false);
        }
    };

    const addLine = () => setLines([...lines, { account: '', debit: '', credit: '', description: '' }]);
    const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

    const updateLine = (idx, field, value) => {
        const newLines = [...lines];
        newLines[idx][field] = value;
        setLines(newLines);
    };

    const handleHeaderChange = (e) => {
        const { name, value } = e.target;
        setHeader(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!isBalanced) return;
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                date: header.date,
                description: header.description,
                reference: header.reference,
                journal_type: 'GENERAL', // Default
                lines: lines.map(line => ({
                    account: line.account,
                    debit: parseFloat(line.debit) || 0,
                    credit: parseFloat(line.credit) || 0,
                    description: line.description || header.description // Fallback to header desc
                }))
            };

            await financeService.createJournal(payload);
            toast.success("Journal Entry Draft Saved!");
            onSave(); // Notify parent
            onClose();
            // Reset form
            setLines([
                { account: '', debit: '', credit: '', description: '' },
                { account: '', debit: '', credit: '', description: '' }
            ]);
            setHeader({ date: new Date().toISOString().split('T')[0], reference: '', description: '' });

        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || JSON.stringify(err.response?.data) || "Failed to create journal.";
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(208, 207, 207, 0.5)', zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                    <div className="modal-header bg-dark text-white border-0 py-3 px-4">
                        <div className="d-flex align-items-center gap-2">
                            <Save size={20} className="text-primary" />
                            <h5 className="modal-title fw-bold">Manual Journal Entry</h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {/* Header Inputs */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">Journal Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="date"
                                    value={header.date}
                                    onChange={handleHeaderChange}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted">Reference / Voucher No</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. JV/001/2026"
                                    name="reference"
                                    value={header.reference}
                                    onChange={handleHeaderChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted">Description</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Brief explanation of the entry..."
                                    name="description"
                                    value={header.description}
                                    onChange={handleHeaderChange}
                                />
                            </div>
                        </div>

                        {/* Templates Quick Bar - Hidden for now or implement later */}
                        {/* ... */}

                        {/* Line Items Table */}
                        <div className="table-responsive border rounded-3 overflow-hidden shadow-sm">
                            <table className="table jr-line-item-table mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th style={{ width: '40%' }}>Chart of Account</th>
                                        <th className="text-end" style={{ width: '15%' }}>Debit (KES)</th>
                                        <th className="text-end" style={{ width: '15%' }}>Credit (KES)</th>
                                        <th style={{ width: '25%' }}>Line Description</th>
                                        <th style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, idx) => (
                                        <tr key={idx} className="border-bottom">
                                            <td className="p-0 ps-2">
                                                <select
                                                    className="form-select border-0 shadow-none bg-transparent"
                                                    value={line.account}
                                                    onChange={(e) => updateLine(idx, 'account', e.target.value)}
                                                >
                                                    <option value="">Select Account...</option>
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.id}>
                                                            {acc.code} - {acc.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-0">
                                                <input
                                                    type="number"
                                                    className="jr-line-item-input text-end fw-bold"
                                                    placeholder="0.00"
                                                    value={line.debit}
                                                    onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-0 text-danger">
                                                <input
                                                    type="number"
                                                    className="jr-line-item-input text-end fw-bold"
                                                    placeholder="0.00"
                                                    value={line.credit}
                                                    onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-0">
                                                <input
                                                    type="text"
                                                    className="jr-line-item-input text-muted small"
                                                    placeholder="Reason for line..."
                                                    value={line.description}
                                                    onChange={(e) => updateLine(idx, 'description', e.target.value)}
                                                />
                                            </td>
                                            <td className="text-center">
                                                {lines.length > 2 && (
                                                    <button className="btn btn-sm text-danger p-0" onClick={() => removeLine(idx)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-2 bg-light">
                                <button className="btn btn-sm btn-link text-primary d-flex align-items-center gap-1 p-0 fw-bold" onClick={addLine}>
                                    <Plus size={16} /> Add Line Item
                                </button>
                            </div>
                        </div>

                        {/* Balance Checker */}
                        <div className="jr-balance-summary d-flex justify-content-between align-items-center">
                            <div className="d-flex gap-4">
                                <div>
                                    <div className="x-small text-muted fw-bold">TOTAL DEBIT</div>
                                    <div className="h5 fw-bold mb-0 text-primary">{totalDebit.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="x-small text-muted fw-bold">TOTAL CREDIT</div>
                                    <div className="h5 fw-bold mb-0 text-danger">{totalCredit.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className={`jr-balance-indicator d-flex align-items-center gap-2 ${isBalanced ? 'indicator-matched' : 'indicator-unmatched'}`}>
                                {isBalanced ? (
                                    <>
                                        <CheckCircle2 size={18} />
                                        <span>Journal Balanced</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={18} />
                                        <span>Difference: {(totalDebit - totalCredit).toLocaleString()}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-0 p-4 pt-0">
                        <button className="btn btn-outline-secondary btn-sm px-4" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button
                            className={`btn btn-primary btn-sm px-4 shadow-sm d-flex align-items-center gap-2 ${(!isBalanced || submitting) ? 'disabled opacity-50' : ''}`}
                            onClick={handleSubmit}
                            disabled={!isBalanced || submitting}
                        >
                            <Save size={16} /> {submitting ? 'Saving...' : 'Save Draft Journal'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JournalEntryModal;
