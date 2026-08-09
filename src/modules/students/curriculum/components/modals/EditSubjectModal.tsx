import React, { useState, useEffect } from 'react';
import { Save, Loader2, Library } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../../services/curriculumService';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';

const EditSubjectModal = ({ isOpen, onClose, subject, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({ curricula: [], learningAreas: [], curriculumLevels: [] });
    const [formData, setFormData] = useState({
        name: '', code: '', curriculum: '', curriculum_level: '', learning_area: '',
        subject_type: 'compulsory', weekly_lessons: 5, color_hex: '#6366f1', is_active: true
    });

    useEffect(() => {
        if (isOpen) fetchOptions();
    }, [isOpen]);

    useEffect(() => {
        if (subject) {
            setFormData({
                name: subject.name || '',
                code: subject.code || '',
                curriculum: subject.curriculum || '',
                curriculum_level: subject.curriculum_level || '',
                learning_area: subject.learning_area || '',
                subject_type: subject.subject_type || 'compulsory',
                weekly_lessons: subject.weekly_lessons || 5,
                color_hex: subject.color_hex || '#6366f1',
                is_active: subject.is_active ?? true
            });
        }
    }, [subject]);

    const fetchOptions = async () => {
        try {
            const [curricula, learningAreas, curriculumLevels] = await Promise.all([
                curriculumService.getCurricula(), curriculumService.getLearningAreas(), curriculumService.getCurriculumLevels()
            ]);
            setOptions({
                curricula: curricula.results || curricula,
                learningAreas: learningAreas.results || learningAreas,
                curriculumLevels: curriculumLevels.results || curriculumLevels
            });
        } catch (error) { console.error('Failed to fetch options:', error); }
    };

    const filteredLevels = options.curriculumLevels.filter(
        l => !formData.curriculum || l.curriculum == formData.curriculum
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.code) { toast.error('Name and Code are required'); return; }
        setLoading(true);
        try {
            const payload = { ...formData };
            if (!payload.curriculum_level) delete payload.curriculum_level;
            if (!payload.learning_area) delete payload.learning_area;
            const response = await curriculumService.updateSubject(subject.id, payload);
            toast.success('Subject updated');
            if (onSave) onSave(response);
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            const detail = error?.response?.data;
            const msg = typeof detail === 'object' ? Object.values(detail).flat().join(', ') : 'Failed to update subject';
            toast.error(msg);
        } finally { setLoading(false); }
    };

    if (!isOpen || !subject) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Subject"
            subtitle="Update subject details and configuration"
            icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600"><Library size={20} /></div>}
            size="md"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="edit-subject-form" loading={loading} className="bg-purple-600 hover:bg-purple-700 shadow-purple-200/50">
                        {loading ? 'Saving...' : <><Save size={16} /> Update Subject</>}
                    </Modal.SubmitButton>
                </>
            }
        >
                <form id="edit-subject-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 px-8 py-7">
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Subject Name <span className="text-red-400">*</span></label>
                                <input type="text" required value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className={inputClass} placeholder="e.g. Mathematics" />
                            </div>
                            <div>
                                <label className={labelClass}>Code <span className="text-red-400">*</span></label>
                                <input type="text" required value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    className={`${inputClass} uppercase font-mono`} placeholder="e.g. MAT101" />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Curriculum <span className="text-red-400">*</span></label>
                            <select required value={formData.curriculum}
                                onChange={e => setFormData({ ...formData, curriculum: e.target.value, curriculum_level: '' })}
                                className={inputClass}>
                                <option value="">Select Curriculum</option>
                                {options.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Curriculum Level</label>
                                <select value={formData.curriculum_level}
                                    onChange={e => setFormData({ ...formData, curriculum_level: e.target.value })}
                                    className={inputClass}>
                                    <option value="">All Levels</option>
                                    {filteredLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Learning Area</label>
                                <select value={formData.learning_area}
                                    onChange={e => setFormData({ ...formData, learning_area: e.target.value })}
                                    className={inputClass}>
                                    <option value="">Select Area</option>
                                    {options.learningAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-5">
                            <div>
                                <label className={labelClass}>Type</label>
                                <select value={formData.subject_type}
                                    onChange={e => setFormData({ ...formData, subject_type: e.target.value })}
                                    className={inputClass}>
                                    <option value="compulsory">Compulsory</option>
                                    <option value="optional">Optional</option>
                                    <option value="elective">Elective</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Lessons/Week</label>
                                <input type="number" min="1" max="20" value={formData.weekly_lessons}
                                    onChange={e => setFormData({ ...formData, weekly_lessons: parseInt(e.target.value) || 5 })}
                                    className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Color</label>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={formData.color_hex}
                                        onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                                    <input type="text" value={formData.color_hex}
                                        onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                                        className="flex-1 px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-xs font-mono transition-all bg-gray-50/60 hover:bg-white focus:bg-white shadow-inner shadow-gray-100/50" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-1">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
                                <div className="w-10 h-[22px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all"></div>
                                <span className="ml-2.5 text-sm font-medium text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>
                </form>
        </Modal>
    );
};

export default EditSubjectModal;

