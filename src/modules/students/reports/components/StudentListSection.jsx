import React, { useState } from 'react';
import { Loader2, Search, User, FileText, ChevronRight } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    alumni: 'bg-blue-100 text-blue-700',
    suspended: 'bg-amber-100 text-amber-700',
    expelled: 'bg-red-100 text-red-700',
    transferred: 'bg-purple-100 text-purple-700',
    withdrawn: 'bg-gray-100 text-gray-600',
};

const StudentListSection = ({ data = {}, loading, onSearch, onViewStatement }) => {
    const { count = 0, results = [] } = data;

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Search */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name or admission number..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white">Student List</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{count} students</span>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Adm No</th>
                                    <th className="px-5 py-3 font-semibold">Name</th>
                                    <th className="px-5 py-3 font-semibold">Gender</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Intake</th>
                                    <th className="px-5 py-3 font-semibold">Admitted</th>
                                    <th className="px-5 py-3 font-semibold">Campus</th>
                                    <th className="px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {results.length === 0 ? (
                                    <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                                        <User size={32} className="mx-auto mb-2 opacity-40" />No students found
                                    </td></tr>
                                ) : results.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{s.admission_number}</td>
                                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.gender === 'M' ? 'Male' : s.gender === 'F' ? 'Female' : '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.intake || '—'}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{fmtDate(s.admission_date)}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{s.campus || '—'}</td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => onViewStatement?.(s)}
                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                <FileText size={13} /> Statement
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentListSection;
