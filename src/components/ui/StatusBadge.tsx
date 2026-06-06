// StatusBadge Component - Enterprise-grade status indicators
import React from 'react';
import { motion } from 'framer-motion';

const statusVariants = {
    // Employment Status
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    probation: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    suspended: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    terminated: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
    resigned: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
    retired: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dot: 'bg-indigo-400' },
    // Leave Status
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    approved: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    cancelled: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
    
    // Recruitment Status
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    screening: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    shortlisted: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    interview: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
    offered: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
    hired: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    
    // General
    success: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    info: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    neutral: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
    
    // Attendance
    present: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    absent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    late: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
    on_leave: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
};

const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

const StatusBadge = ({
    status,
    label,
    size = 'md',
    showDot = true,
    pill = true,
    animate = true,
    className = '',
    variant, // Optional override
}) => {
    const normalizedStatus = status?.toLowerCase().replace(/[\s-]/g, '_');
    const styles = statusVariants[variant || normalizedStatus] || statusVariants.neutral;
    const displayLabel = label || status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const Component = animate ? motion.span : 'span';
    const animationProps = animate ? {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.2 }
    } : {};

    return (
        <Component
            {...animationProps}
            className={`
                inline-flex items-center gap-1.5 font-medium
                ${styles.bg} ${styles.text} ${styles.border}
                ${sizeClasses[size]}
                ${pill ? 'rounded-full' : 'rounded-md'}
                border
                ${className}
            `}
        >
            {showDot && (
                <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            )}
            <span className="capitalize">{displayLabel}</span>
        </Component>
    );
};

export default StatusBadge;
