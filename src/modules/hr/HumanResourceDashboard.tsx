// Modern HR Dashboard - Enterprise SaaS Design
// Similar to BambooHR / SAP SuccessFactors

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, UserCheck, Calendar, Briefcase, UserPlus,
    Clock, TrendingUp, Award, FileText, Settings,
    ChevronRight, ArrowUpRight, Building2, UserMinus,
    AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { PageHeader, StatCard, Card, StatusBadge, EmptyState } from '../../components/ui';
import { CardGridSkeleton } from '../../components/ui/LoadingSkeleton';
import { hrService } from '../../services/hrService';
import { toast } from 'react-toastify';

// HR Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
        green: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
        purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
        orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
        red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
        indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
    };

    return (
        <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-gray-200 transition-all text-left w-full"
        >
            <div className={`p-3 rounded-xl transition-colors ${colorClasses[color]}`}>
                <Icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 truncate">{description}</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        </motion.button>
    );
};

// Pending Approval Item
const ApprovalItem = ({ type, employee, date, status, onApprove, onReject }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                {employee.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
                <p className="font-medium text-gray-900">{employee}</p>
                <p className="text-sm text-gray-500">{type} • {date}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onReject}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <XCircle size={20} />
            </button>
            <button
                onClick={onApprove}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
                <CheckCircle size={20} />
            </button>
        </div>
    </div>
);

// Recent Activity Item
const ActivityItem = ({ icon: Icon, title, description, time, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-emerald-100 text-emerald-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 truncate">{description}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
        </div>
    );
};

