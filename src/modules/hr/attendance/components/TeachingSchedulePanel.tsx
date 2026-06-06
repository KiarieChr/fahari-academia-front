import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp, Clock3, CheckCircle2, PlayCircle, Circle } from 'lucide-react';
import { api } from '../../../../services/apiClient';

// ─── Types ──────────────────────────────────────────────────────
interface TeachingSlot {
    id: string | number;
    subject_name: string;
    subject_color?: string;
    class_name: string;
    start_time: string;   // "HH:MM"
    end_time: string;     // "HH:MM"
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    room?: string;
}

// ─── Helpers ────────────────────────────────────────────────────
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const toHHMM = (timeStr: string): string => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
};

const nowMinutes = (): number => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
};

const timeToMinutes = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const getSlotStatus = (start: string, end: string): 'upcoming' | 'active' | 'completed' => {
    const now = nowMinutes();
    const s = timeToMinutes(start);
    const e = timeToMinutes(end);
    if (now < s) return 'upcoming';
    if (now >= s && now < e) return 'active';
    return 'completed';
};

const STATUS_CONFIG = {
    active:    { icon: PlayCircle,    color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'In Progress', pulse: true },
    upcoming:  { icon: Circle,        color: 'text-slate-400',   bg: 'bg-slate-100/60 border-slate-200/50',     label: 'Upcoming',    pulse: false },
    completed: { icon: CheckCircle2,  color: 'text-slate-300',   bg: 'bg-slate-50 border-slate-100',            label: 'Done',        pulse: false },
    cancelled: { icon: Circle,        color: 'text-red-400',     bg: 'bg-red-50 border-red-100',                label: 'Cancelled',   pulse: false },
};

// ─── Component ──────────────────────────────────────────────────
interface TeachingSchedulePanelProps {
    userId?: number | string;
    compact?: boolean;
    className?: string;
}

