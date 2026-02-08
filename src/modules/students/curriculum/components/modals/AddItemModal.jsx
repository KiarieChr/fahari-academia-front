import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Library, Check, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const AddItemModal = ({ isOpen, onClose, defaultType = 'curriculum' }) => {
    const [itemType, setItemType] = useState(defaultType); // 'curriculum' or 'subject'

    // Form States
    const [curriculumData, setCurriculumData] = useState({
        name: '',
        level: 'Primary',
        classes: '',
        description: ''
    });

    const [subjectData, setSubjectData] = useState({
        name: '',
        code: '',
        area: 'Sciences',
        type: 'Compulsory'
    });

    // Update internal type if defaultType changes when opening
    useEffect(() => {
        if (isOpen) {
            setItemType(defaultType);
        }
    }, [isOpen, defaultType]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (itemType === 'curriculum') {
            toast.success(`Curriculum "${curriculumData.name}" Created Successfully`);
        } else {
            toast.success(`Subject "${subjectData.name}" Added Successfully`);
        }

        onClose();
        // Reset forms
        setCurriculumData({ name: '', level: 'Primary', classes: '', description: '' });
        setSubjectData({ name: '', code: '', area: 'Sciences', type: 'Compulsory' });
    };

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
                                <label className="text-sm font-medium text-gray-700 block mb-1">Curriculum Name</label>
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
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Education Level</label>
                                    <select
                                        value={curriculumData.level}
                                        onChange={(e) => setCurriculumData({ ...curriculumData, level: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option>Primary</option>
                                        <option>Secondary</option>
                                        <option>Tertiary</option>
                                        <option>International</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Classes Covered</label>
                                    <input
                                        type="text"
                                        required
                                        value={curriculumData.classes}
                                        onChange={(e) => setCurriculumData({ ...curriculumData, classes: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        placeholder="e.g. Grade 1 - 6"
                                    />
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
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Subject Name</label>
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
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Subject Code</label>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Learning Area</label>
                                    <select
                                        value={subjectData.area}
                                        onChange={(e) => setSubjectData({ ...subjectData, area: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option>Sciences</option>
                                        <option>Languages</option>
                                        <option>Humanities</option>
                                        <option>Technical</option>
                                        <option>Creative Arts</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                                    <select
                                        value={subjectData.type}
                                        onChange={(e) => setSubjectData({ ...subjectData, type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                                    >
                                        <option>Compulsory</option>
                                        <option>Optional</option>
                                        <option>Elective</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-6 flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-black rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 ${itemType === 'curriculum'
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                                }`}
                        >
                            <Save size={16} />
                            {itemType === 'curriculum' ? 'Save Curriculum' : 'Save Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;

