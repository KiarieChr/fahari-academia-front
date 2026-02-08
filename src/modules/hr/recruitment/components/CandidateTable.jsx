
import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Download, Filter, Search } from 'lucide-react';

const CandidateTable = ({ candidates }) => {
    // Helper to get status styles
    const getStatusStyle = (status) => {
        const styles = {
            'New': 'bg-blue-50 text-blue-700 border-blue-100',
            'In Review': 'bg-purple-50 text-purple-700 border-purple-100',
            'Scheduled': 'bg-amber-50 text-amber-700 border-amber-100',
            'Pending Score': 'bg-orange-50 text-orange-700 border-orange-100',
            'Offer Sent': 'bg-emerald-50 text-emerald-700 border-emerald-100',
            'Rejected': 'bg-red-50 text-red-700 border-red-100',
        };
        return styles[status] || 'bg-slate-50 text-slate-700 border-slate-100';
    };

    // Helper to get status color for the new structure
    const getStatusColor = (stage) => {
        const stageColors = {
            'New': 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800',
            'In Review': 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/50 dark:text-purple-400 dark:border-purple-800',
            'Scheduled': 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-800',
            'Pending Score': 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/50 dark:text-orange-400 dark:border-orange-800',
            'Offer Sent': 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-800',
            'Rejected': 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/50 dark:text-red-400 dark:border-red-800',
        };
        return stageColors[stage] || 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800';
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-700 dark:text-slate-200"
                    />
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm p-2">
                        <Filter size={18} />
                    </button>
                    <button className="btn btn-outline-secondary btn-sm p-2">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Candidate</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Position</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Stage</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Applied Date</th>
                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {candidates.map((candidate) => (
                            <motion.tr
                                key={candidate.id}
                                whileHover={{ backgroundColor: 'rgba(248,250,252, 0.5)' }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                            {candidate.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{candidate.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{candidate.position}</td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(candidate.stage)}`}>
                                        {candidate.stage}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{candidate.appliedDate}</td>
                                <td className="py-4 px-6 text-right">
                                    <button className="btn btn-link btn-sm text-decoration-none">View</button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">Showing 1-10 of 42 candidates</p>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm">Previous</button>
                    <button className="btn btn-outline-secondary btn-sm">Next</button>
                </div>
            </div>
        </div>
    );
};

export default CandidateTable;
