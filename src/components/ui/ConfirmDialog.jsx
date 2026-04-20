// ConfirmDialog Component - Modal confirmation dialogs
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';

const iconMap = {
    warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
    danger: { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' },
    success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
};

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'warning', // warning, danger, success, info
    loading = false,
    destructive = false,
}) => {
    const { icon: Icon, color, bg } = iconMap[variant] || iconMap.warning;

    const buttonVariant = destructive || variant === 'danger'
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-6 text-center">
                            {/* Icon */}
                            <div className={`
                                w-16 h-16 rounded-full ${bg} 
                                flex items-center justify-center mx-auto mb-4
                            `}>
                                <Icon size={32} className={color} />
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="
                                        px-5 py-2.5 text-sm font-medium text-gray-700
                                        bg-gray-100 hover:bg-gray-200 rounded-lg
                                        transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300
                                        disabled:opacity-50
                                    "
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className={`
                                        px-5 py-2.5 text-sm font-medium text-white
                                        ${destructive || variant === 'danger'
                                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                            : 'focus:ring-primary-500'
                                        }
                                        rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                                        disabled:opacity-50 flex items-center gap-2
                                    `}
                                    style={!destructive && variant !== 'danger' ? {
                                        backgroundColor: 'var(--primary-color)'
                                    } : {}}
                                >
                                    {loading && (
                                        <svg className="animate-spin h-4 w-4\" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
