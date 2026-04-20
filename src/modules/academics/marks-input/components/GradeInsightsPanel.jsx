import React from 'react';
import { TrendingUp, Award, BarChart2, X, ChevronRight } from 'lucide-react';

const GradeInsightsPanel = ({ stats, analysis, isOpen, togglePanel }) => {
    if (!isOpen) {
        return (
            <button
                onClick={togglePanel}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-2 rounded-l-xl shadow-lg border-y border-l border-slate-200 dark:border-slate-700 z-40 text-blue-600 hover:w-12 transition-all flex items-center justify-center group"
                title="Show Insights"
            >
                <ChevronRight size={20} className="rotate-180 group-hover:scale-110 transition-transform" />
            </button>
        );
    }

    // Use API analysis if available, else fall back to local stats
    const displayStats = {
        average: analysis?.mean_mark?.toFixed(1) ?? stats.average,
        passRate: analysis?.pass_rate?.toFixed(1) ?? stats.passRate,
        highest: analysis?.highest_mark ?? stats.highest,
        lowest: analysis?.lowest_mark ?? stats.lowest,
        entered: analysis?.marks_entered ?? stats.entered,
        total: analysis?.total_students ?? stats.total,
        absent: analysis?.absent ?? stats.absent,
    };

    const gradeDistribution = analysis?.grade_distribution || {};

    // Compute max count for bar scaling
    const maxCount = Math.max(1, ...Object.values(gradeDistribution).map(v => v.count || 0));

    return (
        <div className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-40 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 sticky top-0">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BarChart2 size={18} className="text-blue-600" /> Performance
                </h3>
                <button onClick={togglePanel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={20} />
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Average</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{displayStats.average}%</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100 dark:border-green-800">
                        <div className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Pass Rate</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{displayStats.passRate}%</div>
                    </div>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{displayStats.total}</div>
                        <div className="text-xs text-slate-500">Total</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{displayStats.entered}</div>
                        <div className="text-xs text-slate-500">Entered</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                        <div className="text-lg font-bold text-red-500">{displayStats.absent}</div>
                        <div className="text-xs text-slate-500">Absent</div>
                    </div>
                </div>

                {/* High/Low */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600">
                                <Award size={18} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">Highest</div>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{displayStats.highest ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                                <TrendingUp size={18} className="rotate-180" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">Lowest</div>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{displayStats.lowest ?? '—'}</span>
                    </div>
                </div>

                {/* Grade Distribution */}
                {Object.keys(gradeDistribution).length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Grade Distribution</h4>
                        <div className="space-y-2">
                            {Object.entries(gradeDistribution).map(([grade, info]) => {
                                const pct = ((info.count / maxCount) * 100).toFixed(0);
                                return (
                                    <div key={grade} className="flex items-center gap-2 text-xs">
                                        <span className="w-6 font-bold text-right">{grade}</span>
                                        <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${pct}%`,
                                                    backgroundColor: info.color || '#6366f1',
                                                }}
                                            />
                                        </div>
                                        <span className="text-slate-500 w-6 text-right">{info.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {Object.keys(gradeDistribution).length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-4">
                        Submit marks to see grade distribution
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeInsightsPanel;
