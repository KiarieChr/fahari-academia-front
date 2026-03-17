import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import '../admission/admission.css';

import {
    Plus,
    Download,
    Upload,
    Users,
    FileText,
    Repeat,
    ClipboardCheck,
    BarChart,
    ChevronRight,
    BookOpen,
    Home
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
        { id: 'nominal_roll', label: 'Nominal Roll', icon: BookOpen },
        { id: 'reporting', label: 'Student Reporting', icon: BarChart },
        { id: 'repeaters', label: 'Repeaters & Transfers', icon: Repeat },
    ];

    return (
        <DashboardLayout title="Admission Book Dashboard">
            <div className="flex flex-col gap-5 px-1 py-2 pb-16 min-h-screen">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-white via-white to-indigo-50/40 border border-gray-100 rounded-2xl px-8 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

                    {/* Decorative background accent */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-indigo-400 rounded-l-2xl" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full opacity-60 pointer-events-none" />
                    {/* Left: icon + breadcrumb + title */}
                    <div className="flex items-start gap-4 relative">
                        {/* Page icon badge */}
                        <div className="flex-shrink-0 p-3 rounded-xl bg-indigo-600 shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
                            <BookOpen size={22} className="text-white" />
                        </div>

                        <div className="flex flex-col gap-1">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-1.5 text-xs font-medium">
                                <Home size={11} className="text-gray-400" />
                                <ChevronRight size={10} className="text-gray-300" />
                                <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Students</span>
                                <ChevronRight size={10} className="text-gray-300" />
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100">
                                    Admission Book
                                </span>
                            </nav>

                            {/* Title row */}
                            <div className="flex items-center gap-3 mt-0.5">
                                <h1 className="text-2xl font-extrabold text-gray-750 leading-tight tracking-tight">
                                    Admission Book
                                </h1>
                                {/* Live status badge */}
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-[0.68rem] font-bold text-green-700 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot" />
                                    Active
                                </span>
                            </div>

                            <p className="text-sm text-gray-400 font-medium">
                                Manage applications, admissions, repeaters &amp; transfers.
                            </p>
                        </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2.5 flex-shrink-0 relative">
                        {/* Tertiary — Export */}
                        <button className="group inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 bg-white text-sm font-medium rounded-xl hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800 transition-all duration-150 active:scale-95 shadow-sm"
                        >
                            <Download size={15} className="transition-transform duration-150 group-hover:-translate-y-0.5" />
                            Export
                        </button>

                        {/* Secondary — Import */}
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="group inline-flex items-center gap-2 px-4 py-2.5
                                       border border-indigo-200 text-indigo-700 bg-indigo-50 text-sm font-medium
                                       rounded-xl hover:bg-indigo-100 hover:border-indigo-300
                                       transition-all duration-150 active:scale-95 shadow-sm"
                        >
                            <Upload size={15} className="transition-transform duration-150 group-hover:-translate-y-0.5" />
                            Import
                        </button>

                        {/* Primary CTA — New Application */}
                        <button
                            onClick={() => setShowNewAppModal(true)}
                            className="group inline-flex items-center gap-2 px-3 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <Plus size={16} className="transition-transform duration-150 group-hover:rotate-90" />
                            New Application
                        </button>
                    </div>
                </div>

                {/* ── Pill Tab Navigation ──────────────────────────────────── */}
                <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4
                                shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                    {/* Pill container */}
                    <div className="inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto hide-scrollbar w-full md:w-auto">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                        whitespace-nowrap transition-all duration-200 select-none
                                        ${isActive
                                            ? 'bg-white text-indigo-700 font-semibold shadow-sm shadow-gray-200 border border-gray-100'
                                            : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'
                                        }
                                    `}
                                >
                                    <tab.icon
                                        size={15}
                                        className={`transition-all duration-200 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'
                                            }`}
                                    />
                                    {tab.label}

                                    {/* Active accent dot */}
                                    {isActive && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2
                                                         bg-indigo-500 rounded-full border-2 border-white" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Tab Content Panel ────────────────────────────────────── */}
                <div className="flex-1 min-h-[520px]
                                bg-white border border-gray-100 rounded-2xl
                                shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                                overflow-hidden">
                    {/* Subtle top accent bar matching active tab */}
                    <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />

                    {/* Panel body — fade transition between tabs */}
                    <div
                        key={activeTab}
                        className="p-8 animate-in fade-in slide-in-from-bottom-1 duration-200"
                    >
                        {activeTab === 'overview' && <AdmissionStats />}
                        {activeTab === 'applications' && <ApplicationsTable />}
                        {activeTab === 'records' && <AdmittedStudentsTable />}
                        {activeTab === 'nominal_roll' && <NominalRoll />}
                        {activeTab === 'reporting' && <AdmissionReporting />}
                        {activeTab === 'repeaters' && <RepeatersTransfersManagement />}
                    </div>
                </div>

            </div>

            {/* ── Modals ──────────────────────────────────────────────────── */}
            {showNewAppModal && (
                <NewApplicantForm onClose={() => setShowNewAppModal(false)} />
            )}
            {showImportModal && (
                <BulkImportModal onClose={() => setShowImportModal(false)} />
            )}
        </DashboardLayout>
    );
};

export default AdmissionBookDashboard;
