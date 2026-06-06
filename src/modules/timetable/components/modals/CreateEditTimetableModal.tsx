import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Modal from '../../../../components/common/Modal';
import FormField, { Select, Input } from '../../../../components/ui/FormField';
import { api } from '../../../../services/apiClient';

const DAY_OPTIONS = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
];

const CreateEditTimetableModal = ({ isOpen, onClose, classSessionId, editingSlot, onSaved }) => {
    const [subjects, setSubjects] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [conflicts, setConflicts] = useState([]);

    const [formData, setFormData] = useState({
        subject: '',
        teacher: '',
        room: '',
        day_of_week: 0,
        start_time: '',
        end_time: '',
    });

    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            try {
                const [subjectData, roomData, periodData, allocationData] = await Promise.all([
                    api.timetable.getSubjects({ is_active: true }),
                    api.timetable.getRooms({ is_active: true }),
                    api.timetable.getSchedulablePeriods(),
                    classSessionId ? api.timetable.getAllocationsByClass(classSessionId) : Promise.resolve([]),
                ]);
                setSubjects((subjectData.results || subjectData) || []);
                setRooms((roomData.results || roomData) || []);
                setPeriods((periodData.results || periodData) || []);

                // Extract unique teachers from allocations
                const allocations = allocationData.results || allocationData || [];
                const teacherMap = {};
                allocations.forEach(a => { teacherMap[a.teacher] = a.teacher_name; });
                setTeachers(Object.entries(teacherMap).map(([id, name]) => ({ id: Number(id), name })));
            } catch {
                toast.error('Failed to load form options');
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, [classSessionId]);

    useEffect(() => {
        if (editingSlot) {
            setFormData({
                subject: editingSlot.subject || '',
                teacher: editingSlot.teacher || '',
                room: editingSlot.room || '',
                day_of_week: editingSlot.day_of_week ?? 0,
                start_time: editingSlot.start_time?.slice(0, 5) || '',
                end_time: editingSlot.end_time?.slice(0, 5) || '',
            });
        }
    }, [editingSlot]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setConflicts([]);
    };

    const handlePeriodSelect = (periodId) => {
        const period = periods.find(p => p.id === Number(periodId));
        if (period) {
            setFormData(prev => ({
                ...prev,
                start_time: period.start_time?.slice(0, 5) || '',
                end_time: period.end_time?.slice(0, 5) || '',
            }));
        }
    };

    const handleCheckConflict = async () => {
        if (!formData.subject || !formData.teacher || !formData.start_time || !formData.end_time) {
            toast.warning('Fill in subject, teacher, and time before checking conflicts');
            return;
        }
        try {
            const result = await api.timetable.checkConflict({
                class_session: classSessionId,
                subject: Number(formData.subject),
                teacher: Number(formData.teacher),
                room: formData.room ? Number(formData.room) : undefined,
                day_of_week: Number(formData.day_of_week),
                start_time: formData.start_time,
                end_time: formData.end_time,
            });
            if (result.is_valid) {
                setConflicts([]);
                toast.success('No conflicts found');
            } else {
                setConflicts(result.conflicts || []);
            }
        } catch (err) {
            toast.error(err?.data?.error || 'Conflict check failed');
        }
    };

    const handleSubmit = async () => {
        if (!formData.subject || !formData.teacher || !formData.start_time || !formData.end_time) {
            toast.warning('Please fill in all required fields');
            return;
        }
        saving || setLoading(true);
        setSaving(true);
        try {
            const payload = {
                class_session: classSessionId,
                subject: Number(formData.subject),
                teacher: Number(formData.teacher),
                room: formData.room ? Number(formData.room) : null,
                day_of_week: Number(formData.day_of_week),
                start_time: formData.start_time,
                end_time: formData.end_time,
                effective_from: new Date().toISOString().split('T')[0],
            };

            if (editingSlot) {
                await api.timetable.updateSlot(editingSlot.id, payload);
                toast.success('Slot updated');
            } else {
                await api.timetable.createSlot(payload);
                toast.success('Slot created');
            }
            onSaved?.();
            onClose();
        } catch (err) {
            const errors = err?.data?.non_field_errors || err?.data;
            if (Array.isArray(errors)) {
                errors.forEach(e => toast.error(typeof e === 'string' ? e : JSON.stringify(e)));
            } else {
                toast.error(err?.data?.error || 'Failed to save slot');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingSlot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
            subtitle="Configure subject, teacher, room, and time"
            size="lg"
            accentColor="bg-indigo-500"
            footer={<>
                <Modal.CancelButton onClick={onClose} />
                <button
                    onClick={handleCheckConflict}
                    disabled={saving || loading}
                    className="px-4 py-2 border border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 text-sm font-medium disabled:opacity-50"
                >
                    Check Conflicts
                </button>
                <Modal.SubmitButton onClick={handleSubmit} disabled={saving || loading}>
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : editingSlot ? 'Update Slot' : 'Create Slot'}
                </Modal.SubmitButton>
            </>}
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-indigo-600" size={24} />
                </div>
            ) : (
                <div className="space-y-5">
                    {conflicts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                                <AlertCircle size={16} /> Conflicts Detected
                            </div>
                            {conflicts.map((c, i) => (
                                <p key={i} className="text-xs text-red-600 ml-6">{c.message || c}</p>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Subject *">
                            <Select name="subject" value={formData.subject} onChange={handleChange}>
                                <option value="">Select subject...</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Teacher *">
                            <Select name="teacher" value={formData.teacher} onChange={handleChange}>
                                <option value="">Select teacher...</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Room">
                            <Select name="room" value={formData.room} onChange={handleChange}>
                                <option value="">No room</option>
                                {rooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.room_type_display})</option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField label="Day of Week *">
                            <Select name="day_of_week" value={formData.day_of_week} onChange={handleChange}>
                                {DAY_OPTIONS.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </Select>
                        </FormField>
                    </div>

                    {periods.length > 0 && (
                        <FormField label="Quick Select Period">
                            <Select onChange={(e) => handlePeriodSelect(e.target.value)} value="">
                                <option value="">Choose a period to auto-fill times...</option>
                                {periods.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.start_time?.slice(0, 5)} - {p.end_time?.slice(0, 5)})
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Start Time *">
                            <Input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />
                        </FormField>
                        <FormField label="End Time *">
                            <Input type="time" name="end_time" value={formData.end_time} onChange={handleChange} />
                        </FormField>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CreateEditTimetableModal;
