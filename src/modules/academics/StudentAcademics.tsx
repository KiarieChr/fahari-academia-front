import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { PenLine, BookOpen, Grid, Users, Award, FileText, ClipboardList, Settings } from 'lucide-react';

const modules = [
    { title: 'Marks Input', desc: 'Enter and manage student marks and scores', icon: PenLine, path: '/dashboard/academics/marks', color: 'bg-blue-500' },
    { title: 'Curriculum Setup', desc: 'Define education structure, levels, and subjects', icon: BookOpen, path: '/dashboard/academics/curriculum', color: 'bg-emerald-500' },
    { title: 'Subjects', desc: 'Manage subjects, codes, and categories', icon: Grid, path: '/dashboard/academics/subjects', color: 'bg-violet-500' },
    { title: 'Subject Allocation', desc: 'Assign subjects to teachers and classes', icon: Users, path: '/dashboard/academics/allocation', color: 'bg-amber-500' },
    { title: 'Grading Scheme', desc: 'Configure grading scales and grade boundaries', icon: Award, path: '/dashboard/academics/grading', color: 'bg-rose-500' },
    { title: 'Reports', desc: 'Generate academic reports and transcripts', icon: FileText, path: '/dashboard/academics/reports', color: 'bg-cyan-500' },
    { title: 'Assignments', desc: 'Create, publish, and grade assignments', icon: ClipboardList, path: '/dashboard/academics/assignments', color: 'bg-indigo-500' },
    { title: 'Settings', desc: 'Academic module configuration', icon: Settings, path: '/dashboard/academics/settings', color: 'bg-slate-500' },
];

const StudentAcademics = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout title="Student Academics">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 p-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Academics</h1>
                        <p className="text-slate-500 mt-1">Manage curriculum, subjects, grading, and academic reports.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {modules.map(mod => {
                            const Icon = mod.icon;
                            return (
                                <button
                                    key={mod.title}
                                    onClick={() => navigate(mod.path)}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-left hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                                >
                                    <div className={`w-10 h-10 ${mod.color} rounded-lg flex items-center justify-center mb-3`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{mod.title}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{mod.desc}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentAcademics;
