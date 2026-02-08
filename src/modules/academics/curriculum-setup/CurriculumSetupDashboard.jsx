import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Archive, Play, Layout, BookOpen, Layers, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import CurriculumProfile from './components/CurriculumProfile';
import EducationLevelsManager from './components/EducationLevelsManager';

import SubjectMatrixView from './components/SubjectMatrixView';
import AssessmentMapping from './components/AssessmentMapping';

// Data
import { initialLevels, initialSubjects, renderMatrix } from './data/curriculumData';

const TABS = [
    { id: 'levels', label: 'Levels & Classes', icon: Layers },

    { id: 'matrix', label: 'Subject Matrix', icon: Layout },
    { id: 'assessment', label: 'Assessments', icon: Target },
];

const CurriculumSetupDashboard = () => {
    const [activeTab, setActiveTab] = useState('levels');
    const [status, setStatus] = useState('Draft'); // Draft, Active, Archived

    // State
    const [profile, setProfile] = useState({
        name: 'New Curriculum',
        academicYear: '2026',
        system: '',
        description: ''
    });
    const [levels, setLevels] = useState(initialLevels);
    const [subjects, setSubjects] = useState(initialSubjects);
    const [matrix, setMatrix] = useState(renderMatrix(initialLevels, initialSubjects));

    const isReadOnly = status === 'Active' || status === 'Archived';

    const handleSave = () => {
        toast.success("Curriculum draft saved successfully");
    };

    const handleActivate = () => {
        // Validation mock
        if (!profile.name || !profile.system) {
            toast.error("Please complete the Curriculum Profile first");
            return;
        }
        if (confirm("Are you sure you want to activate this curriculum? It will become the standard for the selected academic year and cannot be freely edited.")) {
            setStatus('Active');
            toast.success("Curriculum Activated!");
        }
    };

    return (
        <DashboardLayout title="Curriculum Setup">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 relative">

                {/* Header Actions */}
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30 px-6 py-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Curriculum Setup</h1>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                                status === 'Active' ? 'bg-green-100 text-green-700' :
                                    'bg-slate-100 text-slate-600'
                                }`}>
                                {status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">Define education structure, subjects, and assessment rules.</p>
                    </div>

                    <div className="flex gap-2">
                        {status === 'Draft' && (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm flex items-center gap-2"
                                >
                                    <Save size={16} /> Save Draft
                                </button>
                                <button
                                    onClick={handleActivate}
                                    className="px-4 py-2 bg-green-600 text-black rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2"
                                >
                                    <Play size={16} /> Activate
                                </button>
                            </>
                        )}
                        {status === 'Active' && (
                            <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-2">
                                <Archive size={16} /> Archive
                            </button>
                        )}
                    </div>
                </div>

                <div className="max-w-[1200px] mx-auto p-6 space-y-6">
                    {/* 1. Profile Section (Always Visible) */}
                    <CurriculumProfile
                        profile={profile}
                        setProfile={setProfile}
                        isReadOnly={isReadOnly}
                    />

                    {/* 2. Navigation Tabs */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${isActive
                                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="p-6 min-h-[500px]">
                            {activeTab === 'levels' && (
                                <EducationLevelsManager
                                    levels={levels}
                                    setLevels={setLevels}
                                    isReadOnly={isReadOnly}
                                />
                            )}

                            {activeTab === 'matrix' && (
                                <SubjectMatrixView
                                    levels={levels}
                                    subjects={subjects}
                                    matrix={matrix}
                                    setMatrix={setMatrix}
                                    isReadOnly={isReadOnly}
                                />
                            )}
                            {activeTab === 'assessment' && (
                                <AssessmentMapping
                                    isReadOnly={isReadOnly}
                                />
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default CurriculumSetupDashboard;

