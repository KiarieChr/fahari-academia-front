import React from 'react';
import { Grid, Check, AlertTriangle } from 'lucide-react';

const SubjectMatrixView = ({ levels, subjects, matrix, setMatrix, isReadOnly }) => {

    const toggleAssignment = (classId, subjectId) => {
        if (isReadOnly) return;
        const key = `${classId}-${subjectId}`;
        const newMatrix = { ...matrix };

        if (newMatrix[key]) {
            delete newMatrix[key];
        } else {
            newMatrix[key] = true;
        }
        setMatrix(newMatrix);
    };

    // Flatten classes for columns
    const allClasses = levels.flatMap(l => l.classes.map(c => ({ ...c, levelName: l.name })));

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Grid size={20} className="text-blue-600" />
                    Curriculum Matrix
                </h3>
                <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Assignments made here automatically appear on student reports and fee structures.</span>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                    Subjects \ Classes
                                </th>
                                {allClasses.map((cls) => (
                                    <th key={cls.id} scope="col" className="px-3 py-3.5 text-center text-xs font-semibold text-slate-900 dark:text-white min-w-[30px] border-l border-slate-200 dark:border-slate-700 group relative">
                                        <div className="writing-mode-vertical transform rotate-180 h-24 flex items-center justify-center">
                                            {cls.name}
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 px-3 py-3 text-sm font-medium text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                        <div className="flex flex-col">
                                            <span>{subject.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">{subject.code}</span>
                                        </div>
                                    </td>
                                    {allClasses.map((cls) => {
                                        const isActive = matrix[`${cls.id}-${subject.id}`];
                                        return (
                                            <td
                                                key={`${cls.id}-${subject.id}`}
                                                className={`px-1 py-1 text-center border-l border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${isActive ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                                onClick={() => toggleAssignment(cls.id, subject.id)}
                                            >
                                                <div className={`w-full h-8 flex items-center justify-center rounded transition-all ${isActive ? 'text-blue-600 scale-100' : 'text-slate-200 scale-75 hover:scale-100 hover:text-slate-300'}`}>
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isActive ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                                        {isActive && <Check size={10} className="text-white" />}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-blue-600 bg-blue-600 flex items-center justify-center">
                        <Check size={10} className="text-white" />
                    </div>
                    <span>Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-slate-300"></div>
                    <span>Not Assigned</span>
                </div>
            </div>
        </div>
    );
};

export default SubjectMatrixView;
