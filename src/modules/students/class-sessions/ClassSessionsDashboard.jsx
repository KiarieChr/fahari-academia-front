import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, Calendar, FileText, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

import SessionStats from './components/SessionStats';
import SessionsList from './components/SessionsList';
import StartSessionModal from './components/StartSessionModal';
import AttendancePanel from './components/AttendancePanel';
import LessonCoverage from './components/LessonCoverage';
import TeacherPerformance from './components/TeacherPerformance';
import SessionHistory from './components/SessionHistory';
import NotificationsPanel from './components/NotificationsPanel';
import SessionReportsModal from './components/modals/SessionReportsModal';
import ViewTimetableModal from './components/modals/ViewTimetableModal';

import TimetableTab from './tabs/TimetableTab';

const ClassSessionsDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isStartSessionOpen, setIsStartSessionOpen] = useState(false);
    const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
    const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'sessions', label: 'Daily Sessions', icon: Calendar },
        { id: 'timetable', label: 'Timetable', icon: Clock },
        { id: 'reports', label: 'Reports', icon: BarChart3 }
    ];

    return (
        <DashboardLayout title="Class Sessions">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Sessions Dashboard</h1>
                        <p className="text-gray-500">Manage daily lessons, attendance, timetables, and session progress.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsReportsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
                        >
                            <FileText size={18} /> Reports
                        </button>
                        <button
                            onClick={() => setIsTimetableModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
                        >
                            <Calendar size={18} /> View Timetable
                        </button>
                        <button
                            onClick={() => setIsStartSessionOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 font-medium"
                        >
                            <Plus size={18} /> Start New Session
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 px-6 gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-4 py-5 text-sm font-medium whitespace-nowrap transition-all duration-300 group ${
                                    activeTab === tab.id 
                                        ? 'text-indigo-600' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {/* Icon */}
                                <tab.icon 
                                    size={18} 
                                    className={`transition-all duration-300 ${
                                        activeTab === tab.id 
                                            ? 'text-indigo-600 scale-110' 
                                            : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                                />
                                {/* Label */}
                                <span className={`transition-all duration-300 ${
                                    activeTab === tab.id 
                                        ? 'font-semibold text-indigo-700' 
                                        : 'font-medium'
                                }`}>
                                    {tab.label}
                                </span>
                                
                                {/* Active Indicator Line */}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-t-full"></div>
                                )}
                                
                                {/* Hover Effect Background */}
                                {activeTab !== tab.id && (
                                    <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-t-lg"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            <SessionStats />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <AttendancePanel />
                                    <TeacherPerformance />
                                    <SessionHistory />
                                </div>
                                <div className="space-y-6">
                                    <NotificationsPanel />
                                    <LessonCoverage />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Daily Sessions Tab */}
                    {activeTab === 'sessions' && (
                        <>
                            <SessionStats />
                            <SessionsList />
                        </>
                    )}

                    {/* Timetable Tab */}
                    {activeTab === 'timetable' && (
                        <TimetableTab />
                    )}

                    {/* Reports Tab */}
                    {activeTab === 'reports' && (
                        <div className="bg-white rounded-xl p-8 text-center">
                            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Session Reports</h3>
                            <p className="text-gray-500">Click the "Reports" button above to view detailed session analytics and reports.</p>
                        </div>
                    )}
                </motion.div>

                {/* Modals */}
                <StartSessionModal
                    isOpen={isStartSessionOpen}
                    onClose={() => setIsStartSessionOpen(false)}
                />

                <SessionReportsModal
                    isOpen={isReportsModalOpen}
                    onClose={() => setIsReportsModalOpen(false)}
                />

                <ViewTimetableModal
                    isOpen={isTimetableModalOpen}
                    onClose={() => setIsTimetableModalOpen(false)}
                />
            </div>
        </DashboardLayout>
    );
};

export default ClassSessionsDashboard;
