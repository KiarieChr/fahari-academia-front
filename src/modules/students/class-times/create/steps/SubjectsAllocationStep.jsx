import React from 'react';
import { Search, Info, AlertCircle } from 'lucide-react';

const SubjectsAllocationStep = ({ data, updateData }) => {
    const subjects = [
        { id: 1, name: "Mathematics", code: "MAT", lessons: 6, priority: "High" },
        { id: 2, name: "English", code: "ENG", lessons: 6, priority: "High" },
        { id: 3, name: "Kiswahili", code: "KIS", lessons: 5, priority: "Medium" },
        { id: 4, name: "Science", code: "SCI", lessons: 5, priority: "Medium" },
        { id: 5, name: "Social Studies", code: "SST", lessons: 4, priority: "Medium" },
        { id: 6, name: "CRE", code: "CRE", lessons: 3, priority: "Low" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subject Allocation</h2>
                <p className="text-slate-500 mt-2">Define the weekly lesson load for each subject.</p>
            </div>

            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">29</span> / 40 Lessons Assigned
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-100">
                    <AlertCircle size={14} />
                    11 Slots Remaining
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 font-semibold w-12">
                                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked />
                                </th>
                                <th className="px-6 py-3 font-semibold">Subject</th>
                                <th className="px-6 py-3 font-semibold">Code</th>
                                <th className="px-6 py-3 font-semibold w-32">Lessons/Week</th>
                                <th className="px-6 py-3 font-semibold">Double Periods</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {subjects.map((subj) => (
                                <tr key={subj.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                    <td className="px-6 py-3">
                                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" checked />
                                    </td>
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                                        {subj.name}
                                        {subj.priority === 'High' && <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase">Core</span>}
                                    </td>
                                    <td className="px-6 py-3 font-mono text-slate-500">{subj.code}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center">
                                            <button className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors">-</button>
                                            <input type="text" className="w-8 text-center bg-transparent font-bold outline-none" value={subj.lessons} readOnly />
                                            <button className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors">+</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked={subj.priority === 'High'} />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors" title="Settings">
                                            <Info size={16} />
                                        </button>
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

export default SubjectsAllocationStep;
