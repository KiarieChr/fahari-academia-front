import React, { useEffect, useState } from 'react';
import { CalendarDays, RefreshCw, Clock } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';

const URGENCY = {
    ok:       { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Open' },
    warning:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Soon' },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Urgent' },
    overdue:  { color: '#6b7280', bg: 'rgba(107,114,128,0.1)',label: 'Started' },
};

const DeadlineCalendar = () => {
    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentManagementService.getIntakeDeadlines();
            setItems(data.results || []);
        } catch {
            setError('Unable to load intake schedule.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const daysLabel = (days) => {
        if (days < 0)  return `Started ${Math.abs(days)}d ago`;
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `In ${days} days`;
    };

    return (
        <div
            style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color-light)',
                boxShadow: 'var(--shadow-card)',
            }}
            className="border rounded-[28px] p-6 sm:p-8 flex flex-col gap-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-5 rounded-full" style={{ background: '#f59e0b' }} />
                        <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                            Intake Schedule
                        </h3>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] ml-3.5" style={{ color: 'var(--text-muted)' }}>
                        Open intakes & timeline
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="p-2 rounded-xl transition-all hover:scale-110 disabled:opacity-40"
                    style={{ background: 'var(--bg-light)', color: 'var(--text-muted)' }}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
                {loading && (
                    <div className="animate-pulse space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 rounded-2xl" style={{ background: 'var(--bg-light)' }} />
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-6">
                        <CalendarDays size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{error}</p>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-6">
                        <CalendarDays size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>No open intakes at the moment</p>
                    </div>
                )}

                {!loading && !error && items.map(item => {
                    const urgency = URGENCY[item.urgency] || URGENCY.ok;
                    return (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
                            style={{ background: urgency.bg, borderColor: `${urgency.color}20` }}
                        >
                            {/* Date badge */}
                            <div
                                className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl"
                                style={{ background: urgency.color, color: '#fff' }}
                            >
                                <span className="text-[8px] font-black uppercase">
                                    {new Date(item.start_date).toLocaleDateString('en-KE', { month: 'short' })}
                                </span>
                                <span className="text-lg font-black leading-none">
                                    {new Date(item.start_date).getDate()}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black truncate" style={{ color: 'var(--text-main)' }}>
                                    {item.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {item.entry_grade && (
                                        <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
                                            {item.entry_grade}
                                        </span>
                                    )}
                                    {item.academic_year && (
                                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                            · {item.academic_year}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Countdown badge */}
                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <span
                                    className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                                    style={{ background: `${urgency.color}20`, color: urgency.color }}
                                >
                                    {urgency.label}
                                </span>
                                <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                    <Clock size={9} />
                                    <span className="text-[9px] font-bold">{daysLabel(item.days_from_now)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeadlineCalendar;
