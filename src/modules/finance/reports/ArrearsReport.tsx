import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, AlertTriangle, Search } from 'lucide-react';
import ExportButton from './ExportButton';

const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);
const BUCKET_COLORS = { '0-30 days': '#34D399', '31-60 days': '#FCD34D', '61-90 days': '#F97316', '90+ days': '#EF4444' };

const ArrearsReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({ search: '', min_balance: '' });
    const [page, setPage] = useState(1);

    const fetchData = async (p = page) => {
        setLoading(true);
        try {
            const res = await financeService.getArrearsReport({ ...filters, page: p, page_size: 50 });
            setData(res);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(1); }, []);

    const handleSearch = () => { setPage(1); fetchData(1); };
    const summary = data?.summary || {};
    const rows = data?.results || [];
    const aging = summary.aging || [];
    const agingChart = aging.map((a) => ({ name: a.bucket, value: a.amount }));

    const getExportRows = () => rows.map((r) => [
        r.admission_number, r.student_name, r.class_session, r.term, r.academic_year,
        r.invoice_number, r.date_issued, r.total_amount, r.paid_amount, r.balance,
        r.status, r.days_overdue, r.bucket,
    ]);

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="relative flex-1 min-w-48">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text" placeholder="Search student..."
                            value={filters.search}
                            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">Min Balance</label>
                        <input type="number" placeholder="0.01" value={filters.min_balance}
                            onChange={(e) => setFilters((f) => ({ ...f, min_balance: e.target.value }))}
                            className="w-28 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">Search</button>
                    <div className="ml-auto">
                        <ExportButton
                            title="Arrears & Outstanding Balances Report"
                            headers={['Adm No', 'Student', 'Class', 'Term', 'Academic Year', 'Invoice', 'Date Issued', 'Total', 'Paid', 'Balance', 'Status', 'Days Overdue', 'Bucket']}
                            getRows={getExportRows}
                            filename="arrears-report"
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total Defaulters</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{summary.total_count ?? 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total Outstanding</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{fmt(summary.total_balance)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total Invoiced</p>
                    <p className="text-2xl font-bold mt-1 text-indigo-600">{fmt(summary.total_invoiced)}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <>
                    {/* Aging Chart */}
                    {agingChart.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Aging Analysis</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={agingChart} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                            <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                            <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={90} />
                                            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Balance">
                                                {agingChart.map((entry, i) => (
                                                    <Cell key={i} fill={BUCKET_COLORS[entry.name] || '#94A3B8'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {aging.map((a) => (
                                        <div key={a.bucket} className="rounded-xl p-3 text-center" style={{ background: `${BUCKET_COLORS[a.bucket]}20`, borderLeft: `3px solid ${BUCKET_COLORS[a.bucket]}` }}>
                                            <p className="text-xs font-medium text-slate-500">{a.bucket}</p>
                                            <p className="text-base font-bold text-slate-800 dark:text-white mt-1">{fmt(a.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">Outstanding Balances</h3>
                            <span className="text-xs text-slate-400">{data?.count ?? 0} records</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Student</th>
                                        <th className="px-4 py-3 font-semibold">Class</th>
                                        <th className="px-4 py-3 font-semibold">Term</th>
                                        <th className="px-4 py-3 font-semibold text-right">Invoiced</th>
                                        <th className="px-4 py-3 font-semibold text-right">Paid</th>
                                        <th className="px-4 py-3 font-semibold text-right text-red-500">Balance</th>
                                        <th className="px-4 py-3 font-semibold text-center">Aging</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {rows.length === 0 ? (
                                        <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                                            <AlertTriangle size={28} className="mx-auto mb-2 opacity-40" />No outstanding balances
                                        </td></tr>
                                    ) : rows.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-800 dark:text-slate-200">{r.student_name}</p>
                                                <p className="text-xs text-slate-400">{r.admission_number}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.class_session}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.term}</td>
                                            <td className="px-4 py-3 text-right text-indigo-600">{fmt(r.total_amount)}</td>
                                            <td className="px-4 py-3 text-right text-green-600">{fmt(r.paid_amount)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(r.balance)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                    style={{ background: `${BUCKET_COLORS[r.bucket]}22`, color: BUCKET_COLORS[r.bucket] }}>
                                                    {r.bucket}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {data?.total_pages > 1 && (
                            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm text-slate-500">
                                <span>Page {data.page} of {data.total_pages} ({data.count} records)</span>
                                <div className="flex gap-2">
                                    <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchData(page - 1); }}
                                        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40">← Prev</button>
                                    <button disabled={page >= data.total_pages} onClick={() => { setPage(p => p + 1); fetchData(page + 1); }}
                                        className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40">Next →</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ArrearsReport;
