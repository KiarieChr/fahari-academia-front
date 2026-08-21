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
        <div className="neo-card border-none overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 border-b border-slate-300/30 flex flex-col md:flex-row gap-4 justify-between items-center bg-transparent">
                <div className="relative w-full md:w-80">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search assignments..."
                        className="w-full pl-11 pr-4 py-3 neo-input text-sm font-bold text-slate-700 transition-shadow"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                        <select
                            className="pl-11 pr-10 py-3 neo-input text-sm font-bold text-slate-700 transition-shadow appearance-none relative z-0"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                        >
                            <option value="All">All Classes</option>
                            {uniqueClasses.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-300/30">
                        <tr>
                            <th className="px-6 py-4">Class</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Lessons/Wk</th>
                            <th className="px-6 py-4">Assigned Teacher</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300/20">
                        {filtered.length > 0 ? (
                            filtered.map((alloc) => {
                                const teacher = teachers.find(t => t.id === alloc.teacherId);
                                const isUnassigned = !alloc.teacherId;

                                return (
                                    <tr key={alloc.id} className="hover:bg-slate-300/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold neo-bg shadow-sm text-indigo-700">
                                                {alloc.class || 'No Class'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm">{alloc.subject}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">{alloc.category || 'Core'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-xl neo-bg flex items-center justify-center font-black text-slate-600 shadow-sm border border-slate-300/20">
                                                    {alloc.lessons || 0}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isUnassigned ? (
                                                <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold neo-bg shadow-sm px-3 py-1.5 rounded-xl w-fit">
                                                    <AlertTriangle size={14} />
                                                    Unassigned
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                                                        {teacher?.name.charAt(0)}
                                                    </div>
                                                    <span className="text-slate-700 font-bold">{teacher?.name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block w-2.5 h-2.5 rounded-full shadow-sm ${isUnassigned ? 'bg-amber-400 shadow-amber-200' : 'bg-emerald-400 shadow-emerald-200'}`}></span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(alloc)}
                                                    className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm neo-bg"
                                                    title="Edit Assignment"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(alloc.id)}
                                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm neo-bg"
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
                                <td colSpan="6" className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <FileText size={48} className="mb-4 text-slate-300" />
                                        <p className="font-bold text-slate-500">No allocations found</p>
                                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-300/30 flex justify-between items-center text-xs font-bold text-slate-500 bg-transparent">
                <span>Showing {filtered.length} allocations</span>
                <div className="flex gap-2">
                    <button className="px-4 py-2 neo-btn rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors">Previous</button>
                    <button className="px-4 py-2 neo-btn rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
};

export default AllocationTable;
