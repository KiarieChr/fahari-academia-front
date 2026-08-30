import React, { useState } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import SystemConfig from './components/SystemConfig';
import CurrencySettings from './components/CurrencySettings';
import BillingSettings from './components/BillingSettings';
import { Sliders, DollarSign, FileText } from 'lucide-react';

const GeneralSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'config' | 'currency' | 'billing'>('config');

    return (
        <DashboardLayout title="General Settings">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
                        General Settings
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Manage system-wide preferences and financial configurations.
                    </p>
                </div>

                {/* Horizontal Tabs */}
                <div className="flex space-x-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200 mb-6 max-w-sm">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'config'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <Sliders size={18} />
                        System Config
                    </button>
                    <button
                        onClick={() => setActiveTab('currency')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'currency'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <DollarSign size={18} />
                        Currency
                    </button>
                    <button
                        onClick={() => setActiveTab('billing')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'billing'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <FileText size={18} />
                        Billing & Subscription
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-16rem)] p-6">
                    {activeTab === 'config' && <SystemConfig />}
                    {activeTab === 'currency' && <CurrencySettings />}
                    {activeTab === 'billing' && <BillingSettings />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GeneralSettingsPage;
