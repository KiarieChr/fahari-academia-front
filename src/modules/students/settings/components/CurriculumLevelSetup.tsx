import React, { useState, useEffect } from 'react';
import { Plus, Layers, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

const CurriculumLevelSetup = () => {
    const [levels, setLevels] = useState([]);
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        curriculum: '',
        order: 1
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [levelsRes, curriculaRes] = await Promise.all([
                studentSettingsService.getCurriculumLevels(),
                studentSettingsService.getCurricula()
            ]);
            const levelsData = levelsRes.data?.results || levelsRes.results || levelsRes || [];
            const curriculaData = curriculaRes.data?.results || curriculaRes.results || curriculaRes || [];

            setLevels(levelsData);
            setCurricula(curriculaData);

            if (curriculaData.length > 0) {
                setFormData(prev => ({ ...prev, curriculum: curriculaData[0].id }));
            }
        } catch (e) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await studentSettingsService.createCurriculumLevel(formData);
            toast.success('Level added successfully');
            setIsModalOpen(false);
            setFormData(prev => ({ ...prev, name: '', order: levels.length + 1 }));
            fetchData();
        } catch (e) {
            toast.error("Failed to save level");
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this level?')) {
            try {
                await studentSettingsService.deleteCurriculumLevel(id);
                toast.success('Deleted');
                fetchData();
            } catch (e) {
                toast.error("Delete failed");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading Stage Levels...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-1">
            {/* Header section with refined card title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-50 via-white to-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Layers size={18} className="text-indigo-600" />
                        Curriculum Levels
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                        Define school level stages (e.g. Playgroup, Lower Primary, Junior Secondary).
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-xs shadow-md select-none"
                >
                    <Plus size={15} strokeWidth={3} />
                    <span>Add Level</span>
                </button>
            </div>

            {/* Grid of stages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700">No stage levels configured</h4>
                        <p className="text-xs text-slate-400 mt-1">Add class levels to structure student progress.</p>
                    </div>
                ) : (
                    levels.map((lvl) => (
                        <div
                            key={lvl.id}
                            className="group bg-white rounded-[24px] border border-slate-200/70 p-6 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-indigo-150 transition-all duration-350 relative overflow-hidden"
                        >
                            {/* Accent badge indicating order */}
                            <div className="absolute top-0 right-0 px-3.5 py-1.5 bg-indigo-50/80 rounded-bl-[16px] text-[10px] font-black text-indigo-700 uppercase tracking-widest border-l border-b border-indigo-100/50">
                                Order: {lvl.order}
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <Layers size={20} />
                                </div>
                                <button
                                    onClick={() => handleDelete(lvl.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all absolute bottom-5 right-5"
                                    title="Delete Level"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <h4 className="text-md font-black text-slate-800 tracking-tight mb-1 group-hover:text-indigo-900 transition-colors mt-2">
                                {lvl.name}
                            </h4>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {lvl.curriculum_name}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Curriculum Level"
                    subtitle="Define a level within a curriculum"
                    icon={Layers}
                    accentColor="bg-indigo-600"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleSave} label="Save Level" />
                        </>
                    }
                >
                    <form onSubmit={handleSave} className="space-y-5">
                        <div>
                            <label className={labelClass}>Level Name</label>
                            <input
                                className={inputClass}
                                placeholder="e.g. Junior Secondary School (JSS)"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Curriculum</label>
                            <select
                                className={inputClass}
                                value={formData.curriculum}
                                onChange={e => setFormData({ ...formData, curriculum: e.target.value })}
                                required
                            >
                                <option value="">Select Curriculum</option>
                                {curricula.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Sort Order</label>
                            <input
                                type="number"
                                className={inputClass}
                                value={formData.order}
                                onChange={e => setFormData({ ...formData, order: e.target.value })}
                                required
                            />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default CurriculumLevelSetup;

