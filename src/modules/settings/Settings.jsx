import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { Building2, MapPinned, Settings as SettingsIcon, Shield, Sliders, Users, Lock, GraduationCap, DollarSign, CreditCard } from 'lucide-react';
import InstitutionProfile from './components/InstitutionProfile';
import CampusManagement from './components/CampusManagement';
import AuditLogViewer from './components/AuditLogViewer';
import SystemConfig from './components/SystemConfig';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import StudentRulesTab from '../students/settings/components/tabs/StudentRulesTab';
import CurrencySettings from './components/CurrencySettings';
import PaymentGatewaySettings from './components/PaymentGatewaySettings';

const tabs = [
    { id: 'institution', label: 'Institution Profile', icon: Building2, desc: 'School details & branding' },
    { id: 'campuses', label: 'Campuses', icon: MapPinned, desc: 'Manage campus locations' },
    { id: 'users', label: 'Users', icon: Users, desc: 'User accounts & access' },
    { id: 'roles', label: 'Roles & Permissions', icon: Lock, desc: 'Access control' },
    { id: 'configuration', label: 'Configuration', icon: Sliders, desc: 'System preferences' },
    { id: 'currency', label: 'Currency', icon: DollarSign, desc: 'Currency settings' },
    { id: 'integrations', label: 'Integrations', icon: CreditCard, desc: 'Payment & SMS API keys' },
    { id: 'student-setup', label: 'Student Setup', icon: GraduationCap, desc: 'Student rules & config' },
    { id: 'audit', label: 'Audit Log', icon: Shield, desc: 'Activity history' },
];

const Settings = () => {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'institution');

    useEffect(() => {
        if (tabParam && tabs.some(t => t.id === tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const renderContent = () => {
        switch (activeTab) {
            case 'institution': return <InstitutionProfile />;
            case 'campuses': return <CampusManagement />;
            case 'users': return <UserManagement />;
            case 'roles': return <RoleManagement />;
            case 'configuration': return <SystemConfig />;
            case 'currency': return <CurrencySettings />;
            case 'integrations': return <PaymentGatewaySettings />;
            case 'student-setup': return <StudentRulesTab />;
            case 'audit': return <AuditLogViewer />;
            default: return null;
        }
    };

    return (
        <DashboardLayout title="Settings">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2.5">
                            <SettingsIcon size={24} className="text-indigo-500" /> System Settings
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Manage your institution profile, campus locations, and system-wide preferences.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* Sidebar Navigation — horizontal scroll on mobile, vertical sidebar on lg+ */}
                    <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/50 flex-shrink-0 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto">
                        <div className="flex lg:flex-col gap-1 p-3 lg:p-4 lg:space-y-1 min-w-max lg:min-w-0">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-left rounded-xl transition-all duration-200 group whitespace-nowrap lg:whitespace-normal lg:w-full ${isActive
                                            ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className={`p-1.5 lg:p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-50' : 'bg-gray-100 group-hover:bg-white'}`}>
                                            <Icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-500'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`block text-xs lg:text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {tab.label}
                                            </span>
                                            <span className="hidden lg:block text-[11px] text-gray-400 font-medium">{tab.desc}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-gray-50/10 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
