import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, Briefcase } from 'lucide-react';

import StatCard from '../../dashboard/components/StatCard';
import { hrService } from '../../services/hrService';
import { toast } from 'react-toastify';

const HumanResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        onLeave: 0,
        presentToday: 0,
        departments: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Trying to fetch employees to get count
                const employeesData = await hrService.getEmployees({ limit: 1 }).catch(() => null);

                setStats({
                    totalEmployees: employeesData?.count || 145,
                    onLeave: 12, // Mock data for now
                    presentToday: 130, // Mock data
                    departments: 8
                });
            } catch (error) {
                console.error("Failed to fetch HR stats", error);
                // toast.error("Could not load HR statistics"); 
                // Silent fail to default mocks
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
        { title: 'Staff Register', path: '/dashboard/hr/staff-register', icon: <Users size={20} />, color: 'bg-blue-100 text-blue-600' },
        { title: 'Leave Management', path: '/dashboard/hr/leave', icon: <Calendar size={20} />, color: 'bg-orange-100 text-orange-600' },
        { title: 'Recruitment', path: '/dashboard/hr/recruitments', icon: <Briefcase size={20} />, color: 'bg-purple-100 text-purple-600' },
        { title: 'Performance', path: '/dashboard/hr/staff-performance', icon: <UserCheck size={20} />, color: 'bg-green-100 text-green-600' },
    ];

    return (
        <DashboardLayout title="Human Resource">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Human Resource Overview</h1>
                    <p className="text-gray-500">Manage detailed employee records, leave, and performance.</p>
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
                                title="Total Employees"
                                count={stats.totalEmployees}
                                icon={<Users size={24} />}
                                color="bg-blue-50 text-blue-600"
                                trend={4}
                                trendLabel="new this month"
                            />
                            <StatCard
                                title="Present Today"
                                count={stats.presentToday}
                                icon={<UserCheck size={24} />}
                                color="bg-green-50 text-green-600"
                                trend={0}
                                trendLabel="96% attendance"
                            />
                            <StatCard
                                title="On Leave"
                                count={stats.onLeave}
                                icon={<Calendar size={24} />}
                                color="bg-orange-50 text-orange-600"
                                trend={0}
                                trendLabel="active requests"
                            />
                            <StatCard
                                title="Departments"
                                count={stats.departments}
                                icon={<Briefcase size={24} />}
                                color="bg-purple-50 text-purple-600"
                                trend={0}
                                trendLabel="operational units"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">HR Management</h2>
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

export default HumanResource;

