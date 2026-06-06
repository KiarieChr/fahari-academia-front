import React, { useState, useEffect, useCallback } from 'react';
import {
    Calendar, Clock, Users, LayoutTemplate, BarChart3,
    Plus, Lock, Unlock, Wand2, History, Eye, Loader2, RefreshCcw,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { api } from '../../services/apiClient';
import Swal from 'sweetalert2';

// Relocated local components
import TimetableGrid from './components/TimetableGrid';
import TimetableFilters from './components/TimetableFilters';
import TimetableStats from './components/TimetableStats';
import TimePeriodsPanel from './components/TimePeriodsPanel';
import WorkAllocationsPanel from './components/WorkAllocationsPanel';
import CreateEditTimetableModal from './components/modals/CreateEditTimetableModal';
import ViewTimetableModal from './components/modals/ViewTimetableModal';

// ─── Tab definitions ────────────────────────────────────────────
const TABS = [
    { id: 'timetable', label: 'Weekly Timetable', icon: Calendar },
    { id: 'slots', label: 'Day Structure', icon: Clock },
    { id: 'allocations', label: 'Work Allocations', icon: Briefcase },
    { id: 'teachers', label: 'Teacher Schedules', icon: Users },
    { id: 'rooms', label: 'Room Allocation', icon: LayoutTemplate },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

// ─── Day helpers ────────────────────────────────────────────────
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ═══════════════════════════════════════════════════════════════
// TEACHER SCHEDULES TAB (real API)
// ═══════════════════════════════════════════════════════════════
const TeacherSchedulesTab = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.timetable.getTeachers();
                setTeachers((data.results || data) || []);
            } catch {
                toast.error('Failed to load teachers');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const loadSchedule = async (teacherId) => {
        setScheduleLoading(true);
        try {
            const data = await api.timetable.getTeacherTimetable(teacherId);
            setSchedule(data);
        } catch {
            toast.error('Failed to load teacher schedule');
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleSelectTeacher = (teacher) => {
        setSelectedTeacher(teacher);
        loadSchedule(teacher.id);
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>;

    return (
        <div className="space-y-6">
            {/* Teacher list */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Users size={20} className="text-indigo-600" />
                        Teachers ({teachers.length})
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {teachers.map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleSelectTeacher(t)}
                            className={`p-3 rounded-lg border text-left transition-all text-sm ${
                                selectedTeacher?.id === t.id
                                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                            }`}
                        >
                            <p className="font-medium text-gray-900 truncate">
                                {t.first_name} {t.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{t.username}</p>
                        </button>
                    ))}
                    {teachers.length === 0 && (
                        <p className="col-span-full text-center text-gray-400 py-8">No teachers found</p>
                    )}
                </div>
            </div>

            {/* Selected teacher schedule */}
            {selectedTeacher && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Schedule: {selectedTeacher.first_name} {selectedTeacher.last_name}
                        </h3>
                    </div>
                    {scheduleLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>
                    ) : schedule?.days ? (
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr>
                                        <th className="text-left py-3 px-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">Time</th>
                                        {DAY_NAMES.map(d => (
                                            <th key={d} className="text-center py-3 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">{d}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const allSlots = Object.values(schedule.days).flat();
                                        const times = [...new Set(allSlots.map(s => s.start_time))].sort();
                                        return times.map(time => (
                                            <tr key={time} className="border-b border-gray-100">
                                                <td className="py-2 px-4 font-mono text-xs text-gray-500">{time?.slice(0, 5)}</td>
                                                {DAY_NAMES.map(day => {
                                                    const daySlots = (schedule.days[day] || []).filter(s => s.start_time === time);
                                                    return (
                                                        <td key={day} className="py-2 px-3 text-center">
                                                            {daySlots.map((s, i) => (
                                                                <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1.5 mb-1">
                                                                    <p className="font-medium text-indigo-800 text-xs">{s.subject_name}</p>
                                                                    <p className="text-[10px] text-indigo-500">{s.class_session_name}</p>
                                                                    {s.room_name && <p className="text-[10px] text-gray-400">{s.room_name}</p>}
                                                                </div>
                                                            ))}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                            {Object.values(schedule.days).flat().length === 0 && (
                                <p className="text-center text-gray-400 py-8">No scheduled classes for this teacher</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-8">Select a teacher to view their schedule</p>
                    )}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// ROOM ALLOCATION TAB (real API)
// ═══════════════════════════════════════════════════════════════
const RoomAllocationTab = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.timetable.getRooms();
                setRooms((data.results || data) || []);
            } catch {
                toast.error('Failed to load rooms');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const loadSchedule = async (roomId) => {
        setScheduleLoading(true);
        try {
            const data = await api.timetable.getRoomTimetable(roomId);
            setSchedule(data);
        } catch {
            toast.error('Failed to load room schedule');
        } finally {
            setScheduleLoading(false);
        }
    };

    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
        loadSchedule(room.id);
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-indigo-600" />
                        Rooms ({rooms.length})
                    </h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {rooms.map(r => (
                        <button
                            key={r.id}
                            onClick={() => handleSelectRoom(r)}
                            className={`p-3 rounded-lg border text-left transition-all text-sm ${
                                selectedRoom?.id === r.id
                                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                            }`}
                        >
                            <p className="font-medium text-gray-900 truncate">{r.name}</p>
                            <p className="text-xs text-gray-500">{r.room_type} · Cap: {r.capacity || '—'}</p>
                        </button>
                    ))}
                    {rooms.length === 0 && (
                        <p className="col-span-full text-center text-gray-400 py-8">No rooms configured</p>
                    )}
                </div>
            </div>

            {selectedRoom && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Schedule: {selectedRoom.name}
                        </h3>
                    </div>
                    {scheduleLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>
                    ) : schedule?.days ? (
                        <div className="p-6 overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr>
                                        <th className="text-left py-3 px-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">Time</th>
                                        {DAY_NAMES.map(d => (
                                            <th key={d} className="text-center py-3 px-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">{d}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const allSlots = Object.values(schedule.days).flat();
                                        const times = [...new Set(allSlots.map(s => s.start_time))].sort();
                                        return times.map(time => (
                                            <tr key={time} className="border-b border-gray-100">
                                                <td className="py-2 px-4 font-mono text-xs text-gray-500">{time?.slice(0, 5)}</td>
                                                {DAY_NAMES.map(day => {
                                                    const daySlots = (schedule.days[day] || []).filter(s => s.start_time === time);
                                                    return (
                                                        <td key={day} className="py-2 px-3 text-center">
                                                            {daySlots.map((s, i) => (
                                                                <div key={i} className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 mb-1">
                                                                    <p className="font-medium text-green-800 text-xs">{s.subject_name}</p>
                                                                    <p className="text-[10px] text-green-600">{s.class_session_name}</p>
                                                                    <p className="text-[10px] text-gray-400">{s.teacher_name}</p>
                                                                </div>
                                                            ))}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                            {Object.values(schedule.days).flat().length === 0 && (
                                <p className="text-center text-gray-400 py-8">No classes scheduled in this room</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-8">Select a room to view its schedule</p>
                    )}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// ANALYTICS TAB (real API)
// ═══════════════════════════════════════════════════════════════
const AnalyticsTab = ({ classSessionId }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await api.timetable.getAnalytics('dashboard');
                setAnalytics(data);
            } catch {
                toast.error('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>;
    if (!analytics) return <p className="text-center text-gray-400 py-8">No analytics data available</p>;

    const cards = [
        { label: 'Total Slots', value: analytics.total_slots ?? '—', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { label: 'Classes Covered', value: analytics.classes_covered ?? analytics.total_classes ?? '—', color: 'bg-green-50 text-green-700 border-green-200' },
        { label: 'Teachers Active', value: analytics.teachers_active ?? analytics.total_teachers ?? '—', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        { label: 'Rooms Used', value: analytics.rooms_used ?? analytics.total_rooms ?? '—', color: 'bg-orange-50 text-orange-700 border-orange-200' },
        { label: 'Avg Coverage', value: analytics.average_coverage ? `${Math.round(analytics.average_coverage)}%` : '—', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        { label: 'Conflicts', value: analytics.conflicts ?? analytics.total_conflicts ?? 0, color: 'bg-red-50 text-red-700 border-red-200' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className={`${c.color} border rounded-xl p-5`}>
                        <p className="text-xs font-medium opacity-70 mb-1">{c.label}</p>
                        <p className="text-2xl font-bold">{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Per-class coverage */}
            {classSessionId && <TimetableStats classSessionId={classSessionId} />}

            {/* Teacher workloads */}
            {analytics.teacher_workloads && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Workloads</h3>
                    <div className="space-y-3">
                        {analytics.teacher_workloads.map((tw, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700 w-40 truncate">{tw.teacher_name}</span>
                                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-full rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (tw.slots / Math.max(tw.max_slots || 30, 1)) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 w-16 text-right">{tw.slots} slots</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
const TimetableDashboard = ({ noLayout = false }) => {
    const [activeTab, setActiveTab] = useState('timetable');

    // ── Class session state ─────────────────────────────────────
    const [classSessions, setClassSessions] = useState([]);
    const [selectedClassSession, setSelectedClassSession] = useState(null);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    // ── Timetable data ──────────────────────────────────────────
    const [slots, setSlots] = useState([]);
    const [locks, setLocks] = useState([]);
    const [versions, setVersions] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    // ── Modals ──────────────────────────────────────────────────
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);

    // ── Load class sessions ─────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const data = await api.academics.getActiveSessions();
                const results = data.results || data;
                setClassSessions(results);
                if (results.length > 0) setSelectedClassSession(results[0]);
            } catch {
                toast.error('Failed to load class sessions');
            } finally {
                setSessionsLoading(false);
            }
        };
        load();
    }, []);

    // ── Load timetable data for selected class ──────────────────
    const loadTimetableData = useCallback(async () => {
        if (!selectedClassSession) return;
        setSlotsLoading(true);
        try {
            const [weeklyData, lockData, versionData] = await Promise.all([
                api.timetable.getWeeklyView(selectedClassSession.id),
                api.timetable.getLocks({ class_session: selectedClassSession.id }),
                api.timetable.getVersions({ class_session: selectedClassSession.id }),
            ]);
            setSlots(Object.values(weeklyData).flat());
            setLocks((lockData.results || lockData) || []);
            setVersions((versionData.results || versionData) || []);
        } catch {
            toast.error('Failed to load timetable data');
        } finally {
            setSlotsLoading(false);
        }
    }, [selectedClassSession]);

    useEffect(() => { loadTimetableData(); }, [loadTimetableData]);

    // ── Tab change ──────────────────────────────────────────────
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    // ── Lock state ──────────────────────────────────────────────
    const currentLock = locks.find(l => l.class_session === selectedClassSession?.id);
    const isLocked = currentLock && (currentLock.lock_level === 'locked' || currentLock.lock_level === 'archived');

    // ── Actions ─────────────────────────────────────────────────
    const handleDeleteSlot = async (slotId) => {
        const confirmResult = await Swal.fire({
            title: 'Delete Slot?',
            text: 'Are you sure you want to delete this timetable slot?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        });
        if (!confirmResult.isConfirmed) return;

        try {
            await api.timetable.deleteSlot(slotId);
            toast.success('Slot deleted');
            loadTimetableData();
        } catch {
            toast.error('Failed to delete slot');
        }
    };

    const handleAutoGenerate = async () => {
        if (!selectedClassSession) return;
        
        const confirmResult = await Swal.fire({
            title: 'Auto-Generate Timetable?',
            text: 'This will generate slots for this class. Existing slots will remain.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, generate it!'
        });
        if (!confirmResult.isConfirmed) return;

        try {
            const result = await api.timetable.generate({
                class_session: selectedClassSession.id,
                mode: 'semi_auto',
                preferences: { prefer_morning: true, spread_subjects: true, max_same_subject_per_day: 1 },
            });
            toast.success(`Generated ${result.placed_count}/${result.total_allocations} slots (${Math.round(result.placement_percentage)}%)`);
            if (result.unplaced?.length > 0) {
                toast.warning(`${result.unplaced.length} allocations could not be placed`);
            }
            loadTimetableData();
        } catch (err) {
            toast.error(err?.data?.error || 'Auto-generation failed');
        }
    };

    const handleCreateSnapshot = async () => {
        if (!selectedClassSession) return;
        try {
            await api.timetable.createSnapshot({
                class_session: selectedClassSession.id,
                label: `Snapshot ${new Date().toLocaleString()}`,
            });
            toast.success('Version snapshot created');
            loadTimetableData();
        } catch {
            toast.error('Failed to create snapshot');
        }
    };

    const handleLockToggle = async () => {
        try {
            if (!currentLock) {
                const newLock = await api.timetable.createLock({
                    class_session: selectedClassSession.id,
                    lock_level: 'draft',
                });
                await api.timetable.lockTimetable(newLock.id);
            } else if (isLocked) {
                await api.timetable.unlockTimetable(currentLock.id);
            } else {
                await api.timetable.lockTimetable(currentLock.id);
            }
            toast.success(isLocked ? 'Timetable unlocked' : 'Timetable locked');
            loadTimetableData();
        } catch (err) {
            toast.error(err?.data?.error || 'Failed to toggle lock');
        }
    };

    // ── Stats ───────────────────────────────────────────────────
    const totalSlots = slots.length;
    const uniqueSubjects = new Set(slots.map(s => s.subject)).size;
    const uniqueTeachers = new Set(slots.map(s => s.teacher)).size;

    // ── Render tab content ──────────────────────────────────────
    const renderContent = () => {
        switch (activeTab) {
            case 'timetable':
                return (
                    <div className="space-y-6">
                        {isLocked && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-800 text-sm">
                                <Lock size={16} />
                                <span className="font-medium">This timetable is locked.</span> Unlock it to make changes.
                            </div>
                        )}
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {selectedClassSession?.name || 'Select a class'}
                            </h3>
                            {slotsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                                </div>
                            ) : selectedClassSession ? (
                                <TimetableGrid
                                    classSessionId={selectedClassSession.id}
                                    onEditSlot={(slot) => { setEditingSlot(slot); setShowCreateModal(true); }}
                                    onDeleteSlot={handleDeleteSlot}
                                    isLocked={isLocked}
                                />
                            ) : (
                                <p className="text-gray-500 text-center py-8">Select a class session to view the timetable</p>
                            )}
                        </div>
                    </div>
                );

            case 'slots':
                return <TimePeriodsPanel />;

            case 'allocations':
                return selectedClassSession ? (
                    <WorkAllocationsPanel
                        classSessionId={selectedClassSession.id}
                        classSessionName={selectedClassSession.name}
                    />
                ) : (
                    <div className="bg-white rounded-xl p-12 border border-gray-200 text-center text-gray-400">
                        Select a class session first
                    </div>
                );

            case 'teachers':
                return <TeacherSchedulesTab />;

            case 'rooms':
                return <RoomAllocationTab />;

            case 'analytics':
                return <AnalyticsTab classSessionId={selectedClassSession?.id} />;

            default:
                return null;
        }
    };

    const content = (
            <div className="min-h-screen bg-slate-50/50">
                <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Timetable Management</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Configure day structure, assign teachers, and generate timetables
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={loadTimetableData} disabled={slotsLoading}
                                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50">
                                <RefreshCcw size={16} className={slotsLoading ? 'animate-spin' : ''} /> Refresh
                            </button>
                            <button onClick={handleAutoGenerate} disabled={isLocked || !selectedClassSession}
                                className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm disabled:opacity-50">
                                <Wand2 size={16} /> Auto-Generate
                            </button>
                            <button onClick={handleCreateSnapshot} disabled={!selectedClassSession}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50">
                                <History size={16} /> Snapshot
                            </button>
                            <button onClick={handleLockToggle} disabled={!selectedClassSession}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 ${isLocked ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                {isLocked ? <><Unlock size={16} /> Unlock</> : <><Lock size={16} /> Lock</>}
                            </button>
                            <button onClick={() => setShowViewModal(true)} disabled={!selectedClassSession}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm disabled:opacity-50">
                                <Eye size={16} /> Full View
                            </button>
                            <button onClick={() => { setEditingSlot(null); setShowCreateModal(true); }} disabled={isLocked || !selectedClassSession}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50">
                                <Plus size={18} /> Add Slot
                            </button>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Slots', value: totalSlots, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                            { label: 'Subjects', value: uniqueSubjects, color: 'bg-purple-50 text-purple-700 border-purple-200' },
                            { label: 'Teachers', value: uniqueTeachers, color: 'bg-green-50 text-green-700 border-green-200' },
                            { label: 'Versions', value: versions.length, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
                        ].map((stat, idx) => (
                            <div key={idx} className={`${stat.color} border rounded-xl p-4`}>
                                <p className="text-xs font-medium opacity-70 mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Class filter (shown on timetable and allocations tabs) */}
                    {['timetable', 'allocations', 'analytics'].includes(activeTab) && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold text-gray-700">Class:</span>
                                <div className="flex-1 max-w-sm">
                                    <TimetableFilters
                                        classSessions={classSessions}
                                        selectedClassSession={selectedClassSession}
                                        onClassSessionChange={setSelectedClassSession}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex overflow-x-auto pb-1 gap-1 border-b border-gray-200">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                                        isActive
                                            ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {sessionsLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                </div>
                            ) : (
                                renderContent()
                            )}
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>
    );

    return (
        <>
            {noLayout ? content : <DashboardLayout title="Timetable Management">{content}</DashboardLayout>}
            {/* Modals */}
            {showCreateModal && (
                <CreateEditTimetableModal
                    isOpen={showCreateModal}
                    onClose={() => { setShowCreateModal(false); setEditingSlot(null); }}
                    classSessionId={selectedClassSession?.id}
                    editingSlot={editingSlot}
                    onSaved={loadTimetableData}
                />
            )}
            {showViewModal && (
                <ViewTimetableModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    classSessionId={selectedClassSession?.id}
                    classSessionName={selectedClassSession?.name}
                />
            )}
        </>
    );
};

export default TimetableDashboard;
