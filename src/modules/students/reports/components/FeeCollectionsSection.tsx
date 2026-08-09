import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, TrendingUp, DollarSign } from 'lucide-react';

const fmtKES = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const RateBadge = ({ rate }) => {
    const color = rate >= 90 ? 'text-green-700 bg-green-100' : rate >= 70 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100';
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{rate}%</span>;
};

const FeeCollectionsSection = ({ data = {}, loading }) => {
    const { totals = {}, results = [] } = data;

    // Chart data (top 10 by projected)
    const chartData = [...results]
        .sort((a, b) => b.projected - a.projected)
        .slice(0, 12)
        .map((r) => ({
            name: r.session_name || r.grade,
            projected: r.projected,
            collected: r.collected,
            outstanding: r.outstanding,
        }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Projected', value: totals.projected, color: 'text-blue-600', icon: TrendingUp },
                    { label: 'Invoiced', value: totals.invoiced, color: 'text-indigo-600', icon: DollarSign },
                    { label: 'Collected', value: totals.collected, color: 'text-green-600', icon: DollarSign },
                    { label: 'Outstanding', value: totals.outstanding, color: 'text-red-600', icon: DollarSign },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase font-medium">{label}</p>
                        <p className={`text-xl font-bold mt-1 ${color}`}>{fmtKES(value)}</p>
                    </div>
                ))}
            </div>

            {/* Collection Rate Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white">Overall Collection Rate</h3>
                    <RateBadge rate={totals.collection_rate || 0} />
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                    <div
                        className="bg-green-500 h-3 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(totals.collection_rate || 0, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">{fmtKES(totals.collected)} of {fmtKES(totals.invoiced)} invoiced amount collected</p>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Collections by Session</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" interval={0} />
                                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(v) => fmtKES(v)} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="projected" fill="#93C5FD" radius={[3, 3, 0, 0]} name="Projected" />
                                <Bar dataKey="collected" fill="#34D399" radius={[3, 3, 0, 0]} name="Collected" />
                                <Bar dataKey="outstanding" fill="#FCA5A5" radius={[3, 3, 0, 0]} name="Outstanding" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Detail Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white">Per-Session Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Session</th>
                                    <th className="px-5 py-3 font-semibold">Grade</th>
                                    <th className="px-5 py-3 font-semibold">Term</th>
                                    <th className="px-5 py-3 font-semibold text-right">Students</th>
                                    <th className="px-5 py-3 font-semibold text-right">Fee/Student</th>
                                    <th className="px-5 py-3 font-semibold text-right">Projected</th>
                                    <th className="px-5 py-3 font-semibold text-right">Invoiced</th>
                                    <th className="px-5 py-3 font-semibold text-right text-green-600">Collected</th>
                                    <th className="px-5 py-3 font-semibold text-right text-red-500">Outstanding</th>
                                    <th className="px-5 py-3 font-semibold text-center">Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {results.length === 0 ? (
                                    <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-400">No data available</td></tr>
                                ) : results.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.session_name}</td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.grade || '—'}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{r.term || '—'}</td>
                                        <td className="px-5 py-3 text-right text-slate-700 dark:text-slate-300">{r.enrolled}</td>
                                        <td className="px-5 py-3 text-right text-slate-500 text-xs">{fmtKES(r.fee_per_student)}</td>
                                        <td className="px-5 py-3 text-right text-blue-600 font-medium">{fmtKES(r.projected)}</td>
                                        <td className="px-5 py-3 text-right text-indigo-600">{fmtKES(r.invoiced)}</td>
                                        <td className="px-5 py-3 text-right text-green-600 font-bold">{fmtKES(r.collected)}</td>
                                        <td className="px-5 py-3 text-right text-red-500">{fmtKES(r.outstanding)}</td>
                                        <td className="px-5 py-3 text-center"><RateBadge rate={r.collection_rate} /></td>
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

export default FeeCollectionsSection;
