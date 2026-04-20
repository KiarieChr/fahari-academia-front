import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import ExportButton from './ExportButton';

const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const TopDefaultersReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [limit, setLimit] = useState(20);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeService.getTopDefaulters({ limit });
            setData(res);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [limit]);

    const rows = data?.rows || [];
    const chartData = rows.slice(0, 15).map((r) => ({
        name: r.student_name.split(' ')[0],
        balance: r.total_balance,
    }));

    const getExportRows = () => rows.map((r) => [r.admission_number, r.student_name, r.class_session, r.total_invoiced, r.total_paid, r.total_balance]);

    const maxBalance = rows[0]?.total_balance || 1;

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">Top N</label>
                        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value={10}>Top 10</option>
                            <option value={20}>Top 20</option>
                            <option value={50}>Top 50</option>
                            <option value={100}>Top 100</option>
                        </select>
                    </div>
                    <div className="ml-auto">
                        <ExportButton
                            title="Top Fee Defaulters Report"
                            headers={['Adm No', 'Student', 'Class', 'Total Invoiced (KES)', 'Total Paid (KES)', 'Balance (KES)']}
                            getRows={getExportRows}
                            filename="top-defaulters"
                        />
                    </div>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total Outstanding (Top {limit})</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{fmt(rows.reduce((a, b) => a + b.total_balance, 0))}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Highest Single Balance</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{fmt(maxBalance)}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <>
                    {chartData.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Top Defaulters by Balance</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Bar dataKey="balance" radius={[4, 4, 0, 0]} name="Balance">
                                            {chartData.map((_, i) => {
                                                const ratio = chartData[i].balance / maxBalance;
                                                const r = Math.round(239 * ratio);
                                                return <Cell key={i} fill={`rgb(${r}, ${Math.round(50 + 70 * (1 - ratio))}, ${Math.round(50 + 70 * (1 - ratio))})`} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Top {limit} Fee Defaulters</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold w-8">#</th>
                                        <th className="px-4 py-3 font-semibold">Student</th>
                                        <th className="px-4 py-3 font-semibold">Class</th>
                                        <th className="px-4 py-3 font-semibold text-right">Invoiced</th>
                                        <th className="px-4 py-3 font-semibold text-right">Paid</th>
                                        <th className="px-4 py-3 font-semibold text-right text-red-500">Balance</th>
                                        <th className="px-4 py-3 font-semibold text-right">% Paid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {rows.length === 0 ? (
                                        <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">No defaulters found</td></tr>
                                    ) : rows.map((r, i) => {
                                        const pct = r.total_invoiced > 0 ? ((r.total_paid / r.total_invoiced) * 100).toFixed(0) : 0;
                                        return (
                                            <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${i < 3 ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                                                <td className="px-4 py-3 text-slate-400 font-medium">{i + 1}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-800 dark:text-slate-200">{r.student_name}</p>
                                                    <p className="text-xs text-slate-400">{r.admission_number}</p>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500">{r.class_session}</td>
                                                <td className="px-4 py-3 text-right text-indigo-600">{fmt(r.total_invoiced)}</td>
                                                <td className="px-4 py-3 text-right text-green-600">{fmt(r.total_paid)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-red-600">{fmt(r.total_balance)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                            <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                                                        </div>
                                                        <span className="text-xs text-slate-500">{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TopDefaultersReport;
