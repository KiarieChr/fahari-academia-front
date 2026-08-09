import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../../../auth/AuthProvider';
import { api } from '../../../../services/api';

const ApplyLeaveDialog = ({ isOpen, onClose, onSubmit }: any) => {
    const { user } = useAuth() as any;
    const isHrAdmin = user?.is_staff || user?.is_superuser || user?.groups?.includes('HR');
    
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employees, setEmployees] = useState([]);
    
    const [formData, setFormData] = useState({
        type: '',
        employeeId: '',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const [leaveBalances, setLeaveBalances] = useState([]);
    const [computedDays, setComputedDays] = useState({ totalDays: 0, workingDays: 0, returnDate: '' });

    useEffect(() => {
        if (!isOpen) return;
        
        const fetchOptions = async () => {
            try {
                const typesRes = await api.get('/workforce/api/leave-types/');
                setLeaveTypes(typesRes.results || typesRes || []);
                if ((typesRes.results || typesRes)?.length > 0 && !formData.type) {
                    setFormData(prev => ({ ...prev, type: (typesRes.results || typesRes)[0].id }));
                }
                
                if (isHrAdmin) {
                    const empRes = await api.get('/workforce/api/employees/');
                    setEmployees(empRes.results || empRes || []);
                }
            } catch (err) {
                console.error("Failed to load form options", err);
            }
        };
        fetchOptions();
    }, [isOpen, isHrAdmin]);

    useEffect(() => {
        if (!isOpen) return;
        const fetchBalances = async () => {
            try {
                const url = formData.employeeId 
                    ? `/workforce/api/leave-balances/?employee=${formData.employeeId}` 
                    : `/workforce/api/leave-balances/`;
                const res = await api.get(url);
                setLeaveBalances(res.results || res || []);
            } catch (err) {
                console.error("Failed to fetch balances", err);
            }
        };
        fetchBalances();
    }, [isOpen, formData.employeeId]);

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (start <= end) {
                let total = 0;
                let working = 0;
                let curr = new Date(start);
                while (curr <= end) {
                    total++;
                    const day = curr.getDay();
                    if (day !== 0 && day !== 6) working++;
                    curr.setDate(curr.getDate() + 1);
                }
                
                const returnDate = new Date(end);
                returnDate.setDate(returnDate.getDate() + 1);
                while (returnDate.getDay() === 0 || returnDate.getDay() === 6) {
                    returnDate.setDate(returnDate.getDate() + 1);
                }
                
                setComputedDays({
                    totalDays: total,
                    workingDays: working,
                    returnDate: returnDate.toISOString().split('T')[0]
                });
            } else {
                setComputedDays({ totalDays: 0, workingDays: 0, returnDate: '' });
            }
        } else {
            setComputedDays({ totalDays: 0, workingDays: 0, returnDate: '' });
        }
    }, [formData.startDate, formData.endDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate || !formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Simple validation
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error('End date cannot be before start date');
            return;
        }

        onSubmit({
            ...formData,
            totalDays: computedDays.totalDays,
            workingDays: computedDays.workingDays,
            returnDate: computedDays.returnDate
        });
        
        // Reset
        setFormData({ type: leaveTypes[0]?.id || '', employeeId: '', startDate: '', endDate: '', reason: '' });
        setComputedDays({ totalDays: 0, workingDays: 0, returnDate: '' });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    {leaveTypes.map(lt => (
                                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            {isHrAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee (HR Only)</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    >
                                        <option value="">Select an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_no})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Computed Values and Balance */}
                        {formData.startDate && formData.endDate && computedDays.totalDays > 0 && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div>
                                        <span className="text-blue-700 block mb-0.5">Total Days</span>
                                        <span className="font-semibold text-blue-900">{computedDays.totalDays}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 block mb-0.5">Working Days</span>
                                        <span className="font-semibold text-blue-900">{computedDays.workingDays}</span>
                                    </div>
                                    <div>
                                        <span className="text-blue-700 block mb-0.5">Return Date</span>
                                        <span className="font-semibold text-blue-900">{computedDays.returnDate}</span>
                                    </div>
                                    {leaveBalances.map(b => b.leave_type === parseInt(formData.type) && (
                                        <div key={b.id}>
                                            <span className="text-blue-700 block mb-0.5">Available Balance</span>
                                            <span className={`font-semibold ${b.remaining_days >= computedDays.workingDays ? 'text-green-600' : 'text-red-600'}`}>
                                                {b.remaining_days} days
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {leaveBalances.some(b => b.leave_type === parseInt(formData.type) && b.remaining_days < computedDays.workingDays) && (
                                    <p className="text-red-500 text-xs mt-2 font-medium">Warning: The requested working days exceed your available balance.</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none"
                                placeholder="Please describe the reason for your leave..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ApplyLeaveDialog;
