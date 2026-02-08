import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { dashboardService } from '../services/dashboardService';
import StatCard from './components/StatCard';
import StatCardMini from './components/StatCardMini'; // New component for mini cards
import WeeklyAttendanceChart from './components/WeeklyAttendanceChart';
import FeeCollectionChart from './components/FeeCollectionChart';
import PerformanceChart from './components/PerformanceChart'; // New chart component
import EnrollmentChart from './components/EnrollmentChart'; // New chart component
import { RecentActivity, QuickActions, UpcomingEvents, ResourceUsage } from './components/DashboardWidgets';
import DashboardLayout from './DashboardLayout';
import './dashboard.css'; 

const DashboardHome = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

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

    return (
        <DashboardLayout title="Dashboard">
            <div className="dashboard-home">
                {/* Header */}
                <div className="dashboard-header">
                    <h1>Welcome back, John!</h1>
                    <p>Here's what's happening at your school today.</p>
                </div>

                {data && (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={containerVariants}
                        className="dashboard-content"
                    >
                        {/* Compact Stats Grid - More stats in less space */}
                        <div className="stats-grid-dense">
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
                                    <p>Monthly fee collection trends</p>
                                </div>
                                <FeeCollectionChart 
                                    data={data.charts.fee_collection}
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

                        {/* Bottom Widgets Row - Side by side */}
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '2fr 1fr', 
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            {/* Recent Activities - Wider */}
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

                            {/* Upcoming Events - Narrower */}
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
                        </div>

                    </motion.div>
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