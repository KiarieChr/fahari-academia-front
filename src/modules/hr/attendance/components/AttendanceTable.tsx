
import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Download, Filter, Search, Clock, CheckCircle } from 'lucide-react';

const AttendanceTable = ({ records = [], loading = false }) => {
    // Helper to get status styles
    const getStatusStyle = (status) => {
        const styles = {
            'Present': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'present': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'Absent': 'bg-red-50 text-red-700 border-red-100',
            'absent': 'bg-red-50 text-red-700 border-red-100',
            'Late': 'bg-amber-50 text-amber-700 border-amber-100',
            'late': 'bg-amber-50 text-amber-700 border-amber-100',
            'On Leave': 'bg-purple-50 text-purple-700 border-purple-100',
            'on_leave': 'bg-purple-50 text-purple-700 border-purple-100',
        };
        return styles[status] || 'bg-slate-50 text-slate-700 border-slate-100';
    };

    const attendanceLogs = records || [];

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex-1 mb-3">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        style={{ paddingLeft: '30px'}}
                        placeholder="Search logs..."
                        className="w-full pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-700 dark:text-slate-200"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Clock In</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Clock Out</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Hours</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm text-slate-500">Loading records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : attendanceLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                                    No attendance records found.
                                </td>
                            </tr>
                        ) : (
                            attendanceLogs.map((log) => (
                                <motion.tr
                                key={log.id}
                                whileHover={{ backgroundColor: 'rgba(248,250,252, 0.5)' }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                            {log.employee_name ? log.employee_name.charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">{log.employee_name}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{log.employee_no}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{log.attendance_date}</td>
                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{log.check_in_time || '-'}</td>
                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 font-mono">{log.check_out_time || '-'}</td>
                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300 font-bold">{log.total_hours || '0.00'}</td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(log.status_display)}`}>
                                        {/* Simple icon mapping based on status string content */}
                                        {log.status === 'present' && <CheckCircle size={12} className="mr-1" />}
                                        {log.status === 'late' && <Clock size={12} className="mr-1" />}
                                        {log.status_display}
                                    </span>
                                </td>
                            </motion.tr>
                        )))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Mockup */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                <span>Showing 1 to {records.length} of {records.length} entries</span>
                <div className="flex gap-1">
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded font-medium">1</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">2</button>
                    <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTable;
