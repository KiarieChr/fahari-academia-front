import React, { useState, useEffect, useCallback } from 'react';
import {
    Repeat, ArrowRightLeft, Search, Loader2, AlertCircle,
    RefreshCw, User, Calendar, BookOpen, ArrowUpRight, ArrowDownLeft,
    ChevronRight, Info, Filter
} from 'lucide-react';
import studentSettingsService from '../../../../services/studentSettingsService';
import { toast } from 'react-toastify';

const RepeatersTransfersManagement = () => {
    const [subTab, setSubTab] = useState('repeaters');
    const [repeaters, setRepeaters] = useState([]);
    const [transfersOut, setTransfersOut] = useState([]);
    const [transfersIn, setTransfersIn] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [repeatRes, transferOutRes, transferInRes] = await Promise.allSettled([
                studentSettingsService.getEnrollments({ enrollment_type: 'repeat' }),
                studentSettingsService.getEnrollments({ status: 'transferred_out' }),
                studentSettingsService.getEnrollments({ enrollment_type: 'transfer_in' }),
            ]);

            if (repeatRes.status === 'fulfilled') {
                const data = repeatRes.value?.data || repeatRes.value;
                setRepeaters(Array.isArray(data) ? data : data?.results || []);
            }
            if (transferOutRes.status === 'fulfilled') {
                const data = transferOutRes.value?.data || transferOutRes.value;
                setTransfersOut(Array.isArray(data) ? data : data?.results || []);
            }
            if (transferInRes.status === 'fulfilled') {
                const data = transferInRes.value?.data || transferInRes.value;
                setTransfersIn(Array.isArray(data) ? data : data?.results || []);
            }
        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredRepeaters = repeaters.filter(r =>
        (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.grade_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredTransfersOut = transfersOut.filter(t =>
        (t.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.grade_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredTransfersIn = transfersIn.filter(t =>
        (t.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.grade_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const StatusBadge = ({ status, type }) => {
        const config = {
            active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Active' },
            repeated: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Repeated' },
            transferred_out: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Transferred Out' },
            completed: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Completed' },
            transfer_in: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Transfer In' },
        };
        const key = type || status;
        const c = config[key] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: key };
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
                {c.label}
            </span>
        );
    };

    const EmptyState = ({ icon: Icon, title, description }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-2xl bg-gray-50 mb-4">
                <Icon size={28} className="text-gray-300" />
            </div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">{title}</h4>
            <p className="text-xs text-gray-400 max-w-xs">{description}</p>
        </div>
    );

    const tabConfig = [
        { id: 'repeaters', label: 'Repeaters', icon: Repeat, count: repeaters.length, color: 'orange' },
        { id: 'transfers_out', label: 'Transfers Out', icon: ArrowUpRight, count: transfersOut.length, color: 'red' },
        { id: 'transfers_in', label: 'Transfers In', icon: ArrowDownLeft, count: transfersIn.length, color: 'purple' },
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-2xl bg-red-50 mb-4">
                    <AlertCircle size={28} className="text-red-400" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Failed to load data</h4>
                <p className="text-xs text-gray-400 mb-4">{error}</p>
                <button onClick={fetchData} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    <RefreshCw size={13} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                        Repeaters & Transfers
                    </h2>
                    <p className="text-xs flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-secondary)' }}>
                        <Info size={12} style={{ color: 'var(--primary-color)' }} />
                        Track students repeating classes and transfer movements
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider border px-4 py-2 rounded-xl transition-all disabled:opacity-50 w-full sm:w-auto cursor-pointer"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} style={{ color: 'var(--primary-color)' }} />
                    Refresh
                </button>
            </div>

            {/* Sub-tabs & Search row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Sub-tabs */}
                <div 
                    style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                    className="flex items-center gap-1 p-1 rounded-xl border w-full md:w-auto"
                >
                    {tabConfig.map(tab => {
                        const isActive = subTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setSubTab(tab.id)}
                                style={{
                                    background: isActive ? 'var(--card-bg)' : 'transparent',
                                    borderColor: isActive ? 'var(--border-color-light)' : 'transparent',
                                    color: isActive ? 'var(--text-main)' : 'var(--text-secondary)'
                                }}
                                className={`
                                    flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-[0.8rem] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer
                                    ${isActive ? 'shadow-sm' : ''}
                                `}
                            >
                                <tab.icon size={14} style={{ color: isActive ? 'var(--primary-color)' : 'inherit' }} />
                                <span className="truncate">{tab.label}</span>
                                <span 
                                    style={isActive ? {
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary-color)'
                                    } : {
                                        background: 'var(--bg-light)',
                                        color: 'var(--text-muted)'
                                    }}
                                    className="ml-0.5 px-1.5 py-0.5 rounded-md text-[0.65rem] font-black tabular-nums transition-all"
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-full md:max-w-xs group">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" style={{ color: 'var(--primary-color)' }} />
                    <input
                        type="text"
                        placeholder="Search by student name or class..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                        className="w-full pl-9 pr-4 py-2.5 text-xs font-bold border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all duration-300"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary-color)' }} />
                </div>
            ) : (
                <>
                    {/* ── Repeaters Tab ───────────────────────────── */}
                    {subTab === 'repeaters' && (
                        <div 
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                            className="rounded-[24px] border overflow-hidden"
                        >
                            {filteredRepeaters.length === 0 ? (
                                <EmptyState
                                    icon={Repeat}
                                    title="No repeaters found"
                                    description="Students marked to repeat a class will appear here"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                        <thead style={{ background: 'var(--bg-light)' }}>
                                            <tr>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Student</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Repeating Class</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Academic Year</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Term</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Reason</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Status</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                            {filteredRepeaters.map((r) => (
                                                <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                                                            >
                                                                {(r.student_name || '?')[0]}
                                                            </div>
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{r.student_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <BookOpen size={13} style={{ color: 'var(--primary-color)' }} />
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{r.grade_name}</span>
                                                            {r.stream_name && <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>({r.stream_name})</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{r.academic_year_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{r.term_name}</td>
                                                    <td className="px-6 py-4 text-xs font-bold max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>{r.remarks || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={r.status} /></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>{r.enrollment_date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Transfers Out Tab ───────────────────────── */}
                    {subTab === 'transfers_out' && (
                        <div 
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                            className="rounded-[24px] border overflow-hidden"
                        >
                            {filteredTransfersOut.length === 0 ? (
                                <EmptyState
                                    icon={ArrowUpRight}
                                    title="No outgoing transfers"
                                    description="Students who transferred out of the school will appear here"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                        <thead style={{ background: 'var(--bg-light)' }}>
                                            <tr>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Student</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Last Class</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Academic Year</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Reason</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Status</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Exit Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                            {filteredTransfersOut.map((t) => (
                                                <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                                                            >
                                                                {(t.student_name || '?')[0]}
                                                            </div>
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{t.student_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <BookOpen size={13} style={{ color: 'var(--primary-color)' }} />
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{t.grade_name}</span>
                                                            {t.stream_name && <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>({t.stream_name})</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t.academic_year_name}</td>
                                                    <td className="px-6 py-4 text-xs font-bold max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>{t.remarks || '—'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={t.status} /></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>{t.exit_date || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Transfers In Tab ────────────────────────── */}
                    {subTab === 'transfers_in' && (
                        <div 
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                            className="rounded-[24px] border overflow-hidden"
                        >
                            {filteredTransfersIn.length === 0 ? (
                                <EmptyState
                                    icon={ArrowDownLeft}
                                    title="No incoming transfers"
                                    description="Students who transferred into the school will appear here"
                                />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                        <thead style={{ background: 'var(--bg-light)' }}>
                                            <tr>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Student</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Placed In</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Academic Year</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Term</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Status</th>
                                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Enrollment Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                            {filteredTransfersIn.map((t) => (
                                                <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black"
                                                            >
                                                                {(t.student_name || '?')[0]}
                                                            </div>
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{t.student_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            <BookOpen size={13} style={{ color: 'var(--primary-color)' }} />
                                                            <span className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{t.grade_name}</span>
                                                            {t.stream_name && <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>({t.stream_name})</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t.academic_year_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{t.term_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={t.status} type="transfer_in" /></td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>{t.enrollment_date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RepeatersTransfersManagement;
