import React, { useState } from 'react';
import { X, Play, BookOpen, User, Clock, AlertTriangle, Loader2 } from 'lucide-react';

const EMPTY_FORM = {
    class_session: '',
    subject: '',
    topic_taught: '',
    lesson_notes: '',
    delivery_mode: 'in_person',
};

/**
 * StartSessionModal
 * Props:
 *  isOpen        — boolean
 *  onClose       — () => void
 *  classSessions — array of ClassSession objects from API
 *  subjects      — array of Subject objects from API
 *  onStart       — async (data) => void — called with payload on submit
 */
const StartSessionModal = ({ isOpen, onClose, classSessions = [], subjects = [], onStart }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.class_session || !form.subject) {
            setError('Class and subject are required.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onStart?.({
                class_session: Number(form.class_session),
                subject: Number(form.subject),
                topic_taught: form.topic_taught,
                lesson_notes: form.lesson_notes,
                delivery_mode: form.delivery_mode,
                // actual_start_time will be set by backend's start() action
            });
            setForm(EMPTY_FORM);
            onClose();
        } catch (err) {
            const detail = err?.data
                ? Object.entries(err.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
                : err.message;
            setError(detail || 'Failed to start session.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Start Class Session</h2>
                        <p className="text-sm text-gray-500">Initialize a new lesson for a class.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Class *</label>
                            <select
                                name="class_session"
                                value={form.class_session}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                            >
                                <option value="">Select Class…</option>
                                {classSessions.map((cs) => (
                                    <option key={cs.id} value={cs.id}>
                                        {cs.name ?? `${cs.grade_name ?? ''} ${cs.term_name ?? ''}`.trim()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Subject *</label>
                            <select
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                            >
                                <option value="">Select Subject…</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Lesson Topic</label>
                        <div className="relative">
                            <BookOpen size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                name="topic_taught"
                                value={form.topic_taught}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-300"
                                placeholder="e.g. Introduction to Algebra"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Delivery Mode</label>
                            <select
                                name="delivery_mode"
                                value={form.delivery_mode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                            >
                                <option value="in_person">In-Person</option>
                                <option value="online">Online</option>
                                <option value="hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Start Time</label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="text"
                                    readOnly
                                    value={new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Notes / Remarks</label>
                        <textarea
                            name="lesson_notes"
                            value={form.lesson_notes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[80px] resize-none"
                            placeholder="Optional notes for this session…"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm shadow-indigo-200 flex items-center gap-2 disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                            Start Session
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StartSessionModal;

