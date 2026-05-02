
import React from 'react';
import { Download, Plus, User, Clock, Calendar, XCircle } from 'lucide-react';
import { api } from '../../../services/api';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import AttendanceMetricCard from './components/AttendanceMetricCard';
import ClockInOutWidget from './components/ClockInOutWidget';
import AttendanceQuickActions from './components/AttendanceQuickActions';
import AttendanceTable from './components/AttendanceTable';
import AttendanceCalendar from './components/AttendanceCalendar';
import RequestLeaveModal from './components/modals/RequestLeaveModal';


import { attendanceMetrics } from './data/attendanceData';

const StaffAttendanceDashboard = () => {
    const [metrics, setMetrics] = React.useState(attendanceMetrics);
    const [records, setRecords] = React.useState([]);
    const [events, setEvents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [isRequestLeaveOpen, setIsRequestLeaveOpen] = React.useState(false);

    const fetchData = async () => {
        try {
            const [summaryRes, recordsRes] = await Promise.all([
                api.get('/workforce/api/attendance/daily_summary/'),
                api.get('/workforce/api/attendance/')
            ]);

            const summary = summaryRes;

            // Update metrics based on summary
            const newMetrics = [
                {
                    title: "Present Today",
                    value: summary.present,
                    trend: "+12%", // Calculate if history available
                    trendUp: true,
                    icon: User,
                    color: "emerald",
                    description: "High attendance rate"
                },
                {
                    title: "Late Arrivals",
                    value: summary.late,
                    trend: "-5%",
                    trendUp: true, // actually good if down, but visual
                    icon: Clock,
                    color: "amber",
                    description: "Improved from yesterday"
                },
                {
                    title: "On Leave",
                    value: summary.on_leave,
                    trend: "0%",
                    trendUp: true,
                    icon: Calendar,
                    color: "blue",
                    description: "Planned leaves"
                },
                {
                    title: "Absent",
                    value: summary.absent,
                    trend: "+2",
                    trendUp: false,
                    icon: XCircle,
                    color: "red",
                    description: "Need attention"
                }
            ];

            setMetrics(newMetrics);
            setRecords(recordsRes.results || recordsRes || []);
            setLoading(false);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <DashboardLayout title="Staff Attendance">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors">
                <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Attendance</h1>
                            <p className="text-slate-500 dark:text-slate-400">Monitor clock-ins, shifts, and attendance records.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <Download size={18} />
                                Reports
                            </button>
                            <button
                                onClick={() => setIsRequestLeaveOpen(true)}
                                className="btn btn-primary d-flex align-items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                            >
                                <Plus size={18} />
                                Request Leave
                            </button>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((metric, index) => (
                            <AttendanceMetricCard key={index} {...metric} />
                        ))}
                    </div>

                    {/* Main Content Split */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Clock In Widget & Calender? or Just Clock In and Quick Actions */}
                        <div className="space-y-6">
                            <div className="h-[400px]">
                                <ClockInOutWidget onClockUpdate={fetchData} />
                            </div>
                            <AttendanceQuickActions />
                        </div>

                        {/* Right Column: Recent Records & Calendar */}
                        <div className="lg:col-span-2 space-y-6">
                            <AttendanceTable records={records} loading={loading} />
                            <AttendanceCalendar events={events} />
                        </div>
                    </div>
                </div>

                {/* Modals */}
                <RequestLeaveModal isOpen={isRequestLeaveOpen} onClose={() => setIsRequestLeaveOpen(false)} />
            </div>

        </DashboardLayout >
    );
};

export default StaffAttendanceDashboard;
