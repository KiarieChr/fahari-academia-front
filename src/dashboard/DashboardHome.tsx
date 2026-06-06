import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, CreditCard, FileText, GraduationCap, Users, 
    MapPin, Clock, DollarSign, ArrowUpRight, AlertTriangle, User,
    TrendingUp, ArrowRight, Settings2, Sparkles, UserCircle, ChevronRight,
    Wallet, AlertCircle
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import DashboardLayout from './DashboardLayout';
import ClockInOutWidget from '../modules/hr/attendance/components/ClockInOutWidget';
import AdminStatsGrid from './components/AdminStatsGrid';
import RecommendationsCard from './components/RecommendationsCard';
import DashboardCharts from './components/DashboardCharts';
import { usePermissions } from '../auth/PermissionProvider';
import { api } from '../services/api';
import './dashboard.css';

const DashboardHome = () => {
    const { user, isSuperuser } = usePermissions();
    const [activeTab, setActiveTab] = useState('Overview');
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [showPersonalTools, setShowPersonalTools] = useState(false);

    // Identify if user belongs to administration/management roles
    const adminRoles = ['admin', 'school_admin', 'director', 'principal', 'bursar', 'super_admin'];
    const adminGroups = ['Support Team', 'Administration', 'Management'];
    
    const isAdminView = adminRoles.includes(user?.role?.toLowerCase()) || 
                        user?.groups?.some(g => adminGroups.includes(g.name)) ||
                        isSuperuser;

    const fetchSummary = async () => {
        if (!user) return;
        setSummaryLoading(true);
        try {
            const data = await api.workforce.getMySummary();
            setSummary(data);
        } catch (error) {
            console.error("Failed to fetch dashboard summary", error);
        } finally {
            setSummaryLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, [user]);

    // Role-based tabs
    const allTabs = ['Overview', 'Fees & Collection', 'Payables & Finance', 'Examinations', 'HR & Payroll'];
    const tabs = isAdminView ? allTabs : ['Overview'];

    // --- Tab Components ---

    const OverviewTab = () => {
        const annualLeave = summary?.leave_balances?.find(b => b.leave_code === 'ANNUAL' || b.leave_type.includes('Annual')) || null;
        const nextHoliday = summary?.upcoming_holidays?.[0] || null;
        const workPolicy = summary?.work_policy || null;

        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tab-content-fade"
            >
                {/* 1. Institutional Stats (For Admins) */}
                {isAdminView && (
                    <div className="admin-overview-section mb-8">
                        <div className="section-header mb-4 flex justify-between items-end">
                            <div>
                                <h2 className="section-title-premium flex items-center gap-2">
                                    <Sparkles size={20} className="text-amber-500" />
                                    Institutional Overview
                                </h2>
                                <p className="section-subtitle">Key performance indicators across all departments</p>
                            </div>
                            
                            {/* Toggle for Admin's Personal Tools */}
                            <button 
                                onClick={() => setShowPersonalTools(!showPersonalTools)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    showPersonalTools 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <UserCircle size={18} />
                                {showPersonalTools ? 'Hide Personal View' : 'Show Personal View'}
                            </button>
                        </div>
                        
                        <AdminStatsGrid />

                        <DashboardCharts />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <RecommendationsCard />
                            </div>
                            <div className="ui-card">
                                <h3 className="card-title-sm mb-4">Quick Shortcuts</h3>
                                <div className="space-y-2">
                                    <button className="w-full p-3 text-left rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <Users size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Staff Directory</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400" />
                                    </button>
                                    <button className="w-full p-3 text-left rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <DollarSign size={18} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">Financial Reports</span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Personal Employee Tools (Clocking, Leave) */}
                {(!isAdminView || showPersonalTools) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="personal-tools-section"
                    >
                        <div className="section-header mb-4">
                            <h2 className="section-title-premium">My Attendance & HR</h2>
                            <p className="section-subtitle">Your personal work tools and balances</p>
                        </div>

                        <div className="overview-top-layout">
                            <div className="ui-card attendance-terminal-card">
                                <div className="card-header-flex">
                                    <div className="terminal-badge">
                                        <span className="badge-dot"></span>
                                        ATTENDANCE TERMINAL
                                    </div>
                                    <div className="terminal-date">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                </div>

                                <div className="attendance-body">
                                    <div className="location-info">
                                        <MapPin size={16} className="text-blue-500" />
                                        <span>Central Campus</span>
                                    </div>
                                    
                                    <div className="clock-display-wrap">
                                        <ClockInOutWidget compact={true} onClockUpdate={fetchSummary} />
                                    </div>
                                </div>
                            </div>

                            <div className="insights-grid">
                                {/* Annual Leave Card */}
                                <div className="insight-card-premium leave-insight">
                                    <div className="insight-header">
                                        <div className="insight-icon-wrap">
                                            <Clock size={18} />
                                        </div>
                                        <span className="insight-label">Annual Leave</span>
                                    </div>
                                    <div className="insight-content">
                                        {summaryLoading ? (
                                            <div className="skeleton-line w-full h-8 mb-2" />
                                        ) : annualLeave ? (
                                            <>
                                                <div className="insight-value-wrap">
                                                    <span className="insight-value">{annualLeave.remaining}</span>
                                                    <span className="insight-unit">Days Left</span>
                                                </div>
                                                <div className="insight-progress-bar">
                                                    <div 
                                                        className="progress-fill" 
                                                        style={{ width: `${(annualLeave.remaining / annualLeave.total_entitlement) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="insight-footer-text">
                                                    {annualLeave.taken} days taken this year
                                                </div>
                                            </>
                                        ) : (
                                            <div className="insight-empty">No leave data</div>
                                        )}
                                    </div>
                                </div>

                                {/* Holiday Card */}
                                <div className="insight-card-premium holiday-insight">
                                    <div className="insight-header">
                                        <div className="insight-icon-wrap">
                                            <GraduationCap size={18} />
                                        </div>
                                        <span className="insight-label">Upcoming Holiday</span>
                                    </div>
                                    <div className="insight-content">
                                        {summaryLoading ? (
                                            <div className="skeleton-line w-full h-8" />
                                        ) : nextHoliday ? (
                                            <>
                                                <div className="holiday-name">{nextHoliday.name}</div>
                                                <div className="holiday-date">
                                                    {new Date(nextHoliday.date_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                                                </div>
                                                {nextHoliday.is_today && (
                                                    <div className="holiday-badge-today">Active Today</div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="insight-empty">No upcoming holidays</div>
                                        )}
                                    </div>
                                </div>

                                {/* Policy/Weekend Card */}
                                <div className="insight-card-premium policy-insight">
                                    <div className="insight-header">
                                        <div className="insight-icon-wrap">
                                            <LayoutDashboard size={18} />
                                        </div>
                                        <span className="insight-label">Weekend Status</span>
                                    </div>
                                    <div className="insight-content">
                                        {summaryLoading ? (
                                            <div className="skeleton-line w-full h-8" />
                                        ) : workPolicy ? (
                                            <>
                                                <div className={`policy-status-badge ${workPolicy.is_weekend_worker ? 'working' : 'off'}`}>
                                                    {workPolicy.next_weekend_status}
                                                </div>
                                                <div className="policy-multiplier">
                                                    <ArrowUpRight size={12} />
                                                    Weekend Pay: {workPolicy.weekend_multiplier}x
                                                </div>
                                            </>
                                        ) : (
                                            <div className="insight-empty">No policy assigned</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        );
    };

    const FeesTab = () => {
        const stats = [
            { label: 'Total Billed', value: 'KSh 24K', icon: DollarSign, color: '#e3f2fd', iconColor: '#1976d2' },
            { label: 'Collected', value: 'KSh 16K', icon: ArrowUpRight, color: '#e8f5e9', iconColor: '#2e7d32', trend: '64.6% rate', trendColor: 'trend-up' },
            { label: 'Outstanding', value: 'KSh 9K', icon: FileText, color: '#fff3e0', iconColor: '#ef6c00' },
            { label: 'Defaulters', value: '3', icon: AlertTriangle, color: '#ffebee', iconColor: '#d32f2f', trend: 'KSh 17K total', trendColor: 'trend-down' },
            { label: 'Receipts Today', value: '0', icon: Clock, color: '#f3e5f5', iconColor: '#7b1fa2' },
            { label: 'Receipts Term', value: '0', icon: TrendingUp, color: '#e0f2f1', iconColor: '#00796b' },
            { label: 'Invoicing Rate', value: '38%', icon: User, color: '#eceff1', iconColor: '#455a64', trend: '3/8 students' },
            { label: 'Avg Arrears', value: 'KSh 4K', icon: DollarSign, color: '#f1f8e9', iconColor: '#689f38' },
        ];

        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tab-content-fade"
            >
                <div className="stat-grid-hd">
                    {stats.map((stat, i) => (
                        <div key={i} className="mini-stat-card-premium">
                            <div className="card-top">
                                <div className="stat-icon-glow" style={{ '--icon-color': stat.iconColor, '--icon-bg': stat.color }}>
                                    <stat.icon size={16} />
                                </div>
                                <span className="stat-label-modern">{stat.label}</span>
                            </div>
                            
                            <div className="card-bottom">
                                <div className="stat-value-large">{stat.value}</div>
                                {stat.trend && (
                                    <div className={`stat-trend-badge ${stat.trendColor || ''}`}>
                                        {stat.trend}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="two-col-grid">
                    <div className="ui-card">
                        <div className="card-header-between">
                            <h3 className="card-title-sm">Arrears by Class</h3>
                            <button className="view-all-link">View All <ArrowRight size={14} /></button>
                        </div>
                        <div className="card-placeholder-content">
                            {/* Chart or table would go here */}
                            <div className="empty-state-simple">Loading class data...</div>
                        </div>
                    </div>
                    <div className="ui-card">
                        <div className="card-header-between">
                            <h3 className="card-title-sm">Collection by Payment Method</h3>
                            <button className="view-all-link">View All <ArrowRight size={14} /></button>
                        </div>
                        <div className="card-placeholder-content">
                            <div className="empty-state-simple">Loading payment data...</div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const PayablesTab = () => {
        const [payablesData, setPayablesData] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchPayables = async () => {
                try {
                    const insights = await api.fees.getInsights();
                    const data = insights.data || insights;
                    setPayablesData(data.payables);
                } catch (error) {
                    console.error("Failed to fetch payables data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchPayables();
        }, []);

        const formatCurrency = (val) => {
            return new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                maximumFractionDigits: 0
            }).format(val || 0);
        };

        const agingData = [
            { range: '0-30 Days', amount: (payablesData?.due_within_7_days?.total || 0) * 1.5, color: '#3b82f6' },
            { range: '31-60 Days', amount: (payablesData?.overdue?.total || 0) * 0.4, color: '#f59e0b' },
            { range: '61-90 Days', amount: (payablesData?.overdue?.total || 0) * 0.3, color: '#ef4444' },
            { range: '90+ Days', amount: (payablesData?.overdue?.total || 0) * 0.3, color: '#991b1b' },
        ];

        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tab-content-fade"
            >
                {/* 1. Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="ui-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Wallet size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {formatCurrency((payablesData?.due_within_7_days?.total || 0) + (payablesData?.overdue?.total || 0))}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">Combined balance across all suppliers</p>
                    </div>

                    <div className="ui-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <AlertCircle size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Amount</span>
                        </div>
                        <h3 className="text-2xl font-bold text-rose-600">
                            {formatCurrency(payablesData?.overdue?.total || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">{payablesData?.overdue?.count || 0} invoices are past due date</p>
                    </div>

                    <div className="ui-card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <Clock size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Next 7 Days</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {formatCurrency(payablesData?.due_within_7_days?.total || 0)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2">Scheduled payments for this week</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2. Aging Chart */}
                    <div className="lg:col-span-2 ui-card bg-white p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Payables Aging Analysis</h3>
                                <p className="text-xs text-slate-400">Debt distribution by maturity</p>
                            </div>
                        </div>
                        
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={agingData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="range" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                                        {agingData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Top Suppliers */}
                    <div className="ui-card bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-6">Top Payables by Vendor</h3>
                        <div className="space-y-4">
                            {(payablesData?.top_suppliers?.length > 0 ? payablesData.top_suppliers : [
                                { name: 'No Suppliers Data', amount: 0, color: 'slate' }
                            ]).map((vendor, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg bg-${vendor.color}-50 text-${vendor.color}-600 flex items-center justify-center text-xs font-bold`}>
                                            {vendor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{vendor.name}</p>
                                            <p className="text-[10px] text-slate-400">Outstanding Balance</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-800">{formatCurrency(vendor.amount)}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                            Manage All Suppliers
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    const ExaminationsTab = () => {
        const [exams, setExams] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchExams = async () => {
                try {
                    const response = await api.examination.getExams({ limit: 5 });
                    setExams(response.results || response.data || response || []);
                } catch (error) {
                    console.error("Failed to fetch exams", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchExams();
        }, []);

        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tab-content-fade"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="ui-card">
                            <div className="card-header-between">
                                <h3 className="card-title-sm">Recent Examinations</h3>
                                <button className="view-all-link">Manage Exams <ArrowRight size={14} /></button>
                            </div>
                            <div className="mt-4 space-y-3">
                                {loading ? (
                                    <div className="p-4 text-center text-slate-500 text-sm font-medium">Loading exams...</div>
                                ) : exams.length > 0 ? (
                                    exams.slice(0, 5).map((exam, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">{exam.name || `${exam.subject?.name || 'Unknown'} - ${exam.assessment_type?.name || 'Exam'}`}</h4>
                                                <p className="text-xs text-slate-500">{exam.class_session?.grade?.name || 'General'} • {exam.date ? new Date(exam.date).toLocaleDateString() : 'No date'}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                exam.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                exam.status === 'MARKING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {exam.status || 'SCHEDULED'}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500 text-sm font-medium">No recent examinations found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="ui-card bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200">
                            <h3 className="text-lg font-bold mb-2">Results Compute</h3>
                            <p className="text-indigo-100 text-xs mb-4 leading-relaxed">
                                Ensure all marks are entered before computing final term rankings.
                            </p>
                            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                                Run Computations
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const HRTab = () => {
        const [payrollData, setPayrollData] = useState(null);
        const [hrStats, setHrStats] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const [payrollRes, statsRes] = await Promise.all([
                        api.workforce.getPayrollSummary().catch(() => null),
                        api.workforce.getStats().catch(() => null)
                    ]);
                    setPayrollData(payrollRes?.data || payrollRes);
                    setHrStats(statsRes?.data || statsRes);
                } catch (error) {
                    console.error("Failed to fetch HR data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, []);

        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tab-content-fade"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="ui-card">
                        <h3 className="card-title-sm mb-4">Payroll Status</h3>
                        {loading ? (
                            <div className="p-4 text-center text-slate-500 text-sm font-medium">Loading payroll data...</div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                                    <div>
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Current Month</p>
                                        <h4 className="text-lg font-bold text-slate-800">
                                            {payrollData?.period?.name || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) + ' Payroll'}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Status</p>
                                        <p className="text-sm font-bold text-blue-600">
                                            {payrollData?.period?.status ? payrollData.period.status.charAt(0).toUpperCase() + payrollData.period.status.slice(1) : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-500">Total Staff Processed</span>
                                        <span className="font-bold">{payrollData?.stats?.employees || hrStats?.total_employees || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-500">Gross Payroll</span>
                                        <span className="font-bold text-slate-800">
                                            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(payrollData?.stats?.gross || 0)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="ui-card">
                        <h3 className="card-title-sm mb-4">Workforce Overview</h3>
                        {loading ? (
                            <div className="p-4 text-center text-slate-500 text-sm font-medium">Loading workforce stats...</div>
                        ) : (
                            <>
                                <div className="p-4 border border-slate-100 rounded-xl mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700">Total Active Staff</span>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">{hrStats?.active_employees || hrStats?.total_employees || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-700">On Leave Today</span>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{hrStats?.on_leave || 0} Staff</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-4">
                                        <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, ((hrStats?.on_leave || 0) / (hrStats?.total_employees || 1)) * 100)}%` }} />
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
                                    Manage Employees
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <DashboardLayout>
            <div className="dashboard-page-container">
                {/* Unified Dashboard Header */}
                <header className="dashboard-header-premium">
                    <div className="header-main-content">
                        <div className="title-section">
                            <h1 className="dashboard-main-title">Fahari Analytics</h1>
                            <p className="dashboard-main-subtitle">
                                {isAdminView ? "Institutional performance & administrative insights" : "Real-time overview of your personal work performance"}
                            </p>
                        </div>
                        
                        <div className="header-actions">
                            <div className="last-sync">
                                <Clock size={14} />
                                <span>Updated just now</span>
                            </div>
                            {isAdminView && (
                                <button className="premium-action-btn bg-slate-900 text-white border-none hover:bg-slate-800">
                                    <Sparkles size={16} className="text-amber-400" />
                                    <span>AI Insights</span>
                                </button>
                            )}
                            <button className="premium-action-btn">
                                <FileText size={16} />
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Integrated Tab Navigation */}
                    <div className="dashboard-tabs-wrapper">
                        <div className="horizontal-tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    className={`h-tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="dashboard-view-content-modern">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Overview' && <OverviewTab key="overview" />}
                        {activeTab === 'Fees & Collection' && <FeesTab key="fees" />}
                        {activeTab === 'Payables & Finance' && <PayablesTab key="payables" />}
                        {activeTab === 'Examinations' && <ExaminationsTab key="exam" />}
                        {activeTab === 'HR & Payroll' && <HRTab key="hr" />}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .attendance-terminal-card {
                    max-width: 600px;
                    border: 1px solid #e2e8f0;
                    background: white;
                }
                .card-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .terminal-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #64748b;
                    letter-spacing: 0.05em;
                }
                .badge-dot {
                    width: 6px;
                    height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                }
                .terminal-date {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 600;
                }
                .location-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 500;
                    margin-bottom: 1.5rem;
                }
                .section-title-premium {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--navy-deep);
                    margin-bottom: 2px;
                }
                .section-subtitle {
                    font-size: 0.85rem;
                    color: #64748b;
                }
                .two-col-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }
                .card-header-between {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .card-title-sm {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--navy-deep);
                }
                .view-all-link {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--blue-accent);
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                .empty-state-simple {
                    padding: 3rem 1rem;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 0.85rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px dashed #e2e8f0;
                }
                .tab-content-fade {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default DashboardHome;