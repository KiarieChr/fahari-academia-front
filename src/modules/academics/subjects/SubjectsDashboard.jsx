import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, Download, Upload, Library } from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import SubjectsStats from './components/SubjectsStats';
import SubjectsTable from './components/SubjectsTable';
import SubjectFormModal from './components/SubjectFormModal';

// Data
import { subjectsData } from './data/subjectsData';

const SubjectsDashboard = () => {
    const [subjects, setSubjects] = useState(subjectsData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const handleAddSubject = () => {
        setEditingSubject(null);
        setIsModalOpen(true);
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setIsModalOpen(true);
    };

    const handleDeleteSubject = (id) => {
        if (confirm('Are you sure you want to remove this subject?')) {
            setSubjects(subjects.filter(s => s.id !== id));
            toast.success('Subject removed');
        }
    };

    const handleSaveSubject = (data) => {
        if (editingSubject) {
            setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...data, id: s.id } : s));
            toast.success('Subject updated successfully');
        } else {
            setSubjects([...subjects, { ...data, id: Date.now().toString(), classes: [], lessons: 0, teachers: [] }]);
            toast.success('New subject created');
        }
        setIsModalOpen(false);
    };

    return (
        <DashboardLayout title="Subject Management">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 relative">

                {/* Header */}
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 px-6 py-5 shadow-sm">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Library className="text-blue-600" />
                                Subjects Dashboard
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Manage academic subjects, codes, and configurations across curriculums.</p>
                        </div>

                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <Upload size={16} /> Import
                            </button>
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <Download size={16} /> Export
                            </button>
                            <button
                                onClick={handleAddSubject}
                                className="px-4 py-2 bg-blue-600 text-black rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Plus size={18} /> Add New Subject
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto p-6 space-y-6">
                    {/* Stats */}
                    <SubjectsStats subjects={subjects} />

                    {/* Main Table */}
                    <SubjectsTable
                        subjects={subjects}
                        onEdit={handleEditSubject}
                        onDelete={handleDeleteSubject}
                    />
                </div>

                {/* Modal */}
                <SubjectFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSubject}
                    initialData={editingSubject}
                />
            </div>
        </DashboardLayout>
    );
};

export default SubjectsDashboard;

