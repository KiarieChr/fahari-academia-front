
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Archive, History, BarChart2 } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import SupplyDashboard from './SupplyDashboard';
import StockRegister from './StockRegister';
import StockAdjustments from './StockAdjustments';
import ItemMaster from './ItemMaster';

const OverviewStats = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Total Inventory Value</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                        KSh {stats.totalStockValue?.toLocaleString()}
                    </h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <TrendingUp size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Total Items</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalItems}</h3>
                    <p className="text-xs text-gray-400 mt-1">{stats.capitalAssets} Capital Assets</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                    <Package size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Low Stock Items</p>
                    <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.lowStock}</h3>
                    <p className="text-xs text-red-500 mt-1">{stats.outOfStock} Out of Stock</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <AlertTriangle size={24} />
                </div>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm">Expired / Near Expiry</p>
                    <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.expired}</h3>
                    <p className="text-xs text-orange-500 mt-1">Requires Action</p>
                </div>
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                    <Archive size={24} />
                </div>
            </div>
        </div>
    </div>
);

const InventoryDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await inventoryService.getInventoryItems();
            setStats(res.stats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart2 },
        { id: 'master', label: 'Stock Register', icon: Package },
        { id: 'supply', label: 'Supply Issues', icon: History },
        // { id: 'adjustments', label: 'Adjustments', icon: RefreshCw } // Can integrate into Master or separate
    ];

    return (
        <div className="space-y-6">
            {/* Header with Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-200 pb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Inventories Dashboard</h2>
                    <p className="text-sm text-gray-500">Manage stock, assets, and supply distribution.</p>
                </div>

                <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <>
                        <OverviewStats stats={stats} />
                        {/* We could also show recent movements or charts here */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
                            (Charts for Capital Asset Distribution & Stock Value Trend would go here)
                        </div>
                    </>
                )}

                {activeTab === 'master' && <StockRegister />}

                {activeTab === 'supply' && <SupplyDashboard />}
            </div>
        </div>
    );
};

export default InventoryDashboard;
