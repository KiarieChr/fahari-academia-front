import React, { useMemo, useState } from 'react';
import { LayoutTemplate, Users, Plus, Edit2, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ROOM_TYPES = ['classroom', 'lab', 'hall', 'library', 'gym', 'other'];

const EMPTY_FORM = { name: '', room_type: 'classroom', capacity: '', notes: '' };

/**
 * RoomAllocationView
 * Props:
 *  rooms        — array of Room objects from API
 *  slots        — flat array of TimetableSlot objects (used to compute utilization)
 *  onCreateRoom — async (data) => Room
 *  onUpdateRoom — async (id, data) => Room
 *  onDeleteRoom — async (id) => void
 */
const RoomAllocationView = ({ rooms = [], slots = [], onCreateRoom, onUpdateRoom, onDeleteRoom }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // ── Compute slot count per room ───────────────────────────────
    const slotCountByRoom = useMemo(() => {
        const counts = {};
        slots.forEach((s) => {
            if (s.room) counts[s.room] = (counts[s.room] ?? 0) + 1;
        });
        return counts;
    }, [slots]);

    // Max theoretical weekly slots = 5 days × 8 periods
    const MAX_WEEKLY_SLOTS = 40;

    const openCreate = () => {
        setEditingRoom(null);
        setForm(EMPTY_FORM);
        setError(null);
        setIsModalOpen(true);
    };

    const openEdit = (room) => {
        setEditingRoom(room);
        setForm({ name: room.name, room_type: room.room_type ?? 'classroom', capacity: room.capacity ?? '', notes: room.notes ?? '' });
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setEditingRoom(null); setError(null); };

    const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        if (!form.name) { setError('Room name is required.'); return; }
        setSaving(true); setError(null);
        try {
            if (editingRoom) await onUpdateRoom(editingRoom.id, form);
            else await onCreateRoom(form);
            closeModal();
        } catch (err) {
            setError(err.message || 'Failed to save room.');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try { await onDeleteRoom(id); } finally { setConfirmDelete(null); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Room Allocation</h3>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} /> Add Room
                </button>
            </div>

            {rooms.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <p className="text-slate-400 text-sm">No rooms configured yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rooms.map((room) => {
                        const assigned = slotCountByRoom[room.id] ?? 0;
                        const utilPct = Math.min(Math.round((assigned / MAX_WEEKLY_SLOTS) * 100), 100);
                        const statusLabel = !room.is_active ? 'Inactive' : utilPct >= 90 ? 'Full' : utilPct > 0 ? 'In Use' : 'Free';
                        const statusColor = statusLabel === 'Full' ? 'bg-red-100 text-red-700' :
                            statusLabel === 'In Use' ? 'bg-green-100 text-green-700' :
                                statusLabel === 'Inactive' ? 'bg-slate-100 text-slate-500' :
                                    'bg-slate-100 text-slate-600';

                        return (
                            <div key={room.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        <LayoutTemplate size={20} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor}`}>{statusLabel}</span>
                                        <button onClick={() => openEdit(room)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                            <Edit2 size={13} />
                                        </button>
                                        <button onClick={() => setConfirmDelete(room)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{room.name}</h3>
                                <p className="text-xs text-slate-400 capitalize mb-2">{room.room_type_display ?? room.room_type}</p>

                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    <Users size={14} />
                                    <span>Capacity: {room.capacity ?? '—'}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                                        <span>Weekly Utilization</span>
                                        <span>{utilPct}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${utilPct >= 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${utilPct}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">{assigned} of {MAX_WEEKLY_SLOTS} slots used</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Add/Edit Room Modal ─────────────────────────────────── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingRoom ? 'Edit Room' : 'Add Room'}</h3>
                                <button onClick={closeModal}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                            </div>
                            {error && <div className="flex gap-2 items-start bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-4"><AlertTriangle size={14} className="mt-0.5" />{error}</div>}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Room Name *</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Room 1A" className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                        <select name="room_type" value={form.room_type} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                            {ROOM_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                                        <input type="number" name="capacity" value={form.capacity} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                                </div>
                                <button onClick={handleSave} disabled={saving} className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                                    {saving && <Loader2 size={16} className="animate-spin" />}
                                    {editingRoom ? 'Update Room' : 'Save Room'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Confirm Delete ─────────────────────────────────────── */}
            <AnimatePresence>
                {confirmDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-6"
                        >
                            <p className="text-sm text-slate-600 mb-4">Delete <strong>{confirmDelete.name}</strong>? Slots assigned to this room will become unroomed.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button onClick={() => handleDelete(confirmDelete.id)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoomAllocationView;
