import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import { FileText, Download, Printer, BarChart3, Users, Calendar, AlertCircle, RefreshCw, PenTool, History, List, BookOpen, Wallet, TrendingUp, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

import ReportsFilterBar from './components/ReportsFilterBar';
import OverviewStats from './components/OverviewStats';
import AttendanceSection from './components/AttendanceSection';
import AcademicSection from './components/AcademicSection';
import DisciplineSection from './components/DisciplineSection';
import TransfersSection from './components/TransfersSection';
import DemographicsSection from './components/DemographicsSection';
import CustomReportBuilder from './components/CustomReportBuilder';
import ReportHistory from './components/ReportHistory';
import StudentListSection from './components/StudentListSection';
import ClassListSection from './components/ClassListSection';
import FeeCollectionsSection from './components/FeeCollectionsSection';
import SessionStatisticsSection from './components/SessionStatisticsSection';
import ApplicantStatisticsSection from './components/ApplicantStatisticsSection';
import EnrollmentStatisticsSection from './components/EnrollmentStatisticsSection';
import StudentStatementSection from './components/StudentStatementSection';

import { reportsService } from '../../../services/reportsService';

const TABS = [
    { id: 'student-list', label: 'Student List', icon: Users },
    { id: 'class-list', label: 'Class List', icon: BookOpen },
    { id: 'enrollment-stats', label: 'Enrollment Stats', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'session-stats', label: 'Session Stats', icon: BarChart3 },
    { id: 'fee-collections', label: 'Fee Collections', icon: Wallet },
    { id: 'applicant-stats', label: 'Applicant Stats', icon: UserCheck },
    { id: 'academic', label: 'Academic', icon: BarChart3 },
    { id: 'discipline', label: 'Discipline', icon: AlertCircle },
    { id: 'transfers', label: 'Transfers', icon: RefreshCw },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'statement', label: 'Student Statement', icon: FileText },
    { id: 'builder', label: 'Report Builder', icon: PenTool },
    { id: 'history', label: 'History', icon: History },
];

const LIVE_TABS = {
    'student-list': 'studentList',
    'class-list': 'classList',
    'fee-collections': 'feeCollections',
    'session-stats': 'sessionStats',
    'applicant-stats': 'applicantStats',
    'enrollment-stats': 'enrollmentStats',
    'attendance': 'attendance',
    'academic': 'academic',
    'transfers': 'transfers',
    'demographics': 'demographics',
};

