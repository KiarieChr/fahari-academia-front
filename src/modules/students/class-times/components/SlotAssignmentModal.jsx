import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, AlertTriangle, Check, Loader2, Clock, User, MapPin, BookOpen, ChevronDown } from 'lucide-react';
import { timetableApi } from '../services/timetableApi';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * SlotAssignmentModal — Modal for creating/editing timetable slots.
 * 
 * Features:
 * - Subject dropdown filtered by work allocation
 * - Auto-fill teacher based on selected subject's allocation
 * - Room dropdown with type filtering
 * - Teacher availability preview
 * - Real-time conflict validation
 * - Loading states and error feedback
 * 
 * Props:
 *  @param {boolean} isOpen - Whether modal is visible
 *  @param {Function} onClose - Callback to close modal
 *  @param {Object} slot - Existing slot for editing (null for new)
 *  @param {Object} defaultValues - Default day/time values for new slot
 *  @param {number} classSessionId - Current class session ID
 *  @param {Array} subjects - Available subjects list
 *  @param {Array} teachers - Available teachers list
 *  @param {Array} rooms - Available rooms list
 *  @param {Array} workAllocations - Teacher-subject assignments for this class
 *  @param {Function} onSave - Callback when slot is saved (slot data)
 *  @param {Function} onDelete - Callback when slot is deleted
 */
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
    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        teacher: '',
        room: '',
        day_of_week: 0,
        start_time: '',
        end_time: '',
    });

    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [conflicts, setConflicts] = useState([]);
    const [errors, setErrors] = useState({});
    const [teacherAvailability, setTeacherAvailability] = useState(null);

    const isEditing = !!slot?.id;

    // Initialize form data
    useEffect(() => {
        if (isOpen) {
            if (slot) {
                // Editing existing slot
                setFormData({
                    subject: slot.subject?.toString() || slot.subject_id?.toString() || '',
                    teacher: slot.teacher?.toString() || slot.teacher_id?.toString() || '',
                    room: slot.room?.toString() || slot.room_id?.toString() || '',
                    day_of_week: slot.day_of_week ?? 0,
                    start_time: slot.start_time || '',
                    end_time: slot.end_time || '',
                });
            } else if (defaultValues) {
                // New slot with defaults
                setFormData({
                    subject: '',
                    teacher: '',
                    room: '',
                    day_of_week: defaultValues.day_of_week ?? 0,
                    start_time: defaultValues.start_time || '',
                    end_time: defaultValues.end_time || '',
                });
            } else {
                // Fresh new slot
                setFormData({
                    subject: '',
                    teacher: '',
                    room: '',
                    day_of_week: 0,
                    start_time: '',
                    end_time: '',
                });
            }
            setConflicts([]);
            setErrors({});
            setTeacherAvailability(null);
        }
    }, [isOpen, slot, defaultValues]);

    // Filter subjects by work allocation (only subjects assigned to this class)
    const filteredSubjects = useMemo(() => {
        if (!workAllocations || workAllocations.length === 0) {
            return subjects; // Show all if no allocations defined
        }
        const allocatedSubjectIds = new Set(
            workAllocations.map(wa => wa.subject?.toString() || wa.subject_id?.toString())
        );
        return subjects.filter(s => allocatedSubjectIds.has(s.id?.toString()));
    }, [subjects, workAllocations]);

    // Auto-fill teacher when subject changes (based on work allocation)
    useEffect(() => {
        if (formData.subject && workAllocations.length > 0) {
            const allocation = workAllocations.find(
                wa => (wa.subject?.toString() || wa.subject_id?.toString()) === formData.subject
            );
            if (allocation) {
                const teacherId = allocation.teacher?.toString() || allocation.teacher_id?.toString();
                if (teacherId) {
                    setFormData(prev => ({ ...prev, teacher: teacherId }));
                }
            }
        }
    }, [formData.subject, workAllocations]);

    // Load teacher availability when teacher changes
    useEffect(() => {
        const loadAvailability = async () => {
            if (!formData.teacher || !formData.day_of_week) {
                setTeacherAvailability(null);
                return;
            }
            try {
                const data = await timetableApi.getTeacherAvailability(
                    formData.teacher,
                    formData.day_of_week
                );
                setTeacherAvailability(data);
            } catch (err) {
                console.error('Failed to load teacher availability:', err);
                setTeacherAvailability(null);
            }
        };
        loadAvailability();
    }, [formData.teacher, formData.day_of_week]);

    // Real-time conflict checking (debounced)
    useEffect(() => {
        const checkConflicts = async () => {
            if (!formData.subject || !formData.day_of_week === undefined || !formData.start_time || !formData.end_time) {
                setConflicts([]);
                return;
            }

            setValidating(true);
            try {
                const result = await timetableApi.checkConflict({
                    class_session: classSessionId,
                    subject: formData.subject,
                    teacher: formData.teacher || null,
                    room: formData.room || null,
                    day_of_week: formData.day_of_week,
                    start_time: formData.start_time,
                    end_time: formData.end_time,
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
    }, [formData, classSessionId, slot?.id]);

    // Form validation
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.subject) {
            newErrors.subject = 'Subject is required';
        }
        if (!formData.start_time) {
            newErrors.start_time = 'Start time is required';
        }
        if (!formData.end_time) {
            newErrors.end_time = 'End time is required';
        }
        if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
            newErrors.end_time = 'End time must be after start time';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle field changes
    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error on change
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    }, [errors]);

    // Handle form submission
    const handleSubmit = useCallback(async (e) => {
        e?.preventDefault();

        if (!validateForm()) return;

        // Block if hard conflicts exist
        const hardConflicts = conflicts.filter(c => c.type === 'hard' || c.severity === 'hard');
        if (hardConflicts.length > 0) {
            setErrors(prev => ({
                ...prev,
                submit: 'Cannot save: Hard conflicts must be resolved first',
            }));
            return;
        }

        setLoading(true);
        try {
            await onSave?.({
                id: slot?.id,
                class_session: classSessionId,
                subject: parseInt(formData.subject, 10),
                teacher: formData.teacher ? parseInt(formData.teacher, 10) : null,
                room: formData.room ? parseInt(formData.room, 10) : null,
                day_of_week: formData.day_of_week,
                start_time: formData.start_time,
                end_time: formData.end_time,
            });
            onClose?.();
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                submit: err.message || 'Failed to save slot',
            }));
        } finally {
            setLoading(false);
        }
    }, [formData, slot, classSessionId, conflicts, validateForm, onSave, onClose]);

    // Handle delete
    const handleDelete = useCallback(async () => {
        if (!slot?.id) return;

        if (!window.confirm('Are you sure you want to delete this slot?')) return;

        setLoading(true);
        try {
            await onDelete?.(slot);
            onClose?.();
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                submit: err.message || 'Failed to delete slot',
            }));
        } finally {
            setLoading(false);
        }
    }, [slot, onDelete, onClose]);

    // Check if teacher is available
    const isTeacherAvailable = useMemo(() => {
        if (!teacherAvailability || !formData.start_time || !formData.end_time) {
            return null;
        }
        // Check if the slot time falls within teacher's available periods
        const available = teacherAvailability.available_periods || [];
        return available.some(period =>
            formData.start_time >= period.start_time &&
            formData.end_time <= period.end_time
        );
    }, [teacherAvailability, formData.start_time, formData.end_time]);

    // Render conflict badges
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
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-slate-200 dark:border-slate-700"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {isEditing ? 'Edit Timetable Slot' : 'Assign New Slot'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                            {/* Day and Time Row */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Day Select */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Day
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.day_of_week}
                                            onChange={e => handleChange('day_of_week', parseInt(e.target.value, 10))}
                                            className="w-full h-11 px-4 pr-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                                        >
                                            {DAY_NAMES.slice(0, 6).map((day, idx) => (
                                                <option key={idx} value={idx}>{day}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Start *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={e => handleChange('start_time', e.target.value)}
                                        className={`w-full h-11 px-4 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${errors.start_time ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'}`}
                                    />
                                    {errors.start_time && (
                                        <p className="text-xs text-red-500 mt-1">{errors.start_time}</p>
                                    )}
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        End *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={e => handleChange('end_time', e.target.value)}
                                        className={`w-full h-11 px-4 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors ${errors.end_time ? 'border-red-400' : 'border-slate-300 dark:border-slate-600'}`}
                                    />
                                    {errors.end_time && (
                                        <p className="text-xs text-red-500 mt-1">{errors.end_time}</p>
                                    )}
                                </div>
                            </div>

                            {/* Subject Select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <BookOpen size={14} className="inline mr-1.5 -mt-0.5" />
                                    Subject *
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.subject}
                                        onChange={e => handleChange('subject', e.target.value)}
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
                                    <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                                )}
                                {workAllocations.length > 0 && filteredSubjects.length < subjects.length && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Showing only subjects with assigned teachers
                                    </p>
                                )}
                            </div>

                            {/* Teacher Select */}
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
                                        value={formData.teacher}
                                        onChange={e => handleChange('teacher', e.target.value)}
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

                            {/* Room Select */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <MapPin size={14} className="inline mr-1.5 -mt-0.5" />
                                    Room
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.room}
                                        onChange={e => handleChange('room', e.target.value)}
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

                            {/* Conflict Display */}
                            {validating && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3">
                                    <Loader2 size={16} className="animate-spin" />
                                    Checking conflicts...
                                </div>
                            )}
                            {renderConflicts()}

                            {/* Submit Error */}
                            {errors.submit && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-800 dark:text-red-400 flex items-start gap-3">
                                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                                    <span>{errors.submit}</span>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
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
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-5 h-11 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || conflicts.some(c => c.type === 'hard' || c.severity === 'hard')}
                                    className="px-6 h-11 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            {isEditing ? 'Update' : 'Assign'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SlotAssignmentModal;
