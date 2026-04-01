import React, { useState, useEffect } from 'react';
import { Plus, Layers, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Levels...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Curriculum Levels</h3>
                    <p className="text-sm text-gray-500">Define stages like "Lower Primary", "Senior School"</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill shadow-sm"
                >
                    <Plus size={18} /> Add Level
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levels.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No curriculum levels configured.
                    </div>
                ) : (
                    levels.map((lvl) => (
                        <div key={lvl.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Layers size={20} />
                                </div>
                                <button onClick={() => handleDelete(lvl.id)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h4 className="font-bold text-gray-900">{lvl.name}</h4>
                            <p className="text-xs text-gray-500">{lvl.curriculum_name}</p>
                            <div className="mt-2 inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                                Order: {lvl.order}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Curriculum Level</h3>
                                <p className="text-[0.8rem] text-gray-400 mt-0.5">Define a level within a curriculum</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <span className="text-gray-400 text-lg">&times;</span>
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSave} className="px-7 py-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Level Name</label>
                                <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all" placeholder="e.g. Lower Primary" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Curriculum</label>
                                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all" value={formData.curriculum} onChange={e => setFormData({ ...formData, curriculum: e.target.value })} required>
                                    <option value="">Select Curriculum</option>
                                    {curricula.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Order</label>
                                <input type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all" value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })} required />
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">Cancel</button>
                            <button type="button" onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all">Save Level</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumLevelSetup;

