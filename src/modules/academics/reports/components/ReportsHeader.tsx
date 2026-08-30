import React from 'react';
import { FileText } from 'lucide-react';

const ReportsHeader = ({ curriculum, setCurriculum, curriculaList = [] }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 mb-3 dark:border-slate-700 shadow-sm top-0 z-30 relative overflow-hidden neo-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="space-y-1 z-10">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <span className={`p-2.5 rounded-xl shadow-sm ${curriculum === 'CBC' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'}`}>
                        <FileText size={22} />
                    </span>
                    Student Academic Reports
                </h1>
                <p className="text-slate-500 text-sm pl-[52px]">Generate, manage, and publish student report cards.</p>
            </div>

            <div className="flex bg-slate-100/80 dark:bg-slate-900/50 backdrop-blur-md rounded-xl p-1.5 shadow-inner border border-slate-200/50 dark:border-slate-700/50 z-10 overflow-x-auto custom-scrollbar max-w-full">
                {curriculaList.length > 0 ? (
                    curriculaList.map(curr => (
                        <button
                            key={curr.id || curr.name}
                            onClick={() => setCurriculum(curr.name)}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 whitespace-nowrap ${curriculum === curr.name
                                ? curr.name === 'CBC'
                                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm ring-1 ring-teal-500/20'
                                    : 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/20'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            {curr.name}
                        </button>
                    ))
                ) : (
                    <>
                        <button
                            onClick={() => setCurriculum('CBC')}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${curriculum === 'CBC'
                                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm ring-1 ring-teal-500/20'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            CBC
                        </button>
                        <button
                            onClick={() => setCurriculum('IGCSE')}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all duration-300 ${curriculum === 'IGCSE'
                                ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/20'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            IGCSE
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportsHeader;
