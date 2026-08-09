import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, Download, Upload, Library, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import SubjectsStats from './components/SubjectsStats';
import SubjectsTable from './components/SubjectsTable';
import SubjectFormModal from './components/SubjectFormModal';
import GradeSubjectsMapping from './components/GradeSubjectsMapping';

// API
import { api } from '../../../services/apiClient';
import { curriculumService } from '../../../services/curriculumService';

const SubjectsDashboard = () => {
    const [activeTab, setActiveTab] = useState('all-subjects');
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [curricula, setCurricula] = useState([]);
    const [curriculumLevels, setCurriculumLevels] = useState([]);
    const [learningAreas, setLearningAreas] = useState([]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [subjectsData, curriculaData, levelsData, areasData] = await Promise.all([
                api.timetable.getSubjects(),
                curriculumService.getCurricula(),
                curriculumService.getCurriculumLevels(),
                curriculumService.getLearningAreas(),
            ]);
            setSubjects((subjectsData.results || subjectsData) || []);
            setCurricula((curriculaData.results || curriculaData) || []);
            setCurriculumLevels((levelsData.results || levelsData) || []);
            setLearningAreas((areasData.results || areasData) || []);
        } catch (err) {
            toast.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddSubject = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };

    const handleDeleteSubject = async (id) => {
        if (!confirm('Are you sure you want to remove this subject?')) return;
        try {
            await api.timetable.deleteSubject(id);
            toast.success('Subject removed');
            loadData();
        } catch {
            toast.error('Failed to delete subject');
        }
    };

    const handleSaveSubject = async (data) => {
        try {
            if (editingSubject) {
                await api.timetable.updateSubject(editingSubject.id, data);
                toast.success('Subject updated successfully');
            } else {
                await api.timetable.createSubject(data);
                toast.success('New subject created');
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            const detail = err?.data?.detail || err?.data?.name?.[0] || err?.data?.code?.[0] || 'Failed to save subject';
            toast.error(detail);
        }
    };

    // Map API data to the shape SubjectsStats/SubjectsTable expect
    const mappedSubjects = subjects.map(s => ({
        ...s,
        category: s.subject_type_display || s.subject_type || 'Core',
        type: s.subject_type || 'compulsory',
        curriculum: s.curriculum_name || '',
        classes: [],
        lessons: s.weekly_lessons || 0,
        teachers: [],
        status: s.is_active ? 'Active' : 'Inactive',
        description: '',
        isGraded: true,
    }));

    return (
        <DashboardLayout title="Subject Management">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 relative">

                {/* Header */}
                <div className="bg-transparent px-5 py-3">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Library className="text-blue-600" />
                                Subjects Dashboard
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Manage academic subjects, codes, and configurations across curriculums.</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={loadData}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <RefreshCw size={16} /> Refresh
                            </button>
                            <button
                                onClick={handleAddSubject}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Plus size={18} /> Add New Subject
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto p-4 space-y-6">
                    <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-max mb-3">
                        <button
                            onClick={() => setActiveTab('all-subjects')}
                            className={`px-2 py-2 rounded-lg mr-3 text-sm font-medium transition-all ${
                                activeTab === 'all-subjects'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                            }`}
                        >
                            All Subjects
                        </button>
                        <button
                            onClick={() => setActiveTab('grade-mappings')}
                            className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === 'grade-mappings'
                                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                            }`}
                        >
                            Grade Mappings
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-blue-600" size={28} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'all-subjects' ? (
                                <>
                                    {/* Stats */}
                                    <SubjectsStats subjects={mappedSubjects} />

                                    {/* Main Table */}
                                    <SubjectsTable
                                        subjects={mappedSubjects}
                                        onEdit={handleEditSubject}
                                        onDelete={handleDeleteSubject}
                                    />
                                </>
                            ) : (
                                <GradeSubjectsMapping />
                            )}
                        </>
                    )}
                </div>

                {/* Modal */}
                <SubjectFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSubject}
                    initialData={editingSubject}
                    curricula={curricula}
                    curriculumLevels={curriculumLevels}
                    learningAreas={learningAreas}
                />
            </div>
        </DashboardLayout>
    );
};

export default SubjectsDashboard;

