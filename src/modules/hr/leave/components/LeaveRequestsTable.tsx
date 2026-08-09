
import React, { useState } from 'react';
import {
    MoreVertical,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Eye,
    Trash2,
    ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

import { motion, AnimatePresence } from 'framer-motion';

const LeaveRequestsTable = ({ requests, onApprove, onReject }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const getStatusBadge = (status) => {
        // Backend returns lowercase status or Title Case via status_display
        const s = (status || '').toLowerCase();
        if (s.includes('approved')) {
            return <span className="status-badge status-approved">Approved</span>;
        } else if (s.includes('reject')) {
            return <span className="status-badge status-rejected">Rejected</span>;
        } else if (s.includes('pending') || s.includes('submit')) {
            return <span className="status-badge status-pending">Pending</span>;
        }
        return <span className="status-badge bg-gray-100 text-gray-700">{status}</span>;
    };

    const filteredRequests = requests.filter(req => {
        const empName = req.employee_name || req.employee || '';
        const typeName = req.leave_type_name || req.type || '';
        const reqStatus = req.status_display || req.status || '';
        
        const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            typeName.toLowerCase().includes(searchTerm.toLowerCase());
            
        // For filters, mapping 'Pending' to backend states
        const matchesFilter = filterStatus === 'All' || 
            (filterStatus === 'Pending' && reqStatus.toLowerCase().includes('pending')) ||
            (filterStatus === 'Approved' && reqStatus.toLowerCase().includes('approved')) ||
            (filterStatus === 'Rejected' && reqStatus.toLowerCase().includes('reject'));
            
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="leave-card overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
                {/* Search */}
                <div className="relative w-full lg:w-96 backdrop-blur-md bg-white/10 border border-white/10 rounded-2xl p-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 text-blue-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search by employee or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className=" pr-4 py-2.5 w-full bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-blue-500"
                        style = {{paddingLeft:'40px'}}
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500 block px-4  pr-10 py-2.5 cursor-pointer"
                            style={{paddingLeft:'25px'}}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>

                    <div className="relative">
                        <select
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500 block px-4 pr-10 py-2.5 cursor-pointer"
                        >
                            <option value="All">All Types</option>
                            <option value="Annual">Annual</option>
                            <option value="Sick">Sick</option>
                            <option value="Casual">Casual</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="leave-table">
                    <thead>
                        <tr className="bg-white border-b border-gray-100">
                            <th className="w-12 px-6 py-4">
                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            </th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leave Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Days</th>
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
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm border border-blue-100">
                                                {request.avatar || (request.employee_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm">{request.employee_name || request.employee}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{request.employee_no || 'Employee'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{request.leave_type_name || request.type}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 font-medium">{new Date(request.start_date || request.startDate).toLocaleDateString('en-GB')}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">to {new Date(request.end_date || request.endDate).toLocaleDateString('en-GB')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{request.working_days || request.days}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(request.status_display || request.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-3 items-center">
                                            {(request.status === 'Pending' || (request.status && request.status.includes('pending')) || request.status === 'submitted') && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            onApprove(request.id);
                                                        }}
                                                        className="text-green-500 hover:text-green-700 hover:bg-green-50 p-1.5 rounded-full transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onReject(request.id);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                                <MoreVertical size={18} />
                                            </button>
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
                            No leave requests found matching your filters.
                        </div>
                    )
                }
            </div >
        </div >
    );
};

// Simple Clock Icon for Pending Status
const Clock = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-clock"
    >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

export default LeaveRequestsTable;
