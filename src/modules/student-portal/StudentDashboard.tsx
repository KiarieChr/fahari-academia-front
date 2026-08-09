import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import {
    BookOpen, ClipboardList, CreditCard, Calendar,
    TrendingUp, Clock, Award, AlertCircle, Bell,
    ChevronRight, Loader2, Users, User, FileText
}
 from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [profileRes, statsRes, ttRes, annRes] = await Promise.all([
                    portalService.getProfile().catch(() => null),
                    portalService.getDashboardStats().catch(() => null),
                    portalService.getTimetable().catch(() => ({ lessons: [] })),
                    portalService.getAnnouncements().catch(() => []),
                ]);
                setProfile(profileRes);
                setStats(statsRes);
                setTimetable(ttRes?.lessons || []);
                setAnnouncements(Array.isArray(annRes) ? annRes.slice(0, 5) : []);
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const firstName = profile?.first_name || 'Student';

    const quickStats = [
        { label: 'My Subjects', value: stats?.subjects_count ?? '—', icon: BookOpen, lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
        { label: 'Avg. Score', value: stats?.avg_score ? `${stats.avg_score}%` : '—', icon: TrendingUp, lightBg: 'bg-green-50', textColor: 'text-green-600' },
        { label: 'Fee Balance', value: stats ? fmtCurrency(stats.fee_balance) : '—', icon: CreditCard, lightBg: 'bg-amber-50', textColor: 'text-amber-600' },
        { label: 'Attendance', value: stats?.attendance_rate ? `${stats.attendance_rate}%` : '—', icon: Clock, lightBg: 'bg-purple-50', textColor: 'text-purple-600' },
    ];

    const todayLessons = timetable.filter(l => {
        const today = new Date().toISOString().split('T')[0];
        return l.date === today;
    });

    if (loading) {
        return (
            <StudentLayout title="Dashboard">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout title="Dashboard">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 p-1">
                {/* Welcome Banner */}
                <motion.div variants={itemVariants}
                    className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg">
                    <h2 className="text-2xl font-bold mb-1">Welcome back, {firstName}! 👋</h2>
                    <p className="text-indigo-100 text-sm">
                        {profile?.current_grade_name && profile?.current_stream_name
                            ? `${profile.current_grade_name} — ${profile.current_stream_name}`
                            : 'Here\'s a quick look at your academic progress and activities.'}
                    </p>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {quickStats.map(stat => (
                        <motion.div key={stat.label} variants={itemVariants}
                            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="overflow-hidden pr-2">
                                    <p className="text-[11px] sm:text-xs font-medium text-gray-500 mb-1 truncate">{stat.label}</p>
                                    <p className="text-[17px] sm:text-2xl font-bold text-gray-900 leading-tight truncate">{stat.value}</p>
                                </div>
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.lightBg} rounded-xl flex items-center justify-center shrink-0`}>
                                    <stat.icon size={18} className={stat.textColor} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Schedule */}
                    <motion.div variants={itemVariants}
                        className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Calendar size={20} className="text-indigo-500" />
                                Today's Schedule
                            </h3>
                            <button onClick={() => navigate('/student/classes/timetable')}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                                View full timetable <ChevronRight size={14} />
                            </button>
                        </div>
                        {todayLessons.length > 0 ? (
                            <div className="space-y-2">
                                {todayLessons.map(lesson => (
                                    <div key={lesson.id}
                                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="text-center min-w-[56px]">
                                            <p className="text-xs font-bold text-indigo-600">
                                                {lesson.scheduled_start_time?.slice(0, 5)}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {lesson.scheduled_end_time?.slice(0, 5)}
                                            </p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-900 truncate">{lesson.subject_name || 'TBA'}</p>
                                            <p className="text-xs text-gray-500">{lesson.teacher_name || ''} {lesson.room_name ? `• ${lesson.room_name}` : ''}</p>
                                        </div>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                            lesson.status === 'executed' ? 'bg-green-100 text-green-700' :
                                            lesson.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>{lesson.status}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <Clock size={40} className="mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No classes scheduled today</p>
                                <p className="text-sm mt-1">Your timetable will appear here once set up.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Announcements */}
                    <motion.div variants={itemVariants}
                        className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Bell size={20} className="text-amber-500" />
                            Announcements
                        </h3>
                        {announcements.length > 0 ? (
                            <div className="space-y-3">
                                {announcements.map(a => (
                                    <div key={a.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.summary}</p>
                                        <span className="text-[10px] text-gray-400 mt-1 block">
                                            {a.posted_as} • {new Date(a.upload_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p className="font-medium">No announcements</p>
                                <p className="text-sm mt-1">School announcements will appear here.</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Quick Links */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Fee Statement', path: '/student/fees/statement', icon: CreditCard, color: 'bg-emerald-50 text-emerald-600' },
                            { label: 'My Results', path: '/student/results/reports', icon: Award, color: 'bg-purple-50 text-purple-600' },
                            { label: 'Timetable', path: '/student/classes/timetable', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
                            { label: 'My Profile', path: '/student/profile', icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
                        ].map(link => (
                            <motion.button key={link.path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => navigate(link.path)}
                                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-all text-left">
                                <div className={`w-9 h-9 rounded-lg ${link.color} flex items-center justify-center`}>
                                    <link.icon size={18} />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{link.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
};

export default StudentDashboard;
