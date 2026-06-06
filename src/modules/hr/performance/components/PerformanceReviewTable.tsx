
import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Filter, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const PerformanceReviewTable = ({ reviews }) => {

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700';
            case 'In Review': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700';
            case 'Pending Self-Review': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-700';
            case 'Action Plan Needed': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-700';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 70) return 'bg-blue-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden text-slate-900 dark:text-slate-100">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <FileText size={18} className="text-purple-600 dark:text-purple-400" />
                    Performance Reviews
                </h3>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Review Cycle</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reviewer</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Score</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {reviews.map((review) => (
                            <motion.tr
                                key={review.id}
                                whileHover={{ backgroundColor: 'rgba(248,250,252, 0.5)' }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                            {review.employee.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">{review.employee}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{review.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">{review.period}</td>
                                <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px]">
                                            {review.reviewer.charAt(0)}
                                        </div>
                                        {review.reviewer}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getScoreColor(review.score)}`}
                                                style={{ width: `${review.score}%` }}
                                            />
                                        </div>
                                        {review.score ? (
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{review.score}%</span>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">--</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(review.status)}`}>
                                        {review.status === 'Completed' && <CheckCircle size={12} className="mr-1" />}
                                        {review.status === 'Pending Self-Review' && <Clock size={12} className="mr-1" />}
                                        {review.status === 'Action Plan Needed' && <AlertCircle size={12} className="mr-1" />}
                                        {review.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        View
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
                <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">View All Reviews</button>
            </div>
        </div>
    );
};

export default PerformanceReviewTable;
