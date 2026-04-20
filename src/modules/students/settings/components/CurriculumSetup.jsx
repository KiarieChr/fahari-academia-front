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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Curricula...</div>;

    return (
        <div className="space-y-6 m-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
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
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{curr.status?.replace('_', ' ') || 'Active'}</span>

                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                {curr.description || 'No description provided.'}
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
                    icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={20} /></div>}
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleSave}>Save Curriculum</Modal.SubmitButton>
                        </>
                    }
                >
                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <label className={labelClass}>Curriculum Name</label>
                            <input className={inputClass} placeholder="e.g. CBC" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className={labelClass}>Code (Optional)</label>
                            <input className={inputClass} placeholder="e.g. K-CBC" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <select className={inputClass} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="phased_out">Phased Out</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea className={`${inputClass} resize-none`} rows="3" placeholder="Brief description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                                <div className="w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                <span className="ml-2.5 text-sm font-medium text-gray-600">Active</span>
                            </label>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default CurriculumSetup;

