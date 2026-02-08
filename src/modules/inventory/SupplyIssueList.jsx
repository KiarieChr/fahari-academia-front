import React, { useState, useEffect } from 'react';
import { Eye, Printer, Search, Filter, Plus, RefreshCcw } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { toast } from 'react-toastify';

const SupplyIssueList = ({ onView, onCreate }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await inventoryService.getIssues();
            setIssues(res.data);
        } catch (error) {
            toast.error("Failed to load supply issues");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Draft': 'bg-gray-100 text-gray-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-blue-100 text-blue-800',
            'Issued': 'bg-green-100 text-green-800',
            'Returned': 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    const filteredIssues = issues.filter(issue => {
        const matchesSearch =
            issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || issue.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header / Actions */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Issue #, Dept, Requester..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-3 py-2 border rounded-lg outline-none cursor-pointer hover:bg-gray-50 bg-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Issued">Issued</option>
                        <option value="Approved">Approved</option>
                    </select>
                    <button
                        onClick={loadData}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <button
                    onClick={onCreate}
                    className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
                >
                    <Plus size={18} /> Issue Voucher
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="p-4 font-semibold">Issue #</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Department</th>
                            <th className="p-4 font-semibold">Requested By</th>
                            <th className="p-4 font-semibold">Total Items</th>
                            <th className="p-4 font-semibold">Value</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-gray-500">Loading issues...</td>
                            </tr>
                        ) : filteredIssues.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-8 text-center text-gray-500">
                                    No supply issues found.
                                </td>
                            </tr>
                        ) : (
                            filteredIssues.map(issue => (
                                <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-blue-600">{issue.id}</td>
                                    <td className="p-4 text-gray-600">{issue.date}</td>
                                    <td className="p-4 font-medium">{issue.department}</td>
                                    <td className="p-4 text-gray-500">{issue.requestedBy}</td>
                                    <td className="p-4 text-gray-500">{issue.totalItems}</td>
                                    <td className="p-4 font-bold">KSh {issue.totalValue?.toLocaleString()}</td>
                                    <td className="p-4">{getStatusBadge(issue.status)}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onView(issue)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Print">
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 text-center text-xs text-gray-400">
                Showing {filteredIssues.length} records
            </div>
        </div>
    );
};

export default SupplyIssueList;

