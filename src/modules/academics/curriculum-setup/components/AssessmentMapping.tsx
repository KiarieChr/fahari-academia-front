import React from 'react';
import { PenTool, Target, Plus, Trash2 } from 'lucide-react';

const AssessmentMapping = ({ isReadOnly }) => {
    // Mock static for now as this can get complex
    const terms = [
        { id: 1, name: 'Term 1', weight: 33 },
        { id: 2, name: 'Term 2', weight: 33 },
        { id: 3, name: 'Term 3', weight: 34 },
    ];

    const assessments = [
        { id: 1, name: 'Opener Exam', maxMarks: 30, weight: 15 },
        { id: 2, name: 'Mid-Term Exam', maxMarks: 40, weight: 25 },
        { id: 3, name: 'End-Term Exam', maxMarks: 60, weight: 60 },
    ];

    const [showAddType, setShowAddType] = React.useState(false);
    const [newType, setNewType] = React.useState({ name: '', maxMarks: 100, weight: 0 });
    const [assessmentsState, setAssessmentsState] = React.useState(assessments);

    const handleAddType = () => {
        if (!newType.name) return;
        setAssessmentsState([...assessmentsState, {
            id: `assess-${Date.now()}`,
            name: newType.name,
            maxMarks: Number(newType.maxMarks),
            weight: Number(newType.weight)
        }]);
        setShowAddType(false);
        setNewType({ name: '', maxMarks: 100, weight: 0 });
    };

    const handleDeleteType = (id) => {
        setAssessmentsState(assessmentsState.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target size={20} className="text-pink-600" />
                    Assessment Configuration
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Terms Config */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex justify-between">
                        Term Weights
                        <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">Total: 100%</span>
                    </h4>
                    <div className="space-y-4">
                        {terms.map(term => (
                            <div key={term.id} className="flex items-center gap-4">
                                <div className="w-32 font-medium text-slate-700 dark:text-slate-300">{term.name}</div>
                                <div className="flex-1">
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${term.weight}%` }}></div>
                                    </div>
                                </div>
                                <div className="w-16">
                                    <input
                                        type="number"
                                        className="w-full px-2 py-1 border border-slate-200 rounded text-center text-sm font-bold"
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
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex justify-between">
                        Standard Assessments
                        {!isReadOnly && !showAddType && (
                            <button
                                onClick={() => setShowAddType(true)}
                                className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                            >
                                <Plus size={12} /> Add Type
                            </button>
                        )}
                    </h4>

                    {showAddType && (
                        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                            <h5 className="text-xs font-bold text-slate-500 mb-2">New Assessment Type</h5>
                            <div className="space-y-2">
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-12">
                                        <input
                                            type="text"
                                            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Assessment Name (e.g. CAT 1)"
                                            value={newType.name}
                                            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Max Marks</label>
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newType.maxMarks}
                                            onChange={(e) => setNewType({ ...newType, maxMarks: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-span-6">
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Weight %</label>
                                        <input
                                            type="number"
                                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newType.weight}
                                            onChange={(e) => setNewType({ ...newType, weight: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        onClick={() => setShowAddType(false)}
                                        className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-200 rounded"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddType}
                                        disabled={!newType.name}
                                        className="text-xs px-3 py-1 bg-blue-600 text-black rounded font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase mb-2">
                            <div className="col-span-5">Name</div>
                            <div className="col-span-3 text-center">Max Marks</div>
                            <div className="col-span-3 text-center">Weight %</div>
                            <div className="col-span-1"></div>
                        </div>
                        {assessmentsState.map(assess => (
                            <div key={assess.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm font-medium"
                                        value={assess.name}
                                        disabled={isReadOnly}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-center"
                                        value={assess.maxMarks}
                                        disabled={isReadOnly}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm text-center font-bold text-blue-600"
                                        value={assess.weight}
                                        disabled={isReadOnly}
                                        readOnly
                                    />
                                </div>
                                <div className="col-span-1 text-center">
                                    {!isReadOnly && <button onClick={() => handleDeleteType(assess.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}
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
