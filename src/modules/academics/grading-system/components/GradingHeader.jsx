import React from 'react';
import { Plus, Download, Copy, Calendar, Layers, BookOpen } from 'lucide-react';

const GradingHeader = ({ curriculum, setCurriculum }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                        <Layers size={24} />
                    </span>
                    Grading System
                </h1>
                <p className="text-slate-500 text-sm">Manage academic grading scales, boundaries, and rules across curricula.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Curriculum Switcher */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <button
                        onClick={() => setCurriculum('CBC')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${curriculum === 'CBC'
                            ? 'bg-white text-teal-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        CBC
                    </button>
                    <button
                        onClick={() => setCurriculum('IGCSE')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${curriculum === 'IGCSE'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        IGCSE
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                    <button className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm rounded-md border border-slate-200 dark:border-slate-700">
                        2024
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        2025
                    </button>
                </div>

                <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradingHeader;
