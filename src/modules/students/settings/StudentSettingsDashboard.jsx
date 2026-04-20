import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import {
  Calendar,
  BookOpen,
  Users,
  CalendarDays,
  Settings,
  Home,
  ChevronRight,
  Terminal
} from 'lucide-react';

import AcademicSetupTab from './components/tabs/AcademicSetupTab';
import CurriculumSetupTab from './components/tabs/CurriculumSetupTab';
import StudentRulesTab from './components/tabs/StudentRulesTab';
import CalendarTab from './components/tabs/CalendarTab';
import IntakeTab from './components/tabs/IntakeTab';
import SystemCommandsTab from './components/tabs/SystemCommandsTab';

const StudentSettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('academic');

  const tabs = [
    { id: 'academic', label: 'Academic Setup', icon: CalendarDays, component: <AcademicSetupTab /> },
    { id: 'curriculum', label: 'Curriculum Setup', icon: BookOpen, component: <CurriculumSetupTab /> },
    { id: 'intakes', label: 'Intakes', icon: Users, component: <IntakeTab /> },
    { id: 'rules', label: 'Student Rules', icon: Settings, component: <StudentRulesTab /> },
    { id: 'calendar', label: 'School Calendar', icon: Calendar, component: <CalendarTab /> },
    { id: 'system', label: 'System Commands', icon: Terminal, component: <SystemCommandsTab /> },
  ];

  return (
    <DashboardLayout title="Student Settings">
      <div className="flex flex-col gap-5 px-1 py-2 pb-16 min-h-screen">

        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 bg-gradient-to-br from-white via-white to-indigo-50/30 border border-gray-100 rounded-2xl px-4 sm:px-6 lg:px-10 py-5 lg:py-7 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          {/* Decorative accents */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-400 rounded-l-2xl" />
          <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-50/50 rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-8 w-36 h-36 bg-indigo-100/20 rounded-full pointer-events-none" />

          {/* Left: icon + breadcrumb + title */}
          <div className="flex items-start gap-5 relative">
            <div className="flex-shrink-0 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-[0_6px_20px_rgba(99,102,241,0.3)] ring-4 ring-indigo-50">
              <Settings size={24} className="text-white" />
            </div>

            <div className="flex flex-col gap-2">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs font-medium">
                <Home size={12} className="text-gray-400" />
                <ChevronRight size={11} className="text-gray-300" />
                <span className="text-gray-400">Students</span>
                <ChevronRight size={11} className="text-gray-300" />
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100/80 text-[0.7rem]">
                  Settings
                </span>
              </nav>

              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-[1.65rem] font-extrabold text-gray-800 leading-tight tracking-tight">
                  Student Settings & Setup
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              <p className="text-[0.82rem] text-gray-400 font-medium leading-relaxed">
                Configure academic structure, curriculum, student identification &amp; assessment criteria.
              </p>
            </div>
          </div>
        </div>

        {/* ── Vertical Tabs + Content ──────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-5 min-h-[560px]">

          {/* Sidebar Tab Navigation — horizontal scroll on mobile, vertical on lg+ */}
          <div className="lg:flex-shrink-0 lg:w-60 bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:self-start lg:sticky lg:top-4">
            {/* Top accent */}
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 rounded-t-2xl" />

            {/* Section label */}
            <div className="px-5 pt-5 pb-2">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">Navigation</span>
            </div>

            <div className="flex lg:flex-col gap-0.5 px-3 pb-3 lg:pb-5 overflow-x-auto lg:overflow-x-visible">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group relative flex items-center gap-2 lg:gap-3 whitespace-nowrap lg:whitespace-normal lg:w-full pl-3 lg:pl-5 pr-3 lg:pr-4 py-2 lg:py-3 rounded-xl text-[0.82rem] font-medium
                      text-left transition-all duration-200 select-none
                      ${isActive
                        ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-sm shadow-indigo-100/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/80'
                      }
                    `}
                  >
                    {/* Active left accent bar — hidden on mobile */}
                    <span className={`
                      hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full
                      transition-all duration-200
                      ${isActive ? 'h-7 bg-indigo-500' : 'h-0 bg-transparent group-hover:h-4 group-hover:bg-gray-300'}
                    `} />
                    <span className={`
                      flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100/70 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600'
                      }
                    `}>
                      <tab.icon size={16} />
                    </span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 min-w-0 flex flex-col bg-white border border-gray-100 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Panel header with active tab info */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 lg:py-4 border-b border-gray-100/80 bg-gray-50/40">
              <div className="flex items-center gap-3">
                {(() => {
                  const activeTabData = tabs.find(t => t.id === activeTab);
                  const TabIcon = activeTabData?.icon;
                  return (
                    <>
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
                        {TabIcon && <TabIcon size={16} />}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                          {activeTabData?.label}
                        </h3>
                        <p className="text-[0.68rem] text-gray-400 font-medium">
                          Student Settings &middot; {activeTabData?.label}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              {/* Dot progress indicator */}
              <div className="flex items-center gap-1.5">
                {tabs.map((tab) => (
                  <span
                    key={tab.id}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-indigo-500 w-4'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    title={tab.label}
                  />
                ))}
              </div>
            </div>

            {/* Panel body */}
            <div className="flex-1">
              <div
                key={activeTab}
                className="p-7 animate-in fade-in slide-in-from-bottom-1 duration-200"
              >
                {tabs.find(t => t.id === activeTab)?.component}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentSettingsDashboard;
