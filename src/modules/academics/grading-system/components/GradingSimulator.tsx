import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

const GradingSimulator = ({ scales = [], curriculumCode }) => {
    const [score, setScore] = useState(72);
    const [selectedScaleId, setSelectedScaleId] = useState(null);

    const activeScale = scales.find(s => s.id === selectedScaleId) || scales[0];

    const getGrade = (s) => {
        if (!activeScale || !activeScale.levels || activeScale.levels.length === 0) {
            return { grade: '—', label: 'No scale loaded', color: '#94a3b8' };
        }

        const level = activeScale.levels.find(l => s >= l.min_mark && s <= l.max_mark);
        if (level) {
            return { grade: level.grade, label: level.label, color: level.color_hex };
        }
        return { grade: '—', label: 'Out of range', color: '#94a3b8' };
    };

    return (
        <div className="neo-card border-none p-6 flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Calculator size={20} />
                </div>
                <h3 className="font-bold text-slate-900">Grade Simulator</h3>
            </div>

            {scales.length > 1 && (
                <select
                    value={selectedScaleId || activeScale?.id || ''}
                    onChange={e => setSelectedScaleId(parseInt(e.target.value))}
                    className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-sm outline-none font-bold text-slate-700"
                >
                    {scales.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-slate-600">Input Score</span>
                        <span className="text-blue-600">{score}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(parseInt(e.target.value))}
                        className="w-full h-2 neo-pressed rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                    </div>
                </div>

                <div className="neo-card border-none p-5 text-center space-y-1">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {activeScale?.name || 'No Scale'}
                    </div>
                    <div className="text-sm font-bold text-slate-500 mt-2">
                        Score: <span className="font-bold text-slate-900">{score}%</span>
                        {activeScale && (
                            <span className="ml-2">
                                · Pass mark: {activeScale.pass_mark}%
                            </span>
                        )}
                    </div>
                    
                    {/* Simulated Grade Result */}
                    {activeScale?.levels && activeScale.levels.length > 0 && (
                        <div className="mt-4 flex flex-col items-center gap-2">
                            <span 
                                className="inline-flex px-3 py-2 rounded-xl text-lg font-black shadow-sm"
                                style={{ 
                                    backgroundColor: `${getGrade(score).color}20`, 
                                    color: getGrade(score).color 
                                }}
                            >
                                {getGrade(score).grade}
                            </span>
                            <span className="text-xs font-bold" style={{ color: getGrade(score).color }}>
                                {getGrade(score).label}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GradingSimulator;
