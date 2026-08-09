import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import ExportButton from './ExportButton';

const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const PaymentSummaryReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [groupBy, setGroupBy] = useState('month');
    const [filters, setFilters] = useState({ start_date: '', end_date: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeService.getPaymentSummaryReport({ ...filters, group_by: groupBy });
            setData(res);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [groupBy, filters.start_date, filters.end_date]);

    const summary = data?.summary || {};
    const rows = data?.rows || [];
    const byMethod = summary.by_method || [];

    const chartData = rows.slice(0, 24).map((r) => ({
        name: r.period.length > 10 ? r.period.slice(0, 7) : r.period,
        total: r.total,
        count: r.count,
    }));

    const methodChart = byMethod.map((m) => ({ name: m.method, value: m.total }));

    const getExportRows = () => rows.map((r) => [r.period, r.total, r.count]);

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">Period</label>
                        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="day">Daily</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                            <option value="year">Yearly</option>
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
                    <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">Refresh</button>
                    <div className="ml-auto">
                        <ExportButton
                            title="Payment Summary Report"
                            subtitle={`Grouped by: ${groupBy}`}
                            headers={['Period', 'Total Amount (KES)', 'Transaction Count']}
                            getRows={getExportRows}
                            filename="payment-summary"
                        />
                    </div>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total Collected</p>
                    <p className="text-2xl font-bold mt-1 text-green-600">{fmt(summary.grand_total)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Transactions</p>
                    <p className="text-2xl font-bold mt-1 text-blue-600">{summary.grand_count ?? 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Avg per Transaction</p>
                    <p className="text-2xl font-bold mt-1 text-indigo-600">
                        {fmt(summary.grand_count > 0 ? (summary.grand_total / summary.grand_count) : 0)}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Collections Trend</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(v, n) => [n === 'total' ? fmt(v) : v, n === 'total' ? 'Amount' : 'Transactions']} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} name="total" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">By Payment Method</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={methodChart} cx="50%" cy="42%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                            {methodChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => fmt(v)} />
                                        <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Method Table */}
                    {byMethod.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-800 dark:text-white">By Payment Method</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold">Method</th>
                                        <th className="px-5 py-3 text-right font-semibold">Total</th>
                                        <th className="px-5 py-3 text-right font-semibold">Transactions</th>
                                        <th className="px-5 py-3 text-right font-semibold">% Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {byMethod.map((m, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{m.method}</td>
                                            <td className="px-5 py-3 text-right text-green-600 font-bold">{fmt(m.total)}</td>
                                            <td className="px-5 py-3 text-right text-slate-600">{m.count}</td>
                                            <td className="px-5 py-3 text-right text-slate-500">
                                                {summary.grand_total > 0 ? ((m.total / summary.grand_total) * 100).toFixed(1) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Period Detail */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}ly Breakdown</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold">Period</th>
                                        <th className="px-5 py-3 text-right font-semibold">Total Amount</th>
                                        <th className="px-5 py-3 text-right font-semibold">Transactions</th>
                                        <th className="px-5 py-3 text-right font-semibold">Avg</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {rows.length === 0 ? (
                                        <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400"><AlertCircle size={24} className="mx-auto mb-2 opacity-40" />No data</td></tr>
                                    ) : rows.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{r.period}</td>
                                            <td className="px-5 py-3 text-right text-green-600 font-bold">{fmt(r.total)}</td>
                                            <td className="px-5 py-3 text-right text-blue-600">{r.count}</td>
                                            <td className="px-5 py-3 text-right text-slate-500">{fmt(r.count > 0 ? r.total / r.count : 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PaymentSummaryReport;
