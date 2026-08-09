import React from 'react';
import { Calendar, FileText } from 'lucide-react';

const AcademicSetupStep = ({ data, updateData }) => {
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Context</h2>
                <p className="text-slate-500 mt-2">Define the academic period and basic details for this timetable.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Year */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Academic Year</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={data.academicYear}
                            onChange={(e) => updateData('academicYear', e.target.value)}
                        >
                            <option>2026</option>
                            <option>2025</option>
                            <option>2024</option>
                        </select>
                    </div>
                </div>

                {/* Term */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Term / Semester</label>
                    <select
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={data.term}
                        onChange={(e) => updateData('term', e.target.value)}
                    >
                        <option>Term 1</option>
                        <option>Term 2</option>
                        <option>Term 3</option>
                    </select>
                </div>

                {/* Timetable Name */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Timetable Name</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g. Term 1 2026 - Main Draft"
                            value={data.name}
                            onChange={(e) => updateData('name', e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-slate-500 flex justify-between">
                        <span>Descriptive name for internal reference.</span>
                        <button className="text-blue-600 hover:underline" onClick={() => updateData('name', `Term ${data.term?.split(' ')[1] || '1'} ${data.academicYear || '2026'} Schedule`)}>
                            Auto-generate
                        </button>
                    </p>
                </div>

                {/* Status */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                    <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                        {['Draft', 'Published'].map((status) => (
                            <button
                                key={status}
                                onClick={() => updateData('status', status)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${data.status === status
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademicSetupStep;
