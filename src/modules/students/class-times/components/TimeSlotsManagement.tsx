import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import { Input, Select, FormField, inputClass } from '../../../../components/ui/FormField';

const DAY_CHOICES = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' },
];

const EMPTY_FORM = {
    class_session: '',
    subject: '',
    teacher: '',
    room: '',
    day_of_week: 0,
    start_time: '',
    end_time: '',
    effective_from: new Date().toISOString().slice(0, 10),
};

/**
 * TimeSlotsManagement
 * Props:
 *  slots          — flat array of TimetableSlot objects from API
 *  subjects       — array of Subject objects
 *  rooms          — array of Room objects
 *  classSessions  — array of ClassSession objects
 *  onCreateSlot   — async (data) => slot
 *  onUpdateSlot   — async (id, data) => slot
 *  onDeleteSlot   — async (id) => void
 */
const TimeSlotsManagement = ({
    slots = [],
    subjects = [],
    rooms = [],
    classSessions = [],
    onCreateSlot,
    onUpdateSlot,
    onDeleteSlot,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const openCreate = () => {
        setEditingSlot(null);
        setForm(EMPTY_FORM);
        setError(null);
        setIsModalOpen(true);
    };

    const openEdit = (slot) => {
        setEditingSlot(slot);
        setForm({
            class_session: slot.class_session ?? '',
            subject: slot.subject ?? '',
            teacher: slot.teacher ?? '',
            room: slot.room ?? '',
            day_of_week: slot.day_of_week ?? 0,
            start_time: slot.start_time ?? '',
            end_time: slot.end_time ?? '',
            effective_from: slot.effective_from ?? new Date().toISOString().slice(0, 10),
        });
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSlot(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!form.class_session || !form.subject || !form.teacher || !form.start_time || !form.end_time) {
            setError('Class, subject, teacher, start time, and end time are required.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            if (editingSlot) {
                await onUpdateSlot(editingSlot.id, form);
            } else {
                await onCreateSlot(form);
            }
            closeModal();
        } catch (err) {
            const detail = err?.data
                ? Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
                : err.message;
            setError(detail || 'Failed to save slot.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await onDeleteSlot(id);
        } finally {
            setDeleting(false);
            setConfirmDelete(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Timetable Slots</h3>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} /> Add Slot
                </button>
            </div>

            {slots.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <p className="text-slate-400 text-sm">No slots configured yet. Add the first slot above.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Class</th>
                                    <th className="px-5 py-3 font-semibold">Subject</th>
                                    <th className="px-5 py-3 font-semibold">Teacher</th>
                                    <th className="px-5 py-3 font-semibold">Day</th>
                                    <th className="px-5 py-3 font-semibold">Start</th>
                                    <th className="px-5 py-3 font-semibold">End</th>
                                    <th className="px-5 py-3 font-semibold">Duration</th>
                                    <th className="px-5 py-3 font-semibold">Room</th>
                                    <th className="px-5 py-3 font-semibold">Active</th>
                                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {slots.map((slot) => (
                                    <tr key={slot.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">{slot.class_session_name ?? slot.class_session}</td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {slot.subject_color && (
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: slot.subject_color }} />
                                                )}
                                                {slot.subject_name ?? slot.subject}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{slot.teacher_name ?? slot.teacher}</td>
                                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{slot.day_display ?? DAY_CHOICES.find(d => d.value === slot.day_of_week)?.label}</td>
                                        <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-400">{slot.start_time}</td>
                                        <td className="px-5 py-3 font-mono text-slate-600 dark:text-slate-400">{slot.end_time}</td>
                                        <td className="px-5 py-3 text-slate-500">{slot.duration_minutes ? `${slot.duration_minutes}m` : '—'}</td>
                                        <td className="px-5 py-3 text-slate-500">{slot.room_name ?? '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${slot.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {slot.is_active ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(slot)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(slot)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Add/Edit Slot Modal ─────────────────────────────────── */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingSlot ? 'Edit Timetable Slot' : 'New Timetable Slot'}
                size="md"
                accentColor="bg-blue-500"
                footer={
                    <>
                        <Modal.CancelButton onClick={closeModal} />
                        <Modal.SubmitButton onClick={handleSave} loading={saving}>
                            {editingSlot ? 'Update Slot' : 'Save Slot'}
                        </Modal.SubmitButton>
                    </>
                }
            >
                <div className="space-y-5">
                    {error && (
                        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3">
                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Class session */}
                    <FormField label="Class" required>
                        <Select name="class_session" value={form.class_session} onChange={handleChange}>
                            <option value="">Select class…</option>
                            {classSessions.map((cs) => (
                                <option key={cs.id} value={cs.id}>{cs.name ?? `${cs.grade_name} – ${cs.term_name}`}</option>
                            ))}
                        </Select>
                    </FormField>

                    {/* Subject */}
                    <FormField label="Subject" required>
                        <Select name="subject" value={form.subject} onChange={handleChange}>
                            <option value="">Select subject…</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </Select>
                    </FormField>

                    {/* Teacher */}
                    <FormField label="Teacher ID" required>
                        <Input
                            type="number"
                            name="teacher"
                            value={form.teacher}
                            onChange={handleChange}
                            placeholder="User ID of teacher"
                        />
                    </FormField>

                    {/* Day + Times */}
                    <div className="grid grid-cols-3 gap-4">
                        <FormField label="Day">
                            <Select name="day_of_week" value={form.day_of_week} onChange={handleChange}>
                                {DAY_CHOICES.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Start" required>
                            <Input type="time" name="start_time" value={form.start_time} onChange={handleChange} />
                        </FormField>
                        <FormField label="End" required>
                            <Input type="time" name="end_time" value={form.end_time} onChange={handleChange} />
                        </FormField>
                    </div>

                    {/* Room */}
                    <FormField label="Room (optional)">
                        <Select name="room" value={form.room} onChange={handleChange}>
                            <option value="">No room assigned</option>
                            {rooms.map((r) => (
                                <option key={r.id} value={r.id}>{r.name} (cap {r.capacity})</option>
                            ))}
                        </Select>
                    </FormField>

                    {/* Effective from */}
                    <FormField label="Effective From">
                        <Input type="date" name="effective_from" value={form.effective_from} onChange={handleChange} />
                    </FormField>
                </div>
            </Modal>

            {/* ── Confirm Delete Dialog ──────────────────────────────── */}
            <Modal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                title="Delete Slot?"
                subtitle="This action cannot be undone"
                icon={
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                    </div>
                }
                size="sm"
                accentColor="bg-red-500"
                footer={
                    <>
                        <Modal.CancelButton onClick={() => setConfirmDelete(null)} />
                        <Modal.SubmitButton
                            onClick={() => handleDelete(confirmDelete.id)}
                            loading={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </Modal.SubmitButton>
                    </>
                }
            >
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3">
                    This will permanently remove the <strong className="text-slate-900 dark:text-white">{confirmDelete?.subject_name}</strong> slot
                    on <strong className="text-slate-900 dark:text-white">{confirmDelete?.day_display}</strong> at {confirmDelete?.start_time}.
                    Related planned lessons will also be removed.
                </p>
            </Modal>
        </div>
    );
};

export default TimeSlotsManagement;
