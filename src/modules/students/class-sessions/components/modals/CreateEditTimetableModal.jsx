import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateEditTimetableModal = ({ isOpen, onClose, editingId }) => {
    const [formData, setFormData] = useState({
        classLevel: 'Grade 4',
        stream: 'East',
        term: 'Term 1',
        year: '2024',
        slots: [
            { time: '08:00 - 08:40', subject: 'Maths', teacher: '', room: '' },
            { time: '08:40 - 09:20', subject: 'English', teacher: '', room: '' },
        ]
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...formData.slots];
        newSlots[index][field] = value;
        setFormData(prev => ({
            ...prev,
            slots: newSlots
        }));
    };

    const addSlot = () => {
        setFormData(prev => ({
            ...prev,
            slots: [...prev.slots, { time: '', subject: '', teacher: '', room: '' }]
        }));
    };

    const removeSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            slots: prev.slots.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        console.log('Saved timetable:', formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {editingId ? 'Edit Timetable' : 'Create New Timetable'}
                        </h2>
                        <p className="text-sm text-gray-500">Configure class, term, and schedule slots</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Basic Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Class Level</label>
                                <select
                                    name="classLevel"
                                    value={formData.classLevel}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                >
                                    <option>Grade 4</option>
                                    <option>Grade 5</option>
                                    <option>Grade 6</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Stream</label>
                                <select
                                    name="stream"
                                    value={formData.stream}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                >
                                    <option>East</option>
                                    <option>West</option>
                                    <option>North</option>
                                    <option>South</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Term</label>
                                <select
                                    name="term"
                                    value={formData.term}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                >
                                    <option>Term 1</option>
                                    <option>Term 2</option>
                                    <option>Term 3</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                >
                                    <option>2023</option>
                                    <option>2024</option>
                                    <option>2025</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Slots */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Class Schedule</h3>
                            <button
                                onClick={addSlot}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                <Plus size={14} /> Add Slot
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {formData.slots.map((slot, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-2 items-end p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Time Slot</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., 08:00 - 08:40"
                                            value={slot.time}
                                            onChange={(e) => handleSlotChange(idx, 'time', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Subject</label>
                                        <select
                                            value={slot.subject}
                                            onChange={(e) => handleSlotChange(idx, 'subject', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option>Maths</option>
                                            <option>English</option>
                                            <option>Science</option>
                                            <option>Social Studies</option>
                                            <option>C.R.E</option>
                                            <option>P.E</option>
                                            <option>Art</option>
                                            <option>BREAK</option>
                                        </select>
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Teacher</label>
                                        <input
                                            type="text"
                                            placeholder="Teacher name"
                                            value={slot.teacher}
                                            onChange={(e) => handleSlotChange(idx, 'teacher', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-gray-600 block mb-1">Room</label>
                                        <input
                                            type="text"
                                            placeholder="Room no."
                                            value={slot.room}
                                            onChange={(e) => handleSlotChange(idx, 'room', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => removeSlot(idx)}
                                        className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        {editingId ? 'Update' : 'Create'} Timetable
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CreateEditTimetableModal;
