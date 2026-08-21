import React from 'react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import AuditLogViewer from './components/AuditLogViewer';

const SystemLogsPage: React.FC = () => {
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800">
                        System Logs
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">
                        Monitor system activity, security events, and audit trails.
                    </p>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-16rem)] p-6">
                    <AuditLogViewer />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SystemLogsPage;
