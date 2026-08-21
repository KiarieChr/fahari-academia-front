import React from 'react';
import { Download, Layers } from 'lucide-react';

const GradingHeader = ({ curricula = [], activeCurriculum, setActiveCurriculum }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 neo-card border-none p-3 mt-3">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Layers size={24} />
                    </span>
                    Grading System
                </h1>
                <p className="text-slate-500 font-bold text-sm">Manage academic grading scales, boundaries, and rules across curricula.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Curriculum Switcher */}
                {curricula.length > 0 && (
                    <div className="flex p-1 neo-pressed rounded-xl border-none">
                        {curricula.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveCurriculum(c.id)}
                                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                                    activeCurriculum === c.id
                                        ? 'neo-card border-none text-blue-700'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {c.code}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 neo-btn rounded-xl font-bold">
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradingHeader;
