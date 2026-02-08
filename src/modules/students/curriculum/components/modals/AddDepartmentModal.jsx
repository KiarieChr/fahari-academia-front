import React, { useState } from 'react';
import { X, Save, GraduationCap, User, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const AddDepartmentModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        hod: '',
        members: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Department Name is required');
            return;
        }

        toast.success(`Department "${formData.name}" Created`);
        if (onSave) onSave(formData);

        onClose();
        setFormData({ name: '', hod: '', members: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">New Department</h2>
                        <p className="text-sm text-gray-500">Create an academic or non-academic department.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Department Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Department Name</label>
                        <div className="relative">
                            <GraduationCap size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="e.g. Mathematics, Guidance & Counseling"
                            />
                        </div>
                    </div>

                    {/* Head of Department */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Head of Department (HOD)</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.hod}
                                onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="Select Staff Member"
                            />
                        </div>
                    </div>

                    {/* Initial Members Count or Description */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Est. Members Count</label>
                        <div className="relative">
                            <Users size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="number"
                                value={formData.members}
                                onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="0"
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
                            <Save size={16} /> Create Dept
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDepartmentModal;

