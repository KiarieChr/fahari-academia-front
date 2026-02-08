import React from 'react';
import {
    Settings, Calendar, Users, BookOpen, Layers,
    ChevronDown, Printer, Download, Mail, Save
} from 'lucide-react';

const BuilderSidebar = ({ config, setConfig, curriculum }) => {
    return (
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen flex flex-col fixed left-0 top-0 z-40">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings size={20} className="text-slate-500" />
                    Report Configuration
                </h2>
                <p className="text-xs text-slate-500 mt-1">Customize report layout and data</p>
            </div>

            {/* Scrollable Config Options */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Academic Session */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> Academic Session
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <select
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={config.year}
                            onChange={(e) => setConfig({ ...config, year: e.target.value })}
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                        <select
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={config.term}
                            onChange={(e) => setConfig({ ...config, term: e.target.value })}
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                        </select>
                    </div>
                </div>

                {/* Student Selection */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} /> Student Context
                    </label>
                    <div className="space-y-2">
                        <select
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={config.class}
                            onChange={(e) => setConfig({ ...config, class: e.target.value })}
                        >
                            <option value="">Select Class</option>
                            <option value="Grade 4">Grade 4</option>
                            <option value="Class 8">Class 8</option>
                        </select>
                        <select
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={config.student}
                            onChange={(e) => setConfig({ ...config, student: e.target.value })}
                        >
                            <option value="">Select Student (Preview)</option>
                            <option value="ADM-001">Alex Johnson (ADM-001)</option>
                            <option value="ADM-002">Sarah Williams (ADM-002)</option>
                        </select>
                    </div>
                </div>

                {/* Display Options */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Layers size={14} /> Sections
                    </label>
                    <div className="space-y-2">
                        {[
                            { id: 'showAttendance', label: 'Attendance Summary' },
                            { id: 'showTeacherInfo', label: 'Teacher Profile' },
                            { id: 'showComparison', label: 'Class Comparison' },
                            { id: 'showSignatures', label: 'Signatures' }
                        ].map(opt => (
                            <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config[opt.id]}
                                    onChange={(e) => setConfig({ ...config, [opt.id]: e.target.checked })}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-slate-700 text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all">
                    <Printer size={16} /> Print Report
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Download size={16} /> PDF
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Mail size={16} /> Email
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuilderSidebar;
