
import React, { useState } from 'react';
import { Search, Filter, Eye, Edit2, Printer, MoreVertical, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const RequisitionList = ({ requisitions, loading, onView, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'bg-gray-100 text-gray-700';
            case 'Pending Approval': return 'bg-orange-100 text-orange-700';
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            case 'PO Created': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50 border-red-100';
            case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-100';
            case 'Low': return 'text-blue-600 bg-blue-50 border-blue-100';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const filteredRequisitions = requisitions.filter(req => {
        const matchesSearch =
            req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="dashboard-table-container mt-4">
            {/* Header / Actions */}
            <div className="dashboard-table-header">
                <div className="dashboard-search-container">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search requisitions..."
                            className="form-control form-control-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="PO Created">PO Created</option>
                    </select>
                </div>
                <div className="dashboard-actions">
                    <button className="btn btn-sm btn-outline-secondary">
                        <Filter size={14} className="me-1" /> Filter
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                        <Printer size={14} className="me-1" /> Print
                    </button>
                </div>
            </div>

            <div className="dashboard-table-body p-3">
                <div className="table-responsive">
                    <table className="table table-sm table-striped table-compact">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requisition Details</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dept / Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        Loading requisitions...
                                    </td>
                                </tr>
                            ) : filteredRequisitions && filteredRequisitions.length > 0 ? (
                                filteredRequisitions.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{req.title}</p>
                                                    <p className="text-xs text-blue-600 font-mono mt-0.5">{req.id}</p>
                                                    <p className="text-xs text-gray-500 mt-1">By: {req.requestedBy}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-sm text-gray-700">{req.department}</span>
                                                <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded textxs font-medium border ${getPriorityColor(req.priority)}`}>
                                                    {req.priority}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-gray-500">Req: {req.requestDate}</span>
                                                <span className="text-xs text-orange-600 font-medium">Due: {req.requiredDate}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-gray-900">
                                                {(req.totalAmount || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onView(req)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {req.status === 'Draft' && (
                                                    <button
                                                        onClick={() => onEdit(req)}
                                                        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No requisitions found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RequisitionList;
