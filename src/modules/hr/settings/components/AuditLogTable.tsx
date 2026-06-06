
import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const AuditLogTable = ({ logs }) => {
    return (
        <div className="overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search audit logs..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-700 dark:text-slate-200"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Filter size={14} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Action</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Module</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">User</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date & Time</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {logs.map((log) => (
                            <motion.tr
                                key={log.id}
                                whileHover={{ backgroundColor: 'rgba(248,250,252, 0.5)' }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors bg-white dark:bg-slate-800"
                            >
                                <td className="py-3 px-4">
                                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{log.action}</span>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{log.details}</p>
                                </td>
                                <td className="py-3 px-4">
                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                        {log.module}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold">
                                            {log.user.charAt(0)}
                                        </div>
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{log.user}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    {log.timestamp}
                                </td>
                                <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    {log.ip}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogTable;
