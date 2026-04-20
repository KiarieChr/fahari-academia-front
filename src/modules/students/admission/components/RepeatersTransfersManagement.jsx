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
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                        Repeaters & Transfers
                    </h2>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <Info size={12} className="text-indigo-400" />
                        Track students repeating classes and transfer movements
                    </p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                {tabConfig.map(tab => {
                    const isActive = subTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-[0.8rem] font-medium transition-all duration-150
                                ${isActive
                                    ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                }
                            `}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                            <span className={`
                                ml-0.5 px-1.5 py-0.5 rounded-md text-[0.65rem] font-bold tabular-nums
                                ${isActive
                                    ? `bg-${tab.color}-50 text-${tab.color}-600`
                                    : 'bg-gray-100 text-gray-400'
                                }
                            `}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by student name or class..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/50
                               focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-indigo-400" />
                </div>
            ) : (
                <>
                    {/* ── Repeaters Tab ───────────────────────────── */}
                    {subTab === 'repeaters' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                            {filteredRepeaters.length === 0 ? (
                                <EmptyState
                                    icon={Repeat}
                                    title="No repeaters found"
                                    description="Students marked to repeat a class will appear here"
                                />
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/60">
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Repeating Class</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Academic Year</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Term</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredRepeaters.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">
                                                            {(r.student_name || '?')[0]}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800">{r.student_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen size={13} className="text-gray-400" />
                                                        <span className="text-sm text-gray-700 font-medium">{r.grade_name}</span>
                                                        {r.stream_name && <span className="text-xs text-gray-400">({r.stream_name})</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{r.academic_year_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{r.term_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{r.remarks || '—'}</td>
                                                <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                                                <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">{r.enrollment_date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── Transfers Out Tab ───────────────────────── */}
                    {subTab === 'transfers_out' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                            {filteredTransfersOut.length === 0 ? (
                                <EmptyState
                                    icon={ArrowUpRight}
                                    title="No outgoing transfers"
                                    description="Students who transferred out of the school will appear here"
                                />
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/60">
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Last Class</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Academic Year</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Exit Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredTransfersOut.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold">
                                                            {(t.student_name || '?')[0]}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800">{t.student_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen size={13} className="text-gray-400" />
                                                        <span className="text-sm text-gray-700 font-medium">{t.grade_name}</span>
                                                        {t.stream_name && <span className="text-xs text-gray-400">({t.stream_name})</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.academic_year_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-[200px] truncate">{t.remarks || '—'}</td>
                                                <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                                                <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">{t.exit_date || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* ── Transfers In Tab ────────────────────────── */}
                    {subTab === 'transfers_in' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
                            {filteredTransfersIn.length === 0 ? (
                                <EmptyState
                                    icon={ArrowDownLeft}
                                    title="No incoming transfers"
                                    description="Students who transferred into the school will appear here"
                                />
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/60">
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Placed In</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Academic Year</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Term</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-3.5 text-left text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Enrollment Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredTransfersIn.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">
                                                            {(t.student_name || '?')[0]}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800">{t.student_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <BookOpen size={13} className="text-gray-400" />
                                                        <span className="text-sm text-gray-700 font-medium">{t.grade_name}</span>
                                                        {t.stream_name && <span className="text-xs text-gray-400">({t.stream_name})</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.academic_year_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{t.term_name}</td>
                                                <td className="px-6 py-4"><StatusBadge status={t.status} type="transfer_in" /></td>
                                                <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">{t.enrollment_date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RepeatersTransfersManagement;
