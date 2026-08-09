
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, FileText, Settings, UserPlus } from 'lucide-react';

const RecruitmentQuickActions = ({ onPostJob, onScheduleInterview, onRecordApplication, onShortlist, onBulkShortlist }) => {
    const actions = [
        { icon: Plus, label: "Post New Job", color: "text-blue-600", bg: "bg-blue-50", onClick: onPostJob },
        { icon: UserPlus, label: "Record Application", color: "text-purple-600", bg: "bg-purple-50", onClick: onRecordApplication },
        { icon: FileText, label: "Shortlist Candidate", color: "text-emerald-600", bg: "bg-emerald-50", onClick: onShortlist },
        { icon: Calendar, label: "Schedule Interview", color: "text-amber-600", bg: "bg-amber-50", onClick: onScheduleInterview },
        { icon: Settings, label: "Bulk Shortlist", color: "text-indigo-600", bg: "bg-indigo-50", onClick: onBulkShortlist },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => (
                <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="btn btn-light d-flex flex-column align-items-center justify-content-center p-4 w-100 shadow-sm border"
                >
                    <div className={`w-12 h-12 rounded-full ${action.bg} ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon size={24} />
                    </div>
                    <span className="text-sm font-semibold text-muted">
                        {action.label}
                    </span>
                </motion.button>
            ))}
        </div>
    );
};

export default RecruitmentQuickActions;
