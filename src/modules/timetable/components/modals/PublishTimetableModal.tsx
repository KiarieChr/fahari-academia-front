import React, { useState } from 'react';
import { Check, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../components/common/Modal';
import { inputClass } from '../../../../components/ui/FormField';
import { api } from '../../../../services/apiClient';

const PublishTimetableModal = ({ isOpen, onClose, classSessionId, lockData, onLocked }) => {
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const handlePublish = async () => {
        setSaving(true);
        try {
            if (!lockData) {
                // Create a lock then lock it
                const newLock = await api.timetable.createLock({
                    class_session: classSessionId,
                    lock_level: 'draft',
                    notes,
                });
                await api.timetable.lockTimetable(newLock.id);
            } else {
                await api.timetable.lockTimetable(lockData.id);
            }

            // Also create a snapshot
            await api.timetable.createSnapshot({
                class_session: classSessionId,
                label: `Published ${new Date().toLocaleDateString()}`,
                description: notes,
            });

            toast.success('Timetable published and locked');
            onLocked?.();
            onClose();
        } catch (err) {
            toast.error(err?.data?.error || 'Failed to publish timetable');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Publish Timetable"
            subtitle="Lock the timetable and create a version snapshot"
            icon={<Lock size={20} className="text-green-600" />}
            size="md"
            accentColor="bg-green-500"
            footer={<>
                <Modal.CancelButton onClick={onClose} />
                <Modal.SubmitButton onClick={handlePublish} disabled={saving} className="!bg-green-600 hover:!bg-green-700 !shadow-green-200/50">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Publishing...</> : <><Check size={18} /> Publish & Lock</>}
                </Modal.SubmitButton>
            </>}
        >
            <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-1">What happens when you publish?</h3>
                    <ul className="text-sm text-blue-800 list-disc ml-4 space-y-1">
                        <li>The timetable will be locked (no edits until unlocked)</li>
                        <li>A version snapshot will be saved for rollback</li>
                    </ul>
                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-900 block mb-2">Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any notes about this version..."
                        rows="3"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {lockData && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        Current lock level: <span className="font-bold">{lockData.lock_level_display || lockData.lock_level}</span>
                        {lockData.locked_by_name && <span> (by {lockData.locked_by_name})</span>}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PublishTimetableModal;
