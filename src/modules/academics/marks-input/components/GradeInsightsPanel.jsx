import React from 'react';
import { TrendingUp, Award, AlertCircle, BarChart2, X, ChevronRight } from 'lucide-react';

const GradeInsightsPanel = ({ stats, isOpen, togglePanel }) => {
    if (!isOpen) {
        return (
            <button
                onClick={togglePanel}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-2 rounded-l-xl shadow-lg border-y border-l border-slate-200 dark:border-slate-700 z-40 text-blue-600 hover:w-12 transition-all flex items-center justify-center group"
                title="Show Insights"
            >
                <ChevronRight size={20} className="rotate-180 group-hover:scale-110 transition-transform" />
            </button>
        )
    }

    return (
        <div className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-40 overflow-y-auto animate-in slide-in-from-right duration-300">
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
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.average}%</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100 dark:border-green-800">
                        <div className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Pass Rate</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.passRate}%</div>
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
                                <div className="text-xs text-slate-500">Score</div>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.highest}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                                <TrendingUp size={18} className="rotate-180" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white">Lowest</div>
                                <div className="text-xs text-slate-500">Score</div>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{stats.lowest}</span>
                    </div>
                </div>

                {/* Distribution Mock */}
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Grade Distribution</h4>
                    <div className="space-y-2">
                        {/* Mock bars */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-4 font-bold">A</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[15%]"></div>
                            </div>
                            <span className="text-slate-400">15%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-4 font-bold">B</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[45%]"></div>
                            </div>
                            <span className="text-slate-400">45%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-4 font-bold">C</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[30%]"></div>
                            </div>
                            <span className="text-slate-400">30%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="w-4 font-bold">D</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-400 w-[10%]"></div>
                            </div>
                            <span className="text-slate-400">10%</span>
                        </div>
                    </div>
                </div>

                {/* Alert */}
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <p>3 students have scored significantly lower than their term average. Consider adding remarks.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradeInsightsPanel;
