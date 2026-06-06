import React from 'react';
import { Loader2, BookOpen } from 'lucide-react';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLORS = {
    scheduled: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
    archived: 'bg-slate-100 text-slate-500',
};

const ClassListSection = ({ data = {}, loading }) => {
    const { count = 0, results = [] } = data;

    // Totals
    const totals = results.reduce((acc, r) => ({
        enrolled: acc.enrolled + (r.total_enrolled || 0),
        male: acc.male + (r.male_count || 0),
        female: acc.female + (r.female_count || 0),
    }), { enrolled: 0, male: 0, female: 0 });

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Summary Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Classes', value: count, color: 'text-blue-600' },
                    { label: 'Total Enrolled', value: totals.enrolled, color: 'text-green-600' },
                    { label: 'Male', value: totals.male, color: 'text-indigo-600' },
                    { label: 'Female', value: totals.female, color: 'text-pink-600' },
                ].map((m) => (
                    <div key={m.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase font-medium">{m.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white">Class Sessions</h3>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Session Name</th>
                                    <th className="px-5 py-3 font-semibold">Grade</th>
                                    <th className="px-5 py-3 font-semibold">Term</th>
                                    <th className="px-5 py-3 font-semibold">Academic Year</th>
                                    <th className="px-5 py-3 font-semibold">Curriculum</th>
                                    <th className="px-5 py-3 font-semibold">Level</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold text-right">Enrolled</th>
                                    <th className="px-5 py-3 font-semibold text-right">Male</th>
                                    <th className="px-5 py-3 font-semibold text-right">Female</th>
                                    <th className="px-5 py-3 font-semibold">Start Date</th>
                                    <th className="px-5 py-3 font-semibold">End Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {results.length === 0 ? (
                                    <tr><td colSpan={12} className="px-5 py-12 text-center text-slate-400">
                                        <BookOpen size={32} className="mx-auto mb-2 opacity-40" />No classes found
                                    </td></tr>
                                ) : results.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.grade || '—'}</td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.term || '—'}</td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{r.academic_year || '—'}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{r.curriculum || '—'}</td>
                                        <td className="px-5 py-3 text-slate-500 text-xs">{r.curriculum_level || '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-bold text-slate-800 dark:text-slate-200">{r.total_enrolled}</td>
                                        <td className="px-5 py-3 text-right text-indigo-600">{r.male_count}</td>
                                        <td className="px-5 py-3 text-right text-pink-600">{r.female_count}</td>
                                        <td className="px-5 py-3 text-xs text-slate-500">{fmtDate(r.start_date)}</td>
                                        <td className="px-5 py-3 text-xs text-slate-500">{fmtDate(r.end_date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {results.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-50 dark:bg-slate-900 font-bold text-sm">
                                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300" colSpan={7}>TOTALS</td>
                                        <td className="px-5 py-3 text-right text-slate-900 dark:text-white">{totals.enrolled}</td>
                                        <td className="px-5 py-3 text-right text-indigo-600">{totals.male}</td>
                                        <td className="px-5 py-3 text-right text-pink-600">{totals.female}</td>
                                        <td colSpan={2} />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassListSection;
