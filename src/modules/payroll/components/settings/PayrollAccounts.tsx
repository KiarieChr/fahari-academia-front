import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Edit2, Trash2, X, Save, Loader2,
    Wallet, CreditCard, Filter, ToggleLeft, ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { payrollService } from '../../../../services/payrollService';

const ACCOUNT_TYPES = [
    { value: 'earning', label: 'Earning' },
    { value: 'deduction', label: 'Deduction' },
];

const EARNING_CATEGORIES = [
    { value: 'basic', label: 'Basic Salary' },
    { value: 'allowance', label: 'Allowance' },
    { value: 'bonus', label: 'Bonus' },
    { value: 'overtime', label: 'Overtime' },
    { value: 'commission', label: 'Commission' },
    { value: 'arrears', label: 'Arrears' },
];

const DEDUCTION_CATEGORIES = [
    { value: 'statutory', label: 'Statutory' },
    { value: 'voluntary', label: 'Voluntary' },
    { value: 'loan', label: 'Loan Repayment' },
    { value: 'advance', label: 'Advance Recovery' },
    { value: 'penalty', label: 'Penalty' },
];

const EMPTY_FORM = {
    code: '',
    name: '',
    account_type: 'earning',
    category: 'basic',
    employee_gl_account: '',
    has_employer_contribution: false,
    employer_gl_account: '',
    used_for_paye: false,
    used_for_nhif_shif: false,
    used_for_pension: false,
    is_allowable_deduction: false,
    used_for_housing_levy: false,
    is_mandatory: false,
    description: '',
    is_active: true,
    sort_order: 0,
};

const PayrollAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [glAccounts, setGlAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await payrollService.getPayrollAccounts();
            setAccounts(Array.isArray(data) ? data : data.results || []);
        } catch {
            toast.error('Failed to load payroll accounts');
        }
        try {
            const gl = await payrollService.getGLAccounts();
            setGlAccounts(Array.isArray(gl) ? gl : gl.results || []);
        } catch {
            // GL accounts may not be configured yet
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const categories = form.account_type === 'earning' ? EARNING_CATEGORIES : DEDUCTION_CATEGORIES;

    const filtered = accounts.filter(a => {
        const matchesSearch =
            a.code.toLowerCase().includes(search.toLowerCase()) ||
            a.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || a.account_type === filterType;
        return matchesSearch && matchesType;
    });

    const earnings = filtered.filter(a => a.account_type === 'earning');
    const deductions = filtered.filter(a => a.account_type === 'deduction');

    const openCreate = () => {
        setEditing(null);
        setForm({ ...EMPTY_FORM });
        setShowModal(true);
    };

    const openEdit = (account) => {
        setEditing(account);
        setForm({
            code: account.code,
            name: account.name,
            account_type: account.account_type,
            category: account.category,
            employee_gl_account: account.employee_gl_account || '',
            has_employer_contribution: account.has_employer_contribution,
            employer_gl_account: account.employer_gl_account || '',
            used_for_paye: account.used_for_paye,
            used_for_nhif_shif: account.used_for_nhif_shif,
            used_for_pension: account.used_for_pension,
            is_allowable_deduction: account.is_allowable_deduction,
            used_for_housing_levy: account.used_for_housing_levy,
            is_mandatory: account.is_mandatory,
            description: account.description || '',
            is_active: account.is_active,
            sort_order: account.sort_order || 0,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.code || !form.name) {
            toast.error('Code and name are required');
            return;
        }
        if (!form.employee_gl_account) {
            toast.error('Employee GL account is required');
            return;
        }
        if (form.has_employer_contribution && !form.employer_gl_account) {
            toast.error('Employer GL account is required when employer contribution is enabled');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                sort_order: parseInt(form.sort_order) || 0,
                employer_gl_account: form.has_employer_contribution ? form.employer_gl_account : null,
            };
            if (editing) {
                await payrollService.updatePayrollAccount(editing.id, payload);
                toast.success('Account updated');
            } else {
                await payrollService.createPayrollAccount(payload);
                toast.success('Account created');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const detail = error?.data;
            const msg = typeof detail === 'object' ? Object.values(detail).flat().join(', ') : (error.message || 'Failed to save account');
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this payroll account?')) return;
        try {
            await payrollService.deletePayrollAccount(id);
            toast.success('Account deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete account');
        }
    };

    const renderAccountTable = (items, title, icon, color) => (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 ${color} rounded-lg`}>{icon}</div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{title}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{items.length}</span>
                </div>
            </div>
            {items.length === 0 ? (
                <div className="px-5 py-8 text-center">
                    <p className="text-sm text-gray-400">No {title.toLowerCase()} configured</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Code</th>
                                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Name</th>
                                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Category</th>
                                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">GL Account</th>
                                <th className="text-center px-5 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {items.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{a.code}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div>
                                            <p className="font-medium text-gray-800">{a.name}</p>
                                            {a.is_mandatory && (
                                                <span className="text-[10px] text-amber-600 font-medium">Mandatory</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs text-gray-500">{a.category_display}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs text-gray-500">
                                            {a.employee_gl_account_detail
                                                ? `${a.employee_gl_account_detail.code} - ${a.employee_gl_account_detail.name}`
                                                : '-'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${a.is_active
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {a.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEdit(a)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const BoolToggle = ({ label, value, onChange, hint }) => (
        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!value)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </label>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Payroll Accounts</h2>
                    <p className="text-sm text-gray-500">Manage earning and deduction accounts with GL mapping</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm"
                >
                    <Plus size={16} />
                    Add Account
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search accounts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    />
                </div>
                <div className="flex gap-1.5">
                    {[{ value: 'all', label: 'All' }, ...ACCOUNT_TYPES].map(t => (
                        <button
                            key={t.value}
                            onClick={() => setFilterType(t.value)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${filterType === t.value
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center">
                    <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                    <p className="text-sm text-gray-400 mt-2">Loading accounts...</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {(filterType === 'all' || filterType === 'earning') &&
                        renderAccountTable(earnings, 'Earnings', <Wallet size={16} className="text-green-600" />, 'bg-green-50')}
                    {(filterType === 'all' || filterType === 'deduction') &&
                        renderAccountTable(deductions, 'Deductions', <CreditCard size={16} className="text-red-600" />, 'bg-red-50')}
                </div>
            )}

            {/* Create / Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {editing ? 'Edit Account' : 'New Payroll Account'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                {/* Basic Info */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Code *</label>
                                            <input
                                                type="text"
                                                value={form.code}
                                                onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                                                placeholder="e.g., BASIC_SAL"
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                                placeholder="e.g., Basic Salary"
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
                                            <select
                                                value={form.account_type}
                                                onChange={e => setForm(p => ({ ...p, account_type: e.target.value, category: e.target.value === 'earning' ? 'basic' : 'statutory' }))}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                                            >
                                                {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                                            <select
                                                value={form.category}
                                                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                                            >
                                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* GL Accounts */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">GL Account Mapping</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee GL Account *</label>
                                            <select
                                                value={form.employee_gl_account}
                                                onChange={e => setForm(p => ({ ...p, employee_gl_account: e.target.value }))}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                                            >
                                                <option value="">Select GL Account...</option>
                                                {glAccounts.map(gl => (
                                                    <option key={gl.id} value={gl.id}>{gl.code} - {gl.name}</option>
                                                ))}
                                            </select>
                                            {glAccounts.length === 0 && (
                                                <p className="text-[11px] text-amber-500 mt-1">No GL accounts marked as available for payroll. Update your Chart of Accounts first.</p>
                                            )}
                                        </div>

                                        <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={form.has_employer_contribution}
                                                onChange={e => setForm(p => ({ ...p, has_employer_contribution: e.target.checked }))}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Has Employer Contribution</p>
                                                <p className="text-[11px] text-gray-400">e.g., NSSF employer portion, pension employer match</p>
                                            </div>
                                        </label>

                                        {form.has_employer_contribution && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Employer GL Account *</label>
                                                <select
                                                    value={form.employer_gl_account}
                                                    onChange={e => setForm(p => ({ ...p, employer_gl_account: e.target.value }))}
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                                                >
                                                    <option value="">Select GL Account...</option>
                                                    {glAccounts.map(gl => (
                                                        <option key={gl.id} value={gl.id}>{gl.code} - {gl.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Behaviour Flags */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        {form.account_type === 'earning' ? 'Earning Behaviour' : 'Deduction Behaviour'}
                                    </h4>
                                    <div className="space-y-2">
                                        {form.account_type === 'earning' ? (
                                            <>
                                                <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <input type="checkbox" checked={form.used_for_paye} onChange={e => setForm(p => ({ ...p, used_for_paye: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <div><p className="text-sm font-medium text-gray-700">Taxable (PAYE)</p><p className="text-[11px] text-gray-400">Include in PAYE taxable income</p></div>
                                                </label>
                                                <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <input type="checkbox" checked={form.used_for_nhif_shif} onChange={e => setForm(p => ({ ...p, used_for_nhif_shif: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <div><p className="text-sm font-medium text-gray-700">NHIF/SHIF Base</p><p className="text-[11px] text-gray-400">Include in SHIF contribution base</p></div>
                                                </label>
                                                <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <input type="checkbox" checked={form.used_for_pension} onChange={e => setForm(p => ({ ...p, used_for_pension: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <div><p className="text-sm font-medium text-gray-700">Pensionable</p><p className="text-[11px] text-gray-400">Include in NSSF/pension contribution base</p></div>
                                                </label>
                                            </>
                                        ) : (
                                            <>
                                                <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <input type="checkbox" checked={form.is_allowable_deduction} onChange={e => setForm(p => ({ ...p, is_allowable_deduction: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <div><p className="text-sm font-medium text-gray-700">Tax Allowable</p><p className="text-[11px] text-gray-400">Reduces taxable income before PAYE</p></div>
                                                </label>
                                                <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                    <input type="checkbox" checked={form.used_for_housing_levy} onChange={e => setForm(p => ({ ...p, used_for_housing_levy: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <div><p className="text-sm font-medium text-gray-700">Housing Levy</p><p className="text-[11px] text-gray-400">This is the housing levy deduction</p></div>
                                                </label>
                                            </>
                                        )}
                                        <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input type="checkbox" checked={form.is_mandatory} onChange={e => setForm(p => ({ ...p, is_mandatory: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <div><p className="text-sm font-medium text-gray-700">Mandatory</p><p className="text-[11px] text-gray-400">Auto-applied to all eligible employees</p></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Description & Status */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                        <textarea
                                            value={form.description}
                                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                            rows={2}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                                            placeholder="Optional description..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                                        <input
                                            type="number"
                                            value={form.sort_order}
                                            onChange={e => setForm(p => ({ ...p, sort_order: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.is_active}
                                                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-all text-sm font-medium shadow-sm"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PayrollAccounts;
