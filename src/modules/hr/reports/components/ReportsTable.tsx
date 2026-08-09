
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const ReportsTable = ({ data, category }) => {
    const getStatusStyle = (status) => {
        const styles = {
            'Critical': 'bg-red-50 text-red-600 border-red-100',
            'Warning': 'bg-amber-50 text-amber-600 border-amber-100',
            'Action Needed': 'bg-orange-50 text-orange-600 border-orange-100',
            'Normal': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        };
        return styles[status] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                <h3 className="font-bold text-slate-800 text-sm">Detailed {category} Records</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Metric</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Value (Affected)</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Department</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date/Period</th>
                            <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((item) => (
                            <motion.tr
                                key={item.id}
                                className="hover:bg-slate-50/50 transition-colors"
                            >
                                <td className="py-3 px-4 text-sm font-medium text-slate-700">{item.metric}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{item.value}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{item.department}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">{item.date}</td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                                        {item.status === 'Critical' && <AlertCircle size={10} />}
                                        {item.status === 'Warning' && <Clock size={10} />}
                                        {item.status === 'Normal' && <CheckCircle size={10} />}
                                        {item.status}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-3 border-t border-slate-100 text-center">
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700">View Full Report</button>
            </div>
        </div>
    );
};

export default ReportsTable;
