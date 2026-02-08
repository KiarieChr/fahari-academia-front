import React from 'react';
import { Calendar, BookOpen, GraduationCap, Layout, FileText, CheckCircle } from 'lucide-react';

const ContextSelectionPanel = ({ context, setContext, data, onContextChange }) => {

    // Helper to safely update context
    const handleChange = (key, value) => {
        const newContext = { ...context, [key]: value };
        setContext(newContext);
        if (onContextChange) onContextChange(newContext);
    };

    const isContextComplete = context.academicYear && context.term && context.class && context.subject && context.assessment;

    return (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-10 shadow-sm transition-colors">
            <div className="max-w-[1600px] mx-auto p-4">
                <div className="flex flex-col gap-4">
                    {/* Top Row: Year, Term, Class, Stream */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <div className="relative">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
                            <select
                                className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                value={context.academicYear}
                                onChange={(e) => handleChange('academicYear', e.target.value)}
                            >
                                <option value="">Select Year</option>
                                {data.academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Term</label>
                            <select
                                className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                value={context.term}
                                onChange={(e) => handleChange('term', e.target.value)}
                            >
                                <option value="">Select Term</option>
                                {data.terms.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Class</label>
                            <select
                                className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                value={context.class}
                                onChange={(e) => handleChange('class', e.target.value)}
                            >
                                <option value="">Select Class</option>
                                {data.classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="relative">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Stream</label>
                            <select
                                className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                value={context.stream}
                                onChange={(e) => handleChange('stream', e.target.value)}
                            >
                                <option value="">All Streams</option>
                                {data.streams.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="relative lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
                            <select
                                className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                value={context.subject}
                                onChange={(e) => handleChange('subject', e.target.value)}
                            >
                                <option value="">Select Subject</option>
                                {data.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="relative lg:col-span-1">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Assessment</label>
                            <select
                                className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                value={context.assessment}
                                onChange={(e) => handleChange('assessment', e.target.value)}
                            >
                                <option value="">Type</option>
                                {data.assessmentTypes.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Status Banner */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isContextComplete ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            <span className="text-slate-600 dark:text-slate-400">
                                {isContextComplete ? 'Ready for input' : 'Please complete selection to enter marks'}
                            </span>
                        </div>
                        {isContextComplete && (
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                <span className="hidden sm:inline">Max Marks: 100</span>
                                <span className="hidden sm:inline">History: Last edited 2 mins ago</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContextSelectionPanel;
