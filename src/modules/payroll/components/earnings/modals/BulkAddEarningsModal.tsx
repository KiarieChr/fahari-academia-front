import React, { useState } from 'react';
import { X, Layers, Save, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const BulkAddEarningsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Layers size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Bulk Add Earnings</h3>
                            <p className="text-sm text-gray-500">Apply earnings to multiple employees</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-6 space-y-6">
                    {/* Target Selection */}
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <h4 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                            <Users size={16} /> Target Group
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-purple-700 mb-1">Target By</label>
                                <select className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option value="department">Department</option>
                                    <option value="grade">Pay Grade</option>
                                    <option value="all">All Employees</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-purple-700 mb-1">Select Value</label>
                                <select className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option>IT Department</option>
                                    <option>Sales Team</option>
                                    <option>Grade PG-1</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Earning Component</label>
                            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
                                <option>Productivity Bonus</option>
                                <option>Holiday Allowance</option>
                                <option>Communication Allowance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Fixed)</label>
                            <input type="number" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none font-bold" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <input type="checkbox" id="notify" className="rounded text-purple-600 focus:ring-purple-500" />
                        <label htmlFor="notify">Notify eligible employees via email upon approval</label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-black font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
                            <Save size={18} /> Apply Bulk Earning
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default BulkAddEarningsModal;
