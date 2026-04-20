import React, { useState, useEffect } from 'react';
import { Search, Layers, Hash, Loader2, Trash2, Edit2, Plus, Save, Palette } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../services/curriculumService';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

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

// ── Inline Add / Edit Modal ─────────────────────────────────────
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
const LearningAreaManagement = ({ refreshKey = 0 }) => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);

    useEffect(() => { fetchAreas(); }, [refreshKey]);

    const fetchAreas = async () => {
        try {
            setLoading(true);
            const data = await curriculumService.getLearningAreas();
            setAreas(data.results || data);
        } catch (error) {
            console.error('Failed to fetch learning areas:', error);
            toast.error('Failed to load learning areas');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => { setEditingArea(null); setIsModalOpen(true); };

    const handleEdit = (area) => { setEditingArea(area); setIsModalOpen(true); };

    const handleSave = async (formData) => {
        try {
            setSaving(true);
            if (editingArea) {
                await curriculumService.updateLearningArea(editingArea.id, formData);
                toast.success('Learning area updated');
            } else {
                await curriculumService.createLearningArea(formData);
                toast.success('Learning area created');
            }
            setIsModalOpen(false);
            setEditingArea(null);
            fetchAreas();
        } catch (error) {
            console.error('Save failed:', error);
            toast.error(editingArea ? 'Failed to update learning area' : 'Failed to create learning area');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete learning area "${name}"? This cannot be undone.`)) return;
        try {
            await curriculumService.deleteLearningArea(id);
            setAreas(areas.filter(a => a.id !== id));
            toast.success('Learning area deleted');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete learning area. It may have subjects linked.');
        }
    };

    const filteredAreas = areas.filter(a => {
        const matchesSearch = a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = filterCategory === 'all' || a.category === filterCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <input type="text" placeholder="Search learning areas..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                        <option value="all">All Categories</option>
                        {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>
                <button onClick={handleAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all">
                    <Plus size={16} /> Add Learning Area
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                    <span className="ml-3 text-gray-500">Loading learning areas...</span>
                </div>
            ) : filteredAreas.length === 0 ? (
                <div className="text-center py-16">
                    <div className="p-3.5 bg-gray-50 rounded-xl inline-block mb-3">
                        <Layers className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">No learning areas found</h3>
                    <p className="text-sm text-gray-400 mt-1.5 max-w-xs mx-auto">
                        {searchTerm || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Create your first learning area to organize subjects'}
                    </p>
                    {!searchTerm && filterCategory === 'all' && (
                        <button onClick={handleAdd}
                            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all">
                            <Plus size={16} /> Add Learning Area
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAreas.map(area => {
                        const catInfo = getCategoryInfo(area.category);
                        return (
                            <div key={area.id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 transition-all group relative overflow-hidden">
                                {/* Color accent */}
                                <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ backgroundColor: area.color_hex || '#6366f1' }} />

                                <div className="flex justify-between items-start mb-4 mt-1">
                                    <div className="p-2.5 rounded-xl text-white" style={{ backgroundColor: area.color_hex || '#6366f1' }}>
                                        <Layers size={20} />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${area.is_active
                                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                            : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${area.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                            {area.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="font-bold text-gray-900 text-lg leading-tight">{area.name}</h4>
                                {area.code && <p className="text-xs text-indigo-600 font-mono mt-1">{area.code}</p>}

                                <div className="space-y-2 mt-3 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} className="text-gray-400" />
                                        <span className="capitalize">{catInfo.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Palette size={14} className="text-gray-400" />
                                        <span className="font-mono text-xs">{area.color_hex}</span>
                                        <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: area.color_hex }} />
                                    </div>
                                </div>

                                {/* Subject count badge */}
                                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-400">
                                        {area.subject_count ?? 0} {(area.subject_count ?? 0) === 1 ? 'Subject' : 'Subjects'} linked
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(area)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(area.id, area.name)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Stats */}
            {!loading && areas.length > 0 && (
                <div className="text-xs text-gray-500 text-center">
                    Showing {filteredAreas.length} of {areas.length} learning areas
                </div>
            )}

            <LearningAreaModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingArea(null); }}
                onSave={handleSave}
                area={editingArea}
                loading={saving}
            />
        </div>
    );
};

export default LearningAreaManagement;
