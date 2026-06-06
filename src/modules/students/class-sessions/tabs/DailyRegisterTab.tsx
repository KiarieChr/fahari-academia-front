import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Users, CheckCircle, XCircle, Clock, AlertCircle,
    Save, Loader2, Search, Calendar, BarChart2,
    ChevronDown, RefreshCcw, ClipboardCheck, Timer, UserX,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';

// ─── Status config ──────────────────────────────────────────────
const STATUSES = ['present', 'absent', 'late', 'excused', 'half_day'];

const STATUS_CONFIG = {
    present: {
        label: 'Present', short: 'P', icon: CheckCircle,
        active: 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400',
        inactive: 'text-gray-300 hover:bg-emerald-50 hover:text-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
    },
    absent: {
        label: 'Absent', short: 'A', icon: XCircle,
        active: 'bg-red-100 text-red-700 ring-2 ring-red-400',
        inactive: 'text-gray-300 hover:bg-red-50 hover:text-red-500',
        badge: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
    },
    late: {
        label: 'Late', short: 'L', icon: Clock,
        active: 'bg-amber-100 text-amber-700 ring-2 ring-amber-400',
        inactive: 'text-gray-300 hover:bg-amber-50 hover:text-amber-500',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
    },
    excused: {
        label: 'Excused', short: 'E', icon: AlertCircle,
        active: 'bg-blue-100 text-blue-700 ring-2 ring-blue-400',
        inactive: 'text-gray-300 hover:bg-blue-50 hover:text-blue-500',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-400',
    },
    half_day: {
        label: 'Half Day', short: 'H', icon: Timer,
        active: 'bg-purple-100 text-purple-700 ring-2 ring-purple-400',
        inactive: 'text-gray-300 hover:bg-purple-50 hover:text-purple-500',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
    },
    unmarked: {
        label: 'Unmarked', short: '—', icon: UserX,
        badge: 'bg-gray-50 text-gray-500 border-gray-200',
        dot: 'bg-gray-300',
    },
};

