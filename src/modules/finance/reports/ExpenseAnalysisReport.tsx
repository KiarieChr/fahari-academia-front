import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Loader2, TrendingDown } from 'lucide-react';
import ExportButton from './ExportButton';

const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);
const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#06B6D4', '#8B5CF6', '#EC4899', '#14B8A6'];

const ExpenseAnalysisReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [filters, setFilters] = useState({ start_date: '', end_date: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeService.getExpenseAnalysis(filters);
            setData(res);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const summary = data?.summary || {};
    const byAccount = data?.by_account || [];
    const monthly = data?.monthly_trend || [];

    const chartData = byAccount.slice(0, 10).map((a) => ({ name: a.account_name.length > 20 ? a.account_name.slice(0, 18) + '…' : a.account_name, value: a.amount }));
    const pieData = byAccount.slice(0, 8).map((a) => ({ name: a.account_name, value: a.amount }));
    const trendData = monthly.map((m) => ({ month: m.month.slice(0, 7), amount: m.amount }));

    const getExportRows = () => byAccount.map((a) => [a.account_name, a.sub_type || '', a.amount, a.count]);

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex flex-wrap gap-3 items-end">
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
                            title="Expense Analysis Report"
                            headers={['Account', 'Sub Type', 'Amount (KES)', 'Entries']}
                            getRows={getExportRows}
                            filename="expense-analysis"
                        />
                    </div>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{fmt(summary.total_expenses)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Expense Accounts</p>
                    <p className="text-2xl font-bold mt-1 text-slate-700 dark:text-slate-200">{summary.account_count ?? 0}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Bar chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Top Expense Accounts</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                        <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                        <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} axisLine={false} width={120} />
                                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} name="Amount" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Distribution</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="42%" innerRadius={46} outerRadius={74} paddingAngle={3} dataKey="value">
                                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => fmt(v)} />
                                        <Legend verticalAlign="bottom" height={36} iconSize={9} wrapperStyle={{ fontSize: 10 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    {trendData.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Monthly Expense Trend</h3>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Line type="monotone" dataKey="amount" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3 }} name="Expenses" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Detail Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">By Account</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Account</th>
                                        <th className="px-5 py-3 font-semibold">Category</th>
                                        <th className="px-5 py-3 font-semibold text-right">Amount</th>
                                        <th className="px-5 py-3 font-semibold text-right">% of Total</th>
                                        <th className="px-5 py-3 font-semibold text-right">Entries</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {byAccount.length === 0 ? (
                                        <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                            <TrendingDown size={28} className="mx-auto mb-2 opacity-40" />No expense data
                                        </td></tr>
                                    ) : byAccount.map((a, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{a.account_name}</td>
                                            <td className="px-5 py-3 text-slate-500 text-xs">{a.sub_type || '—'}</td>
                                            <td className="px-5 py-3 text-right text-red-600 font-bold">{fmt(a.amount)}</td>
                                            <td className="px-5 py-3 text-right text-slate-500">
                                                {summary.total_expenses > 0 ? ((a.amount / summary.total_expenses) * 100).toFixed(1) : 0}%
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-400">{a.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {byAccount.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-slate-50 dark:bg-slate-900 font-bold text-sm">
                                            <td colSpan={2} className="px-5 py-3 text-slate-700 dark:text-slate-300">TOTAL</td>
                                            <td className="px-5 py-3 text-right text-red-600">{fmt(summary.total_expenses)}</td>
                                            <td className="px-5 py-3 text-right text-slate-500">100%</td>
                                            <td className="px-5 py-3 text-right text-slate-400">{byAccount.reduce((a, b) => a + b.count, 0)}</td>
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

export default ExpenseAnalysisReport;
