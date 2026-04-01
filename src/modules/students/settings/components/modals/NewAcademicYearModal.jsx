import React, { useState } from 'react';
import { X, Save, Calendar, Info } from 'lucide-react';
import { toast } from 'react-toastify';

const NewAcademicYearModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            toast.error('End date must be after start date');
            return;
        }

        if (onSave) onSave(formData);
        setFormData({
            name: '',
            start_date: '',
            end_date: '',
            description: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3.5">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">New Academic Year</h2>
                            <p className="text-[0.8rem] text-gray-400 mt-0.5">Define a new academic calendar period</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Academic Year Name</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3.5 top-3 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all"
                                placeholder="e.g. 2026/2027"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Start Date</label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm text-gray-600 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 block mb-1.5">End Date</label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm text-gray-600 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-1.5">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm h-20 resize-none transition-all"
                            placeholder="Add any notes about this academic year..."
                        />
                    </div>

                    <div className="flex items-start gap-2.5 bg-blue-50/80 border border-blue-100 p-3.5 rounded-xl text-xs text-blue-700 leading-relaxed">
                        <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                        <p>Creating a new academic year will not automatically make it active. You can set it as active from the list after creation.</p>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all"
                    >
                        <Save size={15} /> Create Year
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewAcademicYearModal;