const HumanResource = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        onLeave: 0,
        pendingApprovals: 0,
        departments: 0,
        newHires: 0,
        openPositions: 0,
        turnoverRate: 0,
    });
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                // Fetch employees
                const employeesData = await hrService.getEmployees({ limit: 1 }).catch(() => null);
                const departments = await hrService.getDepartments().catch(() => []);
                
                // Mock enhanced stats (would come from backend)
                setStats({
                    totalEmployees: employeesData?.count || 145,
                    activeEmployees: Math.round((employeesData?.count || 145) * 0.92),
                    onLeave: 8,
                    pendingApprovals: 5,
                    departments: Array.isArray(departments) ? departments.length : (departments?.results?.length || 8),
                    newHires: 4,
                    openPositions: 6,
                    turnoverRate: 3.2,
                });

                // Mock pending approvals
                setPendingApprovals([
                    { id: 1, type: 'Leave Request', employee: 'John Kamau', date: 'Mar 15-22' },
                    { id: 2, type: 'Leave Request', employee: 'Mary Wanjiku', date: 'Mar 18-20' },
                    { id: 3, type: 'Expense Claim', employee: 'Peter Otieno', date: 'KES 15,000' },
                ]);

                // Mock recent activity
                setRecentActivity([
                    { icon: UserPlus, title: 'New hire', description: 'Jane Doe joined as Software Developer', time: '2h ago', color: 'green' },
                    { icon: Calendar, title: 'Leave approved', description: 'Michael K. - Annual leave Mar 10-15', time: '4h ago', color: 'blue' },
                    { icon: Award, title: 'Probation completed', description: 'Sarah M. confirmed as permanent', time: '1d ago', color: 'purple' },
                    { icon: FileText, title: 'Contract renewed', description: 'James O. - 2 year extension', time: '2d ago', color: 'orange' },
                ]);

            } catch (error) {
                console.error("Failed to fetch HR dashboard data", error);
                toast.error("Could not load HR dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const quickActions = [
        { title: 'Staff Register', description: 'View all employees', icon: Users, path: '/dashboard/hr/staff-register', color: 'blue' },
        { title: 'Leave Management', description: 'Requests & balances', icon: Calendar, path: '/dashboard/hr/leave', color: 'orange' },
        { title: 'Recruitment', description: 'Job openings & candidates', icon: Briefcase, path: '/dashboard/hr/recruitments', color: 'purple' },
        { title: 'Performance', description: 'Reviews & appraisals', icon: Award, path: '/dashboard/hr/staff-performance', color: 'green' },
        { title: 'Attendance', description: 'Daily attendance records', icon: Clock, path: '/dashboard/hr/staff-attendance', color: 'indigo' },
        { title: 'HR Settings', description: 'Configure HR module', icon: Settings, path: '/dashboard/hr/hr-settings', color: 'red' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <DashboardLayout title="Human Resource">
            <div className="p-6 max-w-[1600px] mx-auto">
                {/* Page Header */}
                <PageHeader
                    title="Human Resource"
                    subtitle="Manage your workforce efficiently"
                    icon={Users}
                    actions={
                        <button
                            onClick={() => navigate('/dashboard/hr/staff-register')}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 transition-colors"
                            style={{ backgroundColor: 'var(--primary-color)', color: 'white', borderColor: 'var(--primary-color)' }}
                        >
                            <UserPlus size={18} />
                            Add Employee
                        </button>
                    }
                />

                {loading ? (
                    <div className="mt-8">
                        <CardGridSkeleton count={4} />
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="mt-8 space-y-6"
                    >
                        {/* Stats Grid - 4 Primary Metrics */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Total Employees"
                                value={stats.totalEmployees}
                                icon={Users}
                                iconColor="#3b82f6"
                                iconBg="rgba(59, 130, 246, 0.1)"
                                change={stats.newHires > 0 ? Math.round((stats.newHires / stats.totalEmployees) * 100) : 0}
                                changeLabel={`${stats.newHires} new this month`}
                            />
                            <StatCard
                                title="Active Staff"
                                value={stats.activeEmployees}
                                icon={UserCheck}
                                iconColor="#10b981"
                                iconBg="rgba(16, 185, 129, 0.1)"
                                change={0}
                                changeLabel={`${Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}% of total`}
                            />
                            <StatCard
                                title="On Leave Today"
                                value={stats.onLeave}
                                icon={Calendar}
                                iconColor="#f59e0b"
                                iconBg="rgba(245, 158, 11, 0.1)"
                                change={0}
                                changeLabel="Approved absences"
                            />
                            <StatCard
                                title="Pending Approvals"
                                value={stats.pendingApprovals}
                                icon={AlertCircle}
                                iconColor="#ef4444"
                                iconBg="rgba(239, 68, 68, 0.1)"
                                change={0}
                                changeLabel="Requires action"
                                onClick={() => navigate('/dashboard/hr/leave')}
                            />
                        </motion.div>

                        {/* Secondary Stats Row */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-50">
                                        <Building2 size={18} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.departments}</p>
                                        <p className="text-xs text-gray-500">Departments</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-purple-50">
                                        <Briefcase size={18} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.openPositions}</p>
                                        <p className="text-xs text-gray-500">Open Positions</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-50">
                                        <UserPlus size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.newHires}</p>
                                        <p className="text-xs text-gray-500">New Hires</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-50">
                                        <TrendingUp size={18} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stats.turnoverRate}%</p>
                                        <p className="text-xs text-gray-500">Turnover Rate</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Quick Actions */}
                            <motion.div variants={itemVariants} className="lg:col-span-2">
                                <Card
                                    title="Quick Actions"
                                    subtitle="Frequently used HR operations"
                                    padding="none"
                                >
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {quickActions.map((action, index) => (
                                            <QuickActionCard
                                                key={index}
                                                {...action}
                                                onClick={() => navigate(action.path)}
                                            />
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Pending Approvals */}
                            <motion.div variants={itemVariants}>
                                <Card
                                    title="Pending Approvals"
                                    subtitle={`${pendingApprovals.length} items need action`}
                                    padding="none"
                                    actions={
                                        <button
                                            onClick={() => navigate('/dashboard/hr/leave')}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                            style={{ color: 'var(--primary-color)' }}
                                        >
                                            View all <ArrowUpRight size={14} />
                                        </button>
                                    }
                                >
                                    <div className="divide-y divide-gray-100">
                                        {pendingApprovals.length === 0 ? (
                                            <EmptyState
                                                variant="compact"
                                                icon="inbox"
                                                title="All caught up!"
                                                description="No pending approvals at this time."
                                            />
                                        ) : (
                                            pendingApprovals.map((item) => (
                                                <ApprovalItem
                                                    key={item.id}
                                                    {...item}
                                                    onApprove={() => toast.success(`Approved ${item.type.toLowerCase()}`)}
                                                    onReject={() => toast.info(`Rejected ${item.type.toLowerCase()}`)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Recent Activity */}
                        <motion.div variants={itemVariants}>
                            <Card
                                title="Recent Activity"
                                subtitle="Latest HR events and updates"
                                padding="none"
                                actions={
                                    <button
                                        onClick={() => navigate('/dashboard/hr/hr-reports')}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                        style={{ color: 'var(--primary-color)' }}
                                    >
                                        View reports <ArrowUpRight size={14} />
                                    </button>
                                }
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    {recentActivity.map((activity, index) => (
                                        <ActivityItem key={index} {...activity} />
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default HumanResource;
