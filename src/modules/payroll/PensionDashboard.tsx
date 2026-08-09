import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import {
    Plus, Edit2, Trash2, X, Save, Loader2, Search, ChevronDown, ChevronRight,
    Shield, Users, Briefcase, History, Eye, Building2, UserPlus, Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { payrollService } from '../../services/payrollService';
import { api } from '../../services/api';

const TABS = [
    { key: 'schemes', label: 'Pension Schemes', icon: Shield },
    { key: 'enrollments', label: 'Employee Enrollment', icon: UserPlus },
    { key: 'contributions', label: 'Contribution History', icon: History },
];

const SCHEME_TYPES = [
    { value: 'ipp', label: 'Individual Pension Plan (IPP)' },
    { value: 'occupational', label: 'Occupational Scheme' },
    { value: 'nssf', label: 'NSSF' },
    { value: 'custom', label: 'Custom' },
];

const CALC_BASIS_OPTIONS = [
    { value: 'basic_salary', label: 'Basic Salary' },
    { value: 'gross_pay', label: 'Gross Pay' },
    { value: 'fixed_amount', label: 'Fixed Amount' },
];

const ENROLLMENT_STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'exited', label: 'Exited' },
];

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

const StatusBadge = ({ status }) => {
    const styles = {
        active: 'bg-green-50 text-green-700 border-green-200',
        suspended: 'bg-amber-50 text-amber-700 border-amber-200',
        exited: 'bg-gray-100 text-gray-500 border-gray-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.active}`}>
            {status}
        </span>
    );
};

