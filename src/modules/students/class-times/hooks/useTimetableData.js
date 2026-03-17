import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { timetableApi, timetableCache, parseApiError } from '../services/timetableApi';

/**
 * useTimetableData — Enhanced central data hook for Class Times / Timetable dashboard.
 * 
 * Features:
 * - Intelligent caching to avoid redundant API calls
 * - Work allocation tracking for scheduling guidance
 * - Conflict checking before mutations
 * - Optimistic updates where safe
 * - Separated loading states for better UX
 * - Teacher availability integration
 * 
 * @param {Object} filters - { classSessionId, teacherId, roomId }
 */
const useTimetableData = (filters = {}) => {
    const { classSessionId, teacherId, roomId } = filters;

    // ── Reference data (loaded once, cached) ──────────────────────
    const [subjects, setSubjects] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [classSessions, setClassSessions] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // ── Dynamic data (changes with filters) ────────────────────────
    const [weeklyView, setWeeklyView] = useState({});
    const [slots, setSlots] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [teacherAvailability, setTeacherAvailability] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [lockStatus, setLockStatus] = useState(null);

    // ── Analytics data ─────────────────────────────────────────────
    const [coverage, setCoverage] = useState(null);
    const [workloadSummary, setWorkloadSummary] = useState(null);

    // ── UI state ───────────────────────────────────────────────────
    const [loading, setLoading] = useState({ initial: true, slots: false, saving: false });
    const [error, setError] = useState(null);
    const [lastConflict, setLastConflict] = useState(null);

    // Track mounted state to prevent state updates after unmount
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // ──────────────────────────────────────────────────────────────
    // REFERENCE DATA LOADERS
    // ──────────────────────────────────────────────────────────────

    const loadReferenceData = useCallback(async () => {
        const cacheKey = 'ref_data';
        const cached = timetableCache.get(cacheKey);
        if (cached) {
            setSubjects(cached.subjects);
            setRooms(cached.rooms);
            setPeriods(cached.periods);
            return;
        }

        try {
            const [subjectsRes, roomsRes, periodsRes] = await Promise.all([
                timetableApi.subjects.list(),
                timetableApi.rooms.list(),
                timetableApi.periods.getSchedulable(),
            ]);

            const data = {
                subjects: subjectsRes.results ?? subjectsRes,
                rooms: roomsRes.results ?? roomsRes,
                periods: periodsRes.results ?? periodsRes,
            };

            if (isMounted.current) {
                setSubjects(data.subjects);
                setRooms(data.rooms);
                setPeriods(data.periods);
                timetableCache.set(cacheKey, data);
            }
        } catch (err) {
            console.error('useTimetableData: reference data load failed', err);
            if (isMounted.current) {
                setError(parseApiError(err));
            }
        }
    }, []);

    const loadClassSessions = useCallback(async () => {
        const cacheKey = 'class_sessions';
        const cached = timetableCache.get(cacheKey);
        if (cached) {
            setClassSessions(cached);
            return;
        }

        try {
            // Import from main api for academics data
            const { api } = await import('../../../../services/api');
            const res = await api.academics.getActiveSessions();
            const sessions = res.results ?? res;
            if (isMounted.current) {
                setClassSessions(sessions);
                timetableCache.set(cacheKey, sessions);
            }
        } catch (err) {
            console.error('useTimetableData: sessions load failed', err);
        }
    }, []);

    // ──────────────────────────────────────────────────────────────
    // TIMETABLE DATA LOADERS
    // ──────────────────────────────────────────────────────────────

    const loadSlots = useCallback(async () => {
        if (!classSessionId) {
            setSlots([]);
            setWeeklyView({});
            return;
        }

        if (isMounted.current) {
            setLoading(prev => ({ ...prev, slots: true }));
        }

        try {
            // Load both flat slots and weekly grouped view
            const [slotsRes, weeklyRes] = await Promise.all([
                timetableApi.slots.list({ class_session: classSessionId }),
                timetableApi.views.classFull(classSessionId),
            ]);

            if (isMounted.current) {
                setSlots(slotsRes.results ?? slotsRes);
                setWeeklyView(weeklyRes.days ?? weeklyRes);
            }
        } catch (err) {
            console.error('useTimetableData: slots load failed', err);
            // Try legacy endpoint as fallback
            try {
                const legacyRes = await timetableApi.slots.weeklyView(classSessionId);
                if (isMounted.current) {
                    setWeeklyView(legacyRes);
                }
            } catch (e) {
                console.error('useTimetableData: legacy weekly view also failed', e);
            }
        } finally {
            if (isMounted.current) {
                setLoading(prev => ({ ...prev, slots: false }));
            }
        }
    }, [classSessionId]);

    const loadAllocations = useCallback(async () => {
        if (!classSessionId) {
            setAllocations([]);
            return;
        }

        try {
            const res = await timetableApi.allocations.byClass(classSessionId);
            if (isMounted.current) {
                setAllocations(res.results ?? res);
            }
        } catch (err) {
            console.error('useTimetableData: allocations load failed', err);
            // Allocations endpoint is new - don't fail silently but log
        }
    }, [classSessionId]);

    const loadCoverage = useCallback(async () => {
        if (!classSessionId) {
            setCoverage(null);
            return;
        }

        try {
            const res = await timetableApi.analytics.classCoverage(classSessionId);
            if (isMounted.current) {
                setCoverage(res);
            }
        } catch (err) {
            console.error('useTimetableData: coverage load failed', err);
        }
    }, [classSessionId]);

    const loadLockStatus = useCallback(async () => {
        if (!classSessionId) {
            setLockStatus(null);
            return;
        }

        try {
            const res = await timetableApi.locks.get(classSessionId);
            const locks = res.results ?? res;
            if (isMounted.current) {
                setLockStatus(locks.length > 0 ? locks[0] : null);
            }
        } catch (err) {
            // Lock may not exist - that's fine
            if (isMounted.current) {
                setLockStatus(null);
            }
        }
    }, [classSessionId]);

    const loadExceptions = useCallback(async () => {
        try {
            const res = await timetableApi.exceptions.list();
            if (isMounted.current) {
                setExceptions(res.results ?? res);
            }
        } catch (err) {
            console.error('useTimetableData: exceptions load failed', err);
        }
    }, []);

    // ──────────────────────────────────────────────────────────────
    // REFRESH FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    const refresh = useCallback(async () => {
        setLoading(prev => ({ ...prev, initial: true }));
        setError(null);

        try {
            await Promise.all([
                loadReferenceData(),
                loadClassSessions(),
                loadSlots(),
                loadAllocations(),
                loadCoverage(),
                loadLockStatus(),
                loadExceptions(),
            ]);
        } catch (err) {
            if (isMounted.current) {
                setError(parseApiError(err));
            }
        } finally {
            if (isMounted.current) {
                setLoading(prev => ({ ...prev, initial: false }));
            }
        }
    }, [loadReferenceData, loadClassSessions, loadSlots, loadAllocations, loadCoverage, loadLockStatus, loadExceptions]);

    // Lightweight refresh (only slots, no reference data)
    const refreshSlots = useCallback(async () => {
        await Promise.all([loadSlots(), loadCoverage()]);
    }, [loadSlots, loadCoverage]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Re-fetch slots when classSessionId changes
    useEffect(() => {
        if (!loading.initial) {
            loadSlots();
            loadAllocations();
            loadCoverage();
            loadLockStatus();
        }
    }, [classSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ──────────────────────────────────────────────────────────────
    // CONFLICT CHECKING
    // ──────────────────────────────────────────────────────────────

    /**
     * Check for conflicts before creating/updating a slot.
     * Returns: { isValid, conflicts, warnings }
     */
    const checkConflicts = useCallback(async (slotData) => {
        try {
            const result = await timetableApi.conflicts.check(slotData);
            setLastConflict(result.is_valid ? null : result);
            return {
                isValid: result.is_valid,
                conflicts: result.conflicts || [],
                warnings: result.warnings || [],
            };
        } catch (err) {
            console.error('Conflict check failed', err);
            return { isValid: true, conflicts: [], warnings: [] };
        }
    }, []);

    // ──────────────────────────────────────────────────────────────
    // SLOT MUTATIONS (with conflict handling)
    // ──────────────────────────────────────────────────────────────

    const createSlot = useCallback(async (data, skipConflictCheck = false) => {
        setLoading(prev => ({ ...prev, saving: true }));
        setLastConflict(null);

        try {
            // Pre-validate unless skipped
            if (!skipConflictCheck) {
                const check = await checkConflicts(data);
                if (!check.isValid) {
                    const err = new Error('Slot has conflicts');
                    err.conflicts = check.conflicts;
                    throw err;
                }
            }

            const newSlot = await timetableApi.slots.create(data);

            // Optimistic update
            if (isMounted.current) {
                setSlots(prev => [...prev, newSlot]);
            }

            // Background refresh for accurate data
            refreshSlots();

            return newSlot;
        } catch (err) {
            if (err.conflicts) {
                setLastConflict({ is_valid: false, conflicts: err.conflicts });
            }
            throw err;
        } finally {
            if (isMounted.current) {
                setLoading(prev => ({ ...prev, saving: false }));
            }
        }
    }, [checkConflicts, refreshSlots]);

    const updateSlot = useCallback(async (id, data, skipConflictCheck = false) => {
        setLoading(prev => ({ ...prev, saving: true }));
        setLastConflict(null);

        try {
            if (!skipConflictCheck) {
                const check = await checkConflicts({ ...data, exclude_slot_id: id });
                if (!check.isValid) {
                    const err = new Error('Slot has conflicts');
                    err.conflicts = check.conflicts;
                    throw err;
                }
            }

            const updated = await timetableApi.slots.update(id, data);

            // Optimistic update
            if (isMounted.current) {
                setSlots(prev => prev.map(s => s.id === id ? updated : s));
            }

            refreshSlots();
            return updated;
        } catch (err) {
            if (err.conflicts) {
                setLastConflict({ is_valid: false, conflicts: err.conflicts });
            }
            throw err;
        } finally {
            if (isMounted.current) {
                setLoading(prev => ({ ...prev, saving: false }));
            }
        }
    }, [checkConflicts, refreshSlots]);

    const deleteSlot = useCallback(async (id) => {
        setLoading(prev => ({ ...prev, saving: true }));

        try {
            await timetableApi.slots.delete(id);

            // Optimistic removal
            if (isMounted.current) {
                setSlots(prev => prev.filter(s => s.id !== id));
            }

            refreshSlots();
        } finally {
            if (isMounted.current) {
                setLoading(prev => ({ ...prev, saving: false }));
            }
        }
    }, [refreshSlots]);

    // ──────────────────────────────────────────────────────────────
    // ALLOCATION HELPERS
    // ──────────────────────────────────────────────────────────────

    /**
     * Get available slots for a specific work allocation.
     * Used by the assignment modal.
     */
    const getAvailableSlots = useCallback(async (allocationId) => {
        try {
            return await timetableApi.allocations.availableSlots(allocationId);
        } catch (err) {
            console.error('Failed to get available slots', err);
            return [];
        }
    }, []);

    /**
     * Find allocations that still need slots scheduled.
     */
    const unscheduledAllocations = useMemo(() => {
        return allocations.filter(a => a.remaining_lessons > 0);
    }, [allocations]);

    // ──────────────────────────────────────────────────────────────
    // SCHEDULING ACTIONS
    // ──────────────────────────────────────────────────────────────

    const autoFillRemaining = useCallback(async (preferences = {}) => {
        if (!classSessionId) return null;

        setLoading(prev => ({ ...prev, saving: true }));

        try {
            const result = await timetableApi.scheduling.generate({
                class_session: classSessionId,
                mode: 'semi_auto',
                preferences: {
                    prefer_morning: true,
                    spread_subjects: true,
                    ...preferences,
                },
            });

            await refreshSlots();
            return result;
        } finally {
            if (isMounted.current) {
                setLoading(prev => ({ ...prev, saving: false }));
            }
        }
    }, [classSessionId, refreshSlots]);

    // ──────────────────────────────────────────────────────────────
    // LOCK MANAGEMENT
    // ──────────────────────────────────────────────────────────────

    const toggleLock = useCallback(async () => {
        if (!lockStatus) {
            // Create lock if doesn't exist
            const newLock = await timetableApi.locks.create({
                class_session: classSessionId,
                lock_level: 'locked',
            });
            setLockStatus(newLock);
            return newLock;
        }

        if (lockStatus.is_editable) {
            await timetableApi.locks.lock(lockStatus.id);
        } else {
            await timetableApi.locks.unlock(lockStatus.id);
        }

        await loadLockStatus();
        return lockStatus;
    }, [classSessionId, lockStatus, loadLockStatus]);

    // ──────────────────────────────────────────────────────────────
    // VERSION MANAGEMENT
    // ──────────────────────────────────────────────────────────────

    const createSnapshot = useCallback(async (label, description = '') => {
        if (!classSessionId) return null;

        return await timetableApi.versions.createSnapshot({
            class_session: classSessionId,
            label,
            description,
        });
    }, [classSessionId]);

    // ──────────────────────────────────────────────────────────────
    // DERIVED STATE
    // ──────────────────────────────────────────────────────────────

    const isLocked = useMemo(() => {
        return lockStatus && !lockStatus.is_editable;
    }, [lockStatus]);

    const coveragePercentage = useMemo(() => {
        return coverage?.summary?.overall_percentage ?? 0;
    }, [coverage]);

    // ──────────────────────────────────────────────────────────────
    // SUBJECT/ROOM MUTATIONS (unchanged from original)
    // ──────────────────────────────────────────────────────────────

    const createSubject = async (data) => {
        const created = await timetableApi.subjects.create(data);
        setSubjects(prev => [...prev, created]);
        timetableCache.invalidate('ref_data');
        return created;
    };

    const updateSubject = async (id, data) => {
        const updated = await timetableApi.subjects.update(id, data);
        setSubjects(prev => prev.map(s => s.id === id ? updated : s));
        timetableCache.invalidate('ref_data');
        return updated;
    };

    const deleteSubject = async (id) => {
        await timetableApi.subjects.delete(id);
        setSubjects(prev => prev.filter(s => s.id !== id));
        timetableCache.invalidate('ref_data');
    };

    const createRoom = async (data) => {
        const created = await timetableApi.rooms.create(data);
        setRooms(prev => [...prev, created]);
        timetableCache.invalidate('ref_data');
        return created;
    };

    const updateRoom = async (id, data) => {
        const updated = await timetableApi.rooms.update(id, data);
        setRooms(prev => prev.map(r => r.id === id ? updated : r));
        timetableCache.invalidate('ref_data');
        return updated;
    };

    const deleteRoom = async (id) => {
        await timetableApi.rooms.delete(id);
        setRooms(prev => prev.filter(r => r.id !== id));
        timetableCache.invalidate('ref_data');
    };

    // ──────────────────────────────────────────────────────────────
    // RETURN
    // ──────────────────────────────────────────────────────────────

    return {
        // Reference data
        subjects,
        rooms,
        periods,
        classSessions,

        // Timetable data
        weeklyView,
        slots,
        allocations,
        exceptions,
        coverage,

        // State
        loading: loading.initial,
        loadingSlots: loading.slots,
        saving: loading.saving,
        error,
        lastConflict,
        lockStatus,
        isLocked,
        coveragePercentage,
        unscheduledAllocations,

        // Actions
        refresh,
        refreshSlots,
        checkConflicts,
        getAvailableSlots,

        // Slot mutations
        createSlot,
        updateSlot,
        deleteSlot,

        // Subject mutations
        createSubject,
        updateSubject,
        deleteSubject,

        // Room mutations
        createRoom,
        updateRoom,
        deleteRoom,

        // Advanced features
        autoFillRemaining,
        toggleLock,
        createSnapshot,
    };
};

export default useTimetableData;

