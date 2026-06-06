import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

const OvertimeRequestsTable = ({ requests, onApprove, onReject }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const getStatusBadge = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('approved')) {
            return <span className="status-badge status-approved bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-semibold">Approved</span>;
        } else if (s.includes('reject')) {
            return <span className="status-badge status-rejected bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-semibold">Rejected</span>;
        } else if (s.includes('pending') || s.includes('submit')) {
            return <span className="status-badge status-pending bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-semibold">Pending</span>;
        }
        return <span className="status-badge bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-semibold">{status}</span>;
    };

    const filteredRequests = (requests || []).filter(req => {
        const empName = req.employee_name || req.employee || '';
        const reqStatus = req.approval_status || req.status || '';
        
        const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesFilter = filterStatus === 'All' || 
            (filterStatus === 'Pending' && reqStatus.toLowerCase().includes('pending')) ||
            (filterStatus === 'Approved' && reqStatus.toLowerCase().includes('approved')) ||
            (filterStatus === 'Rejected' && reqStatus.toLowerCase().includes('reject'));
            
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by employee..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    />
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500 block pl-4 pr-10 py-2.5 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <AnimatePresence mode="popLayout">
                            {filteredRequests.map((request, index) => (
                                <motion.tr
                                    key={request.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="hover:bg-gray-50/50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm border border-blue-100">
                                                {request.avatar || (request.employee_name || request.employee || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">{request.employee_name || request.employee}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{request.employee_no || 'Employee'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">{new Date(request.date).toLocaleDateString('en-GB')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{request.hours_requested} hrs</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(request.approval_status || request.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3 items-center">
                                            {((request.approval_status || '').toLowerCase().includes('pending')) && (
                                                <>
                                                    <button
                                                        onClick={() => onApprove(request.id)}
                                                        className="text-green-500 hover:text-green-700 hover:bg-green-50 p-1.5 rounded-full transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onReject(request.id)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {
                    filteredRequests.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No overtime requests found matching your filters.
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default OvertimeRequestsTable;
