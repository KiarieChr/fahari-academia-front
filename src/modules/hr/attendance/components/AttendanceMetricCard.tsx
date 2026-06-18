
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AttendanceMetricCard = ({ title, value, trend, trendUp, icon: Icon, color, description }) => {
    // Map color names to tailwind classes
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
        red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    };

    const styles = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
        >
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
                    <Icon size={18} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {trend}
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{value}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
            </div>
            
            {/* Decorative background element */}
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-5 ${styles.bg} pointer-events-none`} />
        </motion.div>
    );
};

export default AttendanceMetricCard;
