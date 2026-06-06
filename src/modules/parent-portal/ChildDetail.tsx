import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import {
    ArrowLeft, CreditCard, Award, CheckCircle2, XCircle, Clock,
    Loader2, FileText, ChevronDown, ChevronUp, BarChart3,
    Trophy, TrendingUp,
} from 'lucide-react';
import ParentLayout from '../../layouts/ParentLayout';
import { portalService } from '../student-portal/portalService';
import { toast } from 'react-toastify';

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const gradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-amber-600';
    return 'text-red-600';
};

const InvoiceRow = ({ inv }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setOpen(!open)}>
                <div>
                    <p className="text-sm font-medium text-gray-800">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-500">{inv.term_name} • {inv.year_name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{fmtCurrency(inv.total_amount)}</span>
                    {inv.balance > 0 && <span className="text-xs text-red-500 font-medium">Bal: {fmtCurrency(inv.balance)}</span>}
                    {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                </div>
            </div>
            {open && inv.items?.length > 0 && (
                <div className="border-t border-gray-100 px-3 py-2 bg-gray-50/50 text-sm">
                    {inv.items.map(i => (
                        <div key={i.id} className="flex justify-between py-1 text-gray-600">
                            <span>{i.name}{i.is_optional ? ' (opt)' : ''}</span>
                            <span className="font-medium">{fmtCurrency(i.amount)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TermResultRow = ({ tr }) => {
    const [open, setOpen] = useState(false);
    const subjects = tr.subject_results || [];
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setOpen(!open)}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-900">{tr.term_name} — {tr.year_name}</p>
                        <p className="text-xs text-gray-500">{tr.grade_name}{tr.stream_name ? ` (${tr.stream_name})` : ''} &middot; {tr.subjects_taken} subjects</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className={`text-lg font-bold ${gradeColor(tr.overall_grade)}`}>{tr.overall_grade || '—'}</span>
                            <span className="ml-2 text-sm font-bold text-gray-700">{tr.average_mark ? `${Number(tr.average_mark).toFixed(1)}%` : ''}</span>
                            {tr.class_rank && <p className="text-xs text-gray-500">Rank {tr.class_rank}/{tr.total_in_class || '?'}</p>}
                        </div>
                        {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                    </div>
                </div>
            </div>
            {open && (
                <div className="border-t border-gray-100">
                    {/* Rankings */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50/50">
                        {[
                            { label: 'Class', value: tr.class_rank, total: tr.total_in_class, icon: Trophy, color: 'text-amber-600' },
                            { label: 'Stream', value: tr.stream_rank, total: tr.total_in_stream, icon: BarChart3, color: 'text-blue-600' },
                            { label: 'Grade', value: tr.grade_rank, total: tr.total_in_grade, icon: TrendingUp, color: 'text-green-600' },
                        ].map(r => (
                            <div key={r.label} className="bg-white rounded-lg border border-gray-100 p-2 text-center">
                                <r.icon size={14} className={`${r.color} mx-auto mb-0.5`} />
                                <p className="text-sm font-bold text-gray-900">{r.value ? `${r.value}/${r.total || '?'}` : '—'}</p>
                                <p className="text-[9px] text-gray-400 uppercase font-semibold">{r.label}</p>
                            </div>
                        ))}
                    </div>
                    {subjects.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="text-left px-4 py-2 font-medium">Subject</th>
                                        <th className="text-center px-2 py-2 font-medium">Mark</th>
                                        <th className="text-center px-2 py-2 font-medium">Grade</th>
                                        <th className="text-center px-2 py-2 font-medium">Rank</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subjects.map(s => (
                                        <tr key={s.id}>
                                            <td className="px-4 py-2 font-medium text-gray-800">{s.subject_name}</td>
                                            <td className="text-center px-2 py-2 font-bold text-gray-900">{s.weighted_mark != null ? Number(s.weighted_mark).toFixed(1) : '—'}</td>
                                            <td className={`text-center px-2 py-2 font-bold ${gradeColor(s.grade)}`}>{s.grade || '—'}</td>
                                            <td className="text-center px-2 py-2 text-gray-500 text-xs">{s.subject_rank ? `${s.subject_rank}/${s.total_in_subject || '?'}` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {(tr.class_teacher_remark || tr.principal_remark) && (
                        <div className="p-3 bg-indigo-50/50 border-t border-gray-100 text-xs space-y-1">
                            {tr.class_teacher_remark && <p><span className="font-semibold">Teacher:</span> {tr.class_teacher_remark}</p>}
                            {tr.principal_remark && <p><span className="font-semibold">Principal:</span> {tr.principal_remark}</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ChildDetail = ({ id }) => {
    const navigate = useNavigate();
    const [child, setChild] = useState(null);
    const [fees, setFees] = useState(null);
    const [results, setResults] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('fees');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [childrenRes, feesRes, resultsRes, attRes] = await Promise.all([
                    portalService.getChildren(),
                    portalService.getChildFees(id),
                    portalService.getChildResults(id),
                    portalService.getChildAttendance(id),
                ]);
                const children = Array.isArray(childrenRes) ? childrenRes : [];
                setChild(children.find(c => String(c.id) === String(id)) || null);
                setFees(feesRes);
                setResults(resultsRes);
                setAttendance(attRes);
            } catch {
                toast.error('Failed to load child details');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) {
        return (
            <ParentLayout title="Child Details">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            </ParentLayout>
        );
    }

    const summary = fees?.summary || {};
    const invoices = fees?.invoices || [];
    const courses = results?.courses || [];
    const termResults = results?.term_results || [];
    const attSummary = attendance?.summary || {};
    const attRecords = attendance?.records || [];

    const tabs = [
        { key: 'fees', label: 'Fees', icon: CreditCard },
        { key: 'results', label: 'Results', icon: Award },
        { key: 'attendance', label: 'Attendance', icon: BarChart3 },
    ];

    return (
        <ParentLayout title={child?.full_name || 'Child Details'}>
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-6 p-1">
                {/* Back + Header */}
                <motion.div variants={itemVariants}>
                    <button onClick={() => navigate('/parent/children')}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3">
                        <ArrowLeft size={16} /> Back to children
                    </button>
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
                            {child?.full_name?.[0] || '?'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{child?.full_name || 'Unknown'}</h2>
                            <p className="text-indigo-200 text-sm">
                                {child?.admission_number} • {child?.current_grade_name || 'N/A'}
                                {child?.current_stream_name ? ` (${child.current_stream_name})` : ''}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div variants={itemVariants} className="flex gap-1.5 bg-gray-100 p-1 rounded-xl w-fit">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeTab === t.key
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            <t.icon size={14} /> {t.label}
                        </button>
                    ))}
                </motion.div>

                {/* Tab Content */}
                {activeTab === 'fees' && (
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Invoiced</p>
                                <p className="text-xl font-bold text-gray-900">{fmtCurrency(summary.total_invoiced)}</p>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Paid</p>
                                <p className="text-xl font-bold text-green-600">{fmtCurrency(summary.total_paid)}</p>
                            </div>
                            <div className={`rounded-xl border p-4 ${summary.total_balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">Balance</p>
                                <p className={`text-xl font-bold ${summary.total_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {fmtCurrency(summary.total_balance)}
                                </p>
                            </div>
                        </div>
                        {invoices.length > 0 ? (
                            <div className="space-y-2">
                                {invoices.map(inv => <InvoiceRow key={inv.id} inv={inv} />)}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                                <FileText size={36} className="mx-auto mb-2 opacity-50" />
                                <p className="font-medium">No invoices</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'results' && (
                    <motion.div variants={itemVariants} className="space-y-4">
                        {/* Term Results (new exam system) */}
                        {termResults.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Award size={18} className="text-indigo-500" /> Term Reports
                                </h4>
                                {termResults.map(tr => (
                                    <TermResultRow key={tr.id} tr={tr} />
                                ))}
                            </div>
                        )}

                        {/* Legacy results */}
                        {courses.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {termResults.length > 0 && (
                                    <div className="px-5 py-3 border-b border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-700">Subject Scores</h4>
                                    </div>
                                )}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="text-left px-5 py-3 font-medium">Subject</th>
                                                <th className="text-center px-3 py-3 font-medium">Total</th>
                                                <th className="text-center px-3 py-3 font-medium">Grade</th>
                                                <th className="text-left px-3 py-3 font-medium">Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {courses.map(c => (
                                                <tr key={c.id} className="hover:bg-gray-50/50">
                                                    <td className="px-5 py-3 font-medium text-gray-800">{c.subject_name}</td>
                                                    <td className="text-center px-3 py-3 font-bold text-gray-900">{c.total ?? '—'}</td>
                                                    <td className={`text-center px-3 py-3 font-bold ${gradeColor(c.grade)}`}>{c.grade || '—'}</td>
                                                    <td className="px-3 py-3 text-gray-500 text-xs">{c.comment || ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {termResults.length === 0 && courses.length === 0 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                                <Award size={36} className="mx-auto mb-2 opacity-50" />
                                <p className="font-medium">No results available</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'attendance' && (
                    <motion.div variants={itemVariants} className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { key: 'present', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                                { key: 'absent', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
                                { key: 'late', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                                { key: 'excused', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50' },
                            ].map(s => (
                                <div key={s.key} className={`${s.bg} rounded-xl border p-3`}>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <s.icon size={14} className={s.color} />
                                        <span className="text-[10px] uppercase font-semibold text-gray-500">{s.key}</span>
                                    </div>
                                    <p className={`text-xl font-bold ${s.color}`}>{attSummary[s.key] ?? 0}</p>
                                </div>
                            ))}
                        </div>
                        <div className={`rounded-xl p-4 border ${
                            (attSummary.attendance_rate || 0) >= 80 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                        }`}>
                            <p className="text-sm font-medium text-gray-700">
                                Attendance Rate: <span className="font-bold">{attSummary.attendance_rate ?? 0}%</span>
                            </p>
                        </div>
                        {attRecords.length > 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                                {attRecords.map(r => {
                                    const isPresent = r.status === 'present';
                                    const isLate = r.status === 'late';
                                    return (
                                        <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                isPresent ? 'bg-green-50' : isLate ? 'bg-amber-50' : 'bg-red-50'
                                            }`}>
                                                {isPresent ? <CheckCircle2 size={14} className="text-green-600" /> :
                                                 isLate ? <Clock size={14} className="text-amber-600" /> :
                                                 <XCircle size={14} className="text-red-600" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800">{r.subject_name || 'Lesson'}</p>
                                                <p className="text-xs text-gray-400">{r.date}</p>
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 capitalize">{r.status}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
                                <BarChart3 size={36} className="mx-auto mb-2 opacity-50" />
                                <p className="font-medium">No attendance records</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </ParentLayout>
    );
};

export default ChildDetail;
