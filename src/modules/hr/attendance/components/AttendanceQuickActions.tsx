
import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Upload, Calendar, FileText, Settings, User } from 'lucide-react';

const AttendanceQuickActions = () => {
    const actions = [
        { icon: CheckSquare, label: "Mark Attendance", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: Upload, label: "Import CSV", color: "text-purple-600", bg: "bg-purple-50" },
        { icon: Calendar, label: "Correction Request", color: "text-amber-600", bg: "bg-amber-50" },
        { icon: User, label: "My Attendance", color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 h-full mt-3">
            {actions.map((action, index) => (
                <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="quick-action-btn flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group "
                >
                    <div className={`w-10 h-10 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
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

export default AttendanceQuickActions;
