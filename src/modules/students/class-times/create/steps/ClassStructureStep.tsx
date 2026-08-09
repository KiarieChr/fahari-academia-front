import React from 'react';
import { Users, Copy, Plus, X } from 'lucide-react';

const ClassStructureStep = ({ data, updateData }) => {
    // Helper to toggle class selection
    const toggleClass = (className) => {
        const current = data.selectedClasses || [];
        if (current.includes(className)) {
            updateData('selectedClasses', current.filter(c => c !== className));
        } else {
            updateData('selectedClasses', [...current, className]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Class Structure</h2>
                <p className="text-slate-500 mt-2">Select participating classes and define their structure.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Class Selector */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Classes</label>
                        <span className="text-xs text-slate-500">{(data.selectedClasses || []).length} selected</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Form 1', 'Form 2', 'Form 3', 'Form 4'].map((cls) => {
                            const isSelected = (data.selectedClasses || []).includes(cls);
                            return (
                                <button
                                    key={cls}
                                    onClick={() => toggleClass(cls)}
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${isSelected
                                            ? 'bg-blue-600 border-blue-600 text-black shadow-md shadow-blue-200 dark:shadow-blue-900/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                                        }`}
                                >
                                    {cls}
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={20} className="text-blue-600" />
                            Configuration
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Applied to all selected classes</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Streams per Class</label>
                            <div className="flex flex-wrap gap-2">
                                {['East', 'West', 'North', 'South'].map(stream => (
                                    <label key={stream} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
                                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" defaultChecked />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{stream}</span>
                                    </label>
                                ))}
                                <button className="px-3 py-2 border border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="peer sr-only" defaultChecked />
                                    <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">Duplicate Timetable</span>
                                    <span className="block text-xs text-slate-500">Apply same schedule structure across streams</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassStructureStep;
