import React, { useState } from 'react';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const GradingAssessmentSetup = () => {
    const [grades, setGrades] = useState([
        { id: 1, grade: 'A', min: 80, max: 100, remark: 'Excellent', color: '#16a34a' },
        { id: 2, grade: 'B', min: 70, max: 79, remark: 'Good', color: '#2563eb' },
        { id: 3, grade: 'C', min: 60, max: 69, remark: 'Average', color: '#ca8a04' },
        { id: 4, grade: 'D', min: 50, max: 59, remark: 'Poor', color: '#dc2626' },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGrade, setNewGrade] = useState({ grade: '', min: 0, max: 100, remark: '', color: '#000000' });

    const handleSave = (e) => {
        e.preventDefault();
        setGrades([...grades, { id: Date.now(), ...newGrade }].sort((a, b) => b.min - a.min));
        toast.success('Grade added');
        setIsModalOpen(false);
        setNewGrade({ grade: '', min: 0, max: 100, remark: '', color: '#000000' });
    };

    const handleDelete = (id) => {
        if (confirm('Remove this grade?')) {
            setGrades(grades.filter(g => g.id !== id));
            toast.success('Grade removed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Grading System</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> Add Grade
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade Label</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score Range</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Indicator</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {grades.map((g) => (
                            <tr key={g.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-3 py-1 rounded-lg bg-gray-100 font-bold text-gray-800">{g.grade}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                    {g.min}% - {g.max}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{g.remark}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: g.color }}></div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button onClick={() => handleDelete(g.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Define New Grade</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                                    <input className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="A, B..." value={newGrade.grade} onChange={e => setNewGrade({ ...newGrade, grade: e.target.value })} required />
                                </div>
                                <div className="flex items-end">
                                    <div className="w-full h-10 rounded-lg border flex items-center px-1">
                                        <input type="color" className="w-full h-8 cursor-pointer rounded bg-transparent" value={newGrade.color} onChange={e => setNewGrade({ ...newGrade, color: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                                    <input type="number" className="w-full px-4 py-2 border rounded-lg outline-none" value={newGrade.min} onChange={e => setNewGrade({ ...newGrade, min: Number(e.target.value) })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                                    <input type="number" className="w-full px-4 py-2 border rounded-lg outline-none" value={newGrade.max} onChange={e => setNewGrade({ ...newGrade, max: Number(e.target.value) })} required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <input className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="e.g. Excellent" value={newGrade.remark} onChange={e => setNewGrade({ ...newGrade, remark: e.target.value })} required />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradingAssessmentSetup;

