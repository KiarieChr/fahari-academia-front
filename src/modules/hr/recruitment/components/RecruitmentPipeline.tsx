
import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Star, Clock } from 'lucide-react';

const RecruitmentPipeline = ({ stages }) => {
    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => (
                <div key={stage.id} className="min-w-[280px] w-full max-w-[320px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">{stage.title}</h3>
                            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                                {stage.count}
                            </span>
                        </div>
                        <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 min-h-[500px] border border-slate-200/50 dark:border-slate-700/50">
                        {stage.candidates.map((candidate) => (
                            <motion.div
                                key={candidate.id}
                                layoutId={candidate.id}
                                whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm mb-3 cursor-grab active:cursor-grabbing group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                                        {candidate.role}
                                    </span>
                                    {candidate.score >= 90 && (
                                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                            <Star size={10} fill="currentColor" />
                                            {candidate.score}%
                                        </div>
                                    )}
                                </div>

                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-0.5">{candidate.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{candidate.experience}</p>

                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                                    <div className="flex -space-x-1.5">
                                        {/* Mock interviewer avatars */}
                                        <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900 border border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-purple-700 dark:text-purple-300">JD</div>
                                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900 border border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-amber-700 dark:text-amber-300">TS</div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <Clock size={10} />
                                        {candidate.date}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecruitmentPipeline;
