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
    FileText
} from 'lucide-react';
import CurriculumOverview from './components/CurriculumOverview';
import CurriculumList from './components/CurriculumList';
import SubjectManagement from './components/SubjectManagement';
import LearningAreaManagement from './components/LearningAreaManagement';
import AddItemModal from './components/modals/AddItemModal';
import CurriculumSettings from './components/CurriculumSettings';

const CurriculumDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'curricula', label: 'Curricula', icon: BookOpen },
        { id: 'subjects', label: 'Subjects', icon: Library },
        { id: 'learning-areas', label: 'Learning Areas', icon: Layers },
    ];

    const getModalDefaultType = () => {
        if (activeTab === 'subjects') return 'subject';
        return 'curriculum';
    };

    const handleAddItemSuccess = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <DashboardLayout title="Curriculum Management">
            <div className="curriculum-dashboard h-full bg-[#f8fafc]">
                {showSettings ? (
                    <CurriculumSettings onBack={() => setShowSettings(false)} />
                ) : (
                    <div className="space-y-8 pb-20 max-w-[1400px] mx-auto px-6 pt-8">
                        {/* ─── Executive Header ─── */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                        <GraduationCap size={22} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Curriculum Dashboard</h2>
                                </div>
                                <p className="text-gray-400 font-medium ml-13">Academic structure orchestration and learning frameworks.</p>
                            </div>
                            
                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-6 py-3 border-2 border-gray-100 bg-white text-gray-600 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-sm shadow-sm"
                                >
                                    <Settings size={18} className="text-gray-400" /> 
                                    <span>Settings</span>
                                </button>
                                <button
                                    onClick={() => setIsAddItemOpen(true)}
                                    className="flex-1 lg:flex-none flex items-center justify-center gap-2.5 px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl hover:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] transition-all font-bold text-sm shadow-lg shadow-indigo-100"
                                >
                                    <Plus size={18} strokeWidth={3} /> 
                                    <span>Add Item</span>
                                </button>
                            </div>
                        </div>

                        {/* ─── Navigation Pill Bar ─── */}
                        <div className="bg-white/80 backdrop-blur-md rounded-[22px] border-2 border-gray-50 p-1.5 flex items-center gap-1 overflow-x-auto hide-scrollbar shadow-sm">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-8 py-3.5 rounded-[18px] text-[13px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${isActive
                                            ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-[1.02]'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/80'
                                        }`}
                                    >
                                        <tab.icon size={18} className={isActive ? 'text-indigo-400' : 'text-gray-300'} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ─── Dynamic Viewport ─── */}
                        <div className="min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                            {activeTab === 'subjects' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Academic Repository</h3>
                                            <p className="text-sm font-medium text-gray-400 italic">Core subjects and specialized learning tracks</p>
                                        </div>
                                    </div>
                                    <SubjectManagement refreshKey={refreshKey} />
                                </div>
                            )}

                            {activeTab === 'learning-areas' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <div className="w-1 h-8 bg-indigo-600 rounded-full" />
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Knowledge Domains</h3>
                                            <p className="text-sm font-medium text-gray-400 italic">Broad academic classifications and groupings</p>
                                        </div>
                                    </div>
                                    <LearningAreaManagement refreshKey={refreshKey} />
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
