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
            const [allocData, subData, csData, teacherData, hrData] = await Promise.all([
                api.timetable.getAllocations(),
                api.timetable.getSubjects(),
                api.academics.getActiveSessions(),
                api.timetable.getTeachers(),
                api.get('/workforce/api/employees/', { params: { page_size: 500 } }),
            ]);
            const allocs = (allocData.results || allocData) || [];
            const subs = (subData.results || subData) || [];
            const sessions = (csData.results || csData) || [];
            
            // Filter out teachers who are NOT linked to an HR employee record
            const employees = (hrData.results || hrData) || [];
            const allUsers = (teacherData.results || teacherData) || [];
            
            // Link HR record to user account: only include teachers who have a valid HR employee record
            const linkedTeacherIds = new Set(employees.map(emp => emp.user).filter(Boolean));
            const teacherList = allUsers.filter(t => linkedTeacherIds.has(t.id));

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
            <div className="min-h-screen neo-bg pb-20 relative">
                <div className="p-3 space-y-6 max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 neo-card border-none p-3 mt-3 mb-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Grid size={24} />
                                </span>
                                Subject Allocation
                            </h1>
                            <p className="text-slate-500 font-bold text-sm">Allocate subjects to teachers and manage workload.</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={loadData}
                                className="px-4 py-2 neo-btn rounded-xl text-sm font-bold flex items-center gap-2"
                            >
                                <RefreshCw size={16} /> <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={() => {}}
                                className="px-4 py-2 neo-btn rounded-xl text-sm font-bold flex items-center gap-2"
                            >
                                <Download size={16} /> <span className="hidden sm:inline">Export</span>
                            </button>
                            <button
                                onClick={handleAddAllocation}
                                className="px-5 py-2 neo-btn-accent rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"
                            >
                                <Plus size={16} /> Allocate Subject
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 neo-card border-none">
                            <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                            <p className="text-slate-500 font-bold text-sm">Loading allocations...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-6 ">
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

