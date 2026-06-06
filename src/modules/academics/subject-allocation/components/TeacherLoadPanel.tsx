import React from 'react';
import { User, AlertCircle, CheckCircle } from 'lucide-react';

const TeacherLoadPanel = ({ teachers }) => {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden h-fit sticky top-24">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    Teacher Load Monitor
                </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                {teachers.map(teacher => {
                    const loadPercent = Math.round((teacher.currentLoad / teacher.maxLoad) * 100);
                    const isOverloaded = teacher.currentLoad > teacher.maxLoad;
                    const isNearLimit = teacher.currentLoad >= teacher.maxLoad && !isOverloaded;

                    return (
                        <div key={teacher.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">{teacher.name}</h4>
                                    <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{teacher.subjects.join(', ')}</p>
                                </div>
                                {isOverloaded ? (
                                    <AlertCircle size={16} className="text-red-500" />
                                ) : (
                                    <CheckCircle size={16} className="text-green-500" />
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-medium text-slate-500">
                                    <span>Load: {teacher.currentLoad} / {teacher.maxLoad} Lessons</span>
                                    <span className={isOverloaded ? 'text-red-600' : 'text-slate-600'}>{loadPercent}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${isOverloaded ? 'bg-red-500' :
                                                isNearLimit ? 'bg-amber-500' :
                                                    'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(loadPercent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 text-center">
                Review availability before assignment
            </div>
        </div>
    );
};

export default TeacherLoadPanel;
