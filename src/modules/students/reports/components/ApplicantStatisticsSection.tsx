import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Loader2, Users } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];

const STATUS_LABELS = {
    pending: 'Pending Review',
    interview: 'Interview',
    accepted: 'Accepted',
    rejected: 'Rejected',
    waitlist: 'Waitlisted',
};

const ApplicantStatisticsSection = ({ data = {}, loading }) => {
    const { totals = {}, by_status = [], by_gender = [], by_level = [], by_campus = [], monthly_trend = [], year_on_year = [] } = data;

    const statusChart = by_status.map((s) => ({ name: STATUS_LABELS[s.status] || s.status, value: s.count }));
    const genderChart = by_gender.map((g) => ({ name: g.gender === 'M' ? 'Male' : g.gender === 'F' ? 'Female' : 'Unknown', value: g.count }));
    const monthlyChart = monthly_trend.map((m) => ({ month: m.month, total: m.count, accepted: m.accepted, rejected: m.rejected }));
    const yoyChart = year_on_year.map((y) => ({ year: y.year, total: y.total, accepted: y.accepted, rejected: y.rejected, pending: y.pending }));
    const levelChart = by_level.slice(0, 8).map((l) => ({ name: l.level || 'Unknown', value: l.count }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Total', value: totals.total, color: 'text-blue-600' },
                    { label: 'Pending', value: totals.pending, color: 'text-amber-600' },
                    { label: 'Interview', value: totals.interview, color: 'text-indigo-600' },
                    { label: 'Accepted', value: totals.accepted, color: 'text-green-600' },
                    { label: 'Rejected', value: totals.rejected, color: 'text-red-600' },
                    { label: 'Waitlisted', value: totals.waitlist, color: 'text-purple-600' },
                ].map((m) => (
                    <div key={m.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase font-medium">{m.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value ?? 0}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
            ) : (
                <>
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* By Status */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">By Status</h3>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusChart} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                            {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* By Gender */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">By Gender</h3>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={genderChart} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                                            {genderChart.map((_, i) => <Cell key={i} fill={['#3B82F6', '#EC4899', '#94A3B8'][i % 3]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* By Level */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">By Curriculum Level</h3>
                            <div className="h-56">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={levelChart} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                        <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} axisLine={false} width={90} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Bar dataKey="value" fill="#8B5CF6" radius={[0, 3, 3, 0]} name="Applicants" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    {monthlyChart.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Monthly Application Trend</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} name="Total" />
                                        <Line type="monotone" dataKey="accepted" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Accepted" strokeDasharray="5 3" />
                                        <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Rejected" strokeDasharray="5 3" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Year-on-Year */}
                    {yoyChart.length > 1 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Year-on-Year Comparison</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={yoyChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Bar dataKey="total" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Total" />
                                        <Bar dataKey="accepted" fill="#10B981" radius={[3, 3, 0, 0]} name="Accepted" />
                                        <Bar dataKey="pending" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Pending" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Campus Table */}
                    {by_campus.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-800 dark:text-white">By Campus</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-semibold">Campus</th>
                                        <th className="px-5 py-3 text-right font-semibold">Applications</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {by_campus.map((c, i) => (
                                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{c.campus_name || 'Unknown'}</td>
                                            <td className="px-5 py-3 text-right text-blue-600 font-bold">{c.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ApplicantStatisticsSection;
