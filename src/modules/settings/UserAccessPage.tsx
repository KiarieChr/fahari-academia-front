import React, { useState } from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import UserManagement from './components/UserManagement';
import RoleManagement from './components/RoleManagement';
import { Users, Lock } from 'lucide-react';

const UserAccessPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
                        Users & Access
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Manage system users, roles, and granular permissions.
                    </p>
                </div>

                {/* Horizontal Tabs */}
                <div className="flex space-x-1 bg-gray-100/80 p-1.5 rounded-xl border border-gray-200 mb-6 max-w-sm">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'users'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <Users size={18} />
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                            activeTab === 'roles'
                                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                        <Lock size={18} />
                        Roles
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-16rem)]">
                    {activeTab === 'users' ? <UserManagement /> : <RoleManagement />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserAccessPage;
