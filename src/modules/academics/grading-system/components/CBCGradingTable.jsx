import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import EditCBCBoundariesModal from './EditCBCBoundariesModal';

const CBCGradingTable = () => {
    const [isEditing, setIsEditing] = useState(false);
    // CBC Performance Levels
    const [levels, setLevels] = useState([
        { id: 1, code: 'EE', label: 'Exceeds Expectations', min: 80, max: 100, status: 'Competent', color: 'green' },
        { id: 2, code: 'ME', label: 'Meets Expectations', min: 65, max: 79, status: 'Competent', color: 'teal' },
        { id: 3, code: 'AE', label: 'Approaching Expectations', min: 50, max: 64, status: 'Developing', color: 'amber' },
        { id: 4, code: 'BE', label: 'Below Expectations', min: 0, max: 49, status: 'Needs Support', color: 'red' },
    ]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900 shadow-sm overflow-hidden flex flex-col h-full ring-4 ring-teal-50 dark:ring-teal-900/20">
            <div className="p-4 border-b border-teal-100 dark:border-teal-800 flex justify-between items-center bg-teal-50/50 dark:bg-teal-900/10">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <h3 className="font-bold text-teal-900 dark:text-teal-100">CBC Performance Levels</h3>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                >
                    Edit Boundaries
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-teal-50 dark:bg-teal-900/50 border-b border-teal-100 dark:border-teal-800">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-teal-900 dark:text-teal-100">Level Code</th>
                            <th className="px-4 py-3 font-semibold text-teal-900 dark:text-teal-100">Performance Label</th>
                            <th className="px-4 py-3 font-semibold text-teal-900 dark:text-teal-100">Score Range</th>
                            <th className="px-4 py-3 font-semibold text-teal-900 dark:text-teal-100">Achievement Status</th>
                            <th className="px-4 py-3 font-semibold text-teal-900 dark:text-teal-100 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-50 dark:divide-teal-900/50">
                        {levels.map((item) => (
                            <tr key={item.id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/30 transition-colors">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/50 text-${item.color}-700 dark:text-${item.color}-300 font-bold`}>
                                        {item.code}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{item.label}</td>
                                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                                    {item.min} - {item.max}%
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 size={14} className={`text-${item.color}-500`} />
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-700 dark:text-${item.color}-300`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-1 text-slate-400 hover:text-teal-600 transition-colors">
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

            <EditCBCBoundariesModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                initialLevels={levels}
                onSave={setLevels}
            />
        </div>
    );
};

export default CBCGradingTable;
