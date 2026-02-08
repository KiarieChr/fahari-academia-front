import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import { FileText, Download, Printer, BarChart3, Users, Calendar, AlertCircle, RefreshCw, PenTool, History } from 'lucide-react';
import { motion } from 'framer-motion';

import ReportsFilterBar from './components/ReportsFilterBar';
import OverviewStats from './components/OverviewStats';
import EnrollmentSection from './components/EnrollmentSection';
import AttendanceSection from './components/AttendanceSection';
import AcademicSection from './components/AcademicSection';
import DisciplineSection from './components/DisciplineSection';
import TransfersSection from './components/TransfersSection';
import DemographicsSection from './components/DemographicsSection';
import CustomReportBuilder from './components/CustomReportBuilder';
import ReportHistory from './components/ReportHistory';

import * as reportsData from './data/studentReportsData';

const TABS = [
    { id: 'enrollment', label: 'Enrollment', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'academic', label: 'Academic Performance', icon: BarChart3 },
    { id: 'discipline', label: 'Discipline', icon: AlertCircle },
    { id: 'transfers', label: 'Transfers', icon: RefreshCw },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'builder', label: 'Report Builder', icon: PenTool },
    { id: 'history', label: 'History', icon: History },
];

const StudentReportsDashboard = () => {
    const [activeTab, setActiveTab] = useState('enrollment');

    const renderContent = () => {
        switch (activeTab) {
            case 'enrollment': return <EnrollmentSection data={reportsData.enrollmentData} />;
            case 'attendance': return <AttendanceSection data={reportsData.attendanceData} />;
            case 'academic': return <AcademicSection data={reportsData.academicData} />;
            case 'discipline': return <DisciplineSection data={reportsData.disciplineData} />;
            case 'transfers': return <TransfersSection data={reportsData.transfersData} />;
            case 'demographics': return <DemographicsSection data={reportsData.demographicsData} />;
            case 'builder': return <CustomReportBuilder />;
            case 'history': return <ReportHistory data={reportsData.reportHistory} />;
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
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-black rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 transition-colors">
                                <Download size={18} />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <ReportsFilterBar />

                    {/* Overview Stats (Always Visible) */}
                    <OverviewStats metrics={reportsData.summaryMetrics} />

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
