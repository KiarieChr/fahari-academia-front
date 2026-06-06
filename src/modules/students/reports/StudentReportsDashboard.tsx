import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import { FileText, Download, Printer, BarChart3, Users, Calendar, AlertCircle, RefreshCw, PenTool, History, List, BookOpen, Wallet, TrendingUp, UserCheck, ChevronRight } from 'lucide-react';
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
            <div className="min-h-screen" style={{ background: 'var(--bg-light, #f8fafc)' }}>
                <div className="max-w-[1600px] mx-auto">

                    {/* ─── Hero Header ─── */}
                    <div
                        className="relative overflow-hidden px-8 pt-8 pb-0"
                        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0f4c75 50%, #1565c0 100%)' }}
                    >
                        {/* Decorative blobs */}
                        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
                        <div className="absolute bottom-10 left-1/4 w-64 h-64 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />

                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-widest mb-5 relative z-10">
                            <span>Students</span>
                            <ChevronRight size={14} />
                            <span className="text-white">Reports</span>
                        </div>

                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                            <div className="flex items-center gap-5">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                                >
                                    <FileText size={28} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Student Reports</h1>
                                    <p className="text-blue-300 font-medium mt-1 text-sm">Analytics, insights &amp; data exports across all student modules</p>
                                    {/* Inline KPI pills */}
                                    {overview && (
                                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                                                👥 {overview.total_students?.toLocaleString() || 0} Total
                                            </span>
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(52,211,153,0.2)', color: '#6ee7b7' }}>
                                                ✅ {overview.active_students?.toLocaleString() || 0} Active
                                            </span>
                                            {overview.enrolled_this_period > 0 && (
                                                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#fcd34d' }}>
                                                    🆕 {overview.enrolled_this_period} New
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <ReportsFilterBar filters={filters} onFiltersChange={setFilters} compact />
                                <button
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                                    style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                >
                                    <Printer size={16} />
                                    Print
                                </button>
                                <button
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    <Download size={16} />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* ─── Tab Strip ─── */}
                        <div className="flex items-center gap-1 mt-8 overflow-x-auto hide-scrollbar relative z-10 pb-0">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap rounded-t-xl transition-all duration-200 border-b-2"
                                        style={isActive ? {
                                            background: 'rgba(255,255,255,0.95)',
                                            color: '#1d4ed8',
                                            borderColor: 'transparent',
                                            boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
                                        } : {
                                            color: 'rgba(186,230,253,0.85)',
                                            background: 'transparent',
                                            borderColor: 'transparent',
                                        }}
                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                    >
                                        <Icon size={14} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── Overview Stats Bar ─── */}
                    <div className="px-6 pt-6">
                        <OverviewStats metrics={overviewMetrics} />
                    </div>

                    {/* ─── Tab Content ─── */}
                    <div className="px-6 pt-4 pb-10">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
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
