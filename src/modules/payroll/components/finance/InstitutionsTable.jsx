import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Edit, Power } from 'lucide-react';

const InstitutionsTable = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const institutions = [
        { id: 1, name: 'Equity Bank', type: 'Bank', branch: 'Nairobi West', code: '068', account: '1234567890', status: 'Active' },
        { id: 2, name: 'KCB Bank', type: 'Bank', branch: 'Moi Avenue', code: '001', account: '0987654321', status: 'Active' },
        { id: 3, name: 'Stima Sacco', type: 'SACCO', branch: 'Main', code: 'STIMA', account: 'MEMBER-PAYBILL', status: 'Active' },
        { id: 4, name: 'Jubilee Insurance', type: 'Insurance', branch: 'Nairobi', code: 'JUB', account: 'POL-001-XYZ', status: 'Active' },
        { id: 5, name: 'NSSF', type: 'Statutory', branch: 'HQ', code: 'NSSF', account: 'EMPLOYER-001', status: 'Active' },
        { id: 6, name: 'NHIF / SHA', type: 'Statutory', branch: 'HQ', code: 'NHIF', account: 'CODE-999', status: 'Active' },
        { id: 7, name: 'Co-op Bank', type: 'Bank', branch: 'University Way', code: '011', account: '1122334455', status: 'Inactive' },
    ];

    return (
        <div className="dashboard-table-container">
            <div className="dashboard-table-header">
                <div className="dashboard-search-container">
                    <input
                        type="text"
                        placeholder="Search institutions..."
                        className="form-control form-control-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-sm btn-outline-secondary">
                        <Filter size={14} className="me-1" /> Filter
                    </button>
                </div>
                <div className="dashboard-actions">
                    <button className="btn btn-sm btn-primary">
                        <Plus size={14} className="me-1" /> Add New
                    </button>
                </div>
            </div>

            <div className="dashboard-table-body p-3">
                <div className="table-responsive">
                    <table className="table table-sm table-striped table-compact">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Institution Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Branch & Code</th>
                                <th className="px-6 py-4">Account / Paybill</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {institutions.map((inst) => (
                                <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{inst.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${inst.type === 'Bank' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            inst.type === 'SACCO' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                inst.type === 'Statutory' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {inst.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {inst.branch} <span className="text-xs text-gray-400">({inst.code})</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-50/50 w-fit rounded px-2">
                                        {inst.account}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-xs font-medium ${inst.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${inst.status === 'Active' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                                            {inst.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstitutionsTable;
