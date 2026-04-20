import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, MapPin, Phone, Mail, User, Building2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { institutionService } from '../../../services/institutionService';
import Modal from '../../../components/common/Modal';

const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-gray-50/60 hover:bg-white focus:bg-white shadow-inner shadow-gray-100/50';
const labelClass = 'text-[13px] font-semibold text-gray-600 block mb-2';

const emptyCampus = {
    code: '', name: '', location: '', address_line_1: '', address_line_2: '',
    city: '', county: '', postal_code: '', phone: '', email: '',
    principal_name: '', is_active: true
};

const CampusManagement = () => {
    const [campuses, setCampuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCampus, setEditingCampus] = useState(null);
    const [form, setForm] = useState({ ...emptyCampus });

    useEffect(() => {
        fetchCampuses();
    }, []);

    const fetchCampuses = async () => {
        try {
            const res = await institutionService.getCampuses();
            setCampuses(res.data?.results || res.data || res.results || res);
        } catch (error) {
            console.error('Failed to load campuses:', error);
            toast.error('Failed to load campuses');
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditingCampus(null);
        setForm({ ...emptyCampus });
        setModalOpen(true);
    };

    const openEdit = (campus) => {
        setEditingCampus(campus);
        setForm({ ...campus });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingCampus(null);
        setForm({ ...emptyCampus });
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.code) {
            toast.error('Name and code are required');
            return;
        }
        setSaving(true);
        try {
            if (editingCampus) {
                const res = await institutionService.updateCampus(editingCampus.id, form);
                setCampuses(campuses.map(c => c.id === editingCampus.id ? (res.data || res) : c));
                toast.success('Campus updated');
            } else {
                const res = await institutionService.createCampus(form);
                setCampuses([...campuses, res.data || res]);
                toast.success('Campus created');
            }
            closeModal();
        } catch (error) {
            console.error('Save failed:', error);
            const msg = error.response?.data
                ? Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
                : 'Failed to save campus';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (campus) => {
        if (!confirm(`Delete campus "${campus.name}"? This cannot be undone.`)) return;
        try {
            await institutionService.deleteCampus(campus.id);
            setCampuses(campuses.filter(c => c.id !== campus.id));
            toast.success('Campus deleted');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete campus. It may have linked records.');
        }
    };

    const filtered = campuses.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-gray-400" size={32} />
                <span className="ml-3 text-gray-500">Loading campuses...</span>
            </div>
        );
    }

    return (
        <div className="space-y-7 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Campus Management</h2>
                    <p className="text-gray-400 text-sm mt-1">{campuses.length} campus{campuses.length !== 1 ? 'es' : ''} configured</p>
                </div>
                <button onClick={openAdd}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all">
                    <Plus size={18} /> Add Campus
                </button>
            </div>

            {/* Search */}
            {campuses.length > 0 && (
                <div className="relative max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search campuses..."
                        className={inputClass + ' pl-9'} />
                </div>
            )}

            {/* Campus Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
                    <div className="p-4 bg-gray-50 rounded-xl inline-block mb-3">
                        <Building2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        {campuses.length === 0 ? 'No campuses yet' : 'No matching campuses'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1.5">
                        {campuses.length === 0 ? 'Add your first campus to get started.' : 'Try a different search term.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(campus => (
                        <div key={campus.id}
                            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all group relative">
                            {/* Color bar */}
                            <div className={`h-1.5 ${campus.is_active ? 'bg-indigo-500' : 'bg-gray-300'}`} />

                            <div className="p-6">
                                {/* Header row */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{campus.name}</h4>
                                        <p className="text-xs font-mono text-indigo-600 mt-0.5">{campus.code}</p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(campus)}
                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(campus)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Info rows */}
                                <div className="space-y-2.5 text-xs">
                                    {campus.location && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin size={13} className="text-gray-400 shrink-0" />
                                            <span className="truncate">{campus.location}</span>
                                        </div>
                                    )}
                                    {campus.principal_name && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <User size={13} className="text-gray-400 shrink-0" />
                                            <span>Principal: {campus.principal_name}</span>
                                        </div>
                                    )}
                                    {campus.phone && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Phone size={13} className="text-gray-400 shrink-0" />
                                            <span>{campus.phone}</span>
                                        </div>
                                    )}
                                    {campus.email && (
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Mail size={13} className="text-gray-400 shrink-0" />
                                            <span>{campus.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Status badge */}
                                <div className="mt-4 pt-3 border-t border-gray-50">
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${campus.is_active
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${campus.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                        {campus.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editingCampus ? 'Edit Campus' : 'Add New Campus'}
                subtitle={editingCampus ? 'Editing ' + editingCampus.name : 'Set up a new campus location'}
                icon={Building2}
                size="lg"
                footer={
                    <>
                        <Modal.CancelButton onClick={closeModal} />
                        <Modal.SubmitButton
                            form="campus-form"
                            loading={saving}
                            label={editingCampus ? 'Update Campus' : 'Create Campus'}
                        />
                    </>
                }
            >
                <form id="campus-form" onSubmit={handleSave} className="space-y-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Campus Name *</label>
                            <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)}
                                placeholder="e.g. Main Campus" className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Code *</label>
                            <input type="text" value={form.code} onChange={e => handleChange('code', e.target.value)}
                                placeholder="e.g. MAIN" className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>Location</label>
                            <input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)}
                                placeholder="e.g. Westlands, Nairobi" className={inputClass} />
                        </div>
                    </div>

                    {/* Address */}
                    <Modal.Section icon={MapPin} title="Address">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Address Line 1</label>
                                <input type="text" value={form.address_line_1} onChange={e => handleChange('address_line_1', e.target.value)}
                                    placeholder="Street address" className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Address Line 2</label>
                                <input type="text" value={form.address_line_2} onChange={e => handleChange('address_line_2', e.target.value)}
                                    placeholder="Building, floor, etc." className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input type="text" value={form.city} onChange={e => handleChange('city', e.target.value)}
                                    placeholder="e.g. Nairobi" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>County</label>
                                <input type="text" value={form.county} onChange={e => handleChange('county', e.target.value)}
                                    placeholder="e.g. Nairobi County" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Postal Code</label>
                                <input type="text" value={form.postal_code} onChange={e => handleChange('postal_code', e.target.value)}
                                    placeholder="e.g. 00100" className={inputClass} />
                            </div>
                        </div>
                    </Modal.Section>

                    {/* Contact */}
                    <Modal.Section icon={Phone} title="Contact">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input type="text" value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                                    placeholder="+254 700 000 000" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                                    placeholder="campus@school.ac.ke" className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Principal / Head</label>
                                <input type="text" value={form.principal_name} onChange={e => handleChange('principal_name', e.target.value)}
                                    placeholder="Full name of campus head" className={inputClass} />
                            </div>
                        </div>
                    </Modal.Section>

                    {/* Status */}
                    <div className="flex items-center justify-between p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                        <div>
                            <h4 className="font-medium text-gray-900 text-sm">Active Campus</h4>
                            <p className="text-xs text-gray-500">Inactive campuses won't appear in selections</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer"
                                checked={form.is_active}
                                onChange={e => handleChange('is_active', e.target.checked)} />
                            <div className="w-10 h-[22px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all"></div>
                        </label>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CampusManagement;
