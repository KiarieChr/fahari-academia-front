import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Users, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Modal from '../../../../components/common/Modal';
import FormField, { Select, Input } from '../../../../components/ui/FormField';
import { api } from '../../../../services/apiClient';

const WorkAllocationsPanel = ({ classSessionId, classSessionName }) => {
    const [allocations, setAllocations] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        teacher: '',
        subject: '',
        lessons_per_week: '',
        required_room_type: '',
        notes: '',
    });

    const ROOM_TYPES = [
        { value: '', label: 'Any' },
        { value: 'classroom', label: 'Classroom' },
        { value: 'lab', label: 'Laboratory' },
        { value: 'computer_lab', label: 'Computer Lab' },
        { value: 'library', label: 'Library' },
        { value: 'hall', label: 'Hall' },
        { value: 'field', label: 'Field' },
        { value: 'workshop', label: 'Workshop' },
    ];

    const fetchAllocations = async () => {
        if (!classSessionId) return;
        setLoading(true);
        try {
            const data = await api.timetable.getAllocationsByClass(classSessionId);
            setAllocations(data.results || data || []);
        } catch {
            toast.error('Failed to load allocations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllocations();
    }, [classSessionId]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [subjectData, teacherData] = await Promise.all([
                    api.timetable.getSubjects({ is_active: true }),
                    api.timetable.getTeachers(),
                ]);
                setSubjects((subjectData.results || subjectData) || []);
                setTeachers((teacherData.results || teacherData) || []);
            } catch {
                // silent
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubjectChange = (e) => {
        const subjectId = e.target.value;
        const subject = subjects.find(s => s.id === Number(subjectId));
        setFormData(prev => ({
            ...prev,
            subject: subjectId,
            lessons_per_week: subject?.weekly_lessons || prev.lessons_per_week,
        }));
    };

    const resetForm = () => {
        setFormData({ teacher: '', subject: '', lessons_per_week: '', required_room_type: '', notes: '' });
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.teacher || !formData.subject || !formData.lessons_per_week) {
            toast.warning('Teacher, subject, and lessons per week are required');
            return;
        }
        setSaving(true);
        try {
            await api.timetable.createAllocation({
                teacher: Number(formData.teacher),
                subject: Number(formData.subject),
                class_session: classSessionId,
                lessons_per_week: Number(formData.lessons_per_week),
                required_room_type: formData.required_room_type || null,
                notes: formData.notes,
            });
            toast.success('Allocation created');
            resetForm();
            fetchAllocations();
        } catch (err) {
            const msg = err?.data?.non_field_errors?.[0] || err?.data?.error || err?.data?.detail || 'Failed to create allocation';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this allocation?')) return;
        try {
            await api.timetable.deleteAllocation(id);
            toast.success('Allocation removed');
            fetchAllocations();
        } catch {
            toast.error('Failed to remove allocation');
        }
    };

    // Summary stats
    const totalLessons = allocations.reduce((sum, a) => sum + (a.lessons_per_week || 0), 0);
    const scheduledLessons = allocations.reduce((sum, a) => sum + (a.scheduled_lessons || 0), 0);
    const uniqueTeacherCount = new Set(allocations.map(a => a.teacher)).size;
    const fullyAllocated = allocations.filter(a => a.is_fully_allocated).length;

    if (!classSessionId) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-indigo-600" />
                            Teacher Allocations
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Assign teachers to subjects for {classSessionName || 'this class'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                        <Plus size={16} /> Add Allocation
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <div className="bg-blue-50 rounded-lg px-4 py-3">
                        <p className="text-xs text-blue-600 font-medium">Total Lessons/Week</p>
                        <p className="text-xl font-bold text-blue-900">{totalLessons}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg px-4 py-3">
                        <p className="text-xs text-green-600 font-medium">Scheduled</p>
                        <p className="text-xl font-bold text-green-900">{scheduledLessons}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg px-4 py-3">
                        <p className="text-xs text-purple-600 font-medium">Teachers</p>
                        <p className="text-xl font-bold text-purple-900">{uniqueTeacherCount}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg px-4 py-3">
                        <p className="text-xs text-amber-600 font-medium">Fully Scheduled</p>
                        <p className="text-xl font-bold text-amber-900">{fullyAllocated}/{allocations.length}</p>
                    </div>
                </div>
            </div>

            {/* Add Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="border-b border-gray-200 overflow-hidden"
                    >
                        <div className="p-6 bg-gray-50 space-y-4">
                            <h4 className="font-semibold text-gray-800 text-sm">New Allocation</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Teacher *">
                                    <Select name="teacher" value={formData.teacher} onChange={handleChange}>
                                        <option value="">Select teacher...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.first_name} {t.last_name} {t.employee_id ? `(${t.employee_id})` : ''}
                                            </option>
                                        ))}
                                    </Select>
                                </FormField>

                                <FormField label="Subject *">
                                    <Select name="subject" value={formData.subject} onChange={handleSubjectChange}>
                                        <option value="">Select subject...</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </Select>
                                </FormField>

                                <FormField label="Lessons/Week *">
                                    <Input
                                        type="number"
                                        name="lessons_per_week"
                                        min="1"
                                        max="20"
                                        value={formData.lessons_per_week}
                                        onChange={handleChange}
                                        placeholder="e.g. 5"
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Required Room Type">
                                    <Select name="required_room_type" value={formData.required_room_type} onChange={handleChange}>
                                        {ROOM_TYPES.map(rt => (
                                            <option key={rt.value} value={rt.value}>{rt.label}</option>
                                        ))}
                                    </Select>
                                </FormField>

                                <FormField label="Notes" className="md:col-span-2">
                                    <Input
                                        type="text"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Optional notes..."
                                    />
                                </FormField>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
                                >
                                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Add Allocation'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Allocations Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-indigo-600" size={24} />
                    </div>
                ) : allocations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No allocations yet</p>
                        <p className="text-xs mt-1">Add teacher-subject allocations to start building the timetable</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-gray-700">Subject</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-700">Teacher</th>
                                <th className="px-6 py-3 text-center font-semibold text-gray-700">Lessons/Week</th>
                                <th className="px-6 py-3 text-center font-semibold text-gray-700">Scheduled</th>
                                <th className="px-6 py-3 text-center font-semibold text-gray-700">Remaining</th>
                                <th className="px-6 py-3 text-center font-semibold text-gray-700">Coverage</th>
                                <th className="px-6 py-3 text-left font-semibold text-gray-700">Room Type</th>
                                <th className="px-6 py-3 text-right font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allocations.map((alloc) => (
                                <motion.tr
                                    key={alloc.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{alloc.subject_name}</div>
                                        <div className="text-xs text-gray-500">{alloc.subject_code}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{alloc.teacher_name}</td>
                                    <td className="px-6 py-4 text-center font-medium">{alloc.lessons_per_week}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={alloc.scheduled_lessons > 0 ? 'text-green-700 font-medium' : 'text-gray-400'}>
                                            {alloc.scheduled_lessons || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={alloc.remaining_lessons > 0 ? 'text-amber-700 font-medium' : 'text-green-600'}>
                                            {alloc.remaining_lessons || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        alloc.is_fully_allocated ? 'bg-green-500' : 'bg-indigo-500'
                                                    }`}
                                                    style={{ width: `${Math.min(100, alloc.allocation_percentage || 0)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-600 w-10">
                                                {Math.round(alloc.allocation_percentage || 0)}%
                                            </span>
                                            {alloc.is_fully_allocated && <CheckCircle size={14} className="text-green-500" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-xs">
                                        {alloc.room_type_display || '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(alloc.id)}
                                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default WorkAllocationsPanel;
