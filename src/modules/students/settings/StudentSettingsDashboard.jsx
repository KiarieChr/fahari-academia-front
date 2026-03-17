import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import {
  Calendar,
  BookOpen,
  Hash,
  Users,
  CalendarDays,
  GraduationCap,
  Settings,
  UserCheck
} from 'lucide-react';

import AcademicSetupTab from './components/tabs/AcademicSetupTab';
import CurriculumSetupTab from './components/tabs/CurriculumSetupTab';
import StudentRulesTab from './components/tabs/StudentRulesTab';
import CalendarTab from './components/tabs/CalendarTab';
import IntakeTab from './components/tabs/IntakeTab';

const StudentSettingsDashboard = () => {
  const [activeTab, setActiveTab] = useState('academic');

  const tabs = [
    { id: 'academic', label: 'Academic Setup', icon: CalendarDays, component: <AcademicSetupTab /> },
    { id: 'curriculum', label: 'Curriculum Setup', icon: BookOpen, component: <CurriculumSetupTab /> },
    { id: 'intakes', label: 'Intakes', icon: Users, component: <IntakeTab /> },
    { id: 'rules', label: 'Student Rules', icon: Settings, component: <StudentRulesTab /> },
    { id: 'calendar', label: 'School Calendar', icon: Calendar, component: <CalendarTab /> },
  ];

  return (
    <DashboardLayout title="Student Settings">
      <div className="min-h-screen bg-gray-50/50 pb-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-1xl font-bold text-gray-900 mb-2">Student Settings & Setup</h1>
          <p className="text-gray-500 max-w-2xl">
            Configure academic structure, curriculum, student identification, and assessment criteria to ensure smooth operations.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4 py-1 sm:mx-0 sm:px-0 sm:rounded-xl sm:border shadow-sm">
          <div className="flex gap-1 p-3 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-200'
                    : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'
                  }
                                `}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-gray-400'} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-gray-200 py-6 px-6 md:p-8 shadow-sm min-h-[500px] transition-all duration-300">
          {tabs.find(t => t.id === activeTab)?.component}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettingsDashboard;
