
import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash, Lock, PauseCircle, CheckCircle, MoreVertical } from 'lucide-react';

const EarningsTable = () => {
    const [selectedRows, setSelectedRows] = useState([]);

    // Mock Data - Enhanced with statuses
    const employees = [
        {
            id: 1, name: 'John Doe', staffId: 'EMP-001', dept: 'IT', grade: 'PG-2',
            earnings: [
                { id: 101, type: 'Basic Salary', amount: 85000, status: 'Locked' },
                { id: 102, type: 'House Allowance', amount: 15000, status: 'Locked' },
                { id: 103, type: 'Overtime', amount: 5000, status: 'Pending Approval' }
            ]
        },
        {
            id: 2, name: 'Jane Smith', staffId: 'EMP-002', dept: 'HR', grade: 'PG-3',
            earnings: [
                { id: 201, type: 'Basic Salary', amount: 120000, status: 'Locked' },
                { id: 202, type: 'Performance Bonus', amount: 10000, status: 'Draft' }
            ]
        },
        {
            id: 3, name: 'Robert Fox', staffId: 'EMP-003', dept: 'Sales', grade: 'PG-1',
            earnings: [
                { id: 301, type: 'Basic Salary', amount: 45000, status: 'Locked' },
            ]
        },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Locked': 'bg-gray-100 text-gray-600 ring-gray-200',
            'Approved': 'bg-green-50 text-green-700 ring-green-200',
            'Pending Approval': 'bg-amber-50 text-amber-700 ring-amber-200',
            'Draft': 'bg-blue-50 text-blue-700 ring-blue-200'
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${styles[status] || styles['Draft']}`}>
                {status === 'Locked' && <Lock size={10} />}
                {status === 'Approved' && <CheckCircle size={10} />}
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header Filter */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                        <Filter size={14} /> Dept
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                        <Filter size={14} /> Status
                    </button>
                </div>
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search employee..."
                        className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-xs uppercase font-semibold text-gray-500 backdrop-blur-sm">
                        <tr>
                            <th className="w-8 px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Earning Component</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees.map((emp) => (
                            <React.Fragment key={emp.id}>
                                {emp.earnings.map((earning, index) => (
                                    <tr key={earning.id} className="hover:bg-blue-50/30 transition-colors group">
                                        {/* Group Employee Info only on first row */}
                                        <td className="px-6 py-3">
                                            {index === 0 && <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />}
                                        </td>
                                        <td className="px-6 py-3">
                                            {index === 0 && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm">
                                                        {emp.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{emp.name}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">{emp.staffId} • {emp.dept}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className="font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">{earning.type}</span>
                                        </td>
                                        <td className="px-6 py-3 font-mono font-bold text-gray-900 text-right tabular-nums">{formatCurrency(earning.amount)}</td>
                                        <td className="px-6 py-3">{getStatusBadge(earning.status)}</td>
                                        <td className="px-6 py-3 text-right">
                                            {earning.status !== 'Locked' ? (
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Edit">
                                                        <Edit size={14} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Suspend">
                                                        <PauseCircle size={14} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Delete">
                                                        <Trash size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 flex justify-end p-2"><Lock size={14} /></span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {/* Spacer between employees */}
                                <tr><td colSpan="6" className="h-[1px] bg-gray-50"></td></tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
                <span>Showing 1-10 of 24 records</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">Prev</button>
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm">Next</button>
                </div>
            </div>
        </div>
    );
};

export default EarningsTable;

