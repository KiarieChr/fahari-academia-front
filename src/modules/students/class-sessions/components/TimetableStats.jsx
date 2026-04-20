import React, { useState, useEffect } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { api } from '../../../../services/apiClient';

const TimetableStats = ({ classSessionId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!classSessionId) return;
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await api.timetable.getAnalyticsDetail('coverage', classSessionId);
                setStats(data);
            } catch {
                setStats(null);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [classSessionId]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="animate-spin text-indigo-600" size={20} />
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const summary = stats.summary || stats;

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600" /> Coverage Analytics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summary.total_allocated !== undefined && (
                    <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-blue-600 font-medium">Allocated Lessons</p>
                        <p className="text-2xl font-bold text-blue-900">{summary.total_allocated}</p>
                    </div>
                )}
                {summary.total_scheduled !== undefined && (
                    <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-xs text-green-600 font-medium">Scheduled</p>
                        <p className="text-2xl font-bold text-green-900">{summary.total_scheduled}</p>
                    </div>
                )}
                {summary.total_remaining !== undefined && (
                    <div className="bg-amber-50 rounded-lg p-4">
                        <p className="text-xs text-amber-600 font-medium">Remaining</p>
                        <p className="text-2xl font-bold text-amber-900">{summary.total_remaining}</p>
                    </div>
                )}
                {summary.coverage_percentage !== undefined && (
                    <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-purple-600 font-medium">Coverage</p>
                        <p className="text-2xl font-bold text-purple-900">{Math.round(summary.coverage_percentage)}%</p>
                    </div>
                )}
            </div>

            {stats.subjects && stats.subjects.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">By Subject</h4>
                    <div className="space-y-2">
                        {stats.subjects.map((subj, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 w-32 truncate">{subj.subject_name || subj.name}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(100, subj.percentage || 0)}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 w-16 text-right">
                                    {subj.scheduled || 0}/{subj.allocated || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableStats;
