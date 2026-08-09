
import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, CheckCircle, Plus } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import SupplyIssueList from './SupplyIssueList';
import CreateSupplyIssue from './CreateSupplyIssue';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} />
            </div>
            {subtext && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">{subtext}</span>}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-gray-500 text-sm">{title}</p>
    </div>
);

const SupplyDashboard = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'create'
    const [stats, setStats] = useState({
        items: { totalItems: 0, lowStock: 0, totalValue: 0 },
        issues: { totalIssues: 0, pending: 0, totalValueIssued: 0 }
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [itemsRes, issuesRes] = await Promise.all([
                inventoryService.getInventoryItems(),
                inventoryService.getIssues()
            ]);
            setStats({
                items: itemsRes.stats,
                issues: issuesRes.stats
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Inventory Value"
                    value={`KSh ${stats.items.totalValue?.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.items.lowStock}
                    icon={AlertTriangle}
                    color="bg-red-100 text-red-600"
                    subtext={stats.items.lowStock > 0 ? "Action Needed" : "Healthy"}
                />
                <StatCard
                    title="Pending Vouchers"
                    value={stats.issues.pending}
                    icon={Package}
                    color="bg-orange-100 text-orange-600"
                />
                <StatCard
                    title="Value Issued (This Month)"
                    value={`KSh ${stats.issues.totalValueIssued?.toLocaleString()}`}
                    icon={CheckCircle}
                    color="bg-green-100 text-green-600"
                />
            </div>

            {/* Main Content Area */}
            {viewMode === 'list' ? (
                <SupplyIssueList
                    onCreate={() => setViewMode('create')}
                    onView={(issue) => toast('View details not implemented in this demo')}
                />
            ) : (
                <CreateSupplyIssue
                    onCancel={() => setViewMode('list')}
                    onSuccess={() => {
                        setViewMode('list');
                        loadStats(); // Refresh stats
                    }}
                />
            )}
        </div>
    );
};

export default SupplyDashboard;

