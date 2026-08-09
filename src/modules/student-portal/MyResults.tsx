import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2, TrendingUp, BookOpen, ChevronDown, ChevronUp, Trophy, BarChart3 } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const gradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    const g = grade.toUpperCase();
    if (g.startsWith('A') || g === 'EE') return 'text-green-600';
    if (g.startsWith('B') || g === 'ME') return 'text-blue-600';
    if (g.startsWith('C') || g === 'AE') return 'text-amber-600';
    if (g.startsWith('D') || g === 'BE') return 'text-orange-600';
    return 'text-red-600';
};

const TermResultCard = ({ tr }) => {
    const [expanded, setExpanded] = useState(false);
    const subjects = tr.subject_results || [];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">
                            {tr.term_name} — {tr.year_name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {tr.grade_name}{tr.stream_name ? ` (${tr.stream_name})` : ''} &middot; {tr.subjects_taken} subjects
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Overall grade + rank */}
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${gradeColor(tr.overall_grade)}`}>
                                    {tr.overall_grade || '—'}
                                </span>
                                <span className="text-sm font-bold text-gray-900">
                                    {tr.average_mark ? `${Number(tr.average_mark).toFixed(1)}%` : '—'}
                                </span>
                            </div>
                            {tr.class_rank && (
                                <p className="text-xs text-gray-500">
                                    Rank {tr.class_rank}/{tr.total_in_class || '?'}
                                </p>
                            )}
                        </div>
                        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                </div>
            </div>

            {/* Expanded: subject results */}
            {expanded && (
                <div className="border-t border-gray-100">
                    {/* Ranking summary */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50/50">
                        {[
                            { label: 'Class Rank', value: tr.class_rank, total: tr.total_in_class, icon: Trophy, color: 'text-amber-600' },
                            { label: 'Stream Rank', value: tr.stream_rank, total: tr.total_in_stream, icon: BarChart3, color: 'text-blue-600' },
                            { label: 'Grade Rank', value: tr.grade_rank, total: tr.total_in_grade, icon: TrendingUp, color: 'text-green-600' },
                        ].map(r => (
                            <div key={r.label} className="bg-white rounded-lg border border-gray-100 p-3 text-center">
                                <r.icon size={16} className={`${r.color} mx-auto mb-1`} />
                                <p className="text-lg font-bold text-gray-900">
                                    {r.value ? `${r.value}/${r.total || '?'}` : '—'}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold">{r.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Subject table */}
                    {subjects.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="text-left px-5 py-2.5 font-medium">Subject</th>
                                        <th className="text-center px-3 py-2.5 font-medium">Mark</th>
                                        <th className="text-center px-3 py-2.5 font-medium">Grade</th>
                                        <th className="text-center px-3 py-2.5 font-medium">Points</th>
                                        <th className="text-center px-3 py-2.5 font-medium">Rank</th>
                                        <th className="text-left px-3 py-2.5 font-medium">Remark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {subjects.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50/50">
                                            <td className="px-5 py-2.5 font-medium text-gray-800">{s.subject_name}</td>
                                            <td className="text-center px-3 py-2.5 font-bold text-gray-900">
                                                {s.weighted_mark != null ? Number(s.weighted_mark).toFixed(1) : '—'}
                                            </td>
                                            <td className={`text-center px-3 py-2.5 font-bold ${gradeColor(s.grade)}`}>
                                                {s.grade || '—'}
                                            </td>
                                            <td className="text-center px-3 py-2.5 text-gray-600">
                                                {s.points != null ? Number(s.points) : '—'}
                                            </td>
                                            <td className="text-center px-3 py-2.5 text-gray-500 text-xs">
                                                {s.subject_rank ? `${s.subject_rank}/${s.total_in_subject || '?'}` : '—'}
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500 text-xs">{s.teacher_remark || ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Teacher/Principal remarks */}
                    {(tr.class_teacher_remark || tr.principal_remark) && (
                        <div className="p-4 bg-indigo-50/50 border-t border-gray-100 space-y-2 text-sm">
                            {tr.class_teacher_remark && (
                                <p className="text-gray-700">
                                    <span className="font-semibold text-gray-900">Class Teacher:</span> {tr.class_teacher_remark}
                                </p>
                            )}
                            {tr.principal_remark && (
                                <p className="text-gray-700">
                                    <span className="font-semibold text-gray-900">Principal:</span> {tr.principal_remark}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MyResults = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('term'); // 'term' or 'legacy'

    useEffect(() => {
        const load = async () => {
            try {
                const res = await portalService.getResults();
                setData(res);
                // If no term results, fall back to legacy tab
                if (!(res?.term_results?.length > 0) && res?.courses?.length > 0) {
                    setActiveTab('legacy');
                }
            } catch {
                toast.error('Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <StudentLayout title="My Results">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            </StudentLayout>
        );
    }

    const termResults = data?.term_results || [];
    const courses = data?.courses || [];
    const results = data?.results || [];
    const latestResult = results[0];
    const latestTerm = termResults[0];

    const hasBothSections = termResults.length > 0 && courses.length > 0;

    return (
        <StudentLayout title="My Results">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-1">
                {/* Performance Summary */}
                {latestTerm ? (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
                        <p className="text-purple-200 text-sm">Latest Term Performance</p>
                        <div className="flex items-baseline gap-6 mt-2">
                            <div>
                                <p className="text-4xl font-bold">
                                    {Number(latestTerm.average_mark).toFixed(1)}%
                                </p>
                                <p className="text-purple-200 text-xs mt-0.5">Average</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{latestTerm.overall_grade || '—'}</p>
                                <p className="text-purple-200 text-xs mt-0.5">Grade</p>
                            </div>
                            {latestTerm.class_rank && (
                                <div>
                                    <p className="text-3xl font-bold">
                                        #{latestTerm.class_rank}
                                    </p>
                                    <p className="text-purple-200 text-xs mt-0.5">
                                        of {latestTerm.total_in_class || '?'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : latestResult ? (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
                        <p className="text-purple-200 text-sm">Current Performance</p>
                        <div className="flex items-baseline gap-6 mt-2">
                            <div>
                                <p className="text-4xl font-bold">{latestResult.gpa || '—'}</p>
                                <p className="text-purple-200 text-xs mt-0.5">GPA</p>
                            </div>
                            {latestResult.cgpa && (
                                <div>
                                    <p className="text-3xl font-bold">{latestResult.cgpa}</p>
                                    <p className="text-purple-200 text-xs mt-0.5">CGPA</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Tab switcher (only if both data sources have content) */}
                {hasBothSections && (
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('term')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'term' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Term Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('legacy')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                activeTab === 'legacy' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Subject Scores
                        </button>
                    </div>
                )}

                {/* Term Results */}
                {(activeTab === 'term' || !hasBothSections) && termResults.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Award size={20} className="text-indigo-500" />
                            Term Reports
                            <span className="ml-auto text-xs text-gray-400 font-normal">{termResults.length} terms</span>
                        </h3>
                        <div className="space-y-3">
                            {termResults.map(tr => <TermResultCard key={tr.id} tr={tr} />)}
                        </div>
                    </div>
                )}

                {/* Legacy Subject Results (TakenCourse) */}
                {(activeTab === 'legacy' || (!hasBothSections && termResults.length === 0)) && courses.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen size={18} className="text-indigo-500" />
                                Subject Results
                                <span className="ml-auto text-xs text-gray-400 font-normal">{courses.length} subjects</span>
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="text-left px-6 py-3 font-medium">Subject</th>
                                        <th className="text-center px-3 py-3 font-medium">Assign.</th>
                                        <th className="text-center px-3 py-3 font-medium">Mid</th>
                                        <th className="text-center px-3 py-3 font-medium">Quiz</th>
                                        <th className="text-center px-3 py-3 font-medium">Final</th>
                                        <th className="text-center px-3 py-3 font-medium">Total</th>
                                        <th className="text-center px-3 py-3 font-medium">Grade</th>
                                        <th className="text-left px-3 py-3 font-medium">Remark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-3 font-medium text-gray-800">{c.subject_name}</td>
                                            <td className="text-center px-3 py-3 text-gray-600">{c.assignment ?? '—'}</td>
                                            <td className="text-center px-3 py-3 text-gray-600">{c.mid_exam ?? '—'}</td>
                                            <td className="text-center px-3 py-3 text-gray-600">{c.quiz ?? '—'}</td>
                                            <td className="text-center px-3 py-3 text-gray-600">{c.final_exam ?? '—'}</td>
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

                {/* Empty state */}
                {termResults.length === 0 && courses.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                        <Award size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No results available</p>
                        <p className="text-sm mt-1">Your exam results will appear here once published.</p>
                    </div>
                )}
            </motion.div>
        </StudentLayout>
    );
};

export default MyResults;
