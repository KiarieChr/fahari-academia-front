import React, { useState, useEffect } from 'react';
import { 
    Users, 
    CreditCard, 
    Wallet, 
    GraduationCap,
    Loader2
} from 'lucide-react';
import { api } from '../../services/api';

const StatCard = ({ title, value, subValue, icon: Icon, iconColor, bgHex, loading }) => (
    <div className="neo-card p-3 flex flex-col justify-between h-full border-none">
        <div className="flex items-center gap-4 mb-4">
            <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center neo-pressed" 
                style={{ color: iconColor }}
            >
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
        </div>
        
        <div className="mt-auto">
            {loading ? (
                <div className="h-8 flex items-center">
                    <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
            ) : (
                <>
                    <div className="text-2xl font-bold text-gray-800">{value}</div>
                    {subValue && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium neo-pressed text-gray-600">
                            {subValue.label}: {subValue.value}
                        </div>
                    )}
                </>
            )}
        </div>
    </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
                title="Payroll Summary"
                value={formatCurrency(stats.payroll?.gross_payroll)}
                subValue={{ label: 'Net Payable', value: formatCurrency(stats.payroll?.net_payable) }}
                icon={Wallet}
                iconColor="#1976d2"
                bgHex="#e3f2fd"
                loading={loading}
            />
            <StatCard 
                title="Fee Collections"
                value={formatCurrency(stats.finance?.collection?.total_collected)}
                subValue={{ label: 'Total Billed', value: formatCurrency(stats.finance?.collection?.total_billed) }}
                icon={CreditCard}
                iconColor="#4f46e5"
                bgHex="#e0e7ff"
                loading={loading}
            />
            <StatCard 
                title="Active Students"
                value={formatNumber(stats.finance?.invoicing?.total_enrolled || stats.finance?.total_enrolled)}
                subValue={{ label: 'Pending Invoice', value: formatNumber(stats.finance?.invoicing?.not_invoiced) }}
                icon={GraduationCap}
                iconColor="#059669"
                bgHex="#d1fae5"
                loading={loading}
            />
            <StatCard 
                title="Workforce"
                value={formatNumber(stats.workforce?.active_employees)}
                subValue={{ label: 'On Leave', value: stats.workforce?.on_leave || 0 }}
                icon={Users}
                iconColor="#d97706"
                bgHex="#fef3c7"
                loading={loading}
            />
        </div>
    );
};

export default AdminStatsGrid;

