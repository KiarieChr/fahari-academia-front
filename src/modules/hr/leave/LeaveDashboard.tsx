import React, { useState, useEffect } from 'react';
import { Bell, List, UserCheck, Clock, Calendar as CalendarIcon, PieChart, Plus } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { api } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../dashboard/DashboardLayout';

// Data Fallbacks
import { leaveHistory, notifications } from './data/leaveData';

// Components
import LeaveMetricCard from './components/LeaveMetricCard';
import LeaveRequestsTable from './components/LeaveRequestsTable';
import LeaveCalendar from './components/LeaveCalendar';
import LeaveCharts from './components/LeaveCharts';
import LeaveNotifications from './components/LeaveNotifications';
import ApplyLeaveDialog from './components/ApplyLeaveDialog';
import UpcomingLeavesTable from './components/UpcomingLeavesTable';
import OvertimeRequestsTable from './components/OvertimeRequestsTable';
import { useAuth } from '../../../auth/AuthProvider';

const LeaveDashboard = ({ noLayout = false }) => {
    const { user } = useAuth() as any;
    const isHrAdmin = user?.is_staff || user?.is_superuser || user?.groups?.includes('HR');

    const [activeTab, setActiveTab] = useState('Overview');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    
    const defaultMetrics = [
        { id: 1, title: 'Annual Leave', value: 0, subtitle: 'This month' },
        { id: 2, title: 'Sick Leave', value: 0, subtitle: 'This month' },
        { id: 3, title: 'Other Leave', value: 0, subtitle: 'This month' },
        { id: 4, title: 'Pending Request', value: 0, subtitle: 'This month' }
    ];
    
    // States
    const [metrics, setMetrics] = useState(defaultMetrics);
    const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
    const [pendingOvertimeCount, setPendingOvertimeCount] = useState(0);
    const [requests, setRequests] = useState([]);
    const [upcomingLeaves, setUpcomingLeaves] = useState([]);
    const [overtimeRequests, setOvertimeRequests] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [reqRes, metRes, analRes, upcRes, ovtRes] = await Promise.all([
                api.get('/workforce/api/leave-applications/'),
                api.get('/workforce/api/leave-applications/dashboard_metrics/'),
                api.get('/workforce/api/leave-applications/analytics/'),
                api.get('/workforce/api/leave-applications/upcoming_leaves/'),
                api.get('/workforce/api/overtime-requests/').catch(() => ({ results: [] }))
            ]);
            
            setRequests(reqRes.results || reqRes || []);
            
            if (metRes && metRes.metrics) {
                setMetrics(metRes.metrics);
                setPendingLeavesCount(metRes.pending_leaves || 0);
                setPendingOvertimeCount(metRes.pending_overtime || 0);
            } else if (Array.isArray(metRes) && metRes.length > 0) {
                // Fallback if backend still returning old array format
                setMetrics(metRes);
            }
            
            if (analRes) {
                setAnalytics(analRes);
            }
            
            setUpcomingLeaves(upcRes.results || upcRes || []);
            setOvertimeRequests(ovtRes.results || ovtRes || []);
            
        } catch (err) {
            toast.error("Failed to fetch leave data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleApprove = async (id) => {
        try {
            await api.post(`/workforce/api/leave-applications/${id}/approve/`);
            toast.success("Leave request approved");
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to approve request");
        }
    };

    const handleReject = async (id) => {
        try {
            await api.post(`/workforce/api/leave-applications/${id}/reject/`, { reason: 'Rejected by admin' });
            toast.error("Leave request rejected");
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.error || "Failed to reject request");
        }
    };
    
    const handleApproveOvertime = async (id) => {
        try {
            await api.post(`/workforce/api/overtime-requests/${id}/approve/`);
            toast.success("Overtime request approved");
            fetchData();
        } catch (err) {
            toast.error("Failed to approve overtime request");
        }
    };

    const handleRejectOvertime = async (id) => {
        try {
            await api.post(`/workforce/api/overtime-requests/${id}/reject/`, { reason: 'Rejected by admin' });
            toast.error("Overtime request rejected");
            fetchData();
        } catch (err) {
            toast.error("Failed to reject overtime request");
        }
    };

    const handleApplyLeave = async (data) => {
        try {
            const payload = {
                leave_type: data.type,
                start_date: data.startDate,
                end_date: data.endDate,
                reason: data.reason || 'Leave applied',
                total_days: data.totalDays,
                working_days: data.workingDays,
                return_date: data.returnDate,
                ...(data.employeeId && { employee: data.employeeId })
            };
            
            const res = await api.post('/workforce/api/leave-applications/', payload);
            if (res.id) {
                try {
                    await api.post(`/workforce/api/leave-applications/${res.id}/submit/`);
                } catch (submitErr) {}
            }
            
            toast.success("Leave application submitted successfully");
            fetchData();
            setShowApplyModal(false);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to apply for leave");
        }
    };

    const handlePopulateLeaveTypes = async () => {
        try {
            const res = await api.post('/workforce/api/leave-types/populate/');
            toast.success(res.message || "Leave types populated successfully");
        } catch (err) {
            toast.error("Failed to populate leave types");
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const content = (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="leave-dashboard p-6 font-sans text-gray-900 bg-gray-50/50 min-h-screen"
        >
            <Toaster position="top-right" />

            {/* Header */}
            <motion.header variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Track, manage and approve leave requests</p>
                </div>
                <div className="flex gap-2">
                    {isHrAdmin && (
                        <button 
                            onClick={handlePopulateLeaveTypes}
                            className="flex items-center gap-1 px-3 py-2  bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50"
                            style={{borderRadius:'10px'}}
                        >
                            <Plus size={16} /> Populate Leave Types
                        </button>
                    )}
                    <button 
                        onClick={() => setShowApplyModal(true)}
                        className="flex items-center gap-1 px-3 py-2  bg-blue-600 text-white shadow-md"
                        style={{borderRadius:'10px'}}
                    >
                        <Plus size={16} /> Apply for Leave
                    </button>
                </div>
            </motion.header>

            {/* Tabs */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 bg-transparent mb-3">

                <button 
                    onClick={() => setActiveTab('Overview')}
                    className={`flex items-center  px-3 py-2  text-sm font-semibold transition-all ${activeTab === 'Overview' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    style={{borderRadius:'10px'}}
                >
                    <List size={16} /> Overview
                </button>
                <button 
                    onClick={() => setActiveTab('Requests')}
                    className={`flex items-center  px-3 py-2  text-sm font-semibold transition-all ${activeTab === 'Requests' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    style={{borderRadius:'10px'}}   
                >
                    <UserCheck size={18} /> Time Off
                    {pendingLeavesCount > 0 && (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${activeTab === 'Requests' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                            {pendingLeavesCount}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('Overtime')}
                    className={`flex items-center  px-3 py-2  text-sm font-semibold transition-all ${activeTab === 'Overtime' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    style={{borderRadius:'10px'}}
                >
                    <Clock size={18} /> Overtime
                    {pendingOvertimeCount > 0 && (
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${activeTab === 'Overtime' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                            {pendingOvertimeCount}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('Calendar')}
                    className={`flex items-center  px-3  py-2  text-sm font-semibold transition-all ${activeTab === 'Calendar' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    style={{borderRadius:'10px'}}
                >
                    <CalendarIcon size={18} /> Calendar
                </button>
                <button 
                    onClick={() => setActiveTab('Analytics')}
                    className={`flex items-center  px-3  py-2  text-sm font-semibold transition-all ${activeTab === 'Analytics' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                    style={{borderRadius:'10px'}}
                >
                    <PieChart size={18} /> Analytics
                </button>
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="flex flex-col gap-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[400px]"
                    >
                        {activeTab === 'Overview' && (
                            <div className="space-y-6">
                                {/* Top Metrics Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                    {metrics.map(metric => {
                                        // Map missing props for new backend response format
                                        const mappedMetric = {
                                            ...metric,
                                            icon: metric.icon || (metric.title.includes('Annual') ? CalendarIcon : metric.title.includes('Sick') ? Plus : metric.title.includes('Pending') ? Clock : List),
                                            change: metric.subtitle || metric.change,
                                            lightColor: metric.lightColor || 'bg-blue-100',
                                            textColor: metric.textColor || 'text-blue-600',
                                            color: metric.color || 'bg-blue-500'
                                        };
                                        return <LeaveMetricCard key={mappedMetric.id} {...mappedMetric} />;
                                    })}
                                </div>

                                {/* Middle Row: Leave Trend & Upcoming Leaves */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-3">
                                    <LeaveCharts data={analytics} />
                                    <UpcomingLeavesTable leaves={upcomingLeaves} />
                                </div>

                                {/* Bottom Row: Pending Approvals */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Pending Approvals</h3>
                                    <LeaveRequestsTable
                                        requests={requests.filter(r => (r.status || '').toLowerCase().includes('pending') || (r.status || '').toLowerCase().includes('submit'))}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                    />
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
                        
                        {activeTab === 'Overtime' && (
                            <OvertimeRequestsTable
                                requests={overtimeRequests}
                                onApprove={handleApproveOvertime}
                                onReject={handleRejectOvertime}
                            />
                        )}

                        {activeTab === 'Calendar' && (
                            <LeaveCalendar requests={requests} />
                        )}

                        {activeTab === 'Analytics' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <LeaveCharts data={analytics} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Modals */}
            <ApplyLeaveDialog
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                onSubmit={handleApplyLeave}
            />
        </motion.div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Leave Management">
            {content}
        </DashboardLayout>
    );
};

export default LeaveDashboard;
