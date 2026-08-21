import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';

const AllocationFormModal = ({ isOpen, onClose, onSave, initialData, teachers, classes, subjects }) => {
    const defaultData = {
        class_session: '',
        subject: '',
        teacher: '',
        lessons_per_week: 5,
        required_room_type: '',
        notes: '',
    };

    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? {
                class_session: initialData.class_session || '',
                subject: initialData.subject || '',
                teacher: initialData.teacher || '',
                lessons_per_week: initialData.lessons_per_week || 5,
                required_room_type: initialData.required_room_type || '',
                notes: initialData.notes || '',
            } : defaultData);
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.teacher) delete payload.teacher;
        if (!payload.required_room_type) delete payload.required_room_type;
        onSave(payload);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Find selected teacher's load
    const selectedTeacher = teachers.find(t => String(t.id) === String(formData.teacher));
    const willOverload = selectedTeacher
        ? (selectedTeacher.currentLoad + Number(formData.lessons_per_week) > selectedTeacher.maxLoad)
        : false;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="neo-card bg-white w-full max-w-lg border-none overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">
                                {initialData ? 'Edit Allocation' : 'New Assignment'}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure Subject Details</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        <form id="allocation-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Session *</label>
                                        <select
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow appearance-none"
                                            value={formData.class_session}
                                            onChange={(e) => handleChange('class_session', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject *</label>
                                        <select
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow appearance-none"
                                            value={formData.subject}
                                            onChange={(e) => handleChange('subject', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {(() => {
                                                const selectedClass = classes.find(c => String(c.id) === String(formData.class_session));
                                                // Apply context filter: only show subjects matching the class's curriculum, or all if no class is selected
                                                const filteredSubjects = selectedClass && selectedClass.curriculum
                                                    ? subjects.filter(s => String(s.curriculum) === String(selectedClass.curriculum))
                                                    : subjects;
                                                
                                                return filteredSubjects.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.code || 'N/A'})</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Assign Teacher</label>
                                    <div className="relative">
                                        <select
                                            className={`w-full px-4 py-3 neo-pressed border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow appearance-none ${willOverload ? 'ring-2 ring-amber-200 bg-amber-50/30' : ''}`}
                                            value={formData.teacher}
                                            onChange={(e) => handleChange('teacher', e.target.value)}
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} (Load: {t.currentLoad}/{t.maxLoad})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {willOverload && (
                                        <div className="flex items-start gap-2 mt-3 text-amber-600 text-[11px] font-bold bg-amber-50 p-2 rounded-lg border border-amber-100">
                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                            Warning: This assignment will exceed the teacher's maximum recommended workload.
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekly Lessons *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow"
                                            value={formData.lessons_per_week}
                                            onChange={(e) => handleChange('lessons_per_week', parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Room Type</label>
                                        <select
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow appearance-none"
                                            value={formData.required_room_type}
                                            onChange={(e) => handleChange('required_room_type', e.target.value)}
                                        >
                                            <option value="">Any</option>
                                            <option value="classroom">Classroom</option>
                                            <option value="laboratory">Laboratory</option>
                                            <option value="computer_lab">Computer Lab</option>
                                            <option value="workshop">Workshop</option>
                                            <option value="field">Field</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-shadow"
                                        placeholder="Optional notes..."
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 neo-btn rounded-xl text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="allocation-form"
                            className="px-6 py-2.5 neo-btn-accent rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <Check size={18} /> Confirm Allocation
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AllocationFormModal;
