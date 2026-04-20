import React, { useState } from 'react';
import {
    Calendar,
    Layers,
    Wallet,
    PiggyBank,
    CheckSquare,
    FileText,
    Settings,
    Save,
    Loader2,
    Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';

import PayrollCycleSettings from './components/settings/PayrollCycleSettings';
import PayGradesSteps from './components/dashboard/PayGradesSteps';
import AllowancesBenefits from './components/settings/AllowancesBenefits';
import DeductionsTaxes from './components/settings/DeductionsTaxes';
import PayrollAccounts from './components/settings/PayrollAccounts';
import ApprovalWorkflow from './components/settings/ApprovalWorkflow';
import PayslipSettings from './components/settings/PayslipSettings';
import SystemDefaults from './components/settings/SystemDefaults';

const PayrollSettings = () => {
    const [activeTab, setActiveTab] = useState('cycle');
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'cycle', label: 'Payroll Cycle', icon: Calendar, desc: 'Frequency & Dates' },
        { id: 'salary', label: 'Pay Grades', icon: Layers, desc: 'Structure & Scale' },
        { id: 'allowances', label: 'Allowances', icon: Wallet, desc: 'Benefits & Claims' },
        { id: 'deductions', label: 'Deductions', icon: PiggyBank, desc: 'Taxes & Relief' },
        { id: 'accounts', label: 'Payroll Accounts', icon: Landmark, desc: 'Earnings & Deductions' },
        { id: 'approval', label: 'Approvals', icon: CheckSquare, desc: 'Workflow Logic' },
        { id: 'payslip', label: 'Payslip', icon: FileText, desc: 'Templates' },
        { id: 'system', label: 'Security & Logs', icon: Settings, desc: 'Audit & Access' },
    ];

    const handleSave = async () => {
        setLoading(true);
        // Simulate API latency
        await new Promise(resolve => setTimeout(resolve, 1200));
        setLoading(false);
        toast.success('Settings saved successfully', {
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'cycle': return <PayrollCycleSettings />;
            case 'salary': return <PayGradesSteps />;
            case 'allowances': return <AllowancesBenefits />;
            case 'deductions': return <DeductionsTaxes />;
            case 'accounts': return <PayrollAccounts />;
            case 'approval': return <ApprovalWorkflow />;
            case 'payslip': return <PayslipSettings />;
            case 'system': return <SystemDefaults />;
            default: return <PayrollCycleSettings />;
        }
    };

    return (
        <DashboardLayout title="Payroll Settings">
            
            {/* Adjusted height to fit within dashboard layout padding (header + padding offset) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white z-10">
                    <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">Payroll Configuration</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Manage global payroll rules, taxes, and structures</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-black rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 font-medium"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? 'Saving Changes...' : 'Save Settings'}
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    {/* Sidebar Navigation — horizontal scroll on mobile, vertical on lg+ */}
                    <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/50 flex-shrink-0 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto">
                        <div className="flex lg:flex-col gap-1 p-3 lg:p-4 lg:space-y-1 min-w-max lg:min-w-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 text-left rounded-xl transition-all duration-200 group whitespace-nowrap lg:whitespace-normal lg:w-full ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <div className={`p-1.5 lg:p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-50' : 'bg-gray-100 group-hover:bg-white'}`}>
                                        <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className={`block text-xs lg:text-sm font-semibold ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {tab.label}
                                        </span>
                                        <span className="hidden lg:block text-[11px] text-gray-400 font-medium">{tab.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area with Transitions */}
                    <div className="flex-1 bg-gray-50/10 overflow-y-auto relative p-4 sm:p-6 lg:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="max-w-4xl mx-auto"
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PayrollSettings;

