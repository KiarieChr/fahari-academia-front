import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../services/api';

/**
 * Central data hook for Class Sessions dashboard.
 * Manages today's planned lessons, live session states, attendance,
 * analytics, and teacher workload.
 */
const useClassSessionsData = (filters = {}) => {
    const { classSessionId, date } = filters;

    // ── Today's planned lessons (from scheduled_lessons) ─────────
    const [todayPlanned, setTodayPlanned] = useState([]);

    // ── Live lesson sessions (ongoing/recent) ────────────────────
    const [todaySessions, setTodaySessions] = useState([]);

    // ── Analytics summary ────────────────────────────────────────
    const [analytics, setAnalytics] = useState(null);

    // ── Active class sessions (for filter dropdowns in modals) ───
    const [classSessions, setClassSessions] = useState([]);

    // ── Subjects ─────────────────────────────────────────────────
    const [subjects, setSubjects] = useState([]);

    // ── UI state ─────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(false);

    // ── Helpers ──────────────────────────────────────────────────
    const buildParams = useCallback(() => {
        const p = {};
        if (classSessionId) p.class_session = classSessionId;
        if (date) p.date = date;
        return p;
    }, [classSessionId, date]);

    // ── Loaders ─────────────────────────────────────────────────
    const loadTodayPlanned = useCallback(async () => {
        try {
            const res = await api.plannedLessons.getToday(buildParams());
            setTodayPlanned(res.results ?? res);
        } catch (err) {
            console.error('useClassSessionsData: planned lessons load failed', err);
        }
    }, [buildParams]);

    const loadTodaySessions = useCallback(async () => {
        try {
            const res = await api.lessonSessions.getToday(buildParams());
            setTodaySessions(res.results ?? res);
        } catch (err) {
            console.error('useClassSessionsData: lesson sessions load failed', err);
        }
    }, [buildParams]);

    const loadAnalytics = useCallback(async () => {
        try {
            const res = await api.lessonSessions.getAnalytics(buildParams());
            setAnalytics(res);
        } catch (err) {
            console.error('useClassSessionsData: analytics load failed', err);
        }
    }, [buildParams]);

    const loadReferenceData = useCallback(async () => {
        try {
            const [sessionsRes, subjectsRes] = await Promise.all([
                api.academics.getActiveSessions(),
                api.timetable.getSubjects(),
            ]);
            setClassSessions(sessionsRes.results ?? sessionsRes);
            setSubjects(subjectsRes.results ?? subjectsRes);
        } catch (err) {
            console.error('useClassSessionsData: reference data load failed', err);
        }
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([
                loadReferenceData(),
                loadTodayPlanned(),
                loadTodaySessions(),
                loadAnalytics(),
            ]);
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [loadReferenceData, loadTodayPlanned, loadTodaySessions, loadAnalytics]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // ── Session actions ───────────────────────────────────────────
    /**
     * Start an ad-hoc lesson session (not linked to a planned lesson).
     * @param {Object} data - { class_session, subject, topic_taught, ... }
     */
    const startAdhocSession = async (data) => {
        setSessionLoading(true);
        try {
            const created = await api.lessonSessions.startAdhoc(data);
            await loadTodaySessions();
            return created;
        } finally {
            setSessionLoading(false);
        }
    };

    /**
     * Start a session from a planned lesson.
     * @param {number} plannedLessonId
     * @param {Object} extra - optional override fields
     */
    const startFromPlanned = async (plannedLessonId, extra = {}) => {
        setSessionLoading(true);
        try {
            const created = await api.lessonSessions.startAdhoc({
                planned_lesson: plannedLessonId,
                ...extra,
            });
            await loadTodayPlanned();
            await loadTodaySessions();
            return created;
        } finally {
            setSessionLoading(false);
        }
    };

    /**
     * Complete a running session.
     */
    const completeSession = async (sessionId, data = {}) => {
        const result = await api.lessonSessions.complete(sessionId, data);
        await loadTodaySessions();
        await loadAnalytics();
        return result;
    };

    /**
     * Cancel a session.
     */
    const cancelSession = async (sessionId, reason = '') => {
        const result = await api.lessonSessions.cancel(sessionId, { reason });
        await loadTodaySessions();
        await loadTodayPlanned();
        return result;
    };

    /**
     * Cancel a planned lesson (before it starts).
     */
    const cancelPlannedLesson = async (plannedId, reason = '') => {
        const result = await api.plannedLessons.cancel(plannedId, { reason });
        await loadTodayPlanned();
        return result;
    };

    /**
     * Bulk mark attendance for a session.
     * @param {number} sessionId
     * @param {Array}  records - [{student, status, minutes_late?}]
     */
    const markAttendance = async (sessionId, records) => {
        const result = await api.lessonSessions.markAttendance(sessionId, records);
        return result;
    };

    return {
        // Data
        todayPlanned,
        todaySessions,
        analytics,
        classSessions,
        subjects,
        // State
        loading,
        error,
        sessionLoading,
        // Refresh
        refresh,
        // Actions
        startAdhocSession,
        startFromPlanned,
        completeSession,
        cancelSession,
        cancelPlannedLesson,
        markAttendance,
    };
};

export default useClassSessionsData;
