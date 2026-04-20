import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { toast } from 'react-toastify';
import {
    BookOpen, Users, Plus, RefreshCw, Search, Filter,
    ChevronRight, ChevronDown, ArrowRightLeft, UserPlus,
    Calendar, GraduationCap, Eye, X, Check, AlertCircle,
    Loader2, Home, Zap, BarChart3
} from 'lucide-react';
import { inputClass, labelClass } from '../../../components/ui/FormField';
import Modal from '../../../components/common/Modal';
import studentSettingsService from '../../../services/studentSettingsService';

/* ────── Status badge colors ────── */
const STATUS_COLORS = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
    archived: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ENROLLMENT_STATUS_COLORS = {
    active: 'bg-green-50 text-green-700',
    completed: 'bg-blue-50 text-blue-700',
    transferred_out: 'bg-purple-50 text-purple-700',
    dropped: 'bg-red-50 text-red-700',
    expelled: 'bg-red-100 text-red-800',
};

/* ================================================================
   MAIN DASHBOARD
   ================================================================ */
const AcademicSessionsDashboard = () => {
    /* ── state ── */
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ academic_year: '', term: '', grade: '', status: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [options, setOptions] = useState({ academicYears: [], terms: [], grades: [] });

    // selected session for detail panel
    const [selectedSession, setSelectedSession] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

    // modals
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferEnrollment, setTransferEnrollment] = useState(null);

    /* ── fetch filter options ── */
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [years, terms, grades] = await Promise.all([
                    studentSettingsService.getAcademicYears(),
                    studentSettingsService.getTerms(),
                    studentSettingsService.getClasses(),
                ]);
                setOptions({
                    academicYears: (years?.results || years || []),
                    terms: (terms?.results || terms || []),
                    grades: (grades?.results || grades || []),
                });
                // default to current year
                const currentYear = (years?.results || years || []).find(y => y.is_current);
                if (currentYear) {
                    setFilters(f => ({ ...f, academic_year: currentYear.id }));
                }
            } catch (e) {
                console.error('Failed to load filter options', e);
            }
        };
        loadOptions();
    }, []);

    /* ── fetch sessions ── */
    const fetchSessions = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.academic_year) params.academic_year = filters.academic_year;
            if (filters.term) params.term = filters.term;
            if (filters.grade) params.grade = filters.grade;
            if (filters.status) params.status = filters.status;
            const data = await studentSettingsService.getClassSessions(params);
            setSessions(data?.results || data || []);
        } catch (e) {
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    /* ── fetch enrollments for selected session ── */
    const fetchEnrollments = useCallback(async (sessionId) => {
        setEnrollmentsLoading(true);
        try {
            const data = await studentSettingsService.getSessionEnrollments({ session: sessionId });
            setEnrollments(data?.results || data || []);
        } catch (e) {
            toast.error('Failed to load enrollments');
        } finally {
            setEnrollmentsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedSession) fetchEnrollments(selectedSession.id);
        else setEnrollments([]);
    }, [selectedSession, fetchEnrollments]);

    /* ── filter search ── */
    const filteredSessions = sessions.filter(s =>
        !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* ── stats ── */
    const totalSessions = filteredSessions.length;
    const activeSessions = filteredSessions.filter(s => s.status === 'active').length;
    const totalEnrolled = filteredSessions.reduce((sum, s) => sum + (s.enrollment_count || 0), 0);

    /* ── handlers ── */
    const handleGenerate = async (genData) => {
        try {
            const res = await studentSettingsService.generateSessions(genData);
            toast.success(res.message || `Generated ${res.created_count} sessions`);
            setShowGenerateModal(false);
            fetchSessions();
        } catch (e) {
            toast.error(e?.data?.error || 'Failed to generate sessions');
        }
    };

    const handleEnroll = async (enrollData) => {
        try {
            const res = await studentSettingsService.createSessionEnrollment(enrollData);
            toast.success('Student enrolled successfully');
            setShowEnrollModal(false);
            if (selectedSession) fetchEnrollments(selectedSession.id);
            fetchSessions();
        } catch (e) {
            toast.error(e?.data?.error || e?.data?.non_field_errors?.[0] || 'Failed to enroll student');
        }
    };

    const handleTransfer = async (newSessionId) => {
        if (!transferEnrollment) return;
        try {
            await studentSettingsService.transferSessionEnrollment(transferEnrollment.id, { new_session: newSessionId });
            toast.success('Student transferred successfully');
            setShowTransferModal(false);
            setTransferEnrollment(null);
            if (selectedSession) fetchEnrollments(selectedSession.id);
            fetchSessions();
        } catch (e) {
            toast.error(e?.data?.error || 'Transfer failed');
        }
    };

    const handleRemoveEnrollment = async (enrollment) => {
        if (!window.confirm(`Remove ${enrollment.student_name} from this session?`)) return;
        try {
            await studentSettingsService.updateSessionEnrollment(enrollment.id, { is_active: false, status: 'dropped' });
            toast.success('Student removed from session');
            fetchEnrollments(selectedSession.id);
            fetchSessions();
        } catch (e) {
            toast.error('Failed to remove student');
        }
    };

    const handleChangeStream = async (enrollment, newStreamId) => {
        try {
            await studentSettingsService.updateSessionEnrollment(enrollment.id, { stream: newStreamId || null });
            toast.success('Stream updated');
            fetchEnrollments(selectedSession.id);
        } catch (e) {
            toast.error('Failed to update stream');
        }
    };

    /* ── render ── */
    return (
        <DashboardLayout title="Academic Sessions">
            <div className="flex flex-col gap-5 px-1 py-2 pb-16 min-h-screen">

                {/* ── Page Header ── */}
                <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 bg-gradient-to-br from-white via-white to-indigo-50/30 border border-gray-100 rounded-2xl px-4 sm:px-6 lg:px-10 py-5 lg:py-7 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-600 via-indigo-500 to-indigo-400 rounded-l-2xl" />
                    <div className="flex items-start gap-5 relative">
                        <div className="flex-shrink-0 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-[0_6px_20px_rgba(99,102,241,0.3)] ring-4 ring-indigo-50">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Home size={12} /> <ChevronRight size={12} /> <span>Student Management</span> <ChevronRight size={12} /> <span className="text-indigo-600 font-medium">Academic Sessions</span>
                            </div>
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Academic Sessions & Enrollments</h1>
                            <p className="text-sm text-gray-500">Manage class sessions, view enrollments, and enroll students</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
                    >
                        <Zap size={16} /> Auto-Generate Sessions
                    </button>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<Calendar size={20} />} label="Total Sessions" value={totalSessions} color="indigo" />
                    <StatCard icon={<Check size={20} />} label="Active Sessions" value={activeSessions} color="green" />
                    <StatCard icon={<Users size={20} />} label="Total Enrolled" value={totalEnrolled} color="purple" />
                </div>

                {/* ── Filters ── */}
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={`${inputClass} pl-9`}
                            />
                        </div>
                        <select value={filters.academic_year} onChange={e => setFilters(f => ({ ...f, academic_year: e.target.value }))} className={`${inputClass} w-auto min-w-[160px]`}>
                            <option value="">All Years</option>
                            {options.academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                        <select value={filters.term} onChange={e => setFilters(f => ({ ...f, term: e.target.value }))} className={`${inputClass} w-auto min-w-[140px]`}>
                            <option value="">All Terms</option>
                            {options.terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <select value={filters.grade} onChange={e => setFilters(f => ({ ...f, grade: e.target.value }))} className={`${inputClass} w-auto min-w-[140px]`}>
                            <option value="">All Grades</option>
                            {options.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className={`${inputClass} w-auto min-w-[130px]`}>
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                            <option value="archived">Archived</option>
                        </select>
                        <button onClick={fetchSessions} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Refresh">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Main Content: Sessions Table + Detail Panel ── */}
                <div className={`grid gap-5 ${selectedSession ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
                    {/* Sessions Table */}
                    <div className={`bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden ${selectedSession ? 'lg:col-span-2' : ''}`}>
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <BookOpen size={16} className="text-indigo-500" /> Class Sessions
                                <span className="text-xs font-normal text-gray-400">({filteredSessions.length})</span>
                            </h2>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={24} className="animate-spin text-indigo-400" />
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                <Calendar size={40} className="mb-3 text-gray-300" />
                                <p className="text-sm font-medium">No sessions found</p>
                                <p className="text-xs mt-1">Try adjusting filters or auto-generate sessions</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                                {filteredSessions.map(session => (
                                    <SessionRow
                                        key={session.id}
                                        session={session}
                                        isSelected={selectedSession?.id === session.id}
                                        onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {selectedSession && (
                        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <EnrollmentPanel
                                session={selectedSession}
                                enrollments={enrollments}
                                loading={enrollmentsLoading}
                                streams={options.grades.find(g => g.id === selectedSession.grade)?.streams || []}
                                allStreams={options.grades}
                                onClose={() => setSelectedSession(null)}
                                onEnroll={() => setShowEnrollModal(true)}
                                onTransfer={(enrollment) => { setTransferEnrollment(enrollment); setShowTransferModal(true); }}
                                onRemove={handleRemoveEnrollment}
                                onChangeStream={handleChangeStream}
                                onRefresh={() => fetchEnrollments(selectedSession.id)}
                            />
                        </div>
                    )}
                </div>

                {/* ── Modals ── */}
                {showGenerateModal && (
                    <GenerateModal
                        options={options}
                        onGenerate={handleGenerate}
                        onClose={() => setShowGenerateModal(false)}
                    />
                )}
                {showEnrollModal && selectedSession && (
                    <EnrollStudentModal
                        session={selectedSession}
                        onEnroll={handleEnroll}
                        onClose={() => setShowEnrollModal(false)}
                    />
                )}
                {showTransferModal && transferEnrollment && (
                    <TransferModal
                        enrollment={transferEnrollment}
                        sessions={sessions}
                        currentSessionId={selectedSession?.id}
                        onTransfer={handleTransfer}
                        onClose={() => { setShowTransferModal(false); setTransferEnrollment(null); }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

/* ================================================================
   STAT CARD
   ================================================================ */
const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${colors[color] || colors.indigo}`}>{icon}</div>
            <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

/* ================================================================
   SESSION ROW
   ================================================================ */
const SessionRow = ({ session, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-5 py-3.5 flex items-center gap-3 hover:bg-indigo-50/40 transition-colors ${isSelected ? 'bg-indigo-50/60 border-l-2 border-l-indigo-500' : ''}`}
    >
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{session.grade_name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{session.term_name} &middot; {session.academic_year_name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Users size={12} /> {session.enrollment_count || 0}
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[session.status] || STATUS_COLORS.scheduled}`}>
                {session.status}
            </span>
            <ChevronRight size={14} className="text-gray-300" />
        </div>
    </button>
);

/* ================================================================
   ENROLLMENT PANEL (right side detail)
   ================================================================ */
const EnrollmentPanel = ({ session, enrollments, loading, onClose, onEnroll, onTransfer, onRemove, onChangeStream, onRefresh }) => {
    const [streamOptions, setStreamOptions] = useState([]);

    useEffect(() => {
        const loadStreams = async () => {
            try {
                const data = await studentSettingsService.getStreams();
                setStreamOptions(data?.results || data || []);
            } catch (e) { /* ignore */ }
        };
        loadStreams();
    }, []);

    const activeEnrollments = enrollments.filter(e => e.is_active);
    const inactiveEnrollments = enrollments.filter(e => !e.is_active);

    return (
        <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/40 to-white">
                <div>
                    <h2 className="text-sm font-bold text-gray-800">{session.grade_name}</h2>
                    <p className="text-xs text-gray-400">{session.term_name} &middot; {session.academic_year_name} &middot; {session.curriculum_name}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onEnroll} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                        <UserPlus size={13} /> Enroll Student
                    </button>
                    <button onClick={onRefresh} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Refresh">
                        <RefreshCw size={14} />
                    </button>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Enrollments List */}
            <div className="max-h-[520px] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={20} className="animate-spin text-indigo-400" />
                    </div>
                ) : activeEnrollments.length === 0 && inactiveEnrollments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Users size={32} className="mb-2 text-gray-300" />
                        <p className="text-sm">No students enrolled</p>
                        <button onClick={onEnroll} className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
                            + Enroll a student
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Active enrollments */}
                        {activeEnrollments.length > 0 && (
                            <div>
                                <div className="px-5 py-2 bg-green-50/50 border-b border-gray-50">
                                    <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Active ({activeEnrollments.length})</p>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {activeEnrollments.map(enrollment => (
                                        <EnrollmentRow
                                            key={enrollment.id}
                                            enrollment={enrollment}
                                            streams={streamOptions}
                                            onTransfer={onTransfer}
                                            onRemove={onRemove}
                                            onChangeStream={onChangeStream}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Inactive enrollments */}
                        {inactiveEnrollments.length > 0 && (
                            <div>
                                <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 border-t">
                                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inactive ({inactiveEnrollments.length})</p>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {inactiveEnrollments.map(enrollment => (
                                        <EnrollmentRow key={enrollment.id} enrollment={enrollment} streams={streamOptions} inactive />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

/* ================================================================
   ENROLLMENT ROW
   ================================================================ */
const EnrollmentRow = ({ enrollment, streams, onTransfer, onRemove, onChangeStream, inactive }) => {
    const [showStreamSelect, setShowStreamSelect] = useState(false);

    return (
        <div className={`px-5 py-3 flex items-center gap-3 group ${inactive ? 'opacity-50' : 'hover:bg-gray-50/60'}`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                {enrollment.student_name?.[0] || '?'}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{enrollment.student_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-gray-400">{enrollment.admission_number}</span>
                    {enrollment.stream_name && (
                        <span className="text-[11px] text-indigo-500 font-medium">• {enrollment.stream_name}</span>
                    )}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ENROLLMENT_STATUS_COLORS[enrollment.status] || 'bg-gray-100 text-gray-600'}`}>
                        {enrollment.status}
                    </span>
                </div>
            </div>
            {/* Actions */}
            {!inactive && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* Change stream */}
                    {showStreamSelect ? (
                        <select
                            autoFocus
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                            defaultValue={enrollment.stream || ''}
                            onChange={e => { onChangeStream(enrollment, e.target.value); setShowStreamSelect(false); }}
                            onBlur={() => setShowStreamSelect(false)}
                        >
                            <option value="">No Stream</option>
                            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    ) : (
                        <button
                            onClick={() => setShowStreamSelect(true)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Change stream"
                        >
                            <BarChart3 size={13} />
                        </button>
                    )}
                    {/* Transfer */}
                    <button
                        onClick={() => onTransfer(enrollment)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Transfer to another session"
                    >
                        <ArrowRightLeft size={13} />
                    </button>
                    {/* Remove */}
                    <button
                        onClick={() => onRemove(enrollment)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from session"
                    >
                        <X size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};

/* ================================================================
   GENERATE SESSIONS MODAL
   ================================================================ */
const GenerateModal = ({ options, onGenerate, onClose }) => {
    const [mode, setMode] = useState('year'); // 'year' | 'intake'
    const [yearId, setYearId] = useState('');
    const [intakeId, setIntakeId] = useState('');
    const [intakes, setIntakes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        studentSettingsService.getIntakes().then(data => {
            setIntakes(data?.results || data || []);
        }).catch(() => {});
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (mode === 'intake') {
                await onGenerate({ intake_id: intakeId });
            } else {
                await onGenerate({ academic_year: yearId || undefined });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Auto-Generate Sessions"
            icon={Zap}
            accentColor="bg-indigo-500"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={mode === 'intake' ? !intakeId : false}
                        label="Generate"
                    />
                </>
            }
        >
            <div className="space-y-5">
                <div>
                    <label className={labelClass}>Generation Mode</label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setMode('year')}
                            className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${mode === 'year' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <Calendar size={18} className="mb-1" />
                            <div>By Academic Year</div>
                            <p className="text-[11px] font-normal text-gray-400 mt-0.5">Bulk generate for all grades in a year</p>
                        </button>
                        <button
                            onClick={() => setMode('intake')}
                            className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${mode === 'intake' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                            <GraduationCap size={18} className="mb-1" />
                            <div>By Intake Progression</div>
                            <p className="text-[11px] font-normal text-gray-400 mt-0.5">Generate lifecycle sessions for an intake</p>
                        </button>
                    </div>
                </div>

                {mode === 'year' ? (
                    <div>
                        <label className={labelClass}>Academic Year</label>
                        <select value={yearId} onChange={e => setYearId(e.target.value)} className={inputClass}>
                            <option value="">Current Year (default)</option>
                            {options.academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-400 mt-1.5">Leave blank to use current academic year</p>
                    </div>
                ) : (
                    <div>
                        <label className={labelClass}>Intake <span className="text-red-400">*</span></label>
                        <select value={intakeId} onChange={e => setIntakeId(e.target.value)} className={inputClass}>
                            <option value="">Select intake...</option>
                            {intakes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                )}
            </div>
        </Modal>
    );
};

/* ================================================================
   ENROLL STUDENT MODAL
   ================================================================ */
const EnrollStudentModal = ({ session, onEnroll, onClose }) => {
    const [studentSearch, setStudentSearch] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [intakes, setIntakes] = useState([]);
    const [streams, setStreams] = useState([]);
    const [formData, setFormData] = useState({ intake: '', stream: '' });
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Promise.all([
            studentSettingsService.getIntakes(),
            studentSettingsService.getStreams(),
        ]).then(([intakeData, streamData]) => {
            setIntakes(intakeData?.results || intakeData || []);
            setStreams(streamData?.results || streamData || []);
        }).catch(() => {});
    }, []);

    const searchStudents = async () => {
        if (!studentSearch.trim()) return;
        setSearching(true);
        try {
            const { api } = await import('../../../services/api');
            const data = await api.get('/api/accounts/students/', { params: { search: studentSearch } });
            setStudents(data?.results || data || []);
        } catch (e) {
            toast.error('Failed to search students');
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedStudent || !formData.intake) return;
        setLoading(true);
        try {
            await onEnroll({
                student: selectedStudent.id,
                session: session.id,
                intake: formData.intake,
                stream: formData.stream || null,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Enroll Student"
            subtitle={`Into: ${session.grade_name} - ${session.term_name}`}
            icon={UserPlus}
            accentColor="bg-green-500"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!selectedStudent || !formData.intake}
                        label="Enroll"
                        className="!bg-green-600 hover:!bg-green-700"
                    />
                </>
            }
        >
            <div className="space-y-5">
                {/* Student Search */}
                <div>
                    <label className={labelClass}>Find Student</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={studentSearch}
                            onChange={e => setStudentSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchStudents()}
                            placeholder="Search by name or admission number..."
                            className={`${inputClass} flex-1`}
                        />
                        <button
                            onClick={searchStudents}
                            disabled={searching}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
                        >
                            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        </button>
                    </div>
                </div>

                {/* Search Results */}
                {students.length > 0 && (
                    <div className="border border-gray-200 rounded-xl max-h-[200px] overflow-y-auto divide-y divide-gray-50">
                        {students.map(student => (
                            <button
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50/40 transition-colors ${selectedStudent?.id === student.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}
                            >
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[11px] font-bold shrink-0">
                                    {(student.student?.first_name || student.first_name)?.[0] || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                        {student.student ? `${student.student.first_name} ${student.student.last_name}` : `${student.first_name} ${student.last_name}`}
                                    </p>
                                    <p className="text-[11px] text-gray-400">{student.admission_number}</p>
                                </div>
                                {selectedStudent?.id === student.id && <Check size={14} className="text-indigo-600 ml-auto shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}

                {selectedStudent && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <Check size={16} className="text-green-600 shrink-0" />
                        <p className="text-sm text-green-800 font-medium">
                            Selected: {selectedStudent.student ? `${selectedStudent.student.first_name} ${selectedStudent.student.last_name}` : `${selectedStudent.first_name} ${selectedStudent.last_name}`}
                            <span className="text-green-600 ml-1">({selectedStudent.admission_number})</span>
                        </p>
                    </div>
                )}

                {/* Intake */}
                <div>
                    <label className={labelClass}>Intake <span className="text-red-400">*</span></label>
                    <select value={formData.intake} onChange={e => setFormData(f => ({ ...f, intake: e.target.value }))} className={inputClass}>
                        <option value="">Select intake...</option>
                        {intakes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                </div>

                {/* Stream (optional) */}
                <div>
                    <label className={labelClass}>Stream (optional)</label>
                    <select value={formData.stream} onChange={e => setFormData(f => ({ ...f, stream: e.target.value }))} className={inputClass}>
                        <option value="">No stream</option>
                        {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
        </Modal>
    );
};

/* ================================================================
   TRANSFER MODAL
   ================================================================ */
const TransferModal = ({ enrollment, sessions, currentSessionId, onTransfer, onClose }) => {
    const [targetSession, setTargetSession] = useState('');
    const [loading, setLoading] = useState(false);

    const availableSessions = sessions.filter(s => s.id !== currentSessionId && s.status !== 'archived');

    const handleSubmit = async () => {
        if (!targetSession) return;
        setLoading(true);
        try {
            await onTransfer(targetSession);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Transfer Student"
            subtitle={`${enrollment.student_name} (${enrollment.admission_number})`}
            icon={ArrowRightLeft}
            accentColor="bg-purple-500"
            footer={
                <>
                    <Modal.CancelButton onClick={onClose} />
                    <Modal.SubmitButton
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!targetSession}
                        label="Transfer"
                        className="!bg-purple-600 hover:!bg-purple-700"
                    />
                </>
            }
        >
            <div className="space-y-5">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold">This will:</p>
                        <ul className="list-disc ml-4 mt-1 text-xs space-y-0.5">
                            <li>Mark current enrollment as "transferred out"</li>
                            <li>Create a new active enrollment in the target session</li>
                            <li>Trigger auto-billing for the new session (if enabled)</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Current Session</label>
                    <p className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">{enrollment.session_name}</p>
                </div>

                <div>
                    <label className={labelClass}>Transfer To <span className="text-red-400">*</span></label>
                    <select value={targetSession} onChange={e => setTargetSession(e.target.value)} className={inputClass}>
                        <option value="">Select target session...</option>
                        {availableSessions.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.grade_name} - {s.term_name} ({s.academic_year_name}) [{s.status}]
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </Modal>
    );
};

export default AcademicSessionsDashboard;
