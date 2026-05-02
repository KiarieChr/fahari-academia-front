import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Database, FileText, Lock } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import '../../../dashboard/dashboard.css';

import SettingsSidebar from './components/SettingsSidebar';
import SettingsSection from './components/SettingsSection';
import SettingsForm from './components/SettingsForm';
import RolePermissionManager from './components/RolePermissionManager';
import IntegrationSettings from './components/IntegrationSettings';
import AuditLogTable from './components/AuditLogTable';
import EmployeeManagementSettings from './components/EmployeeManagementSettings';
import AttendancePolicySettings from './components/AttendancePolicySettings';

import { settingsCategories, leaveSettingsData as generalSettings, rolesData as rolePermissions, integrationSettingsData as integrationSettings, auditLogsData as auditLogs } from './data/hrSettingsData';

const HRSettingsDashboard = () => {
    const [activeCategory, setActiveCategory] = useState('general');

    const renderContent = () => {
        switch (activeCategory) {
            case 'general':
                return (
                    <SettingsSection
                        title="General Configuration"
                        description="Manage basic HR module settings and preferences."
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
            case 'roles':
                return (
                    <SettingsSection
                        title="Roles & Permissions"
                        description="Define user roles and restrict access to sensitive data."
                    >
                        <RolePermissionManager roles={rolePermissions} />
                    </SettingsSection>
                );
            case 'integrations':
                return (
                    <SettingsSection
                        title="System Integrations"
                        description="Manage connections with external services and APIs."
                    >
                        <IntegrationSettings integrations={integrationSettings} />
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
            case 'employees':
                return (
                    <SettingsSection
                        title="Employee Management"
                        description="Manage job titles, departments, and employment configurations."
                    >
                        <EmployeeManagementSettings />
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

    return (
        <DashboardLayout>
            <div className="dashboard-home">
                <div className="dashboard-header">
                        <h1>HR Settings</h1>
                        <p className="settings-subtitle">Configure global preferences and system defaults.</p>
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
        </DashboardLayout>
    );
};

export default HRSettingsDashboard;