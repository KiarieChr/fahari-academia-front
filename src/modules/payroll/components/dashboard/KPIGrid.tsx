import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Wallet, AlertCircle, TrendingUp, TrendingDown, PiggyBank, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { payrollService } from '../../../../services/payrollService';
import '../../../../dashboard/dashboard.css';

const KPIGrid = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardSummary();
    }, []);

    const fetchDashboardSummary = async () => {
        try {
            setLoading(true);
            const response = await payrollService.getDashboardSummary();
            setData(response);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard summary:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `KES ${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `KES ${(value / 1000).toFixed(0)}K`;
        }
        return `KES ${value.toLocaleString()}`;
    };

    const statsConfig = [
        {
            title: 'Total Employees',
            value: data?.total_employees?.toLocaleString() || '0',
            sub: `${data?.employees_processed || 0} processed`,
            icon: Users,
            colorClass: 'stat-blue',
            badge: 'Active'
        },
        {
            title: 'Gross Payroll',
            value: formatCurrency(data?.gross_payroll || 0),
            sub: data?.gross_change ? `${data.gross_change > 0 ? '+' : ''}${data.gross_change}% vs last` : 'No change',
            icon: DollarSign,
            colorClass: 'stat-emerald',
            badge: data?.gross_change > 0 ? 'Up' : data?.gross_change < 0 ? 'Down' : 'Stable'
        },
        {
            title: 'Net Payable',
            value: formatCurrency(data?.net_payable || 0),
            sub: data?.current_period?.status === 'calculated' ? 'Pending Approval' : data?.current_period?.status || 'No active period',
            icon: Wallet,
            colorClass: 'stat-indigo',
            badge: 'Pending'
        },
        {
            title: 'Total Deductions',
            value: formatCurrency(data?.total_deductions || 0),
            sub: `Allowances: ${formatCurrency(data?.total_allowances || 0)}`,
            icon: PiggyBank,
            colorClass: 'stat-amber',
            badge: 'Deductions'
        },
    ];

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 text-sm">{error}</p>
                <button
                    onClick={fetchDashboardSummary}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    className={`mini-stat-card-premium ${stat.colorClass} relative overflow-hidden group cursor-pointer`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="card-top">
                        <div className="stat-title">{stat.title}</div>
                        <div className="stat-icon-glow">
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="stat-value-large mt-4">
                        {loading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : stat.value}
                    </div>
                    <div className="stat-subtitle mt-2 flex items-center justify-between">
                        <span>{stat.sub}</span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/50">{stat.badge}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default KPIGrid;
