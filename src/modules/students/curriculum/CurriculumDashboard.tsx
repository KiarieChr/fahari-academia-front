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
            <div className="curriculum-dashboard h-full" style={{ background: 'var(--bg-light, #f8fafc)' }}>
                {showSettings ? (
                    <CurriculumSettings onBack={() => setShowSettings(false)} />
                ) : (
                    <div className="pb-20 max-w-[1400px] mx-auto" style = {{padding:'15px'}}>

                        {/* ─── Hero Header ─── */}
                        <div
                            className="relative overflow-hidden mb-2"
                            style={{
                                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)', borderRadius:'15px', padding:'30px',
                            }}
                        >
                            {/* decorative blobs */}
                            <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />
                            <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #a5b4fc 0%, transparent 70%)' }} />

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-5 relative z-10">
                                <span>Academics</span>
                                <ChevronRight size={14} />
                                <span className="text-white">Curriculum</span>
                            </div>

                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-2xl"
                                        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                        <GraduationCap size={30} />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Curriculum Management</h1>
                                        <p className="text-indigo-300 font-medium mt-1 text-sm">Academic structure, subjects & learning framework orchestration</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                                        style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                                    >
                                        <Settings size={16} />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => setIsAddItemOpen(true)}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg"
                                        style={{ background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', color: 'white' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        <Plus size={17} strokeWidth={2.5} />
                                        Add Item
                                    </button>
                                </div>
                            </div>

                            {/* ─── Tab Strip inside header ─── */}
                            <div className="flex items-center gap-1 mt-8 relative z-10 overflow-x-auto hide-scrollbar">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 relative"
                                            style={isActive ? {
                                                background: 'rgba(255,255,255,0.95)',
                                                color: '#4338ca',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                                            } : {
                                                color: 'rgba(199,210,254,0.85)',
                                                background: 'transparent',
                                            }}
                                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
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
