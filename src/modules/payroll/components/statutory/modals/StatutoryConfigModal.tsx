import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const StatutoryConfigModal = ({ body, onClose }) => {
    const [formData, setFormData] = useState({
        ref: '',
        deadline: '',
        status: 'Active',
        calcBase: 'Gross Pay',
        notes: ''
    });

    useEffect(() => {
        if (body) {
            setFormData({
                ref: body.ref || '',
                deadline: body.deadline || '9th of Following Month',
                status: body.status || 'Active',
                calcBase: body.calcBase || 'Gross Pay',
                notes: body.notes || ''
            });
        }
    }, [body]);

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(`Settings for ${body.name} updated successfully!`);
        onClose();
    };

    if (!body) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Configure Settings</h2>
                        <p className="text-sm text-gray-500 truncate max-w-[18rem]">Settings for {body.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Status & Reference */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Pending Setup</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Reference / Account No.</label>
                            <input
                                type="text"
                                value={formData.ref}
                                onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                            />
                        </div>
                    </div>

                    {/* Deadline & Base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Submission Date</label>
                            <input
                                type="text"
                                placeholder="e.g. 9th of Month"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Calculation Base</label>
                            <select
                                value={formData.calcBase}
                                onChange={(e) => setFormData({ ...formData, calcBase: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                                <option>Gross Pay</option>
                                <option>Basic Pay</option>
                                <option>Net Pay</option>
                                <option>Fixed Amount</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Compliance Notes</label>
                        <textarea
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                            placeholder="Add internal notes about this statutory body..."
                        />
                    </div>

                    {/* Info Alert */}
                    <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex gap-2 items-start">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        Changes to reference numbers and calculation bases will affect the next payroll generation. Previous records remain unchanged.
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
                            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm shadow-blue-200 flex items-center gap-2"
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatutoryConfigModal;

