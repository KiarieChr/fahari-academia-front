import React, { useState } from 'react';
import { Save, Book, Hash, GraduationCap, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';

const AddSubjectModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        area: 'Sciences',
        classes: '',
        type: 'Compulsory'
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.code) {
            toast.error('Subject Name and Code are required');
            return;
        }

        toast.success(`Subject "${formData.name}" Created`);
        if (onSave) onSave(formData);

        onClose();
        setFormData({
            name: '',
            code: '',
            area: 'Sciences',
            classes: '',
            type: 'Compulsory'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Subject"
            subtitle="Add a new subject to the repository."
            size="sm"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="add-subject-form">
                        <Save size={16} /> Create Subject
                    </Modal.SubmitButton>
                </>
            }
        >
            <form id="add-subject-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Subject Name */}
                <div>
                    <label className={labelClass}>Subject Name</label>
                    <div className="relative">
                        <Book size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. Mathematics"
                        />
                    </div>
                </div>

                {/* Subject Code */}
                <div>
                    <label className={labelClass}>Subject Code</label>
                    <div className="relative">
                        <Hash size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className={`${inputClass} pl-10 font-mono`}
                            placeholder="e.g. MAT101"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Learning Area */}
                    <div>
                        <label className={labelClass}>Learning Area</label>
                        <div className="relative">
                            <GraduationCap size={18} className="absolute left-3 top-3 text-gray-400" />
                            <select
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className={`${inputClass} pl-10`}
                            >
                                <option value="Sciences">Sciences</option>
                                <option value="Languages">Languages</option>
                                <option value="Humanities">Humanities</option>
                                <option value="Technical">Technical</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Creative Arts">Creative Arts</option>
                            </select>
                        </div>
                    </div>

                    {/* Subject Type */}
                    <div>
                        <label className={labelClass}>Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className={inputClass}
                        >
                            <option value="Compulsory">Compulsory</option>
                            <option value="Optional">Optional</option>
                            <option value="Elective">Elective</option>
                        </select>
                    </div>
                </div>

                {/* Classes */}
                <div>
                    <label className={labelClass}>Classes Covered</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={formData.classes}
                            onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. All, Grade 4-6"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default AddSubjectModal;

