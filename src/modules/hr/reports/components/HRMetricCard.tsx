
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const HRMetricCard = ({ title, value, trend, trendUp, icon: Icon, color, description }) => {
    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
    };

    const styles = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 relative"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${styles.bg} ${styles.text}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trend}
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{value}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            {description && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{description}</p>
            )}

            {/* Decorative background element */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 ${styles.bg} pointer-events-none`} />
        </motion.div>
    );
};

export default HRMetricCard;
