import React, { useState } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { CreditCard, MessageSquare } from 'lucide-react';
import PaymentGatewaySettings from './components/PaymentGatewaySettings';
import { ProviderSettings } from '../crm/components/ProviderSettings';

import AiApiSettings from './components/AiApiSettings';

const ApiConfigPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'payments' | 'communications' | 'ai'>('payments');

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
                        API Configurations
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Configure payment gateways, communication APIs, and external integrations.
                    </p>
                </div>

                {/* Horizontal Tabs */}
                <div className="flex space-x-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200 mb-6 max-w-md">
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'payments'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <CreditCard size={18} />
                        Payment APIs
                    </button>
                    <button
                        onClick={() => setActiveTab('communications')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'communications'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <MessageSquare size={18} />
                        Communications APIs
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'ai'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        AI & Intelligence
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-16rem)] p-6">
                    {activeTab === 'payments' && <PaymentGatewaySettings />}
                    {activeTab === 'communications' && <ProviderSettings />}
                    {activeTab === 'ai' && <AiApiSettings />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ApiConfigPage;
