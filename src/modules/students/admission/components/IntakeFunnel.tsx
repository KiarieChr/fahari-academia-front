import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2, Clock, Users, UserCheck, BookOpen } from 'lucide-react';

const STAGES = [
    { key: 'inquired',  label: 'Inquired',    icon: Users,       color: '#6366f1', light: 'rgba(99,102,241,0.08)' },
    { key: 'applied',   label: 'Applied',     icon: BookOpen,    color: '#3b82f6', light: 'rgba(59,130,246,0.08)' },
    { key: 'reviewing', label: 'Under Review', icon: Clock,       color: '#f59e0b', light: 'rgba(245,158,11,0.08)' },
    { key: 'admitted',  label: 'Admitted',    icon: UserCheck,   color: '#10b981', light: 'rgba(16,185,129,0.08)' },
    { key: 'enrolled',  label: 'Enrolled',    icon: CheckCircle2,color: '#059669', light: 'rgba(5,150,105,0.08)' },
];

/**
 * Derives funnel counts from dashboard_stats metrics + status_distribution.
 * - inquired ≈ total_apps (everyone who applied is at least "inquired")
 * - applied  ≈ total_apps
 * - reviewing ≈ pending + interview (from status_distribution)
 * - admitted ≈ accepted count
 * - enrolled  ≈ admitted (admitted record exists → enrolled)
 */
const deriveFunnel = (metrics, statusDist) => {
    const total   = metrics.total_apps   || 0;
    const admitted= metrics.admitted     || 0;
    const pending = metrics.pending      || 0;

    const interviewCount = statusDist?.find(s => s.name === 'Interview')?.value || 0;
    const reviewing = pending + interviewCount;

    return [total, total, reviewing, admitted, admitted];
};

const IntakeFunnel = ({ stats }) => {
    const counts = useMemo(() => {
        if (!stats) return [0, 0, 0, 0, 0];
        return deriveFunnel(stats.metrics, stats.status_distribution);
    }, [stats]);

    const maxCount = Math.max(...counts, 1);

    return (
        <div
            style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color-light)',
                boxShadow: 'var(--shadow-card)',
            }}
            className="border rounded-[28px] p-6 sm:p-8"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-1.5 h-5 rounded-full"
                            style={{ background: 'var(--primary-color)' }}
                        />
                        <h3
                            className="text-lg font-black tracking-tight"
                            style={{ color: 'var(--text-main)' }}
                        >
                            Admission Pipeline
                        </h3>
                    </div>
                    <p
                        className="text-[10px] font-bold uppercase tracking-[0.3em] ml-3.5"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Funnel · Inquiry to Enrollment
                    </p>
                </div>
            </div>

            {/* Funnel Stages */}
            <div className="flex items-stretch gap-1 sm:gap-2">
                {STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    const count = counts[idx];
                    const barH = maxCount > 0 ? Math.max(16, (count / maxCount) * 100) : 16;
                    const convRate = idx > 0 && counts[idx - 1] > 0
                        ? ((count / counts[idx - 1]) * 100).toFixed(0)
                        : 100;

                    return (
                        <React.Fragment key={stage.key}>
                            {/* Stage card */}
                            <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                                {/* Bar */}
                                <div
                                    className="w-full flex items-end justify-center rounded-xl overflow-hidden"
                                    style={{ height: 80, background: 'var(--bg-light)' }}
                                >
                                    <div
                                        className="w-full rounded-t-xl transition-all duration-700 ease-out"
                                        style={{
                                            height: `${barH}%`,
                                            background: `linear-gradient(to top, ${stage.color}, ${stage.color}88)`,
                                            boxShadow: `0 -4px 12px ${stage.color}22`,
                                        }}
                                    />
                                </div>

                                {/* Icon + Label */}
                                <div className="flex flex-col items-center gap-1.5 w-full">
                                    <div
                                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        style={{ background: stage.light, color: stage.color }}
                                    >
                                        <Icon size={14} />
                                    </div>
                                    <span
                                        className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center leading-tight"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {stage.label}
                                    </span>
                                    <span
                                        className="text-base sm:text-xl font-black tabular-nums"
                                        style={{ color: 'var(--text-main)' }}
                                    >
                                        {count.toLocaleString()}
                                    </span>
                                    {/* Conversion rate from previous stage */}
                                    {idx > 0 && (
                                        <span
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{ background: stage.light, color: stage.color }}
                                        >
                                            {convRate}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Arrow connector */}
                            {idx < STAGES.length - 1 && (
                                <div className="flex items-center pt-10 flex-shrink-0">
                                    <ArrowRight
                                        size={14}
                                        style={{ color: 'var(--border-color-light)' }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default IntakeFunnel;
