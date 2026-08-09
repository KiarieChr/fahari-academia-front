import React from 'react';
import { LayoutDashboard, Users, FileText, Calendar, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const RecruitmentSidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'pipeline', label: 'Recruitment', icon: Users },
        { id: 'jobs', label: 'Job Openings', icon: FileText },
        { id: 'onboarding', label: 'Onboarding', icon: CheckCircle },
        { id: 'interviews', label: 'Calendar', icon: Calendar },
        { id: 'workflow', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-100px)] py-6 px-4 hidden md:block">
            <div className="space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                                isActive 
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                            }`}
                        >
                            <Icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTabIndicatorRecruitment"
                                    className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RecruitmentSidebar;
