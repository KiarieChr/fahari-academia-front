import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, ShoppingBag, Calendar, DollarSign, FileText } from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import { formatKES } from '../utils/formatters';

const CreateVendorBillModal = ({ show, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [expenseAccounts, setExpenseAccounts] = useState([]);

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
        }
    }, [show]);

    const loadDependencies = async () => {
        try {
            const [vendRes, accRes] = await Promise.all([
                financeService.getVendors(),
                financeService.getAccounts() // We need to filter for Expense/Asset accounts
            ]);

            setVendors(vendRes.data.results || vendRes.data || []);

            // Filter for EXPENSE or ASSET accounts
            const allAccounts = accRes.data.results || accRes.data || [];
            const expAccs = allAccounts.filter(acc => ['EXPENSE', 'ASSET'].includes(acc.type));
            setExpenseAccounts(expAccs);

        } catch (error) {
            console.error("Failed to load dependencies", error);
        }
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.lines];
        newLines[index][field] = value;
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
        if (formData.lines.some(l => !l.expense_account || !l.description || l.amount <= 0)) {
            return alert("Please complete all line items (Account, Description, Amount > 0)");
        }

        setLoading(true);
        try {
            await financeService.createBill(formData);
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to create bill", error);
            alert("Error: " + (error.response?.data?.detail || error.message));
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
