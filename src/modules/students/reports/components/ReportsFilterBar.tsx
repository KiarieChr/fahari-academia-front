import React from 'react';
import { Filter, Calendar, RefreshCcw } from 'lucide-react';

const ReportsFilterBar = () => {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
                {/* Academic Year */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Academic Year</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>2024</option>
                        <option>2023</option>
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
                        <option>Grade 1</option>
                        <option>Grade 2</option>
                    </select>
                </div>

                {/* Stream */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Stream</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-0">
                        <option>All Streams</option>
                        <option>East</option>
                        <option>West</option>
                    </select>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Status</label>
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Active</option>
                        <option>Alumni</option>
                        <option>Transferred</option>
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

export default ReportsFilterBar;
