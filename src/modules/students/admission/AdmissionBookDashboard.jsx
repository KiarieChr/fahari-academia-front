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
                <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 bg-gradient-to-br from-white via-white to-indigo-50/30 border border-gray-100 rounded-2xl px-4 sm:px-6 lg:px-10 py-5 lg:py-7 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">

                    {/* Decorative background accents */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-400 rounded-l-2xl" />
                    <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-50/50 rounded-full pointer-events-none" />
                    <div className="absolute -bottom-20 -right-8 w-36 h-36 bg-indigo-100/20 rounded-full pointer-events-none" />

                    {/* Left: icon + breadcrumb + title */}
                    <div className="flex items-start gap-5 relative">
                        {/* Page icon badge */}
                        <div className="flex-shrink-0 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-[0_6px_20px_rgba(99,102,241,0.3)] ring-4 ring-indigo-50">
                            <BookOpen size={24} className="text-white" />
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-xs font-medium">
                                <Home size={12} className="text-gray-400" />
                                <ChevronRight size={11} className="text-gray-300" />
                                <span className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">Students</span>
                                <ChevronRight size={11} className="text-gray-300" />
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100/80 text-[0.7rem]">
                                    Admission Book
                                </span>
                            </nav>

                            {/* Title row */}
                            <div className="flex items-center gap-3 mt-1">
                                <h1 className="text-[1.65rem] font-extrabold text-gray-800 leading-tight tracking-tight">
                                    Admission Book
                                </h1>
                                {/* Live status badge */}
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[0.65rem] font-bold text-emerald-700 uppercase tracking-wider">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                                    Active
                                </span>
                            </div>

                            <p className="text-[0.82rem] text-gray-400 font-medium leading-relaxed">
                                Manage applications, admissions, repeaters &amp; transfers.
                            </p>
                        </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0 relative">
                        {/* Tertiary — Export */}
                        <button className="group inline-flex items-center gap-1.5 px-3.5 py-[7px] border border-gray-200 text-gray-500 bg-white text-xs font-medium rounded-lg hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 transition-all duration-150 active:scale-[0.97]">
                            <Download size={13} className="transition-transform duration-150 group-hover:-translate-y-0.5" />
                            Export
                        </button>

                        {/* Secondary — Import */}
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="group inline-flex items-center gap-1.5 px-3.5 py-[7px]
                                       border border-indigo-200/80 text-indigo-600 bg-indigo-50/60 text-xs font-medium
                                       rounded-lg hover:bg-indigo-100/70 hover:border-indigo-300
                                       transition-all duration-150 active:scale-[0.97]"
                        >
                            <Upload size={13} className="transition-transform duration-150 group-hover:-translate-y-0.5" />
                            Import
                        </button>

                        {/* Divider */}
                        <div className="w-px h-5 bg-gray-200 mx-0.5" />

                        {/* Primary CTA — New Application */}
                        <button
                            onClick={() => setShowNewAppModal(true)}
                            className="group inline-flex items-center gap-1.5 px-4 py-[7px] bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all duration-150 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1"
                        >
                            <Plus size={14} className="transition-transform duration-150 group-hover:rotate-90" />
                            New Application
                        </button>
                    </div>
                </div>

                {/* ── Vertical Tabs + Content ──────────────────────────────── */}
                <div className="flex flex-col lg:flex-row gap-5 min-h-[560px]">

                    {/* Sidebar Tab Navigation — horizontal scroll on mobile, vertical on lg+ */}
                    <div className="lg:flex-shrink-0 lg:w-60 bg-white border border-gray-100 rounded-2xl
                                    shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:self-start lg:sticky lg:top-4">
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
                    <div className="flex-1 min-w-0 flex flex-col
                                    bg-white border border-gray-100 rounded-2xl
                                    shadow-[0_1px_6px_rgba(0,0,0,0.04)]
                                    overflow-hidden">
                        {/* Panel header with active tab info */}
                        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 lg:py-4 border-b border-gray-100/80 bg-gray-50/40">
                            <div className="flex items-center gap-3">
                                {/* Active tab icon */}
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
                                                    Admission Book &middot; {activeTabData?.label}
                                                </p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            {/* Optional: breadcrumb dot indicator */}
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
                        <div className="flex-1 p-6 overflow-auto">
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
