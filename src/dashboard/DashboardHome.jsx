import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from './DashboardLayout';
import { dashboardService } from '../services/dashboardService';
import StatCard from './components/StatCard';
import WeeklyAttendanceChart from './components/WeeklyAttendanceChart';
import FeeCollectionChart from './components/FeeCollectionChart';
import { RecentActivity, QuickActions, UpcomingEvents } from './components/DashboardWidgets';

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
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <DashboardLayout title="Dashboard Overview">
            <div className="dashboard-home">
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',marginLeft: '2rem',marginRight: '2rem'   }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Welcome back, John!</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Here's what's happening at your school today.</p>
                </div>

                {data && (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={containerVariants}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        {/* Stats Grid (Row) */}
                        <div className="stats-grid">
                            {data.stats.map((stat, index) => (
                                <StatCard key={index} {...stat} />
                            ))}
                        </div>

                        {/* Main Content Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }} className="main-content-grid">

                            {/* Left Column (Charts & Actions) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                                <WeeklyAttendanceChart data={data.charts.weekly_attendance} />
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', flex: 1 }}>
                                    <FeeCollectionChart data={data.charts.fee_collection} />
                                    <QuickActions />
                                </div>
                            </div>

                            {/* Right Column (Widgets) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <RecentActivity activities={data.recent_activity} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <UpcomingEvents events={data.upcoming_events} />
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </div>

            {/* CSS for Responsive Grid */}
            <style>{`
                @media (max-width: 1200px) {
                    .main-content-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
};

export default DashboardHome;
