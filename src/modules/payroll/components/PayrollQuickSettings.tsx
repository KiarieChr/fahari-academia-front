import React, { useState } from 'react';
import {
    CreditCard,
    Shield,
    Activity,
    Percent,
    Wallet,
    Gift,
    Scissors,
    FileSignature,
    FileText,
    Lock,
    Settings
} from 'lucide-react';
import { toast } from 'react-toastify';
import QuickSettingCard from './QuickSettingCard';

const PayrollQuickSettings = () => {
    // Mock configuration state
    const [settings] = useState([
        {
            id: 'pay-grade',
            title: 'Pay Grade Setup',
            description: 'Manage salary ranges and link grades to roles.',
            icon: CreditCard,
            status: 'configured'
        },
        {
            id: 'nssf',
            title: 'NSSF Setup',
            description: 'Configure contribution rates and tiers.',
            icon: Shield,
            status: 'configured'
        },
        {
            id: 'sha',
            title: 'SHA Setup',
            description: 'Social Health Authority contribution rules.',
            icon: Activity,
            status: 'pending'
        },
        {
            id: 'paye',
            title: 'PAYE Setup',
            description: 'Tax bands, rates and personal relief config.',
            icon: Percent,
            status: 'configured'
        },
        {
            id: 'accounts',
            title: 'Payroll Accounts',
            description: 'Map expense and liability accounts.',
            icon: Wallet,
            status: 'error'
        },
        {
            id: 'allowances',
            title: 'Allowances & Benefits',
            description: 'Housing, transport, and other benefits.',
            icon: Gift,
            status: 'active'
        },
        {
            id: 'deductions',
            title: 'Deductions',
            description: 'Loans, advances, and other deductions.',
            icon: Scissors,
            status: 'active'
        },
        {
            id: 'approval',
            title: 'Approval Workflow',
            description: 'Configure multi-step approval chain.',
            icon: FileSignature,
            status: 'active'
        },
        {
            id: 'payslip',
            title: 'Payslip Settings',
            description: 'Logos, templates and notes.',
            icon: FileText,
            status: 'active'
        },
        {
            id: 'lock',
            title: 'Period Controls',
            description: 'Lock/Unlock payroll periods.',
            icon: Lock,
            status: 'active',
            isLocked: false // This is "controls", not the UI lock state
        }
    ]);

    const handleSettingClick = (setting) => {
        // In a real implementation, this would open a modal or navigate
        console.log(`Open setting: ${setting.title}`);

        switch (setting.status) {
            case 'configured':
                toast.success(`Opening ${setting.title} configuration...`);
                break;
            case 'pending':
                toast('This configuration is pending setup.', { icon: '⚠️' });
                break;
            case 'error':
                toast.error(`Attention required: ${setting.title} has errors.`);
                break;
            default:
                toast(`Opening ${setting.title}...`);
        }
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Quick Settings</h3>
                    <p className="text-sm text-gray-500">Essential payroll configuration and controls</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    <Settings size={16} className="mr-1.5" />
                    All Settings
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {settings.map((setting) => (
                    <QuickSettingCard
                        key={setting.id}
                        title={setting.title}
                        description={setting.description}
                        icon={setting.icon}
                        status={setting.status}
                        isLocked={false} // Can be logic-based later
                        onClick={() => handleSettingClick(setting)}
                    />
                ))}
            </div>
        </div>
    );
};

export default PayrollQuickSettings;

