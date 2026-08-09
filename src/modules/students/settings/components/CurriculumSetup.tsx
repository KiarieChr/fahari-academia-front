import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

const CurriculumSetup = () => {
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        status: 'active',
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
            setFormData({ name: '', code: '', status: 'active', description: '', is_active: true });
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading Curricula Track System...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-1">
            {/* Header section with refined card title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-50 via-white to-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <BookOpen size={18} className="text-indigo-600" />
                        Curricula Tracks
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                        Configure frameworks like 8-4-4, CBC, IGCSE and custom educational paths.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-xs shadow-md select-none"
                >
                    <Plus size={15} strokeWidth={3} />
                    <span>Add Curriculum</span>
                </button>
            </div>

            {/* Grid of curricula tracks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curriculums.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700">No curricula tracks configured</h4>
                        <p className="text-xs text-slate-400 mt-1">Get started by defining your school's educational paths.</p>
                    </div>
                ) : (
                    curriculums.map((curr) => (
                        <div
                            key={curr.id}
                            className="group bg-white rounded-[24px] border border-slate-200/70 p-6 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-150 transition-all duration-350 relative overflow-hidden"
                        >
                            {/* Decorative line accent */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 ${curr.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`} />

                            <div className="flex justify-between items-start mb-5">
                                <div className={`p-3 rounded-xl transition-colors duration-300 ${curr.is_active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <BookOpen size={20} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleStatus(curr)}
                                        className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all ${
                                            curr.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {curr.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(curr.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
                                        title="Delete Curriculum"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <h4 className="text-md font-black text-slate-800 tracking-tight mb-1 group-hover:text-indigo-900 transition-colors">
                                {curr.name} {curr.code && <span className="text-xs font-mono font-bold text-slate-400 ml-1">({curr.code})</span>}
                            </h4>
                            
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                Status: {curr.status?.replace('_', ' ') || 'Active'}
                            </div>

                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-4 line-clamp-2">
                                {curr.description || 'No system description configured for this curriculum track.'}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Curriculum"
                    subtitle="Define a new curriculum track"
                    icon={BookOpen}
                    accentColor="bg-indigo-600"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleSave} label="Save Curriculum" />
                        </>
                    }
                >
                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <label className={labelClass}>Curriculum Name</label>
                            <input
                                className={inputClass}
                                placeholder="e.g. Competency Based Curriculum (CBC)"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Code (Optional)</label>
                            <input
                                className={inputClass}
                                placeholder="e.g. CBC-KE"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <select
                                className={inputClass}
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="phased_out">Phased Out</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                className={`${inputClass} resize-none`}
                                rows="3"
                                placeholder="Describe details of this curriculum track..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                <span className="ml-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Enable by Default</span>
                            </label>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default CurriculumSetup;

