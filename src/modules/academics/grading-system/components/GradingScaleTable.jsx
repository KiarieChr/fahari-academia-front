import React from 'react';
import { MoreVertical, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

const GradingScaleTable = () => {
    // Mock data for display
    const grades = [
        { id: 1, grade: 'A', min: 80, max: 100, points: 4.0, desc: 'Excellent', status: 'Pass' },
        { id: 2, grade: 'B+', min: 75, max: 79, points: 3.5, desc: 'Very Good', status: 'Pass' },
        { id: 3, grade: 'B', min: 70, max: 74, points: 3.0, desc: 'Good', status: 'Pass' },
        { id: 4, grade: 'C+', min: 65, max: 69, points: 2.5, desc: 'Satisfactory', status: 'Pass' },
        { id: 5, grade: 'C', min: 60, max: 64, points: 2.0, desc: 'Average', status: 'Pass' },
        { id: 6, grade: 'D', min: 50, max: 59, points: 1.0, desc: 'Pass', status: 'Pass' },
        { id: 7, grade: 'E', min: 0, max: 49, points: 0.0, desc: 'Fail', status: 'Fail' },
    ];

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Grading Scale Configuration</h3>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    Edi Rules
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Grade</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Range (%)</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Points (GPA)</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Descriptor</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {grades.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{item.grade}</td>
                                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                                    {item.min} - {item.max}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium">{item.points.toFixed(1)}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.desc}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'Pass'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="p-1 text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>No gaps or overlaps detected</span>
                </div>
            </div>
        </div>
    );
};

export default GradingScaleTable;
