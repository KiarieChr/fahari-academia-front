import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const SubjectFormModal = ({ isOpen, onClose, onSave, initialData, curricula = [], curriculumLevels = [], learningAreas = [] }) => {
    const defaultData = {
        name: '',
        code: '',
        subject_type: 'compulsory',
        curriculum: '',
        curriculum_level: '',
        learning_area: '',
        weekly_lessons: 5,
        color_hex: '#3B82F6',
        is_active: true,
    };

    const [formData, setFormData] = useState(initialData || defaultData);

    // Reset on open if no initial data
    React.useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                name: initialData.name || '',
                code: initialData.code || '',
                subject_type: initialData.subject_type || 'compulsory',
                curriculum: initialData.curriculum || '',
                curriculum_level: initialData.curriculum_level || '',
                learning_area: initialData.learning_area || '',
                weekly_lessons: initialData.weekly_lessons || 5,
                color_hex: initialData.color_hex || '#3B82F6',
                is_active: initialData.is_active !== false,
            } : defaultData);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Send only non-empty fields
        const payload = { ...formData };
        if (!payload.curriculum_level) delete payload.curriculum_level;
        if (!payload.learning_area) delete payload.learning_area;
        onSave(payload);
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    // Filter levels by selected curriculum
    const filteredLevels = formData.curriculum
        ? curriculumLevels.filter(l => String(l.curriculum) === String(formData.curriculum))
        : curriculumLevels;

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
                                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Curriculum *</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.curriculum}
                                            onChange={(e) => { handleChange('curriculum', e.target.value); handleChange('curriculum_level', ''); }}
                                            required
                                        >
                                            <option value="">Select Curriculum</option>
                                            {curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Curriculum Level</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.curriculum_level}
                                            onChange={(e) => handleChange('curriculum_level', e.target.value)}
                                        >
                                            <option value="">All Levels</option>
                                            {filteredLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Learning Area</label>
                                        <select
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.learning_area}
                                            onChange={(e) => handleChange('learning_area', e.target.value)}
                                        >
                                            <option value="">None</option>
                                            {learningAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Col */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Subject Type</label>
                                    <select
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.subject_type}
                                        onChange={(e) => handleChange('subject_type', e.target.value)}
                                    >
                                        <option value="compulsory">Compulsory</option>
                                        <option value="optional">Optional</option>
                                        <option value="elective">Elective</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Weekly Lessons</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.weekly_lessons}
                                            onChange={(e) => handleChange('weekly_lessons', parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Color</label>
                                        <input
                                            type="color"
                                            className="w-full h-[38px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
                                            value={formData.color_hex}
                                            onChange={(e) => handleChange('color_hex', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 rounded"
                                            checked={formData.is_active}
                                            onChange={(e) => handleChange('is_active', e.target.checked)}
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
