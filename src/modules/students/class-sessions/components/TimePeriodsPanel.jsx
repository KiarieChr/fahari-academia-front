import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Clock, GripVertical, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import FormField, { Select, Input } from '../../../../components/ui/FormField';
import { api } from '../../../../services/apiClient';

const PERIOD_TYPES = [
    { value: 'lesson', label: 'Lesson', icon: '📚', color: 'bg-blue-50 border-blue-200 text-blue-800' },
    { value: 'break', label: 'Break', icon: '☕', color: 'bg-orange-50 border-orange-200 text-orange-800' },
    { value: 'assembly', label: 'Assembly', icon: '🏫', color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { value: 'lunch', label: 'Lunch', icon: '🍽️', color: 'bg-green-50 border-green-200 text-green-800' },
    { value: 'activity', label: 'Extra-curricular', icon: '⚽', color: 'bg-pink-50 border-pink-200 text-pink-800' },
];

const DAY_PRESETS = [
    { label: 'Mon–Fri', value: '0,1,2,3,4' },
    { label: 'Mon–Sat', value: '0,1,2,3,4,5' },
    { label: 'Mon–Thu', value: '0,1,2,3' },
];

const TimePeriodsPanel = () => {
    const [periods, setPeriods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        short_name: '',
        period_type: 'lesson',
        start_time: '',
        end_time: '',
        order: '',
        is_schedulable: true,
        applies_to_days: '0,1,2,3,4',
    });

    const fetchPeriods = async () => {
        setLoading(true);
        try {
            const data = await api.timetable.getPeriods({ is_active: true });
            setPeriods((data.results || data) || []);
        } catch {
            toast.error('Failed to load periods');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPeriods(); }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        const isSchedulable = type === 'lesson';
        setFormData(prev => ({
            ...prev,
            period_type: type,
            is_schedulable: isSchedulable,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '', short_name: '', period_type: 'lesson',
            start_time: '', end_time: '', order: '',
            is_schedulable: true, applies_to_days: '0,1,2,3,4',
        });
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.start_time || !formData.end_time || !formData.order) {
            toast.warning('Name, times, and order are required');
            return;
        }
        setSaving(true);
        try {
            await api.timetable.createPeriod({
                name: formData.name,
                short_name: formData.short_name || formData.name.slice(0, 5),
                period_type: formData.period_type,
                start_time: formData.start_time,
                end_time: formData.end_time,
                order: Number(formData.order),
                is_schedulable: formData.is_schedulable,
                applies_to_days: formData.applies_to_days,
            });
            toast.success('Period created');
            resetForm();
            fetchPeriods();
        } catch (err) {
            toast.error(err?.data?.detail || err?.data?.error || 'Failed to create period');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this period?')) return;
        try {
            await api.timetable.deletePeriod(id);
            toast.success('Period deleted');
            fetchPeriods();
        } catch {
            toast.error('Failed to delete period');
        }
    };

    const getPeriodTypeInfo = (type) => PERIOD_TYPES.find(t => t.value === type) || PERIOD_TYPES[0];
    const lessonCount = periods.filter(p => p.is_schedulable).length;
    const breakCount = periods.filter(p => !p.is_schedulable).length;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Clock size={20} className="text-indigo-600" />
                            Day Structure (Time Periods)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Define how the school day flows — lessons, breaks, assembly, lunch
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                    >
                        <Plus size={16} /> Add Period
                    </button>
                </div>

                <div className="flex gap-3 mt-4">
                    <div className="bg-blue-50 rounded-lg px-4 py-2">
                        <span className="text-xs text-blue-600 font-medium">Lessons:</span>
                        <span className="ml-1 font-bold text-blue-900">{lessonCount}</span>
                    </div>
                    <div className="bg-orange-50 rounded-lg px-4 py-2">
                        <span className="text-xs text-orange-600 font-medium">Breaks/Other:</span>
                        <span className="ml-1 font-bold text-orange-900">{breakCount}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-2">
                        <span className="text-xs text-gray-600 font-medium">Total:</span>
                        <span className="ml-1 font-bold text-gray-900">{periods.length}</span>
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
                            <h4 className="font-semibold text-gray-800 text-sm">New Period</h4>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormField label="Period Name *">
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Period 1"
                                    />
                                </FormField>

                                <FormField label="Short Name">
                                    <Input
                                        name="short_name"
                                        value={formData.short_name}
                                        onChange={handleChange}
                                        placeholder="e.g. P1"
                                        maxLength={10}
                                    />
                                </FormField>

                                <FormField label="Type *">
                                    <Select name="period_type" value={formData.period_type} onChange={handleTypeChange}>
                                        {PERIOD_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                                        ))}
                                    </Select>
                                </FormField>

                                <FormField label="Order *">
                                    <Input
                                        type="number"
                                        name="order"
                                        min="1"
                                        value={formData.order}
                                        onChange={handleChange}
                                        placeholder="1, 2, 3..."
                                    />
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FormField label="Start Time *">
                                    <Input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />
                                </FormField>

                                <FormField label="End Time *">
                                    <Input type="time" name="end_time" value={formData.end_time} onChange={handleChange} />
                                </FormField>

                                <FormField label="Applies To Days">
                                    <Select
                                        value={formData.applies_to_days}
                                        onChange={(e) => setFormData(prev => ({ ...prev, applies_to_days: e.target.value }))}
                                    >
                                        {DAY_PRESETS.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </Select>
                                </FormField>

                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="is_schedulable"
                                            checked={formData.is_schedulable}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700 font-medium">Can schedule lessons</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm font-medium">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Add Period'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Periods List */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-indigo-600" size={24} />
                    </div>
                ) : periods.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <Clock size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No periods defined</p>
                        <p className="text-xs mt-1">Add periods to define how the school day flows</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {periods.sort((a, b) => a.order - b.order).map((period, idx) => {
                            const typeInfo = getPeriodTypeInfo(period.period_type);
                            return (
                                <motion.div
                                    key={period.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-lg border ${typeInfo.color}`}
                                >
                                    <span className="text-lg">{typeInfo.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{period.name}</span>
                                            {period.short_name && (
                                                <span className="text-xs opacity-60">({period.short_name})</span>
                                            )}
                                        </div>
                                        <div className="text-xs opacity-75 mt-0.5">
                                            {period.start_time?.slice(0, 5)} – {period.end_time?.slice(0, 5)}
                                            <span className="mx-2">·</span>
                                            {period.duration_display}
                                            <span className="mx-2">·</span>
                                            {period.period_type_display}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {period.is_schedulable && (
                                            <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full font-medium">
                                                Schedulable
                                            </span>
                                        )}
                                        <span className="text-xs opacity-50 font-mono">#{period.order}</span>
                                        <button
                                            onClick={() => handleDelete(period.id)}
                                            className="p-1.5 hover:bg-white/50 rounded-lg text-red-600 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimePeriodsPanel;
