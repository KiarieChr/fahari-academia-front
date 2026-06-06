
import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Target, FileText, ClipboardList, BarChart2 } from 'lucide-react';

const PerformanceQuickActions = () => {
    const actions = [
        { icon: PlusCircle, label: "New Review Cycle", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: Target, label: "Assign Goals", color: "text-emerald-600", bg: "bg-emerald-50" },
        { icon: FileText, label: "Self Assessment", color: "text-purple-600", bg: "bg-purple-50" },
        { icon: ClipboardList, label: "Conduct Appraisal", color: "text-amber-600", bg: "bg-amber-50" },
        { icon: BarChart2, label: "Generate Report", color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {actions.map((action, index) => (
                <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                >
                    <div className={`w-10 h-10 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <action.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-center">
                        {action.label}
                    </span>
                </motion.button>
            ))}
        </div>
    );
};

export default PerformanceQuickActions;
