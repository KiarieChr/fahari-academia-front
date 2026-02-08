import React, { useState } from 'react';
import { X, Save, PiggyBank, Landmark, Users, HelpCircle, Calculator } from 'lucide-react';
import { toast } from 'react-toastify';

const AddDeductionModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Loan',
        calculationMethod: 'Fixed Amount',
        frequency: 'Monthly',
        isReliefEligible: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(`Deduction "${formData.name}" Added Successfully`);
        onClose();
        setFormData({
            name: '',
            category: 'Loan',
            calculationMethod: 'Fixed Amount',
            frequency: 'Monthly',
            isReliefEligible: false
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add New Deduction</h2>
                        <p className="text-sm text-gray-500">Voluntary or policy based deduction</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Deduction Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm placeholder:text-gray-300"
                            placeholder="e.g. Staff Welfare, Bank Loan"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-3">Category</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'Loan', icon: Landmark, label: 'Loan / Advance' },
                                { id: 'Savings', icon: PiggyBank, label: 'Sacco / Savings' },
                                { id: 'Union', icon: Users, label: 'Union Dues' },
                                { id: 'Other', icon: HelpCircle, label: 'Other' },
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.category === cat.id
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                >
                                    <cat.icon size={18} />
                                    <span className="text-sm font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logic Config */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Calculation</label>
                            <select
                                value={formData.calculationMethod}
                                onChange={(e) => setFormData({ ...formData, calculationMethod: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                            >
                                <option>Fixed Amount</option>
                                <option>% of Basic Pay</option>
                                <option>% of Gross Pay</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Frequency</label>
                            <select
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
                            >
                                <option>Monthly</option>
                                <option>One-Time</option>
                                <option>Annually</option>
                            </select>
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
                            className="px-4 py-2 bg-red-600 text-black rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm shadow-red-200 flex items-center gap-2"
                        >
                            <Save size={16} /> Save Deduction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDeductionModal;

