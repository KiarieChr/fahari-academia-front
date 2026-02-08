import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';

const GradingSimulator = ({ curriculum }) => {
    const [score, setScore] = useState(72);

    // Mock logic for simulation
    const getGrade = (s, type) => {
        if (type === 'CBC') {
            if (s >= 80) return { grade: 'EE', label: 'Exceeds Expectations', color: 'green', status: 'Competent' };
            if (s >= 65) return { grade: 'ME', label: 'Meets Expectations', color: 'teal', status: 'Competent' };
            if (s >= 50) return { grade: 'AE', label: 'Approaching Expectations', color: 'amber', status: 'Developing' };
            return { grade: 'BE', label: 'Below Expectations', color: 'red', status: 'Needs Support' };
        } else {
            if (s >= 90) return { grade: 'A*', label: 'Distinction', color: 'purple', status: 'Excellent' };
            if (s >= 80) return { grade: 'A', label: 'Distinction', color: 'purple', status: 'Very Good' };
            if (s >= 70) return { grade: 'B', label: 'Merit', color: 'blue', status: 'Good' };
            if (s >= 60) return { grade: 'C', label: 'Pass', color: 'emerald', status: 'Satisfactory' };
            if (s >= 50) return { grade: 'D', label: 'Pass', color: 'emerald', status: 'Pass' };
            if (s >= 40) return { grade: 'E', label: 'Pass', color: 'emerald', status: 'Pass' };
            return { grade: 'U', label: 'Ungraded', color: 'slate', status: 'Fail' };
        }
    };

    const result = getGrade(score, curriculum);

    return (
        <div className={`rounded-xl border p-6 flex flex-col gap-6 transition-colors duration-300 ${curriculum === 'CBC'
            ? 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-800'
            : 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800'
            }`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${curriculum === 'CBC' ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    <Calculator size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                    {curriculum === 'CBC' ? 'Performance Simulator' : 'Grade Simulator'}
                </h3>
            </div>

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

                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center -z-10 opacity-10">
                        <ArrowRight size={100} />
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 text-center space-y-1">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projected Outcome</div>
                        <div className={`text-4xl font-black text-${result.color}-600`}>
                            {result.grade}
                        </div>
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
                            {result.label}
                        </div>
                        <div className="flex justify-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold bg-${result.color}-100 text-${result.color}-700`}>
                                {result.status}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradingSimulator;
