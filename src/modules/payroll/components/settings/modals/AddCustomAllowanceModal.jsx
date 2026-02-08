import React, { useState } from 'react';
import { X, Save, Plus, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AddCustomAllowanceModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isTaxable: true,
        calculationMethod: 'Fixed Amount',
        defaultValue: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(`Allowance "${formData.name}" Added Successfully`);
        onClose();
        setFormData({
            name: '',
            description: '',
            isTaxable: true,
            calculationMethod: 'Fixed Amount',
            defaultValue: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">New Allowance</h2>
                        <p className="text-sm text-gray-500">Define a custom allowance type</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Name & Description */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Allowance Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="e.g. Risk Allowance, Entertainment"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="Brief description of purpose"
                            />
                        </div>
                    </div>

                    {/* Tax Logic */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tax Configuration</span>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="taxable"
                                    checked={formData.isTaxable}
                                    onChange={() => setFormData({ ...formData, isTaxable: true })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Taxable Income</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="taxable"
                                    checked={!formData.isTaxable}
                                    onChange={() => setFormData({ ...formData, isTaxable: false })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Non-Taxable Benefit</span>
                            </label>
                        </div>
                        {!formData.isTaxable && (
                            <div className="mt-3 text-xs text-orange-600 flex items-center gap-1.5">
                                <AlertCircle size={14} /> Ensure this complies with KRA tax exemption policies.
                            </div>
                        )}
                    </div>

                    {/* Calculation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Calculation Method</label>
                            <div className="relative">
                                <Calculator size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                <select
                                    value={formData.calculationMethod}
                                    onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none"
                                >
                                    <option>Fixed Amount</option>
                                    <option>% of Basic Salary</option>
                                    <option>% of Gross Pay</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Default Value</label>
                            <div className="relative">
                                <div className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">
                                    {formData.calculationMethod.includes('%') ? '%' : 'KES'}
                                </div>
                                <input
                                    type="number"
                                    value={formData.defaultValue}
                                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder="0.00"
                                />
                            </div>
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
                            className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm shadow-blue-200 flex items-center gap-2"
                        >
                            <Save size={16} /> Save Allowance
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomAllowanceModal;

