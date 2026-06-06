import React from 'react';
import { motion } from 'framer-motion';

const HiringNeedsWidget = ({ openings = [] }) => {
    // If no openings, provide some mock ones to match the mockup
    const displayOpenings = openings.length > 0 ? openings : [
        { title: 'Content Designers', count: 3, candidates: 5, progress: 75, color: 'text-indigo-500' },
        { title: 'Node.js Developers', count: 9, candidates: 12, progress: 25, color: 'text-rose-500' },
        { title: 'Senior UI Designer', count: 1, candidates: 0, progress: 0, color: 'text-slate-300' },
        { title: 'Marketing Managers', count: 2, candidates: 10, progress: 45, color: 'text-blue-500' }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">You need to hire</h3>
                <button className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors underline decoration-transparent hover:decoration-slate-400 underline-offset-4">
                    see all
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayOpenings.map((job, idx) => (
                    <motion.div 
                        key={idx}
                        whileHover={{ y: -2 }}
                        className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
                                {job.count}
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                                    {job.title}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    ({job.candidates} candidates)
                                </p>
                            </div>
                        </div>

                        {/* Circular Progress Indicator */}
                        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                            <svg className="w-12 h-12 transform -rotate-90">
                                <circle 
                                    className="text-slate-100 dark:text-slate-700" 
                                    strokeWidth="3" 
                                    stroke="currentColor" 
                                    fill="transparent" 
                                    r="20" 
                                    cx="24" 
                                    cy="24" 
                                />
                                <circle 
                                    className={`${job.color} transition-all duration-1000 ease-out`}
                                    strokeWidth="3" 
                                    strokeDasharray={20 * 2 * Math.PI} 
                                    strokeDashoffset={20 * 2 * Math.PI - (job.progress / 100) * (20 * 2 * Math.PI)}
                                    strokeLinecap="round" 
                                    stroke="currentColor" 
                                    fill="transparent" 
                                    r="20" 
                                    cx="24" 
                                    cy="24" 
                                />
                            </svg>
                            <span className="absolute text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {job.progress}%
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HiringNeedsWidget;
