import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Library, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../../services/curriculumService';

const AddItemModal = ({ isOpen, onClose, defaultType = 'curriculum', onSuccess }) => {
    const [itemType, setItemType] = useState(defaultType); // 'curriculum' or 'subject'
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        curricula: [],
        learningAreas: [],
        curriculumLevels: []
    });

    // Form States
    const [curriculumData, setCurriculumData] = useState({
        name: '',
        code: '',
        education_level: 'primary',
        description: '',
        status: 'active'
    });

    const [subjectData, setSubjectData] = useState({
        name: '',
        code: '',
        curriculum: '',
        curriculum_level: '',
        learning_area: '',
        subject_type: 'compulsory',
        weekly_lessons: 5,
        color_hex: '#6366f1'
    });

    // Fetch options when modal opens
    useEffect(() => {
        if (isOpen) {
            setItemType(defaultType);
            fetchOptions();
        }
    }, [isOpen, defaultType]);

    const fetchOptions = async () => {
        try {
            const [curricula, learningAreas, curriculumLevels] = await Promise.all([
                curriculumService.getCurricula(),
                curriculumService.getLearningAreas(),
                curriculumService.getCurriculumLevels()
            ]);
            setOptions({
                curricula: curricula.results || curricula,
                learningAreas: learningAreas.results || learningAreas,
                curriculumLevels: curriculumLevels.results || curriculumLevels
            });
        } catch (error) {
            console.error('Failed to fetch options:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (itemType === 'curriculum') {
                await curriculumService.createCurriculum(curriculumData);
                toast.success(`Curriculum "${curriculumData.name}" Created Successfully`);
            } else {
                // Build subject payload
                const payload = {
                    name: subjectData.name,
                    code: subjectData.code,
                    curriculum: subjectData.curriculum,
                    subject_type: subjectData.subject_type,
                    weekly_lessons: subjectData.weekly_lessons,
                    color_hex: subjectData.color_hex
                };
                
                // Add optional fields only if they have values
                if (subjectData.curriculum_level) {
                    payload.curriculum_level = subjectData.curriculum_level;
                }
                if (subjectData.learning_area) {
                    payload.learning_area = subjectData.learning_area;
                }
                
                await curriculumService.createSubject(payload);
                toast.success(`Subject "${subjectData.name}" Added Successfully`);
            }

            // Reset forms
            setCurriculumData({ name: '', code: '', education_level: 'primary', description: '', status: 'active' });
            setSubjectData({ name: '', code: '', curriculum: '', curriculum_level: '', learning_area: '', subject_type: 'compulsory', weekly_lessons: 5, color_hex: '#6366f1' });
            
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Submit failed:', error);
            toast.error(error.message || 'Failed to save item');
        } finally {
            setLoading(false);
        }
    };

    // Filter curriculum levels based on selected curriculum
    const filteredLevels = options.curriculumLevels.filter(
        level => !subjectData.curriculum || level.curriculum == subjectData.curriculum
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add New Item</h2>
                        <p className="text-sm text-gray-500">Create a new curriculum or subject.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">

                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setItemType('curriculum')}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${itemType === 'curriculum'
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${itemType === 'curriculum' ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                                <BookOpen size={18} />
                            </div>
                            <span className="text-sm font-bold">Curriculum</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setItemType('subject')}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${itemType === 'subject'
                                ? 'border-purple-500 bg-purple-50 text-purple-700 ring-1 ring-purple-500'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${itemType === 'subject' ? 'bg-purple-200' : 'bg-gray-100'}`}>
                                <Library size={18} />
                            </div>
                            <span className="text-sm font-bold">Subject</span>
                        </button>
                    </div>

                    {/* Conditional Fields */}
                    {itemType === 'curriculum' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Curriculum Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={curriculumData.name}
                                    onChange={(e) => setCurriculumData({ ...curriculumData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="e.g. Competency Based Curriculum"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Code</label>
                                    <input
                                        type="text"
                                        value={curriculumData.code}
                                        onChange={(e) => setCurriculumData({ ...curriculumData, code: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="e.g. CBC"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Education Level <span className="text-red-500">*</span></label>
                                    <select
                                        value={curriculumData.education_level}
                                        onChange={(e) => setCurriculumData({ ...curriculumData, education_level: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="primary">Primary</option>
                                        <option value="junior_secondary">Junior Secondary</option>
                                        <option value="senior_secondary">Senior Secondary</option>
                                        <option value="international">International</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                                <textarea
                                    value={curriculumData.description}
                                    onChange={(e) => setCurriculumData({ ...curriculumData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20"
                                    placeholder="Brief details about this curriculum..."
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Subject Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={subjectData.name}
                                        onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Subject Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={subjectData.code}
                                        onChange={(e) => setSubjectData({ ...subjectData, code: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="e.g. MAT101"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Curriculum <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={subjectData.curriculum}
                                    onChange={(e) => setSubjectData({ ...subjectData, curriculum: e.target.value, curriculum_level: '' })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                >
                                    <option value="">Select Curriculum</option>
                                    {options.curricula.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Curriculum Level</label>
                                    <select
                                        value={subjectData.curriculum_level}
                                        onChange={(e) => setSubjectData({ ...subjectData, curriculum_level: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">All Levels</option>
                                        {filteredLevels.map(l => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Learning Area</label>
                                    <select
                                        value={subjectData.learning_area}
                                        onChange={(e) => setSubjectData({ ...subjectData, learning_area: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">Select Area</option>
                                        {options.learningAreas.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                                    <select
                                        value={subjectData.subject_type}
                                        onChange={(e) => setSubjectData({ ...subjectData, subject_type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option value="compulsory">Compulsory</option>
                                        <option value="optional">Optional</option>
                                        <option value="elective">Elective</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Lessons/Week</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={subjectData.weekly_lessons}
                                        onChange={(e) => setSubjectData({ ...subjectData, weekly_lessons: parseInt(e.target.value) || 5 })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Color</label>
                                    <input
                                        type="color"
                                        value={subjectData.color_hex}
                                        onChange={(e) => setSubjectData({ ...subjectData, color_hex: e.target.value })}
                                        className="w-full h-10 px-1 py-1 border rounded-lg cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-6 flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 disabled:opacity-70 ${itemType === 'curriculum'
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {itemType === 'curriculum' ? 'Save Curriculum' : 'Save Subject'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;

