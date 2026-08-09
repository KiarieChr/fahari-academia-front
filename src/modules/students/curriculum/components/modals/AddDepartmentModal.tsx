import React, { useState } from 'react';
import { Save, GraduationCap, User, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';

const AddDepartmentModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        hod: '',
        members: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Department Name is required');
            return;
        }

        toast.success(`Department "${formData.name}" Created`);
        if (onSave) onSave(formData);

        onClose();
        setFormData({ name: '', hod: '', members: '' });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Department"
            subtitle="Create an academic or non-academic department."
            size="sm"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="add-dept-form">
                        <Save size={16} /> Create Dept
                    </Modal.SubmitButton>
                </>
            }
        >
            <form id="add-dept-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Department Name */}
                <div>
                    <label className={labelClass}>Department Name</label>
                    <div className="relative">
                        <GraduationCap size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. Mathematics, Guidance & Counseling"
                        />
                    </div>
                </div>

                {/* Head of Department */}
                <div>
                    <label className={labelClass}>Head of Department (HOD)</label>
                    <div className="relative">
                        <User size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            value={formData.hod}
                            onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="Select Staff Member"
                        />
                    </div>
                </div>

                {/* Initial Members Count or Description */}
                <div>
                    <label className={labelClass}>Est. Members Count</label>
                    <div className="relative">
                        <Users size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="number"
                            value={formData.members}
                            onChange={(e) => setFormData({ ...formData, members: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="0"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default AddDepartmentModal;

