// Modern StatCard Component - Dashboard metrics with trends
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
    title,
    value,
    previousValue,
    change,
    changeLabel,
    icon: Icon,
    iconColor = 'var(--primary-color)',
    iconBg = 'rgba(63, 81, 181, 0.1)',
    trend, // 'up', 'down', 'neutral'
    trendValue,
    prefix = '',
    suffix = '',
    loading = false,
    onClick,
    className = '',
    variant = 'default', // default, gradient, minimal, bordered
}) => {
    // Calculate trend from values if not provided
    const calculatedTrend = trend || (
        change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    );
    
    const displayChange = change !== undefined ? change : (
        previousValue ? Math.round(((value - previousValue) / previousValue) * 100) : 0
    );

    const trendColors = {
        up: 'text-emerald-600 bg-emerald-50',
        down: 'text-red-600 bg-red-50',
        neutral: 'text-gray-600 bg-gray-50',
    };

    const TrendIcon = calculatedTrend === 'up' ? TrendingUp : 
                      calculatedTrend === 'down' ? TrendingDown : Minus;

    const variantClasses = {
        default: 'bg-white border border-gray-100',
        gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-100',
        minimal: 'bg-transparent',
        bordered: 'bg-white border-2 border-gray-200',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={onClick ? { y: -4, boxShadow: 'var(--shadow-lg)' } : {}}
            onClick={onClick}
            className={`
                rounded-xl p-4 sm:p-6 shadow-sm transition-all duration-200
                ${variantClasses[variant]}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {loading ? (
                <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-4 gap-3">
                        <p className="text-[0.7rem] sm:text-xs font-bold text-gray-500 uppercase tracking-wider truncate flex-1">
                            {title}
                        </p>
                        {Icon && (
                            <div
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: iconBg }}
                            >
                                <Icon size={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: iconColor }} />
                            </div>
                        )}
                    </div>

                    <div className="mb-3 overflow-hidden">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight truncate">
                            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                        </h3>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        {displayChange !== 0 && (
                            <span className={`
                                inline-flex items-center gap-1 px-2 py-1 rounded-full text-[0.65rem] sm:text-xs font-bold
                                ${trendColors[calculatedTrend]}
                            `}>
                                <TrendIcon size={12} />
                                {Math.abs(displayChange)}%
                            </span>
                        )}
                        {changeLabel && (
                            <span className="text-[0.7rem] sm:text-sm text-gray-400 font-medium truncate flex-1">
                                {changeLabel}
                            </span>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default StatCard;
