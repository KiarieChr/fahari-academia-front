import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';
import {
    Clock, Calendar, Users, LayoutTemplate, AlertTriangle, Plus, Printer,
    Share2, Settings, Download
} from 'lucide-react';

import ClassTimesFilterBar from './components/ClassTimesFilterBar';
import ClassTimesOverview from './components/ClassTimesOverview';
import TimeSlotsManagement from './components/TimeSlotsManagement';
import WeeklyTimetable from './components/WeeklyTimetable';
import TeacherScheduleView from './components/TeacherScheduleView';
import RoomAllocationView from './components/RoomAllocationView';
import ConflictPanel from './components/ConflictPanel';

import * as data from './data/classTimesData';

const TABS = [
    { id: 'overview', label: 'Overview', icon: Clock },
    { id: 'timetable', label: 'Class Timetable', icon: Calendar },
    { id: 'slots', label: 'Time Slots', icon: Settings },
    { id: 'teachers', label: 'Teacher Schedules', icon: Users },
    { id: 'rooms', label: 'Room Allocation', icon: LayoutTemplate },
];

const ClassTimesDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <ClassTimesOverview metrics={data.summaryMetrics} />
                        <ConflictPanel conflicts={data.conflicts} />
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Today's Schedule Preview</h3>
                                <button onClick={() => setActiveTab('timetable')} className="text-sm text-blue-600 font-medium hover:underline">View Full Timetable</button>
                            </div>
                            <WeeklyTimetable
                                timetable={[data.weeklyTimetable[0]]} // Just show Monday as preview
                                timeSlots={data.timeSlots}
                            />
                        </div>
                    </div>
                );
            case 'timetable':
                return (
                    <div className="space-y-6">
                        <ConflictPanel conflicts={data.conflicts} />
                        <WeeklyTimetable
                            timetable={data.weeklyTimetable}
                            timeSlots={data.timeSlots}
                        />
                    </div>
                );
            case 'slots':
                return <TimeSlotsManagement slots={data.timeSlots} />;
            case 'teachers':
                return <TeacherScheduleView schedules={data.teacherSchedules} />;
            case 'rooms':
                return <RoomAllocationView rooms={data.roomAllocations} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors">
            <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Class Times & Timetable</h1>
                        <p className="text-slate-500 dark:text-slate-400">Configure lesson periods, schedules, and class allocations.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            <Printer size={18} />
                            Print
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/students/class-times/create-timetable')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-black rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Create Timetable
                        </button>
                    </div>
                </div>

                {/* Filter Bar (Conditional visibility could be better but showing globally is fine) */}
                {activeTab !== 'slots' && (
                    <ClassTimesFilterBar />
                )}

                {/* Tabs / Navigation */}
                <div className="space-y-6">
                    <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2 border-b border-slate-200 dark:border-slate-700">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-t-lg'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default ClassTimesDashboard;
