import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    Users, 
    CreditCard, 
    Wallet, 
    UserCheck, 
    GraduationCap,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const StatCard = ({ title, value, subValue, icon: Icon, trend, color, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-${color}-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity`} />
        
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${color}-100/50 text-${color}-600`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            {loading ? (
                <div className="h-14 flex items-center">
                    <Loader2 className="animate-spin text-slate-300" size={24} />
                </div>
            ) : (
                <>
                    <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
                    {subValue && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400">{subValue.label}</span>
                            <span className="text-sm font-semibold text-slate-700">{subValue.value}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    </motion.div>
);

const AdminStatsGrid = () => {
    const [stats, setStats] = useState({
        payroll: null,
        finance: null,
        workforce: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const [payroll, finance, workforce] = await Promise.all([
                    api.workforce.getPayrollSummary(),
                    api.fees.getInsights(),
                    api.workforce.getStats()
                ]);

                setStats({
                    payroll: payroll.current_period || payroll,
                    finance: finance.data || finance,
                    workforce: workforce
                });
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const formatNumber = (val) => {
        return new Intl.NumberFormat('en-KE').format(val || 0);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                title="Payroll Summary"
                value={formatCurrency(stats.payroll?.gross_payroll)}
                subValue={{ label: 'Net Payable', value: formatCurrency(stats.payroll?.net_payable) }}
                icon={Wallet}
                color="blue"
                loading={loading}
            />
            <StatCard 
                title="Fee Collections"
                value={formatCurrency(stats.finance?.collection?.total_collected)}
                subValue={{ label: 'Total Billed', value: formatCurrency(stats.finance?.collection?.total_billed) }}
                icon={CreditCard}
                color="indigo"
                loading={loading}
            />
            <StatCard 
                title="Active Students"
                value={formatNumber(stats.finance?.invoicing?.total_enrolled || stats.finance?.total_enrolled)}
                subValue={{ label: 'Pending Invoice', value: formatNumber(stats.finance?.invoicing?.not_invoiced) }}
                icon={GraduationCap}
                color="emerald"
                loading={loading}
            />
            <StatCard 
                title="Workforce"
                value={formatNumber(stats.workforce?.active_employees)}
                subValue={{ label: 'On Leave', value: stats.workforce?.on_leave || 0 }}
                icon={Users}
                color="amber"
                loading={loading}
            />
        </div>
    );
};

export default AdminStatsGrid;
