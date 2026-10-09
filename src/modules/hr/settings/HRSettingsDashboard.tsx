import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Server } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { toast } from 'react-toastify';
import { api } from '../../../services/apiClient';
import '../../../dashboard/dashboard.css';

import SettingsSidebar from './components/SettingsSidebar';
import SettingsSection from './components/SettingsSection';
import SettingsForm from './components/SettingsForm';
import AuditLogTable from './components/AuditLogTable';
import EmployeeManagementSettings from './components/EmployeeManagementSettings';
import AttendancePolicySettings from './components/AttendancePolicySettings';

import { settingsCategories, leaveSettingsData as generalSettings, auditLogsData as auditLogs } from './data/hrSettingsData';

const HRSettingsDashboard = ({ noLayout = false }) => {
    const [activeCategory, setActiveCategory] = useState('leave');

    const renderContent = () => {
        switch (activeCategory) {
            case 'leave':
                return (
                    <SettingsSection
                        title="Leave Settings"
                        description="Manage basic HR leave module settings and preferences."
                    >
                        <SettingsForm fields={generalSettings.generalRules} />
                    </SettingsSection>
                );
            case 'attendance-policy':
                return (
                    <SettingsSection
                        title="Attendance Policy Settings"
                        description="Configure attendance policies, clocking methods, geofence boundaries, and employee-specific access profiles."
                    >
                        <AttendancePolicySettings />
                    </SettingsSection>
                );
            case 'employees':
                return (
                    <SettingsSection
                        title="Employee Management"
                        description="Manage job titles, departments, and employment configurations."
                    >
                        <EmployeeManagementSettings />
                    </SettingsSection>
                );
            case 'notifications':
                return (
                    <SettingsSection
                        title="Notifications"
                        description="Configure email alerts and system notifications."
                    >
                        <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            Notification settings module coming soon.
                        </div>
                    </SettingsSection>
                );
            case 'audit':
                return (
                    <SettingsSection
                        title="Audit Logs"
                        description="Track system activities and security events."
                    >
                        <AuditLogTable logs={auditLogs} />
                    </SettingsSection>
                );
            default:
                return (
                    <div className="settings-placeholder">
                        <Settings size={48} />
                        <p>Select a category to view settings</p>
                    </div>
                );
        }
    };

    const content = (
            <div className="dashboard-home">
                <div className="dashboard-header flex justify-between items-center w-full">
                    <div>
                        <h1>HR Settings</h1>
                        <p className="settings-subtitle">Configure global preferences and system defaults.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to seed default leave types?')) {
                                    try {
                                        await api.post('/api/hr/leave-types/populate/');
                                        toast.success('Leave types seeded successfully');
                                    } catch (e) {
                                        toast.error('Failed to seed leave types: ' + (e.response?.data?.error || e.message));
                                    }
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-medium shadow-sm hover:bg-blue-100 transition-colors text-sm"
                        >
                            <Database size={16} /> Seed Leave Types
                        </button>
                        <button 
                            onClick={async () => {
                                if (window.confirm('Are you sure you want to seed payroll data (grades, steps, cycles)?')) {
                                    try {
                                        await api.post('/api/hr/payroll-settings/seed/');
                                        toast.success('Payroll data seeded successfully');
                                    } catch (e) {
                                        toast.error('Failed to seed payroll data: ' + (e.response?.data?.error || e.message));
                                    }
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium shadow-sm hover:bg-emerald-100 transition-colors text-sm"
                        >
                            <Server size={16} /> Seed Payroll Data
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 w-full items-start">
                    <SettingsSidebar
                        categories={settingsCategories}
                        activeCategory={activeCategory}
                        onSelect={setActiveCategory}
                    />

                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-1 min-w-0"
                    >
                        {renderContent()}
                    </motion.div>
                </div>
            </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout>
            {content}
        </DashboardLayout>
    );
};

export default HRSettingsDashboard;