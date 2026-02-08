import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import StatCard from '../../dashboard/components/StatCard';
import { toast } from 'react-toastify';

const StudentFees = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCollections: 0,
        outstandingBalance: 0,
        defaulters: 0,
        paidPercentage: 0
    });

    useEffect(() => {
        // Mock data loading
        const fetchStats = async () => {
            try {
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 500));

                setStats({
                    totalCollections: 8500000,
                    outstandingBalance: 2400000,
                    defaulters: 48,
                    paidPercentage: 78
                });
            } catch (error) {
                console.error("Failed to fetch fee stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const quickLinks = [
        { title: 'Invoices', path: '/dashboard/fees/invoice', icon: <FileText size={20} />, color: 'bg-blue-100 text-blue-600' },
        { title: 'Receipt Book', path: '/dashboard/fees/receipts', icon: <CreditCard size={20} />, color: 'bg-green-100 text-green-600' },
        { title: 'Arrears', path: '/dashboard/fees/arrears', icon: <AlertTriangle size={20} />, color: 'bg-red-100 text-red-600' },
        { title: 'Fee Structure', path: '/dashboard/fees/structure', icon: <CheckCircle size={20} />, color: 'bg-purple-100 text-purple-600' },
    ];

    return (
        <DashboardLayout title="Student Fee Management">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Fee Management Dashboard</h1>
                    <p className="text-gray-500">Track collections, invoices, and outstanding balances.</p>
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
                                title="Total Collections"
                                count={formatCurrency(stats.totalCollections)}
                                icon={<CreditCard size={24} />}
                                color="bg-green-50 text-green-600"
                                trend={12.5}
                                trendLabel="this term"
                            />
                            <StatCard
                                title="Outstanding"
                                count={formatCurrency(stats.outstandingBalance)}
                                icon={<AlertTriangle size={24} />}
                                color="bg-red-50 text-red-600"
                                trend={-5}
                                trendLabel="receivables"
                            />
                            <StatCard
                                title="Defaulters"
                                count={stats.defaulters}
                                icon={<UsersIcon size={24} />}
                                color="bg-orange-50 text-orange-600"
                                trend={2}
                                trendLabel="students"
                            />
                            <StatCard
                                title="Collection Rate"
                                count={`${stats.paidPercentage}%`}
                                icon={<CheckCircle size={24} />}
                                color="bg-blue-50 text-blue-600"
                                trend={5}
                                trendLabel="target 85%"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Fee Operations</h2>
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

export default StudentFees;
// Simple icon component for internal use if needed, though we imported others
const UsersIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

