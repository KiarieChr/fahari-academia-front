import React from 'react';
import { Users, DollarSign, Wallet, CreditCard, Clock, CheckCircle } from 'lucide-react';

const SummaryCard = ({ title, value, icon: Icon, gradient, trend }) => (
    <div className={`p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${gradient}`}>
        {/* Background decorative shapes */}
        <div className="absolute top-0 right-0 p-4 opacity-10 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Icon size={80} className="text-white" />
        </div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>

        <div className="relative z-10 text-white">
            <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Icon size={20} className="text-white" />
                </div>
                <p className="text-white/80 text-sm font-medium tracking-wide">{title}</p>
            </div>

            <h3 className="text-3xl font-bold tracking-tight mb-2">{value}</h3>

            {trend !== undefined && (
                <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 ${trend >= 0 ? 'text-white' : 'text-red-100'}`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                    <span className="text-xs text-white/60">vs last month</span>
                </div>
            )}
        </div>
    </div>
);

const MetricsCards = () => {
    // Mock data - in real app pass as props
    const metrics = [
        {
            title: 'Total Employees Paid',
            value: '1,240',
            icon: Users,
            gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200',
            trend: 2.5
        },
        {
            title: 'Gross Payroll',
            value: 'KES 45.2M',
            icon: DollarSign,
            gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200',
            trend: 1.2
        },
        {
            title: 'Total Deductions',
            value: 'KES 8.4M',
            icon: Wallet,
            gradient: 'bg-gradient-to-br from-orange-400 to-pink-500 shadow-orange-200',
            trend: 0.5
        },
        {
            title: 'Net Pay Disbursed',
            value: 'KES 36.8M',
            icon: CreditCard,
            gradient: 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-200',
            trend: 1.8
        },
        {
            title: 'Pending Approval',
            value: '3',
            icon: Clock,
            gradient: 'bg-gradient-to-br from-amber-400 to-yellow-500 shadow-amber-200',
            trend: 0
        },
        {
            title: 'Processed',
            value: '12',
            icon: CheckCircle,
            gradient: 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-200',
            trend: 0
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
                <SummaryCard key={index} {...metric} />
            ))}
        </div>
    );
};
export default MetricsCards;
