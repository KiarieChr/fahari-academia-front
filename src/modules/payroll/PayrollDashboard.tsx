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

const EmployeePayProfiles = React.lazy(() => import('./components/dashboard/EmployeePayProfiles'));
const PayGradesSteps = React.lazy(() => import('./components/dashboard/PayGradesSteps'));
const PayPeriods = React.lazy(() => import('./components/dashboard/PayPeriods'));

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
                            <div className="xl:col-span-2 space-y-6 p-4">
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
            <div className="px-2 py-3 border-b border-gray-100 flex justify-between items-center bg-white z-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Payroll</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Process payroll, manage pay profiles, and review analytics</p>
                </div>
            </div>

            <div className="border-b border-gray-100 bg-white px-4 pt-2 py-3">
                <div className="flex space-x-8 overflow-x-auto no-scrollbar py-3">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 py-2 px-3 border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'} />
                            <span className={`text-sm font-semibold ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'}`}>
                                {tab.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Content Area */}
                <div className="flex-1 bg-gray-50/10 overflow-y-auto relative p-4">
                    <React.Suspense fallback={<div className="flex h-full items-center justify-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </React.Suspense>
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
