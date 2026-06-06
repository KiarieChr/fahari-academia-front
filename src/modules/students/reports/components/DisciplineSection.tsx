import React from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const DisciplineSection = ({ data }) => {
    if (!data) return <div className="p-4 text-center text-gray-500">No discipline data available</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-red-600">Total Cases</p>
                        <h3 className="text-2xl font-bold text-red-900">{data.summary.total}</h3>
                    </div>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-green-600">Resolved</p>
                        <h3 className="text-2xl font-bold text-green-900">{data.summary.resolved}</h3>
                    </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-600">Pending</p>
                        <h3 className="text-2xl font-bold text-amber-900">{data.summary.pending}</h3>
                    </div>
                </div>
            </div>

            {/* Cases Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white">Recent Discipline Cases</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Student Name</th>
                                <th className="px-6 py-3 font-semibold">Class</th>
                                <th className="px-6 py-3 font-semibold">Case Type</th>
                                <th className="px-6 py-3 font-semibold">Severity</th>
                                <th className="px-6 py-3 font-semibold">Action Taken</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {data.cases.map((row, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{row.student}</td>
                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{row.class}</td>
                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{row.type}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.severity === 'High' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {row.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{row.action}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DisciplineSection;
