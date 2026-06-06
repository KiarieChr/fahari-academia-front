import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardCheck, BookOpen, BarChart, Repeat, ArrowUpRight } from 'lucide-react';

import AdmissionStats from '../components/AdmissionStats';
import IntakeFunnel from '../components/IntakeFunnel';
import ActionAlerts from '../components/ActionAlerts';
import ActivityFeed from '../components/ActivityFeed';
import CampusComparison from '../components/CampusComparison';
import DeadlineCalendar from '../components/DeadlineCalendar';
import { studentManagementService } from '../../../../services/studentManagementService';

/* ─── Quick-nav cards for the overview bottom strip ─────────────── */
const QUICK_NAV = [
    {
        icon: Users,
        label: 'Applications Register',
        description: 'Review applicants, update status & manage the Kanban pipeline',
        path: '/dashboard/students/admission/applications',
        color: 'var(--primary-color)',
        light: 'var(--primary-light)',
    },
    {
        icon: ClipboardCheck,
        label: 'Admission Register',
        description: 'Browse and manage the full list of admitted students',
        path: '/dashboard/students/admission/records',
        color: '#059669',
        light: '#ecfdf5',
    },
    {
        icon: BookOpen,
        label: 'Nominal Roll',
        description: 'Master student directory with stream and class assignments',
        path: '/dashboard/students/admission/nominal-roll',
        color: '#7c3aed',
        light: '#ede9fe',
    },
    {
        icon: BarChart,
        label: 'Student Reporting',
        description: 'Reopening status, billing validation and term enrollment',
        path: '/dashboard/students/admission/reporting',
        color: '#d97706',
        light: '#fef3c7',
    },
    {
        icon: Repeat,
        label: 'Repeaters & Transfers',
        description: 'Manage grade retentions and inter-school transfers',
        path: '/dashboard/students/admission/repeaters',
        color: '#dc2626',
        light: '#fee2e2',
    },
];

const AdmissionsOverviewPage = () => {
    const navigate = useNavigate();

    // We fetch stats once here so intelligence panels can consume the same data
    const [stats, setStats] = useState(null);
    const [filters] = useState({});

    useEffect(() => {
        studentManagementService.getDashboardStats(filters)
            .then(data => setStats(data))
            .catch(() => setStats(null));
    }, [JSON.stringify(filters)]);

    return (
        <div className="flex flex-col gap-8">

            {/* ── KPI Stats / Charts ───────────────────────────────────── */}
            <AdmissionStats />

            {/* ── Intelligence Layer ───────────────────────────────────── */}
            {/* Row 1: Funnel + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <IntakeFunnel stats={stats} />
                <ActionAlerts stats={stats} />
            </div>

            {/* Row 2: Activity Feed + Deadline Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ActivityFeed filters={filters} />
                <DeadlineCalendar />
            </div>

            {/* Row 3: Campus Comparison (auto-hides if single-campus) */}
            <CampusComparison filters={filters} />

            {/* ── Quick Navigation Strip ───────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: 'var(--border-color-light)' }} />
                    <span
                        className="text-[9px] font-black uppercase tracking-[0.25em] px-3"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Quick Access
                    </span>
                    <div className="h-px flex-1" style={{ background: 'var(--border-color-light)' }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {QUICK_NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="group flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                style={{
                                    background: 'var(--card-bg)',
                                    borderColor: 'var(--border-color-light)',
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                    style={{ background: item.light, color: item.color }}
                                >
                                    <Icon size={16} />
                                </div>

                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <span
                                        className="text-[11px] font-black uppercase tracking-wider leading-tight"
                                        style={{ color: 'var(--text-main)' }}
                                    >
                                        {item.label}
                                    </span>
                                    <p
                                        className="text-[10px] leading-snug"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {item.description}
                                    </p>
                                </div>

                                <div
                                    className="self-end opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    style={{ color: item.color }}
                                >
                                    <ArrowUpRight size={14} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdmissionsOverviewPage;
