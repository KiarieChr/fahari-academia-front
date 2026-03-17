// ProgressBar Component - Visual progress indicators
import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({
    value = 0,
    max = 100,
    label,
    showValue = true,
    size = 'md', // xs, sm, md, lg
    color = 'primary', // primary, success, warning, danger, info
    variant = 'default', // default, gradient, striped
    animated = true,
    className = '',
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
        xs: 'h-1',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    const colorClasses = {
        primary: 'bg-primary-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
    };

    const gradientClasses = {
        primary: 'bg-gradient-to-r from-primary-400 to-primary-600',
        success: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
        warning: 'bg-gradient-to-r from-amber-400 to-amber-600',
        danger: 'bg-gradient-to-r from-red-400 to-red-600',
        info: 'bg-gradient-to-r from-blue-400 to-blue-600',
    };

    const barColor = variant === 'gradient' 
        ? gradientClasses[color] || gradientClasses.primary
        : colorClasses[color] || colorClasses.primary;

    return (
        <div className={className}>
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && (
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                    )}
                    {showValue && (
                        <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
                    )}
                </div>
            )}
            
            <div className={`
                w-full bg-gray-100 rounded-full overflow-hidden
                ${sizeClasses[size]}
            `}>
                <motion.div
                    initial={animated ? { width: 0 } : false}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`
                        h-full rounded-full
                        ${barColor}
                        ${variant === 'striped' ? 'progress-striped' : ''}
                    `}
                    style={color === 'primary' && variant !== 'gradient' ? { 
                        backgroundColor: 'var(--primary-color)' 
                    } : {}}
                />
            </div>
        </div>
    );
};

// Circular Progress
export const CircularProgress = ({
    value = 0,
    max = 100,
    size = 80,
    strokeWidth = 8,
    color = 'primary',
    showValue = true,
    label,
    className = '',
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const colors = {
        primary: 'var(--primary-color)',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
    };

    return (
        <div className={`inline-flex flex-col items-center ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={colors[color] || colors.primary}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </svg>
                {showValue && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
            {label && (
                <span className="mt-2 text-sm text-gray-600">{label}</span>
            )}
        </div>
    );
};

export default ProgressBar;
