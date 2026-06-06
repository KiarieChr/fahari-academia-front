import React from 'react';
import { DollarSign, Wallet, CreditCard, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, amount, trend, trendLabel, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden"
    >
        {/* Background Gradient Accents */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500`}></div>

        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3.5 rounded-xl ${color} shadow-sm group-hover:shadow-md transition-shadow`}>
                <Icon size={22} className="text-white" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${trend > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {trend > 0 ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />}
                    <span className="tabular-nums">{Math.abs(trend)}%</span>
                </div>
            )}
        </div>

        <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{amount}</h3>
            {trendLabel && <p className="text-xs text-gray-400 mt-1 font-medium">{trendLabel}</p>}
        </div>
    </motion.div>
);

const EarningsSummaryCards = () => {
    // Mock Data
    const stats = [
        {
            title: 'Total Earnings',
            amount: 'KES 12,450,000',
            trend: 2.5,
            trendLabel: 'vs last month',
            icon: DollarSign,
            color: 'bg-gradient-to-br from-indigo-500 to-indigo-700'
        },
        {
            title: 'Basic Salaries',
            amount: 'KES 8,200,000',
            trend: 0.8,
            trendLabel: 'stable',
            icon: Wallet,
            color: 'bg-gradient-to-br from-blue-500 to-blue-700'
        },
        {
            title: 'Total Allowances',
            amount: 'KES 3,150,000',
            trend: 4.2,
            trendLabel: 'increased',
            icon: CreditCard,
            color: 'bg-gradient-to-br from-purple-500 to-purple-700'
        },
        {
            title: 'Overtime & Bonuses',
            amount: 'KES 1,100,000',
            trend: -1.5,
            trendLabel: 'decreased',
            icon: Award,
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

export default EarningsSummaryCards;
