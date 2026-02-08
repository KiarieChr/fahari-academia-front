import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';

const AllocationFormModal = ({ isOpen, onClose, onSave, initialData, teachers, classes, subjects }) => {
    const defaultData = {
        class: classes[0],
        subject: subjects[0].name,
        teacherId: '',
        lessons: 5,
        category: 'Core',
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialData || defaultData);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || defaultData);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field, value) => {
        setFormData(prev => {
            const updates = { [field]: value };
            // Auto update default lessons if subject changes
            if (field === 'subject') {
                const subj = subjects.find(s => s.name === value);
                if (subj) {
                    updates.lessons = subj.defaultLessons;
                    updates.category = subj.category;
                }
            }
            return { ...prev, ...updates };
        });
    };

    // Calculate teacher availability check (Mock)
    const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
    const willOverload = selectedTeacher ? (selectedTeacher.currentLoad + Number(formData.lessons) > selectedTeacher.maxLoad) : false;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {initialData ? 'Edit Allocation' : 'New Assignment'}
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Class</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.class}
                                        onChange={(e) => handleChange('class', e.target.value)}
                                        disabled={!!initialData} // Cannot change class on edit commonly
                                    >
                                        {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.subject}
                                        onChange={(e) => handleChange('subject', e.target.value)}
                                        disabled={!!initialData}
                                    >
                                        {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Assign Teacher</label>
                                <select
                                    className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${willOverload ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200 dark:border-slate-700'}`}
                                    value={formData.teacherId}
                                    onChange={(e) => handleChange('teacherId', e.target.value)}
                                >
                                    <option value="">-- Select Teacher --</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} (Load: {t.currentLoad}/{t.maxLoad})
                                        </option>
                                    ))}
                                </select>
                                {willOverload && (
                                    <div className="flex items-start gap-2 mt-2 text-amber-600 text-xs font-medium">
                                        <AlertCircle size={14} className="mt-0.5" />
                                        Warning: This assignment will overload the teacher.
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Weekly Lessons</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.lessons}
                                        onChange={(e) => handleChange('lessons', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500"
                                        value={formData.category}
                                    />
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
                                <Check size={18} /> Confirm Allocation
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AllocationFormModal;
