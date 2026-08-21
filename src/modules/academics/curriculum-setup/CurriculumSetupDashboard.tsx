import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Archive, Play, Layout, BookOpen, Layers, Target, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import CurriculumProfile from './components/CurriculumProfile';
import EducationLevelsManager from './components/EducationLevelsManager';
import SubjectMatrixView from './components/SubjectMatrixView';
import AssessmentMapping from './components/AssessmentMapping';

// API
import { curriculumService } from '../../../services/curriculumService';
import { api } from '../../../services/apiClient';

const TABS = [
    { id: 'levels', label: 'Levels & Classes', icon: Layers },
    { id: 'matrix', label: 'Subject Matrix', icon: Layout },
    { id: 'assessment', label: 'Assessments', icon: Target },
];

const CurriculumSetupDashboard = () => {
    const [activeTab, setActiveTab] = useState('levels');
    const [loading, setLoading] = useState(true);
    const [curricula, setCurricula] = useState([]);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null);

    // State
    const [levels, setLevels] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [matrix, setMatrix] = useState({});

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [currData, levelsData, subjectsData, classesData] = await Promise.all([
                curriculumService.getCurricula(),
                curriculumService.getCurriculumLevels(),
                api.timetable.getSubjects(),
                curriculumService.getClasses(),
            ]);
            const currs = (currData.results || currData) || [];
            setCurricula(currs);
            if (currs.length > 0 && !selectedCurriculum) {
                setSelectedCurriculum(currs[0]);
            }

            const allLevels = (levelsData.results || levelsData) || [];
            const allSubjects = (subjectsData.results || subjectsData) || [];
            const allClasses = (classesData.results || classesData) || [];

            setLevels(allLevels);
            setSubjects(allSubjects);
            setClasses(allClasses);

            // Build matrix from class-subject relationships
            const m = {};
            allClasses.forEach(cls => {
                allSubjects.forEach(sub => {
                    // If they share the same curriculum, mark as assigned
                    if (String(cls.curriculum) === String(sub.curriculum)) {
                        m[`${cls.id}-${sub.id}`] = true;
                    }
                });
            });
            setMatrix(m);
        } catch {
            toast.error('Failed to load curriculum data');
        } finally {
            setLoading(false);
        }
    }, [selectedCurriculum]);

    useEffect(() => { loadData(); }, []);

    // Filter data by selected curriculum
    const filteredLevels = selectedCurriculum
        ? levels.filter(l => String(l.curriculum) === String(selectedCurriculum.id))
        : levels;
    const filteredSubjects = selectedCurriculum
        ? subjects.filter(s => String(s.curriculum) === String(selectedCurriculum.id))
        : subjects;
    const filteredClasses = selectedCurriculum
        ? classes.filter(c => String(c.curriculum) === String(selectedCurriculum.id))
        : classes;

    // Map levels with their classes for EducationLevelsManager
    const levelsWithClasses = filteredLevels.map(level => ({
        id: level.id,
        name: level.name,
        code: level.code || level.name.substring(0, 3).toUpperCase(),
        years: level.max_years || level.min_years || 1,
        classes: filteredClasses
            .filter(c => String(c.curriculum_level) === String(level.id))
            .map(c => ({
                id: c.id,
                name: c.name,
                code: c.code || c.name,
                maxStudents: c.max_students || 40,
            })),
    }));

    // Map subjects for SubjectMatrixView
    const subjectsForMatrix = filteredSubjects.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        category: s.subject_type_display || s.subject_type,
        compulsory: s.subject_type === 'compulsory',
    }));

    const status = selectedCurriculum?.status || 'active';
    const isReadOnly = status === 'active' || status === 'phased_out';

    return (
        <DashboardLayout title="Curriculum Setup">
            <div className="min-h-screen neo-bg pb-20 relative">

                {/* Header Actions */}
                <div className="neo-card z-30 px-3 py-4 mx-2 mt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-md font-bold text-gray-700">Curriculum Setup</h1>
                            <p className="text-sm text-gray-500">Define education structure, subjects, and assessment rules.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Curriculum selector */}
                        <select
                            className="neo-input font-medium p-2"
                            value={selectedCurriculum?.id || ''}
                            onChange={(e) => {
                                const c = curricula.find(x => String(x.id) === e.target.value);
                                setSelectedCurriculum(c);
                            }}
                        >
                            {curricula.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            status === 'draft' ? 'bg-amber-100 text-amber-700' :
                            status === 'active' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                            {status}
                        </span>
                        <button onClick={loadData}
                            className="neo-btn px-4 py-2 flex items-center gap-2">
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-5">
                        <Loader2 className="animate-spin text-indigo-600" size={28} />
                    </div>
                ) : (
                    <div className="max-w-[1200px] mx-auto p-4 space-y-4">
                        {/* Profile Section */}
                        <CurriculumProfile
                            profile={{
                                name: selectedCurriculum?.name || '',
                                academicYear: '',
                                system: selectedCurriculum?.code || '',
                                description: selectedCurriculum?.description || '',
                            }}
                            setProfile={() => {}}
                            isReadOnly={isReadOnly}
                        />

                        {/* Navigation Tabs */}
                        <div className="neo-card overflow-hidden">
                            <div className="flex px-4 pt-4 gap-2 overflow-x-auto hide-scrollbar pb-2">
                                {TABS.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors whitespace-nowrap ${isActive
                                                ? 'neo-pressed neo-text-accent font-bold'
                                                : 'neo-btn font-medium'
                                            }`}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 min-h-[500px]">
                                {activeTab === 'levels' && (
                                    <EducationLevelsManager
                                        levels={levelsWithClasses}
                                        setLevels={() => {}}
                                        isReadOnly={isReadOnly}
                                    />
                                )}

                                {activeTab === 'matrix' && (
                                    <SubjectMatrixView
                                        levels={levelsWithClasses}
                                        subjects={subjectsForMatrix}
                                        matrix={matrix}
                                        setMatrix={setMatrix}
                                        isReadOnly={isReadOnly}
                                    />
                                )}
                                {activeTab === 'assessment' && (
                                    <AssessmentMapping
                                        isReadOnly={isReadOnly}
                                        curriculum={selectedCurriculum}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default CurriculumSetupDashboard;

