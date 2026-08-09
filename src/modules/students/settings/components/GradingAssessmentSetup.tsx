import React, { useState } from 'react';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../components/common/Modal';
import { inputClass, labelClass } from '../../../../components/ui/FormField';

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
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Define New Grade"
                    subtitle="Set up a grading scale entry"
                    footer={
                        <>
                            <Modal.CancelButton onClick={() => setIsModalOpen(false)} />
                            <Modal.SubmitButton onClick={handleSave}>Save</Modal.SubmitButton>
                        </>
                    }
                >
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Grade</label>
                                <input className={inputClass} placeholder="A, B..." value={newGrade.grade} onChange={e => setNewGrade({ ...newGrade, grade: e.target.value })} required />
                            </div>
                            <div>
                                <label className={labelClass}>Color</label>
                                <div className="w-full h-[42px] rounded-xl border border-gray-200 flex items-center px-1.5">
                                    <input type="color" className="w-full h-8 cursor-pointer rounded-lg bg-transparent" value={newGrade.color} onChange={e => setNewGrade({ ...newGrade, color: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>Min Score</label>
                                <input type="number" className={inputClass} value={newGrade.min} onChange={e => setNewGrade({ ...newGrade, min: Number(e.target.value) })} required />
                            </div>
                            <div>
                                <label className={labelClass}>Max Score</label>
                                <input type="number" className={inputClass} value={newGrade.max} onChange={e => setNewGrade({ ...newGrade, max: Number(e.target.value) })} required />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Remarks</label>
                            <input className={inputClass} placeholder="e.g. Excellent" value={newGrade.remark} onChange={e => setNewGrade({ ...newGrade, remark: e.target.value })} required />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default GradingAssessmentSetup;

