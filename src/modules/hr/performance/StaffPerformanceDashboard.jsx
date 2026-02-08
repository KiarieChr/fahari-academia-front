
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus } from 'lucide-react';

import PerformanceMetricCard from './components/PerformanceMetricCard';
import GoalsProgressWidget from './components/GoalsProgressWidget';
import PerformanceReviewTable from './components/PerformanceReviewTable';
import PerformanceTimeline from './components/PerformanceTimeline';
import PerformanceQuickActions from './components/PerformanceQuickActions';

import { performanceMetrics, goalsData as employeeGoals, reviewsData as reviewData, timelineData as activityTimeline } from './data/performanceData';

const StaffPerformanceDashboard = () => {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors">
            <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Performance</h1>
                        <p className="text-slate-500 dark:text-slate-400">Track goals, appraisals, and professional development.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Download size={18} />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 transition-colors">
                            <Plus size={18} />
                            New Appraisal
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {performanceMetrics.map((metric, index) => (
                        <PerformanceMetricCard key={index} {...metric} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <GoalsProgressWidget goals={employeeGoals} />
                        <PerformanceQuickActions />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <PerformanceReviewTable reviews={reviewData} />
                        <PerformanceTimeline events={activityTimeline} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffPerformanceDashboard;