// ─── Summary bar ─────────────────────────────────────────────────
const AttendanceSummary = ({ students }) => {
    const counts = useMemo(() => {
        const c = { present: 0, absent: 0, late: 0, excused: 0, half_day: 0, unmarked: 0, total: students.length };
        students.forEach(s => { c[s.status] = (c[s.status] || 0) + 1; });
        return c;
    }, [students]);

    const marked = counts.total - counts.unmarked;
    const pct = counts.total > 0 ? Math.round(((counts.present + counts.late + counts.half_day) / counts.total) * 100) : 0;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-4">
                {STATUSES.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    return (
                        <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.badge}`}>
                            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-xs font-medium">{cfg.label}</span>
                            <span className="text-sm font-bold">{counts[s]}</span>
                        </div>
                    );
                })}
                {counts.unmarked > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gray-50 text-gray-500 border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                        <span className="text-xs font-medium">Unmarked</span>
                        <span className="text-sm font-bold">{counts.unmarked}</span>
                    </div>
                )}
                <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-gray-500">{marked}/{counts.total} marked</span>
                    <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${pct >= 90 ? 'bg-emerald-100 text-emerald-700'
                        : pct >= 75 ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'}`}>
                        {pct}%
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Student row ─────────────────────────────────────────────────
const StudentRow = ({ student, onChange }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
        >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                {student.student_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{student.student_name}</p>
                <p className="text-xs text-gray-400">{student.admission_number}{student.stream ? ` · ${student.stream}` : ''}</p>
            </div>

            {/* Status buttons */}
            <div className="flex items-center gap-1">
                {STATUSES.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    const isActive = student.status === s;
                    return (
                        <button
                            key={s}
                            onClick={() => onChange(student.student_id, s)}
                            title={cfg.label}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? cfg.active : cfg.inactive}`}
                        >
                            <Icon size={16} />
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
};

// ─── Main component ──────────────────────────────────────────────
const DailyRegisterTab = () => {
    const [classSessions, setClassSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch class sessions for the current academic year
    useEffect(() => {
        const fetchSessions = async () => {
            setSessionsLoading(true);
            try {
                const data = await api.get('/api/academics/sessions/', {
                    params: { current_year: true, status: 'active' },
                });
                setClassSessions(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error('Failed to load class sessions:', err);
            } finally {
                setSessionsLoading(false);
            }
        };
        fetchSessions();
    }, []);

    // Fetch the register for selected session + date
    const fetchRegister = useCallback(async () => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            const data = await api.get('/api/attendance/daily/register/', {
                params: { class_session: selectedSession, date: selectedDate },
            });
            setStudents(data.students || []);
            setHasChanges(false);
        } catch (err) {
            toast.error('Failed to load attendance register');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedSession, selectedDate]);

    useEffect(() => {
        fetchRegister();
    }, [fetchRegister]);

    // Update a student's status locally
    const handleStatusChange = (studentId, newStatus) => {
        setStudents(prev =>
            prev.map(s =>
                s.student_id === studentId ? { ...s, status: newStatus } : s
            )
        );
        setHasChanges(true);
    };

    // Mark all students with a single status
    const markAll = (status) => {
        setStudents(prev => prev.map(s => ({ ...s, status })));
        setHasChanges(true);
    };

    // Save all changes
    const handleSave = async () => {
        if (!selectedSession) return;
        setSaving(true);
        try {
            const records = students
                .filter(s => s.status !== 'unmarked')
                .map(s => ({
                    student_id: s.student_id,
                    status: s.status,
                    notes: s.notes || '',
                }));

            if (records.length === 0) {
                toast.warning('No attendance marked yet');
                setSaving(false);
                return;
            }

            const result = await api.post('/api/attendance/daily/bulk_mark/', {
                class_session: parseInt(selectedSession),
                date: selectedDate,
                records,
            });

            toast.success(`Attendance saved — ${result.created} new, ${result.updated} updated`);
            setHasChanges(false);
            fetchRegister(); // refresh to get marked_at timestamps
        } catch (err) {
            toast.error('Failed to save attendance');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Filter students by search
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter(s =>
            s.student_name.toLowerCase().includes(q) ||
            s.admission_number?.toLowerCase().includes(q)
        );
    }, [students, searchQuery]);

    return (
        <div className="space-y-4">
            {/* ─── Controls ─── */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Class session picker */}
                    <div className="relative flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Class / Grade</label>
                        <div className="relative">
                            <select
                                value={selectedSession}
                                onChange={e => setSelectedSession(e.target.value)}
                                disabled={sessionsLoading}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none disabled:opacity-50"
                            >
                                <option value="">{sessionsLoading ? 'Loading classes...' : 'Select class...'}</option>
                                {classSessions.map(cs => (
                                    <option key={cs.id} value={cs.id}>{cs.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Date picker */}
                    <div className="min-w-[160px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Name or admission no..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-end gap-2 pt-5">
                        <button
                            onClick={() => markAll('present')}
                            disabled={students.length === 0}
                            className="px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-40"
                        >
                            All Present
                        </button>
                        <button
                            onClick={fetchRegister}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Summary ─── */}
            {students.length > 0 && <AttendanceSummary students={students} />}

            {/* ─── Student list ─── */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <ClipboardCheck size={16} className="text-indigo-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Daily Register</h3>
                        {students.length > 0 && (
                            <span className="text-xs text-gray-400">({filteredStudents.length} students)</span>
                        )}
                    </div>
                    {hasChanges && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    )}
                </div>

                {/* Body */}
                {!selectedSession ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Users size={40} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">Select a class to load the register</p>
                        <p className="text-xs mt-1">Choose a class and date above to begin marking attendance</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-indigo-500" />
                        <span className="ml-3 text-sm text-gray-500">Loading students...</span>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <UserX size={40} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">
                            {searchQuery ? 'No students match your search' : 'No students enrolled in this class'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredStudents.map(student => (
                            <StudentRow
                                key={student.student_id}
                                student={student}
                                onChange={handleStatusChange}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Floating save bar ─── */}
            {hasChanges && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-indigo-200 flex items-center gap-4"
                >
                    <span className="text-sm font-medium">
                        {students.filter(s => s.status !== 'unmarked').length} of {students.length} marked
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-1.5 bg-white text-indigo-700 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default DailyRegisterTab;
