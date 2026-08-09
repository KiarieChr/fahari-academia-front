import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Eye, CheckCircle, XCircle } from 'lucide-react';

const SubjectsTable = ({ subjects, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const filtered = subjects.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterCategory === 'All' || s.category === filterCategory;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        return status === 'Active' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800';
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative w-full md:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        style={{ paddingLeft: '30px'}}
                        placeholder="Search subjects by name or code..."
                        className="w-full pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            style= {{paddingLeft: '30px'}}
                            className=" pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Core">Core</option>
                            <option value="Optional">Optional</option>
                            <option value="Elective">Elective</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Curriculum</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.length > 0 ? (
                            filtered.map((subject) => (
                                <tr key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{subject.name}</span>
                                            <span className="text-xs font-mono text-slate-400">{subject.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${subject.category === 'Core' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                subject.category === 'Optional' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-purple-50 text-purple-700 border-purple-100'
                                            }`}>
                                            {subject.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                                        {subject.curriculum}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {subject.type}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(subject.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${subject.status === 'Active' ? 'bg-green-600' : 'bg-slate-500'}`}></span>
                                            {subject.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => onEdit(subject)}
                                                className="p-2 text-blue-200 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="p-1.5 text-blue-400 hover:text-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                                                title="Duplicate"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(subject.id)}
                                                className="p-1.5 text-blue-200 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete/Deactivate"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search size={32} className="text-slate-300" />
                                        <p>No subjects found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs text-slate-500">
                <span>Showing {filtered.length} of {subjects.length} subjects</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default SubjectsTable;
