
import React, { useState } from 'react';
import { motion } from 'framer-motion';

import HRMetricCard from './components/HRMetricCard';
import ReportsTabs from './components/ReportsTabs';
import ReportsFilters from './components/ReportsFilters';
import ReportsCharts from './components/ReportsCharts';
import ReportsTable from './components/ReportsTable';
import ExportActions from './components/ExportActions';

import { reportMetrics, attendanceReportData, leaveReportData, performanceReportData, recruitmentReportData, recruitmentFunnelData } from './data/hrReportsData';

const HRReportsDashboard = () => {
    const [activeTab, setActiveTab] = useState('attendance'); // attendance | leave | performance | recruitment

    // Helper to switch data based on tab
    const getTabContent = () => {
        switch (activeTab) {
            case 'attendance':
                return {
                    title: 'Attendance & Punctuality Trends',
                    chartData: [], // Visual Mock handled in component
                    tableData: attendanceReportData
                };
            case 'leave':
                return {
                    title: 'Leave Requests & Balances',
                    chartData: [],
                    tableData: leaveReportData
                };
            case 'performance':
                return {
                    title: 'Employee Performance Ratings',
                    chartData: [],
                    tableData: performanceReportData
                };
            case 'recruitment':
                return {
                    title: 'Recruitment & Hiring Pipeline',
                    chartData: recruitmentFunnelData,
                    tableData: recruitmentReportData
                };
            default:
                return { title: '', chartData: [], tableData: [] };
        }
    };

    const content = getTabContent();

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors">
            <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">HR Analytics & Reports</h1>
                        <p className="text-slate-500 dark:text-slate-400">Deep dive into workforce metrics and trends.</p>
                    </div>
                    <ExportActions />
                </div>

                {/* Filters Row */}
                <ReportsFilters />

                {/* High-level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reportMetrics.map((metric, index) => (
                        <HRMetricCard key={index} {...metric} />
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="space-y-6">
                    <ReportsTabs activeTab={activeTab} onChange={setActiveTab} />

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Charts Section */}
                        <ReportsCharts type={activeTab} data={content.chartData} title={content.title} />

                        {/* Data Table Section */}
                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{content.title} - Detailed Records</h3>
                            <ReportsTable data={content.tableData} type={activeTab} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default HRReportsDashboard;
