import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Edit2, Trash2, X, Save, Loader2,
    Calendar, Play, CheckCircle, Clock, Lock, Unlock, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { payrollService } from '../../../../services/payrollService';
import { useAuth } from '../../../../auth/AuthProvider';
import '../../../../dashboard/dashboard.css';

const STATUS_CONFIG = {
    open: { label: 'Open', color: 'bg-blue-50 text-blue-700', icon: Clock },
    processing: { label: 'Processing', color: 'bg-yellow-50 text-yellow-700', icon: Loader2 },
    calculated: { label: 'Calculated', color: 'bg-indigo-50 text-indigo-700', icon: CheckCircle },
    approved: { label: 'Approved', color: 'bg-green-50 text-green-700', icon: CheckCircle },
    paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700', icon: DollarSign },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500', icon: Lock },
};

const PERIOD_TYPES = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'bi_weekly', label: 'Bi-Weekly' },
    { value: 'weekly', label: 'Weekly' },
];

const PayPeriods = () => {
    const { user } = useAuth();
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState(null);
    const [saving, setSaving] = useState(false);
    const [processing, setProcessing] = useState(null);
    const [unlocking, setUnlocking] = useState(null);

    const canUnlock = user?.is_superuser || (user?.permissions || []).includes('workforce.can_unlock_payroll_period');

    const [form, setForm] = useState({
        period_name: '',
        period_type: 'monthly',
        start_date: '',
        end_date: '',
        payment_date: '',
        notes: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await payrollService.getPayrollPeriods();
            setPeriods(Array.isArray(data) ? data : data.results || []);
        } catch {
            toast.error('Failed to load pay periods');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredPeriods = periods.filter(p => {
        const matchesSearch = (p.period_name || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const formatCurrency = (amount) => {
        if (!amount || amount === '0.00') return '-';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-KE', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const openCreate = () => {
        setEditingPeriod(null);
        const now = new Date();
        const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const startOf = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOf = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setForm({
            period_name: `Payroll - ${monthName}`,
            period_type: 'monthly',
            start_date: startOf,
            end_date: endOf,
            payment_date: lastDay,
            notes: '',
        });
        setShowModal(true);
    };

    const openEdit = (period) => {
        setEditingPeriod(period);
        setForm({
            period_name: period.period_name,
            period_type: period.period_type,
            start_date: period.start_date,
            end_date: period.end_date,
            payment_date: period.payment_date,
            notes: period.notes || '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.period_name || !form.start_date || !form.end_date || !form.payment_date) {
            toast.error('Name, dates, and payment date are required');
            return;
        }
        setSaving(true);
        try {
            if (editingPeriod) {
                await payrollService.updatePayrollPeriod(editingPeriod.id, form);
                toast.success('Period updated');
            } else {
                await payrollService.createPayrollPeriod(form);
                toast.success('Period created');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const detail = error?.response?.data;
            const msg = typeof detail === 'object' ? Object.values(detail).flat().join(', ') : (error.message || 'Failed to save period');
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this pay period?')) return;
        try {
            await payrollService.deletePayrollPeriod(id);
            toast.success('Period deleted');
            fetchData();
        } catch {
            toast.error('Cannot delete this period. It may have payroll data.');
        }
    };

    const handleProcess = async (id) => {
        if (!window.confirm('Process payroll for this period? This will calculate salaries for all eligible employees.')) return;
        setProcessing(id);
        try {
            await payrollService.processPayroll(id);
            toast.success('Payroll processed successfully');
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to process payroll');
        } finally {
            setProcessing(null);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this payroll period?')) return;
        try {
            await payrollService.approvePayroll(id);
            toast.success('Payroll approved');
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to approve payroll');
        }
    };

    const handleUnlock = async (id) => {
        if (!window.confirm('Unlock this payroll period for re-run? Existing calculations will be overwritten on next process.')) return;
        setUnlocking(id);
        try {
            await payrollService.unlockPayrollPeriod(id);
            toast.success('Period unlocked for re-run');
            fetchData();
        } catch (error) {
            toast.error(error.error || error.message || 'Failed to unlock period');
        } finally {
            setUnlocking(null);
        }
    };

    // Stats
    const openCount = periods.filter(p => p.status === 'open').length;
    const processedCount = periods.filter(p => ['calculated', 'approved', 'paid'].includes(p.status)).length;
    const totalNetPay = periods
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.total_net_pay || 0), 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div 
                    className="mini-stat-card-premium stat-blue relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#2563eb', '--icon-bg': '#dbeafe' }}>
                            <Clock size={16} />
                        </div>
                        <span className="stat-label-modern">Open Periods</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{openCount}</div>
                    </div>
                </motion.div>

                <motion.div 
                    className="mini-stat-card-premium stat-emerald relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#059669', '--icon-bg': '#d1fae5' }}>
                            <CheckCircle size={16} />
                        </div>
                        <span className="stat-label-modern">Processed</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{processedCount}</div>
                    </div>
                </motion.div>

                <motion.div 
                    className="mini-stat-card-premium stat-amber relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#d97706', '--icon-bg': '#fef3c7' }}>
                            <DollarSign size={16} />
                        </div>
                        <span className="stat-label-modern">Total Paid Out</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{formatCurrency(totalNetPay)}</div>
                    </div>
                </motion.div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search periods..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-wrap">
                            {['all', 'open', 'calculated', 'approved', 'paid', 'closed'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === f
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {f === 'all' ? 'All' : (STATUS_CONFIG[f]?.label || f)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm"
                    >
                        <Plus size={16} />
                        New Period
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-t border-gray-100">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employees</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Pay</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center">
                                        <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                                        <p className="text-sm text-gray-400 mt-2">Loading periods...</p>
                                    </td>
                                </tr>
                            ) : filteredPeriods.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center">
                                        <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-400">No pay periods found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPeriods.map(period => {
                                    const status = STATUS_CONFIG[period.status] || STATUS_CONFIG.open;
                                    const StatusIcon = status.icon;
                                    const isLocked = ['approved', 'paid', 'closed'].includes(period.status);
                                    return (
                                        <tr key={period.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div>
                                                    <p className="font-medium text-gray-800">{period.period_name}</p>
                                                    <p className="text-xs text-gray-400">Payment: {formatDate(period.payment_date)}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs font-medium">
                                                    {PERIOD_TYPES.find(t => t.value === period.period_type)?.label || period.period_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-600 text-xs">
                                                <p>{formatDate(period.start_date)}</p>
                                                <p className="text-gray-400">to {formatDate(period.end_date)}</p>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">
                                                    {period.employee_count || 0}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                                                {formatCurrency(period.total_net_pay)}
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    <StatusIcon size={12} />
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {period.status === 'open' && (
                                                        <button
                                                            onClick={() => handleProcess(period.id)}
                                                            disabled={processing === period.id}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all"
                                                            title="Process Payroll"
                                                        >
                                                            {processing === period.id ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : (
                                                                <Play size={12} />
                                                            )}
                                                            Process
                                                        </button>
                                                    )}
                                                    {period.status === 'calculated' && (
                                                        <button
                                                            onClick={() => handleApprove(period.id)}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={12} />
                                                            Approve
                                                        </button>
                                                    )}
                                                    {!isLocked && (
                                                        <>
                                                            <button
                                                                onClick={() => openEdit(period)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(period.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                    {isLocked && (
                                                        canUnlock ? (
                                                            <button
                                                                onClick={() => handleUnlock(period.id)}
                                                                disabled={unlocking === period.id}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all"
                                                                title="Unlock for re-run"
                                                            >
                                                                {unlocking === period.id ? (
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                ) : (
                                                                    <Unlock size={12} />
                                                                )}
                                                                Unlock
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic flex items-center gap-1">
                                                                <Lock size={12} /> Locked
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
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
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {editingPeriod ? 'Edit Pay Period' : 'New Pay Period'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Period Name *</label>
                                    <input
                                        type="text"
                                        value={form.period_name}
                                        onChange={e => setForm(p => ({ ...p, period_name: e.target.value }))}
                                        placeholder="e.g., Payroll - January 2026"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Period Type</label>
                                    <select
                                        value={form.period_type}
                                        onChange={e => setForm(p => ({ ...p, period_type: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    >
                                        {PERIOD_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date *</label>
                                        <input
                                            type="date"
                                            value={form.start_date}
                                            onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date *</label>
                                        <input
                                            type="date"
                                            value={form.end_date}
                                            onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Date *</label>
                                    <input
                                        type="date"
                                        value={form.payment_date}
                                        onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                        placeholder="Optional notes..."
                                        rows={2}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                                <button onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving...' : editingPeriod ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PayPeriods;
