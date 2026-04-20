import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import {
    Plus, Edit2, Trash2, X, Save, Loader2, Search,
    DollarSign, Users, Briefcase, TrendingDown, Eye, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { payrollService } from '../../services/payrollService';
import { api } from '../../services/api';

const TABS = [
    { key: 'overview', label: 'Overview', icon: Eye },
    { key: 'one-time', label: 'One-Time Deductions', icon: DollarSign },
    { key: 'group', label: 'Group Deductions', icon: Users },
    { key: 'employee', label: 'Employee Deductions', icon: Briefcase },
];

const CALC_METHOD_OPTIONS = [
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'percentage_of_gross', label: '% of Gross' },
    { value: 'percentage_of_basic', label: '% of Basic' },
];

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'processed', label: 'Processed' },
];

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-green-50 text-green-700 border-green-200',
        processed: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
            {status}
        </span>
    );
};

// ============================================================================
// OVERVIEW TAB
// ============================================================================
const OverviewTab = ({ employeeDeductions, groupDeductions }) => {
    const recurring = employeeDeductions.filter(d => d.is_recurring);
    const oneTime = employeeDeductions.filter(d => d.is_one_time);
    const loans = employeeDeductions.filter(d => d.max_deduction_amount);
    const totalEmployee = employeeDeductions.reduce((s, d) => s + parseFloat(d.amount || 0), 0);
    const totalGroup = groupDeductions.reduce((s, d) => s + parseFloat(d.amount || 0), 0);

    const cards = [
        { label: 'Total Employee Deductions', value: formatCurrency(totalEmployee), icon: DollarSign, color: 'red' },
        { label: 'Group Deductions', value: formatCurrency(totalGroup), icon: Users, color: 'emerald' },
        { label: 'Recurring', value: recurring.length, icon: TrendingDown, color: 'purple' },
        { label: 'Loans Active', value: loans.length, icon: Wallet, color: 'amber' },
    ];

    const colorMap = {
        red: 'bg-red-50 text-red-600 border-red-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">{c.label}</span>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colorMap[c.color]}`}>
                                <c.icon size={18} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Employee Deductions */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Recent Employee Deductions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">Account</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Method</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Effective</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employeeDeductions.slice(0, 10).map(d => (
                                <tr key={d.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{d.employee_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{d.payroll_account_name || d.deduction_type_name || '—'}</td>
                                    <td className="px-4 py-3">
                                        {d.is_one_time ? <span className="text-amber-600 text-xs font-medium">One-Time</span> :
                                            d.is_recurring ? <span className="text-blue-600 text-xs font-medium">Recurring</span> :
                                                <span className="text-gray-400 text-xs">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{d.calculation_method}</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(d.amount)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(d.effective_from)}</td>
                                </tr>
                            ))}
                            {employeeDeductions.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No employee deductions found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Group Deductions Summary */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Group Deductions by Grade</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Grade</th>
                                <th className="px-4 py-3 text-left">Account</th>
                                <th className="px-4 py-3 text-left">Method</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-left">Active</th>
                                <th className="px-4 py-3 text-left">Effective From</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {groupDeductions.slice(0, 10).map(g => (
                                <tr key={g.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{g.job_grade_code} - {g.job_grade_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{g.payroll_account_name}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{g.calculation_method}</td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {g.calculation_method !== 'fixed' && g.percentage ? `${g.percentage}%` : formatCurrency(g.amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium ${g.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                            {g.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(g.effective_from)}</td>
                                </tr>
                            ))}
                            {groupDeductions.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No group deductions found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ONE-TIME DEDUCTIONS TAB
// ============================================================================
const OneTimeTab = ({ deductions, accounts, employees, onRefresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        employee: '', payroll_account: '', amount: '', calculation_method: 'fixed',
        percentage: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '',
        reason: '', is_one_time: true, is_recurring: false,
    });

    const oneTimeDeductions = deductions.filter(d => d.is_one_time);
    const filtered = oneTimeDeductions.filter(d =>
        !search || (d.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.payroll_account_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditItem(null);
        setForm({
            employee: '', payroll_account: '', amount: '', calculation_method: 'fixed',
            percentage: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '',
            reason: '', is_one_time: true, is_recurring: false,
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            employee: item.employee, payroll_account: item.payroll_account || '',
            amount: item.amount, calculation_method: item.calculation_method || 'fixed',
            percentage: item.percentage || '', effective_from: item.effective_from || '',
            effective_to: item.effective_to || '', reason: item.reason || '',
            is_one_time: true, is_recurring: false,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.employee || !form.amount || !form.effective_from) {
            toast.error('Employee, amount and effective date are required');
            return;
        }
        setSaving(true);
        const payload = { ...form, effective_to: form.effective_to || null };
        try {
            if (editItem) {
                await payrollService.updateEmployeeDeduction(editItem.id, payload);
                toast.success('One-time deduction updated');
            } else {
                await payrollService.createEmployeeDeduction(payload);
                toast.success('One-time deduction created');
            }
            setShowModal(false);
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || error.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this one-time deduction?')) return;
        try {
            await payrollService.deleteEmployeeDeduction(id);
            toast.success('Deleted');
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search one-time deductions..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-72" />
                </div>
                <button onClick={openCreate} className="btn btn-primary d-flex align-items-center gap-2">
                    <Plus size={16} /> Add One-Time Deduction
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">Payroll Account</th>
                                <th className="px-4 py-3 text-left">Method</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Effective From</th>
                                <th className="px-4 py-3 text-left">Reason</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{d.employee_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{d.payroll_account_name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{d.calculation_method}</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(d.amount)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(d.effective_from)}</td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{d.reason || '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No one-time deductions</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{editItem ? 'Edit' : 'Add'} One-Time Deduction</h3>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                    <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_no})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Account</label>
                                    <select value={form.payroll_account} onChange={e => setForm({ ...form, payroll_account: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Account</option>
                                        {accounts.map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method</label>
                                        <select value={form.calculation_method} onChange={e => setForm({ ...form, calculation_method: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            {CALC_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                                        <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                {form.calculation_method !== 'fixed' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                                        <input type="number" step="0.01" value={form.percentage}
                                            onChange={e => setForm({ ...form, percentage: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                                        <input type="date" value={form.effective_from} onChange={e => setForm({ ...form, effective_from: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                                        <input type="date" value={form.effective_to} onChange={e => setForm({ ...form, effective_to: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                                        rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="btn btn-outline-secondary">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {editItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// GROUP DEDUCTIONS TAB
// ============================================================================
const GroupTab = ({ groupDeductions, accounts, jobGrades, onRefresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filterGrade, setFilterGrade] = useState('');
    const [form, setForm] = useState({
        job_grade: '', payroll_account: '', amount: '', calculation_method: 'fixed',
        percentage: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '',
        is_active: true, notes: '',
    });

    const filtered = groupDeductions.filter(g => !filterGrade || String(g.job_grade) === filterGrade);

    const byGrade = {};
    filtered.forEach(g => {
        const key = g.job_grade_code || g.job_grade;
        if (!byGrade[key]) byGrade[key] = { name: g.job_grade_name || key, items: [] };
        byGrade[key].items.push(g);
    });

    const openCreate = () => {
        setEditItem(null);
        setForm({
            job_grade: '', payroll_account: '', amount: '', calculation_method: 'fixed',
            percentage: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '',
            is_active: true, notes: '',
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            job_grade: item.job_grade, payroll_account: item.payroll_account,
            amount: item.amount, calculation_method: item.calculation_method || 'fixed',
            percentage: item.percentage || '', effective_from: item.effective_from || '',
            effective_to: item.effective_to || '', is_active: item.is_active, notes: item.notes || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.job_grade || !form.payroll_account || !form.amount || !form.effective_from) {
            toast.error('Grade, account, amount and effective date are required');
            return;
        }
        setSaving(true);
        const payload = { ...form, effective_to: form.effective_to || null };
        try {
            if (editItem) {
                await payrollService.updateGroupDeduction(editItem.id, payload);
                toast.success('Group deduction updated');
            } else {
                await payrollService.createGroupDeduction(payload);
                toast.success('Group deduction created');
            }
            setShowModal(false);
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || error.data?.non_field_errors?.[0] || error.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this group deduction?')) return;
        try {
            await payrollService.deleteGroupDeduction(id);
            toast.success('Deleted');
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        <option value="">All Grades</option>
                        {jobGrades.map(g => <option key={g.id} value={g.id}>{g.code} - {g.name}</option>)}
                    </select>
                </div>
                <button onClick={openCreate} className="btn btn-primary d-flex align-items-center gap-2">
                    <Plus size={16} /> Add Group Deduction
                </button>
            </div>

            {Object.keys(byGrade).length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                    No group deductions found. Click "Add Group Deduction" to assign deductions to a pay grade.
                </div>
            ) : (
                Object.entries(byGrade).map(([gradeCode, { name, items }]) => (
                    <div key={gradeCode} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <Users size={16} className="text-gray-500" />
                            <span className="font-semibold text-gray-800">{gradeCode}</span>
                            <span className="text-gray-500">— {name}</span>
                            <span className="ml-auto text-xs text-gray-400">{items.length} deduction(s)</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Payroll Account</th>
                                        <th className="px-4 py-2 text-left">Method</th>
                                        <th className="px-4 py-2 text-right">Amount / %</th>
                                        <th className="px-4 py-2 text-left">Effective</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-gray-800">{item.payroll_account_code}</span>
                                                <span className="text-gray-500 ml-2">{item.payroll_account_name}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs">{item.calculation_method}</td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {item.calculation_method !== 'fixed' && item.percentage
                                                    ? `${item.percentage}%`
                                                    : formatCurrency(item.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {formatDate(item.effective_from)}{item.effective_to ? ` → ${formatDate(item.effective_to)}` : ''}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium ${item.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{editItem ? 'Edit' : 'Add'} Group Deduction</h3>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Grade *</label>
                                    <select value={form.job_grade} onChange={e => setForm({ ...form, job_grade: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Grade</option>
                                        {jobGrades.map(g => <option key={g.id} value={g.id}>{g.code} - {g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Account *</label>
                                    <select value={form.payroll_account} onChange={e => setForm({ ...form, payroll_account: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Account</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method</label>
                                        <select value={form.calculation_method} onChange={e => setForm({ ...form, calculation_method: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            {CALC_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                                        <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                {form.calculation_method !== 'fixed' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                                        <input type="number" step="0.01" value={form.percentage}
                                            onChange={e => setForm({ ...form, percentage: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                                        <input type="date" value={form.effective_from} onChange={e => setForm({ ...form, effective_from: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                                        <input type="date" value={form.effective_to} onChange={e => setForm({ ...form, effective_to: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600" /> Active
                                </label>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                                        rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="btn btn-outline-secondary">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {editItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// EMPLOYEE DEDUCTIONS TAB (recurring)
// ============================================================================
const EmployeeTab = ({ deductions, accounts, employees, onRefresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [form, setForm] = useState({
        employee: '', payroll_account: '', amount: '', calculation_method: 'fixed',
        percentage: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '',
        reason: '', is_one_time: false, is_recurring: true,
        max_deduction_amount: '', balance_remaining: '',
    });

    const recurringDeductions = deductions.filter(d => d.is_recurring);
    const filtered = recurringDeductions.filter(d => {
        if (search && !(d.employee_name || '').toLowerCase().includes(search.toLowerCase()) &&
            !(d.payroll_account_name || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter && d.status !== statusFilter) return false;
        return true;
    });

    const openCreate = () => {
        setEditItem(null);
        setForm({
            employee: '', payroll_account: '', amount: '', calculation_method: 'fixed',
            percentage: '', effective_from: new Date().toISOString().split('T')[0], effective_to: '',
            reason: '', is_one_time: false, is_recurring: true,
            max_deduction_amount: '', balance_remaining: '',
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            employee: item.employee, payroll_account: item.payroll_account || '',
            amount: item.amount, calculation_method: item.calculation_method || 'fixed',
            percentage: item.percentage || '', effective_from: item.effective_from || '',
            effective_to: item.effective_to || '', reason: item.reason || '',
            is_one_time: false, is_recurring: true,
            max_deduction_amount: item.max_deduction_amount || '',
            balance_remaining: item.balance_remaining || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.employee || !form.amount || !form.effective_from) {
            toast.error('Employee, amount and effective date are required');
            return;
        }
        setSaving(true);
        const payload = { ...form, effective_to: form.effective_to || null };
        try {
            if (editItem) {
                await payrollService.updateEmployeeDeduction(editItem.id, payload);
                toast.success('Employee deduction updated');
            } else {
                await payrollService.createEmployeeDeduction(payload);
                toast.success('Employee deduction created');
            }
            setShowModal(false);
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || error.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this employee deduction?')) return;
        try {
            await payrollService.deleteEmployeeDeduction(id);
            toast.success('Deleted');
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <button onClick={openCreate} className="btn btn-primary d-flex align-items-center gap-2">
                    <Plus size={16} /> Add Employee Deduction
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">Payroll Account</th>
                                <th className="px-4 py-3 text-left">Method</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Effective</th>
                                <th className="px-4 py-3 text-right">Loan Balance</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(d => (
                                <tr key={d.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{d.employee_name}</td>
                                    <td className="px-4 py-3 text-gray-600">{d.payroll_account_name || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{d.calculation_method}</td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {d.calculation_method !== 'fixed' && d.percentage ? `${d.percentage}%` : formatCurrency(d.amount)}
                                    </td>
                                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(d.effective_from)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">
                                        {d.balance_remaining ? formatCurrency(d.balance_remaining) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No recurring employee deductions</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{editItem ? 'Edit' : 'Add'} Employee Deduction</h3>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                    <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_no})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Account</label>
                                    <select value={form.payroll_account} onChange={e => setForm({ ...form, payroll_account: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Account</option>
                                        {accounts.map(a => (
                                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Method</label>
                                        <select value={form.calculation_method} onChange={e => setForm({ ...form, calculation_method: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            {CALC_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                                        <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                {form.calculation_method !== 'fixed' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                                        <input type="number" step="0.01" value={form.percentage}
                                            onChange={e => setForm({ ...form, percentage: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                                        <input type="date" value={form.effective_from} onChange={e => setForm({ ...form, effective_from: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                                        <input type="date" value={form.effective_to} onChange={e => setForm({ ...form, effective_to: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                {/* Loan tracking fields */}
                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <p className="text-xs font-medium text-gray-500 mb-3 uppercase">Loan Tracking (optional)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Loan Amount</label>
                                            <input type="number" value={form.max_deduction_amount}
                                                onChange={e => setForm({ ...form, max_deduction_amount: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Balance Remaining</label>
                                            <input type="number" value={form.balance_remaining}
                                                onChange={e => setForm({ ...form, balance_remaining: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                                        rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="btn btn-outline-secondary">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {editItem ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// MAIN DASHBOARD
// ============================================================================
const EmployeeDeductionsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [employeeDeductions, setEmployeeDeductions] = useState([]);
    const [groupDeductions, setGroupDeductions] = useState([]);
    const [deductionAccounts, setDeductionAccounts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [jobGrades, setJobGrades] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [edRes, gdRes, accRes, empRes, gradeRes] = await Promise.allSettled([
                payrollService.getEmployeeDeductions({ page_size: 200 }),
                payrollService.getGroupDeductions({ page_size: 200 }),
                payrollService.getPayrollAccounts({ account_type: 'deduction', page_size: 200 }),
                api.get('/workforce/api/employees/', { params: { page_size: 500 } }),
                payrollService.getJobGrades({ page_size: 200 }),
            ]);
            if (edRes.status === 'fulfilled') setEmployeeDeductions(edRes.value?.results || edRes.value || []);
            if (gdRes.status === 'fulfilled') setGroupDeductions(gdRes.value?.results || gdRes.value || []);
            if (accRes.status === 'fulfilled') setDeductionAccounts(accRes.value?.results || accRes.value || []);
            if (empRes.status === 'fulfilled') setEmployees(empRes.value?.results || empRes.value || []);
            if (gradeRes.status === 'fulfilled') setJobGrades(gradeRes.value?.results || gradeRes.value || []);
        } catch (error) {
            console.error('Error fetching deductions data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <DashboardLayout title="Employee Deductions">
            <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-20 custom-scrollbar">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Deductions Management</h2>
                        <p className="text-gray-500 mt-1">Manage employee, one-time, and group-level deductions</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.key
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-blue-500" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <OverviewTab employeeDeductions={employeeDeductions} groupDeductions={groupDeductions} />
                        )}
                        {activeTab === 'one-time' && (
                            <OneTimeTab deductions={employeeDeductions} accounts={deductionAccounts} employees={employees} onRefresh={fetchData} />
                        )}
                        {activeTab === 'group' && (
                            <GroupTab groupDeductions={groupDeductions} accounts={deductionAccounts} jobGrades={jobGrades} onRefresh={fetchData} />
                        )}
                        {activeTab === 'employee' && (
                            <EmployeeTab deductions={employeeDeductions} accounts={deductionAccounts} employees={employees} onRefresh={fetchData} />
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EmployeeDeductionsDashboard;

