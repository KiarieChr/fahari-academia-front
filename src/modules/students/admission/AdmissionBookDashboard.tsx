import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import Button from '../../../components/common/Button';
import '../admission/admission.css';

import {
    Download,
    Upload,
    BookOpen,
    Home,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { studentManagementService } from '../../../services/studentManagementService';
import NewApplicantForm from './components/NewApplicantForm';
import BulkImportModal from './components/BulkImportModal';
import { AdmissionProvider } from './AdmissionContext';
const AdmissionBookDashboard = () => {
    const [showNewAppModal, setShowNewAppModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const location = useLocation();
    const isOverview = location.pathname.endsWith('/overview') || location.pathname === '/dashboard/students/admission' || location.pathname === '/dashboard/students/admission/';

    return (
        <DashboardLayout title="Admission Book">
            <AdmissionProvider
                onNewApplicant={() => setShowNewAppModal(true)}
                onImport={() => setShowImportModal(true)}
            >
                <div className="flex flex-col gap-6 px-4 md:px-8 py-6 pb-20 min-h-screen">

                    {/* ── Page Header ─────────────────────────────────────────── */}
                    {isOverview && (
                        <div
                            style={{
                                background: 'var(--card-bg)',
                                borderColor: 'var(--border-color-light)',
                                boxShadow: 'var(--shadow-card)',
                            }}
                            className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border rounded-[32px] px-3 py-2"
                        >
                            {/* Decorative background accents */}
                            <div
                                className="absolute top-0 left-0 w-2 h-full rounded-l-[32px]"
                                style={{ background: 'var(--primary-color)' }}
                            />
                            <div
                                className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none"
                                style={{ background: 'var(--primary-light)', opacity: 0.4 }}
                            />
                            <div
                                className="absolute -bottom-32 -right-12 w-48 h-48 rounded-full blur-2xl pointer-events-none"
                                style={{ background: 'var(--primary-light)', opacity: 0.15 }}
                            />

                            {/* Left: icon + breadcrumb + title */}
                            <div className="flex items-start gap-6 relative z-10">
                                {/* Page icon badge */}
                                <div
                                    className="ml-2 md:ml-0 flex-shrink-0 p-2 rounded-2xl shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] ring-4 ring-indigo-50"
                                    style={{
                                        background: 'var(--primary-color)',
                                        boxShadow: '0 10px 25px -5px var(--primary-light)',
                                    }}
                                >
                                    <BookOpen size={18} className="text-white" />
                                </div>

                                <div className="flex flex-col gap-3">
                                    {/* Breadcrumb */}
                                    <nav className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        <Home size={12} className="text-slate-300" />
                                        <ChevronRight size={10} className="text-slate-200" />
                                        <span
                                            className="hover:text-indigo-600 transition-colors cursor-pointer"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            Admissions
                                        </span>
                                        <ChevronRight size={10} className="text-slate-200" />
                                        <span
                                            className="font-black px-2 py-0.5 rounded-md"
                                            style={{ color: 'var(--primary-color)', background: 'var(--primary-light)' }}
                                        >
                                            Register
                                        </span>
                                    </nav>

                                    {/* Title row */}
                                    <div className="flex items-center gap-4">
                                        <h1
                                            className="text-3xl font-black tracking-tighter leading-none"
                                            style={{ color: 'var(--text-main)' }}
                                        >
                                            Admission Book
                                        </h1>
                                        {/* Live status badge */}
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100/60 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            Active Cycle
                                        </div>
                                    </div>

                                    <p
                                        className="text-xs font-bold leading-relaxed max-w-lg"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        Orchestrate the complete student lifecycle from application to enrollment.
                                    </p>
                                </div>
                            </div>

                            {/* Right: action buttons */}
                            <div className="flex items-center gap-4 flex-shrink-0 relative z-10 mt-4 md:mt-0">
                                <Button variant="outline" icon={Download}>
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                                <Button variant="secondary" icon={Upload} onClick={() => setShowImportModal(true)}>
                                    <span className="hidden sm:inline">Import</span>
                                </Button>
                                <div className="w-px h-8 bg-slate-100 mx-2 hidden sm:block" />
                                <Button
                                    variant="primary"
                                    icon={ArrowUpRight}
                                    iconPosition="right"
                                    onClick={() => setShowNewAppModal(true)}
                                >
                                    New Applicant
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── Child Route Content ───────────────────────────────── */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={window.location.pathname}
                            initial={{ opacity: 0, y: 10, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.99 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </AdmissionProvider>

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
