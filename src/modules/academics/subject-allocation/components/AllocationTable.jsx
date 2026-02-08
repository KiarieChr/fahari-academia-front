import React, { useState } from 'react';
import { Search, Filter, Edit, Trash2, AlertTriangle, UserPlus, FileText } from 'lucide-react';

const AllocationTable = ({ allocations, teachers, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('All');

    const getTeacherName = (id) => teachers.find(t => t.id === id)?.name || 'Unassigned';

    const filtered = allocations.filter(a => {
        const matchesSearch = a.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getTeacherName(a.teacherId).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterClass === 'All' || a.class === filterClass;
        return matchesSearch && matchesFilter;
    });

    // Extract unique classes for filter
    const uniqueClasses = Array.from(new Set(allocations.map(a => a.class)));

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search assignments..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            className="pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                        >
                            <option value="All">All Classes</option>
                            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-xs uppercase text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4">Class</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Lessons/Wk</th>
                            <th className="px-6 py-4">Assigned Teacher</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.length > 0 ? (
                            filtered.map((alloc) => {
                                const teacher = teachers.find(t => t.id === alloc.teacherId);
                                const isUnassigned = !alloc.teacherId;

                                return (
                                    <tr key={alloc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                            {alloc.class}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-white">{alloc.subject}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wide">{alloc.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                                            {alloc.lessons}
                                        </td>
                                        <td className="px-6 py-4">
                                            {isUnassigned ? (
                                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-xs font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full w-fit">
                                                    <AlertTriangle size={12} />
                                                    Unassigned
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                                                        {teacher?.name.charAt(0)}
                                                    </div>
                                                    <span className="text-slate-700 dark:text-slate-300">{teacher?.name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block w-2 h-2 rounded-full ${isUnassigned ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(alloc)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors color-black"
                                                    title="Edit Assignment"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(alloc.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Assignment"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                    <p>No allocations found matching your filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs text-slate-500">
                <span>Showing {filtered.length} allocations</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                    <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};

export default AllocationTable;
