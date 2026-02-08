import React, { useState } from 'react';
import { X, Save, Layers, User } from 'lucide-react';
import { toast } from 'react-toastify';

const AddLearningAreaModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        head: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Area Name is required');
            return;
        }

        toast.success(`Learning Area "${formData.name}" Created`);
        if (onSave) onSave(formData);

        onClose();
        setFormData({ name: '', head: '', description: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">New Learning Area</h2>
                        <p className="text-sm text-gray-500">Define a broad academic category.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Area Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Area Name</label>
                        <div className="relative">
                            <Layers size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="e.g. Humanities, Sciences"
                            />
                        </div>
                    </div>

                    {/* Head of Department */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Head of Area (Optional)</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.head}
                                onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="Staff Name"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 placeholder:text-gray-300"
                            placeholder="Brief description..."
                        />
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
                            <Save size={16} /> Create Area
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLearningAreaModal;

