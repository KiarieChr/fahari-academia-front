import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import EditIGCSEThresholdsModal from './EditIGCSEThresholdsModal';

const IGCSEGradingTable = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [grades, setGrades] = useState([
        { id: 1, grade: 'A*', min: 90, max: 100, points: 5.0, status: 'Distinction' },
        { id: 2, grade: 'A', min: 80, max: 89, points: 4.0, status: 'Distinction' },
        { id: 3, grade: 'B', min: 70, max: 79, points: 3.0, status: 'Merit' },
        { id: 4, grade: 'C', min: 60, max: 69, points: 2.0, status: 'Pass' },
        { id: 5, grade: 'D', min: 50, max: 59, points: 1.0, status: 'Pass' },
        { id: 6, grade: 'E', min: 40, max: 49, points: 0.5, status: 'Pass' },
        { id: 7, grade: 'F', min: 30, max: 39, points: 0.0, status: 'Ungraded' },
        { id: 8, grade: 'G', min: 20, max: 29, points: 0.0, status: 'Ungraded' },
        { id: 9, grade: 'U', min: 0, max: 19, points: 0.0, status: 'Ungraded' },
    ]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-sm overflow-hidden flex flex-col h-full ring-4 ring-indigo-50 dark:ring-indigo-900/20">
            <div className="p-4 border-b border-indigo-100 dark:border-indigo-800 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-100">IGCSE / Cambridge Scale</h3>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    Edit Thresholds
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-indigo-50 dark:bg-indigo-900/50 border-b border-indigo-100 dark:border-indigo-800">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-indigo-900 dark:text-indigo-100">Grade</th>
                            <th className="px-4 py-3 font-semibold text-indigo-900 dark:text-indigo-100">Percentage Range</th>
                            <th className="px-4 py-3 font-semibold text-indigo-900 dark:text-indigo-100">GPA Points</th>
                            <th className="px-4 py-3 font-semibold text-indigo-900 dark:text-indigo-100">Status</th>
                            <th className="px-4 py-3 font-semibold text-indigo-900 dark:text-indigo-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50 dark:divide-indigo-900/50">
                        {grades.map((item) => (
                            <tr key={item.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white text-lg">{item.grade}</td>
                                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                                    {item.min} - {item.max}%
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">{item.points.toFixed(1)}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'Distinction' ? 'bg-purple-100 text-purple-700' :
                                        item.status === 'Merit' ? 'bg-blue-100 text-blue-700' :
                                            item.status === 'Pass' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-slate-100 text-slate-600'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
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

            <EditIGCSEThresholdsModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                initialGrades={grades}
                onSave={setGrades}
            />
        </div>
    );
};

export default IGCSEGradingTable;
