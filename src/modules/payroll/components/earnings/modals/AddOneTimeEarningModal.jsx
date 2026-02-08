import React, { useState } from 'react';
import { X, Calendar, DollarSign, AlertCircle, CheckCircle, Search, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddOneTimeEarningModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [amountType, setAmountType] = useState('Fixed'); // Fixed, Percentage
    const [selectedEmployee, setSelectedEmployee] = useState('');

    // Mock Data for Employee Search
    const employees = [
        { id: 'EMP001', name: 'John Doe', dept: 'IT', status: 'Active' },
        { id: 'EMP002', name: 'Jane Smith', dept: 'HR', status: 'Active' },
        { id: 'EMP009', name: 'Mark Wilson', dept: 'Sales', status: 'Inactive' },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">New One-Time Earning</h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide text-amber-600">Non-Recurring Payment</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors color-blue">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                        {/* 1. Employee Selector */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Employee</label>
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                >
                                    <option value="">Search by Name, Dept, or ID...</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id} disabled={emp.status === 'Inactive'}>
                                            {emp.name} ({emp.id}) - {emp.dept} {emp.status === 'Inactive' ? '(Inactive)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2. Earning Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Earning Type</label>
                                <select className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Type...</option>
                                    <option value="Bonus">Performance Bonus</option>
                                    <option value="Overtime">Overtime Payout</option>
                                    <option value="Gratuity">Gratuity / Ex-Gratia</option>
                                    <option value="Commission">Sales Commission</option>
                                    <option value="Arrears">Salary Arrears</option>
                                    <option value="Custom">Custom One-Time</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description / Reason</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dec 2024 Sales Target Bonus"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* 3. Amount Configuration */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-gray-800">Earning Amount</label>
                                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                                    <button
                                        onClick={() => setAmountType('Fixed')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${amountType === 'Fixed' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Fixed Amount
                                    </button>
                                    <button
                                        onClick={() => setAmountType('Percentage')}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${amountType === 'Percentage' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        % of Basic
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                {amountType === 'Fixed' ? (
                                    <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                ) : (
                                    <Percent size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                )}
                                <input
                                    type="number"
                                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-lg font-bold text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder={amountType === 'Fixed' ? '0.00' : 'e.g. 15'}
                                />
                            </div>
                            {amountType === 'Percentage' && (
                                <p className="text-xs text-blue-600 font-medium text-right">
                                    Preview: Approx. KES 12,500 based on Basic Pay
                                </p>
                            )}
                        </div>

                        {/* 4. Statutory & Period */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Statutory & Tax</label>
                                <div className="space-y-2">
                                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <span className="text-sm text-gray-700">Taxable (PAYE)</span>
                                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <span className="text-sm text-gray-700">Include in NSSF</span>
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                    </label>
                                    <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                        <span className="text-sm text-gray-700">Include in NHIF/SHA</span>
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Effective Payroll Period</label>
                                <input type="month" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" />

                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-2">
                                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-700">
                                        <span className="font-bold">Auto-Expire Warning:</span> This earning will only apply to the selected period and will not recur.
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
                            onClick={() => {
                                // Reset form logic here
                            }}
                        >
                            Reset Form
                        </button>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors">
                                Save Draft
                            </button>
                            <button className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                                <CheckCircle size={16} /> Submit for Approval
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddOneTimeEarningModal;
