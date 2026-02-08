import React, { useState } from 'react';
import { Search, Filter, Eye, MoreHorizontal, Edit, Trash, PauseCircle, CheckCircle, Lock, PieChart, AlertCircle } from 'lucide-react';

const DeductionsTable = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    // Mock Data - Enhanced with workflow statuses and loan details
    const records = [
        { id: 'REC001', empId: 'EMP001', name: 'John Doe', department: 'IT', type: 'PAYE (Tax)', amount: 65000, category: 'Statutory', status: 'Locked', balance: null, progress: null },
        { id: 'REC002', empId: 'EMP001', name: 'John Doe', department: 'IT', type: 'Staff Loan', amount: 15000, category: 'Loan', status: 'Approved', balance: 45000, progress: 75 },
        { id: 'REC003', empId: 'EMP002', name: 'Jane Smith', department: 'HR', type: 'PAYE (Tax)', amount: 42000, category: 'Statutory', status: 'Locked', balance: null, progress: null },
        { id: 'REC004', empId: 'EMP003', name: 'Michael Brown', department: 'Finance', type: 'SACCO Savings', amount: 5000, category: 'Voluntary', status: 'Pending Approval', balance: null, progress: null },
        { id: 'REC005', empId: 'EMP004', name: 'Emily Davis', department: 'Ops', type: 'Emergency Loan', amount: 20000, category: 'Loan', status: 'Active', balance: 80000, progress: 20 },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Locked': 'bg-gray-100 text-gray-500 ring-gray-200',
            'Approved': 'bg-green-50 text-green-700 ring-green-200',
            'Active': 'bg-blue-50 text-blue-700 ring-blue-200',
            'Pending Approval': 'bg-amber-50 text-amber-700 ring-amber-200',
            'Draft': 'bg-slate-50 text-slate-600 ring-slate-200',
            'Suspended': 'bg-red-50 text-red-700 ring-red-200'
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide ring-1 ring-inset ${styles[status] || styles['Draft']}`}>
                {status === 'Locked' && <Lock size={10} />}
                {status === 'Approved' && <CheckCircle size={10} />}
                {status === 'Pending Approval' && <AlertCircle size={10} />}
                {status}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
            {/* Table Header & Controls */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                        <Filter size={14} /> Category
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                        <Filter size={14} /> Status
                    </button>
                </div>
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search employee, type..."
                        className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-xs uppercase font-semibold text-gray-500 backdrop-blur-sm">
                        <tr>
                            <th className="w-8 px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Deduction Details</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4">Status & Progress</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {records.map((rec) => (
                            <tr key={rec.id} className="hover:bg-blue-50/30 transition-colors group">
                                <td className="px-6 py-3">
                                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                                            {rec.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{rec.name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">{rec.empId} • {rec.department}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <div>
                                        <p className="font-medium text-gray-900">{rec.type}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${rec.category === 'Statutory' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                rec.category === 'Loan' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {rec.category}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <p className="font-mono font-bold text-gray-900 tabular-nums">{formatCurrency(rec.amount)}</p>
                                    {rec.category === 'Loan' && (
                                        <p className="text-[10px] text-gray-400">Bal: {formatCurrency(rec.balance)}</p>
                                    )}
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex flex-col gap-2">
                                        <div>{getStatusBadge(rec.status)}</div>
                                        {rec.category === 'Loan' && (
                                            <div className="w-full max-w-[100px] bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${rec.progress}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {rec.status !== 'Locked' ? (
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="View Details">
                                                <Eye size={14} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Suspend">
                                                <PauseCircle size={14} />
                                            </button>
                                            {rec.category !== 'Statutory' && (
                                                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all" title="Delete">
                                                    <Trash size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 flex justify-end p-2"><Lock size={14} /></span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs text-gray-500">
                <span>Showing 1-5 of 128 records</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">Prev</button>
                    <button className="px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors shadow-sm">Next</button>
                </div>
            </div>
        </div>
    );
};

export default DeductionsTable;
