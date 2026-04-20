import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, ClipboardList, CreditCard, Calendar,
    TrendingUp, Bell, ChevronRight, Loader2, GraduationCap,
} from 'lucide-react';
import ParentLayout from '../../layouts/ParentLayout';
import { portalService } from '../student-portal/portalService';
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

const ParentDashboard = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [children, setChildren] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [profRes, statsRes, childRes, annRes] = await Promise.all([
                    portalService.getParentProfile().catch(() => null),
                    portalService.getParentDashboard().catch(() => null),
                    portalService.getChildren().catch(() => []),
                    portalService.getAnnouncements().catch(() => []),
                ]);
                setProfile(profRes);
                setStats(statsRes);
                setChildren(Array.isArray(childRes) ? childRes : []);
                setAnnouncements(Array.isArray(annRes) ? annRes.slice(0, 5) : []);
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const firstName = profile?.first_name || 'Parent';

    const quickStats = [
        { label: 'My Children', value: stats?.children_count ?? '—', icon: Users, lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
        { label: 'Avg. Performance', value: stats?.avg_performance ? `${stats.avg_performance}%` : '—', icon: TrendingUp, lightBg: 'bg-green-50', textColor: 'text-green-600' },
        { label: 'Total Fees Due', value: stats ? fmtCurrency(stats.total_fee_balance) : '—', icon: CreditCard, lightBg: 'bg-red-50', textColor: 'text-red-600' },
        { label: 'Announcements', value: stats?.recent_announcements ?? '0', icon: Bell, lightBg: 'bg-purple-50', textColor: 'text-purple-600' },
    ];

    if (loading) {
        return (
            <ParentLayout title="Dashboard">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            </ParentLayout>
        );
    }

    return (
        <ParentLayout title="Dashboard">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 p-1">
                {/* Welcome Banner */}
                <motion.div variants={itemVariants}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
                    <h2 className="text-2xl font-bold mb-1">Welcome, {firstName}! 👋</h2>
                    <p className="text-emerald-100 text-sm">Stay on top of your children's academic journey and financial obligations.</p>
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

                {/* Children Cards */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" /> My Children
                        </h3>
                        {children.length > 0 && (
                            <button onClick={() => navigate('/parent/children')}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                                View details <ChevronRight size={14} />
                            </button>
                        )}
                    </div>

                    {children.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {children.map(child => (
                                <div key={child.id}
                                    onClick={() => navigate(`/parent/children/${child.id}`)}
                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:shadow-md transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shrink-0">
                                        {child.full_name?.[0] || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{child.full_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {child.admission_number} • {child.current_grade_name || 'N/A'}
                                            {child.current_stream_name ? ` (${child.current_stream_name})` : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {child.fee_balance > 0 ? (
                                            <p className="text-xs font-semibold text-red-500">{fmtCurrency(child.fee_balance)}</p>
                                        ) : (
                                            <p className="text-xs font-semibold text-green-500">Paid up</p>
                                        )}
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <Users size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No children linked</p>
                            <p className="text-sm mt-1">Your children's profiles will appear here once linked by the school.</p>
                        </div>
                    )}
                </motion.div>

                {/* Announcements */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bell size={20} className="text-amber-500" /> Announcements
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
                            <p className="text-sm mt-1">Important school notices will be posted here.</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </ParentLayout>
    );
};

export default ParentDashboard;
