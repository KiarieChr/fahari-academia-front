import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import {
  BarChart3,
  Users,
  Search,
  ChevronRight,
  Home,
  FileText
} from 'lucide-react';

import NominalRollReport from './components/NominalRollReport';
import StudentRetrievalReport from './components/StudentRetrievalReport';
import EnrollmentTrendsReport from './components/EnrollmentTrendsReport';
import CapacityDistributionReport from './components/CapacityDistributionReport';
import ProgressionReport from './components/ProgressionReport';
import { TrendingUp, Layers, ArrowRightLeft } from 'lucide-react';

const StudentReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('nominal-roll');

  const tabs = [
    { id: 'nominal-roll', label: 'Nominal Roll', icon: Users, component: <NominalRollReport /> },
    { id: 'retrieval', label: 'Student Retrieval & Demographics', icon: Search, component: <StudentRetrievalReport /> },
    { id: 'trends', label: 'Enrollment Trends', icon: TrendingUp, component: <EnrollmentTrendsReport /> },
    { id: 'capacity', label: 'Capacity Distribution', icon: Layers, component: <CapacityDistributionReport /> },
    { id: 'progression', label: 'Progression & Transitions', icon: ArrowRightLeft, component: <ProgressionReport /> },
  ];

  return (
    <DashboardLayout title="Student Reports">
      <div className="flex flex-col gap-5 px-1 py-2 pb-16 min-h-screen">
        {/* Page Header */}
        <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 bg-gradient-to-br from-white via-white to-indigo-50/30 border border-gray-100 rounded-2xl px-4 sm:px-6 lg:px-10 py-5 lg:py-7 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-400 rounded-l-2xl" />
          
          <div className="flex items-start gap-5 relative">
            <div className="flex-shrink-0 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-[0_6px_20px_rgba(99,102,241,0.3)] ring-4 ring-indigo-50">
              <BarChart3 size={24} className="text-white" />
            </div>

            <div className="flex flex-col gap-2">
              <nav className="flex items-center gap-2 text-xs font-medium">
                <Home size={12} className="text-gray-400" />
                <ChevronRight size={11} className="text-gray-300" />
                <span className="text-gray-400">Students</span>
                <ChevronRight size={11} className="text-gray-300" />
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100/80 text-[0.7rem]">
                  Reports
                </span>
              </nav>

              <h1 className="text-[1.65rem] font-extrabold text-gray-800 leading-tight tracking-tight mt-1">
                Student Reports & Analytics
              </h1>

              <p className="text-[0.82rem] text-gray-400 font-medium leading-relaxed">
                Generate nominal rolls and visualize student demographics.
              </p>
            </div>
          </div>
        </div>

        {/* Vertical Tabs + Content */}
        <div className="flex flex-col lg:flex-row gap-5 min-h-[560px]">
          <div className="lg:flex-shrink-0 lg:w-64 bg-white border border-gray-100 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:self-start lg:sticky lg:top-4">
            <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600 rounded-t-2xl" />
            <div className="px-5 pt-5 pb-2">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">Available Reports</span>
            </div>
            
            <div className="flex lg:flex-col gap-0.5 px-3 pb-3 lg:pb-5 overflow-x-auto lg:overflow-x-visible">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[0.82rem] font-semibold transition-all duration-200 min-w-max lg:min-w-0
                      ${isActive
                        ? 'bg-indigo-50/80 text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                    )}
                    <tab.icon size={18} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {tabs.find((t) => t.id === activeTab)?.component}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentReportsDashboard;
