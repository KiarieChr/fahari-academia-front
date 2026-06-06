// Tabs Component - Modern tab navigation
import React from 'react';
import { motion } from 'framer-motion';

const Tabs = ({
    tabs = [], // [{ key, label, icon, count, disabled }]
    activeTab,
    onChange,
    variant = 'underline', // underline, pills, boxed
    size = 'md', // sm, md, lg
    fullWidth = false,
    className = '',
}) => {
    const sizeClasses = {
        sm: 'text-xs py-2 px-3',
        md: 'text-sm py-2.5 px-4',
        lg: 'text-base py-3 px-5',
    };

    const variantStyles = {
        underline: {
            container: 'border-b border-gray-200',
            tab: (isActive) => `
                relative pb-3 ${sizeClasses[size]}
                ${isActive
                    ? 'text-primary-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }
                transition-colors
            `,
            indicator: 'absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600',
        },
        pills: {
            container: 'p-1 bg-gray-100 rounded-lg gap-1',
            tab: (isActive) => `
                rounded-md ${sizeClasses[size]}
                ${isActive
                    ? 'bg-white text-gray-900 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }
                transition-all
            `,
            indicator: null,
        },
        boxed: {
            container: 'border border-gray-200 rounded-lg p-1 gap-1',
            tab: (isActive) => `
                rounded-md ${sizeClasses[size]}
                ${isActive
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }
                transition-all
            `,
            indicator: null,
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className={`flex ${fullWidth ? 'w-full' : ''} ${styles.container} ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.key}
                        onClick={() => !tab.disabled && onChange?.(tab.key)}
                        disabled={tab.disabled}
                        className={`
                            ${styles.tab(isActive)}
                            ${fullWidth ? 'flex-1' : ''}
                            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            flex items-center justify-center gap-2
                        `}
                        style={isActive && variant === 'underline' ? { color: 'var(--primary-color)' } : {}}
                    >
                        {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className={`
                                ml-1.5 px-2 py-0.5 text-xs rounded-full
                                ${isActive
                                    ? variant === 'boxed' ? 'bg-white/20' : 'bg-primary-100 text-primary-700'
                                    : 'bg-gray-100 text-gray-600'
                                }
                            `}>
                                {tab.count}
                            </span>
                        )}

                        {/* Underline indicator */}
                        {variant === 'underline' && isActive && (
                            <motion.div
                                layoutId="tab-indicator"
                                className={styles.indicator}
                                style={{ backgroundColor: 'var(--primary-color)' }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;
