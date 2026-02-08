import React, { useState } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';

import { ShoppingCart, FileText, Truck, Package, BarChart, ShieldCheck, Settings } from 'lucide-react';
import GRNDashboard from './grn/GRNDashboard';
import InventoryDashboard from '../inventory/InventoryDashboard';
import ProcurementReports from './reports/ProcurementReports';
import EGPDashboard from './egp/EGPDashboard';
import ProcurementSettings from './settings/ProcurementSettings';

const Procurement = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="p-6 text-center text-gray-500">
                        <h2 className="text-xl font-semibold mb-2">Procurement Overview</h2>
                        <p>Purchase Requisitions and PO stats will appear here.</p>
                    </div>
                );
            case 'requisitions':
                return <div className="p-6 text-center text-gray-500">Purchase Requisitions Module (Coming Soon)</div>;
            case 'orders':
                return <div className="p-6 text-center text-gray-500">Purchase Orders Module (Coming Soon)</div>;
            case 'grn':
                return <GRNDashboard />;
            case 'inventory':
                return <InventoryDashboard />;
            case 'reports':
                return <ProcurementReports />;
            case 'egp':
                return <EGPDashboard />;
            case 'settings':
                return <ProcurementSettings />;
            default:
                return <div>Select a module</div>;
        }
    };

    return (
        <DashboardLayout title="Procurement">
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Internal Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto hidden md:block">
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Menu
                        </h3>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ShoppingCart size={18} className="mr-3" />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('requisitions')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'requisitions'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <FileText size={18} className="mr-3" />
                                Requisitions
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'orders'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Package size={18} className="mr-3" />
                                Purchase Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('grn')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'grn'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Truck size={18} className="mr-3" />
                                Goods Received (GRN)
                            </button>
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'inventory'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Package size={18} className="mr-3" />
                                Stores & Inventory
                            </button>
                            <button
                                onClick={() => setActiveTab('reports')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'reports'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <BarChart size={18} className="mr-3" />
                                Reports & Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('egp')}
                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'egp'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ShieldCheck size={18} className="mr-3" />
                                E-GP / Compliance
                            </button>
                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'settings'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Settings size={18} className="mr-3" />
                                    Configuration
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-auto bg-gray-50 p-6">
                    {renderContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Procurement;