// ============================================================================
// PENSION SCHEMES TAB
// ============================================================================
const SchemesTab = ({ schemes, payrollAccounts, jobGrades, onRefresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [expandedScheme, setExpandedScheme] = useState(null);
    const [gradeRates, setGradeRates] = useState({});
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const EMPTY_FORM = {
        code: '', name: '', scheme_type: 'ipp', provider_name: '', provider_account_number: '',
        employee_rate: '', employer_rate: '', max_employee_contribution: '', max_employer_contribution: '',
        calculation_basis: 'basic_salary', payroll_account: '', is_tax_exempt: true,
        effective_from: new Date().toISOString().split('T')[0], effective_to: '', is_active: true, description: '',
    };
    const [form, setForm] = useState(EMPTY_FORM);

    const EMPTY_GRADE_FORM = {
        pension_scheme: '', job_grade: '', employee_rate: '', employer_rate: '',
        effective_from: new Date().toISOString().split('T')[0], effective_to: '',
    };
    const [gradeForm, setGradeForm] = useState(EMPTY_GRADE_FORM);
    const [editGradeItem, setEditGradeItem] = useState(null);

    const filtered = schemes.filter(s =>
        !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase())
    );

    const fetchGradeRates = async (schemeId) => {
        try {
            const res = await payrollService.getPensionGradeRates({ pension_scheme: schemeId, page_size: 100 });
            setGradeRates(prev => ({ ...prev, [schemeId]: res?.results || res || [] }));
        } catch (error) {
            console.error('Error fetching grade rates:', error);
        }
    };

    const toggleExpand = (schemeId) => {
        if (expandedScheme === schemeId) {
            setExpandedScheme(null);
        } else {
            setExpandedScheme(schemeId);
            if (!gradeRates[schemeId]) fetchGradeRates(schemeId);
        }
    };

    const openCreate = () => {
        setEditItem(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            code: item.code, name: item.name, scheme_type: item.scheme_type,
            provider_name: item.provider_name || '', provider_account_number: item.provider_account_number || '',
            employee_rate: item.employee_rate, employer_rate: item.employer_rate,
            max_employee_contribution: item.max_employee_contribution || '',
            max_employer_contribution: item.max_employer_contribution || '',
            calculation_basis: item.calculation_basis, payroll_account: item.payroll_account || '',
            is_tax_exempt: item.is_tax_exempt, effective_from: item.effective_from || '',
            effective_to: item.effective_to || '', is_active: item.is_active, description: item.description || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.code || !form.name || !form.effective_from) {
            toast.error('Code, name and effective date are required');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.payroll_account) delete payload.payroll_account;
            if (!payload.max_employee_contribution) payload.max_employee_contribution = null;
            if (!payload.max_employer_contribution) payload.max_employer_contribution = null;
            if (!payload.effective_to) payload.effective_to = null;

            if (editItem) {
                await payrollService.updatePensionScheme(editItem.id, payload);
                toast.success('Pension scheme updated');
            } else {
                await payrollService.createPensionScheme(payload);
                toast.success('Pension scheme created');
            }
            setShowModal(false);
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || error.data?.code?.[0] || error.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this pension scheme? This will also delete grade rates and enrollments.')) return;
        try {
            await payrollService.deletePensionScheme(id);
            toast.success('Deleted');
            onRefresh();
        } catch (error) {
            toast.error(error.data?.detail || 'Failed to delete');
        }
    };

    // Grade rate CRUD
    const openGradeCreate = (schemeId) => {
        setEditGradeItem(null);
        setGradeForm({ ...EMPTY_GRADE_FORM, pension_scheme: schemeId });
        setShowGradeModal(true);
    };

    const openGradeEdit = (item) => {
        setEditGradeItem(item);
        setGradeForm({
            pension_scheme: item.pension_scheme, job_grade: item.job_grade,
            employee_rate: item.employee_rate, employer_rate: item.employer_rate,
            effective_from: item.effective_from || '', effective_to: item.effective_to || '',
        });
        setShowGradeModal(true);
    };

    const handleGradeSave = async () => {
        if (!gradeForm.job_grade || !gradeForm.employee_rate || !gradeForm.employer_rate) {
            toast.error('Grade and rates are required');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...gradeForm };
            if (!payload.effective_to) payload.effective_to = null;

            if (editGradeItem) {
                await payrollService.updatePensionGradeRate(editGradeItem.id, payload);
                toast.success('Grade rate updated');
            } else {
                await payrollService.createPensionGradeRate(payload);
                toast.success('Grade rate created');
            }
            setShowGradeModal(false);
            fetchGradeRates(gradeForm.pension_scheme);
        } catch (error) {
            toast.error(error.data?.detail || error.data?.non_field_errors?.[0] || error.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleGradeDelete = async (item) => {
        if (!confirm('Delete this grade rate override?')) return;
        try {
            await payrollService.deletePensionGradeRate(item.id);
            toast.success('Deleted');
            fetchGradeRates(item.pension_scheme);
        } catch (error) {
            toast.error(error.data?.detail || 'Failed to delete');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search schemes..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-72" />
                </div>
                <button onClick={openCreate} className="btn btn-primary d-flex align-items-center gap-2">
                    <Plus size={16} /> Add Pension Scheme
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                    <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No pension schemes yet. Create your first scheme to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(scheme => (
                        <div key={scheme.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* Scheme Header */}
                            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleExpand(scheme.id)}>
                                <div className="flex-shrink-0">
                                    {expandedScheme === scheme.id
                                        ? <ChevronDown size={18} className="text-gray-400" />
                                        : <ChevronRight size={18} className="text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-800">{scheme.code}</span>
                                        <span className="text-gray-600">{scheme.name}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                            scheme.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                            {scheme.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                            {SCHEME_TYPES.find(t => t.value === scheme.scheme_type)?.label || scheme.scheme_type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        {scheme.provider_name && (
                                            <span className="flex items-center gap-1"><Building2 size={13} /> {scheme.provider_name}</span>
                                        )}
                                        <span>Employee: {scheme.employee_rate}%</span>
                                        <span>Employer: {scheme.employer_rate}%</span>
                                        <span>Basis: {CALC_BASIS_OPTIONS.find(o => o.value === scheme.calculation_basis)?.label}</span>
                                        <span>{scheme.enrollment_count || 0} enrolled</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openEdit(scheme)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600">
                                        <Edit2 size={15} />
                                    </button>
                                    <button onClick={() => handleDelete(scheme.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded: Grade Rate Overrides */}
                            {expandedScheme === scheme.id && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Percent size={14} /> Grade Rate Overrides
                                        </h4>
                                        <button onClick={() => openGradeCreate(scheme.id)}
                                            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                                            <Plus size={14} /> Add Grade Rate
                                        </button>
                                    </div>
                                    {(gradeRates[scheme.id] || []).length === 0 ? (
                                        <p className="text-sm text-gray-400 py-4 text-center">
                                            No grade overrides — all employees use scheme defaults ({scheme.employee_rate}% / {scheme.employer_rate}%)
                                        </p>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="text-xs text-gray-500 uppercase">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Grade</th>
                                                    <th className="px-3 py-2 text-right">Employee Rate</th>
                                                    <th className="px-3 py-2 text-right">Employer Rate</th>
                                                    <th className="px-3 py-2 text-left">Effective</th>
                                                    <th className="px-3 py-2 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {(gradeRates[scheme.id] || []).map(gr => (
                                                    <tr key={gr.id} className="hover:bg-white">
                                                        <td className="px-3 py-2 font-medium">{gr.job_grade_code} - {gr.job_grade_name}</td>
                                                        <td className="px-3 py-2 text-right">{gr.employee_rate}%</td>
                                                        <td className="px-3 py-2 text-right">{gr.employer_rate}%</td>
                                                        <td className="px-3 py-2 text-gray-500">{formatDate(gr.effective_from)}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button onClick={() => openGradeEdit(gr)} className="p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"><Edit2 size={13} /></button>
                                                                <button onClick={() => handleGradeDelete(gr)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Scheme Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{editItem ? 'Edit' : 'Create'} Pension Scheme</h3>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                                        <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Type</label>
                                        <select value={form.scheme_type} onChange={e => setForm({ ...form, scheme_type: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            {SCHEME_TYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name *</label>
                                    <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                                        <input type="text" value={form.provider_name} onChange={e => setForm({ ...form, provider_name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider Account No.</label>
                                        <input type="text" value={form.provider_account_number} onChange={e => setForm({ ...form, provider_account_number: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-3">Default Contribution Rates</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Rate (%)</label>
                                            <input type="number" step="0.01" value={form.employee_rate} onChange={e => setForm({ ...form, employee_rate: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Employer Rate (%)</label>
                                            <input type="number" step="0.01" value={form.employer_rate} onChange={e => setForm({ ...form, employer_rate: e.target.value })}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Employee Contribution</label>
                                            <input type="number" value={form.max_employee_contribution} onChange={e => setForm({ ...form, max_employee_contribution: e.target.value })}
                                                placeholder="No limit" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Employer Contribution</label>
                                            <input type="number" value={form.max_employer_contribution} onChange={e => setForm({ ...form, max_employer_contribution: e.target.value })}
                                                placeholder="No limit" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Basis</label>
                                        <select value={form.calculation_basis} onChange={e => setForm({ ...form, calculation_basis: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            {CALC_BASIS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Account (GL)</label>
                                        <select value={form.payroll_account} onChange={e => setForm({ ...form, payroll_account: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            <option value="">None</option>
                                            {payrollAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                                        </select>
                                    </div>
                                </div>

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

                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={form.is_tax_exempt} onChange={e => setForm({ ...form, is_tax_exempt: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600" /> Tax Exempt
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                                            className="rounded border-gray-300 text-blue-600" /> Active
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
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

            {/* Grade Rate Modal */}
            <AnimatePresence>
                {showGradeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{editGradeItem ? 'Edit' : 'Add'} Grade Rate Override</h3>
                                <button onClick={() => setShowGradeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Grade *</label>
                                    <select value={gradeForm.job_grade} onChange={e => setGradeForm({ ...gradeForm, job_grade: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Grade</option>
                                        {jobGrades.map(g => <option key={g.id} value={g.id}>{g.code} - {g.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee Rate (%) *</label>
                                        <input type="number" step="0.01" value={gradeForm.employee_rate}
                                            onChange={e => setGradeForm({ ...gradeForm, employee_rate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employer Rate (%) *</label>
                                        <input type="number" step="0.01" value={gradeForm.employer_rate}
                                            onChange={e => setGradeForm({ ...gradeForm, employer_rate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                                        <input type="date" value={gradeForm.effective_from}
                                            onChange={e => setGradeForm({ ...gradeForm, effective_from: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                                        <input type="date" value={gradeForm.effective_to}
                                            onChange={e => setGradeForm({ ...gradeForm, effective_to: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                                <button onClick={() => setShowGradeModal(false)} className="btn btn-outline-secondary">Cancel</button>
                                <button onClick={handleGradeSave} disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {editGradeItem ? 'Update' : 'Create'}
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
// ENROLLMENTS TAB
// ============================================================================
const EnrollmentsTab = ({ enrollments, schemes, employees, onRefresh }) => {
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [schemeFilter, setSchemeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const EMPTY_FORM = {
        employee: '', pension_scheme: '', membership_number: '',
        employee_rate: '', employer_rate: '', custom_amount: '',
        enrollment_date: new Date().toISOString().split('T')[0], exit_date: '',
        exit_reason: '', status: 'active', notes: '',
    };
    const [form, setForm] = useState(EMPTY_FORM);

    const filtered = enrollments.filter(e => {
        if (search && !(e.employee_name || '').toLowerCase().includes(search.toLowerCase()) &&
            !(e.employee_no || '').toLowerCase().includes(search.toLowerCase()) &&
            !(e.membership_number || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (schemeFilter && String(e.pension_scheme) !== schemeFilter) return false;
        if (statusFilter && e.status !== statusFilter) return false;
        return true;
    });

    const openCreate = () => {
        setEditItem(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({
            employee: item.employee, pension_scheme: item.pension_scheme,
            membership_number: item.membership_number || '',
            employee_rate: item.employee_rate || '', employer_rate: item.employer_rate || '',
            custom_amount: item.custom_amount || '',
            enrollment_date: item.enrollment_date || '', exit_date: item.exit_date || '',
            exit_reason: item.exit_reason || '', status: item.status, notes: item.notes || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.employee || !form.pension_scheme || !form.enrollment_date) {
            toast.error('Employee, scheme and enrollment date are required');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.employee_rate) payload.employee_rate = null;
            if (!payload.employer_rate) payload.employer_rate = null;
            if (!payload.custom_amount) payload.custom_amount = null;
            if (!payload.exit_date) payload.exit_date = null;

            if (editItem) {
                await payrollService.updatePensionEnrollment(editItem.id, payload);
                toast.success('Enrollment updated');
            } else {
                await payrollService.createPensionEnrollment(payload);
                toast.success('Employee enrolled successfully');
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
        if (!confirm('Remove this enrollment?')) return;
        try {
            await payrollService.deletePensionEnrollment(id);
            toast.success('Enrollment removed');
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
                        <input type="text" placeholder="Search by name, employee no, member ID..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-72" />
                    </div>
                    <select value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        <option value="">All Schemes</option>
                        {schemes.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        <option value="">All Statuses</option>
                        {ENROLLMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <button onClick={openCreate} className="btn btn-primary d-flex align-items-center gap-2">
                    <UserPlus size={16} /> Enroll Employee
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">Emp No.</th>
                                <th className="px-4 py-3 text-left">Scheme</th>
                                <th className="px-4 py-3 text-left">Member ID</th>
                                <th className="px-4 py-3 text-right">Eff. EE Rate</th>
                                <th className="px-4 py-3 text-right">Eff. ER Rate</th>
                                <th className="px-4 py-3 text-left">Enrolled</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{e.employee_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{e.employee_no}</td>
                                    <td className="px-4 py-3 text-gray-600">{e.scheme_code} - {e.scheme_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{e.membership_number || '—'}</td>
                                    <td className="px-4 py-3 text-right font-medium">{e.effective_employee_rate}%</td>
                                    <td className="px-4 py-3 text-right font-medium">{e.effective_employer_rate}%</td>
                                    <td className="px-4 py-3 text-gray-500">{formatDate(e.enrollment_date)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(e)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No enrollments found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enrollment Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{editItem ? 'Edit Enrollment' : 'Enroll Employee'}</h3>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pension Scheme *</label>
                                    <select value={form.pension_scheme} onChange={e => setForm({ ...form, pension_scheme: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                        <option value="">Select Scheme</option>
                                        {schemes.filter(s => s.is_active).map(s => (
                                            <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Membership Number</label>
                                        <input type="text" value={form.membership_number}
                                            onChange={e => setForm({ ...form, membership_number: e.target.value })}
                                            placeholder="External pension member ID"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            {ENROLLMENT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Rate Overrides</p>
                                    <p className="text-xs text-gray-400 mb-3">Leave blank to use grade or scheme defaults</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Rate (%)</label>
                                            <input type="number" step="0.01" value={form.employee_rate}
                                                onChange={e => setForm({ ...form, employee_rate: e.target.value })}
                                                placeholder="Default"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Employer Rate (%)</label>
                                            <input type="number" step="0.01" value={form.employer_rate}
                                                onChange={e => setForm({ ...form, employer_rate: e.target.value })}
                                                placeholder="Default"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Amount</label>
                                            <input type="number" value={form.custom_amount}
                                                onChange={e => setForm({ ...form, custom_amount: e.target.value })}
                                                placeholder="If fixed"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date *</label>
                                        <input type="date" value={form.enrollment_date}
                                            onChange={e => setForm({ ...form, enrollment_date: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Exit Date</label>
                                        <input type="date" value={form.exit_date}
                                            onChange={e => setForm({ ...form, exit_date: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                </div>
                                {form.status === 'exited' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Exit Reason</label>
                                        <textarea value={form.exit_reason} onChange={e => setForm({ ...form, exit_reason: e.target.value })}
                                            rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                    </div>
                                )}
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
                                    {editItem ? 'Update' : 'Enroll'}
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
// CONTRIBUTIONS TAB
// ============================================================================
const ContributionsTab = ({ contributions, schemes, onRefresh }) => {
    const [search, setSearch] = useState('');
    const [schemeFilter, setSchemeFilter] = useState('');

    const filtered = contributions.filter(c => {
        if (search && !(c.employee_name || '').toLowerCase().includes(search.toLowerCase()) &&
            !(c.employee_no || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (schemeFilter && !(c.scheme_code || '').includes(schemeFilter)) return false;
        return true;
    });

    const totalEE = filtered.reduce((s, c) => s + parseFloat(c.employee_amount || 0), 0);
    const totalER = filtered.reduce((s, c) => s + parseFloat(c.employer_amount || 0), 0);

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500 mb-1">Total Employee Contributions</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEE)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500 mb-1">Total Employer Contributions</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalER)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500 mb-1">Combined Total</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalEE + totalER)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search by employee..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-72" />
                </div>
                <select value={schemeFilter} onChange={e => setSchemeFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="">All Schemes</option>
                    {schemes.map(s => <option key={s.id} value={s.code}>{s.code} - {s.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Period</th>
                                <th className="px-4 py-3 text-left">Employee</th>
                                <th className="px-4 py-3 text-left">Emp No.</th>
                                <th className="px-4 py-3 text-left">Scheme</th>
                                <th className="px-4 py-3 text-right">Base Amount</th>
                                <th className="px-4 py-3 text-right">EE Rate</th>
                                <th className="px-4 py-3 text-right">EE Amount</th>
                                <th className="px-4 py-3 text-right">ER Rate</th>
                                <th className="px-4 py-3 text-right">ER Amount</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-600">{c.period_name || '—'}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{c.employee_name}</td>
                                    <td className="px-4 py-3 text-gray-500">{c.employee_no}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.scheme_code}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(c.base_amount)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{c.employee_rate_applied}%</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(c.employee_amount)}</td>
                                    <td className="px-4 py-3 text-right text-gray-500">{c.employer_rate_applied}%</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(c.employer_amount)}</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(c.total_contribution)}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No contribution records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN DASHBOARD
// ============================================================================
const PensionDashboard = ({ noLayout = false }) => {
    const [activeTab, setActiveTab] = useState('schemes');
    const [loading, setLoading] = useState(true);
    const [schemes, setSchemes] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [payrollAccounts, setPayrollAccounts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [jobGrades, setJobGrades] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [schRes, enrRes, contRes, accRes, empRes, gradeRes] = await Promise.allSettled([
                payrollService.getPensionSchemes({ page_size: 200 }),
                payrollService.getPensionEnrollments({ page_size: 500 }),
                payrollService.getPensionContributions({ page_size: 500 }),
                payrollService.getPayrollAccounts({ page_size: 200 }),
                api.get('/workforce/api/employees/', { params: { page_size: 500 } }),
                payrollService.getJobGrades({ page_size: 200 }),
            ]);
            if (schRes.status === 'fulfilled') setSchemes(schRes.value?.results || schRes.value || []);
            if (enrRes.status === 'fulfilled') setEnrollments(enrRes.value?.results || enrRes.value || []);
            if (contRes.status === 'fulfilled') setContributions(contRes.value?.results || contRes.value || []);
            if (accRes.status === 'fulfilled') setPayrollAccounts(accRes.value?.results || accRes.value || []);
            if (empRes.status === 'fulfilled') setEmployees(empRes.value?.results || empRes.value || []);
            if (gradeRes.status === 'fulfilled') setJobGrades(gradeRes.value?.results || gradeRes.value || []);
        } catch (error) {
            console.error('Error fetching pension data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const content = (
        <div className="h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-20 custom-scrollbar">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Pension Management</h2>
                    <p className="text-gray-500 mt-1">Configure pension schemes, enroll employees, and track contributions</p>
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
                    {activeTab === 'schemes' && (
                        <SchemesTab schemes={schemes} payrollAccounts={payrollAccounts} jobGrades={jobGrades} onRefresh={fetchData} />
                    )}
                    {activeTab === 'enrollments' && (
                        <EnrollmentsTab enrollments={enrollments} schemes={schemes} employees={employees} onRefresh={fetchData} />
                    )}
                    {activeTab === 'contributions' && (
                        <ContributionsTab contributions={contributions} schemes={schemes} onRefresh={fetchData} />
                    )}
                </>
            )}
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Pension Schemes">
            {content}
        </DashboardLayout>
    );
};

export default PensionDashboard;
