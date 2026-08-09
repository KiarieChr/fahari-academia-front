// PageHeader Component - Consistent page headers with breadcrumbs
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const PageHeader = ({
    title,
    subtitle,
    breadcrumbs = [], // [{ label, path }]
    actions,
    tabs,
    activeTab,
    onTabChange,
    badge,
    icon: Icon,
    backLink,
    className = '',
}) => {
    const location = useLocation();

    // Auto-generate breadcrumbs from path if not provided
    const generateBreadcrumbs = () => {
        if (breadcrumbs.length > 0) return breadcrumbs;

        const pathParts = location.pathname.split('/').filter(Boolean);
        const crumbs = [];
        let currentPath = '';

        pathParts.forEach((part, index) => {
            currentPath += `/${part}`;
            const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
            crumbs.push({
                label,
                path: index === pathParts.length - 1 ? null : currentPath
            });
        });

        return crumbs;
    };

    const crumbs = generateBreadcrumbs();

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`page-header ${className}`}
        >
            {/* Breadcrumbs */}
            {crumbs.length > 0 && (
                <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
                    <Link
                        to="/dashboard"
                        className="hover:text-gray-700 transition-colors"
                    >
                        <Home size={14} />
                    </Link>
                    {crumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <ChevronRight size={14} className="text-gray-300" />
                            {crumb.path ? (
                                <Link
                                    to={crumb.path}
                                    className="hover:text-gray-700 transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-gray-800 font-medium">
                                    {crumb.label}
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* Main Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center"
                            style={{ backgroundColor: 'rgba(63, 81, 181, 0.1)' }}>
                            <Icon size={24} style={{ color: 'var(--primary-color)' }} />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {title}
                            </h1>
                            {badge && (
                                <span className="px-2.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                                    style={{
                                        backgroundColor: 'rgba(63, 81, 181, 0.1)',
                                        color: 'var(--primary-color)'
                                    }}>
                                    {badge}
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-gray-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>

            {/* Tabs */}
            {tabs && tabs.length > 0 && (
                <div className="mt-6 border-b border-gray-200">
                    <nav className="flex gap-6 -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange?.(tab.key)}
                                className={`
                                    pb-3 px-1 text-sm font-medium border-b-2 transition-colors
                                    ${activeTab === tab.key
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                                style={activeTab === tab.key ? {
                                    borderColor: 'var(--primary-color)',
                                    color: 'var(--primary-color)'
                                } : {}}
                            >
                                {tab.icon && <tab.icon size={16} className="inline mr-2" />}
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`
                                        ml-2 px-2 py-0.5 text-xs rounded-full
                                        ${activeTab === tab.key
                                            ? 'bg-primary-100 text-primary-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }
                                    `}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </motion.div>
    );
};

export default PageHeader;
