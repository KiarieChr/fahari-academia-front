import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, Download, Grid, Table as TableIcon, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import AllocationStats from './components/AllocationStats';
import AllocationTable from './components/AllocationTable';
import TeacherLoadPanel from './components/TeacherLoadPanel';
import AllocationFormModal from './components/AllocationFormModal';

// Data
import { initialAllocations, teachersData, classesData, availableSubjects } from './data/subjectAllocationData';

const SubjectAllocationDashboard = () => {
    const [allocations, setAllocations] = useState(initialAllocations);
    const [teachers, setTeachers] = useState(teachersData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlloc, setEditingAlloc] = useState(null);

    const handleAddAllocation = () => {
        setEditingAlloc(null);
        setIsModalOpen(true);
    };

    const handleEditAllocation = (alloc) => {
        setEditingAlloc(alloc);
        setIsModalOpen(true);
    };

    const handleDeleteAllocation = (id) => {
        if (confirm('Are you sure you want to remove this allocation?')) {
            setAllocations(allocations.filter(a => a.id !== id));
            toast.success('Allocation removed');
            // In a real app, update teacher load here
        }
    };

    const handleSaveAllocation = (data) => {
        if (editingAlloc) {
            setAllocations(allocations.map(a => a.id === editingAlloc.id ? { ...data, id: a.id } : a));
            toast.success('Allocation updated successfully');
        } else {
            setAllocations([...allocations, { ...data, id: Date.now().toString() }]);
            toast.success('Subject allocated successfully');
        }

        // Mock update teacher load
        if (data.teacherId) {
            setTeachers(teachers.map(t => {
                if (t.id === data.teacherId) {
                    // Simple mock increment - in real app, recalculate total from allocations
                    return { ...t, currentLoad: editingAlloc ? t.currentLoad : t.currentLoad + Number(data.lessons) };
                }
                return t;
            }));
        }

        setIsModalOpen(false);
    };

    return (
        <DashboardLayout title="Subject Allocation">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 relative">

                {/* Header */}
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 px-6 py-4 shadow-sm">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Grid className="text-blue-600" />
                                Subject & Teacher Allocation
                            </h1>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                <span>Academic Year: <strong>2026</strong></span>
                                <span>•</span>
                                <span>Term: <strong>Term 1</strong></span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <Download size={16} /> Export
                            </button>
                            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <CheckSquare size={16} /> Auto Allocate
                            </button>
                            <button
                                onClick={handleAddAllocation}
                                className="px-4 py-2 bg-blue-600 text-black rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Plus size={18} /> Allocate Subject
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            {/* Stats */}
                            <AllocationStats allocations={allocations} teachers={teachers} />

                            {/* Table */}
                            <AllocationTable
                                allocations={allocations}
                                teachers={teachers}
                                onEdit={handleEditAllocation}
                                onDelete={handleDeleteAllocation}
                            />
                        </div>

                        {/* Sidebar: Teacher Load */}
                        <div className="w-full lg:w-80 shrink-0">
                            <TeacherLoadPanel teachers={teachers} />
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <AllocationFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAllocation}
                    initialData={editingAlloc}
                    teachers={teachers}
                    classes={classesData}
                    subjects={availableSubjects}
                />
            </div>
        </DashboardLayout>
    );
};

export default SubjectAllocationDashboard;

