import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { api } from '../../../services/api';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import PerformanceMetricCard from './components/PerformanceMetricCard';
import GoalsProgressWidget from './components/GoalsProgressWidget';
import PerformanceReviewTable from './components/PerformanceReviewTable';
import PerformanceTimeline from './components/PerformanceTimeline';
import PerformanceQuickActions from './components/PerformanceQuickActions';

// Import fallback data for timeline since backend doesn't have a timeline endpoint yet
import { timelineData as activityTimeline } from './data/performanceData';

const StaffPerformanceDashboard = ({ noLayout = false }) => {
    const [metrics, setMetrics] = useState([]);
    const [goals, setGoals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/workforce/api/employee-appraisals/dashboard_metrics/');
                setMetrics(response.metrics || []);
                setReviews(response.recent_appraisals || []);
                setGoals(response.goals || []);
            } catch (error) {
                console.error("Failed to load performance metrics:", error);
                toast.error("Failed to load performance dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const content = (
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
                {metrics.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((metric: any, index: number) => (
                            <PerformanceMetricCard key={index} {...metric} />
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <GoalsProgressWidget goals={goals} />
                        <PerformanceQuickActions />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <PerformanceReviewTable reviews={reviews} />
                        <PerformanceTimeline events={activityTimeline} />
                    </div>
                </div>
            </div>
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Performance Dashboard">
            {content}
        </DashboardLayout>
    );
};

export default StaffPerformanceDashboard;
