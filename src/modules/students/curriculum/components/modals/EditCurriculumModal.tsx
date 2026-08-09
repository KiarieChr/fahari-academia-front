import React, { useState, useEffect } from 'react';
import { Save, BookOpen, Layers, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';

const EditCurriculumModal = ({ isOpen, onClose, curriculum, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        classes: '',
        subjects: 0
    });

    useEffect(() => {
        if (curriculum) {
            setFormData({
                name: curriculum.name,
                level: curriculum.level,
                classes: curriculum.classes,
                subjects: curriculum.subjects
            });
        }
    }, [curriculum]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Curriculum Name is required');
            return;
        }

        toast.success(`Curriculum updated successfully`);
        if (onSave) onSave({ ...curriculum, ...formData });

        onClose();
    };

    if (!isOpen || !curriculum) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Curriculum"
            subtitle="Update curriculum details."
            size="sm"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="edit-curriculum-form">
                        <Save size={16} /> Update Details
                    </Modal.SubmitButton>
                </>
            }
        >
            <form id="edit-curriculum-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Curriculum Name */}
                <div>
                    <label className={labelClass}>Curriculum Name</label>
                    <div className="relative">
                        <BookOpen size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`${inputClass} pl-10`}
                        />
                    </div>
                </div>

                {/* Level */}
                <div>
                    <label className={labelClass}>Education Level</label>
                    <div className="relative">
                        <GraduationCap size={18} className="absolute left-3 top-3 text-gray-400" />
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            className={`${inputClass} pl-10`}
                        >
                            <option value="Pre-Primary">Pre-Primary</option>
                            <option value="Primary">Primary</option>
                            <option value="Secondary">Secondary</option>
                            <option value="International">International</option>
                            <option value="Tertiary">Tertiary</option>
                        </select>
                    </div>
                </div>

                {/* Classes Covered */}
                <div>
                    <label className={labelClass}>Classes / Grades Covered</label>
                    <div className="relative">
                        <Layers size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={formData.classes}
                            onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. Grade 1 - 6"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default EditCurriculumModal;

