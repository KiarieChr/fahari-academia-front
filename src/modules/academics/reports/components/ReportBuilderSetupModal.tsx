import React, { useState } from 'react';
import { X, ArrowRight, Settings, Users, Calendar, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportBuilderSetupModal = ({ isOpen, onClose, curriculum }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        year: '2024',
        term: 'Term 3',
        class: '',
        stream: 'All Streams',
        student: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/dashboard/academics/reports/builder', {
            state: {
                ...formData,
                curriculum
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-[50vw] max-w-lg h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden overflow-y-auto">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Settings className="text-blue-600" size={24} />
                            Report Builder Setup
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Configure the context before entering the builder.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Academic Session */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={14} /> Year
                            </label>
                            <select
                                required
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={14} /> Term
                            </label>
                            <select
                                required
                                value={formData.term}
                                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="Term 1">Term 1</option>
                                <option value="Term 2">Term 2</option>
                                <option value="Term 3">Term 3</option>
                            </select>
                        </div>
                    </div>

                    {/* Class & Student Context */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> Target Class
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    required
                                    value={formData.class}
                                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">Select Class</option>
                                    <option value="Grade 1">Grade 1</option>
                                    <option value="Grade 2">Grade 2</option>
                                    <option value="Grade 3">Grade 3</option>
                                    <option value="Grade 4">Grade 4</option>
                                    <option value="Class 8">Class 8</option>
                                </select>
                                <select
                                    value={formData.stream}
                                    onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="All Streams">All Streams</option>
                                    <option value="Red">Red</option>
                                    <option value="Blue">Blue</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Users size={14} /> Specific Student (Optional)
                            </label>
                            <select
                                value={formData.student}
                                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Entire Class (Bulk Mode)</option>
                                <option value="ADM-001">Alex Johnson (ADM-001)</option>
                                <option value="ADM-002">Sarah Williams (ADM-002)</option>
                            </select>
                            <p className="text-xs text-slate-400">Leave blank to open builder for the whole class.</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 items-start">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                            <Settings size={18} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm">Builder Configuration</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                                The Report Builder allows you to customize layout, add remarks, and preview the final PDF.
                                You are setting up the builder for <strong>{curriculum}</strong> curriculum.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-black font-bold text-sm rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <span>Launch Builder</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportBuilderSetupModal;
