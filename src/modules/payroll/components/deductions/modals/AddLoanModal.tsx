import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Calculator, AlertTriangle, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddLoanModal = ({ isOpen, onClose }) => {
    const [loanDetails, setLoanDetails] = useState({
        principal: '',
        interestRate: 10, // Default 10%
        months: 12,
        startDate: '',
        installment: 0,
        totalRepayment: 0
    });

    const calculateLoan = () => {
        const P = parseFloat(loanDetails.principal) || 0;
        const R = parseFloat(loanDetails.interestRate) / 100;
        const T = parseFloat(loanDetails.months) / 12;

        if (P > 0) {
            const totalRepayment = P * (1 + (R * T)); // Simple Interest Formula (can be changed to amortization)
            const monthlyInst = totalRepayment / loanDetails.months;
            setLoanDetails(prev => ({
                ...prev,
                installment: Math.round(monthlyInst),
                totalRepayment: Math.round(totalRepayment)
            }));
        }
    };

    useEffect(() => {
        calculateLoan();
    }, [loanDetails.principal, loanDetails.interestRate, loanDetails.months]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Left Panel: Form */}
                    <div className="flex-1 p-6 border-r border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">New Staff Loan</h2>
                                <p className="text-sm text-gray-500">Issue a company loan or advance</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Employee</label>
                                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Search employee...</option>
                                    <option value="EMP001">EMP001 - John Doe</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Principal Amount</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="50,000"
                                            value={loanDetails.principal}
                                            onChange={(e) => setLoanDetails({ ...loanDetails, principal: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate (%)</label>
                                    <div className="relative">
                                        <PieChart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={loanDetails.interestRate}
                                            onChange={(e) => setLoanDetails({ ...loanDetails, interestRate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Repayment Period (Months)</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="36"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    value={loanDetails.months}
                                    onChange={(e) => setLoanDetails({ ...loanDetails, months: e.target.value })}
                                />
                                <div className="text-right text-xs font-bold text-blue-600 mt-1">{loanDetails.months} Months</div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Deduction Date</label>
                                <input type="date" className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Summary */}
                    <div className="bg-gray-50 p-6 w-full md:w-80 flex flex-col justify-between">
                        <div className="flex justify-end">
                            <button onClick={onClose} className="btn btn-light rounded-circle p-2 text-secondary mb-4">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Repayment Preview</h3>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="text-xs text-gray-500 mb-1">Monthly Installment</p>
                                <p className="text-2xl font-bold text-gray-800">KES {loanDetails.installment.toLocaleString()}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Principal</span>
                                    <span className="font-medium">KES {Number(loanDetails.principal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Total Interest ({loanDetails.interestRate}%)</span>
                                    <span className="font-medium text-amber-600">+ KES {(loanDetails.totalRepayment - (parseFloat(loanDetails.principal) || 0)).toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-gray-200 my-2"></div>
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-700">Total Repayment</span>
                                    <span className="text-indigo-700">KES {loanDetails.totalRepayment.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex gap-2">
                                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    By proceeding, you verify the employee has agreed to these terms. A signed copy of the loan agreement may be required for audit.
                                </p>
                            </div>
                        </div>

                        <button className="btn btn-primary w-100 mt-4 py-3 shadow-lg d-flex align-items-center justify-content-center gap-2">
                            <Calculator size={18} /> Process Loan
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AddLoanModal;
