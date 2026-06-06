import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, User } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';

const timeAgo = (isoString) => {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60)   return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const ActivityFeed = ({ filters = {} }) => {
    const [items, setItems]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const fetchActivity = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentManagementService.getRecentActivity({ ...filters, limit: 12 });
            setItems(data.results || []);
        } catch {
            setError('Unable to load recent activity.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchActivity(); }, [JSON.stringify(filters)]);

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
                        <div className="w-1.5 h-5 rounded-full" style={{ background: '#3b82f6' }} />
                        <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                            Recent Activity
                        </h3>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] ml-3.5" style={{ color: 'var(--text-muted)' }}>
                        Live admission timeline
                    </p>
                </div>
                <button
                    onClick={fetchActivity}
                    disabled={loading}
                    className="p-2 rounded-xl transition-all hover:scale-110 disabled:opacity-40"
                    style={{ background: 'var(--bg-light)', color: 'var(--text-muted)' }}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Feed */}
            <div className="flex flex-col">
                {loading && (
                    <div className="flex flex-col gap-3 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'var(--bg-light)' }} />
                                <div className="flex-1">
                                    <div className="h-3 rounded-lg mb-1.5" style={{ background: 'var(--bg-light)', width: '60%' }} />
                                    <div className="h-2 rounded-lg" style={{ background: 'var(--bg-light)', width: '40%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-8">
                        <Activity size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{error}</p>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-8">
                        <Activity size={24} className="mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>No recent activity</p>
                    </div>
                )}

                {!loading && !error && items.map((item, idx) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-3 py-3 relative"
                        style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border-color-light)' : 'none' }}
                    >
                        {/* Avatar */}
                        <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                            style={{ background: item.status_color }}
                        >
                            {item.name?.charAt(0)?.toUpperCase() || <User size={12} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <span className="text-[11px] font-black" style={{ color: 'var(--text-main)' }}>
                                        {item.name}
                                    </span>
                                    {item.grade && (
                                        <span className="text-[10px] font-medium ml-1" style={{ color: 'var(--text-muted)' }}>
                                            · {item.grade}
                                        </span>
                                    )}
                                </div>
                                <span className="flex-shrink-0 text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                    {timeAgo(item.updated_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider"
                                    style={{ background: `${item.status_color}18`, color: item.status_color }}
                                >
                                    {item.status_label}
                                </span>
                                {item.campus && (
                                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        {item.campus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;
