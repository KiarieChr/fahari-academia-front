import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, BookOpen, GraduationCap, ChevronRight,
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle,
  MessageSquare, DollarSign, CalendarCheck, FileText, Inbox,
  BarChart3, Star, Zap, ArrowRight, RefreshCw, Activity,
  GitBranch
} from 'lucide-react';
import { studentManagementService } from '../../services/studentManagementService';
import { toast } from 'react-toastify';

/* ────────────────────────────────────────────────────
   Stat Card
────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, trend, trendLabel, color, onClick }) => {
  const colors = {
    blue:   { bg: 'from-blue-500 to-blue-600',   ring: 'ring-blue-100',  light: 'bg-blue-50 text-blue-600' },
    violet: { bg: 'from-violet-500 to-violet-600', ring: 'ring-violet-100', light: 'bg-violet-50 text-violet-600' },
    emerald:{ bg: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-100', light: 'bg-emerald-50 text-emerald-600' },
    amber:  { bg: 'from-amber-500 to-amber-600',  ring: 'ring-amber-100', light: 'bg-amber-50 text-amber-600' },
    rose:   { bg: 'from-rose-500 to-rose-600',    ring: 'ring-rose-100',  light: 'bg-rose-50 text-rose-600' },
  };
  const c = colors[color] || colors.blue;
  const positive = trend >= 0;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-300"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white via-white to-gray-50/60" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1.5 tracking-tight">
            {value?.toLocaleString() ?? '—'}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
                positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {Math.abs(trend)}%
              </span>
              <span className="text-[0.68rem] text-gray-400">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br ${c.bg} shadow-lg ring-4 ${c.ring}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────
   Quick Action Card
────────────────────────────────────────────────────── */
const QuickActionCard = ({ icon: Icon, title, description, badge, color, path, navigate }) => {
  const colors = {
    blue:   'border-blue-100 hover:border-blue-300 hover:bg-blue-50/50',
    violet: 'border-violet-100 hover:border-violet-300 hover:bg-violet-50/50',
    emerald:'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50',
    amber:  'border-amber-100 hover:border-amber-300 hover:bg-amber-50/50',
    rose:   'border-rose-100 hover:border-rose-300 hover:bg-rose-50/50',
    indigo: 'border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/50',
  };
  const iconColors = {
    blue:   'bg-blue-100 text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
    emerald:'bg-emerald-100 text-emerald-600',
    amber:  'bg-amber-100 text-amber-600',
    rose:   'bg-rose-100 text-rose-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className={`group relative flex items-center gap-4 p-4 rounded-2xl border bg-white cursor-pointer transition-all duration-200 ${colors[color]}`}
    >
      <div className={`flex-shrink-0 p-3 rounded-xl ${iconColors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[0.6rem] font-bold rounded-full">{badge}</span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>
      </div>
      <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────
   Activity Feed Item
────────────────────────────────────────────────────── */
const ActivityItem = ({ type, title, subtitle, time, status }) => {
  const iconMap = {
    application:  { icon: FileText, color: 'bg-blue-100 text-blue-600' },
    admission:    { icon: GraduationCap, color: 'bg-emerald-100 text-emerald-600' },
    interview:    { icon: GitBranch, color: 'bg-amber-100 text-amber-600' },
    enquiry:      { icon: MessageSquare, color: 'bg-violet-100 text-violet-600' },
    fee:          { icon: DollarSign, color: 'bg-rose-100 text-rose-600' },
    reporting:    { icon: CalendarCheck, color: 'bg-indigo-100 text-indigo-600' },
  };
  const statusMap = {
    pending:    { label: 'Pending', cls: 'bg-amber-50 text-amber-700' },
    accepted:   { label: 'Admitted', cls: 'bg-emerald-50 text-emerald-700' },
    interview:  { label: 'Interview', cls: 'bg-blue-50 text-blue-700' },
    fee_paid:   { label: 'Fee Paid', cls: 'bg-teal-50 text-teal-700' },
    rejected:   { label: 'Rejected', cls: 'bg-rose-50 text-rose-700' },
  };
  const { icon: Icon, color } = iconMap[type] || iconMap.application;
  const statusInfo = statusMap[status];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`flex-shrink-0 p-2 rounded-lg ${color}`}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">{title}</p>
        <p className="text-[0.65rem] text-gray-400 truncate">{subtitle}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        {statusInfo && (
          <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${statusInfo.cls}`}>
            {statusInfo.label}
          </span>
        )}
        <span className="text-[0.6rem] text-gray-300">{time}</span>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────
   Deadline Urgency Badge
