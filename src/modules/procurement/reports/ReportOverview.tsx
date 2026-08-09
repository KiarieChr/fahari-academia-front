
import React from 'react';
import { DollarSign, Clock, ShoppingBag, BarChart2, TrendingUp, AlertCircle } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} />
            </div>
        </div>
        {trend && (
            <div className={`text-xs font-medium flex items-center ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
                <TrendingUp size={14} className="mr-1" />
                {trend.value} vs last month
            </div>
        )}
    </div>
);

const ReportOverview = ({ stats }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Total Procurement Spend (YTD)"
                    value={`KSh ${stats.totalSpendYTD?.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-blue-50 text-blue-600"
                    trend={{ value: '12%', positive: false }} // In procurement, higher spend might be "negative" or just context dependent
                />
                <KPICard
                    title="Open PO Commitments"
                    value={`KSh ${stats.openPOValue?.toLocaleString()}`}
                    icon={ShoppingBag}
                    color="bg-purple-50 text-purple-600"
                />
                <KPICard
                    title="Avg Approval Turnaround"
                    value={stats.avgApprovalTime}
                    icon={Clock}
                    color="bg-orange-50 text-orange-600"
                    trend={{ value: '0.5 Days', positive: true }} // Faster is better
                />
                <KPICard
                    title="Conversion Rate (Req -> PO)"
                    value={stats.requisitionConversionRate}
                    icon={BarChart2}
                    color="bg-indigo-50 text-indigo-600"
                />
                <KPICard
                    title="Current Stock Value"
                    value={`KSh ${stats.stockValue?.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-green-50 text-green-600"
                />
                <KPICard
                    title="Supplier Performance Index"
                    value={`${stats.supplierPerformanceIndex} / 5.0`}
                    icon={AlertCircle}
                    color="bg-teal-50 text-teal-600"
                    trend={{ value: '0.2', positive: true }}
                />
            </div>

            {/* Placeholder for Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400">
                    Spend Analysis by Department (Chart Placeholder)
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400">
                    Monthly Procurement Volume (Chart Placeholder)
                </div>
            </div>
        </div>
    );
};

export default ReportOverview;