const TeachingSchedulePanel: React.FC<TeachingSchedulePanelProps> = ({ userId, compact = false, className = '' }) => {
    const [lessons, setLessons] = useState<TeachingSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const [currentMinute, setCurrentMinute] = useState(nowMinutes());

    // ── Tick every minute to update statuses ──
    useEffect(() => {
        const timer = setInterval(() => setCurrentMinute(nowMinutes()), 60_000);
        return () => clearInterval(timer);
    }, []);

    // ── Fetch today's teaching data ───────────────────────────
    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const todayDayIndex = new Date().getDay(); // 0=Sun
            // Map JS day (0=Sun) → backend day (0=Mon)
            const backendDay = todayDayIndex === 0 ? 6 : todayDayIndex - 1;

            // Attempt 1: fetch today's lesson sessions (execution layer)
            let sessionSlots: TeachingSlot[] = [];
            try {
                const params: Record<string, any> = {};
                if (userId) params.teacher = userId;
                const data = await api.lessonSessions.getToday(params);
                const sessions = Array.isArray(data) ? data : (data?.results ?? []);
                sessionSlots = sessions.map((s: any) => ({
                    id: `sess-${s.id}`,
                    subject_name: s.subject_name ?? s.subject?.name ?? 'Unknown Subject',
                    subject_color: s.subject_color ?? '#6366f1',
                    class_name: s.class_session_name ?? s.class_name ?? '',
                    start_time: toHHMM(s.start_time ?? s.scheduled_start ?? ''),
                    end_time: toHHMM(s.end_time ?? s.scheduled_end ?? ''),
                    status: s.status === 'cancelled' ? 'cancelled' : getSlotStatus(
                        toHHMM(s.start_time ?? s.scheduled_start ?? ''),
                        toHHMM(s.end_time ?? s.scheduled_end ?? '')
                    ),
                    room: s.room_name ?? s.room?.name,
                })).filter((s: TeachingSlot) => s.start_time);
            } catch (_) {
                // session endpoint may not be available for all users
            }

            // Attempt 2: fall back to timetable weekly view if no session data
            if (sessionSlots.length === 0 && userId) {
                try {
                    const timetableData = await api.timetable.getTeacherTimetable(userId);
                    const dayName = DAY_NAMES[backendDay] ?? DAY_NAMES[0];
                    const daySlots: any[] = timetableData?.days?.[dayName] ?? [];
                    sessionSlots = daySlots.map((s: any) => ({
                        id: `slot-${s.id}`,
                        subject_name: s.subject_name ?? 'Unknown',
                        subject_color: s.subject_color ?? '#6366f1',
                        class_name: s.class_session_name ?? '',
                        start_time: toHHMM(s.start_time ?? ''),
                        end_time: toHHMM(s.end_time ?? ''),
                        status: getSlotStatus(toHHMM(s.start_time ?? ''), toHHMM(s.end_time ?? '')),
                        room: s.room_name ?? s.room,
                    })).filter((s: TeachingSlot) => s.start_time);
                } catch (_) {}
            }

            // Sort by start time
            sessionSlots.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
            setLessons(sessionSlots);
        } catch (err) {
            setLessons([]);
        } finally {
            setLoading(false);
        }
    }, [userId, currentMinute]);

    useEffect(() => {
        fetchSchedule();
    }, [userId]);

    // Recompute statuses on tick without refetching
    useEffect(() => {
        setLessons(prev => prev.map(l => ({
            ...l,
            status: l.status === 'cancelled'
                ? 'cancelled'
                : getSlotStatus(l.start_time, l.end_time),
        })));
    }, [currentMinute]);

    const activeLesson = lessons.find(l => l.status === 'active');
    const hasLessons = lessons.length > 0;

    if (!hasLessons && !loading) return null; // hide panel if no teaching today

    return (
        <div className={`mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 ${className}`}>
            {/* Header */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between mb-2 group"
            >
                <div className="flex items-center gap-2">
                    <BookOpen size={11} className="text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Today's Teaching
                    </span>
                    {activeLesson && (
                        <span className="relative flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative" />
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-full">
                        {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                    </span>
                    {expanded
                        ? <ChevronUp size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                        : <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                    }
                </div>
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center py-3">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                    Loading schedule...
                                </div>
                            </div>
                        ) : (
                            <div className={`space-y-1.5 ${compact ? 'max-h-28 overflow-y-auto' : 'max-h-44 overflow-y-auto'} pr-1`}>
                                {lessons.map((lesson) => {
                                    const cfg = STATUS_CONFIG[lesson.status];
                                    const StatusIcon = cfg.icon;
                                    const isActive = lesson.status === 'active';

                                    return (
                                        <motion.div
                                            key={lesson.id}
                                            layout
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${cfg.bg} ${isActive ? 'shadow-sm' : ''}`}
                                        >
                                            {/* Time */}
                                            <div className="flex flex-col items-center min-w-[30px]">
                                                <span className={`text-[9px] font-black tabular-nums ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {lesson.start_time}
                                                </span>
                                                <div className="w-px h-2 bg-slate-200 dark:bg-slate-700 my-0.5" />
                                                <span className="text-[8px] font-bold tabular-nums text-slate-300">
                                                    {lesson.end_time}
                                                </span>
                                            </div>

                                            {/* Color bar */}
                                            <div
                                                className="w-0.5 h-8 rounded-full opacity-70 flex-shrink-0"
                                                style={{ backgroundColor: lesson.subject_color ?? '#6366f1' }}
                                            />

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-[10px] font-black truncate leading-tight ${isActive ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {lesson.subject_name}
                                                </p>
                                                <p className="text-[9px] font-semibold text-slate-400 truncate">
                                                    {lesson.class_name}
                                                    {lesson.room && <span className="ml-1 opacity-70">· {lesson.room}</span>}
                                                </p>
                                            </div>

                                            {/* Status icon */}
                                            <div className="flex-shrink-0 relative">
                                                {cfg.pulse && (
                                                    <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                                                )}
                                                <StatusIcon size={12} className={cfg.color} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeachingSchedulePanel;
