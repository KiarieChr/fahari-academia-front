import React, { useState, useEffect } from 'react';
import { PenTool, Target, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { examService } from '../../../../services/examService';

const AssessmentMapping = ({ isReadOnly, curriculum }) => {
    // Mock static for now as this can get complex
    const terms = [
        { id: 1, name: 'Term 1', weight: 33 },
        { id: 2, name: 'Term 2', weight: 33 },
        { id: 3, name: 'Term 3', weight: 34 },
    ];

    const [showAddType, setShowAddType] = useState(false);
    const [newType, setNewType] = useState({ name: '', max_mark: 100, weight: 0 });
    const [assessmentsState, setAssessmentsState] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchAssessments = async () => {
        if (!curriculum?.id) return;
        setLoading(true);
        try {
            const data = await examService.getAssessmentTypes({ curriculum: curriculum.id });
            setAssessmentsState(data.results || data);
        } catch (err) {
            toast.error('Failed to load assessment types');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, [curriculum]);

    const handleAddType = async () => {
        if (!newType.name || !curriculum?.id) return;
        setSaving(true);
        try {
            await examService.createAssessmentType({
                name: newType.name,
                code: newType.name.toLowerCase().replace(/\s+/g, '_').substring(0, 30),
                max_mark: Number(newType.max_mark),
                weight: Number(newType.weight),
                curriculum: curriculum.id
            });
            toast.success('Assessment type added');
            setShowAddType(false);
            setNewType({ name: '', max_mark: 100, weight: 0 });
            fetchAssessments();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to add assessment type');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteType = async (id) => {
        try {
            await examService.deleteAssessmentType(id);
            toast.success('Assessment type deleted');
            fetchAssessments();
        } catch (err) {
            toast.error('Failed to delete assessment type');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <Target size={20} className="text-indigo-500" />
                    Assessment Configuration
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Terms Config */}
                <div className="neo-card p-6 border-none">
                    <h4 className="font-bold text-gray-700 mb-6 flex justify-between">
                        Term Weights
                        <span className="text-xs font-bold text-gray-500 neo-pressed px-3 py-1 uppercase tracking-widest">Total: 100%</span>
                    </h4>
                    <div className="space-y-6">
                        {terms.map(term => (
                            <div key={term.id} className="flex items-center gap-4">
                                <div className="w-24 font-bold text-gray-600">{term.name}</div>
                                <div className="flex-1">
                                    <div className="h-3 neo-pressed rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 shadow-sm" style={{ width: `${term.weight}%` }}></div>
                                    </div>
                                </div>
                                <div className="w-20">
                                    <input
                                        type="number"
                                        className="w-full neo-input text-center text-sm font-black text-gray-700"
                                        value={term.weight}
                                        disabled={isReadOnly}
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Assessment Types */}
                <div className="neo-card p-6 border-none">
                    <h4 className="font-bold text-gray-700 mb-6 flex justify-between items-center">
                        Standard Assessments
                        {!isReadOnly && !showAddType && (
                            <button
                                onClick={() => setShowAddType(true)}
                                className="neo-btn text-xs text-indigo-600 font-bold px-3 py-1 flex items-center gap-1 uppercase tracking-widest"
                            >
                                <Plus size={12} /> Add Type
                            </button>
                        )}
                    </h4>

                    {showAddType && (
                        <div className="mb-6 p-4 neo-pressed border-none">
                            <h5 className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-3">New Assessment Type</h5>
                            <div className="space-y-3">
                                <div className="grid grid-cols-12 gap-3">
                                    <div className="col-span-12">
                                        <input
                                            type="text"
                                            className="w-full neo-input text-sm font-bold"
                                            placeholder="Assessment Name (e.g. CAT 1)"
                                            value={newType.name}
                                            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Max Marks</label>
                                        <input
                                            type="number"
                                            className="w-full neo-input text-sm font-bold text-center mt-1"
                                            value={newType.max_mark}
                                            onChange={(e) => setNewType({ ...newType, max_mark: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Weight %</label>
                                        <input
                                            type="number"
                                            className="w-full neo-input text-sm font-bold text-center mt-1"
                                            value={newType.weight}
                                            onChange={(e) => setNewType({ ...newType, weight: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => setShowAddType(false)}
                                        className="neo-btn text-xs px-4 py-2 font-bold text-gray-500 uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddType}
                                        disabled={!newType.name || saving}
                                        className="neo-btn neo-btn-accent text-xs px-4 py-2 font-bold uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4 mt-2">
                        <div className="grid grid-cols-12 gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">
                            <div className="col-span-5">Name</div>
                            <div className="col-span-3 text-center">Max Marks</div>
                            <div className="col-span-3 text-center">Weight %</div>
                            <div className="col-span-1"></div>
                        </div>
                        {assessmentsState.map(assess => (
                            <div key={assess.id} className="grid grid-cols-12 gap-3 items-center">
                                <div className="col-span-5">
                                    <input
                                        type="text"
                                        className="w-full neo-input text-sm font-bold"
                                        value={assess.name}
                                        disabled={isReadOnly}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        className="w-full neo-input text-sm text-center font-bold"
                                        value={assess.max_mark}
                                        disabled={isReadOnly}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        className="w-full neo-input text-sm text-center font-black text-indigo-600"
                                        value={assess.weight}
                                        disabled={isReadOnly}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-1 text-center">
                                    {!isReadOnly && <button onClick={() => handleDeleteType(assess.id)} className="neo-btn p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentMapping;
