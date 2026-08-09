import React from 'react';
import { motion } from 'framer-motion';

const UpcomingLeavesTable = ({ leaves }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Leaves</h3>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none hover:bg-gray-50">
                    <option>Weekly View</option>
                    <option>Monthly View</option>
                </select>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider">Leave Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider">From & To</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 tracking-wider">No Of Days</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {leaves && leaves.length > 0 ? leaves.map((leave, i) => (
                            <motion.tr 
                                key={leave.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                            {(leave.employee_name || leave.employee || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-800 text-sm">{leave.employee_name || leave.employee}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{leave.leave_type_name || leave.type}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(leave.start_date || leave.startDate).toLocaleDateString('en-GB')} - {new Date(leave.end_date || leave.endDate).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">{leave.working_days || leave.days} Days</td>
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">No upcoming leaves found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UpcomingLeavesTable;
