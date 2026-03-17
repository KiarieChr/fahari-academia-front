import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import EditCurriculumModal from './modals/EditCurriculumModal';
import { curriculumService } from '../../../../services/curriculumService';

const CurriculumList = ({ refreshKey = 0 }) => {
    const [curricula, setCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCurriculum, setEditingCurriculum] = useState(null);

    useEffect(() => {
        fetchCurricula();
    }, [refreshKey]);

    const fetchCurricula = async () => {
        try {
            setLoading(true);
            const data = await curriculumService.getCurricula();
            // Handle both paginated and non-paginated responses
            setCurricula(data.results || data);
        } catch (error) {
            console.error('Failed to fetch curricula:', error);
            toast.error('Failed to load curricula');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this curriculum?')) {
            try {
                await curriculumService.deleteCurriculum(id);
                setCurricula(curricula.filter(c => c.id !== id));
                toast.success('Curriculum deleted');
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete curriculum');
            }
        }
    };

    const toggleStatus = async (curriculum) => {
        const newStatus = curriculum.status === 'active' ? 'inactive' : 'active';
        try {
            await curriculumService.updateCurriculum(curriculum.id, { ...curriculum, status: newStatus });
            setCurricula(curricula.map(c =>
                c.id === curriculum.id ? { ...c, status: newStatus } : c
            ));
            toast.success('Status updated');
        } catch (error) {
            console.error('Status toggle failed:', error);
            toast.error('Failed to update status');
        }
    };

    const handleEdit = (curriculum) => {
        setEditingCurriculum(curriculum);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedCurriculum) => {
        try {
            const response = await curriculumService.updateCurriculum(updatedCurriculum.id, updatedCurriculum);
            setCurricula(curricula.map(c =>
                c.id === updatedCurriculum.id ? response : c
            ));
            setIsEditModalOpen(false);
            setEditingCurriculum(null);
            toast.success('Curriculum updated');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update curriculum');
        }
    };

    // Filter curricula based on search
    const filteredCurricula = curricula.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Map education_level to display name
    const getLevelDisplay = (level) => {
        const levels = {
            'primary': 'Primary',
            'junior_secondary': 'Junior Secondary',
            'senior_secondary': 'Senior Secondary',
            'international': 'International'
        };
        return levels[level] || level;
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Curriculum Name</th>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Level</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-12">
                                    <Loader2 className="animate-spin mx-auto text-gray-400" size={24} />
                                    <p className="text-gray-500 mt-2">Loading curricula...</p>
                                </td>
                            </tr>
                        ) : filteredCurricula.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-gray-500">
                                    {searchTerm ? 'No curricula match your search' : 'No curricula configured yet'}
                                </td>
                            </tr>
                        ) : (
                            filteredCurricula.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-indigo-50 rounded text-xs font-mono text-indigo-600 border border-indigo-100">
                                            {item.code || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600 border border-gray-200">
                                            {getLevelDisplay(item.education_level)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleStatus(item)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.status === 'active'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}
                                        >
                                            {item.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            {item.status === 'active' ? 'Active' : 'Inactive'}
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
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Showing {filteredCurricula.length} of {curricula.length} entries</span>
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

