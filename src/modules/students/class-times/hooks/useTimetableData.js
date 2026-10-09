import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableApi, parseApiError } from '../services/timetableApi';

const useTimetableData = (filters = {}) => {
    const { classSessionId } = filters;
    const queryClient = useQueryClient();

    const [lastConflict, setLastConflict] = useState(null);

    // ── Queries ──────────────────────────────────────────────────────────

    const { data: refData, isLoading: isLoadingRefData, error: refError } = useQuery({
        queryKey: ['timetable_ref_data'],
        queryFn: async () => {
            const [subjectsRes, roomsRes, periodsRes] = await Promise.all([
                timetableApi.subjects.list(),
                timetableApi.rooms.list(),
                timetableApi.periods.getSchedulable(),
            ]);
            return {
                subjects: subjectsRes.results ?? subjectsRes,
                rooms: roomsRes.results ?? roomsRes,
                periods: periodsRes.results ?? periodsRes,
            };
        },
        staleTime: 10 * 60 * 1000,
    });

    const { data: classSessions, isLoading: isLoadingSessions } = useQuery({
        queryKey: ['class_sessions'],
        queryFn: async () => {
            const { api } = await import('../../../../services/api');
            const res = await api.academics.getActiveSessions();
            return res.results ?? res;
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
        queryKey: ['teachers_list'],
        queryFn: async () => {
            const { api } = await import('../../../../services/api');
            let teacherList = [];
            try {
                // Fetch from HR employees endpoint to get actual staff data
                const hrApi = api.hr || { getEmployees: () => api.get('/workforce/api/employees/') };
                const res = await hrApi.getEmployees();
                const employees = res?.results ?? res ?? [];
                
                // Filter specifically for teaching staff (by department name or role)
                teacherList = employees.filter(emp => 
                    emp.department?.name?.toLowerCase().includes('teach') || 
                    emp.job_title?.name?.toLowerCase().includes('teach') ||
                    emp.role === 'teacher'
                );
                
                // Fallback to standard users if no employees found
                if (teacherList.length === 0) {
                    const userRes = await api.get('/auth/users/').catch(() => ({ results: [] }));
                    teacherList = (userRes.results ?? userRes).filter(u =>
                        u.role === 'teacher' || u.groups?.includes('teacher')
                    );
                }
            } catch (e) {
                console.error("Failed to fetch teachers", e);
            }
            return teacherList;
        },
        staleTime: 10 * 60 * 1000,
    });

    const { data: exceptions = [] } = useQuery({
        queryKey: ['timetable_exceptions'],
        queryFn: async () => {
            const res = await timetableApi.exceptions.list();
            return res.results ?? res;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Class Session specific queries
    const { data: slotData, isLoading: isLoadingSlots } = useQuery({
        queryKey: ['timetable_slots', classSessionId],
        queryFn: async () => {
            const [slotsRes, weeklyRes] = await Promise.all([
                timetableApi.slots.list({ class_session: classSessionId }),
                timetableApi.views.classFull(classSessionId).catch(async () => {
                   return await timetableApi.slots.weeklyView(classSessionId);
                })
            ]);
            return {
                slots: slotsRes.results ?? slotsRes,
                weeklyView: weeklyRes.days ?? weeklyRes,
            };
        },
        enabled: !!classSessionId,
    });

    const { data: allocations = [] } = useQuery({
        queryKey: ['timetable_allocations', classSessionId],
        queryFn: async () => {
            const res = await timetableApi.allocations.byClass(classSessionId);
            return res.results ?? res;
        },
        enabled: !!classSessionId,
    });

    const { data: coverage } = useQuery({
        queryKey: ['timetable_coverage', classSessionId],
        queryFn: async () => {
            return await timetableApi.analytics.classCoverage(classSessionId);
        },
        enabled: !!classSessionId,
    });

    const { data: lockStatus, refetch: refetchLockStatus } = useQuery({
        queryKey: ['timetable_lock', classSessionId],
        queryFn: async () => {
            const res = await timetableApi.locks.get(classSessionId);
            const locks = res.results ?? res;
            return locks.length > 0 ? locks[0] : null;
        },
        enabled: !!classSessionId,
    });

    const { data: versions = [], isLoading: isLoadingVersions } = useQuery({
        queryKey: ['timetable_versions', classSessionId],
        queryFn: async () => {
            const res = await timetableApi.versions.list(classSessionId);
            return res.results ?? res;
        },
        enabled: !!classSessionId,
    });

    // ── Mutations ────────────────────────────────────────────────────────

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

    const createSlotMutation = useMutation({
        mutationFn: async ({ data, skipConflictCheck }) => {
            if (!skipConflictCheck) {
                const check = await checkConflicts(data);
                if (!check.isValid) {
                    const err = new Error('Slot has conflicts');
                    err.conflicts = check.conflicts;
                    throw err;
                }
            }
            return await timetableApi.slots.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable_slots', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_coverage', classSessionId] });
        },
        onError: (err) => {
            if (err.conflicts) {
                setLastConflict({ is_valid: false, conflicts: err.conflicts });
            }
        }
    });

    const updateSlotMutation = useMutation({
        mutationFn: async ({ id, data, skipConflictCheck }) => {
            if (!skipConflictCheck) {
                const check = await checkConflicts({ ...data, exclude_slot_id: id });
                if (!check.isValid) {
                    const err = new Error('Slot has conflicts');
                    err.conflicts = check.conflicts;
                    throw err;
                }
            }
            return await timetableApi.slots.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable_slots', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_coverage', classSessionId] });
        },
        onError: (err) => {
            if (err.conflicts) {
                setLastConflict({ is_valid: false, conflicts: err.conflicts });
            }
        }
    });

    const deleteSlotMutation = useMutation({
        mutationFn: async (id) => {
            return await timetableApi.slots.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable_slots', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_coverage', classSessionId] });
        }
    });

    const replaceSlotMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await timetableApi.slots.replace(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['timetable_slots', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_coverage', classSessionId] });
        },
        onError: (err) => {
            if (err.conflicts) {
                setLastConflict({ is_valid: false, conflicts: err.conflicts });
            }
        }
    });

    // Reference mutations
    const createSubject = async (data) => {
        const created = await timetableApi.subjects.create(data);
        queryClient.invalidateQueries({ queryKey: ['timetable_ref_data'] });
        return created;
    };
    const updateSubject = async (id, data) => {
        const updated = await timetableApi.subjects.update(id, data);
        queryClient.invalidateQueries({ queryKey: ['timetable_ref_data'] });
        return updated;
    };
    const deleteSubject = async (id) => {
        await timetableApi.subjects.delete(id);
        queryClient.invalidateQueries({ queryKey: ['timetable_ref_data'] });
    };

    const createRoom = async (data) => {
        const created = await timetableApi.rooms.create(data);
        queryClient.invalidateQueries({ queryKey: ['timetable_ref_data'] });
        return created;
    };
    const updateRoom = async (id, data) => {
        const updated = await timetableApi.rooms.update(id, data);
        queryClient.invalidateQueries({ queryKey: ['timetable_ref_data'] });
        return updated;
    };
    const deleteRoom = async (id) => {
        await timetableApi.rooms.delete(id);
        queryClient.invalidateQueries({ queryKey: ['timetable_ref_data'] });
    };

    // Actions
    const autoFillRemaining = async (preferences = {}) => {
        if (!classSessionId) return null;
        const result = await timetableApi.scheduling.generate({
            class_session: classSessionId,
            mode: 'semi_auto',
            preferences: {
                prefer_morning: true,
                spread_subjects: true,
                ...preferences,
            },
        });
        queryClient.invalidateQueries({ queryKey: ['timetable_slots', classSessionId] });
        queryClient.invalidateQueries({ queryKey: ['timetable_coverage', classSessionId] });
        return result;
    };

    const toggleLock = async () => {
        let newLock;
        if (!lockStatus) {
            newLock = await timetableApi.locks.create({
                class_session: classSessionId,
                lock_level: 'locked',
            });
        } else if (lockStatus.is_editable) {
            await timetableApi.locks.lock(lockStatus.id);
        } else {
            await timetableApi.locks.unlock(lockStatus.id);
        }
        refetchLockStatus();
        return newLock || lockStatus;
    };

    const createSnapshot = async (label, description = '') => {
        if (!classSessionId) return null;
        const res = await timetableApi.versions.createSnapshot({
            class_session: classSessionId,
            label,
            description,
        });
        queryClient.invalidateQueries({ queryKey: ['timetable_versions', classSessionId] });
        return res;
    };

    const restoreSnapshotMutation = useMutation({
        mutationFn: async (versionId) => {
            return await timetableApi.versions.restore(versionId);
        },
        onSuccess: () => {
            refresh();
        }
    });

    const restoreSnapshot = (versionId) => restoreSnapshotMutation.mutateAsync(versionId);

    const getAvailableSlots = useCallback(async (allocationId) => {
        try {
            return await timetableApi.allocations.availableSlots(allocationId);
        } catch (err) {
            console.error('Failed to get available slots', err);
            return [];
        }
    }, []);

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['timetable_ref_data'] });
        queryClient.invalidateQueries({ queryKey: ['class_sessions'] });
        queryClient.invalidateQueries({ queryKey: ['teachers_list'] });
        queryClient.invalidateQueries({ queryKey: ['timetable_exceptions'] });
        if (classSessionId) {
            queryClient.invalidateQueries({ queryKey: ['timetable_slots', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_allocations', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_coverage', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_lock', classSessionId] });
        }
    };

    const refreshSlots = () => {
        if (classSessionId) {
            queryClient.invalidateQueries({ queryKey: ['timetable_slots', classSessionId] });
            queryClient.invalidateQueries({ queryKey: ['timetable_coverage', classSessionId] });
        }
    };

    const isLocked = lockStatus && !lockStatus.is_editable;
    const coveragePercentage = coverage?.summary?.overall_percentage ?? 0;
    const unscheduledAllocations = allocations.filter(a => a.remaining_lessons > 0);

    const isInitialLoading = isLoadingRefData || isLoadingSessions || isLoadingTeachers;
    const isSaving = createSlotMutation.isPending || updateSlotMutation.isPending || deleteSlotMutation.isPending;
    
    return {
        // Reference data
        subjects: refData?.subjects || [],
        rooms: refData?.rooms || [],
        periods: refData?.periods || [],
        classSessions: classSessions || [],
        teachers: teachers || [],

        // Timetable data
        weeklyView: slotData?.weeklyView || {},
        slots: slotData?.slots || [],
        allocations,
        workAllocations: allocations, // alias
        exceptions,
        coverage,
        versions,

        // State
        loading: isInitialLoading,
        loadingSlots: isLoadingSlots,
        loadingVersions: isLoadingVersions,
        saving: isSaving,
        error: refError ? parseApiError(refError) : null,
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

        // Slot mutations (wrapped to match original signature)
        createSlot: (data, skipConflictCheck = false) => createSlotMutation.mutateAsync({ data, skipConflictCheck }),
        updateSlot: (id, data, skipConflictCheck = false) => updateSlotMutation.mutateAsync({ id, data, skipConflictCheck }),
        deleteSlot: (id) => deleteSlotMutation.mutateAsync(id),
        replaceSlot: (id, data) => replaceSlotMutation.mutateAsync({ id, data }),

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
        restoreSnapshot,
    };
};

export default useTimetableData;
