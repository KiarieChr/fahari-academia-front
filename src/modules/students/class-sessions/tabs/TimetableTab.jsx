import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Lock, Unlock, Wand2, History, Eye, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '../../../../services/apiClient';
import TimetableStats from '../components/TimetableStats';
import TimetableGrid from '../components/TimetableGrid';
import TimetableFilters from '../components/TimetableFilters';
import CreateEditTimetableModal from '../components/modals/CreateEditTimetableModal';
import PublishTimetableModal from '../components/modals/PublishTimetableModal';
import ViewTimetableModal from '../components/modals/ViewTimetableModal';
import WorkAllocationsPanel from '../components/WorkAllocationsPanel';
import TimePeriodsPanel from '../components/TimePeriodsPanel';

const TimetableTab = () => {
    const [classSessions, setClassSessions] = useState([]);
    const [selectedClassSession, setSelectedClassSession] = useState(null);
    const [slots, setSlots] = useState([]);
    const [locks, setLocks] = useState([]);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await api.academics.getActiveSessions();
                const results = data.results || data;
                setClassSessions(results);
                if (results.length > 0) setSelectedClassSession(results[0]);
            } catch {
                toast.error('Failed to load class sessions');
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

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

    const currentLock = locks.find(l => l.class_session === selectedClassSession?.id);
    const isLocked = currentLock && (currentLock.lock_level === 'locked' || currentLock.lock_level === 'archived');

    const handleDeleteSlot = async (slotId) => {
        if (!confirm('Delete this timetable slot?')) return;
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
        if (!confirm('Auto-generate timetable for this class? Existing slots will remain.')) return;
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

    const totalSlots = slots.length;
    const uniqueSubjects = new Set(slots.map(s => s.subject)).size;
    const uniqueTeachers = new Set(slots.map(s => s.teacher)).size;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Slots', value: totalSlots, color: 'bg-blue-100 text-blue-700' },
                    { label: 'Subjects', value: uniqueSubjects, color: 'bg-purple-100 text-purple-700' },
                    { label: 'Teachers', value: uniqueTeachers, color: 'bg-green-100 text-green-700' },
                    { label: 'Versions', value: versions.length, color: 'bg-yellow-100 text-yellow-700' },
                ].map((stat, idx) => (
                    <div key={idx} className={`${stat.color} rounded-lg p-5 shadow-sm border border-gray-200`}>
                        <p className="text-sm font-medium opacity-75 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-3">Select Class</h3>
                        <TimetableFilters
                            classSessions={classSessions}
                            selectedClassSession={selectedClassSession}
                            onClassSessionChange={setSelectedClassSession}
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
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
            </div>

            {isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-800 text-sm">
                    <Lock size={16} />
                    <span className="font-medium">This timetable is locked.</span> Unlock it to make changes.
                </div>
            )}

            {/* Timetable Grid */}
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

            {/* Day Structure */}
            <TimePeriodsPanel />

            {/* Teacher Allocations */}
            {selectedClassSession && (
                <WorkAllocationsPanel
                    classSessionId={selectedClassSession.id}
                    classSessionName={selectedClassSession.name}
                />
            )}

            {selectedClassSession && <TimetableStats classSessionId={selectedClassSession.id} />}

            {showCreateModal && (
                <CreateEditTimetableModal
                    isOpen={showCreateModal}
                    onClose={() => { setShowCreateModal(false); setEditingSlot(null); }}
                    classSessionId={selectedClassSession?.id}
                    editingSlot={editingSlot}
                    onSaved={loadTimetableData}
                />
            )}
            {showPublishModal && (
                <PublishTimetableModal
                    isOpen={showPublishModal}
                    onClose={() => setShowPublishModal(false)}
                    classSessionId={selectedClassSession?.id}
                    lockData={currentLock}
                    onLocked={loadTimetableData}
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
        </motion.div>
    );
};

export default TimetableTab;
