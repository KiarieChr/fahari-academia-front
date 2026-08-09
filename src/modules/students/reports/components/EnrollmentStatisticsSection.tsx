import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Loader2, GraduationCap } from 'lucide-react';

const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];

const EnrollmentStatisticsSection = ({ data = {}, loading }) => {
    const { summary = {}, by_session = [], by_progression = [], monthly_trend = [], year_on_year = [] } = data;

    const sessionChart = by_session.slice(0, 12).map((s) => ({
        name: s.session_name,
        total: s.total,
        male: s.male,
        female: s.female,
    }));
    const progressionChart = by_progression.map((p) => ({
        name: p.progression_status || 'Unknown',
        value: p.count,
    }));
    const monthlyChart = monthly_trend.map((m) => ({ month: m.month, count: m.count }));
    const yoyChart = year_on_year.map((y) => ({ year: y.year, total: y.total, active: y.active }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Enrolled', value: summary.total, color: 'text-blue-600' },
                    { label: 'Active', value: summary.active, color: 'text-green-600' },
                    { label: 'Male', value: summary.male, color: 'text-indigo-600' },
                    { label: 'Female', value: summary.female, color: 'text-pink-600' },
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* By Session Bar Chart */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Enrollment by Session</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sessionChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={40} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Bar dataKey="male" stackId="gender" fill="#3B82F6" radius={[0, 0, 0, 0]} name="Male" />
                                        <Bar dataKey="female" stackId="gender" fill="#EC4899" radius={[3, 3, 0, 0]} name="Female" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* By Progression Pie */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">By Progression</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={progressionChart} cx="50%" cy="45%" innerRadius={52} outerRadius={80} paddingAngle={4} dataKey="value">
                                            {progressionChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    {monthlyChart.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Monthly Enrollment Trend</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} name="Enrollments" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* YOY Chart */}
                    {yoyChart.length > 1 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Year-on-Year Enrollment</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={yoyChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="year" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 8, border: 'none' }} />
                                        <Bar dataKey="total" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Total" />
                                        <Bar dataKey="active" fill="#10B981" radius={[3, 3, 0, 0]} name="Active" />
                                        <Legend wrapperStyle={{ fontSize: 12 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Session Table */}
                    {by_session.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-800 dark:text-white">Enrollment by Session (Detail)</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">Session</th>
                                            <th className="px-5 py-3 font-semibold">Grade</th>
                                            <th className="px-5 py-3 font-semibold text-right">Total</th>
                                            <th className="px-5 py-3 font-semibold text-right text-blue-600">Male</th>
                                            <th className="px-5 py-3 font-semibold text-right text-pink-600">Female</th>
                                            <th className="px-5 py-3 font-semibold text-right">New</th>
                                            <th className="px-5 py-3 font-semibold text-right">Promoted</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {by_session.map((s, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{s.session_name}</td>
                                                <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.grade_name}</td>
                                                <td className="px-5 py-3 text-right font-bold text-slate-800 dark:text-white">{s.total}</td>
                                                <td className="px-5 py-3 text-right text-blue-600">{s.male}</td>
                                                <td className="px-5 py-3 text-right text-pink-600">{s.female}</td>
                                                <td className="px-5 py-3 text-right text-green-600">{s.new_students}</td>
                                                <td className="px-5 py-3 text-right text-indigo-600">{s.promoted}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-slate-50 dark:bg-slate-900 font-bold text-sm">
                                            <td colSpan={2} className="px-5 py-3 text-slate-700 dark:text-slate-300">TOTALS</td>
                                            <td className="px-5 py-3 text-right">{by_session.reduce((a, b) => a + b.total, 0)}</td>
                                            <td className="px-5 py-3 text-right text-blue-600">{by_session.reduce((a, b) => a + b.male, 0)}</td>
                                            <td className="px-5 py-3 text-right text-pink-600">{by_session.reduce((a, b) => a + b.female, 0)}</td>
                                            <td className="px-5 py-3 text-right text-green-600">{by_session.reduce((a, b) => a + b.new_students, 0)}</td>
                                            <td className="px-5 py-3 text-right text-indigo-600">{by_session.reduce((a, b) => a + b.promoted, 0)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {by_session.length === 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-400">
                            <GraduationCap size={36} className="mx-auto mb-3 opacity-40" />
                            No enrollment data available
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EnrollmentStatisticsSection;
