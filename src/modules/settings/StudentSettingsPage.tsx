import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import StudentRulesTab from '../students/settings/components/tabs/StudentRulesTab';

const StudentSettingsPage: React.FC = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-5 animate-in fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 mb-2">
                    <div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-indigo-800 drop-shadow-sm">
                            Student Setup
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">
                            Configure student management rules, admission criteria, and term setups.
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[calc(100vh-16rem)]">
                    <StudentRulesTab />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default StudentSettingsPage;
