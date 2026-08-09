import React, { useMemo } from 'react';
import { AlertTriangle, Clock, MessageSquare, Users, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Derives actionable alerts from dashboard_stats data (no additional API call).
 * Surfaces items that need admin attention.
 */
const deriveAlerts = (metrics, statusDist) => {
    const alerts = [];

    // Pending applications
    const pendingCount = metrics.pending || 0;
    if (pendingCount > 0) {
        alerts.push({
            id: 'pending',
            icon: Clock,
            color: '#f59e0b',
            light: 'rgba(245,158,11,0.1)',
            title: `${pendingCount} Application${pendingCount !== 1 ? 's' : ''} Awaiting Review`,
            body: 'These applicants are in the queue and have not been processed yet.',
            action: 'Review Applications',
            path: '/dashboard/students/admission/applications',
            severity: pendingCount > 20 ? 'high' : 'medium',
        });
    }

    // Interview-scheduled (need follow-up)
    const interviewCount = statusDist?.find(s => s.name === 'Interview')?.value || 0;
    if (interviewCount > 0) {
        alerts.push({
            id: 'interview',
            icon: MessageSquare,
            color: '#3b82f6',
            light: 'rgba(59,130,246,0.1)',
            title: `${interviewCount} Applicant${interviewCount !== 1 ? 's' : ''} Scheduled for Interview`,
            body: 'These applicants have interview dates set. Ensure timely follow-up and decision.',
            action: 'View Applicants',
            path: '/dashboard/students/admission/applications',
            severity: 'medium',
        });
    }

    // Waitlisted
    const waitlistCount = statusDist?.find(s => s.name === 'Waitlist')?.value || 0;
    if (waitlistCount > 0) {
        alerts.push({
            id: 'waitlist',
            icon: Users,
            color: '#9333ea',
            light: 'rgba(147,51,234,0.1)',
            title: `${waitlistCount} Applicant${waitlistCount !== 1 ? 's' : ''} on Waitlist`,
            body: 'Waitlisted applicants may be promoted if capacity opens. Review regularly.',
            action: 'Manage Waitlist',
            path: '/dashboard/students/admission/applications',
            severity: 'low',
        });
    }

    // Capacity check — if admitted > 90% of target
    const admitted = metrics.admitted || 0;
    const target = metrics.target_capacity || 0;
    if (target > 0 && admitted / target >= 0.9) {
        const remaining = target - admitted;
        alerts.push({
            id: 'capacity',
            icon: AlertTriangle,
            color: '#dc2626',
            light: 'rgba(220,38,38,0.1)',
            title: `Intake Capacity at ${((admitted / target) * 100).toFixed(0)}% — ${remaining} Slots Remain`,
            body: 'You are approaching maximum intake capacity. Consider closing applications soon.',
            action: 'View Overview',
            path: '/dashboard/students/admission/overview',
            severity: 'high',
        });
    }

    // All good
    if (alerts.length === 0) {
        alerts.push({
            id: 'all_good',
            icon: CheckCircle2,
            color: '#10b981',
            light: 'rgba(16,185,129,0.1)',
            title: 'All Clear — No Pending Actions',
            body: 'No immediate actions required. The admissions pipeline is running smoothly.',
            action: null,
            severity: 'ok',
        });
    }

    return alerts;
};

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2, ok: 3 };

const ActionAlerts = ({ stats }) => {
    const navigate = useNavigate();
    const alerts = useMemo(() => {
        if (!stats) return [];
        const raw = deriveAlerts(stats.metrics, stats.status_distribution);
        return raw.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
    }, [stats]);

    return (
        <div
            style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color-light)',
                boxShadow: 'var(--shadow-card)',
            }}
            className="border rounded-[28px] p-6 sm:p-8 flex flex-col gap-6"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-1.5 h-5 rounded-full"
                            style={{ background: '#f59e0b' }}
                        />
                        <h3
                            className="text-lg font-black tracking-tight"
                            style={{ color: 'var(--text-main)' }}
                        >
                            Action Centre
                        </h3>
                    </div>
                    <p
                        className="text-[10px] font-bold uppercase tracking-[0.3em] ml-3.5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Items requiring your attention
                    </p>
                </div>
                {alerts.some(a => a.severity === 'high') && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Urgent</span>
                    </div>
                )}
            </div>

            {/* Alert cards */}
            <div className="flex flex-col gap-3">
                {alerts.map(alert => {
                    const Icon = alert.icon;
                    return (
                        <div
                            key={alert.id}
                            className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            style={{
                                background: alert.light,
                                borderColor: `${alert.color}22`,
                            }}
                        >
                            <div
                                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                                style={{ background: `${alert.color}20`, color: alert.color }}
                            >
                                <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-[11px] font-black leading-snug mb-1"
                                    style={{ color: 'var(--text-main)' }}
                                >
                                    {alert.title}
                                </p>
                                <p
                                    className="text-[10px] leading-relaxed font-medium"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {alert.body}
                                </p>
                            </div>
                            {alert.action && (
                                <button
                                    onClick={() => navigate(alert.path)}
                                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:scale-105"
                                    style={{ background: alert.color, color: '#fff' }}
                                >
                                    {alert.action}
                                    <ArrowUpRight size={10} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActionAlerts;
