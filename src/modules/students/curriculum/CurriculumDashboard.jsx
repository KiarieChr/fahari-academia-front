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
    ];

    // Determine default modal type based on active tab
    const getModalDefaultType = () => {
        if (activeTab === 'subjects') return 'subject';
        return 'curriculum';
    };

    // Callback to refresh data when modal creates new item
    const handleAddItemSuccess = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <DashboardLayout title="Curriculum Dashboard">
            <div className="curriculum-dashboard h-full">
                {showSettings ? (
                    <CurriculumSettings onBack={() => setShowSettings(false)} />
                ) : (
                    <div className="space-y-6 pb-20">
                        {/* Page Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Curriculum Dashboard</h2>
                                <p className="text-gray-500">Manage school curricula, subjects, assessments, and academic structure.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
                                >
                                    <Settings size={18} /> Settings
                                </button>
                                <button
                                    onClick={() => setIsAddItemOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 font-medium"
                                >
                                    <Plus size={18} /> Add Item
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-white rounded-xl border border-gray-200 p-1 flex overflow-x-auto hide-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="min-h-[500px] animate-in fade-in duration-300">
                            {activeTab === 'overview' && <CurriculumOverview refreshKey={refreshKey} />}

                            {activeTab === 'curricula' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">Curriculum List</h3>
                                        <p className="text-sm text-gray-500">Manage education systems and levels</p>
                                    </div>
                                    <CurriculumList refreshKey={refreshKey} />
                                </div>
                            )}

                            {activeTab === 'subjects' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">Subject Repository</h3>
                                        <p className="text-sm text-gray-500">Manage subjects and learning areas</p>
                                    </div>
                                    <SubjectManagement refreshKey={refreshKey} />
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
