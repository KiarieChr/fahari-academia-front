import React, { useState } from 'react';
import { LayoutDashboard, Users, Layers, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../dashboard/DashboardLayout';

import KPIGrid from './components/dashboard/KPIGrid';
import WorkflowStatus from './components/dashboard/WorkflowStatus';
import QuickActionsPanel from './components/dashboard/QuickActionsPanel';
import AnalyticsSection from './components/dashboard/AnalyticsSection';
import AlertsWidget from './components/dashboard/AlertsWidget';
import RecentRunsTable from './components/dashboard/RecentRunsTable';
import EmployeePayProfiles from './components/dashboard/EmployeePayProfiles';
import PayGradesSteps from './components/dashboard/PayGradesSteps';
import PayPeriods from './components/dashboard/PayPeriods';

const PayrollDashboard = ({ noLayout = false }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, desc: 'Dashboard & KPIs' },
        { id: 'pay-grades', label: 'Pay Grades & Ranks', icon: Layers, desc: 'Salary structures' },
        { id: 'pay-profiles', label: 'Employee Pay Profiles', icon: Users, desc: 'Salary assignments' },
        { id: 'pay-periods', label: 'Pay Periods', icon: Calendar, desc: 'Payroll runs' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <KPIGrid />
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-6">
                                <WorkflowStatus />
                                <AnalyticsSection />
                                <RecentRunsTable />
                            </div>
                            <div className="space-y-6">
                                <QuickActionsPanel />
                                <AlertsWidget />
                            </div>
                        </div>
                    </div>
                );
            case 'pay-grades':
                return <PayGradesSteps />;
            case 'pay-profiles':
                return <EmployeePayProfiles />;
            case 'pay-periods':
                return <PayPeriods />;
            default:
                return null;
        }
    };

    const content = (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Payroll</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Process payroll, manage pay profiles, and review analytics</p>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col overflow-y-auto">
                    <div className="p-4 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group ${activeTab === tab.id
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-50' : 'bg-gray-100 group-hover:bg-white'}`}>
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`block text-sm font-semibold ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {tab.label}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-medium">{tab.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50/10 overflow-y-auto relative p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Payroll Dashboard">
            {content}
        </DashboardLayout>
    );
};

export default PayrollDashboard;
