import React from 'react';
import { TrendingUp, TrendingDown, Scale, HeartHandshake, Banknote, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, amount, trend, trendLabel, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
    >
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(trend)}% {trendLabel}
                </div>
            )}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{amount}</h3>
        </div>
    </motion.div>
);

const DeductionsSummaryCards = () => {
    // Mock Data
    const stats = [
        {
            title: 'Total Deductions',
            amount: 'KES 4,250,000',
            trend: 1.5,
            trendLabel: 'vs last month',
            icon: Landmark,
            color: 'bg-gradient-to-br from-red-500 to-red-700'
        },
        {
            title: 'Statutory (PAYE/NSSF)',
            amount: 'KES 2,800,000',
            trend: 0.2,
            trendLabel: 'stable',
            icon: Scale,
            color: 'bg-gradient-to-br from-blue-500 to-blue-700'
        },
        {
            title: 'Voluntary (SACCO/Ins)',
            amount: 'KES 950,000',
            trend: 3.2,
            trendLabel: 'increased',
            icon: HeartHandshake,
            color: 'bg-gradient-to-br from-purple-500 to-purple-700'
        },
        {
            title: 'Loan Repayments',
            amount: 'KES 500,000',
            trend: -4.5,
            trendLabel: 'decreased',
            icon: Banknote,
            color: 'bg-gradient-to-br from-amber-500 to-amber-700'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default DeductionsSummaryCards;
