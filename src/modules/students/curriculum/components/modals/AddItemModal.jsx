import React, { useState, useEffect } from 'react';
import { Save, BookOpen, Library, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../../services/curriculumService';
import Modal from '../../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../../components/ui/FormField';

const AddItemModal = ({ isOpen, onClose, defaultType = 'curriculum', onSuccess }) => {
    const [itemType, setItemType] = useState(defaultType);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({ curricula: [], learningAreas: [], curriculumLevels: [] });

    const [curriculumData, setCurriculumData] = useState({ name: '', code: '', description: '', status: 'active' });
    const [subjectData, setSubjectData] = useState({
        name: '', code: '', curriculum: '', curriculum_level: '', learning_area: '',
        subject_type: 'compulsory', weekly_lessons: 5, color_hex: '#6366f1'
    });

    useEffect(() => {
        if (isOpen) { setItemType(defaultType); fetchOptions(); }
    }, [isOpen, defaultType]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (itemType === 'curriculum') {
                await curriculumService.createCurriculum(curriculumData);
                toast.success(`Curriculum "${curriculumData.name}" created`);
            } else {
                const payload = { name: subjectData.name, code: subjectData.code, curriculum: subjectData.curriculum,
                    subject_type: subjectData.subject_type, weekly_lessons: subjectData.weekly_lessons, color_hex: subjectData.color_hex };
                if (subjectData.curriculum_level) payload.curriculum_level = subjectData.curriculum_level;
                if (subjectData.learning_area) payload.learning_area = subjectData.learning_area;
                await curriculumService.createSubject(payload);
                toast.success(`Subject "${subjectData.name}" created`);
            }
            setCurriculumData({ name: '', code: '', description: '', status: 'active' });
            setSubjectData({ name: '', code: '', curriculum: '', curriculum_level: '', learning_area: '', subject_type: 'compulsory', weekly_lessons: 5, color_hex: '#6366f1' });
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Submit failed:', error);
            const detail = error?.response?.data;
            const msg = typeof detail === 'object' ? Object.values(detail).flat().join(', ') : (error.message || 'Failed to save');
            toast.error(msg);
        } finally { setLoading(false); }
    };

    const filteredLevels = options.curriculumLevels.filter(
        level => !subjectData.curriculum || level.curriculum == subjectData.curriculum
    );

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Item"
            subtitle="Create a new curriculum or subject"
            icon={<div className={`flex items-center justify-center w-10 h-10 rounded-xl ${itemType === 'curriculum' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                {itemType === 'curriculum' ? <BookOpen size={20} /> : <Library size={20} />}
            </div>}
            size="md"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="add-item-form" loading={loading}
                        className={itemType === 'subject' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200/50' : ''}>
                        {loading
                            ? 'Saving...'
                            : <><Save size={16} /> {itemType === 'curriculum' ? 'Create Curriculum' : 'Create Subject'}</>}
                    </Modal.SubmitButton>
                </>
            }
        >
                <form id="add-item-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 px-8 py-7">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-3 mb-7">
                        <button type="button" onClick={() => setItemType('curriculum')}
                            className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${itemType === 'curriculum'
                                ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400'
                                : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
                            <div className={`p-2 rounded-lg ${itemType === 'curriculum' ? 'bg-indigo-200/60' : 'bg-gray-100'}`}><BookOpen size={18} /></div>
                            <span className="text-sm font-bold">Curriculum</span>
                        </button>
                        <button type="button" onClick={() => setItemType('subject')}
                            className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${itemType === 'subject'
                                ? 'border-purple-400 bg-purple-50 text-purple-700 ring-1 ring-purple-400'
                                : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}>
                            <div className={`p-2 rounded-lg ${itemType === 'subject' ? 'bg-purple-200/60' : 'bg-gray-100'}`}><Library size={18} /></div>
                            <span className="text-sm font-bold">Subject</span>
                        </button>
                    </div>

                    {/* ── Curriculum Fields ──────────────── */}
                    {itemType === 'curriculum' ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className={labelClass}>Curriculum Name <span className="text-red-400">*</span></label>
                                <input type="text" required value={curriculumData.name}
                                    onChange={e => setCurriculumData({ ...curriculumData, name: e.target.value })}
                                    className={inputClass} placeholder="e.g. Competency Based Curriculum" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Code</label>
                                    <input type="text" value={curriculumData.code}
                                        onChange={e => setCurriculumData({ ...curriculumData, code: e.target.value })}
                                        className={`${inputClass} uppercase`} placeholder="e.g. CBC" />
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select value={curriculumData.status}
                                        onChange={e => setCurriculumData({ ...curriculumData, status: e.target.value })}
                                        className={inputClass}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="phased_out">Phased Out</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={curriculumData.description}
                                    onChange={e => setCurriculumData({ ...curriculumData, description: e.target.value })}
                                    className={`${inputClass} resize-none`} rows="3" placeholder="Brief details about this curriculum..." />
                            </div>
                        </div>
                    ) : (
                        /* ── Subject Fields ─────────────────── */
                        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Subject Name <span className="text-red-400">*</span></label>
                                    <input type="text" required value={subjectData.name}
                                        onChange={e => setSubjectData({ ...subjectData, name: e.target.value })}
                                        className={inputClass} placeholder="e.g. Mathematics" />
                                </div>
                                <div>
                                    <label className={labelClass}>Code <span className="text-red-400">*</span></label>
                                    <input type="text" required value={subjectData.code}
                                        onChange={e => setSubjectData({ ...subjectData, code: e.target.value })}
                                        className={`${inputClass} uppercase font-mono`} placeholder="e.g. MAT101" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Curriculum <span className="text-red-400">*</span></label>
                                <select required value={subjectData.curriculum}
                                    onChange={e => setSubjectData({ ...subjectData, curriculum: e.target.value, curriculum_level: '' })}
                                    className={inputClass}>
                                    <option value="">Select Curriculum</option>
                                    {options.curricula.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Curriculum Level</label>
                                    <select value={subjectData.curriculum_level}
                                        onChange={e => setSubjectData({ ...subjectData, curriculum_level: e.target.value })}
                                        className={inputClass}>
                                        <option value="">All Levels</option>
                                        {filteredLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Learning Area</label>
                                    <select value={subjectData.learning_area}
                                        onChange={e => setSubjectData({ ...subjectData, learning_area: e.target.value })}
                                        className={inputClass}>
                                        <option value="">Select Area</option>
                                        {options.learningAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-5">
                                <div>
                                    <label className={labelClass}>Type</label>
                                    <select value={subjectData.subject_type}
                                        onChange={e => setSubjectData({ ...subjectData, subject_type: e.target.value })}
                                        className={inputClass}>
                                        <option value="compulsory">Compulsory</option>
                                        <option value="optional">Optional</option>
                                        <option value="elective">Elective</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Lessons/Week</label>
                                    <input type="number" min="1" max="20" value={subjectData.weekly_lessons}
                                        onChange={e => setSubjectData({ ...subjectData, weekly_lessons: parseInt(e.target.value) || 5 })}
                                        className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={subjectData.color_hex}
                                            onChange={e => setSubjectData({ ...subjectData, color_hex: e.target.value })}
                                            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                                        <input type="text" value={subjectData.color_hex}
                                            onChange={e => setSubjectData({ ...subjectData, color_hex: e.target.value })}
                                            className="flex-1 px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-xs font-mono transition-all bg-gray-50/60 hover:bg-white focus:bg-white shadow-inner shadow-gray-100/50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
        </Modal>
    );
};

export default AddItemModal;

