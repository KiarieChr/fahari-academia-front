import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import ExportButton from './ExportButton';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const FeeCollectionsReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [groupBy, setGroupBy] = useState('term');
    const [filters, setFilters] = useState({ start_date: '', end_date: '' });

    const fetch = async () => {
        setLoading(true);
        try {
            const res = await financeService.getFeeCollectionsReport({ ...filters, group_by: groupBy });
            setData(res);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetch(); }, [groupBy, filters.start_date, filters.end_date]);

    const summary = data?.summary || {};
    const rows = data?.rows || [];

    const chartData = rows.slice(0, 12).map((r) => ({
        name: r.label.length > 18 ? r.label.slice(0, 16) + '…' : r.label,
        Invoiced: r.invoiced,
        Collected: r.collected,
        Outstanding: r.balance,
    }));

    const pieData = rows.slice(0, 6).map((r) => ({ name: r.label, value: r.collected }));

    const getRows = () => rows.map((r) => [r.label, r.invoiced, r.collected, r.balance, r.rate + '%', r.count]);

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">Group By</label>
                        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="term">Term</option>
                            <option value="class">Class</option>
                            <option value="month">Month</option>
                            <option value="payment_method">Payment Method</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">From</label>
                        <input type="date" value={filters.start_date} onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
                            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">To</label>
                        <input type="date" value={filters.end_date} onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
                            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={fetch} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">Refresh</button>
                    <div className="ml-auto">
                        <ExportButton
                            title="Fee Collections Report"
                            subtitle={`Group by: ${groupBy}`}
                            headers={['Label', 'Invoiced (KES)', 'Collected (KES)', 'Balance (KES)', 'Rate', 'Count']}
                            getRows={getRows}
                            filename="fee-collections"
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Invoiced', value: fmt(summary.total_invoiced), color: 'text-indigo-600' },
                    { label: 'Total Collected', value: fmt(summary.total_collected), color: 'text-green-600' },
                    { label: 'Outstanding', value: fmt(summary.total_balance), color: 'text-red-600' },
                    { label: 'Collection Rate', value: (summary.collection_rate || 0) + '%', color: summary.collection_rate >= 80 ? 'text-green-600' : 'text-amber-600' },
                ].map((c) => (
                    <div key={c.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase font-medium">{c.label}</p>
                        <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <>
                    {/* Charts */}
                    {chartData.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Invoiced vs Collected</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={44} />
                                            <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                            <Bar dataKey="Invoiced" fill="#93C5FD" radius={[3, 3, 0, 0]} />
                                            <Bar dataKey="Collected" fill="#34D399" radius={[3, 3, 0, 0]} />
                                            <Bar dataKey="Outstanding" fill="#FCA5A5" radius={[3, 3, 0, 0]} />
                                            <Legend wrapperStyle={{ fontSize: 12 }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Collection Share</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="45%" innerRadius={52} outerRadius={80} paddingAngle={3} dataKey="value">
                                                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => fmt(v)} />
                                            <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 10 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">Detail</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Label</th>
                                        <th className="px-5 py-3 font-semibold text-right">Invoiced</th>
                                        <th className="px-5 py-3 font-semibold text-right text-green-600">Collected</th>
                                        <th className="px-5 py-3 font-semibold text-right text-red-500">Outstanding</th>
                                        <th className="px-5 py-3 font-semibold text-center">Rate</th>
                                        <th className="px-5 py-3 font-semibold text-right">#</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {rows.length === 0 ? (
                                        <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400"><AlertCircle size={28} className="mx-auto mb-2 opacity-40" />No data</td></tr>
                                    ) : rows.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{r.label}</td>
                                            <td className="px-5 py-3 text-right text-indigo-600">{fmt(r.invoiced)}</td>
                                            <td className="px-5 py-3 text-right text-green-600 font-bold">{fmt(r.collected)}</td>
                                            <td className="px-5 py-3 text-right text-red-600">{fmt(r.balance)}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.rate >= 80 ? 'bg-green-100 text-green-700' : r.rate >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{r.rate}%</span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-400">{r.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {rows.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-slate-50 dark:bg-slate-900 font-bold text-sm">
                                            <td className="px-5 py-3 text-slate-700 dark:text-slate-300">TOTALS</td>
                                            <td className="px-5 py-3 text-right text-indigo-600">{fmt(summary.total_invoiced)}</td>
                                            <td className="px-5 py-3 text-right text-green-600">{fmt(summary.total_collected)}</td>
                                            <td className="px-5 py-3 text-right text-red-600">{fmt(summary.total_balance)}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${summary.collection_rate >= 80 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{summary.collection_rate}%</span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-400">{summary.invoice_count}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FeeCollectionsReport;
