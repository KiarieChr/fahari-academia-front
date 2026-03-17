import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import {
    Plus, Calendar, FileText, Clock, BarChart3,
    BookOpen, Home, ChevronRight, Download,
    Play, CheckCircle, AlertTriangle, Users,
    Zap, ArrowRight, Activity, Bell, RefreshCcw, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

import SessionStats from './components/SessionStats';
import SessionsList from './components/SessionsList';
import StartSessionModal from './components/StartSessionModal';
import AttendancePanel from './components/AttendancePanel';
import LessonCoverage from './components/LessonCoverage';
import TeacherPerformance from './components/TeacherPerformance';
import SessionHistory from './components/SessionHistory';
import NotificationsPanel from './components/NotificationsPanel';
import SessionReportsModal from './components/modals/SessionReportsModal';
import ViewTimetableModal from './components/modals/ViewTimetableModal';

import TimetableTab from './tabs/TimetableTab';

import useClassSessionsData from './hooks/useClassSessionsData';

// ─── Status helpers ─────────────────────────────────────────────
const PLANNED_STATUS_MAP = {
    pending: { label: 'Upcoming', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' },
    executed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    missed: { label: 'Missed', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
    holiday: { label: 'Holiday', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-400' },
};
const SESSION_STATUS_MAP = {
    ongoing: { label: 'Ongoing', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500 animate-pulse' },
    completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
    missed: { label: 'Missed', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' },
};

/* ─── Today's Operational Sessions Panel ───────────────────────── */
const TodaysSessionsPanel = ({ todayPlanned = [], todaySessions = [], loading = false, onStartSession }) => {
    const now = new Date();

    // Build a map: plannedLessonId → LessonSession
    const sessionByPlanned = useMemo(() => {
        const map = {};
        todaySessions.forEach((s) => {
            if (s.planned_lesson) map[s.planned_lesson] = s;
        });
        return map;
    }, [todaySessions]);

    // Group planned lessons by scheduled_start_time
    const timeSlotGroups = useMemo(() => {
        const groups = {};
        todayPlanned.forEach((pl) => {
            const key = pl.scheduled_start_time ?? '00:00';
            if (!groups[key]) groups[key] = { start: pl.scheduled_start_time, end: pl.scheduled_end_time, lessons: [] };
            groups[key].lessons.push(pl);
        });
        return Object.values(groups).sort((a, b) => (a.start < b.start ? -1 : 1));
    }, [todayPlanned]);

    // Progress counts
    const totalCount = todayPlanned.length;
    const doneCount = todayPlanned.filter((pl) => {
        const ls = sessionByPlanned[pl.id];
        return ls?.status === 'completed' || pl.status === 'executed';
    }).length;
    const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    // Time range utility for "is slot happening now"
    const slotTimeStatus = (start, end) => {
        if (!start || !end) return 'future';
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const curMin = now.getHours() * 60 + now.getMinutes();
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        if (curMin >= startMin && curMin < endMin) return 'now';
        if (curMin >= endMin) return 'past';
        return 'future';
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                        <Activity size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Today's Session Timeline</h3>
                        <p className="text-xs text-gray-400 font-medium">
                            {now.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!loading && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Live
                        </span>
                    )}
                    <button
                        onClick={onStartSession}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-150 active:scale-95 shadow-sm shadow-indigo-200"
                    >
                        <Plus size={13} /> New Session
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-indigo-500" />
                    <span className="ml-2 text-sm text-gray-400">Loading today's sessions…</span>
                </div>
            ) : timeSlotGroups.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <p className="text-sm text-gray-400">No lessons planned for today.</p>
                    <button onClick={onStartSession} className="mt-3 text-xs text-indigo-600 font-semibold hover:underline">Start an ad-hoc session</button>
                </div>
            ) : (
                /* Timeline slots */
                <div className="divide-y divide-gray-50">
                    {timeSlotGroups.map((slot, si) => {
                        const state = slotTimeStatus(slot.start, slot.end);
                        return (
                            <div
                                key={si}
                                className={`flex ${state === 'now' ? 'bg-indigo-50/40' : state === 'past' ? 'opacity-70' : ''}`}
                            >
                                {/* Time column */}
                                <div className={`flex-shrink-0 w-28 px-4 py-4 flex flex-col items-end justify-center border-r ${state === 'now' ? 'border-indigo-200' : 'border-gray-100'}`}>
                                    <span className={`text-xs font-bold tabular-nums ${state === 'now' ? 'text-indigo-600' : 'text-gray-500'}`}>
                                        {slot.start}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-medium">{slot.end}</span>
                                    {state === 'now' && (
                                        <span className="mt-1 text-[9px] font-bold text-indigo-600 uppercase tracking-wide">NOW</span>
                                    )}
                                </div>

                                {/* Sessions cards */}
                                <div className="flex-1 px-4 py-3 flex flex-wrap gap-2 items-center">
                                    {slot.lessons.map((pl) => {
                                        const ls = sessionByPlanned[pl.id];
                                        const statusKey = ls ? ls.status : pl.status;
                                        const badge = (ls ? SESSION_STATUS_MAP[ls.status] : PLANNED_STATUS_MAP[pl.status]) ?? PLANNED_STATUS_MAP.pending;
                                        const attendancePct = ls?.attendance_summary?.attendance_rate
                                            ? `${ls.attendance_summary.attendance_rate}%`
                                            : null;

                                        return (
                                            <div
                                                key={pl.id}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium ${statusKey === 'ongoing' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200'}`}
                                            >
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${badge.dot}`} />
                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-semibold text-gray-900">{pl.class_session_name}</span>
                                                    <span className="text-gray-500">{pl.subject_name} · {pl.expected_teacher_name}</span>
                                                </div>
                                                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${badge.bg} ${badge.text} border ${badge.border}`}>
                                                    {badge.label}
                                                </span>
                                                {attendancePct && (
                                                    <span className="text-[10px] text-gray-400 font-medium">{attendancePct}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer progress */}
            {!loading && totalCount > 0 && (
                <div className="px-6 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                            <span className="font-bold text-gray-800">{doneCount}</span> of {totalCount} sessions complete
                        </span>
                    </div>
                    <button className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline underline-offset-2">
                        View all <ArrowRight size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

/* ─── Main Dashboard ────────────────────────────────────────────── */
const ClassSessionsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isStartSessionOpen, setIsStartSessionOpen] = useState(false);
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);

    // ── Live data ─────────────────────────────────────────────────
    const {
        todayPlanned,
        todaySessions,
        analytics,
        classSessions,
        subjects,
        loading,
        refresh,
        startAdhocSession,
        startFromPlanned,
        completeSession,
        cancelSession,
    } = useClassSessionsData();

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'sessions', label: 'Daily Sessions', icon: Calendar },
        { id: 'timetable', label: 'Timetable', icon: Clock },
        { id: 'reports', label: 'Reports', icon: BarChart3 }
    ];

    const quickActions = [
        {
            label: 'Start Session',
            icon: Play,
            onClick: () => setIsStartSessionOpen(true),
            style: 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700',
            iconStyle: 'text-white',
        },
        {
            label: 'View Timetable',
            icon: Calendar,
            onClick: () => setIsTimetableModalOpen(true),
            style: 'bg-white border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100',
            iconStyle: 'text-indigo-600',
        },
        {
            label: 'Mark Attendance',
            icon: Users,
            onClick: () => setActiveTab('sessions'),
            style: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
            iconStyle: 'text-gray-500',
        },
        {
            label: 'Export Report',
            icon: Download,
            onClick: () => setIsReportsModalOpen(true),
            style: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
            iconStyle: 'text-gray-500',
        },
    ];

    // Analytics-derived summary metrics for the Reports tab
    const reportMetrics = analytics ? [
        { label: 'Total Sessions', value: analytics.planned_vs_actual?.total_planned ?? '—', sub: 'This term', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Avg Attendance', value: analytics.overall_attendance_rate != null ? `${analytics.overall_attendance_rate}%` : '—', sub: '↑ vs last term', color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Cancelled', value: analytics.planned_vs_actual?.cancelled ?? '—', sub: 'This term', color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Curriculum Cover', value: analytics.curriculum_completion != null ? `${analytics.curriculum_completion}%` : '—', sub: 'Completed', color: 'text-amber-600', bg: 'bg-amber-50' },
    ] : [
        { label: 'Total Sessions', value: '—', sub: 'Loading…', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Avg Attendance', value: '—', sub: '', color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Cancelled', value: '—', sub: '', color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Curriculum', value: '—', sub: '', color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <DashboardLayout title="Class Sessions">
            <div className="flex flex-col gap-5 px-1 py-2 pb-16 min-h-screen">

                {/* ── Page Header ───────────────────────────────────────── */}
                <div className="relative overflow-hidden flex flex-col md:flex-row justify-between
                                items-start md:items-center gap-6
                                bg-gradient-to-br from-white via-white to-indigo-50/40
                                border border-gray-100 rounded-2xl px-8 py-6
                                shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-indigo-400 rounded-l-2xl" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-60 pointer-events-none" />

                    {/* Left: icon + breadcrumb + title */}
                    <div className="flex items-start gap-4 relative">
                        <div className="flex-shrink-0 p-3 rounded-xl bg-indigo-600 shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
                            <BookOpen size={22} className="text-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <nav className="flex items-center gap-1.5 text-xs font-medium">
                                <Home size={11} className="text-gray-400" />
                                <ChevronRight size={10} className="text-gray-300" />
                                <span className="text-gray-400">Students</span>
                                <ChevronRight size={10} className="text-gray-300" />
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100">
                                    Class Sessions
                                </span>
                            </nav>
                            <div className="flex items-center gap-3 mt-0.5">
                                <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
                                    Class Sessions
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-[0.68rem] font-bold text-green-700 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Live
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">
                                Manage daily lessons, attendance, timetables &amp; session progress.
                            </p>
                        </div>
                    </div>

                    {/* Right: quick CTA buttons */}
                    <div className="flex items-center gap-2.5 flex-shrink-0 relative">
                        <button
                            onClick={refresh}
                            disabled={loading}
                            className="group inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 bg-white text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-150 active:scale-95 shadow-sm disabled:opacity-50"
                        >
                            <RefreshCcw size={15} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setIsReportsModalOpen(true)}
                            className="group inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 bg-white text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-150 active:scale-95 shadow-sm"
                        >
                            <Download size={15} />
                            Export
                        </button>
                        <button
                            onClick={() => setIsTimetableModalOpen(true)}
                            className="group inline-flex items-center gap-2 px-4 py-2.5 border border-indigo-200 text-indigo-700 bg-indigo-50 text-sm font-medium rounded-xl hover:bg-indigo-100 hover:border-indigo-300 transition-all duration-150 active:scale-95 shadow-sm"
                        >
                            <Calendar size={15} />
                            Timetable
                        </button>
                        <button
                            onClick={() => setIsStartSessionOpen(true)}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <Plus size={16} className="transition-transform duration-150 group-hover:rotate-90" />
                            Start Session
                        </button>
                    </div>
                </div>

                {/* ── Pill Tab Navigation ────────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                    <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto hide-scrollbar w-full md:w-auto">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={[
                                        'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                                        'whitespace-nowrap transition-all duration-200 select-none',
                                        isActive
                                            ? 'bg-white text-indigo-700 font-semibold shadow-sm shadow-gray-200 border border-gray-100'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-white/60',
                                    ].join(' ')}
                                >
                                    <tab.icon size={15} className={`transition-all duration-200 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    {tab.label}
                                    {isActive && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Tab Content ───────────────────────────────────────── */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                >
                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Quick Actions */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {quickActions.map((qa, i) => (
                                    <button
                                        key={i}
                                        onClick={qa.onClick}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 shadow-sm text-left ${qa.style}`}
                                    >
                                        <div className={`p-1.5 rounded-lg ${i === 0 ? 'bg-white/20' : 'bg-gray-100'}`}>
                                            <qa.icon size={16} className={qa.iconStyle} />
                                        </div>
                                        {qa.label}
                                    </button>
                                ))}
                            </div>

                            {/* Today's Sessions - LIVE */}
                            <TodaysSessionsPanel
                                todayPlanned={todayPlanned}
                                todaySessions={todaySessions}
                                loading={loading}
                                onStartSession={() => setIsStartSessionOpen(true)}
                            />

                            {/* Stats + Charts */}
                            <SessionStats analytics={analytics} />

                            {/* Detail panels */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-2 space-y-5">
                                    <AttendancePanel todaySessions={todaySessions} />
                                    <TeacherPerformance analytics={analytics} />
                                    <SessionHistory />
                                </div>
                                <div className="space-y-5">
                                    <NotificationsPanel todayPlanned={todayPlanned} />
                                    <LessonCoverage analytics={analytics} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── DAILY SESSIONS ── */}
                    {activeTab === 'sessions' && (
                        <>
                            <TodaysSessionsPanel
                                todayPlanned={todayPlanned}
                                todaySessions={todaySessions}
                                loading={loading}
                                onStartSession={() => setIsStartSessionOpen(true)}
                            />
                            <SessionStats analytics={analytics} />
                            <SessionsList todaySessions={todaySessions} onComplete={completeSession} onCancel={cancelSession} />
                        </>
                    )}

                    {/* ── TIMETABLE ── */}
                    {activeTab === 'timetable' && <TimetableTab />}

                    {/* ── REPORTS ── */}
                    {activeTab === 'reports' && (
                        <>
                            <div className="bg-white border border-gray-100 rounded-2xl px-8 py-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                                            <BarChart3 size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">Session Reports &amp; Analytics</h3>
                                            <p className="text-xs text-gray-400">Detailed breakdown for the current academic period</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsReportsModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                                    >
                                        <FileText size={14} /> Full Report
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {reportMetrics.map((m, i) => (
                                        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <div className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold mb-2 ${m.bg} ${m.color}`}>{m.label}</div>
                                            <p className={`text-2xl font-extrabold tabular-nums ${m.color}`}>{m.value}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{m.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <TeacherPerformance analytics={analytics} />
                                <LessonCoverage analytics={analytics} />
                            </div>
                            <SessionHistory />
                        </>
                    )}
                </motion.div>

                {/* ── Modals ────────────────────────────────────────────── */}
                <StartSessionModal
                    isOpen={isStartSessionOpen}
                    onClose={() => setIsStartSessionOpen(false)}
                    classSessions={classSessions}
                    subjects={subjects}
                    onStart={async (data) => {
                        await startAdhocSession(data);
                        setIsStartSessionOpen(false);
                    }}
                />
                <SessionReportsModal
                    isOpen={isReportsModalOpen}
                    onClose={() => setIsReportsModalOpen(false)}
                />
                <ViewTimetableModal
                    isOpen={isTimetableModalOpen}
                    onClose={() => setIsTimetableModalOpen(false)}
                />
            </div>
        </DashboardLayout>
    );
};

export default ClassSessionsDashboard;
