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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Classes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 md:px-0">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Grades & Streams</h3>
                    <p className="text-sm text-gray-500">Define grade levels and their associated sections/streams</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2 rounded-pill shadow-sm"
                >
                    <Plus size={18} /> Add Grade
                </button>
            </div>

            <div className="space-y-3">
                {classes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No grades configured.
                    </div>
                ) : (
                    classes.map((cls) => (
                        <div key={cls.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                            <div className="flex items-center">
                                <button
                                    onClick={() => toggleAccordion(cls.id)}
                                    className="flex-1 px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <List size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{cls.name}</h4>
                                            <p className="text-xs text-gray-500">{cls.curriculum_name} • Order: {cls.level_order}</p>
                                        </div>
                                    </div>
                                    {expandedClassId === cls.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                </button>
                                <button
                                    onClick={() => handleDeleteClass(cls.id)}
                                    className="btn btn-link text-danger p-3"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {expandedClassId === cls.id && (
                                <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/30">
                                    <div className="mb-4">
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Streams / Sections</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {cls.streams && cls.streams.map((stream) => (
                                                <span key={stream.id} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm group">
                                                    <Tag size={14} className="text-indigo-400" />
                                                    {stream.name}
                                                    <button
                                                        onClick={() => handleDeleteStream(stream.id)}
                                                        className="btn btn-sm btn-light text-danger ms-1 p-0 border-0"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                                <input
                                                    type="text"
                                                    placeholder="Add stream (e.g. West)"
                                                    className="w-full sm:w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                                    value={newStreamName}
                                                    onChange={(e) => setNewStreamName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleAddStream(cls.id)}
                                                />
                                                <button
                                                    onClick={() => handleAddStream(cls.id)}
                                                    className="btn btn-dark btn-sm px-4 rounded-pill"
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
                    size="sm"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleAddClass}>Save Grade</Modal.SubmitButton>
                        </>
                    }
                >
                    <form onSubmit={handleAddClass} className="space-y-5">
                        <div>
                            <label className={labelClass}>Grade Name</label>
                            <input className={inputClass} placeholder="e.g. Grade 1" value={newClass.name} onChange={e => setNewClass({ ...newClass, name: e.target.value })} required />
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
                            <input type="number" className={inputClass} value={newClass.level_order} onChange={e => setNewClass({ ...newClass, level_order: e.target.value })} required />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ClassStreamSetup;

