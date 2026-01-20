import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Toaster, toast } from 'sonner';

// Data
import {
    leaveMetrics,
    leaveRequests as initialRequests,
    leaveHistory,
    analyticsData,
    employeeBalance,
    notifications
} from './data/leaveData';

// Components
import LeaveMetricCard from './components/LeaveMetricCard';
import LeaveRequestsTable from './components/LeaveRequestsTable';
import LeaveCalendar from './components/LeaveCalendar';
import LeaveCharts from './components/LeaveCharts';
import LeaveNotifications from './components/LeaveNotifications';
import LeaveQuickActions from './components/LeaveQuickActions';
import ApplyLeaveDialog from './components/ApplyLeaveDialog';
import LeaveBalanceWidget from './components/LeaveBalanceWidget';
import ActivityTimeline from './components/ActivityTimeline';

import { motion } from 'framer-motion';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import './LeaveDashboard.css';

const LeaveDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [requests, setRequests] = useState(initialRequests);

    // Handlers
    const handleApprove = (id) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Approved' } : req
        ));
        toast.success("Leave request approved");
        // In a real app, update metrics here
    };

    const handleReject = (id) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Rejected' } : req
        ));
        toast.error("Leave request rejected");
    };

    const handleApplyLeave = (data) => {
        const newRequest = {
            id: requests.length + 1,
            employee: 'Current User', // Mock
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            days: 3, // Mock calculation
            status: 'Pending',
            avatar: 'ME',
        };
        setRequests([newRequest, ...requests]);
    };

    const tabs = ['Overview', 'Requests', 'Calendar', 'Analytics'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <DashboardLayout title="Leave Management">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="leave-dashboard p-6 font-sans text-gray-900"
            >
                <div>
                    <Toaster position="top-right" />
                </div>

                {/* Header */}
                <motion.header variants={itemVariants} className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Track, manage and approve leave requests</p>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <LeaveNotifications
                            notifications={notifications}
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                        />
                    </div>
                </motion.header>

                {/* Metrics */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {leaveMetrics.map(metric => (
                        <LeaveMetricCard key={metric.id} {...metric} />
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="mb-8">
                    <LeaveQuickActions onApplyLeave={() => setShowApplyModal(true)} />
                </motion.div>

                {/* Main Content */}
                <motion.div variants={itemVariants} className="flex flex-col gap-6">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex gap-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[400px]"
                    >
                        {activeTab === 'Overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <LeaveRequestsTable
                                        requests={requests}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <LeaveBalanceWidget balances={employeeBalance} />
                                    <ActivityTimeline activities={leaveHistory} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'Requests' && (
                            <LeaveRequestsTable
                                requests={requests}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        )}

                        {activeTab === 'Calendar' && (
                            <LeaveCalendar requests={requests} />
                        )}

                        {activeTab === 'Analytics' && (
                            <LeaveCharts data={analyticsData} />
                        )}
                    </motion.div>
                </motion.div>

                {/* Modals */}
                <ApplyLeaveDialog
                    isOpen={showApplyModal}
                    onClose={() => setShowApplyModal(false)}
                    onSubmit={handleApplyLeave}
                />
            </motion.div>
        </DashboardLayout>
    );
};

export default LeaveDashboard;
