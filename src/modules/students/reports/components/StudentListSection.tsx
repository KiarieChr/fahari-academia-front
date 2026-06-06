import React, { useState } from 'react';
import { Loader2, Search, User, FileText, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLORS = {
    active: 'bg-green-100 text-green-700',
    alumni: 'bg-blue-100 text-blue-700',
    suspended: 'bg-amber-100 text-amber-700',
    expelled: 'bg-red-100 text-red-700',
    transferred: 'bg-purple-100 text-purple-700',
    withdrawn: 'bg-gray-100 text-gray-600',
};

const PAGE_SIZE = 20;

const Pagination = ({ count, page, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(count / pageSize);
    if (totalPages <= 1) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, count);

    // Generate page numbers with ellipsis
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{from}–{to}</span> of <span className="font-semibold text-slate-700 dark:text-slate-200">{count}</span> students
            </span>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="First page"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                {pages.map((p, idx) =>
                    p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-sm">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-semibold transition-all ${
                                p === page
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next page"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Last page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

const StudentListSection = ({ data = {}, loading, onSearch, onPageChange, onViewStatement }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { count = 0, results = [] } = data;

    const handlePageChange = (page) => {
        setCurrentPage(page);
        onPageChange?.(page);
    };

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
                    <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{count.toLocaleString()} students</span>
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

                {/* Pagination */}
                <Pagination
                    count={count}
                    page={currentPage}
                    pageSize={PAGE_SIZE}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default StudentListSection;


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
