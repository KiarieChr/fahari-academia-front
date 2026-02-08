import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const EditIGCSEThresholdsModal = ({ isOpen, onClose, onSave, initialGrades }) => {
    const [grades, setGrades] = useState(initialGrades);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setGrades(JSON.parse(JSON.stringify(initialGrades)));
            setError(null);
        }
    }, [isOpen, initialGrades]);

    const handleChange = (id, field, value) => {
        const numValue = parseInt(value) || 0;
        setGrades(prev => prev.map(g => g.id === id ? { ...g, [field]: numValue } : g));
        setError(null);
    };

    const validate = () => {
        // Validation check for overlaps
        for (let i = 0; i < grades.length - 1; i++) {
            if (grades[i].min <= grades[i + 1].max) {
                return `Overlap detected between ${grades[i].grade} and ${grades[i + 1].grade}. Check boundary ${grades[i].min} vs ${grades[i + 1].max}.`;
            }
        }
        return null;
    };

    const handleSave = () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        onSave(grades);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit IGCSE Thresholds</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg flex items-center gap-2 sticky top-0 z-10">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        {grades.map((grade) => (
                            <div key={grade.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                    {grade.grade}
                                </div>

                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{grade.status}</div>
                                    <div className="text-xs text-slate-500">Points: {grade.points}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={grade.min}
                                            onChange={(e) => handleChange(grade.id, 'min', e.target.value)}
                                            className="w-16 px-2 py-1.5 text-sm text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <div className="absolute -top-2 left-2 px-1 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400">Min</div>
                                    </div>
                                    <span className="text-slate-400 font-bold">-</span>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={grade.max}
                                            onChange={(e) => handleChange(grade.id, 'max', e.target.value)}
                                            className="w-16 px-2 py-1.5 text-sm text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <div className="absolute -top-2 left-2 px-1 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400">Max</div>
                                    </div>
                                    <span className="text-slate-400 font-bold">%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-black text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all active:scale-95">
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditIGCSEThresholdsModal;
