import React, { useState } from 'react';
import { Save, Calendar, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';

const NewAcademicYearModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            toast.error('End date must be after start date');
            return;
        }

        if (onSave) onSave(formData);
        setFormData({
            name: '',
            start_date: '',
            end_date: '',
            description: ''
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="New Academic Year"
            subtitle="Define a new academic calendar period"
            icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600"><Calendar size={20} /></div>}
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton onClick={handleSubmit}>
                        <Save size={15} /> Create Year
                    </Modal.SubmitButton>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className={labelClass}>Academic Year Name</label>
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3.5 top-3 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`${inputClass} pl-10`}
                            placeholder="e.g. 2026/2027"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Start Date</label>
                        <input
                            type="date"
                            required
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>End Date</label>
                        <input
                            type="date"
                            required
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Description (Optional)</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className={`${inputClass} h-20 resize-none`}
                        placeholder="Add any notes about this academic year..."
                    />
                </div>

                <div className="flex items-start gap-2.5 bg-blue-50/80 border border-blue-100 p-3.5 rounded-xl text-xs text-blue-700 leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                    <p>Creating a new academic year will not automatically make it active. You can set it as active from the list after creation.</p>
                </div>
            </form>
        </Modal>
    );
};

export default NewAcademicYearModal;

