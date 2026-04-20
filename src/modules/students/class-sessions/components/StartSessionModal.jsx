import React, { useState } from 'react';
import { Play, BookOpen, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '../../../../components/common/Modal';
import FormField, { Select, Input, TextArea, inputClass } from '../../../../components/ui/FormField';

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Start Class Session"
            subtitle="Initialize a new lesson for a class."
            size="md"
            accentColor="bg-indigo-500"
            footer={<>
                <Modal.CancelButton onClick={onClose} />
                <Modal.SubmitButton form="start-session-form" loading={saving}>
                    {!saving && <Play size={16} />}
                    Start Session
                </Modal.SubmitButton>
            </>}
        >
            <form id="start-session-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
                        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Class" required>
                        <Select
                            name="class_session"
                            value={form.class_session}
                            onChange={handleChange}
                        >
                            <option value="">Select Class…</option>
                            {classSessions.map((cs) => (
                                <option key={cs.id} value={cs.id}>
                                    {cs.name ?? `${cs.grade_name ?? ''} ${cs.term_name ?? ''}`.trim()}
                                </option>
                            ))}
                        </Select>
                    </FormField>
                    <FormField label="Subject" required>
                        <Select
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                        >
                            <option value="">Select Subject…</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </Select>
                    </FormField>
                </div>

                <FormField label="Lesson Topic">
                    <div className="relative">
                        <BookOpen size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                        <Input
                            type="text"
                            name="topic_taught"
                            value={form.topic_taught}
                            onChange={handleChange}
                            className="pl-10"
                            placeholder="e.g. Introduction to Algebra"
                        />
                    </div>
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                    <FormField label="Delivery Mode">
                        <Select
                            name="delivery_mode"
                            value={form.delivery_mode}
                            onChange={handleChange}
                        >
                            <option value="in_person">In-Person</option>
                            <option value="online">Online</option>
                            <option value="hybrid">Hybrid</option>
                        </Select>
                    </FormField>
                    <FormField label="Start Time">
                        <div className="relative">
                            <Clock size={18} className="absolute left-3 top-3 text-gray-400 z-10" />
                            <input
                                type="text"
                                readOnly
                                value={new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                                className={`${inputClass} pl-10 bg-gray-50 text-gray-500`}
                            />
                        </div>
                    </FormField>
                </div>

                <FormField label="Notes / Remarks">
                    <TextArea
                        name="lesson_notes"
                        value={form.lesson_notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Optional notes for this session…"
                    />
                </FormField>
            </form>
        </Modal>
    );
};

export default StartSessionModal;