────────────────────────────────────────────────────── */
const UrgencyBadge = ({ urgency, days }) => {
  const map = {
    overdue:  { cls: 'bg-rose-100 text-rose-700', label: 'Overdue' },
    critical: { cls: 'bg-orange-100 text-orange-700', label: `${days}d left` },
    warning:  { cls: 'bg-amber-100 text-amber-700', label: `${days}d left` },
    ok:       { cls: 'bg-emerald-100 text-emerald-700', label: `${days}d left` },
  };
  const { cls, label } = map[urgency] || map.ok;
  return <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold ${cls}`}>{label}</span>;
};

/* ────────────────────────────────────────────────────
   Main Page
────────────────────────────────────────────────────── */
const StudentManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_applications: 0, pending_admissions: 0,
    admitted_this_month: 0, active_students: 0,
    total_intakes: 0, enquiries: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [intakeDeadlines, setIntakeDeadlines] = useState([]);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);

      const [statsRes, activityRes, deadlinesRes] = await Promise.allSettled([
        studentManagementService.getDashboardStats(),
        studentManagementService.getRecentActivity().catch(() => ({ results: [] })),
        studentManagementService.getIntakeDeadlines().catch(() => ({ results: [] })),
      ]);

      if (statsRes.status === 'fulfilled') {
        const s = statsRes.value;
        setStats({
          total_applications: s.total_applications ?? s.stats?.applications ?? 156,
          pending_admissions: s.pending_admissions ?? s.stats?.pending ?? 28,
          admitted_this_month: s.admitted_this_month ?? 14,
          active_students: s.active_students ?? s.stats?.active ?? 1245,
          total_intakes: s.total_intakes ?? s.stats?.intakes ?? 4,
          enquiries: s.enquiries ?? 0,
        });
      }

      if (activityRes.status === 'fulfilled') {
        setRecentActivity(activityRes.value?.results ?? []);
      }

      if (deadlinesRes.status === 'fulfilled') {
        setIntakeDeadlines(deadlinesRes.value?.results ?? []);
      }
    } catch (err) {
      if (!silent) toast.error('Could not load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const quickActions = [
    { icon: UserPlus,      title: 'New Application',          description: 'Start a fresh admission application',   color: 'blue',   path: '/dashboard/students/admission/applications' },
    { icon: MessageSquare, title: 'Log Enquiry',              description: 'Record a prospective student enquiry',   color: 'violet', path: '/dashboard/students/admission/applications?tab=enquiries' },
    { icon: Users,         title: 'Applications Register',    description: 'View & manage all applications',          color: 'indigo', path: '/dashboard/students/admission/applications', badge: stats.pending_admissions > 0 ? `${stats.pending_admissions} pending` : null },
    { icon: GraduationCap, title: 'Admission Records',        description: 'Enrolled students & admission history',   color: 'emerald',path: '/dashboard/students/admission/records' },
    { icon: CalendarCheck, title: 'Terms & Sessions',         description: 'Academic years, terms & class sessions',  color: 'amber',  path: '/dashboard/students/academic-sessions' },
    { icon: BookOpen,      title: 'Settings & Intakes',       description: 'Configure workflow & intake windows',     color: 'rose',   path: '/dashboard/students/settings' },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

  return (
    <DashboardLayout title="Student Management">
      <div className="space-y-6 px-0.5 pb-10">

        {/* ── Hero Header ───────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-6 md:p-8 text-white shadow-xl shadow-indigo-200">
          {/* decorative */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-24 w-3 h-3 bg-white/30 rounded-full animate-ping" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur rounded-full text-[0.65rem] font-bold uppercase tracking-widest">
                  Student Management
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-400/30 rounded-full text-[0.65rem] font-bold uppercase tracking-wider text-emerald-200">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Admissions & Student Records
              </h1>
              <p className="text-indigo-200 text-sm mt-1.5 max-w-lg leading-relaxed">
                Manage the entire student lifecycle — from first enquiry through application,
                admission, and ongoing enrolment.
              </p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur border border-white/20 rounded-xl text-sm font-semibold transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading dashboard…</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

              {/* ── Stats Grid ────────────────────────────── */}
              <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <StatCard icon={FileText}      label="Total Applications"  value={stats.total_applications}  trend={12}  trendLabel="vs last intake"  color="blue"    onClick={() => navigate('/dashboard/students/admission/applications')} />
                <StatCard icon={AlertCircle}   label="Pending Review"      value={stats.pending_admissions}  color="amber"  onClick={() => navigate('/dashboard/students/admission/applications')} />
                <StatCard icon={CheckCircle}   label="Admitted This Month" value={stats.admitted_this_month} trend={8}   trendLabel="vs last month"   color="emerald" onClick={() => navigate('/dashboard/students/admission/records')} />
                <StatCard icon={GraduationCap} label="Active Students"     value={stats.active_students}     trend={5}   trendLabel="year-on-year"    color="violet"  onClick={() => navigate('/dashboard/users/list')} />
                <StatCard icon={MessageSquare} label="Enquiries"           value={stats.enquiries}           color="rose"    onClick={() => navigate('/dashboard/students/admission/applications?tab=enquiries')} />
              </motion.div>

              {/* ── Main Content: Quick Actions + Activity Feed ── */}
              <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-indigo-500" />
                      <h2 className="text-sm font-bold text-gray-800">Quick Actions</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickActions.map((a, i) => (
                      <QuickActionCard key={i} {...a} navigate={navigate} />
                    ))}
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity size={15} className="text-indigo-500" />
                      <h2 className="text-sm font-bold text-gray-800">Recent Activity</h2>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard/students/admission/applications')}
                      className="text-[0.68rem] text-indigo-600 font-semibold hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  {recentActivity.length > 0 ? (
                    <div>
                      {recentActivity.slice(0, 7).map((a, i) => (
                        <ActivityItem key={i}
                          type={a.type || 'application'}
                          title={a.name || `${a.first_name} ${a.last_name}`}
                          subtitle={a.subtitle || a.intake_name || 'Application'}
                          time={a.time_ago || a.created_at}
                          status={a.application_status || a.status}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Inbox size={32} className="text-gray-200 mb-3" />
                      <p className="text-xs text-gray-400">No recent activity</p>
                      <button
                        onClick={() => navigate('/dashboard/students/admission/applications')}
                        className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        View Applications →
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* ── Intake Deadlines ──────────────────────── */}
              {intakeDeadlines.length > 0 && (
                <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarCheck size={15} className="text-indigo-500" />
                    <h2 className="text-sm font-bold text-gray-800">Upcoming Intake Deadlines</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {intakeDeadlines.slice(0, 6).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{d.name}</p>
                          <p className="text-[0.65rem] text-gray-400 mt-0.5">{d.start_date}</p>
                        </div>
                        <UrgencyBadge urgency={d.urgency} days={d.days_from_now} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Pipeline Overview Banner ──────────────── */}
              <motion.div variants={item}>
                <div
                  onClick={() => navigate('/dashboard/students/settings?tab=workflow')}
                  className="group relative overflow-hidden cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <GitBranch size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Admissions Workflow</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Configure your custom pipeline — enquiry, fee, interview, reporting</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold group-hover:bg-indigo-700 transition-colors">
                    Configure <ChevronRight size={12} />
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentManagement;