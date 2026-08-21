import React, { useState, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import {
    LayoutDashboard,
    BookOpen,
    Library,
    GraduationCap,
    Layers,
    Settings,
    Plus,
    FileText,
    ChevronRight
} from 'lucide-react';
import CurriculumOverview from './components/CurriculumOverview';
import CurriculumList from './components/CurriculumList';
import LearningAreasAndSubjectsTab from './components/LearningAreasAndSubjectsTab';
import AddItemModal from './components/modals/AddItemModal';
import CurriculumSettings from './components/CurriculumSettings';
import CurriculumSetupTab from '../settings/components/tabs/CurriculumSetupTab';

const CurriculumDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'curricula', label: 'Curricula', icon: BookOpen },
        { id: 'learning-areas-subjects', label: 'Learning Areas & Subjects', icon: Layers },
        { id: 'curriculum-setup', label: 'Curriculum Setup', icon: Settings },
    ];

    const getModalDefaultType = () => {
        if (activeTab === 'learning-areas-subjects') return 'subject';
        return 'curriculum';
    };

    const handleAddItemSuccess = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <DashboardLayout title="Curriculum Management">
            <div className="curriculum-dashboard h-full neo-bg">
                {showSettings ? (
                    <CurriculumSettings onBack={() => setShowSettings(false)} />
                ) : (
                    <div className="pb-20 max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">

                        {/* ─── Hero Header (Neomorphic) ─── */}
                        <div className="relative mb-6 neo-card p-6 md:p-8">
                            
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 relative z-10">
                                <span>Academics</span>
                                <ChevronRight size={14} />
                                <span className="neo-text-accent">Curriculum</span>
                            </div>

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center neo-bg neo-pressed text-indigo-500">
                                        <GraduationCap size={30} />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-gray-700 tracking-tight leading-tight">Curriculum Management</h1>
                                        <p className="text-gray-500 font-medium mt-1 text-sm">Academic structure, subjects & learning framework orchestration</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="neo-btn px-5 py-2.5 gap-2"
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => setIsAddItemOpen(true)}
                                        className="neo-btn neo-btn-accent px-6 py-2.5 gap-2 font-bold"
                                    >
                                        <Plus size={17} strokeWidth={2.5} />
                                        Add Item
                                    </button>
                                </div>
                            </div>

                            {/* ─── Tab Strip inside header ─── */}
                            <div className="flex items-center gap-3 mt-10 relative z-10 overflow-x-auto hide-scrollbar pb-2">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${isActive ? 'neo-pressed neo-text-accent' : 'neo-btn'}`}
                                        >
                                            <tab.icon size={15} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ─── Dynamic Viewport ─── */}
                        <div className="px-6 pt-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <CurriculumOverview refreshKey={refreshKey} />
                                </div>
                            )}

                            {activeTab === 'curricula' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">System Registry</h3>
                                            <p className="text-sm font-medium text-gray-400 italic">Education frameworks and hierarchical levels</p>
                                        </div>
                                    </div>
                                    <CurriculumList refreshKey={refreshKey} />
                                </div>
                            )}

                            {activeTab === 'learning-areas-subjects' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Knowledge Domains & Subjects</h3>
                                            <p className="text-sm font-medium text-gray-400 italic">Manage broad academic categories and their specific subjects</p>
                                        </div>
                                    </div>
                                    <LearningAreasAndSubjectsTab refreshKey={refreshKey} />
                                </div>
                            )}

                            {activeTab === 'curriculum-setup' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Curriculum Configurations</h3>
                                            <p className="text-sm font-medium text-gray-400 italic">Configure curricula, stage levels, and classroom streams</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                                        <CurriculumSetupTab />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add Item Modal */}
                        <AddItemModal
                            isOpen={isAddItemOpen}
                            onClose={() => setIsAddItemOpen(false)}
                            defaultType={getModalDefaultType()}
                            onSuccess={handleAddItemSuccess}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CurriculumDashboard;
