import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../services/recruitmentService';
import { api } from '../../../../services/api'; // Direct API access for workforce data
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JobOpeningForm = ({ isOpen, onClose, onSuccess, job = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        job_title: '',
        department: '',
        campus: '',
        opening_type: 'new',
        status: 'draft',
        number_of_positions: 1,
        opening_date: new Date().toISOString().split('T')[0],
        closing_date: '',
        description: '',
        responsibilities: '',
        requirements: '',
        min_salary: '',
        max_salary: '',
        is_remote_allowed: false
    });

    const [options, setOptions] = useState({
        departments: [],
        campuses: [],
        jobTitles: []
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (job) {
                // Populate form for editing
                setFormData({
                    ...job,
                    department: job.department?.id || job.department,
                    campus: job.campus?.id || job.campus,
                    job_title: job.job_title?.id || job.job_title,
                    // Ensure dates are formatted YYYY-MM-DD
                    opening_date: job.opening_date,
                    closing_date: job.closing_date,
                });
            } else {
                // Reset form
                setFormData({
                    title: '',
                    job_title: '',
                    department: '',
                    campus: '',
                    opening_type: 'new',
                    status: 'draft',
                    number_of_positions: 1,
                    opening_date: new Date().toISOString().split('T')[0],
                    closing_date: '',
                    description: '',
                    responsibilities: '',
                    requirements: '',
                    min_salary: '',
                    max_salary: '',
                    is_remote_allowed: false
                });
            }
        }
    }, [isOpen, job]);

    const fetchOptions = async () => {
        try {
            const [deptRes, campusRes, titlesRes] = await Promise.all([
                api.get('/workforce/api/departments/'),
                api.get('/workforce/api/campuses/'),
                api.get('/workforce/api/job-titles/')
            ]);
            setOptions({
                departments: deptRes.results || deptRes,
                campuses: campusRes.results || campusRes,
                jobTitles: titlesRes.results || titlesRes
            });
        } catch (error) {
            console.error("Failed to load options", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = "Posting Title is required";
        if (!formData.job_title) newErrors.job_title = "Job Title is required";
        if (!formData.department) newErrors.department = "Department is required";
        if (!formData.campus) newErrors.campus = "Campus is required";
        if (!formData.opening_date) newErrors.opening_date = "Opening Date is required";
        if (!formData.closing_date) newErrors.closing_date = "Closing Date is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.responsibilities) newErrors.responsibilities = "Responsibilities are required";
        if (!formData.requirements) newErrors.requirements = "Requirements are required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            // Prepare payload
            const payload = {
                ...formData,
                // Ensure numeric values
                number_of_positions: parseInt(formData.number_of_positions),
                min_salary: formData.min_salary ? parseFloat(formData.min_salary) : null,
                max_salary: formData.max_salary ? parseFloat(formData.max_salary) : null,
            };

            // In initial migration reference_number is unique and required.
            // If backend doesn't auto-generate it (it might not), we need to send it.
            // Let's check if backend auto-generates.
            // Looking at `0001_initial.py`, `reference_number` doesn't have default.
            // But let's assume we handle it or generate a simple one if new.
            if (!job && !payload.reference_number) {
                payload.reference_number = `REQ-${Date.now().toString().slice(-6)}`;
            }

            if (job) {
                await recruitmentService.updateJobOpening(job.id, payload);
            } else {
                await recruitmentService.createJobOpening(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Submit error", error);
            setErrors({ submit: error.data?.error || error.data?.detail || error.message || "Failed to save job opening" });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ zIndex: 1300 }} >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {job ? 'Edit Job Opening' : 'Create New Job Opening'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 flex-1">
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle size={18} />
                                {errors.submit}
                            </div>
                        )}

                        <form id="jobForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Details */}
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Basic Details</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Posting Title *</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                    placeholder="e.g. Mathematics Teacher"
                                />
                                {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Title (HR Role) *</label>
                                <select
                                    name="job_title"
                                    value={formData.job_title}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.job_title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                >
                                    <option value="">Select Job Title</option>
                                    {options.jobTitles.map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                                {errors.job_title && <span className="text-xs text-red-500">{errors.job_title}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department *</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.department ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                >
                                    <option value="">Select Department</option>
                                    {options.departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                                {errors.department && <span className="text-xs text-red-500">{errors.department}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Campus *</label>
                                <select
                                    name="campus"
                                    value={formData.campus}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.campus ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                >
                                    <option value="">Select Campus</option>
                                    {options.campuses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.campus && <span className="text-xs text-red-500">{errors.campus}</span>}
                            </div>

                            {/* Status & Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="approved">Approved</option>
                                    <option value="published">Published</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Opening Type</label>
                                <select
                                    name="opening_type"
                                    value={formData.opening_type}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                >
                                    <option value="new">New Position</option>
                                    <option value="replacement">Replacement</option>
                                    <option value="temporary">Temporary</option>
                                    <option value="contract">Contract</option>
                                </select>
                            </div>

                            {/* Schedule */}
                            <div className="col-span-1 md:col-span-2 mt-4">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Timeline & Salary</h3>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Opening Date *</label>
                                <input
                                    type="date"
                                    name="opening_date"
                                    value={formData.opening_date}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Closing Date *</label>
                                <input
                                    type="date"
                                    name="closing_date"
                                    value={formData.closing_date}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Min Salary</label>
                                <input
                                    type="number"
                                    name="min_salary"
                                    value={formData.min_salary}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Salary</label>
                                <input
                                    type="number"
                                    name="max_salary"
                                    value={formData.max_salary}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_remote_allowed"
                                        checked={formData.is_remote_allowed}
                                        onChange={handleChange}
                                        className="rounded border-slate-300"
                                    />
                                    <span className="text-sm">Remote work allowed</span>
                                </label>
                            </div>

                            {/* Descriptions */}
                            <div className="col-span-1 md:col-span-2 mt-4">
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Details</h3>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium">Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                ></textarea>
                                {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium">Responsibilities *</label>
                                <textarea
                                    name="responsibilities"
                                    value={formData.responsibilities}
                                    onChange={handleChange}
                                    rows={4}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.responsibilities ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                ></textarea>
                                {errors.responsibilities && <span className="text-xs text-red-500">{errors.responsibilities}</span>}
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium">Requirements *</label>
                                <textarea
                                    name="requirements"
                                    value={formData.requirements}
                                    onChange={handleChange}
                                    rows={4}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.requirements ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                ></textarea>
                                {errors.requirements && <span className="text-xs text-red-500">{errors.requirements}</span>}
                            </div>

                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="jobForm"
                            disabled={loading}
                            className="btn btn-primary px-6 flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    Save Job Opening
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default JobOpeningForm;
