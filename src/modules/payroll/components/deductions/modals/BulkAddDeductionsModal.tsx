import React, { useState } from 'react';
import { X, Calendar, DollarSign, Layers, Users, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BulkAddDeductionsModal = ({ isOpen, onClose }) => {
    const [targetType, setTargetType] = useState('Department'); // Department, Grade
    const [selectedTarget, setSelectedTarget] = useState('');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Bulk Deductions</h2>
                            <p className="text-sm text-gray-500">Apply deductions to groups</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Target Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Group</label>
                            <div className="flex gap-2 mb-3">
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${targetType === 'Department' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                    onClick={() => setTargetType('Department')}
                                >
                                    By Department
                                </button>
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border ${targetType === 'Grade' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
                                    onClick={() => setTargetType('Grade')}
                                >
                                    By Pay Grade
                                </button>
                            </div>

                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedTarget}
                                    onChange={(e) => setSelectedTarget(e.target.value)}
                                >
                                    <option value="">Select {targetType}...</option>
                                    {targetType === 'Department' ? (
                                        <>
                                            <option value="IT">IT & Engineering</option>
                                            <option value="Sales">Sales & Marketing</option>
                                            <option value="HR">Human Resources</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="PG1">Pay Grade 1 (Intern)</option>
                                            <option value="PG2">Pay Grade 2 (Junior)</option>
                                            <option value="PG3">Pay Grade 3 (Senior)</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Deduction Details */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Deduction Details</label>
                            <div className="space-y-3">
                                <select className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Deduction...</option>
                                    <option value="Welfare">Staff Welfare</option>
                                    <option value="Union">Union Fees</option>
                                </select>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="number" placeholder="Amount" className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <input type="date" className="w-40 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start">
                            <Layers size={18} className="text-indigo-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-indigo-800">Impact Preview</h4>
                                <p className="text-xs text-indigo-600 mt-0.5">
                                    This will apply to approx. <strong>14 employees</strong>. Total projected monthly deduction: <strong>KES 28,000</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
                        <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button className="flex-1 py-2.5 text-sm font-bold text-black bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all">
                            Apply Bulk Deduction
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BulkAddDeductionsModal;
