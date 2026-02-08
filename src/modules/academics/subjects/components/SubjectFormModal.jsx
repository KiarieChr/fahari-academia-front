import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { curriculumOptions, categoryOptions } from '../data/subjectsData';

const SubjectFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const defaultData = {
        name: '',
        code: '',
        category: 'Core',
        type: 'Theory',
        curriculum: 'CBC',
        description: '',
        isGraded: true,
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialData || defaultData);

    // Reset on open if no initial data
    React.useEffect(() => {
        if (isOpen) {
            setFormData(initialData || defaultData);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {initialData ? 'Edit Subject' : 'Add New Subject'}
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Col */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject Name *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Mathematics"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject Code *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                            placeholder="MAT"
                                            value={formData.code}
                                            onChange={(e) => handleChange('code', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Curriculum</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.curriculum}
                                            onChange={(e) => handleChange('curriculum', e.target.value)}
                                        >
                                            {curriculumOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                                        placeholder="Brief description of the subject..."
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            {/* Right Col */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                    >
                                        {categoryOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject Type</label>
                                    <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => handleChange('type', 'Theory')}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.type === 'Theory' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Theory
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleChange('type', 'Practical')}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.type === 'Practical' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Practical
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 rounded"
                                            checked={formData.isGraded}
                                            onChange={(e) => handleChange('isGraded', e.target.checked)}
                                        />
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-white">Graded Subject</div>
                                            <div className="text-xs text-slate-500">Subject appears on report cards</div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 rounded"
                                            checked={formData.status === 'Active'}
                                            onChange={(e) => handleChange('status', e.target.checked ? 'Active' : 'Inactive')}
                                        />
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 dark:text-white">Active Status</div>
                                            <div className="text-xs text-slate-500">Enable this subject for assignment</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-black font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2"
                            >
                                <Check size={18} /> Save Subject
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SubjectFormModal;
