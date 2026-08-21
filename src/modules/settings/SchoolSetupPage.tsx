import React, { useState } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import InstitutionProfile from './components/InstitutionProfile';
import CampusManagement from './components/CampusManagement';
import { Building2, MapPinned } from 'lucide-react';

const SchoolSetupPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'campuses'>('profile');

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
                        School Setup
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Manage your institution profile, branding, and campus locations.
                    </p>
                </div>

                {/* Horizontal Tabs */}
                <div className="flex space-x-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200 mb-6 max-w-md">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === 'profile'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Building2 size={18} />
                        Institution Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('campuses')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === 'campuses'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <MapPinned size={18} />
                        Campuses
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-16rem)]">
                    {activeTab === 'profile' ? <InstitutionProfile /> : <CampusManagement />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SchoolSetupPage;
