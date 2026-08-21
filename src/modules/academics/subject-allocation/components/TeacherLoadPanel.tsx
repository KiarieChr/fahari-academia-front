import React from 'react';
import { User, AlertCircle, CheckCircle } from 'lucide-react';

const TeacherLoadPanel = ({ teachers }) => {
    return (
        <div className="neo-card border-none overflow-hidden h-fit sticky top-24">
            <div className="p-5 border-b border-slate-300/30 flex justify-between items-center bg-transparent">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <User size={18} />
                    </div>
                    Teacher Workload
                </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {teachers.map(teacher => {
                    const loadPercent = Math.round((teacher.currentLoad / teacher.maxLoad) * 100);
                    const isOverloaded = teacher.currentLoad > teacher.maxLoad;
                    const isNearLimit = teacher.currentLoad >= teacher.maxLoad && !isOverloaded;

                    return (
                        <div key={teacher.id} className="p-4 neo-pressed border-none rounded-xl shadow-sm transition-all hover:-translate-y-0.5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800">{teacher.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate max-w-[150px] mt-0.5">{teacher.subjects.join(', ')}</p>
                                </div>
                                {isOverloaded ? (
                                    <div className="p-1.5 bg-red-100 rounded-lg text-red-500 shadow-sm border border-red-200/50">
                                        <AlertCircle size={16} />
                                    </div>
                                ) : (
                                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-500 shadow-sm border border-emerald-200/50">
                                        <CheckCircle size={16} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>{teacher.currentLoad} <span className="text-[10px] uppercase text-slate-400">/ {teacher.maxLoad}</span></span>
                                    <span className={isOverloaded ? 'text-red-500 font-black' : 'text-indigo-600 font-black'}>{loadPercent}%</span>
                                </div>
                                <div className="h-2 neo-pressed rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full shadow-sm ${
                                            isOverloaded ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                            isNearLimit ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                            'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                        }`}
                                        style={{ width: `${Math.min(loadPercent, 100)}%`, transition: 'width 1s ease-in-out' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-4 border-t border-slate-300/30 text-[10px] font-bold tracking-widest uppercase text-slate-400 text-center bg-transparent">
                Review availability before assignment
            </div>
        </div>
    );
};

export default TeacherLoadPanel;
