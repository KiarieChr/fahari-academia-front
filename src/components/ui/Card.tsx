// Card Component - Flexible card container
import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    children,
    title,
    subtitle,
    icon: Icon,
    actions,
    footer,
    padding = 'default', // none, sm, default, lg
    hover = false,
    clickable = false,
    onClick,
    loading = false,
    className = '',
    headerClassName = '',
    bodyClassName = '',
    ...props
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
    };

    const Component = clickable || onClick ? motion.div : 'div';
    const motionProps = clickable || onClick ? {
        whileHover: hover ? { y: -2, boxShadow: 'var(--shadow-md)' } : {},
        whileTap: { scale: 0.995 },
        transition: { duration: 0.2 }
    } : {};

    return (
        <Component
            {...motionProps}
            onClick={onClick}
            className={`
                bg-white rounded-xl border border-gray-100 shadow-sm
                ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
                ${clickable ? 'cursor-pointer' : ''}
                ${className}
            `}
            {...props}
        >
            {/* Header */}
            {(title || actions) && (
                <div className={`
                    flex items-center justify-between px-6 py-4 border-b border-gray-100
                    ${headerClassName}
                `}>
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                                <Icon size={18} className="text-gray-600" />
                            </div>
                        )}
                        <div>
                            {title && (
                                <h3 className="font-semibold text-gray-900">{title}</h3>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-500">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Body */}
            <div className={`${paddingClasses[padding]} ${bodyClassName}`}>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin"
                            style={{ borderTopColor: 'var(--primary-color)' }} />
                    </div>
                ) : children}
            </div>

            {/* Footer */}
            {footer && (
                <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                    {footer}
                </div>
            )}
        </Component>
    );
};

export default Card;
