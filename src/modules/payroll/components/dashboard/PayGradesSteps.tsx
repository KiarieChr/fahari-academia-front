import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Edit2, Trash2, X, Save, Loader2,
    ChevronDown, ChevronRight, Layers, DollarSign, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { payrollService } from '../../../../services/payrollService';
import '../../../../dashboard/dashboard.css';

const CATEGORIES = [
    { value: 'teaching', label: 'Teaching' },
    { value: 'non_teaching', label: 'Non-Teaching' },
    { value: 'management', label: 'Management' },
    { value: 'executive', label: 'Executive' },
];

const PayGradesSteps = () => {
    const [grades, setGrades] = useState([]);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedGrade, setExpandedGrade] = useState(null);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showStepModal, setShowStepModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [editingStep, setEditingStep] = useState(null);
    const [stepGradeId, setStepGradeId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [gradeForm, setGradeForm] = useState({
        code: '',
        name: '',
        category: 'teaching',
        min_salary: '',
        max_salary: '',
        currency: 'KES',
        grade_level: '',
        is_active: true,
    });

    const [stepForm, setStepForm] = useState({
        job_grade: '',
        step_number: '',
        amount: '',
        is_active: true,
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const gradesData = await payrollService.getJobGrades();
            setGrades(Array.isArray(gradesData) ? gradesData : gradesData.results || []);
        } catch (err) {
            console.error('Failed to load pay grades:', err);
            toast.error('Failed to load pay grades');
        }
        try {
            const stepsData = await payrollService.getPayGradeSteps();
            setSteps(Array.isArray(stepsData) ? stepsData : stepsData.results || []);
        } catch (err) {
            console.error('Failed to load pay grade steps:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredGrades = grades.filter(g =>
        g.code.toLowerCase().includes(search.toLowerCase()) ||
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredGrades.length / ITEMS_PER_PAGE);
    const paginatedGrades = filteredGrades.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const getStepsForGrade = (gradeId) =>
        steps.filter(s => s.job_grade === gradeId).sort((a, b) => a.step_number - b.step_number);

    const formatCurrency = (amount, currency = 'KES') => {
        if (!amount) return '-';
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Grade CRUD
    const openCreateGrade = () => {
        setEditingGrade(null);
        setGradeForm({
            code: '', name: '', category: 'teaching',
            min_salary: '', max_salary: '', currency: 'KES',
            grade_level: '', is_active: true,
        });
        setShowGradeModal(true);
    };

    const openEditGrade = (grade) => {
        setEditingGrade(grade);
        setGradeForm({
            code: grade.code,
            name: grade.name,
            category: grade.category,
            min_salary: grade.min_salary,
            max_salary: grade.max_salary,
            currency: grade.currency || 'KES',
            grade_level: grade.grade_level,
            is_active: grade.is_active,
        });
        setShowGradeModal(true);
    };

    const handleSaveGrade = async () => {
        if (!gradeForm.code || !gradeForm.name) {
            toast.error('Code and name are required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...gradeForm,
                min_salary: parseFloat(gradeForm.min_salary) || 0,
                max_salary: parseFloat(gradeForm.max_salary) || 0,
                grade_level: parseInt(gradeForm.grade_level) || 1,
            };
            if (editingGrade) {
                await payrollService.updateJobGrade(editingGrade.id, payload);
                toast.success('Grade updated');
            } else {
                await payrollService.createJobGrade(payload);
                toast.success('Grade created');
            }
            setShowGradeModal(false);
            fetchData();
        } catch (error) {
            const detail = error?.data;
            const msg = typeof detail === 'object' ? Object.values(detail).flat().join(', ') : (error.message || 'Failed to save grade');
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGrade = async (id) => {
        if (!window.confirm('Delete this grade and all its steps?')) return;
        try {
            await payrollService.deleteJobGrade(id);
            toast.success('Grade deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete grade');
        }
    };

    // Step CRUD
    const openCreateStep = (gradeId) => {
        setEditingStep(null);
        setStepGradeId(gradeId);
        const existing = getStepsForGrade(gradeId);
        const nextStep = existing.length > 0 ? Math.max(...existing.map(s => s.step_number)) + 1 : 1;
        setStepForm({
            job_grade: gradeId,
            step_number: nextStep,
            amount: '',
            is_active: true,
        });
        setShowStepModal(true);
    };

    const openEditStep = (step) => {
        setEditingStep(step);
        setStepGradeId(step.job_grade);
        setStepForm({
            job_grade: step.job_grade,
            step_number: step.step_number,
            amount: step.amount,
            is_active: step.is_active,
        });
        setShowStepModal(true);
    };

    const handleSaveStep = async () => {
        if (!stepForm.amount || !stepForm.step_number) {
            toast.error('Step number and amount are required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                job_grade: stepForm.job_grade,
                step_number: parseInt(stepForm.step_number),
                amount: parseFloat(stepForm.amount),
                is_active: stepForm.is_active,
            };
            if (editingStep) {
                await payrollService.updatePayGradeStep(editingStep.id, payload);
                toast.success('Step updated');
            } else {
                await payrollService.createPayGradeStep(payload);
                toast.success('Step created');
            }
            setShowStepModal(false);
            fetchData();
        } catch (error) {
            const detail = error?.data;
            const msg = typeof detail === 'object' ? Object.values(detail).flat().join(', ') : (error.message || 'Failed to save step');
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteStep = async (id) => {
        if (!window.confirm('Delete this step?')) return;
        try {
            await payrollService.deletePayGradeStep(id);
            toast.success('Step deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete step');
        }
    };

    const toggleGrade = (id) => setExpandedGrade(prev => prev === id ? null : id);

    // Stats
    const totalGrades = grades.length;
    const totalSteps = steps.length;
    const activeGrades = grades.filter(g => g.is_active).length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="row g-4">
                <div className="col-md-4">
                <motion.div 
                    className="mini-stat-card-premium stat-indigo relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#4f46e5', '--icon-bg': '#e0e7ff' }}>
                            <Layers size={16} />
                        </div>
                        <span className="stat-label-modern">Total Grades</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{totalGrades}</div>
                    </div>
                </motion.div>
                </div>

                <div className="col-md-4">
                <motion.div 
                    className="mini-stat-card-premium stat-emerald relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#059669', '--icon-bg': '#d1fae5' }}>
                            <Award size={16} />
                        </div>
                        <span className="stat-label-modern">Active Grades</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{activeGrades}</div>
                    </div>
                </motion.div>
                </div>

                <div className="col-md-4">
                <motion.div 
                    className="mini-stat-card-premium stat-blue relative overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top relative z-10">
                        <div className="stat-icon-glow" style={{ '--icon-color': '#2563eb', '--icon-bg': '#dbeafe' }}>
                            <DollarSign size={16} />
                        </div>
                        <span className="stat-label-modern">Total Steps</span>
                    </div>
                    <div className="card-bottom mt-2 relative z-10">
                        <div className="stat-value-large">{totalSteps}</div>
                    </div>
                </motion.div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
                <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search grades..."
                            value={search}
                            style= {{paddingLeft:'15px'}}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                        />
                    </div>
                    <button
                        onClick={openCreateGrade}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm"
                    >
                        <Plus size={16} />
                        Add Grade
                    </button>
                </div>

                {/* Grades Accordion */}
                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="px-5 py-12 text-center">
                            <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                            <p className="text-sm text-gray-400 mt-2">Loading grades...</p>
                        </div>
                    ) : filteredGrades.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                            <Layers size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400">No pay grades found</p>
                        </div>
                    ) : (
                        paginatedGrades.map(grade => {
                            const gradeSteps = getStepsForGrade(grade.id);
                            const isExpanded = expandedGrade === grade.id;
                            return (
                                <div key={grade.id} className="border-t border-gray-100 first:border-t-0">
                                    {/* Grade Header */}
                                    <div
                                        className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => toggleGrade(grade.id)}
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                                transition={{ duration: 0.15 }}
                                            >
                                                <ChevronRight size={16} className="text-gray-400" />
                                            </motion.div>
                                            <div className="flex items-center gap-3">
                                                <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold">
                                                    {grade.code}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-gray-800">{grade.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {CATEGORIES.find(c => c.value === grade.category)?.label || grade.category}
                                                        {' · Level '}{grade.grade_level}
                                                        {' · '}{gradeSteps.length} step{gradeSteps.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right mr-4">
                                                <p className="text-xs text-gray-400">Salary Range</p>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {formatCurrency(grade.min_salary, grade.currency)} — {formatCurrency(grade.max_salary, grade.currency)}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${grade.is_active
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {grade.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => openEditGrade(grade)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Edit Grade"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGrade(grade.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Grade"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Steps Table */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-4 pl-14">
                                                    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary Steps</span>
                                                            <button
                                                                onClick={() => openCreateStep(grade.id)}
                                                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-all"
                                                            >
                                                                <Plus size={12} />
                                                                Add Step
                                                            </button>
                                                        </div>
                                                        {gradeSteps.length === 0 ? (
                                                            <div className="px-4 py-6 text-center">
                                                                <p className="text-sm text-gray-400">No steps defined. Click "Add Step" to create one.</p>
                                                            </div>
                                                        ) : (
                                                            <table className="w-full text-sm">
                                                                <thead>
                                                                    <tr className="border-b border-gray-100">
                                                                        <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Step</th>
                                                                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Amount</th>
                                                                        <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500">Status</th>
                                                                        <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {gradeSteps.map((step, idx) => (
                                                                        <tr key={step.id} className="hover:bg-white/60 transition-colors">
                                                                            <td className="px-4 py-2.5">
                                                                                <span className="inline-flex items-center justify-center w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                                                                                    {step.step_number}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-2.5 text-right font-semibold text-gray-800">
                                                                                {formatCurrency(step.amount, grade.currency)}
                                                                                {idx > 0 && (
                                                                                    <span className="text-xs text-green-600 ml-2">
                                                                                        +{formatCurrency(step.amount - gradeSteps[idx - 1].amount, grade.currency)}
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-2.5 text-center">
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${step.is_active
                                                                                    ? 'bg-green-50 text-green-700'
                                                                                    : 'bg-gray-100 text-gray-500'
                                                                                }`}>
                                                                                    {step.is_active ? 'Active' : 'Inactive'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-2.5 text-right">
                                                                                <div className="flex items-center justify-end gap-1">
                                                                                    <button
                                                                                        onClick={() => openEditStep(step)}
                                                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                                    >
                                                                                        <Edit2 size={13} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteStep(step.id)}
                                                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                                    >
                                                                                        <Trash2 size={13} />
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredGrades.length > 0 && totalPages > 1 && (
                    <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredGrades.length)} of {filteredGrades.length} grades
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Previous
                            </button>
                            <div className="flex items-center px-2 text-sm font-semibold text-gray-700">
                                Page {currentPage} of {totalPages}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Grade Modal */}
            <AnimatePresence>
                {showGradeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowGradeModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {editingGrade ? 'Edit Grade' : 'New Grade'}
                                </h3>
                                <button onClick={() => setShowGradeModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Code *</label>
                                        <input
                                            type="text"
                                            value={gradeForm.code}
                                            onChange={e => setGradeForm(p => ({ ...p, code: e.target.value }))}
                                            placeholder="e.g., T1"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                                        <input
                                            type="text"
                                            value={gradeForm.name}
                                            onChange={e => setGradeForm(p => ({ ...p, name: e.target.value }))}
                                            placeholder="e.g., Teacher Grade 1"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                        <select
                                            value={gradeForm.category}
                                            onChange={e => setGradeForm(p => ({ ...p, category: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        >
                                            {CATEGORIES.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade Level</label>
                                        <input
                                            type="number"
                                            value={gradeForm.grade_level}
                                            onChange={e => setGradeForm(p => ({ ...p, grade_level: e.target.value }))}
                                            placeholder="1"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Salary</label>
                                        <input
                                            type="number"
                                            value={gradeForm.min_salary}
                                            onChange={e => setGradeForm(p => ({ ...p, min_salary: e.target.value }))}
                                            placeholder="0"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Salary</label>
                                        <input
                                            type="number"
                                            value={gradeForm.max_salary}
                                            onChange={e => setGradeForm(p => ({ ...p, max_salary: e.target.value }))}
                                            placeholder="0"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                                        <select
                                            value={gradeForm.currency}
                                            onChange={e => setGradeForm(p => ({ ...p, currency: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        >
                                            <option value="KES">KES</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={gradeForm.is_active}
                                        onChange={e => setGradeForm(p => ({ ...p, is_active: e.target.checked }))}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                                <button onClick={() => setShowGradeModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button onClick={handleSaveGrade} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving...' : editingGrade ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Step Modal */}
            <AnimatePresence>
                {showStepModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowStepModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {editingStep ? 'Edit Step' : 'New Step'}
                                </h3>
                                <button onClick={() => setShowStepModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Grade</label>
                                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                                        {grades.find(g => g.id === stepGradeId)?.code} — {grades.find(g => g.id === stepGradeId)?.name}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Step Number *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={stepForm.step_number}
                                        onChange={e => setStepForm(p => ({ ...p, step_number: e.target.value }))}
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary Amount *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={stepForm.amount}
                                        onChange={e => setStepForm(p => ({ ...p, amount: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={stepForm.is_active}
                                        onChange={e => setStepForm(p => ({ ...p, is_active: e.target.checked }))}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                                    />
                                    <span className="text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                                <button onClick={() => setShowStepModal(false)}
                                    className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button onClick={handleSaveStep} disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 text-sm font-medium">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {saving ? 'Saving...' : editingStep ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PayGradesSteps;
