
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, LogIn, LogOut } from 'lucide-react';
import { toast } from 'react-toastify'; // Consistent toast usage
import { api } from '../../../../services/api';

const ClockInOutWidget = ({ onClockUpdate }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [employeeId, setEmployeeId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockAction = async (action) => {
        if (!employeeId) {
            toast.error('Please enter Employee ID');
            return;
        }

        setLoading(true);
        const endpoint = `/workforce/api/attendance/${action}/`;

        try {
            await api.post(endpoint, { employee_id: employeeId });
            toast.success(`Successfully clocked ${action === 'clock_in' ? 'in' : 'out'}`);
            setEmployeeId(''); // Reset input
            if (onClockUpdate) onClockUpdate();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || `Failed to clock ${action === 'clock_in' ? 'in' : 'out'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 w-full max-w-xs mx-auto">
                <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{currentTime.toDateString()}</span>
                    <h2 className="text-4xl font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums tracking-tight">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </h2>
                </div>

                <div className="flex items-center justify-center gap-2 mb-8 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-full inline-flex">
                    <MapPin size={12} />
                    <span>Nairobi HQ (Office)</span>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Enter Employee ID"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="w-full px-4 py-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClockAction('clock_in')}
                        disabled={loading}
                        className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex flex-col items-center justify-center gap-2 border-2 border-white dark:border-slate-700 w-32"
                    >
                        <LogIn size={24} />
                        <span className="font-bold text-sm">Clock In</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClockAction('clock_out')}
                        disabled={loading}
                        className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/30 flex flex-col items-center justify-center gap-2 border-2 border-white dark:border-slate-700 w-32"
                    >
                        <LogOut size={24} />
                        <span className="font-bold text-sm">Clock Out</span>
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default ClockInOutWidget;

