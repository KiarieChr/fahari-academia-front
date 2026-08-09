import React, { useState } from 'react';
import { X, DollarSign, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const AddEarningModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        employee: '',
        earningType: '',
        amount: '',
        frequency: 'Recurring',
        isTaxable: true,
        effectiveDate: ''
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Add New Earning</h3>
                            <p className="text-sm text-gray-500">Allowances, Bonuses, or Overtime</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                        <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                            <option>John Doe (EMP-001)</option>
                            <option>Jane Smith (EMP-002)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Earning Type</label>
                            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                                <option>House Allowance</option>
                                <option>Transport Allowance</option>
                                <option>Overtime</option>
                                <option>Performance Bonus</option>
                                <option>Arrears</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                            <input type="number" placeholder="0.00" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-gray-800" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="Recurring">Recurring (Monthly)</option>
                                <option value="One-Time">One-Time Payment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax Status</label>
                            <select className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                                <option value="Taxable">Taxable</option>
                                <option value="Non-Taxable">Non-Taxable (Exempt)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective Pay Period</label>
                        <input type="month" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-black font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                            <Save size={18} /> Save & Submit
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddEarningModal;
