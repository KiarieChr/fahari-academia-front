import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

const GradingSimulator = ({ scales = [], curriculumCode }) => {
    const [score, setScore] = useState(72);
    const [selectedScaleId, setSelectedScaleId] = useState(null);

    const activeScale = scales.find(s => s.id === selectedScaleId) || scales[0];

    const getGrade = (s) => {
        if (!activeScale) return { grade: '—', label: 'No scale loaded', color: '#94a3b8', status: 'N/A' };

        // We need levels from the detail endpoint, but we can approximate from scale info
        // For a simple simulator using the list data, we'll show the scale name
        // The actual grade lookup happens once detail is loaded
        return { grade: '—', label: 'Select a scale', color: '#94a3b8', status: 'N/A' };
    };

    return (
        <div className="rounded-xl border p-6 flex flex-col gap-6 bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Calculator size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">Grade Simulator</h3>
            </div>

            {scales.length > 1 && (
                <select
                    value={selectedScaleId || activeScale?.id || ''}
                    onChange={e => setSelectedScaleId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                >
                    {scales.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-600 dark:text-slate-400">Input Score</span>
                        <span className="text-blue-600 font-bold">{score}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center space-y-1">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {activeScale?.name || 'No Scale'}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                        Score: <span className="font-bold text-slate-900 dark:text-white">{score}%</span>
                        {activeScale && (
                            <span className="ml-2">
                                · Pass mark: {activeScale.pass_mark}%
                            </span>
                        )}
                    </div>
                    <div className="mt-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                            score >= (activeScale?.pass_mark || 50)
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {score >= (activeScale?.pass_mark || 50) ? 'PASS' : 'FAIL'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradingSimulator;
