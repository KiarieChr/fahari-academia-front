import React, { useState, useEffect } from 'react';
import { Plus, List, ChevronDown, ChevronUp, Trash2, Tag, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

const ClassStreamSetup = () => {
    const [classes, setClasses] = useState([]);
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClass, setNewClass] = useState({ name: '', curriculum: '', level_order: 1 });
    const [newStreamName, setNewStreamName] = useState('');
    const [expandedClassId, setExpandedClassId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classesRes, curriculaRes] = await Promise.all([
                studentSettingsService.getClasses(),
                studentSettingsService.getCurricula()
            ]);
            setClasses(classesRes.data?.results || classesRes.results || classesRes || []);
            const curriculumData = curriculaRes.data?.results || curriculaRes.results || curriculaRes || [];
            setCurricula(curriculumData);
            if (curriculumData.length > 0) {
                setNewClass(prev => ({ ...prev, curriculum: curriculumData[0].id }));
            }
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleAccordion = (id) => {
        setExpandedClassId(expandedClassId === id ? null : id);
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        try {
            await studentSettingsService.createClass(newClass);
            toast.success('Class added successfully');
            setIsModalOpen(false);
            setNewClass({ name: '', curriculum: curricula[0]?.id || '', level_order: classes.length + 1 });
            fetchData();
        } catch (error) {
            toast.error('Failed to add class');
        }
    };

    const handleAddStream = async (classId) => {
        if (!newStreamName.trim()) return;
        try {
            await studentSettingsService.createStream({ grade: classId, name: newStreamName });
            setNewStreamName('');
            toast.success('Stream added');
            fetchData();
        } catch (error) {
            toast.error('Failed to add stream');
        }
    };

    const handleDeleteClass = async (id) => {
        if (confirm('Delete this class? This may fail if it has linked streams.')) {
            try {
                await studentSettingsService.deleteClass(id);
                toast.success('Class deleted');
                fetchData();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    const handleDeleteStream = async (id) => {
        if (confirm('Delete this stream?')) {
            try {
                await studentSettingsService.deleteStream(id);
                toast.success('Stream deleted');
                fetchData();
            } catch (error) {
                toast.error('Delete failed');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-500">Loading Grades & Streams System...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-1">
            {/* Header section with refined card title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-50 via-white to-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <List size={18} className="text-indigo-600" />
                        Grades & Streams
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                        Define class grade levels and allocate their associated classroom streams.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-xs shadow-md select-none"
                >
                    <Plus size={15} strokeWidth={3} />
                    <span>Add Grade</span>
                </button>
            </div>

            {/* Accordion List */}
            <div className="space-y-4">
                {classes.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <List className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700">No grade classes configured</h4>
                        <p className="text-xs text-slate-400 mt-1">Structure grade classes to begin registering streams.</p>
                    </div>
                ) : (
                    classes.map((cls) => (
                        <div key={cls.id} className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center">
                                <button
                                    onClick={() => toggleAccordion(cls.id)}
                                    className="flex-1 px-6 py-4 flex items-center justify-between hover:bg-slate-50/40 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <List size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight">{cls.name}</h4>
                                            <p className="text-xs font-semibold text-slate-400">{cls.curriculum_name} &bull; Sorting Order: {cls.level_order}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mr-2">
                                        <div className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200/50">
                                            {cls.streams?.length || 0} Streams
                                        </div>
                                        {expandedClassId === cls.id ? <ChevronUp size={16} className="text-indigo-500" /> : <ChevronDown size={16} className="text-slate-400" />}
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleDeleteClass(cls.id)}
                                    className="p-3 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg transition-all mr-3"
                                    title="Delete Grade"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {expandedClassId === cls.id && (
                                <div className="px-6 py-5 border-t border-slate-150 bg-slate-50/40">
                                    <div className="mb-2">
                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Allocated Streams & Sections</h5>
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {cls.streams && cls.streams.map((stream) => (
                                                <span key={stream.id} className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:border-red-200 transition-colors group">
                                                    <Tag size={12} className="text-indigo-400" />
                                                    <span>{stream.name}</span>
                                                    <button
                                                        onClick={() => handleDeleteStream(stream.id)}
                                                        className="text-slate-350 hover:text-red-600 p-0.5 hover:bg-red-50 rounded transition-all"
                                                        title="Delete Stream"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </span>
                                            ))}
                                            
                                            {/* Add stream form inline */}
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. West"
                                                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none shadow-inner bg-slate-50/50 hover:bg-white focus:bg-white transition-all w-36 font-semibold"
                                                    value={newStreamName}
                                                    onChange={(e) => setNewStreamName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddStream(cls.id)}
                                                />
                                                <button
                                                    onClick={() => handleAddStream(cls.id)}
                                                    className="px-4 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Add Grade Level"
                    subtitle="Define a new grade within a curriculum"
                    icon={List}
                    accentColor="bg-indigo-600"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleAddClass} label="Save Grade" />
                        </>
                    }
                >
                    <form onSubmit={handleAddClass} className="space-y-5">
                        <div>
                            <label className={labelClass}>Grade Name</label>
                            <input
                                className={inputClass}
                                placeholder="e.g. Grade 1"
                                value={newClass.name}
                                onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Curriculum</label>
                            <select
                                className={inputClass}
                                value={newClass.curriculum}
                                onChange={e => setNewClass({ ...newClass, curriculum: e.target.value })}
                                required
                            >
                                <option value="">Select Curriculum</option>
                                {curricula.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Level Order (Sorting)</label>
                            <input
                                type="number"
                                className={inputClass}
                                value={newClass.level_order}
                                onChange={e => setNewClass({ ...newClass, level_order: e.target.value })}
                                required
                            />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ClassStreamSetup;

