import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Check, Loader2, User, MapPin, BookOpen, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { timetableApi } from '../services/timetableApi';
import Modal from '../../../../components/common/Modal';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const slotSchema = z.object({
    subject: z.string().min(1, 'Subject is required'),
    teacher: z.string().optional(),
    room: z.string().optional(),
    day_of_week: z.number().min(0).max(6),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
}).refine(data => {
    if (!data.start_time || !data.end_time) return true;
    return data.start_time < data.end_time;
}, {
    message: "End time must be after start time",
    path: ["end_time"]
});

const SlotAssignmentModal = ({
    isOpen,
    onClose,
    slot,
    defaultValues,
    classSessionId,
    subjects = [],
    teachers = [],
    rooms = [],
    workAllocations = [],
    onSave,
    onDelete,
}) => {
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [conflicts, setConflicts] = useState([]);
    const [submitError, setSubmitError] = useState('');
    const [teacherAvailability, setTeacherAvailability] = useState(null);

    const isEditing = !!slot?.id;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(slotSchema),
        defaultValues: {
            subject: '',
            teacher: '',
            room: '',
            day_of_week: 0,
            start_time: '',
            end_time: '',
        }
    });

    const formValues = watch();

    useEffect(() => {
        if (isOpen) {
            if (slot) {
                reset({
                    subject: slot.subject?.toString() || slot.subject_id?.toString() || '',
                    teacher: slot.teacher?.toString() || slot.teacher_id?.toString() || '',
                    room: slot.room?.toString() || slot.room_id?.toString() || '',
                    day_of_week: slot.day_of_week ?? 0,
                    start_time: slot.start_time || '',
                    end_time: slot.end_time || '',
                });
            } else if (defaultValues) {
                reset({
                    subject: '',
                    teacher: '',
                    room: '',
                    day_of_week: defaultValues.day_of_week ?? 0,
                    start_time: defaultValues.start_time || '',
                    end_time: defaultValues.end_time || '',
                });
            } else {
                reset({
                    subject: '',
                    teacher: '',
                    room: '',
                    day_of_week: 0,
                    start_time: '',
                    end_time: '',
                });
            }
            setConflicts([]);
            setSubmitError('');
            setTeacherAvailability(null);
        }
    }, [isOpen, slot, defaultValues, reset]);

    const filteredSubjects = useMemo(() => {
        if (!workAllocations || workAllocations.length === 0) {
            return subjects;
        }
        const allocatedSubjectIds = new Set(
            workAllocations.map(wa => wa.subject?.toString() || wa.subject_id?.toString())
        );
        return subjects.filter(s => allocatedSubjectIds.has(s.id?.toString()));
    }, [subjects, workAllocations]);

    useEffect(() => {
        if (formValues.subject && workAllocations.length > 0) {
            const allocation = workAllocations.find(
                wa => (wa.subject?.toString() || wa.subject_id?.toString()) === formValues.subject
            );
            if (allocation) {
                const teacherId = allocation.teacher?.toString() || allocation.teacher_id?.toString();
                if (teacherId && formValues.teacher !== teacherId) {
                    setValue('teacher', teacherId, { shouldValidate: true });
                }
            }
        }
    }, [formValues.subject, workAllocations, setValue, formValues.teacher]);

    useEffect(() => {
        const loadAvailability = async () => {
            if (!formValues.teacher || formValues.day_of_week === undefined) {
                setTeacherAvailability(null);
                return;
            }
            try {
                const data = await timetableApi.getTeacherAvailability(
                    formValues.teacher,
                    formValues.day_of_week
                );
                setTeacherAvailability(data);
            } catch (err) {
                console.error('Failed to load teacher availability:', err);
                setTeacherAvailability(null);
            }
        };
        loadAvailability();
    }, [formValues.teacher, formValues.day_of_week]);

    useEffect(() => {
        const checkConflicts = async () => {
            if (!formValues.subject || formValues.day_of_week === undefined || !formValues.start_time || !formValues.end_time) {
                setConflicts([]);
                return;
            }
            
            if (formValues.start_time >= formValues.end_time) {
                return;
            }

            setValidating(true);
            try {
                const result = await timetableApi.checkConflict({
                    class_session: classSessionId,
                    subject: formValues.subject,
                    teacher: formValues.teacher || null,
                    room: formValues.room || null,
                    day_of_week: formValues.day_of_week,
                    start_time: formValues.start_time,
                    end_time: formValues.end_time,
                    exclude_slot_id: slot?.id,
                });
                setConflicts(result.conflicts || []);
            } catch (err) {
                console.error('Conflict check failed:', err);
            } finally {
                setValidating(false);
            }
        };

        const debounceTimer = setTimeout(checkConflicts, 300);
        return () => clearTimeout(debounceTimer);
    }, [formValues.subject, formValues.teacher, formValues.room, formValues.day_of_week, formValues.start_time, formValues.end_time, classSessionId, slot?.id]);

    const onSubmit = async (data) => {
        const hardConflicts = conflicts.filter(c => c.type === 'hard' || c.severity === 'hard');
        if (hardConflicts.length > 0) {
            setSubmitError('Cannot save: Hard conflicts must be resolved first');
            return;
        }

        setLoading(true);
        setSubmitError('');
        try {
            await onSave?.({
                id: slot?.id,
                class_session: classSessionId,
                subject: parseInt(data.subject, 10),
                teacher: data.teacher ? parseInt(data.teacher, 10) : null,
                room: data.room ? parseInt(data.room, 10) : null,
                day_of_week: data.day_of_week,
                start_time: data.start_time,
                end_time: data.end_time,
            });
            onClose?.();
        } catch (err) {
            setSubmitError(err.message || 'Failed to save slot');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!slot?.id) return;
        if (!window.confirm('Are you sure you want to delete this slot?')) return;

        setLoading(true);
        setSubmitError('');
        try {
            await onDelete?.(slot);
            onClose?.();
        } catch (err) {
            setSubmitError(err.message || 'Failed to delete slot');
        } finally {
            setLoading(false);
        }
    };

    const isTeacherAvailable = useMemo(() => {
        if (!teacherAvailability || !formValues.start_time || !formValues.end_time) {
            return null;
        }
        const available = teacherAvailability.available_periods || [];
        return available.some(period =>
            formValues.start_time >= period.start_time &&
            formValues.end_time <= period.end_time
        );
    }, [teacherAvailability, formValues.start_time, formValues.end_time]);

    const renderConflicts = () => {
        if (conflicts.length === 0) return null;

        return (
            <div className="mt-4 space-y-2">
                {conflicts.map((conflict, idx) => (
                    <div
                        key={idx}
                        className={`
                            flex items-start gap-2 p-3 rounded-lg text-sm
                            ${conflict.type === 'hard' || conflict.severity === 'hard'
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }
                        `}
                    >
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium">
                                {conflict.type === 'hard' ? 'Hard Conflict' : 'Warning'}:
                            </span>{' '}
                            {conflict.message || conflict.description}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Timetable Slot' : 'Assign New Slot'}
            size="md"
            accentColor="bg-blue-500"
            noPadding
            footer={
                <div className="flex items-center justify-between w-full">
                    <div>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 h-11 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Delete Slot
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Modal.CancelButton onClick={onClose} disabled={loading} />
                        <Modal.SubmitButton
                            form="slot-assignment-form"
                            loading={loading}
                            disabled={conflicts.some(c => c.type === 'hard' || c.severity === 'hard')}
                        >
                            {isEditing ? 'Update' : 'Assign'}
                        </Modal.SubmitButton>
                    </div>
                </div>
            }
        >
            <form id="slot-assignment-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="px-7 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Day
                            </label>
                            <div className="relative">
                                <select
                                    {...register('day_of_week', { valueAsNumber: true })}
                                    className="w-full h-11 px-4 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                                >
                                    {DAY_NAMES.slice(0, 6).map((day, idx) => (
                                        <option key={idx} value={idx}>{day}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Start *
                            </label>
                            <input
                                type="time"
                                {...register('start_time')}
                                className={`w-full h-11 px-4 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${errors.start_time ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'}`}
                            />
                            {errors.start_time && (
                                <p className="text-xs text-red-500 mt-1">{errors.start_time.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                End *
                            </label>
                            <input
                                type="time"
                                {...register('end_time')}
                                className={`w-full h-11 px-4 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${errors.end_time ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'}`}
                            />
                            {errors.end_time && (
                                <p className="text-xs text-red-500 mt-1">{errors.end_time.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <BookOpen size={14} className="inline mr-1.5 -mt-0.5" />
                            Subject *
                        </label>
                        <div className="relative">
                            <select
                                {...register('subject')}
                                className={`w-full h-11 px-4 pr-10 bg-white dark:bg-slate-900 border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${errors.subject ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'}`}
                            >
                                <option value="">Select subject...</option>
                                {filteredSubjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        {errors.subject && (
                            <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
                        )}
                        {workAllocations.length > 0 && filteredSubjects.length < subjects.length && (
                            <p className="text-xs text-slate-400 mt-1">
                                Showing only subjects with assigned teachers
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                <User size={14} className="inline mr-1.5 -mt-0.5" />
                                Teacher
                            </label>
                            {isTeacherAvailable !== null && (
                                <span className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full ${isTeacherAvailable ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                    {isTeacherAvailable ? (
                                        <><Check size={12} /> Available</>
                                    ) : (
                                        <><AlertTriangle size={12} /> May be busy</>
                                    )}
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <select
                                {...register('teacher')}
                                className="w-full h-11 px-4 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select teacher (optional)...</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <MapPin size={14} className="inline mr-1.5 -mt-0.5" />
                            Room
                        </label>
                        <div className="relative">
                            <select
                                {...register('room')}
                                className="w-full h-11 px-4 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select room (optional)...</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.name} {room.capacity ? `(${room.capacity})` : ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {validating && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3">
                            <Loader2 size={16} className="animate-spin" />
                            Checking conflicts...
                        </div>
                    )}
                    {renderConflicts()}

                    {submitError && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-800 dark:text-red-400 flex items-start gap-3">
                            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                            <span>{submitError}</span>
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default SlotAssignmentModal;
