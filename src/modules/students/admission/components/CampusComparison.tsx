import React, { useEffect, useState } from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';

const CampusComparison = ({ filters = {} }) => {
    const [rows, setRows]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentManagementService.getCampusBreakdown(filters);
            setRows(data.results || []);
        } catch {
            setError('Unable to load campus data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [JSON.stringify(filters)]);

    // Don't render if single-campus or no data
    if (!loading && !error && rows.length <= 1) return null;

    const maxTotal = Math.max(...rows.map(r => r.total), 1);

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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-5 rounded-full" style={{ background: '#7c3aed' }} />
                        <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                            Campus Comparison
                        </h3>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] ml-3.5" style={{ color: 'var(--text-muted)' }}>
                        Applications & yield per campus
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

            {loading && (
                <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 rounded-2xl" style={{ background: 'var(--bg-light)' }} />
                    ))}
                </div>
            )}

            {!loading && error && (
                <p className="text-center text-[11px] py-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
            )}

            {!loading && !error && (
                <div className="flex flex-col gap-3">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4">
                        {['Campus', 'Applied', 'Admitted', 'Pending', 'Yield'].map(h => (
                            <span key={h} className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {rows.map((row, idx) => {
                        const barW = (row.total / maxTotal) * 100;
                        const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
                        const color = colors[idx % colors.length];

                        return (
                            <div
                                key={row.campus_id}
                                className="relative rounded-2xl overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5"
                                style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color-light)' }}
                            >
                                {/* Progress bar background */}
                                <div
                                    className="absolute inset-0 left-0 top-0 rounded-2xl"
                                    style={{
                                        width: `${barW}%`,
                                        background: `${color}10`,
                                        transition: 'width 0.8s ease-out',
                                    }}
                                />

                                <div className="relative grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center">
                                    {/* Campus name */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Building2 size={12} style={{ color, flexShrink: 0 }} />
                                        <span className="text-[11px] font-black truncate" style={{ color: 'var(--text-main)' }}>
                                            {row.campus}
                                        </span>
                                    </div>

                                    {/* Numbers */}
                                    {[
                                        { val: row.total,    col: 'var(--text-main)' },
                                        { val: row.admitted, col: '#10b981' },
                                        { val: row.pending,  col: '#f59e0b' },
                                        { val: `${row.yield_pct}%`, col },
                                    ].map((cell, ci) => (
                                        <span
                                            key={ci}
                                            className="text-[11px] font-black tabular-nums text-right"
                                            style={{ color: cell.col }}
                                        >
                                            {cell.val}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CampusComparison;
