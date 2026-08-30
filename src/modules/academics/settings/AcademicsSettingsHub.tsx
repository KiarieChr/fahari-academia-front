import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import {
    BookOpen,
    Layers,
    CalendarDays,
    Settings,
    Home,
    ChevronRight,
    Award,
    FileText,
    TrendingUp,
    ShieldCheck,
    GraduationCap
} from 'lucide-react';

// Pillar A: Academic Architecture
import CurriculumSetup from './components/CurriculumSetup';
import LearningAreasSetup from './components/LearningAreasSetup';
import ClassStreamSetup from './components/ClassStreamSetup';

// Pillar B: Calendar & Terms
import AcademicSetupTab from './components/tabs/AcademicSetupTab';
import TermSetup from './components/TermSetup';
import CalendarTab from './components/tabs/CalendarTab';

// Pillar C: Assessment & Grading
import GradingAssessmentSetup from './components/GradingAssessmentSetup';

// Pillar D: Reports & Progression
import ReportCardTemplateSetup from './components/ReportCardTemplateSetup';

const AcademicsSettingsHub = () => {
    const [activePillar, setActivePillar] = useState('architecture');
    const [activeSection, setActiveSection] = useState('curriculum');

    const pillars = [
        {
            id: 'architecture',
            label: 'Academic Architecture',
            icon: Layers,
            sections: [
                { id: 'curriculum', label: 'Curricula', component: <CurriculumSetup /> },
                { id: 'subjects', label: 'Learning Areas & Subjects', component: <LearningAreasSetup /> },
                { id: 'classes', label: 'Classes & Streams', component: <ClassStreamSetup /> },
            ]
        },
        {
            id: 'calendar',
            label: 'Calendar & Terms',
            icon: CalendarDays,
            sections: [
                { id: 'academic_years', label: 'Academic Years', component: <AcademicSetupTab /> },
                { id: 'terms', label: 'Terms / Semesters', component: <TermSetup /> },
                { id: 'events', label: 'School Calendar', component: <CalendarTab /> },
            ]
        },
        {
            id: 'assessment',
            label: 'Assessment & Grading',
            icon: Award,
            sections: [
                { id: 'grading', label: 'Grading Scales', component: <GradingAssessmentSetup /> },
            ]
        },
        {
            id: 'reports',
            label: 'Reports & Progression',
            icon: FileText,
            sections: [
                { id: 'templates', label: 'Report Templates', component: <ReportCardTemplateSetup /> },
                { id: 'promotion', label: 'Promotion Rules', component: <div className="p-3 text-center text-gray-500 bg-[#e0e5ec] rounded-[24px] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff]">Promotion rules configuration coming soon.</div> },
            ]
        }
    ];

    const currentPillar = pillars.find(p => p.id === activePillar);
    const currentSection = currentPillar?.sections.find(s => s.id === activeSection) || currentPillar?.sections[0];

    const handlePillarChange = (pillarId) => {
        setActivePillar(pillarId);
        const newPillar = pillars.find(p => p.id === pillarId);
        if (newPillar && newPillar.sections.length > 0) {
            setActiveSection(newPillar.sections[0].id);
        }
    };

    return (
        <DashboardLayout title="Academics & Exams">
            <div className="flex flex-col gap-6 px-2 py-4 pb-3 min-h-screen bg-[#e0e5ec]">

                {/* ── Page Header (Neomorphic) ─────────────────────────────────────────── */}
                <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-[32px] px-3 lg:px-4 py-3 lg:py-3 bg-[#e0e5ec] shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff]">

                    <div className="flex items-start gap-6 relative z-10">
                        <div className="flex-shrink-0 p-3 rounded-[24px] bg-[#e0e5ec] shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff] text-indigo-600">
                            <GraduationCap size={32} />
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Home size={12} />
                                <ChevronRight size={11} />
                                <span>Academics</span>
                                <ChevronRight size={11} />
                                <span className="text-indigo-500">Settings Hub</span>
                            </nav>

                            <div className="flex items-center gap-3 mt-1">
                                <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                                    Academics & Examinations
                                </h1>
                            </div>

                            <p className="text-sm text-gray-500 font-medium">
                                Centralized management for curriculum, grading scales, term dates, and report cards.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Two-Tier Navigation + Content ──────────────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-6 mt-3">

                    {/* Left Sidebar (Pillars) */}
                    <div className="lg:w-72 flex flex-col gap-4 flex-shrink-0">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 px-2">Configuration Pillars</h3>
                        <div className="flex flex-col gap-4">
                            {pillars.map((pillar) => {
                                const isActive = activePillar === pillar.id;
                                const Icon = pillar.icon;

                                return (
                                    <button
                                        key={pillar.id}
                                        onClick={() => handlePillarChange(pillar.id)}
                                        className={`group flex items-center gap-4 p-2 !rounded-[24px] transition-all duration-300 text-left overflow-hidden ${isActive ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] text-indigo-600' : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] text-gray-500 hover:text-gray-700 hover:shadow-[6px_6px_12px_#c3c8ce,-6px_-6px_12px_#ffffff]'}`}
                                    >
                                        <div className={`p-2 rounded-[16px] transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.4)]' : 'bg-[#e0e5ec] shadow-[2px_2px_4px_#c3c8ce,-2px_-2px_4px_#ffffff] group-hover:text-indigo-500'}`}>
                                            <Icon size={18} />
                                        </div>
                                        <span className="font-bold tracking-wide">{pillar.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Top Nav (Sections within Pillar) */}
                        <div className="flex overflow-x-auto gap-4 p-2 mb-4 hide-scrollbar">
                            {currentPillar?.sections.map(section => {
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`
                                            whitespace-nowrap px-3 py-3 !rounded-[16px] text-sm font-bold tracking-wider transition-all duration-300
                                            ${isActive
                                                ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]'
                                                : 'bg-[#e0e5ec] text-gray-500 shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] hover:text-indigo-600 hover:shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff]'
                                            }
                                        `}
                                    >
                                        {section.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Neomorphic Content Panel */}
                        <div className="flex-1 bg-[#e0e5ec] rounded-[32px] p-1 shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff] border border-white/40">
                            <div className="h-full bg-white/50 backdrop-blur-sm rounded-[28px] p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-300">
                                {currentSection?.component}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default AcademicsSettingsHub;
