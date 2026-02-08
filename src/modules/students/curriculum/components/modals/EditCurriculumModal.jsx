import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Layers, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';

const EditCurriculumModal = ({ isOpen, onClose, curriculum, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        classes: '',
        subjects: 0
    });

    useEffect(() => {
        if (curriculum) {
            setFormData({
                name: curriculum.name,
                level: curriculum.level,
                classes: curriculum.classes,
                subjects: curriculum.subjects
            });
        }
    }, [curriculum]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Curriculum Name is required');
            return;
        }

        toast.success(`Curriculum updated successfully`);
        if (onSave) onSave({ ...curriculum, ...formData });

        onClose();
    };

    if (!isOpen || !curriculum) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Edit Curriculum</h2>
                        <p className="text-sm text-gray-500">Update curriculum details.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Curriculum Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Curriculum Name</label>
                        <div className="relative">
                            <BookOpen size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Level */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Education Level</label>
                        <div className="relative">
                            <GraduationCap size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                            >
                                <option value="Pre-Primary">Pre-Primary</option>
                                <option value="Primary">Primary</option>
                                <option value="Secondary">Secondary</option>
                                <option value="International">International</option>
                                <option value="Tertiary">Tertiary</option>
                            </select>
                        </div>
                    </div>

                    {/* Classes Covered */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Classes / Grades Covered</label>
                        <div className="relative">
                            <Layers size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.classes}
                                onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="e.g. Grade 1 - 6"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm shadow-indigo-200 flex items-center gap-2"
                        >
                            <Save size={16} /> Update Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCurriculumModal;

