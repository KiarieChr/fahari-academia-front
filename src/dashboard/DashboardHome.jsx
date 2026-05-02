import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, CreditCard, FileText, GraduationCap, Users
} from 'lucide-react';

import { dashboardService } from '../services/dashboardService';
import StatCardMini from './components/StatCardMini';
import WeeklyAttendanceChart from './components/WeeklyAttendanceChart';
import FeeCollectionChart from './components/FeeCollectionChart';
import PerformanceChart from './components/PerformanceChart';
import EnrollmentChart from './components/EnrollmentChart';
import SmartInsightsWidget from './components/SmartInsightsWidget';
import ClockInOutWidget from '../modules/hr/attendance/components/ClockInOutWidget';
import { RecentActivity, QuickActions, UpcomingEvents, ResourceUsage } from './components/DashboardWidgets';
import DashboardLayout from './DashboardLayout';
import './dashboard.css';

const FeesCollectionTab = lazy(() => import('./tabs/FeesCollectionTab'));
const PayablesFinanceTab = lazy(() => import('./tabs/PayablesFinanceTab'));
const ExaminationsTab = lazy(() => import('./tabs/ExaminationsTab'));
const HRPayrollTab = lazy(() => import('./tabs/HRPayrollTab'));

const DashboardHome = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'fees', label: 'Fees & Collection', icon: CreditCard },
        { key: 'payables', label: 'Payables & Finance', icon: FileText },
        { key: 'examinations', label: 'Examinations', icon: GraduationCap },
        { key: 'hr', label: 'HR & Payroll', icon: Users },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardService.getStats();
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 } // Faster stagger for more items
        }
    };

    // Get user display name from API response
    const getUserDisplayName = () => {
        if (!data?.user) return 'User';
        const { first_name, last_name, username } = data.user;
        if (first_name || last_name) {
            return `${first_name || ''} ${last_name || ''}`.trim();
        }
        return username || 'User';
    };

    return (
        <DashboardLayout title="Dashboard">
            <div className="dashboard-home">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>Welcome back, {getUserDisplayName()}!</h1>
                    <p>Here's what's happening at your school today.</p>
                </div>

                {/* Tab Navigation */}
                <div className="dashboard-tabs">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                className={`dashboard-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && data && (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={containerVariants}
                        className="dashboard-content"
                    >
                        <div className="mb-4" data-tour="dashboard-clock-widget">
                            <div className="chart-container-compact" style={{ minHeight: '260px' }}>
                                <div className="chart-header-compact">
                                    <h3>My Attendance Clock</h3>
                                    <p>Clock in or out directly from your dashboard.</p>
                                </div>
                                <ClockInOutWidget compact={true} />
                            </div>
                        </div>

                        {/* Compact Stats Grid - More stats in less space */}
                        <div className="stats-grid-dense p-5">
                            {/* Primary Stats - First 4 important ones */}
                            {data.stats.slice(0, 4).map((stat, index) => (
                                <StatCardMini key={index} {...stat} />
                            ))}

                            {/* Secondary Stats - Next 4 in smaller format */}
                            {data.stats.slice(4, 8).map((stat, index) => (
                                <StatCardMini
                                    key={index + 4}
                                    {...stat}
                                    variant="secondary"
                                />
                            ))}
                        </div>

                        {/* Optional: Scrollable stats for even more metrics */}
                        {data.stats.length > 8 && (
                            <div className="stats-section">
                                <h3 className="section-title">Additional Metrics</h3>
                                <div className="stats-scrollable">
                                    {data.stats.slice(8).map((stat, index) => (
                                        <StatCardMini
                                            key={index + 8}
                                            {...stat}
                                            variant="compact"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main Charts Grid - 3 columns for more graphs */}
                        <div className="charts-grid-3col">
                            {/* Chart 1 - Full height */}
                            <div className="chart-container-compact">
                                <div className="chart-header-compact">
                                    <h3>Weekly Attendance</h3>
                                    <p>Last 7 days attendance rate</p>
                                </div>
                                <WeeklyAttendanceChart
                                    data={data.charts.weekly_attendance}
                                    compact={true}
                                />
                            </div>

                            {/* Chart 2 */}
                            <div className="chart-container-compact">
                                <div className="chart-header-compact">
                                    <h3>Fee Collection</h3>
                                    <p>Current term fee collection</p>
                                </div>
                                <FeeCollectionChart
                                    data={data.charts.fee_collection}
                                    currentTerm={data.charts.current_term}
                                    compact={true}
                                />
                            </div>

                            {/* Chart 3 - New Chart */}
                            <div className="chart-container-compact">
                                <div className="chart-header-compact">
                                    <h3>Student Performance</h3>
                                    <p>Average scores by subject</p>
                                </div>
                                <PerformanceChart
                                    data={data.charts.performance}
                                    compact={true}
                                />
                            </div>
                        </div>

                        {/* Second Row of Charts */}
                        <div className="charts-grid-3col" style={{ marginTop: '1rem' }}>
                            {/* Chart 4 - New Chart */}
                            <div className="chart-container-compact">
                                <div className="chart-header-compact">
                                    <h3>Enrollment Trends</h3>
                                    <p>Monthly new enrollments</p>
                                </div>
                                <EnrollmentChart
                                    data={data.charts.enrollment}
                                    compact={true}
                                />
                            </div>

                            {/* Chart 5 - Quick Actions in chart-like container */}
                            <div className="chart-container-compact">
                                <div className="chart-header-compact">
                                    <h3>Quick Actions</h3>
                                    <p>Frequently used operations</p>
                                </div>
                                <QuickActions compact={true} />
                            </div>

                            {/* Chart 6 - Resource Usage */}
                            <div className="chart-container-compact">
                                <div className="chart-header-compact">
                                    <h3>Resource Usage</h3>
                                    <p>System resource utilization</p>
                                </div>
                                <ResourceUsage data={data.resource_usage} />
                            </div>
                        </div>

                        {/* Smart Insights Row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            {/* Smart Insights Widget */}
                            <div className="widget-compact" style={{ minHeight: '400px' }}>
                                <SmartInsightsWidget />
                            </div>

                            {/* Recent Activities */}
                            <div className="widget-compact">
                                <div className="widget-header-compact">
                                    <h3>Recent Activity</h3>
                                    <p>Latest system activities</p>
                                </div>
                                <div className="widget-content-compact">
                                    <RecentActivity
                                        activities={data.recent_activity}
                                        compact={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Widgets Row - Side by side */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            {/* Upcoming Events - Wider */}
                            <div className="widget-compact">
                                <div className="widget-header-compact">
                                    <h3>Upcoming Events</h3>
                                    <p>Next 7 days schedule</p>
                                </div>
                                <div className="widget-content-compact">
                                    <UpcomingEvents
                                        events={data.upcoming_events}
                                        compact={true}
                                    />
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="widget-compact">
                                <div className="widget-header-compact">
                                    <h3>Quick Links</h3>
                                    <p>Frequently used</p>
                                </div>
                                <div className="widget-content-compact">
                                    <QuickActions compact={true} />
                                </div>
                            </div>
                        </div>

                    </motion.div>
                )}

                {activeTab !== 'overview' && (
                    <Suspense fallback={
                        <div className="dashboard-tab-loading">
                            <div className="spinner" />
                            <p>Loading...</p>
                        </div>
                    }>
                        {activeTab === 'fees' && <FeesCollectionTab />}
                        {activeTab === 'payables' && <PayablesFinanceTab />}
                        {activeTab === 'examinations' && <ExaminationsTab />}
                        {activeTab === 'hr' && <HRPayrollTab />}
                    </Suspense>
                )}

                {/* Additional inline styles */}
                <style>{`
                    .dashboard-header {
                        margin-bottom: 1.5rem;
                        padding: 0 1rem;
                    }
                    
                    .dashboard-header h1 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--text-main);
                        margin-bottom: 0.25rem;
                    }
                    
                    .dashboard-header p {
                        color: var(--text-secondary);
                        font-size: 0.9rem;
                    }

                    .dashboard-tabs {
                        display: flex;
                        gap: 0.25rem;
                        padding: 0 1rem;
                        margin-bottom: 1.25rem;
                        border-bottom: 2px solid var(--border-color, #e2e8f0);
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }

                    .dashboard-tab {
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                        padding: 0.6rem 1rem;
                        border: none;
                        background: none;
                        color: var(--text-secondary, #64748b);
                        font-size: 0.85rem;
                        font-weight: 600;
                        cursor: pointer;
                        border-bottom: 2px solid transparent;
                        margin-bottom: -2px;
                        white-space: nowrap;
                        transition: all 0.2s;
                        border-radius: 6px 6px 0 0;
                    }

                    .dashboard-tab:hover {
                        color: var(--text-main, #1e293b);
                        background: var(--bg-hover, #f1f5f9);
                    }

                    .dashboard-tab.active {
                        color: #2563eb;
                        border-bottom-color: #2563eb;
                        background: rgba(37, 99, 235, 0.05);
                    }

                    .dashboard-tab-loading {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 4rem 1rem;
                        color: var(--text-secondary, #64748b);
                    }

                    .dashboard-tab-loading .spinner {
                        width: 32px;
                        height: 32px;
                        border: 3px solid #e2e8f0;
                        border-top-color: #2563eb;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin-bottom: 0.75rem;
                    }

                    @keyframes spin { to { transform: rotate(360deg); } }
                    
                    .dashboard-content {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        padding: 0 1rem;
                    }
                    
                    .section-title {
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: var(--text-main);
                        margin-bottom: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .stats-section {
                        margin-bottom: 1rem;
                    }
                    
                    /* Responsive adjustments */
                    @media (max-width: 1200px) {
                        .charts-grid-3col {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .charts-grid-3col {
                            grid-template-columns: 1fr;
                        }
                        
                        .dashboard-content > div:last-child {
                            grid-template-columns: 1fr;
                        }
                        
                        .dashboard-header {
                            padding: 0 0.75rem;
                        }
                        
                        .dashboard-content {
                            padding: 0 0.75rem;
                        }
                    }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default DashboardHome;