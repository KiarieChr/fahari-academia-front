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
                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <Grid size={20} className="text-indigo-500" />
                    Curriculum Matrix
                </h3>
                <div className="text-xs text-gray-500 neo-pressed px-3 py-1.5 font-bold flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span>Assignments made here automatically appear on student reports and fee structures.</span>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full border-collapse">
                        <thead className="sticky top-0 z-20 bg-gray-50">
                            <tr>
                                <th scope="col" className="sticky left-0 z-30 bg-gray-50 border-b border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    Subjects \ Classes
                                </th>
                                {allClasses.map((cls) => (
                                    <th key={cls.id} scope="col" className="px-2 py-3 border-b border-l border-gray-200 text-center text-xs font-semibold text-gray-600 min-w-[35px] hover:bg-gray-100 transition-colors">
                                        <div className="writing-mode-vertical transform rotate-180 h-28 flex items-center justify-center">
                                            {cls.name}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="transition-colors hover:bg-gray-50/50">
                                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-800 border-b border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="flex flex-col">
                                            <span>{subject.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono tracking-widest mt-0.5">{subject.code}</span>
                                        </div>
                                    </td>
                                    {allClasses.map((cls) => {
                                        const isActive = matrix[`${cls.id}-${subject.id}`];
                                        return (
                                            <td
                                                key={`${cls.id}-${subject.id}`}
                                                className={`px-1 py-1 text-center cursor-pointer transition-colors border-b border-l border-gray-200 ${isActive ? 'bg-indigo-50/30 hover:bg-indigo-50' : 'hover:bg-gray-50'}`}
                                                onClick={() => toggleAssignment(cls.id, subject.id)}
                                            >
                                                <div className="w-full h-10 flex items-center justify-center rounded">
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-indigo-500 text-white shadow-md scale-100' : 'bg-gray-100 border border-gray-200 text-transparent hover:border-gray-300 scale-90'}`}>
                                                        {isActive && <Check size={12} strokeWidth={3} />}
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

            <div className="flex gap-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 font-semibold uppercase tracking-wider mt-6 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center shadow-md">
                        <Check size={12} strokeWidth={3} className="text-white" />
                    </div>
                    <span>Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gray-100 border border-gray-200"></div>
                    <span>Not Assigned</span>
                </div>
            </div>
        </div>
    );
};

export default SubjectMatrixView;