const StudentReportsDashboard = () => {
    const [activeTab, setActiveTab] = useState('student-list');
    const [filters, setFilters] = useState({ academic_year: '', term: '', session: '', search: '' });
    const [overview, setOverview] = useState(null);
    const [loadingOverview, setLoadingOverview] = useState(false);
    const [liveData, setLiveData] = useState({});
    const [loadingTab, setLoadingTab] = useState(false);

    // Fetch overview KPIs
    useEffect(() => {
        setLoadingOverview(true);
        reportsService.getOverview(filters)
            .then(setOverview)
            .catch(() => {})
            .finally(() => setLoadingOverview(false));
    }, [filters.academic_year, filters.term]);

    // Fetch live data for active tab
    const fetchTabData = useCallback(async (tab, currentFilters) => {
        const fetchers = {
            'student-list': () => reportsService.getStudentList({ ...currentFilters, page_size: 20 }),
            'class-list': () => reportsService.getClassList(currentFilters),
            'fee-collections': () => reportsService.getFeeCollections(currentFilters),
            'session-stats': () => reportsService.getSessionStatistics(currentFilters),
            'applicant-stats': () => reportsService.getApplicantStatistics(currentFilters),
            'enrollment-stats': () => reportsService.getEnrollmentStatistics(currentFilters),
            'attendance': () => reportsService.getAttendance(currentFilters),
            'academic': () => reportsService.getAcademic(currentFilters),
            'transfers': () => reportsService.getTransfers(currentFilters),
            'demographics': () => reportsService.getDemographics(currentFilters),
        };
        if (!fetchers[tab]) return;
        setLoadingTab(true);
        try {
            const res = await fetchers[tab]();
            setLiveData((prev) => ({ ...prev, [LIVE_TABS[tab]]: res }));
        } catch {
            // ignore
        } finally {
            setLoadingTab(false);
        }
    }, []);

    useEffect(() => {
        fetchTabData(activeTab, filters);
    }, [activeTab, fetchTabData, filters.academic_year, filters.term, filters.session]);

    // Build OverviewStats metrics from live data when available
    const overviewMetrics = {
        totalStudents: { value: overview?.total_students ?? 0, change: 0, trend: 'neutral' },
        activeStudents: { value: overview?.active_students ?? 0, change: 0, trend: 'neutral' },
        newAdmissions: { value: overview?.enrolled_this_period ?? 0, change: 0, trend: 'neutral' },
        transfersIn: { value: 0, change: 0, trend: 'neutral' },
        transfersOut: { value: 0, change: 0, trend: 'neutral' },
        dropouts: { value: 0, change: 0, trend: 'neutral' },
    };

    // Transform live attendance API shape to what AttendanceSection expects
    const attendanceData = liveData.attendance ? {
        byClass: (liveData.attendance.results || []).map(r => ({ name: r.label, attendance: r.attendance_rate })),
        trend: [],
        table: (liveData.attendance.results || []).map(r => ({
            class: r.label,
            students: r.total,
            avg: r.attendance_rate,
            chronic: r.absent,
            bestDay: '-',
        })),
        overall_rate: liveData.attendance.overall_rate,
    } : null;

    const handleSearch = (val) => {
        setFilters((f) => ({ ...f, search: val }));
        // Reload student list with new search
        reportsService.getStudentList({ ...filters, search: val, page_size: 20 })
            .then((res) => setLiveData((prev) => ({ ...prev, studentList: res })))
            .catch(() => {});
    };

    const handlePageChange = (page) => {
        reportsService.getStudentList({ ...filters, page, page_size: 20 })
            .then((res) => setLiveData((prev) => ({ ...prev, studentList: res })))
            .catch(() => {});
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'student-list':
                return <StudentListSection data={liveData.studentList} loading={loadingTab} onSearch={handleSearch} onPageChange={handlePageChange} onViewStatement={(s) => { setActiveTab('statement'); }} />;
            case 'class-list':
                return <ClassListSection data={liveData.classList} loading={loadingTab} />;
            case 'fee-collections':
                return <FeeCollectionsSection data={liveData.feeCollections} loading={loadingTab} />;
            case 'session-stats':
                return <SessionStatisticsSection data={liveData.sessionStats} loading={loadingTab} />;
            case 'applicant-stats':
                return <ApplicantStatisticsSection data={liveData.applicantStats} loading={loadingTab} />;
            case 'enrollment-stats':
                return <EnrollmentStatisticsSection data={liveData.enrollmentStats} loading={loadingTab} />;
            case 'attendance': return <AttendanceSection data={attendanceData} loading={loadingTab} />;
            case 'academic': return <AcademicSection data={liveData.academic} loading={loadingTab} />;
            case 'discipline': return <DisciplineSection data={{ summary: { total: 0, resolved: 0, pending: 0 }, cases: [] }} />;
            case 'transfers': return <TransfersSection data={liveData.transfers} loading={loadingTab} />;
            case 'demographics': return <DemographicsSection data={liveData.demographics} loading={loadingTab} />;
            case 'statement': return <StudentStatementSection filters={filters} />;
            case 'builder': return <CustomReportBuilder />;
            case 'history': return <ReportHistory data={[]} />;
            default: return null;
        }
    };

    return (
        <DashboardLayout title="Student Reports">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors">
                <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Student Reports Dashboard</h1>
                            <p className="text-slate-500 dark:text-slate-400">Insights, trends, and analytics for student management.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <Printer size={18} />
                                Print
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 transition-colors">
                                <Download size={18} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <ReportsFilterBar filters={filters} onFiltersChange={setFilters} />

                    {/* Overview Stats (Always Visible) */}
                    <OverviewStats metrics={overviewMetrics} />

                    {/* Tabs & Content */}
                    <div className="space-y-6">
                        {/* Tabs Navigation */}
                        <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2 border-b border-slate-200 dark:border-slate-700">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                                            ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-lg'
                                            }`}
                                    >
                                        <Icon size={16} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dynamic Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentReportsDashboard;
