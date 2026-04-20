import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Wallet, AlertCircle, TrendingUp, TrendingDown, Banknote, PiggyBank } from 'lucide-react';
import { motion } from 'framer-motion';
import { payrollService } from '../../../../services/payrollService';

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

    const stats = data ? [
        {
            title: 'Total Employees',
            value: data.total_employees?.toLocaleString() || '0',
            sub: `${data.employees_processed || 0} processed`,
            icon: Users,
            color: 'blue',
            gradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Gross Payroll',
            value: formatCurrency(data.gross_payroll || 0),
            sub: data.gross_change !== 0 ? `${data.gross_change > 0 ? '+' : ''}${data.gross_change}% vs last` : 'No change',
            icon: DollarSign,
            color: 'emerald',
            gradient: 'from-emerald-500 to-teal-600',
            trend: data.gross_change > 0 ? 'up' : data.gross_change < 0 ? 'down' : null
        },
        {
            title: 'Net Payable',
            value: formatCurrency(data.net_payable || 0),
            sub: data.current_period?.status === 'calculated' ? 'Pending Approval' : data.current_period?.status || 'No active period',
            icon: Wallet,
            color: 'indigo',
            gradient: 'from-indigo-500 to-purple-600',
            trend: data.net_change > 0 ? 'up' : data.net_change < 0 ? 'down' : null
        },
        {
            title: 'Total Deductions',
            value: formatCurrency(data.total_deductions || 0),
            sub: `Allowances: ${formatCurrency(data.total_allowances || 0)}`,
            icon: PiggyBank,
            color: 'amber',
            gradient: 'from-amber-500 to-orange-500'
        },
    ] : [];

    // Loading skeleton
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                            <div className="h-10 w-10 bg-gray-200 rounded-xl" />
                        </div>
                        <div className="h-8 w-28 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

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
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-8 text-white shadow-lg cursor-pointer transition-all`}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        {stat.trend && (
                            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-white/20' : 'bg-white/20'
                                }`}>
                                {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            </span>
                        )}
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                    <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                    <p className="text-white/60 text-xs mt-1">{stat.sub}</p>
                </motion.div>
            ))}
        </div>
    );
};

export default KPIGrid;
