import React, { useState, useEffect } from 'react';
import { Search, Layers, Plus, Edit2, Trash2, Book, Hash, Calendar, GraduationCap, Loader2, Save, Palette } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../services/curriculumService';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';
import EditSubjectModal from './modals/EditSubjectModal';

const CATEGORY_OPTIONS = [
    { value: 'sciences', label: 'Sciences', color: 'bg-blue-500' },
    { value: 'languages', label: 'Languages', color: 'bg-green-500' },
    { value: 'humanities', label: 'Humanities', color: 'bg-purple-500' },
    { value: 'technical', label: 'Technical/Vocational', color: 'bg-orange-500' },
    { value: 'arts', label: 'Creative Arts', color: 'bg-pink-500' },
    { value: 'pe', label: 'Physical Education', color: 'bg-yellow-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

const getCategoryInfo = (category) =>
    CATEGORY_OPTIONS.find(c => c.value === category) || CATEGORY_OPTIONS[6];

// ── Inline Add / Edit Modal for Learning Area ─────────────────────────────────────
const LearningAreaModal = ({ isOpen, onClose, onSave, area, loading }) => {
    const [formData, setFormData] = useState({
        name: '', code: '', category: 'other', description: '', color_hex: '#6366f1', is_active: true, order: 0,
    });

    useEffect(() => {
        if (area) {
            setFormData({
                name: area.name || '',
                code: area.code || '',
                category: area.category || 'other',
                description: area.description || '',
                color_hex: area.color_hex || '#6366f1',
                is_active: area.is_active ?? true,
                order: area.order || 0,
            });
        } else {
            setFormData({ name: '', code: '', category: 'other', description: '', color_hex: '#6366f1', is_active: true, order: 0 });
        }
    }, [area, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) { toast.error('Name is required'); return; }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={area ? 'Edit Learning Area' : 'Add Learning Area'}
            subtitle="Define a broad academic category"
            icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600"><Layers size={20} /></div>}
            size="md"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton form="la-form" loading={loading}>
                        {loading ? 'Saving...' : <><Save className="w-4 h-4" /> {area ? 'Update' : 'Create'}</>}
                    </Modal.SubmitButton>
                </>
            }
        >
            <form id="la-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 px-8 py-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className={labelClass}>Name <span className="text-red-400">*</span></label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Sciences, Languages"
                            className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Code</label>
                        <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g., SCI"
                            className={`${inputClass} uppercase`} />
                    </div>

                    <div>
                        <label className={labelClass}>Category</label>
                        <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className={inputClass}>
                            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>UI Color</label>
                        <div className="flex items-center gap-3">
                            <input type="color" value={formData.color_hex} onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
                            <input type="text" value={formData.color_hex} onChange={e => setFormData({ ...formData, color_hex: e.target.value })}
                                className={`flex-1 ${inputClass} font-mono`} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Display Order</label>
                        <input type="number" min="0" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                            className={inputClass} />
                    </div>

                    <div className="col-span-2">
                        <label className={labelClass}>Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows="3" placeholder="Brief description of this learning area"
                            className={`${inputClass} resize-none`} />
                    </div>

                    <div className="col-span-2 pt-1">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
                            <div className="w-10 h-[22px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all"></div>
                            <span className="ml-2.5 text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

// ── Main Component ──────────────────────────────────────────────
const LearningAreasAndSubjectsTab = ({ refreshKey = 0 }) => {
    const [areas, setAreas] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAreaId, setSelectedAreaId] = useState('');
    
    // UI State
    const [searchArea, setSearchArea] = useState('');
    
    // Learning Area Modal State
    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [savingArea, setSavingArea] = useState(false);

    // Subject Modal State
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [areasData, subjectsData] = await Promise.all([
                curriculumService.getLearningAreas(),
                curriculumService.getSubjects()
            ]);
            
            const fetchedAreas = areasData.results || areasData;
            setAreas(fetchedAreas);
            setSubjects(subjectsData.results || subjectsData);
            
            if (fetchedAreas.length > 0 && !selectedAreaId) {
                setSelectedAreaId(fetchedAreas[0].id.toString());
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load learning areas and subjects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [refreshKey]);

    // --- Learning Area Actions ---
    const handleSaveArea = async (formData) => {
        try {
            setSavingArea(true);
            if (editingArea) {
                await curriculumService.updateLearningArea(editingArea.id, formData);
                toast.success('Learning area updated');
            } else {
                await curriculumService.createLearningArea(formData);
                toast.success('Learning area created');
            }
            setIsAreaModalOpen(false);
            setEditingArea(null);
            fetchData();
        } catch (error) {
            console.error('Save failed:', error);
            toast.error(editingArea ? 'Failed to update learning area' : 'Failed to create learning area');
        } finally {
            setSavingArea(false);
        }
    };

    const handleDeleteArea = async (id, name) => {
        if (!confirm(`Delete learning area "${name}"? This cannot be undone.`)) return;
        try {
            await curriculumService.deleteLearningArea(id);
            if (selectedAreaId === id.toString()) {
                setSelectedAreaId('');
            }
            toast.success('Learning area deleted');
            fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete learning area. It may have subjects linked.');
        }
    };

    // --- Subject Actions ---
    const handleSaveSubject = async (updatedSubject) => {
        try {
            const isEditing = !!updatedSubject.id;
            if (isEditing) {
                await curriculumService.updateSubject(updatedSubject.id, updatedSubject);
                toast.success('Subject updated');
            } else {
                // To allow adding subjects with the modal, but if the modal only edits, we can't add.
                // Wait, SubjectManagement used EditSubjectModal just for editing.
                // If the user wants to add, they'll use the main 'Add Item' button from the Dashboard,
                // or we could allow adding here. Let's just update for now.
                toast.success('Subject action completed');
            }
            setIsSubjectModalOpen(false);
            setEditingSubject(null);
            fetchData();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to save subject');
        }
    };

    const handleDeleteSubject = async (id) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            try {
                await curriculumService.deleteSubject(id);
                toast.success('Subject deleted');
                fetchData();
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete subject');
            }
        }
    };

    // Filtering
    const filteredAreas = areas.filter(a => 
        a.name?.toLowerCase().includes(searchArea.toLowerCase()) ||
        a.code?.toLowerCase().includes(searchArea.toLowerCase())
    );

    const activeArea = areas.find(a => a.id.toString() === selectedAreaId);
    
    // A subject belongs to this learning area if its learning_area ID matches
    const activeAreaSubjects = subjects.filter(sub => {
        if (!selectedAreaId) return false;
        // Compare as strings to be safe
        return sub.learning_area?.toString() === selectedAreaId.toString();
    });

    const getTypeBadge = (type) => {
        switch (type) {
            case 'compulsory': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'optional': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'elective': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    if (loading && areas.length === 0) return <div className="p-8 text-center text-slate-500">Loading Learning Areas...</div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start w-full">
            <style>{`
                .ls-sidebar-custom { width: 100%; flex-shrink: 0; }
                .ls-main-custom { flex: 1 1 0%; min-width: 0; width: 100%; }
                @media (min-width: 768px) { .ls-sidebar-custom { width: 300px; } }
                @media (min-width: 1024px) { .ls-sidebar-custom { width: 340px; } }
            `}</style>
            
            {/* LEFT SIDEBAR: Learning Areas */}
            <div className="ls-sidebar-custom bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col max-h-[800px]">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800">Learning Areas</h3>
                    <button
                        onClick={() => { setEditingArea(null); setIsAreaModalOpen(true); }}
                        className="btn btn-sm btn-primary p-1.5 rounded-lg shadow-sm"
                        title="New Learning Area"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="relative mb-4 shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search learning areas..."
                        value={searchArea}
                        onChange={e => setSearchArea(e.target.value)}
                        className={`${inputClass} pl-9 text-xs bg-white`}
                    />
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pr-1">
                    {filteredAreas.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-8">No learning areas found</div>
                    ) : (
                        filteredAreas.map(area => {
                            const isSelected = selectedAreaId === area.id.toString();
                            const catInfo = getCategoryInfo(area.category);
                            return (
                                <div
                                    key={area.id}
                                    onClick={() => setSelectedAreaId(area.id.toString())}
                                    className={`flex flex-col gap-2 p-3 rounded-xl cursor-pointer transition-all border group mb-3 ${isSelected
                                        ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/10'
                                        : 'bg-transparent border-transparent hover:bg-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white"
                                             style={{ backgroundColor: area.color_hex || '#6366f1' }}>
                                            <Layers size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                                    {area.name}
                                                </p>
                                                {!area.is_active && (
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] uppercase font-bold tracking-wider rounded shadow-sm shrink-0">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <p className="text-[10px] text-slate-400 font-semibold truncate">
                                                    {area.code || catInfo.label}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="shrink-0 text-indigo-500">
                                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingArea(area); setIsAreaModalOpen(true); }}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded mr-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteArea(area.id, area.name); }}
                                            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Subjects View */}
            <div className="ls-main-custom flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl min-h-[400px]">
                {!activeArea ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 px-6">
                        <Layers size={48} className="mb-4 text-slate-200" />
                        <h4 className="text-sm font-bold text-slate-600">Select a learning area</h4>
                        <p className="text-xs mt-2 text-center max-w-sm">Select a learning area from the list on the left to view and manage its subjects.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full overflow-y-auto hide-scrollbar">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30 rounded-t-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl text-white" style={{ backgroundColor: activeArea.color_hex || '#6366f1' }}>
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">{activeArea.name} Subjects</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">Manage subjects assigned to this learning area</p>
                                </div>
                            </div>

                            {/* Assuming adding subject is done via the main "Add Item" dashboard button, 
                                but we can leave a hint here. */}
                        </div>

                        <div className="p-6 flex-1 bg-slate-50/20 rounded-b-2xl">
                            {activeAreaSubjects.length === 0 ? (
                                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Book className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <h4 className="text-sm font-bold text-slate-600 mb-1">No subjects found</h4>
                                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">There are no subjects configured under {activeArea.name}.</p>
                                    <p className="text-[10px] text-slate-400">Use the <strong className="text-indigo-600">Add Item</strong> button in the top right to create a new subject.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {activeAreaSubjects.map((sub) => (
                                        <div key={sub.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-3 relative">
                                                <div
                                                    className="p-2.5 rounded-lg text-white transition-colors"
                                                    style={{ backgroundColor: activeArea.color_hex || '#6366f1' }}
                                                >
                                                    <Book size={20} />
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getTypeBadge(sub.subject_type)}`}>
                                                    {sub.subject_type_display || sub.subject_type || 'Subject'}
                                                </span>
                                            </div>

                                            <div className="mb-3 relative">
                                                <h4 className="font-bold text-slate-900 text-lg leading-tight">{sub.name}</h4>
                                                <p className="text-xs text-indigo-600 font-mono mt-1">{sub.code}</p>
                                            </div>

                                            <div className="space-y-2 text-sm text-slate-500 relative">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={14} className="text-slate-400" />
                                                    <span>{sub.curriculum_level_name || 'All Levels'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span>{sub.weekly_lessons || 5} Lessons / Week</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2 relative">
                                                <button
                                                    onClick={() => { setEditingSubject(sub); setIsSubjectModalOpen(true); }}
                                                    className="text-xs font-semibold text-slate-500 hover:text-indigo-600 px-2 py-1 hover:bg-slate-50 rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSubject(sub.id)}
                                                    className="text-xs font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 hover:bg-slate-50 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <LearningAreaModal
                isOpen={isAreaModalOpen}
                onClose={() => { setIsAreaModalOpen(false); setEditingArea(null); }}
                onSave={handleSaveArea}
                area={editingArea}
                loading={savingArea}
            />

            {isSubjectModalOpen && editingSubject && (
                <EditSubjectModal
                    isOpen={isSubjectModalOpen}
                    onClose={() => { setIsSubjectModalOpen(false); setEditingSubject(null); }}
                    subject={editingSubject}
                    onSave={handleSaveSubject}
                />
            )}
        </div>
    );
};

export default LearningAreasAndSubjectsTab;
