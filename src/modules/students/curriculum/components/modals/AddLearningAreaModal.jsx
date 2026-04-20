import React, { useState } from 'react';
import { Save, Layers, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';

const AddLearningAreaModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        head: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Area Name is required');
            return;
        }

        toast.success(`Learning Area "${formData.name}" Created`);
        if (onSave) onSave(formData);

        onClose();
        setFormData({ name: '', head: '', description: '' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Learning Area"
            subtitle="Define a broad academic category."
            size="sm"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="add-area-form">
                        <Save size={16} /> Create Area
                    </Modal.SubmitButton>
                </>
            }
        >
            <form id="add-area-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Area Name */}
                <div>
                    <label className={labelClass}>Area Name</label>
                    <div className="relative">
                        <Layers size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. Humanities, Sciences"
                        />
                    </div>
                </div>

                {/* Head of Department */}
                <div>
                    <label className={labelClass}>Head of Area (Optional)</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={formData.head}
                            onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="Staff Name"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClass} resize-none h-20`}
                        placeholder="Brief description..."
                    />
                </div>
            </form>
        </Modal>
    );
};

export default AddLearningAreaModal;

