import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import { motion } from 'framer-motion';
import {
    Clock, Calendar, Users, LayoutTemplate, Plus, Printer,
    Settings, RefreshCcw, Loader2, Wand2
} from 'lucide-react';

import ClassTimesFilterBar from './components/ClassTimesFilterBar';
import ClassTimesOverview from './components/ClassTimesOverview';
import TimeSlotsManagement from './components/TimeSlotsManagement';
import WeeklyTimetable from './components/WeeklyTimetable';
import TeacherScheduleView from './components/TeacherScheduleView';
import RoomAllocationView from './components/RoomAllocationView';
import ConflictPanel from './components/ConflictPanel';
import SlotAssignmentModal from './components/SlotAssignmentModal';

import useTimetableData from './hooks/useTimetableData';
import { timetableApi } from './services/timetableApi';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'slots', label: 'Time Slots', icon: Settings },
    { id: 'teachers', label: 'Teacher Schedules', icon: Users },
    { id: 'rooms', label: 'Room Allocation', icon: LayoutTemplate },
];

const ClassTimesDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // ── Filters state lifted up so FilterBar can update it ───────
    const [filters, setFilters] = useState({ classSessionId: null });

    // ── Modal state ──────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [slotDefaults, setSlotDefaults] = useState(null);
    const [generating, setGenerating] = useState(false);

    const {
        subjects, rooms, classSessions, exceptions, teachers,
        weeklyView, slots, workAllocations, conflictErrors,
        loading, error, refresh,
        createSlot, updateSlot, deleteSlot,
        createSlotWithConflictCheck, updateSlotWithConflictCheck,
        createSubject, updateSubject, deleteSubject,
        createRoom, updateRoom, deleteRoom,
        clearConflictErrors,
    } = useTimetableData(filters);

    // ── Open modal for new slot ─────────────────────────────────
    const handleAssignSlot = useCallback((defaults) => {
        setEditingSlot(null);
        setSlotDefaults(defaults);
        setModalOpen(true);
    }, []);

    // ── Open modal for editing existing slot ────────────────────
    const handleEditSlot = useCallback((slot) => {
        setEditingSlot(slot);
        setSlotDefaults(null);
        setModalOpen(true);
    }, []);

    // ── Handle modal save ───────────────────────────────────────
    const handleSaveSlot = useCallback(async (slotData) => {
        if (slotData.id) {
            await updateSlotWithConflictCheck?.(slotData.id, slotData) 
                || await updateSlot(slotData.id, slotData);
        } else {
            await createSlotWithConflictCheck?.(slotData) 
                || await createSlot(slotData);
        }
        setModalOpen(false);
        setEditingSlot(null);
        setSlotDefaults(null);
    }, [createSlot, updateSlot, createSlotWithConflictCheck, updateSlotWithConflictCheck]);

    // ── Handle modal delete ─────────────────────────────────────
    const handleDeleteSlot = useCallback(async (slot) => {
        await deleteSlot(slot.id);
        setModalOpen(false);
        setEditingSlot(null);
    }, [deleteSlot]);

    // ── Handle close modal ──────────────────────────────────────
    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setEditingSlot(null);
        setSlotDefaults(null);
        clearConflictErrors?.();
    }, [clearConflictErrors]);

    // ── Auto-generate timetable ─────────────────────────────────
    const handleGenerateTimetable = useCallback(async () => {
        if (!filters.classSessionId) {
            alert('Please select a class first');
            return;
        }
        setGenerating(true);
        try {
            await timetableApi.generateTimetable({
                class_session_id: filters.classSessionId,
                strategy: 'greedy',
            });
            refresh();
        } catch (err) {
            console.error('Generation failed:', err);
            alert(err.message || 'Failed to generate timetable');
        } finally {
            setGenerating(false);
        }
    }, [filters.classSessionId, refresh]);

    // ── Derived overview metrics from live data ───────────────────
    const summaryMetrics = {
        totalClasses: { value: classSessions.length, label: 'Total Classes', status: 'success' },
        totalSubjects: { value: subjects.length, label: 'Active Subjects', status: 'info' },
        totalSlots: { value: slots.length, label: 'Time Slots', status: 'neutral' },
        assignedTeachers: { value: new Set(slots.map(s => s.teacher)).size, label: 'Teachers Assigned', status: 'success' },
        roomUtilization: { value: rooms.length ? `${Math.round((slots.map(s => s.room).filter(Boolean).length / (rooms.length * 5 * slots.length || 1)) * 100)}%` : '—', label: 'Room Usage', status: 'warning' },
        conflicts: { value: exceptions.length, label: 'Active Exceptions', status: exceptions.length > 0 ? 'error' : 'success' },
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-24">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                    <span className="ml-3 text-slate-500 font-medium">Loading timetable data…</span>
                </div>
            );
        }
        if (error) {
            return (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-red-700 font-semibold">{error}</p>
                    <button onClick={refresh} className="mt-3 text-sm text-red-600 underline">Retry</button>
                </div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <ClassTimesOverview metrics={summaryMetrics} />
                        <ConflictPanel conflicts={exceptions} />
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Weekly Schedule Preview</h3>
                                <button onClick={() => setActiveTab('timetable')} className="text-sm text-blue-600 font-medium hover:underline">View Full Timetable</button>
                            </div>
                            <WeeklyTimetable
                                weeklyView={weeklyView}
                                slots={slots}
                                onEditSlot={handleEditSlot}
                                onDeleteSlot={handleDeleteSlot}
                                onAssignSlot={handleAssignSlot}
                                conflicts={conflictErrors?.map(e => e.slotId).filter(Boolean) || []}
                            />
                        </div>
                    </div>
                );
            case 'timetable':
                return (
                    <div className="space-y-6">
                        <ConflictPanel conflicts={exceptions} />
                        <WeeklyTimetable
                            weeklyView={weeklyView}
                            slots={slots}
                            onEditSlot={handleEditSlot}
                            onDeleteSlot={handleDeleteSlot}
                            onAssignSlot={handleAssignSlot}
                            conflicts={conflictErrors?.map(e => e.slotId).filter(Boolean) || []}
                        />
                    </div>
                );
            case 'slots':
                return (
                    <TimeSlotsManagement
                        slots={slots}
                        subjects={subjects}
                        rooms={rooms}
                        classSessions={classSessions}
                        onCreateSlot={createSlot}
                        onUpdateSlot={updateSlot}
                        onDeleteSlot={deleteSlot}
                    />
                );
            case 'teachers':
                return (
                    <TeacherScheduleView
                        slots={slots}
                        subjects={subjects}
                    />
                );
            case 'rooms':
                return (
                    <RoomAllocationView
                        rooms={rooms}
                        slots={slots}
                        onCreateRoom={createRoom}
                        onUpdateRoom={updateRoom}
                        onDeleteRoom={deleteRoom}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <DashboardLayout title="Class Times">
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors">
            <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Class Times &amp; Timetable</h1>
                        <p className="text-slate-500 dark:text-slate-400">Configure lesson periods, schedules, and class allocations.</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={refresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Printer size={18} />
                            Print
                        </button>
                        {filters.classSessionId && (
                            <button
                                onClick={handleGenerateTimetable}
                                disabled={generating || loading}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl font-medium shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:bg-violet-700 transition-colors disabled:opacity-50"
                            >
                                {generating ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Wand2 size={18} />
                                )}
                                Auto-Generate
                            </button>
                        )}
                        <button
                            onClick={() => handleAssignSlot(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Add Slot
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                {activeTab !== 'slots' && (
                    <ClassTimesFilterBar
                        classSessions={classSessions}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                )}

                {/* Tabs / Navigation */}
                <div className="space-y-6">
                    <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2 border-b border-slate-200 dark:border-slate-700">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-lg'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>

            </div>
        </div>

        {/* Slot Assignment Modal */}
        <SlotAssignmentModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            slot={editingSlot}
            defaultValues={slotDefaults}
            classSessionId={filters.classSessionId}
            subjects={subjects}
            teachers={teachers || []}
            rooms={rooms}
            workAllocations={workAllocations || []}
            onSave={handleSaveSlot}
            onDelete={handleDeleteSlot}
        />
        </DashboardLayout>
    );
};

export default ClassTimesDashboard;
