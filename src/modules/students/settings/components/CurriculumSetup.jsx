import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';

const CurriculumSetup = () => {
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        education_level: 'primary',
        description: '',
        is_active: true
    });

    const fetchCurricula = async () => {
        try {
            setLoading(true);
            const res = await studentSettingsService.getCurricula();
            setCurriculums(res.data?.results || res.results || res || []);
        } catch (e) {
            toast.error("Failed to fetch curricula");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurricula();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await studentSettingsService.createCurriculum(formData);
            toast.success('Curriculum added successfully');
            setIsModalOpen(false);
            setFormData({ name: '', code: '', education_level: 'primary', description: '', is_active: true });
            fetchCurricula();
        } catch (e) {
            toast.error("Failed to save curriculum");
        }
    };

    const toggleStatus = async (curr) => {
        try {
            await studentSettingsService.updateCurriculum(curr.id, { is_active: !curr.is_active });
            toast.success('Status updated');
            fetchCurricula();
        } catch (e) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this curriculum?')) {
            try {
                await studentSettingsService.deleteCurriculum(id);
                toast.success('Deleted');
                fetchCurricula();
            } catch (e) {
                toast.error("Delete failed");
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Curricula...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Curricula</h3>
                    <p className="text-sm text-gray-500">Manage 8-4-4, CBC, IGCSE and other curriculum tracks</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill shadow-sm"
                >
                    <Plus size={18} /> Add Curriculum
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-3">
                {curriculums.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No curricula configured.
                    </div>
                ) : (
                    curriculums.map((curr) => (
                        <div key={curr.id} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${curr.is_active ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${curr.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <BookOpen size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleStatus(curr)} className={`btn btn-sm fw-bold uppercase ${curr.is_active ? 'btn-light text-success border-success' : 'btn-light text-secondary border-secondary'}`}>
                                        {curr.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                    <button onClick={() => handleDelete(curr.id)} className="btn btn-sm btn-light text-danger border-danger ms-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h4 className="text-lg font-bold text-gray-900 mb-1">{curr.name} {curr.code && `(${curr.code})`}</h4>
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{curr.education_level.replace('_', ' ')}</span>

                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                {curr.description || 'No description provided.'}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3.5">
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Add Curriculum</h3>
                                    <p className="text-[0.8rem] text-gray-400 mt-0.5">Define a new curriculum track</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <span className="text-gray-400 text-lg">&times;</span>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="px-7 py-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Curriculum Name</label>
                                <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all" placeholder="e.g. CBC" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Code (Optional)</label>
                                <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all" placeholder="e.g. K-CBC" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Education Level</label>
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all" value={formData.education_level} onChange={e => setFormData({ ...formData, education_level: e.target.value })}>
                                    <option value="primary">Primary</option>
                                    <option value="junior_secondary">Junior Secondary</option>
                                    <option value="senior_secondary">Senior Secondary</option>
                                    <option value="international">International</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm resize-none transition-all" rows="3" placeholder="Brief description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                    <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    <span className="ml-2.5 text-sm font-medium text-gray-600">Active</span>
                                </label>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">Cancel</button>
                            <button type="button" onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all">Save Curriculum</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumSetup;

