import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Plus, Edit2, Trash2, X, Save, Loader2,
    Users, DollarSign, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { payrollService } from '../../../../services/payrollService';
import { api } from '../../../../services/api';
import '../../../../dashboard/dashboard.css';

const EmployeePayProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [gradeSteps, setGradeSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filterActive, setFilterActive] = useState('all');

    // Employee search state
    const [empSearch, setEmpSearch] = useState('');
    const [empResults, setEmpResults] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [showEmpDropdown, setShowEmpDropdown] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const empSearchRef = useRef(null);
    const empDropdownRef = useRef(null);

    // Selected grade for step filtering
    const [selectedGrade, setSelectedGrade] = useState('');

    const [form, setForm] = useState({
        employee: '',
        pay_grade_step: '',
        currency: 'KES',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        reason_for_change: '',
        is_active: true,
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const profilesData = await payrollService.getEmployeePayProfiles();
            setProfiles(Array.isArray(profilesData) ? profilesData : profilesData.results || []);
        } catch {
            toast.error('Failed to load pay profiles');
        }
        try {
            const stepsData = await payrollService.getPayGradeSteps();
            setGradeSteps(Array.isArray(stepsData) ? stepsData : stepsData.results || []);
        } catch {
            console.error('Failed to load pay grade steps');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Employee search with debounce
    useEffect(() => {
        if (!empSearch || empSearch.length < 2) {
            setEmpResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setEmpLoading(true);
            try {
                const data = await api.get('/workforce/api/employees/', {
                    params: { search: empSearch, page_size: 10 }
                });
                const results = Array.isArray(data) ? data : data.results || [];
                setEmpResults(results);
                setShowEmpDropdown(true);
            } catch {
                setEmpResults([]);
            } finally {
                setEmpLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [empSearch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (empDropdownRef.current && !empDropdownRef.current.contains(e.target) &&
                empSearchRef.current && !empSearchRef.current.contains(e.target)) {
                setShowEmpDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredProfiles = profiles.filter(p => {
        const matchesSearch =
            (p.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.employee_no || '').toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filterActive === 'all' ||
            (filterActive === 'active' && p.is_active) ||
            (filterActive === 'inactive' && !p.is_active);
        return matchesSearch && matchesFilter;
    });

    // Group steps by grade for the dropdown
    const grades = [...new Map(gradeSteps.map(s => [s.job_grade, { id: s.job_grade, code: s.job_grade_code, name: s.job_grade_name }])).values()];
    const filteredSteps = selectedGrade
        ? gradeSteps.filter(s => String(s.job_grade) === String(selectedGrade))
        : gradeSteps;

    const openCreate = () => {
        setEditingProfile(null);
        setSelectedEmployee(null);
        setEmpSearch('');
        setSelectedGrade('');
        setForm({
            employee: '',
            pay_grade_step: '',
            currency: 'KES',
            effective_from: new Date().toISOString().split('T')[0],
            effective_to: '',
            reason_for_change: '',
            is_active: true,
        });
        setShowModal(true);
    };

    const openEdit = (profile) => {
        setEditingProfile(profile);
        setSelectedEmployee({ id: profile.employee, name: profile.employee_name, employee_no: profile.employee_no });
        setEmpSearch(`${profile.employee_name} (${profile.employee_no})`);
        // Pre-select the grade from the step
        const step = gradeSteps.find(s => s.id === profile.pay_grade_step);
        setSelectedGrade(step ? String(step.job_grade) : '');
        setForm({
            employee: profile.employee,
            pay_grade_step: profile.pay_grade_step || '',
            currency: profile.currency || 'KES',
            effective_from: profile.effective_from || '',
            effective_to: profile.effective_to || '',
            reason_for_change: profile.reason_for_change || '',
            is_active: profile.is_active,
        });
        setShowModal(true);
    };

    const handleSelectEmployee = (emp) => {
        setSelectedEmployee(emp);
        setForm(prev => ({ ...prev, employee: emp.id }));
        setEmpSearch(`${emp.first_name} ${emp.last_name} (${emp.employee_no})`);
        setShowEmpDropdown(false);
    };

    const handleGradeChange = (gradeId) => {
        setSelectedGrade(gradeId);
        setForm(prev => ({ ...prev, pay_grade_step: '' }));
    };

    const handleSave = async () => {
        if (!form.employee) {
            toast.error('Please select an employee');
            return;
        }
        if (!form.pay_grade_step) {
            toast.error('Please select a pay grade step');
            return;
        }
        if (!form.effective_from) {
            toast.error('Effective from date is required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                employee: form.employee,
                pay_grade_step: parseInt(form.pay_grade_step),
                currency: form.currency,
                effective_from: form.effective_from,
                effective_to: form.effective_to || null,
                reason_for_change: form.reason_for_change,
                is_active: form.is_active,
            };
            if (editingProfile) {
                await payrollService.updateEmployeePayProfile(editingProfile.id, payload);
                toast.success('Pay profile updated');
            } else {
                await payrollService.createEmployeePayProfile(payload);
                toast.success('Pay profile created');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Failed to save pay profile');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pay profile?')) return;
        try {
            await payrollService.deleteEmployeePayProfile(id);
            toast.success('Pay profile deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete pay profile');
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Resolve current step amount for display
    const selectedStepObj = form.pay_grade_step
        ? gradeSteps.find(s => s.id === parseInt(form.pay_grade_step))
        : null;

    // Stats
    const totalActive = profiles.filter(p => p.is_active).length;
    const avgSalary = totalActive > 0
        ? profiles.filter(p => p.is_active).reduce((sum, p) => sum + parseFloat(p.basic_salary || 0), 0) / totalActive
        : 0;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                <motion.div
                    className="mini-stat-card-premium stat-blue relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#2563eb', '--icon-bg': '#dbeafe' }}>
                            <Users size={16} />
                        </div>
                        <span className="stat-label-modern">Active Profiles</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{totalActive}</div>
                    </div>
                </motion.div>

                <motion.div
                    className="mini-stat-card-premium stat-emerald relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#059669', '--icon-bg': '#d1fae5' }}>
                            <DollarSign size={16} />
                        </div>
                        <span className="stat-label-modern">Avg. Basic Salary</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{formatCurrency(avgSalary)}</div>
                    </div>
                </motion.div>

                <motion.div
                    className="mini-stat-card-premium stat-purple relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#9333ea', '--icon-bg': '#f3e8ff' }}>
                            <Briefcase size={16} />
                        </div>
                        <span className="stat-label-modern">Total Profiles</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{profiles.length}</div>
                    </div>
                </motion.div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or employee no..."
                                value={search}
                                style={{ paddingLeft: '30px' }}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            />
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            {['all', 'active', 'inactive'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterActive(f)}
                                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${filterActive === f
                                        ? 'bg-white text-gray-800 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm"
                    >
                        <Plus size={16} />
                        Assign Pay Profile
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-t border-gray-100">
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade / Step</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Salary</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Effective From</th>
                                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center">
                                        <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                                        <p className="text-sm text-gray-400 mt-2">Loading pay profiles...</p>
                                    </td>
                                </tr>
                            ) : filteredProfiles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center">
                                        <Users size={32} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-sm text-gray-400">No pay profiles found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProfiles.map(profile => (
                                    <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div>
                                                <p className="font-medium text-gray-800">{profile.employee_name}</p>
                                                <p className="text-xs text-gray-400">{profile.employee_no}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {profile.job_grade_code ? (
                                                <div>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                                        {profile.job_grade_code}
                                                        {profile.step_number != null && ` / Step ${profile.step_number}`}
                                                    </span>
                                                    {profile.job_grade_name && (
                                                        <p className="text-xs text-gray-400 mt-0.5">{profile.job_grade_name}</p>
                                                    )}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                                            {formatCurrency(profile.basic_salary)}
                                        </td>
                                        <td className="px-5 py-3.5 text-gray-600">{profile.effective_from}</td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${profile.is_active
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {profile.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEdit(profile)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(profile.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 flex z-100 items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="px-4 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {editingProfile ? 'Edit Pay Profile' : 'Assign Pay Profile'}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {editingProfile ? 'Update salary grade and effective dates' : 'Assign a salary grade to an employee'}
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/80 rounded-xl transition-all">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5 overflow-y-auto flex-1">
                                {/* Section: Employee */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                                        <span className="text-sm font-semibold text-gray-700">Select Employee</span>
                                    </div>
                                    <div className="relative pl-8">
                                        {editingProfile ? (
                                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Users size={16} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{selectedEmployee?.name || empSearch}</p>
                                                    <p className="text-xs text-gray-400">{selectedEmployee?.employee_no || ''}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative" ref={empSearchRef}>
                                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={empSearch}
                                                        onChange={(e) => {
                                                            setEmpSearch(e.target.value);
                                                            if (selectedEmployee) {
                                                                setSelectedEmployee(null);
                                                                setForm(prev => ({ ...prev, employee: '' }));
                                                            }
                                                        }}
                                                        onFocus={() => empResults.length > 0 && setShowEmpDropdown(true)}
                                                        placeholder="Search by name or employee number..."
                                                        style={{ paddingLeft: '30px' }}
                                                        className="w-full pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                    />
                                                    {empLoading && (
                                                        <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                                                    )}
                                                </div>
                                                {showEmpDropdown && empResults.length > 0 && (
                                                    <div
                                                        ref={empDropdownRef}
                                                        className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto"
                                                    >
                                                        {empResults.map(emp => (
                                                            <button
                                                                key={emp.id}
                                                                onClick={() => handleSelectEmployee(emp)}
                                                                className="w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                                        {emp.first_name} {emp.last_name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400">{emp.employee_no}</p>
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{emp.department_name || ''}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {selectedEmployee && (
                                                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                        <p className="text-xs font-medium text-green-700">
                                                            {selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.employee_no})
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100" />

                                {/* Section: Grade & Step */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                                        <span className="text-sm font-semibold text-gray-700">Pay Grade & Step</span>
                                    </div>
                                    <div className="pl-8 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Grade</label>
                                            <select
                                                value={selectedGrade}
                                                onChange={(e) => handleGradeChange(e.target.value)}
                                                className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
                                            >
                                                <option value="">-- Select Grade --</option>
                                                {grades.map(g => (
                                                    <option key={g.id} value={g.id}>{g.code} — {g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Step</label>
                                            <select
                                                value={form.pay_grade_step}
                                                onChange={(e) => setForm(prev => ({ ...prev, pay_grade_step: e.target.value }))}
                                                className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                                disabled={!selectedGrade}
                                            >
                                                <option value="">{selectedGrade ? '-- Select Step --' : '-- Select a grade first --'}</option>
                                                {filteredSteps.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        Step {s.step_number} — {formatCurrency(s.amount)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Salary Card */}
                                        {selectedStepObj && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100/60"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-widest">Basic Salary</p>
                                                        <p className="text-2xl font-bold text-blue-700 mt-0.5 tracking-tight">
                                                            {formatCurrency(selectedStepObj.amount)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="inline-flex items-center px-2.5 py-1 bg-white/80 rounded-lg text-xs font-medium text-indigo-600 border border-indigo-100/60">
                                                            {selectedStepObj.job_grade_code} · Step {selectedStepObj.step_number}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100" />

                                {/* Section: Effective Period */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                                        <span className="text-sm font-semibold text-gray-700">Effective Period</span>
                                    </div>
                                    <div className="pl-8 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">From *</label>
                                                <input
                                                    type="date"
                                                    value={form.effective_from}
                                                    onChange={(e) => setForm(prev => ({ ...prev, effective_from: e.target.value }))}
                                                    className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">To (optional)</label>
                                                <input
                                                    type="date"
                                                    value={form.effective_to}
                                                    onChange={(e) => setForm(prev => ({ ...prev, effective_to: e.target.value }))}
                                                    className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Reason for Change</label>
                                            <textarea
                                                value={form.reason_for_change}
                                                onChange={(e) => setForm(prev => ({ ...prev, reason_for_change: e.target.value }))}
                                                placeholder="e.g., Annual increment, promotion, new hire..."
                                                rows={2}
                                                className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2.5 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={form.is_active}
                                                    onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5.5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                                                <div className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-[18px]" />
                                            </div>
                                            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Active profile</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <p className="text-xs text-gray-400">
                                    {selectedStepObj ? `Salary: ${formatCurrency(selectedStepObj.amount)}` : 'Select a grade & step'}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all text-sm font-medium shadow-sm"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : editingProfile ? 'Update Profile' : 'Assign Profile'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeePayProfiles;
