import React, { useState, useEffect } from 'react';
import { Search, Filter, Book, Hash, Calendar, GraduationCap, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import EditSubjectModal from './modals/EditSubjectModal';
import { curriculumService } from '../../../../services/curriculumService';

const SubjectManagement = ({ refreshKey = 0 }) => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, [refreshKey]);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const data = await curriculumService.getSubjects();
            setSubjects(data.results || data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
            toast.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedSubject) => {
        try {
            const response = await curriculumService.updateSubject(updatedSubject.id, updatedSubject);
            setSubjects(subjects.map(s =>
                s.id === updatedSubject.id ? response : s
            ));
            setIsEditModalOpen(false);
            setEditingSubject(null);
            toast.success('Subject updated');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update subject');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this subject?')) {
            try {
                await curriculumService.deleteSubject(id);
                setSubjects(subjects.filter(s => s.id !== id));
                toast.success('Subject deleted');
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete subject');
            }
        }
    };

    // Filter subjects
    const filteredSubjects = subjects.filter(sub => {
        const matchesSearch = sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || sub.subject_type === filterType;
        return matchesSearch && matchesType;
    });

    // Get area color based on learning area or curriculum
    const getAreaColor = (subject) => {
        const area = subject.learning_area_name?.toLowerCase() || '';
        if (area.includes('science')) return 'bg-blue-500';
        if (area.includes('language')) return 'bg-green-500';
        if (area.includes('technical') || area.includes('vocational')) return 'bg-orange-500';
        if (area.includes('humanit')) return 'bg-purple-500';
        if (area.includes('art')) return 'bg-pink-500';
        return 'bg-gray-500';
    };

    // Get type badge style
    const getTypeBadge = (type) => {
        switch (type) {
            case 'compulsory':
                return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'optional':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'elective':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Types</option>
                        <option value="compulsory">Compulsory</option>
                        <option value="optional">Optional</option>
                        <option value="elective">Elective</option>
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                    <span className="ml-3 text-gray-500">Loading subjects...</span>
                </div>
            ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    {searchTerm || filterType !== 'all'
                        ? 'No subjects match your filter criteria'
                        : 'No subjects configured yet. Add a subject to get started.'}
                </div>
            ) : (
                /* Grid Layout for Subjects */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSubjects.map((sub) => (
                        <div key={sub.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors group cursor-pointer relative overflow-hidden">

                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 -mr-6 -mt-6 ${getAreaColor(sub)}`}></div>

                            <div className="flex justify-between items-start mb-3 relative">
                                <div
                                    className="p-2.5 rounded-lg text-white transition-colors"
                                    style={{ backgroundColor: sub.color_hex || '#6366f1' }}
                                >
                                    <Book size={20} />
                                </div>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getTypeBadge(sub.subject_type)}`}>
                                    {sub.subject_type_display || sub.subject_type || 'Subject'}
                                </span>
                            </div>

                            <div className="mb-3 relative">
                                <h4 className="font-bold text-gray-900 text-lg leading-tight">{sub.name}</h4>
                                <p className="text-xs text-indigo-600 font-mono mt-1">{sub.code}</p>
                            </div>

                            <div className="space-y-2 text-sm text-gray-500 relative">
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={14} className="text-gray-400" />
                                    <span>{sub.learning_area_name || sub.curriculum_name || 'General'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Hash size={14} className="text-gray-400" />
                                    <span>{sub.curriculum_level_name || 'All Levels'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span>{sub.weekly_lessons || 5} Lessons / Week</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2 relative">
                                <button
                                    onClick={() => handleEdit(sub)}
                                    className="text-xs font-semibold text-gray-500 hover:text-indigo-600 px-2 py-1 hover:bg-gray-50 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(sub.id)}
                                    className="text-xs font-semibold text-gray-500 hover:text-red-600 px-2 py-1 hover:bg-gray-50 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Stats */}
            {!loading && (
                <div className="text-xs text-gray-500 text-center">
                    Showing {filteredSubjects.length} of {subjects.length} subjects
                </div>
            )}

            <EditSubjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                subject={editingSubject}
                onSave={handleSaveEdit}
            />
        </div>
    );
};

export default SubjectManagement;
