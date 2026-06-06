import React, { useState } from 'react';
import { X, Calendar, DollarSign, AlertCircle, FileText, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddDeductionModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        employee: '',
        deductionType: 'Voluntary', // Voluntary, Statutory, Custom
        category: '', // SACCO, Insurance, etc.
        amountType: 'Fixed', // Fixed, Percentage
        amount: '',
        startDate: '',
        endDate: '',
        recurring: true,
        reason: '',
        priority: 'Normal'
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Add Employee Deduction</h2>
                            <p className="text-sm text-gray-500">Assign statutory or voluntary deductions</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* 1. Employee Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Employee</label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={formData.employee}
                                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                            >
                                <option value="">Search or select employee...</option>
                                <option value="EMP001">EMP001 - John Doe</option>
                                <option value="EMP002">EMP002 - Jane Smith</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Deduction Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deduction Type</label>
                                <div className="space-y-3">
                                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="deductionType"
                                            value="Voluntary"
                                            checked={formData.deductionType === 'Voluntary'}
                                            onChange={(e) => setFormData({ ...formData, deductionType: e.target.value })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Voluntary</span>
                                            <span className="text-xs text-gray-500">SACCO, Insurance, Welfare</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="radio"
                                            name="deductionType"
                                            value="Statutory"
                                            checked={formData.deductionType === 'Statutory'}
                                            onChange={(e) => setFormData({ ...formData, deductionType: e.target.value })}
                                            className="mt-1"
                                        />
                                        <div>
                                            <span className="block text-sm font-bold text-gray-800">Statutory Override</span>
                                            <span className="text-xs text-gray-500">Manual adjustment for TAX/NSSF</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category / Provider</label>
                                    <select
                                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={formData.deductionType === 'Statutory'}
                                    >
                                        <option value="">Select Category...</option>
                                        <option value="SACCO">SACCO Shares/Savings</option>
                                        <option value="Insurance">Insurance Premium</option>
                                        <option value="Welfare">Staff Welfare</option>
                                        <option value="Helb">HELB Loan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (KES)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                        <AlertCircle size={10} />
                                        Max deduction limit: KES 45,000 (1/3 Rule)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Dates & Frequency */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Effective Date</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="date" className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="date" className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Reason / Description</label>
                            <textarea
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                placeholder="e.g. Monthly Sacco Contribution"
                            ></textarea>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 max-w-[50%]">
                            <AlertCircle size={14} />
                            <span>Subject to "1/3 Net Pay" Rule</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
                                Cancel
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-black bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5">
                                Add Deduction
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddDeductionModal;
