import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, PieChart, TrendingUp, FileText, CreditCard } from 'lucide-react';

import StatCard from '../../dashboard/components/StatCard';
import { financeService } from '../../services/financeService';
import { toast } from 'react-toastify';

const Finance = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        pendingInvoices: 0,
        activeAccounts: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Trying to fetch real stats if available
                // const accounts = await financeService.getAccounts();
                // const invoices = await financeService.getInvoices();

                // For now, using mock data structure that mirrors what would be expected
                setStats({
                    totalRevenue: 12500000,
                    totalExpenses: 8400000,
                    pendingInvoices: 12,
                    activeAccounts: 45
                });
            } catch (error) {
                console.error("Failed to fetch finance stats", error);
                toast.error("Could not load financial overview");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const quickLinks = [
        { title: 'Financial Reports', path: '/dashboard/finance/reports', icon: <PieChart size={20} />, color: 'bg-blue-100 text-blue-600' },
        { title: 'Accounts Payable', path: '/dashboard/finance/payable', icon: <CreditCard size={20} />, color: 'bg-red-100 text-red-600' },
        { title: 'Budgeting', path: '/dashboard/finance/budgeting', icon: <Wallet size={20} />, color: 'bg-green-100 text-green-600' },
        { title: 'Chart of Accounts', path: '/dashboard/finance/chart', icon: <FileText size={20} />, color: 'bg-purple-100 text-purple-600' },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <DashboardLayout title="Finance Dashboard">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Finance Dashboard</h1>
                    <p className="text-gray-500">Overview of financial health, accounts, and transactions.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-6"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="YTD Revenue"
                                count={formatCurrency(stats.totalRevenue)}
                                icon={<TrendingUp size={24} />}
                                color="bg-green-50 text-green-600"
                                trend={8.5}
                                trendLabel="vs last year"
                            />
                            <StatCard
                                title="YTD Expenses"
                                count={formatCurrency(stats.totalExpenses)}
                                icon={<Wallet size={24} />}
                                color="bg-red-50 text-red-600"
                                trend={-2.4}
                                trendLabel="under budget"
                            />
                            <StatCard
                                title="Pending Invoices"
                                count={stats.pendingInvoices}
                                icon={<FileText size={24} />}
                                color="bg-orange-50 text-orange-600"
                                trend={0}
                                trendLabel="needing attention"
                            />
                            <StatCard
                                title="Active Accounts"
                                count={stats.activeAccounts}
                                icon={<PieChart size={24} />}
                                color="bg-blue-50 text-blue-600"
                                trend={0}
                                trendLabel="chart of accounts"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {quickLinks.map((link, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(link.path)}
                                        className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all bg-white text-left"
                                    >
                                        <div className={`p-3 rounded-lg ${link.color}`}>
                                            {link.icon}
                                        </div>
                                        <span className="font-medium text-gray-700">{link.title}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Finance;

