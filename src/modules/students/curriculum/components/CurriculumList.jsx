import React, { useState } from 'react';
import { Plus, Search, MoreVertical, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import EditCurriculumModal from './modals/EditCurriculumModal';

const CurriculumList = () => {
    const [curricula, setCurricula] = useState([
        { id: 1, name: 'Competency Based Curriculum (CBC)', level: 'Primary', classes: 'Grade 1 - 6', subjects: 12, status: 'Active' },
        { id: 2, name: '8-4-4 System', level: 'Secondary', classes: 'Form 1 - 4', subjects: 10, status: 'Active' },
        { id: 3, name: 'Junior Secondary School (JSS)', level: 'Secondary', classes: 'Grade 7 - 9', subjects: 14, status: 'Active' },
        { id: 4, name: 'IGCSE (Cambridge)', level: 'International', classes: 'Year 1 - 6', subjects: 8, status: 'Inactive' },
    ]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCurriculum, setEditingCurriculum] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this curriculum?')) {
            setCurricula(curricula.filter(c => c.id !== id));
            toast.success('Curriculum deleted');
        }
    };

    const toggleStatus = (id) => {
        setCurricula(curricula.map(c =>
            c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
        ));
        toast.success('Status updated');
    };

    const handleEdit = (curriculum) => {
        setEditingCurriculum(curriculum);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedCurriculum) => {
        setCurricula(curricula.map(c =>
            c.id === updatedCurriculum.id ? updatedCurriculum : c
        ));
        setIsEditModalOpen(false);
        setEditingCurriculum(null);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search curricula..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex gap-2">
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Curriculum Name</th>
                            <th className="px-6 py-4">Level</th>
                            <th className="px-6 py-4">Classes Covered</th>
                            <th className="px-6 py-4 text-center">Subjects</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {curricula.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 border border-gray-200">
                                        {item.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{item.classes}</td>
                                <td className="px-6 py-4 text-center font-bold text-gray-800">{item.subjects}</td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => toggleStatus(item.id)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.status === 'Active'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}
                                    >
                                        {item.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {item.status}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="p-1.5 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Mock) */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Showing {curricula.length} entries</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                    <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
                </div>
            </div>

            <EditCurriculumModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                curriculum={editingCurriculum}
                onSave={handleSaveEdit}
            />
        </div>
    );
};

export default CurriculumList;

