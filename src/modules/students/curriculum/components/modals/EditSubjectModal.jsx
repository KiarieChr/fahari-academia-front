import React, { useState, useEffect } from 'react';
import { X, Save, Book, Hash, GraduationCap, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const EditSubjectModal = ({ isOpen, onClose, subject, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        area: '',
        classes: '',
        type: 'Compulsory'
    });

    useEffect(() => {
        if (subject) {
            setFormData({
                name: subject.name,
                code: subject.code,
                area: subject.area,
                classes: subject.classes,
                type: subject.type
            });
        }
    }, [subject]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.code) {
            toast.error('Subject Name and Code are required');
            return;
        }

        toast.success(`Subject updated successfully`);
        if (onSave) onSave({ ...subject, ...formData });

        onClose();
    };

    if (!isOpen || !subject) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Edit Subject</h2>
                        <p className="text-sm text-gray-500">Update subject details.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Subject Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Subject Name</label>
                        <div className="relative">
                            <Book size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Subject Code */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Subject Code</label>
                        <div className="relative">
                            <Hash size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300 font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Learning Area */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Learning Area</label>
                            <div className="relative">
                                <GraduationCap size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                <select
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                >
                                    <option value="Sciences">Sciences</option>
                                    <option value="Languages">Languages</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Creative Arts">Creative Arts</option>
                                </select>
                            </div>
                        </div>

                        {/* Subject Type */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                            >
                                <option value="Compulsory">Compulsory</option>
                                <option value="Optional">Optional</option>
                                <option value="Elective">Elective</option>
                            </select>
                        </div>
                    </div>

                    {/* Classes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Classes Covered</label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.classes}
                                onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="e.g. All, Grade 4-6"
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

export default EditSubjectModal;

