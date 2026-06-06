import React from 'react';
import { Plus, CheckCircle, FileText, Calendar, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LeaveQuickActions = ({ onApplyLeave }) => {
  const actions = [
    {
      label: 'Apply for Leave',
      icon: Plus,
      className: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100', // Close to the light blue/purple in image
      onClick: onApplyLeave,
    },
    {
      label: 'Approve Requests',
      icon: CheckCircle,
      className: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100',
      onClick: () => { },
    },
    {
      label: 'View Policy',
      icon: FileText,
      className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100',
      onClick: () => { },
    },
    {
      label: 'Generate Report',
      icon: BarChart2,
      className: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-100',
      onClick: () => { },
    },
    {
      label: 'View Calendar',
      icon: Calendar,
      className: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100',
      onClick: () => { },
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.onClick}
            className={`quick-action-btn shadow-sm ${action.className}`}
          >
            <div className="mb-3 p-2 rounded-full bg-white/60">
              <action.icon size={22} />
            </div>
            <span className="font-semibold text-sm">{action.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default LeaveQuickActions;

