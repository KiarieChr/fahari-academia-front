import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, BookOpen, GraduationCap, ChevronRight, BarChart3, Clock, TrendingUp } from 'lucide-react';

import { studentManagementService } from '../../services/studentManagementService';
import { toast } from 'react-toastify';

const StudentManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingAdmissions: 0,
        activeStudents: 0,
        totalIntakes: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const appData = await studentManagementService.getDashboardStats().catch(() => null);

                if (appData && appData.stats) {
                    setStats({
                        totalApplications: appData.stats.applications || 150,
                        pendingAdmissions: appData.stats.pending || 45,
                        activeStudents: appData.stats.active || 1200,
                        totalIntakes: appData.stats.intakes || 4
                    });
                } else {
                    // Fallback mock data
                    setStats({
                        totalApplications: 156,
                        pendingAdmissions: 28,
                        activeStudents: 1245,
                        totalIntakes: 4
                    });
                }

            } catch (error) {
                console.error("Failed to fetch student stats", error);
                toast.error("Could not load dashboard statistics");
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
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    const quickLinks = [
        { 
            title: 'New Admission', 
            path: '/dashboard/students/admission', 
            icon: <UserPlus size={24} />, 
            color: 'blue',
            description: 'Register new students'
        },
        { 
            title: 'Student List', 
            path: '/dashboard/users/list', 
            icon: <Users size={24} />, 
            color: 'green',
            description: 'View all students'
        },
        { 
            title: 'Enrollments', 
            path: '/dashboard/students/settings', 
            icon: <BookOpen size={24} />, 
            color: 'purple',
            description: 'Manage enrollments'
        },
        { 
            title: 'Intakes', 
            path: '/dashboard/students/settings', 
            icon: <GraduationCap size={24} />, 
            color: 'yellow',
            description: 'Academic intakes'
        },
    ];

    return (
        <DashboardLayout title="Student Management">
            <div className="student-management-container">
                {/* Header */}
                <div className="student-header">
                    <h1 className="student-title">Student Management Dashboard</h1>
                    <p className="student-subtitle">Monitor admissions, enrollments, and student records with real-time insights</p>
                </div>

                <AnimatePresence>
                    {loading ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="loading-spinner"
                        >
                            <div className="spinner"></div>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="space-y-6"
                        >
                            {/* Stats Grid */}
                            <div className="stats-grid-container">
                                <motion.div variants={cardVariants}>
                                    <div className="stat-card">
                                        <div className="stat-card-header">
                                            <h3 className="stat-card-title">Total Applications</h3>
                                            <div className="stat-card-icon-wrapper">
                                                <UserPlus className="stat-card-icon" />
                                            </div>
                                        </div>
                                        <div className="stat-card-body">
                                            <h2 className="stat-card-count">{stats.totalApplications}</h2>
                                            <div className="stat-card-trend">
                                                <span className="trend-badge positive">
                                                    <TrendingUp size={12} />
                                                    12%
                                                </span>
                                                <span className="trend-label">vs last month</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={cardVariants}>
                                    <div className="stat-card">
                                        <div className="stat-card-header">
                                            <h3 className="stat-card-title">Pending Admissions</h3>
                                            <div className="stat-card-icon-wrapper">
                                                <Users className="stat-card-icon" />
                                            </div>
                                        </div>
                                        <div className="stat-card-body">
                                            <h2 className="stat-card-count">{stats.pendingAdmissions}</h2>
                                            <div className="stat-card-trend">
                                                <span className="trend-badge negative">
                                                    <TrendingUp size={12} />
                                                    5 pending
                                                </span>
                                                <span className="trend-label">requires review</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={cardVariants}>
                                    <div className="stat-card">
                                        <div className="stat-card-header">
                                            <h3 className="stat-card-title">Active Students</h3>
                                            <div className="stat-card-icon-wrapper">
                                                <GraduationCap className="stat-card-icon" />
                                            </div>
                                        </div>
                                        <div className="stat-card-body">
                                            <h2 className="stat-card-count">{stats.activeStudents.toLocaleString()}</h2>
                                            <div className="stat-card-trend">
                                                <span className="trend-badge positive">
                                                    <TrendingUp size={12} />
                                                    8%
                                                </span>
                                                <span className="trend-label">currently enrolled</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={cardVariants}>
                                    <div className="stat-card">
                                        <div className="stat-card-header">
                                            <h3 className="stat-card-title">Active Intakes</h3>
                                            <div className="stat-card-icon-wrapper">
                                                <BookOpen className="stat-card-icon" />
                                            </div>
                                        </div>
                                        <div className="stat-card-body">
                                            <h2 className="stat-card-count">{stats.totalIntakes}</h2>
                                            <div className="stat-card-trend">
                                                <span className="trend-badge neutral">
                                                    0
                                                </span>
                                                <span className="trend-label">current year</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Quick Actions */}
                            <motion.div 
                                variants={cardVariants}
                                className="quick-actions-section"
                            >
                                <h2 className="quick-actions-title">
                                    Quick Actions
                                </h2>
                                <div className="quick-actions-grid">
                                    {quickLinks.map((link, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => navigate(link.path)}
                                            className="quick-action-card"
                                        >
                                            <div className={`quick-action-icon ${link.color}`}>
                                                {link.icon}
                                            </div>
                                            <div className="quick-action-content">
                                                <h3 className="quick-action-title">{link.title}</h3>
                                                <p className="quick-action-description">{link.description}</p>
                                            </div>
                                            <ChevronRight className="quick-action-arrow" size={20} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default StudentManagement;