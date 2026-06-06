import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Users, CheckCircle, XCircle, Clock, AlertCircle,
    Save, Loader2, ChevronDown, Lock, RefreshCcw,
    Search, UserCheck, Calendar, BarChart2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../../services/api';

// ─── Constants ───────────────────────────────────────────────────
const STATUSES = ['present', 'absent', 'late', 'excused'];

const STATUS_CONFIG = {
    present: {
        label: 'Present',
        short: 'P',
        icon: CheckCircle,
        active: 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400',
        inactive: 'text-gray-300 hover:bg-emerald-50 hover:text-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    absent: {
        label: 'Absent',
        short: 'A',
        icon: XCircle,
        active: 'bg-red-100 text-red-700 ring-2 ring-red-400',
        inactive: 'text-gray-300 hover:bg-red-50 hover:text-red-500',
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
    },
    late: {
        label: 'Late',
        short: 'L',
        icon: Clock,
        active: 'bg-amber-100 text-amber-700 ring-2 ring-amber-400',
        inactive: 'text-gray-300 hover:bg-amber-50 hover:text-amber-500',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
    },
    excused: {
        label: 'Excused',
        short: 'E',
        icon: AlertCircle,
        active: 'bg-blue-100 text-blue-700 ring-2 ring-blue-400',
        inactive: 'text-gray-300 hover:bg-blue-50 hover:text-blue-500',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-400',
    },
};

// ─── Summary bar ─────────────────────────────────────────────────
const AttendanceSummary = ({ records, isLocked }) => {
    const counts = useMemo(() => {
        const c = { present: 0, absent: 0, late: 0, excused: 0, total: records.length };
        records.forEach(r => { c[r.status] = (c[r.status] || 0) + 1; });
        return c;
    }, [records]);

    const pct = counts.total > 0
        ? Math.round(((counts.present + counts.late) / counts.total) * 100)
        : 0;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Attendance rate */}
            <div className="sm:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl p-4 text-white shadow-md shadow-indigo-200 flex flex-col justify-between">
                <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">Rate</p>
                <p className="text-3xl font-extrabold tabular-nums mt-1">{pct}%</p>
                <p className="text-[10px] text-indigo-200 mt-1">{counts.total} students</p>
            </div>

            {/* Per-status counts */}
            {STATUSES.map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                    <div key={s} className={`rounded-xl p-4 border ${cfg.badge} flex flex-col justify-between`}>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <p className="text-xs font-semibold uppercase tracking-wide">{cfg.label}</p>
                        </div>
                        <p className="text-2xl font-extrabold tabular-nums mt-1">{counts[s] ?? 0}</p>
                    </div>
                );
            })}

            {/* Lock indicator */}
            {isLocked && (
                <div className="sm:col-span-5 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
                    <Lock size={14} /> Attendance is locked — session has been completed
                </div>
            )}
        </div>
    );
};

