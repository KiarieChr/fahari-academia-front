import React from 'react';
import { motion } from 'framer-motion';

const SettingsSidebar = ({ categories, activeCategory, onSelect }) => {
    return (
        <div className="settings-sidebar-wrapper">
            <div className="settings-sidebar">
                <div className="settings-sidebar-header">
                    <h3 className="settings-sidebar-title">Settings</h3>
                    <p className="settings-sidebar-subtitle">Manage your HR configuration</p>
                </div>
                <nav className="settings-sidebar-nav">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                onClick={() => onSelect(category.id)}
                                className={`settings-sidebar-item ${activeCategory === category.id ? 'active' : ''}`}
                            >
                                <div className={`settings-sidebar-icon-wrapper ${activeCategory === category.id ? 'active' : ''}`}>
                                    <Icon className="settings-sidebar-icon" size={20} />
                                </div>
                                <div className="settings-sidebar-item-text">
                                    <span className="settings-sidebar-item-label">{category.label}</span>
                                </div>
                                {activeCategory === category.id && (
                                    <motion.div 
                                        layoutId="active-pill" 
                                        className="settings-sidebar-active-indicator" 
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default SettingsSidebar;