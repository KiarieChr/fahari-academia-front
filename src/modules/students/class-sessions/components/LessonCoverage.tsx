import React from 'react';
import { BookOpen } from 'lucide-react';

// Static color map — avoids Tailwind JIT purging dynamic class names
const coverageColor = (pct) => {
    if (pct >= 90) return { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Completed' };
    if (pct >= 70) return { bar: 'bg-green-500', badge: 'bg-green-50 text-green-700 border-green-200', label: 'On Track' };
    if (pct >= 40) return { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200', label: 'In Progress' };
    return { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'Behind' };
};

const LessonCoverage = ({ analytics = null }) => {
    // analytics.curriculum_coverage is an array of
    // { subject_name, class_session_name, topics_covered, topics_planned, coverage_pct, ... }
    const rawCoverage = analytics?.curriculum_coverage ?? [];

    // Build display rows — normalise field names from API or fall back to empty
    const rows = rawCoverage.map((item, idx) => {
        const planned = item.topics_planned ?? item.planned ?? 0;
        const covered = item.topics_covered ?? item.covered ?? 0;
        const pct = planned > 0 ? Math.round((covered / planned) * 100) : (item.coverage_pct ?? 0);
        return {
            id: item.id ?? idx,
            name: item.subject_name ?? item.subject ?? 'Unknown',
            cls: item.class_session_name ?? item.class ?? '—',
            planned, covered, pct,
        };
    });

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Syllabus Coverage</h3>
                {!analytics && (
                    <span className="ml-auto text-xs text-gray-400 italic">loading…</span>
                )}
            </div>

            {rows.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                    {analytics ? 'No curriculum coverage data available.' : 'Fetching coverage data…'}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4 text-center">Progress</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((sub) => {
                                const { bar, badge, label } = coverageColor(sub.pct);
                                return (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{sub.name}</td>
                                        <td className="px-6 py-4">{sub.cls}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${bar}`}
                                                        style={{ width: `${sub.pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold w-8 text-right">{sub.pct}%</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1">
                                                {sub.covered} / {sub.planned} Topics
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${badge}`}>
                                                {label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LessonCoverage;
