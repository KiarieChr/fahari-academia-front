import React from 'react';
import { motion } from 'framer-motion';

const LeaveMetricCard = ({ title, value, change, icon: Icon, color, lightColor, textColor }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="relative metric-card h-full justify-between  backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-4 shadow-lg"
        >
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none'></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${lightColor} ${textColor}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>

                {change && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.includes('+') ? 'bg-green-100 text-green-700' :
                        change.includes('-') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {change}
                    </span>
                )}
            </div>

            <div className="mt-4">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h2>
                <h3 className="text-gray-500 text-sm font-medium mt-1">{title}</h3>
            </div>
        </motion.div>
    );
};

export default LeaveMetricCard;