// ─── Student row ─────────────────────────────────────────────────
const StudentRow = ({ record, onChange, isLocked }) => {
    const { status } = record;

    return (
        <motion.tr
            layout
            className={`border-b border-gray-100 transition-colors ${isLocked ? 'opacity-80' : 'hover:bg-gray-50/60'}`}
        >
            {/* Avatar + Name */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {record.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{record.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{record.admNo}</p>
                    </div>
                </div>
            </td>

            {/* Status toggles */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-1">
                    {STATUSES.map(s => {
                        const cfg = STATUS_CONFIG[s];
                        const Icon = cfg.icon;
                        const isActive = status === s;
                        return (
                            <button
                                key={s}
                                disabled={isLocked}
                                onClick={() => onChange(record.id, s)}
                                title={cfg.label}
                                className={`p-1.5 rounded-lg transition-all duration-100 ${isActive ? cfg.active : cfg.inactive} disabled:cursor-not-allowed`}
                            >
                                <Icon size={17} />
                            </button>
                        );
                    })}
                    {/* Show badge */}
                    <span className={`ml-2 px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_CONFIG[status]?.badge}`}>
                        {STATUS_CONFIG[status]?.label ?? status}
                    </span>
                </div>
            </td>

            {/* Minutes late */}
            <td className="px-5 py-3 w-24">
                {status === 'late' ? (
                    <input
                        type="number"
                        min={0}
                        max={120}
                        value={record.minutes_late ?? 0}
                        disabled={isLocked}
                        onChange={e => onChange(record.id, status, { minutes_late: Number(e.target.value) })}
                        className="w-16 text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                        placeholder="mins"
                    />
                ) : (
                    <span className="text-gray-300 text-xs">—</span>
                )}
            </td>

            {/* Notes */}
            <td className="px-5 py-3">
                <input
                    type="text"
                    value={record.notes ?? ''}
                    disabled={isLocked}
                    onChange={e => onChange(record.id, status, { notes: e.target.value })}
                    placeholder="Add note…"
                    className="w-full text-xs bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none text-gray-600 px-1 py-0.5 disabled:opacity-50"
                />
            </td>

            {/* Lock icon */}
            <td className="px-5 py-3 text-center">
                {isLocked && <Lock size={13} className="text-amber-400 mx-auto" />}
            </td>
        </motion.tr>
    );
};

// ─── Main AttendanceTab ───────────────────────────────────────────
const AttendanceTab = ({ todaySessions = [] }) => {
    const todayStr = new Date().toISOString().slice(0, 10);

    // ── Filters ──────────────────────────────────────────────────
    const [classSessions, setClassSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [classSessionId, setClassSessionId] = useState('');
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [search, setSearch] = useState('');

    // ── Data ─────────────────────────────────────────────────────
    const [sessions, setSessions] = useState([]); // sessions on selectedDate for classSessionId
    const [records, setRecords] = useState([]);
    const [dirty, setDirty] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // ── UI state ─────────────────────────────────────────────────
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    // ── Fetch class sessions for current academic year ───────────
    useEffect(() => {
        const fetchSessions = async () => {
            setSessionsLoading(true);
            try {
                const data = await api.get('/api/academics/sessions/', {
                    params: { current_year: true, status: 'active' },
                });
                const list = Array.isArray(data) ? data : data.results || [];
                setClassSessions(list);
                if (list.length > 0 && !classSessionId) {
                    setClassSessionId(String(list[0].id));
                }
            } catch (err) {
                console.error('Failed to load class sessions:', err);
            } finally {
                setSessionsLoading(false);
            }
        };
        fetchSessions();
    }, []);

    // ── Load sessions for selected class + date ───────────────────
    const loadSessions = useCallback(async () => {
        if (!classSessionId) return;
        setLoadingSessions(true);
        setError(null);
        try {
            const res = await api.lessonSessions.list({
                class_session: classSessionId,
                date: selectedDate,
            });
            const list = res.results ?? res;
            setSessions(list);
            // Auto-select first session
            if (list.length > 0) {
                setSelectedSessionId(String(list[0].id));
            } else {
                setSelectedSessionId('');
                setRecords([]);
            }
        } catch {
            setError('Failed to load sessions for this date.');
        } finally {
            setLoadingSessions(false);
        }
    }, [classSessionId, selectedDate]);

    useEffect(() => { loadSessions(); }, [loadSessions]);

    // ── Load roster when session changes ─────────────────────────
    const loadRoster = useCallback(async () => {
        if (!selectedSessionId) { setRecords([]); return; }
        setLoadingRoster(true);
        setError(null);
        setDirty(false);
        setSaved(false);
        try {
            const session = sessions.find(s => String(s.id) === selectedSessionId);
            setIsLocked(session?.status === 'completed');

            const res = await api.lessonSessions.getAttendance(Number(selectedSessionId));
            const raw = Array.isArray(res) ? res : (res.results ?? res.data ?? []);
            setRecords(raw.map(r => ({
                id: r.id,
                student_id: r.student ?? r.student_id,
                name: r.student_name ?? r.student_full_name ?? 'Unknown',
                admNo: r.admission_number ?? r.adm_no ?? '—',
                status: r.status ?? 'absent',
                minutes_late: r.minutes_late ?? 0,
                notes: r.notes ?? '',
            })));
        } catch {
            setError('Failed to load attendance roster.');
        } finally {
            setLoadingRoster(false);
        }
    }, [selectedSessionId, sessions]);

    useEffect(() => { loadRoster(); }, [loadRoster]);

    // ── Record change handler ─────────────────────────────────────
    const handleChange = useCallback((id, newStatus, extras = {}) => {
        setRecords(prev => prev.map(r =>
            r.id === id ? { ...r, status: newStatus, ...extras } : r
        ));
        setDirty(true);
        setSaved(false);
    }, []);

    const markAll = (status) => {
        setRecords(prev => prev.map(r => ({ ...r, status })));
        setDirty(true);
        setSaved(false);
    };

    // ── Save ─────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!selectedSessionId || isLocked) return;
        setSaving(true);
        setError(null);
        try {
            await api.lessonSessions.markAttendance(
                Number(selectedSessionId),
                records.map(r => ({
                    student_id: r.student_id,
                    status: r.status,
                    minutes_late: r.minutes_late,
                    notes: r.notes,
                }))
            );
            setSaved(true);
            setDirty(false);
        } catch {
            setError('Failed to save attendance. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Filtered records ──────────────────────────────────────────
    const filtered = useMemo(() => {
        if (!search.trim()) return records;
        const q = search.toLowerCase();
        return records.filter(r =>
            r.name.toLowerCase().includes(q) || r.admNo.toLowerCase().includes(q)
        );
    }, [records, search]);

    const selectedSession = sessions.find(s => String(s.id) === selectedSessionId);

    return (
        <div className="space-y-5">
            {/* ── Filter bar ───────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <div className="flex flex-wrap items-end gap-4">
                    {/* Class selector */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Class Session</label>
                        <div className="relative">
                            <select
                                value={classSessionId}
                                onChange={e => setClassSessionId(e.target.value)}
                                disabled={sessionsLoading}
                                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none disabled:opacity-50"
                            >
                                <option value="">{sessionsLoading ? 'Loading classes...' : '— Select class —'}</option>
                                {classSessions.map(cs => (
                                    <option key={cs.id} value={cs.id}>{cs.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Date picker */}
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                            <input
                                type="date"
                                value={selectedDate}
                                max={todayStr}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    {/* Session selector */}
                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Lesson Session
                            {loadingSessions && <Loader2 size={11} className="inline ml-1 animate-spin" />}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedSessionId}
                                onChange={e => setSelectedSessionId(e.target.value)}
                                disabled={sessions.length === 0}
                                className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none disabled:opacity-50"
                            >
                                {sessions.length === 0
                                    ? <option>No sessions on this date</option>
                                    : sessions.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.subject_name ?? 'Session'} · {s.actual_start_time?.slice(11, 16)} · {s.status}
                                        </option>
                                    ))
                                }
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={loadSessions}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <RefreshCcw size={13} className={loadingSessions ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Summary stats ────────────────────────────────────── */}
            {records.length > 0 && (
                <AttendanceSummary records={records} isLocked={isLocked} />
            )}

            {/* ── Roster ───────────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
                            <Users size={16} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Student Roster
                                {selectedSession && (
                                    <span className="ml-2 text-xs font-medium text-gray-400">
                                        · {selectedSession.subject_name}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-400">{records.length} students enrolled</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <Search size={13} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search students…"
                                className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl w-44 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>

                        {/* Bulk actions */}
                        {!isLocked && records.length > 0 && (
                            <>
                                <button
                                    onClick={() => markAll('present')}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all"
                                >
                                    <UserCheck size={13} /> All Present
                                </button>
                                <button
                                    onClick={() => markAll('absent')}
                                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all"
                                >
                                    <XCircle size={13} /> All Absent
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Error banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 py-2 bg-red-50 text-red-600 text-xs border-b border-red-100">
                                {error}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                {loadingRoster ? (
                    <div className="flex items-center justify-center py-16 gap-2 text-gray-400 text-sm">
                        <Loader2 size={20} className="animate-spin text-indigo-500" /> Loading roster…
                    </div>
                ) : !selectedSessionId ? (
                    <div className="py-16 text-center text-gray-400 text-sm">
                        <BarChart2 size={40} className="mx-auto mb-3 opacity-30" />
                        <p>Select a class and date to view attendance</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">
                        <Users size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No attendance records found for this session.</p>
                        <p className="text-xs mt-1 text-gray-300">Records are created automatically when a session starts.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Student</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold">Mins Late</th>
                                    <th className="px-5 py-3 font-semibold">Notes</th>
                                    <th className="px-5 py-3 text-center font-semibold w-10">
                                        <Lock size={12} className="mx-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(rec => (
                                    <StudentRow
                                        key={rec.id}
                                        record={rec}
                                        onChange={handleChange}
                                        isLocked={isLocked}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                {records.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            {isLocked ? (
                                <span className="flex items-center gap-1 text-amber-600 font-medium">
                                    <Lock size={12} /> Session completed — attendance locked
                                </span>
                            ) : dirty ? (
                                <span className="text-indigo-600 font-medium">Unsaved changes</span>
                            ) : saved ? (
                                <span className="text-emerald-600 font-medium flex items-center gap-1">
                                    <CheckCircle size={12} /> Attendance saved
                                </span>
                            ) : null}
                        </div>
                        {!isLocked && (
                            <button
                                onClick={handleSave}
                                disabled={saving || !dirty || !selectedSessionId}
                                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                {saving ? 'Saving…' : 'Save Attendance'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceTab;
