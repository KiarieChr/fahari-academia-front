import React, { useState } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddEmployeeModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        staffId: '',
        department: '',
        payGrade: '',
        joinDate: '',
        email: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission logic
        console.log('Submitted:', formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <UserPlus size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Add New Employee</h3>
                            <p className="text-sm text-gray-500">Onboard employee to payroll system</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Personal Info</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input name="firstName" required onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input name="lastName" required onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" required onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                        </div>

                        {/* Employment Info */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Employment Details</h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID <span className="text-red-500">*</span></label>
                                <input name="staffId" required onChange={handleChange} placeholder="e.g. EMP-001" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select name="department" onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select Department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pay Grade</label>
                                <select name="payGrade" onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select Grade</option>
                                    <option value="PG-1">PG-1 (Junior)</option>
                                    <option value="PG-2">PG-2 (Mid)</option>
                                    <option value="PG-3">PG-3 (Senior)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>This will create a default <strong>Basic Salary</strong> entry based on the selected Pay Grade. You can adjust this later in the Earnings table.</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            <Save size={18} /> Save Employee
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddEmployeeModal;
