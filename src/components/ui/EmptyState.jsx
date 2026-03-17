// EmptyState Component - Modern empty state messaging
import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Search, FileX, Users, AlertCircle, Plus } from 'lucide-react';

const iconMap = {
    inbox: Inbox,
    search: Search,
    file: FileX,
    users: Users,
    alert: AlertCircle,
    default: Inbox,
};

const EmptyState = ({
    icon = 'inbox',
    title = 'No data found',
    description = 'There are no items to display at this time.',
    action,
    actionLabel = 'Add New',
    actionIcon = Plus,
    onAction,
    variant = 'default', // default, compact, card
    className = '',
}) => {
    const IconComponent = typeof icon === 'string' ? (iconMap[icon] || iconMap.default) : icon;
    const ActionIcon = actionIcon;

    const variants = {
        default: 'py-16',
        compact: 'py-8',
        card: 'py-12 bg-white rounded-xl border border-gray-100 shadow-sm',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
                flex flex-col items-center justify-center text-center
                ${variants[variant]}
                ${className}
            `}
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
            >
                <IconComponent size={28} className="text-gray-400" />
            </motion.div>

            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {title}
            </h3>
            
            <p className="text-sm text-gray-500 max-w-sm mb-6">
                {description}
            </p>

            {(action || onAction) && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAction || action}
                    className="
                        inline-flex items-center gap-2 px-4 py-2.5
                        bg-primary-600 text-white font-medium text-sm
                        rounded-lg shadow-sm hover:bg-primary-700
                        transition-colors focus:outline-none focus:ring-2 
                        focus:ring-primary-500 focus:ring-offset-2
                    "
                    style={{ backgroundColor: 'var(--primary-color)' }}
                >
                    <ActionIcon size={18} />
                    {actionLabel}
                </motion.button>
            )}
        </motion.div>
    );
};

export default EmptyState;
