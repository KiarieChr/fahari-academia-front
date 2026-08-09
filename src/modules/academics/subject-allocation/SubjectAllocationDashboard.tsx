import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, Download, Grid, CheckSquare, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import AllocationStats from './components/AllocationStats';
import AllocationTable from './components/AllocationTable';
import TeacherLoadPanel from './components/TeacherLoadPanel';
import AllocationFormModal from './components/AllocationFormModal';

// API
import { api } from '../../../services/apiClient';

const SubjectAllocationDashboard = () => {
    const [allocations, setAllocations] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classSessions, setClassSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlloc, setEditingAlloc] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [allocData, subData, csData, teacherData] = await Promise.all([
                api.timetable.getAllocations(),
                api.timetable.getSubjects(),
                api.academics.getActiveSessions(),
                api.timetable.getTeachers(),
            ]);
            const allocs = (allocData.results || allocData) || [];
            const subs = (subData.results || subData) || [];
            const sessions = (csData.results || csData) || [];
            const teacherList = (teacherData.results || teacherData) || [];

            setAllocations(allocs);
            setSubjects(subs);
            setClassSessions(sessions);

            // Build teacher load data from allocations
            const teacherMap = {};
            teacherList.forEach(t => {
                teacherMap[t.id] = {
                    id: t.id,
                    name: `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.username,
                    subjects: [],
                    maxLoad: 30,
                    currentLoad: 0,
                };
            });
            allocs.forEach(a => {
                if (a.teacher && teacherMap[a.teacher]) {
                    teacherMap[a.teacher].currentLoad += a.lessons_per_week || 0;
                    if (a.subject_name && !teacherMap[a.teacher].subjects.includes(a.subject_name)) {
                        teacherMap[a.teacher].subjects.push(a.subject_name);
                    }
                }
            });
            setTeachers(Object.values(teacherMap));
        } catch {
            toast.error('Failed to load allocations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddAllocation = () => {
        setEditingAlloc(null);
        setIsModalOpen(true);
    };

    const handleEditAllocation = (alloc) => {
        setEditingAlloc(alloc);
        setIsModalOpen(true);
    };

    const handleDeleteAllocation = async (id) => {
        if (!confirm('Are you sure you want to remove this allocation?')) return;
        try {
            await api.timetable.deleteAllocation(id);
            toast.success('Allocation removed');
            loadData();
        } catch {
            toast.error('Failed to delete allocation');
        }
    };

    const handleSaveAllocation = async (data) => {
        try {
            if (editingAlloc) {
                await api.timetable.updateAllocation(editingAlloc.id, data);
                toast.success('Allocation updated successfully');
            } else {
                await api.timetable.createAllocation(data);
                toast.success('Subject allocated successfully');
            }
            setIsModalOpen(false);
            loadData();
        } catch (err) {
            const detail = err?.data?.detail || err?.data?.non_field_errors?.[0] || 'Failed to save allocation';
            toast.error(detail);
        }
    };

    // Map allocations for table component
    const mappedAllocations = allocations.map(a => ({
        ...a,
        class: a.class_session_name || '',
        subject: a.subject_name || '',
        teacherId: a.teacher ? String(a.teacher) : null,
        lessons: a.lessons_per_week || 0,
        category: a.subject_code || '',
        status: a.is_active ? 'Active' : 'Inactive',
    }));

    return (
        <DashboardLayout title="Subject Allocation">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 relative">

                {/* Header */}
                <div className="bg-transparent px-6 py-4">
                    <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Grid className="text-blue-600" />
                                Subject & Teacher Allocation
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Assign subjects to teachers and class sessions</p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={loadData}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                                <RefreshCw size={16} /> Refresh
                            </button>
                            <button
                                onClick={handleAddAllocation}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 transition-transform active:scale-95"
                            >
                                <Plus size={18} /> Allocate Subject
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="animate-spin text-blue-600" size={28} />
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Main Content */}
                            <div className="flex-1 space-y-6">
                                <AllocationStats allocations={mappedAllocations} teachers={teachers} />
                                <AllocationTable
                                    allocations={mappedAllocations}
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
                    )}
                </div>

                {/* Modal */}
                <AllocationFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAllocation}
                    initialData={editingAlloc}
                    teachers={teachers}
                    classes={classSessions}
                    subjects={subjects}
                />
            </div>
        </DashboardLayout>
    );
};

export default SubjectAllocationDashboard;

