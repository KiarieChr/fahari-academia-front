import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];

const SessionStatisticsSection = ({ data = {}, loading }) => {
    const { results = [] } = data;

    // YOY chart for all years
    const yoyChart = results.map((r) => ({
        year: r.academic_year,
        enrollments: r.total_enrollments,
        collected: r.total_collected / 1000,
        invoiced: r.total_invoiced / 1000,
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <>
                    {/* Year-on-Year Chart */}
                    {yoyChart.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Enrollments by Academic Year</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yoyChart}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="enrollments" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Enrollments" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Collections by Academic Year (KES '000)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yoyChart}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip formatter={(v) => `KES ${(v * 1000).toLocaleString()}`} contentStyle={{ borderRadius: 8, border: 'none' }} />
                                            <Bar dataKey="invoiced" fill="#93C5FD" radius={[3, 3, 0, 0]} name="Invoiced" />
                                            <Bar dataKey="collected" fill="#34D399" radius={[3, 3, 0, 0]} name="Collected" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Per-Year Accordion */}
                    {results.map((yearData) => (
                        <div key={yearData.academic_year_id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">{yearData.academic_year}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {yearData.total_sessions} sessions · {yearData.total_enrollments} enrollments
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Collected</p>
                                        <p className="text-sm font-bold text-green-600">
                                            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(yearData.total_collected)}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${yearData.collection_rate >= 80 ? 'bg-green-100 text-green-700' : yearData.collection_rate >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                        {yearData.collection_rate}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">Term</th>
                                            <th className="px-5 py-3 font-semibold text-right">Sessions</th>
                                            <th className="px-5 py-3 font-semibold text-right">Enrollments</th>
                                            <th className="px-5 py-3 font-semibold text-right">Invoiced</th>
                                            <th className="px-5 py-3 font-semibold text-right">Collected</th>
                                            <th className="px-5 py-3 font-semibold text-center">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {yearData.terms.map((t) => (
                                            <tr key={t.term} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{t.term}</td>
                                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{t.sessions}</td>
                                                <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-400">{t.enrollments}</td>
                                                <td className="px-5 py-3 text-right text-indigo-600">{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(t.invoiced)}</td>
                                                <td className="px-5 py-3 text-right text-green-600 font-bold">{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(t.collected)}</td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.collection_rate >= 80 ? 'bg-green-100 text-green-700' : t.collection_rate >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        {t.collection_rate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {results.length === 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400">
                            <TrendingUp size={36} className="mx-auto mb-3 opacity-40" />
                            No session data available
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SessionStatisticsSection;
