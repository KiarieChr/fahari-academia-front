import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Settings, Lock } from 'lucide-react';

const QuickSettingCard = ({
    title,
    description,
    icon: Icon,
    status = 'active',
    isLocked = false,
    onClick
}) => {
    // Status color mapping for borders/badges
    const getStatusStyles = (status) => {
        switch (status) {
            case 'configured': return { badge: 'bg-emerald-100 text-emerald-700', border: 'border-l-emerald-500' };
            case 'pending': return { badge: 'bg-amber-100 text-amber-700', border: 'border-l-amber-500' };
            case 'error': return { badge: 'bg-red-100 text-red-700', border: 'border-l-red-500' };
            default: return { badge: 'bg-blue-50 text-blue-600', border: 'border-l-blue-500' };
        }
    };

    const styles = getStatusStyles(status);

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: "0 14px 30px -8px rgba(0, 0, 0, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`
                relative bg-white p-5 rounded-xl border border-gray-100 shadow-sm 
                cursor-pointer group overflow-hidden
                ${styles.border} border-l-4
                ${isLocked ? 'opacity-75 grayscale' : ''}
            `}
            onClick={!isLocked ? onClick : undefined}
        >
            {/* Status Indicator */}
            <div className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${styles.badge}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>

            {/* Icon */}
            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                ${isLocked ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white shadow-sm'}
            `}>
                {isLocked ? <Lock size={18} /> : (Icon ? <Icon size={20} /> : <Settings size={20} />)}
            </div>

            {/* Content */}
            <div className="mb-2">
                <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                    {description}
                </p>
            </div>

            {/* Action Hint */}
            {!isLocked && (
                <div className="flex items-center text-blue-600 text-xs font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                    <span>Configure</span>
                    <ArrowRight size={14} className="ml-1" />
                </div>
            )}
        </motion.div>
    );
};

export default QuickSettingCard;
