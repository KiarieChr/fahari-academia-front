import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import {
    Plus,
    Download,
    Upload,
    Users,
    FileText,
    Repeat,
    ClipboardCheck,
    BarChart
} from 'lucide-react';
import AdmissionStats from './components/AdmissionStats';
import NewApplicantForm from './components/NewApplicantForm';
import ApplicationsTable from './components/ApplicationsTable';
import BulkImportModal from './components/BulkImportModal';
import AdmittedStudentsTable from './components/AdmittedStudentsTable';
import RepeatersTransfersManagement from './components/RepeatersTransfersManagement';
import NominalRoll from './components/NominalRoll';
import AdmissionReporting from './components/AdmissionReporting';

const AdmissionBookDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showNewAppModal, setShowNewAppModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'applications', label: 'Applications', icon: Users },
        { id: 'records', label: 'Admission Register', icon: ClipboardCheck },
        { id: 'nominal_roll', label: 'Nominal Roll', icon: Users },
        { id: 'reporting', label: 'Student Reporting', icon: BarChart },
        { id: 'repeaters', label: 'Repeaters & Transfers', icon: Repeat },
    ];

    return (
        <DashboardLayout title="Admission Book Dashboard">
            <div className="space-y-6 pb-12">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Admission Book Dashboard</h2>
                        <p className="text-gray-500">Manage student applications, admissions, repeaters, and transfers.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm"
                        >
                            <Upload size={18} /> Import Students
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download size={18} /> Export Report
                        </button>
                        <button
                            onClick={() => setShowNewAppModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                        >
                            <Plus size={18} /> New Application
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-8 py-3 text-sm font-medium whitespace-nowrap transition-all duration-300 group ${
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

                {/* Content */}
                <div className="min-h-[500px] animate-in fade-in duration-300">
                    {activeTab === 'overview' && <AdmissionStats />}
                    {activeTab === 'applications' && <ApplicationsTable />}
                    {activeTab === 'records' && <AdmittedStudentsTable />}
                    {activeTab === 'nominal_roll' && <NominalRoll />}
                    {activeTab === 'reporting' && <AdmissionReporting />}
                    {activeTab === 'repeaters' && <RepeatersTransfersManagement />}
                </div>

                {/* New Applicant Modal */}
                {showNewAppModal && (
                    <NewApplicantForm onClose={() => setShowNewAppModal(false)} />
                )}

                {/* Bulk Import Modal */}
                {showImportModal && (
                    <BulkImportModal onClose={() => setShowImportModal(false)} />
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdmissionBookDashboard;
