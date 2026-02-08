import React from 'react';
import { Filter, RefreshCcw } from 'lucide-react';

const ClassTimesFilterBar = () => {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
                {/* Academic Year */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Academic Year</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>2026</option>
                        <option>2025</option>
                    </select>
                </div>

                {/* Term */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Term</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Term 1</option>
                        <option>Term 2</option>
                        <option>Term 3</option>
                    </select>
                </div>

                {/* Class */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Class</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Classes</option>
                        <option>Form 1</option>
                        <option>Form 2</option>
                    </select>
                </div>

                {/* Day */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Day</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Days</option>
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                    </select>
                </div>

                {/* Teacher */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Teacher</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Teachers</option>
                        <option>John Maina (JM)</option>
                        <option>Alice Kamau (AK)</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Reset Filters">
                    <RefreshCcw size={18} />
                </button>
                <button className="px-4 py-2 bg-slate-900 text-black dark:bg-blue-600 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <Filter size={16} /> Apply Filters
                </button>
            </div>
        </div>
    );
};

export default ClassTimesFilterBar;
