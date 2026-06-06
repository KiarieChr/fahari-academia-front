
import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const GoalsProgressWidget = ({ goals }) => {
    const getStatusColor = (status, progress) => {
        if (progress >= 100) return "bg-emerald-500";
        if (status === "At Risk") return "bg-red-500";
        if (status === "Completed") return "bg-emerald-500";
        return "bg-blue-600";
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Target size={20} className="text-blue-600" />
                        Active Goals & KPIs
                    </h3>
                    <p className="text-slate-400 text-sm">Track team goals progress</p>
                </div>
                <button className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
            </div>

            <div className="space-y-6">
                {goals.map((goal) => {
                    const progress = goal.progress_percentage ?? goal.progress ?? 0;
                    const staff = goal.employee_name || goal.staff || "Unassigned";
                    const dueDate = goal.target_completion_date || goal.dueDate || "N/A";
                    
                    // Format status nicely
                    let displayStatus = goal.status;
                    if (displayStatus === 'not_started') displayStatus = 'Not Started';
                    if (displayStatus === 'in_progress') displayStatus = 'In Progress';
                    if (displayStatus === 'on_hold') displayStatus = 'At Risk'; // Map on_hold to At Risk
                    
                    return (
                        <div key={goal.id}>
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <h4 className="font-semibold text-slate-800 text-sm">{goal.title}</h4>
                                    <p className="text-xs text-slate-500">{staff} • Due {dueDate}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${displayStatus === 'Completed' || displayStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        displayStatus === 'At Risk' || displayStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-50 text-blue-700'
                                    }`}>
                                    {displayStatus}
                                </span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full rounded-full ${getStatusColor(displayStatus, progress)}`}
                                />
                            </div>
                            <div className="mt-1 text-right text-xs font-bold text-slate-600">{progress}%</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GoalsProgressWidget;
