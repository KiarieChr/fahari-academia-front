import React from 'react';
import { motion } from 'framer-motion';

const SettingsSidebar = ({ categories, activeCategory, onSelect }) => {
    return (
        <div className="lg:w-64 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden lg:sticky lg:top-5">
            {/* Header — hidden on mobile for compactness */}
            <div className="hidden lg:block px-5 pt-5 pb-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Settings</h3>
                <p className="text-xs text-gray-400 mt-0.5">Manage your HR configuration</p>
            </div>
            <nav className="flex lg:flex-col gap-1 p-2 lg:p-3 overflow-x-auto lg:overflow-x-visible">
                {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onSelect(category.id)}
                            className={`relative flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-left transition-all duration-200 group whitespace-nowrap lg:whitespace-normal lg:w-full flex-shrink-0 ${
                                isActive
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                        >
                            <div className={`p-1.5 lg:p-2 rounded-lg transition-colors ${
                                isActive ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-white'
                            }`}>
                                <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                            </div>
                            <span className={`text-xs lg:text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                {category.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="hidden lg:block absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500"
                                />
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default SettingsSidebar;