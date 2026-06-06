import React from 'react';
import { User, AlertTriangle, CheckCircle } from 'lucide-react';

const TeacherAssignmentStep = ({ data, updateData }) => {
    // Mock teacher data
    const assignments = [
        { id: 1, subject: "Mathematics", code: "MAT", teacher: "John Maina", initials: "JM", status: "ok" },
        { id: 2, subject: "English", code: "ENG", teacher: "Alice Kamau", initials: "AK", status: "ok" },
        { id: 3, subject: "Kiswahili", code: "KIS", teacher: "Pending", initials: "--", status: "missing" },
        { id: 4, subject: "Science", code: "SCI", teacher: "Ben Ten", initials: "BT", status: "conflict" },
        { id: 5, subject: "Social Studies", code: "SST", teacher: "Grace Lee", initials: "GL", status: "ok" },
        { id: 6, subject: "CRE", code: "CRE", teacher: "Pending", initials: "--", status: "missing" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Teacher Assignment</h2>
                <p className="text-slate-500 mt-2">Assign teachers to subjects and check for availability conflicts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assignments List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300">Subject assignments</h3>
                            <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300">4 / 6 Assigned</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {assignments.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{item.subject}</h4>
                                        <p className="text-xs text-slate-500 font-mono">{item.code}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <select
                                                className={`pl-3 pr-8 py-2 border rounded-lg text-sm appearance-none outline-none cursor-pointer min-w-[180px] ${item.status === 'missing' ? 'border-amber-300 bg-amber-50 text-amber-700' :
                                                        item.status === 'conflict' ? 'border-red-300 bg-red-50 text-red-700' :
                                                            'border-slate-200 bg-white text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                                                    }`}
                                                value={item.teacher}
                                                readOnly
                                            >
                                                <option>{item.teacher}</option>
                                                <option>Select Teacher...</option>
                                            </select>
                                            {item.status === 'conflict' && (
                                                <AlertTriangle size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500" />
                                            )}
                                            {item.status === 'ok' && (
                                                <CheckCircle size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Teacher Stats / Help */}
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                            <User size={18} /> Teacher workload
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">John Maina</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">24/28</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Alice Kamau</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">20/28</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Ben Ten</span>
                                <span className="font-bold text-red-600">30/28</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                <strong>Tip:</strong> Teachers marked in red are over their max weekly lesson limit.
                            </p>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-800">
                        <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                            <AlertTriangle size={18} /> Conflicts
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                            Ben Ten is assigned to Science in 2 other classes. Check his schedule matrix.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAssignmentStep;
