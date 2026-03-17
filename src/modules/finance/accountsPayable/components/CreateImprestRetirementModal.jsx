/**
 * Create Imprest Retirement Modal
 * 
 * Allows staff to retire an imprest by entering expense lines
 * with receipts and any cash surrender.
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Receipt, AlertCircle, Calculator, Upload } from 'lucide-react';
import { financeService } from '../../../../services/financeService';

const CreateImprestRetirementModal = ({ show, voucher, onClose, onCreated }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        retirement_date: new Date().toISOString().split('T')[0],
        surrender_amount: '0.00',
        notes: ''
    });

    const [lines, setLines] = useState([
        { description: '', amount: '', gl_account: '', receipt_number: '', receipt_date: '' }
    ]);

    useEffect(() => {
        if (show) {
            loadAccounts();
        }
    }, [show]);

    const loadAccounts = async () => {
        setLoading(true);
        try {
            const res = await financeService.getAccounts().catch(() => null);
            const allAccounts = res?.results || res || [];
            // Filter for expense accounts
            const expenseAccounts = allAccounts.filter(acc =>
                acc.type === 'EXPENSE'
            );
            setAccounts(expenseAccounts);
        } catch (err) {
            console.error('Failed to load accounts:', err);
            setError('Failed to load expense accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineChange = (index, field, value) => {
        setLines(prev => prev.map((line, i) =>
            i === index ? { ...line, [field]: value } : line
        ));
    };

    const addLine = () => {
        setLines(prev => [...prev, {
            description: '',
            amount: '',
            gl_account: '',
            receipt_number: '',
            receipt_date: ''
        }]);
    };

    const removeLine = (index) => {
        if (lines.length === 1) return;
        setLines(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotalRetired = () => {
        return lines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
    };

    const calculateBalance = () => {
        const originalAmount = parseFloat(voucher?.amount || 0);
        const totalRetired = calculateTotalRetired();
        const surrenderAmount = parseFloat(formData.surrender_amount) || 0;
        return originalAmount - totalRetired - surrenderAmount;
    };

    const isBalanced = () => {
        return Math.abs(calculateBalance()) < 0.01;
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

        // Validate balance
        if (!isBalanced()) {
            setError('Retirement does not balance. Total expenses + surrender must equal the original imprest amount.');
            return;
        }

        // Validate lines
        const validLines = lines.filter(l => l.description && l.amount && l.gl_account);
        if (validLines.length === 0 && parseFloat(formData.surrender_amount) !== parseFloat(voucher.amount)) {
            setError('Please add expense lines or surrender the full amount');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                voucher: voucher.id,
                retirement_date: formData.retirement_date,
                surrender_amount: parseFloat(formData.surrender_amount) || 0,
                notes: formData.notes,
                lines: validLines.map(l => ({
                    description: l.description,
                    amount: parseFloat(l.amount),
                    gl_account: parseInt(l.gl_account),
                    receipt_number: l.receipt_number || null,
                    receipt_date: l.receipt_date || null
                }))
            };

            await financeService.createImprestRetirement(payload);
            onCreated();
        } catch (err) {
            console.error('Failed to create retirement:', err);
            setError(err.response?.data?.error || err.message || 'Failed to submit retirement');
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    const balance = calculateBalance();
    const totalRetired = calculateTotalRetired();
    const originalAmount = parseFloat(voucher?.amount || 0);

    return (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container" style={{ maxWidth: '900px', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h5 className="mb-1">Retire Imprest</h5>
                        <small className="text-muted">
                            Voucher: {voucher?.voucher_number} | Staff: {voucher?.staff_member_name || voucher?.payee_display}
                        </small>
                    </div>
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
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
                            {/* Imprest Summary */}
                            <div className="card bg-primary-subtle border-0 mb-4">
                                <div className="card-body">
                                    <div className="row text-center">
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Original Imprest</small>
                                            <strong className="h5 text-primary">{formatCurrency(originalAmount)}</strong>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Total Expenses</small>
                                            <strong className="h5">{formatCurrency(totalRetired)}</strong>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Balance to Account</small>
                                            <strong className={`h5 ${isBalanced() ? 'text-success' : 'text-danger'}`}>
                                                {formatCurrency(balance)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Header Fields */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Retirement Date <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        name="retirement_date"
                                        value={formData.retirement_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Cash Surrender Amount
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">KES</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="surrender_amount"
                                            value={formData.surrender_amount}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <small className="text-muted">Amount being returned to cashier</small>
                                </div>
                            </div>

                            {/* Expense Lines */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">
                                        <Receipt size={16} className="me-2" />
                                        Expense Receipts
                                    </h6>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                        onClick={addLine}
                                    >
                                        <Plus size={14} /> Add Receipt
                                    </button>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '25%' }}>Description</th>
                                                <th style={{ width: '20%' }}>Expense Account</th>
                                                <th style={{ width: '15%' }}>Amount</th>
                                                <th style={{ width: '15%' }}>Receipt #</th>
                                                <th style={{ width: '15%' }}>Receipt Date</th>
                                                <th style={{ width: '10%' }}></th>
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
                                                            placeholder="e.g. Transport, Meals"
                                                        />
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={line.gl_account}
                                                            onChange={(e) => handleLineChange(index, 'gl_account', e.target.value)}
                                                        >
                                                            <option value="">Select Account</option>
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
                                                            value={line.amount}
                                                            onChange={(e) => handleLineChange(index, 'amount', e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={line.receipt_number}
                                                            onChange={(e) => handleLineChange(index, 'receipt_number', e.target.value)}
                                                            placeholder="Receipt #"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="date"
                                                            className="form-control form-control-sm"
                                                            value={line.receipt_date}
                                                            onChange={(e) => handleLineChange(index, 'receipt_date', e.target.value)}
                                                        />
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
                                        <tfoot>
                                            <tr className="table-light">
                                                <td colSpan="2" className="text-end fw-bold">Total Expenses:</td>
                                                <td className="font-monospace fw-bold">{formatCurrency(totalRetired)}</td>
                                                <td colSpan="3"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Balance Check */}
                            {!isBalanced() && (
                                <div className="alert alert-warning d-flex align-items-center gap-2">
                                    <Calculator size={16} />
                                    <span>
                                        <strong>Unbalanced:</strong> Expenses ({formatCurrency(totalRetired)}) +
                                        Surrender ({formatCurrency(parseFloat(formData.surrender_amount) || 0)}) =
                                        {formatCurrency(totalRetired + (parseFloat(formData.surrender_amount) || 0))}.
                                        Expected: {formatCurrency(originalAmount)}
                                    </span>
                                </div>
                            )}

                            {isBalanced() && totalRetired > 0 && (
                                <div className="alert alert-success d-flex align-items-center gap-2">
                                    <Calculator size={16} />
                                    <span>
                                        <strong>Balanced!</strong> Ready to submit retirement.
                                    </span>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="mb-3">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-control"
                                    name="notes"
                                    rows="2"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any additional notes about this retirement..."
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving || !isBalanced()}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Receipt size={14} className="me-2" />
                                        Submit Retirement
                                    </>
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

export default CreateImprestRetirementModal;
