import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { toast } from 'react-toastify';
import {
    BookOpen, Users, Plus, RefreshCw, Search, Filter,
    ChevronRight, ChevronDown, ArrowRightLeft, UserPlus,
    Calendar, GraduationCap, Eye, X, Check, AlertCircle,
    Loader2, Home, Zap, BarChart3, Sparkles, CheckSquare,
    Square, ChevronLeft, ArrowRight, UserCheck, Trash2, Settings
} from 'lucide-react';
import { inputClass, labelClass } from '../../../components/ui/FormField';
import Modal from '../../../components/common/Modal';
import studentSettingsService from '../../../services/studentSettingsService';
import AcademicSetupTab from '../settings/components/tabs/AcademicSetupTab';

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

const PROGRESSION_COLORS = {
    promoted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    retained: 'bg-rose-50 text-rose-700 border-rose-100',
    graduated: 'bg-blue-50 text-blue-700 border-blue-100',
    discontinued: 'bg-slate-100 text-slate-600 border-slate-200',
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
};

/* ================================================================
   MAIN DASHBOARD
   ================================================================ */
const AcademicSessionsDashboard = () => {
    /* ── state ── */
    const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'years-terms' | 'bulk-enroll'
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ academic_year: '', term: '', grade: '', status: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [options, setOptions] = useState({ academicYears: [], terms: [], grades: [] });
    const [curricula, setCurricula] = useState([]);

    // selected session for detail panel
    const [selectedSession, setSelectedSession] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
    const [enrollmentSearch, setEnrollmentSearch] = useState('');
    const [selectedStreamFilter, setSelectedStreamFilter] = useState('All');
    const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState([]);

    // modals
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferEnrollment, setTransferEnrollment] = useState(null);

    // Collapsible grades list
    const [expandedGrades, setExpandedGrades] = useState({});

    // Bulk Enroll wizard state
    const [bulkStep, setBulkStep] = useState(1);
    const [bulkSession, setBulkSession] = useState(null);
    const [bulkIntake, setBulkIntake] = useState('');
    const [bulkStream, setBulkStream] = useState('');
    const [bulkStudentSearch, setBulkStudentSearch] = useState('');
    const [bulkStudents, setBulkStudents] = useState([]);
    const [selectedBulkStudentIds, setSelectedBulkStudentIds] = useState([]);
    const [bulkSearching, setBulkSearching] = useState(false);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [selectedCohortForTimeline, setSelectedCohortForTimeline] = useState('');
    const [timelineFilters, setTimelineFilters] = useState({ grade: '', academic_year: '' });
    const [bulkOptions, setBulkOptions] = useState({ intakes: [], streams: [] });

    /* ── fetch options ── */
    const loadOptions = async () => {
        try {
            const [years, terms, grades, intakeRes, streamRes, curriculaRes] = await Promise.all([
                studentSettingsService.getAcademicYears(),
                studentSettingsService.getTerms(),
                studentSettingsService.getClasses(),
                studentSettingsService.getIntakes(),
                studentSettingsService.getStreams(),
                studentSettingsService.getCurricula(),
            ]);

            const yearsList = years?.results || years || [];
            const termsList = terms?.results || terms || [];
            const gradesList = grades?.results || grades || [];

            setOptions({
                academicYears: yearsList,
                terms: termsList,
                grades: gradesList,
            });

            const intakesList = intakeRes?.results || intakeRes || [];
            setBulkOptions({
                intakes: intakesList,
                streams: streamRes?.results || streamRes || [],
            });

            if (intakesList.length > 0) {
                setSelectedCohortForTimeline(intakesList[0].id.toString());
            }

            setCurricula(curriculaRes?.results || curriculaRes || []);

            // default to current year
            const currentYear = yearsList.find(y => y.is_current);
            if (currentYear) {
                setFilters(f => ({ ...f, academic_year: currentYear.id }));
            }
        } catch (e) {
            console.error('Failed to load filter options', e);
        }
    };

    useEffect(() => {
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

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    /* ── fetch enrollments for selected session ── */
    const fetchEnrollments = useCallback(async (sessionId) => {
        setEnrollmentsLoading(true);
        try {
            const data = await studentSettingsService.getSessionEnrollments({ session: sessionId });
            setEnrollments(data?.results || data || []);
            setSelectedEnrollmentIds([]);
        } catch (e) {
            toast.error('Failed to load enrollments');
        } finally {
            setEnrollmentsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedSession) {
            fetchEnrollments(selectedSession.id);
        } else {
            setEnrollments([]);
        }
    }, [selectedSession, fetchEnrollments]);

    /* ── filter search ── */
    const filteredSessions = sessions.filter(s =>
        !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* ── Group sessions by grade and sort by grade_level_order ── */
    const getGroupedSessions = () => {
        const groups: Record<string, any> = {};
        filteredSessions.forEach((session: any) => {
            const gradeName = session.grade_name || 'Other Curriculum';
            if (!groups[gradeName]) {
                groups[gradeName] = {
                    name: gradeName,
                    order: session.grade_level_order || 999,
                    items: []
                };
            }
            groups[gradeName].items.push(session);
        });

        return Object.values(groups).sort((a: any, b: any) => a.order - b.order);
    };

    const toggleGrade = (gradeName) => {
        setExpandedGrades(prev => ({
            ...prev,
            [gradeName]: prev[gradeName] === false ? true : false // default to expanded if undefined
        }));
    };

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

    /* ── update status action ── */
    const handleUpdateSessionStatus = async (session, action) => {
        let confirmMsg = '';
        let apiCall = null;
        if (action === 'activate') {
            confirmMsg = `Are you sure you want to activate the session "${session.name}"?`;
            apiCall = studentSettingsService.activateClassSession;
        } else if (action === 'close') {
            confirmMsg = `Are you sure you want to close the session "${session.name}"? This will lock enrollment edits.`;
            apiCall = studentSettingsService.closeClassSession;
        } else if (action === 'archive') {
            confirmMsg = `Are you sure you want to archive "${session.name}"? This hides it from regular operations.`;
            apiCall = studentSettingsService.archiveClassSession;
        }

        if (!window.confirm(confirmMsg)) return;

        try {
            const res = await apiCall(session.id);
            toast.success(res.message || `Session status updated to ${res.status}`);
            fetchSessions();
            if (selectedSession?.id === session.id) {
                setSelectedSession(prev => ({ ...prev, status: res.status }));
            }
        } catch (e) {
            toast.error(e?.data?.error || 'Failed to update session status');
        }
    };

    /* ── Bulk Actions in Enrollment Panel ── */
    const handleBulkEnrollmentAction = async (actionType) => {
        if (selectedEnrollmentIds.length === 0) return;

        let confirmMsg = '';
        let payload = {};
        if (actionType === 'remove') {
            confirmMsg = `Are you sure you want to drop the ${selectedEnrollmentIds.length} selected student(s) from this session?`;
            payload = { is_active: false, status: 'dropped' };
        } else if (actionType === 'promote') {
            confirmMsg = `Mark the ${selectedEnrollmentIds.length} selected student(s) as Promoted?`;
            payload = { progression_status: 'promoted' };
        } else if (actionType === 'retain') {
            confirmMsg = `Mark the ${selectedEnrollmentIds.length} selected student(s) as Retained/Repeated?`;
            payload = { progression_status: 'retained' };
        }

        if (!window.confirm(confirmMsg)) return;

        setEnrollmentsLoading(true);
        try {
            await Promise.all(selectedEnrollmentIds.map(id =>
                studentSettingsService.updateSessionEnrollment(id, payload)
            ));
            toast.success(`Successfully updated ${selectedEnrollmentIds.length} student(s)`);
            setSelectedEnrollmentIds([]);
            fetchEnrollments(selectedSession.id);
            fetchSessions();
        } catch (e) {
            toast.error('Failed to perform bulk updates');
        } finally {
            setEnrollmentsLoading(false);
        }
    };

    /* ── Bulk Enroll wizard handlers ── */
    const handleSearchBulkStudents = async () => {
        if (!bulkStudentSearch.trim()) return;
        setBulkSearching(true);
        try {
            const { api } = await import('../../../services/api');
            const data = await api.get('/api/accounts/students/', { params: { search: bulkStudentSearch, limit: 50 } });
            setBulkStudents(data?.results || data || []);
        } catch (e) {
            toast.error('Failed to search students');
        } finally {
            setBulkSearching(false);
        }
    };

    const handleBulkEnrollSubmit = async () => {
        if (!bulkSession || !bulkIntake || selectedBulkStudentIds.length === 0) return;
        setBulkSubmitting(true);
        try {
            const res = await studentSettingsService.bulkSessionEnroll({
                session: bulkSession.id,
                students: selectedBulkStudentIds,
                intake: bulkIntake,
                stream: bulkStream || null
            });
            toast.success(res.message || `Successfully enrolled ${res.created} students!`);
            setBulkStep(1);
            setBulkSession(null);
            setBulkIntake('');
            setBulkStream('');
            setSelectedBulkStudentIds([]);
            setBulkStudents([]);
            setActiveTab('sessions');
            fetchSessions();
        } catch (e) {
            toast.error(e?.data?.error || 'Failed to bulk enroll students');
        } finally {
            setBulkSubmitting(false);
        }
    };

    const getNextProgressionTarget = useCallback((currentSession) => {
        if (!currentSession || !sessions.length) return null;

        // Find all sessions in the same curriculum
        const curSessions = sessions.filter(s => s.curriculum === currentSession.curriculum);

        // Sort chronologically by start date
        const sorted = [...curSessions].sort((a, b) => {
            const dateA = new Date(a.start_date || 0);
            const dateB = new Date(b.start_date || 0);
            return dateA - dateB;
        });

        const currentIndex = sorted.findIndex(s => s.id === currentSession.id);
        if (currentIndex !== -1 && currentIndex < sorted.length - 1) {
            return sorted[currentIndex + 1];
        }
        return null;
    }, [sessions]);

    const handlePromoteCohortTrigger = async (fromSession, toSession) => {
        setEnrollmentsLoading(true);
        try {
            const data = await studentSettingsService.getSessionEnrollments({ session: fromSession.id, is_active: true });
            const activeStudents = data?.results || data || [];

            if (activeStudents.length === 0) {
                toast.warning(`No active student enrollments found in "${fromSession.name}" to progress.`);
                return;
            }

            setBulkSession(toSession);
            // resolve intake from first student
            const firstIntakeId = activeStudents[0]?.intake;
            setBulkIntake(firstIntakeId || '');

            // Select all student IDs
            const studentIds = activeStudents.map(e => e.student);
            setSelectedBulkStudentIds(studentIds);

            // Load mapped students into search results for Step 3 list preview
            const mappedStudents = activeStudents.map(e => ({
                id: e.student,
                admission_number: e.admission_number,
                student: {
                    first_name: e.student_name?.split(' ')[0] || '',
                    last_name: e.student_name?.split(' ').slice(1).join(' ') || '',
                }
            }));
            setBulkStudents(mappedStudents);

            setBulkStep(4);
            setActiveTab('bulk-enroll');

            toast.info(`Pre-loaded ${activeStudents.length} students from "${fromSession.name}" for progression promotion to "${toSession.name}".`);
        } catch (e) {
            toast.error('Failed to load cohort for promotion');
        } finally {
            setEnrollmentsLoading(false);
        }
    };

    const getCohortSessions = useCallback((intakeId) => {
        if (!intakeId) return [];
        const intake = bulkOptions.intakes.find(i => i.id === parseInt(intakeId));
        if (!intake) return [];

        const startYear = options.academicYears.find(y => y.id === intake.academic_year);
        const startGrade = options.grades.find(g => g.id === intake.entry_grade);
        if (!startYear || !startGrade) return [];

        const yearsSorted = [...options.academicYears]
            .filter(y => new Date(y.start_date) >= new Date(startYear.start_date))
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        const gradesSorted = [...options.grades]
            .filter(g => g.curriculum === startGrade.curriculum && g.level_order >= startGrade.level_order)
            .sort((a, b) => a.level_order - b.level_order);

        const cohortPath = [];
        for (let i = 0; i < Math.min(yearsSorted.length, gradesSorted.length); i++) {
            cohortPath.push({
                yearId: yearsSorted[i].id,
                gradeId: gradesSorted[i].id
            });
        }

        const cohortSessionsList = sessions.filter(session =>
            cohortPath.some(path => path.yearId === session.academic_year && path.gradeId === session.grade)
        );

        return [...cohortSessionsList].sort((a: any, b: any) => new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime());
    }, [sessions, options, bulkOptions]);

    const handleSetActiveYear = async (id) => {
        if (confirm('Changing the active academic year will affect all current operations. Continue?')) {
            try {
                await studentSettingsService.updateAcademicYear(id, { is_current: true });
                toast.success('Academic year updated');
                loadOptions();
            } catch (error) {
                toast.error('Failed to update academic year');
            }
        }
    };

    /* ── active/inactive counts ── */
    const activeEnrollments = enrollments.filter(e => e.is_active);
    const inactiveEnrollments = enrollments.filter(e => !e.is_active);

    return (
        <DashboardLayout title="Terms & Academic Sessions">
            <div className="flex flex-col gap-6 px-1 py-2 pb-16 min-h-screen">

                {/* ── Page Header Redesigned & Compact ─────────────────────────── */}
                <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border border-slate-200/60 rounded-3xl p-3 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-50/30 rounded-full blur-[100px] pointer-events-none" />

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-600 shadow-[0_10px_20px_-3px_rgba(79,70,229,0.3)] text-white">
                            <GraduationCap size={20} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                <Home size={12} className="text-slate-300" />
                                <ChevronRight size={8} className="text-slate-200" />
                                <span className="hover:text-indigo-600 cursor-pointer">Academics</span>
                                <ChevronRight size={8} className="text-slate-200" />
                                <span className="text-indigo-600">Terms & Sessions</span>
                            </nav>

                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-xl lg:text-xl font-black text-slate-800 tracking-tight">
                                    Terms & Academic Sessions
                                </h1>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100/60 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    Operational Context
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 relative z-10">
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all active:scale-95 text-xs font-bold"
                        >
                            <Sparkles size={14} className="text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>Auto-Generate</span>
                        </button>
                    </div>
                </div>

                {/* ── Pill Tab Navigation ────────────────────────────────── */}
                <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto hide-scrollbar w-full md:w-auto">
                        <button
                            onClick={() => { setActiveTab('years-terms'); setSelectedSession(null); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none ${activeTab === 'years-terms'
                                ? 'bg-white text-indigo-700 shadow-sm font-black border border-slate-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                                }`}
                        >
                            <Calendar size={13} />
                            Cohorts & Progression
                        </button>
                        <button
                            onClick={() => { setActiveTab('sessions'); setSelectedSession(null); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none ${activeTab === 'sessions'
                                ? 'bg-white text-indigo-700 shadow-sm font-black border border-slate-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                                }`}
                        >
                            <BookOpen size={13} />
                            Class Sessions
                        </button>

                        <button
                            onClick={() => { setActiveTab('bulk-enroll'); setSelectedSession(null); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none ${activeTab === 'bulk-enroll'
                                ? 'bg-white text-indigo-700 shadow-sm font-black border border-slate-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                                }`}
                        >
                            <UserCheck size={13} />
                            Bulk Enroll
                        </button>
                        <button
                            onClick={() => { setActiveTab('setup'); setSelectedSession(null); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all select-none ${activeTab === 'setup'
                                ? 'bg-white text-indigo-700 shadow-sm font-black border border-slate-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/60'
                                }`}
                        >
                            <Settings size={13} />
                            Academic Setup
                        </button>
                    </div>

                    <div className="text-slate-400 text-xs font-medium">
                        Active Year: <span className="text-indigo-600 font-bold">{options.academicYears.find(y => y.is_current)?.name || 'None Set'}</span>
                    </div>
                </div>

                {/* ── TAB 1: COHORTS & PROGRESSION TIMELINE ───────────────── */}
                {activeTab === 'years-terms' && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <CohortProgressionTimeline
                            intakes={bulkOptions.intakes}
                            selectedCohort={selectedCohortForTimeline}
                            onSelectCohort={setSelectedCohortForTimeline}
                            getCohortSessions={getCohortSessions}
                            onSelectSession={(session) => setSelectedSession(session)}
                            selectedSession={selectedSession}
                        />
                    </div>
                )}

                {/* ── TAB: ACADEMIC SETUP ────────────────────────────────────── */}
                {activeTab === 'setup' && (
                    <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm">
                        <AcademicSetupTab />
                    </div>
                )}

                {/* ── TAB 2: CLASS SESSIONS REDESIGNED ───────────────────────────── */}
                {activeTab === 'sessions' && (
                    <>
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                            <StatCard icon={<Calendar size={18} />} label="Total Class Sessions" value={totalSessions} color="indigo" />
                            <StatCard icon={<Check size={18} />} label="Active Class Sessions" value={activeSessions} color="green" />
                            <StatCard icon={<Users size={18} />} label="Total Student Enrolled" value={totalEnrolled} color="purple" />
                        </div>

                        {/* Filter Bar */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search sessions by class name..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className={`${inputClass} pl-4 text-xs`}
                                    />
                                </div>
                                <select value={filters.academic_year} onChange={e => setFilters(f => ({ ...f, academic_year: e.target.value }))} className={`${inputClass} w-auto min-w-[140px] text-xs`}>
                                    <option value="">All Academic Years</option>
                                    {options.academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                </select>
                                <select value={filters.term} onChange={e => setFilters(f => ({ ...f, term: e.target.value }))} className={`${inputClass} w-auto min-w-[130px] text-xs`}>
                                    <option value="">All Terms</option>
                                    {options.terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <select value={filters.grade} onChange={e => setFilters(f => ({ ...f, grade: e.target.value }))} className={`${inputClass} w-auto min-w-[130px] text-xs`}>
                                    <option value="">All Grades</option>
                                    {options.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className={`${inputClass} w-auto min-w-[120px] text-xs`}>
                                    <option value="">All Statuses</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="active">Active</option>
                                    <option value="closed">Closed</option>
                                    <option value="archived">Archived</option>
                                </select>
                                <button onClick={fetchSessions} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Refresh">
                                    <RefreshCw size={14} />Refresh
                                </button>
                            </div>
                        </div>

                        {/* Main sessions + detail split */}
                        <div className={`grid gap-6 ${selectedSession ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'}`}>
                            {/* Grouped session grid list */}
                            <div className={`space-y-6 ${selectedSession ? 'lg:col-span-2' : ''}`}>
                                {loading ? (
                                    <div className="bg-white border border-slate-100 rounded-3xl p-16 flex items-center justify-center">
                                        <Loader2 size={32} className="animate-spin text-indigo-400" />
                                    </div>
                                ) : filteredSessions.length === 0 ? (
                                    <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center">
                                        <Calendar size={48} className="mb-4 text-slate-200" />
                                        <p className="text-sm font-semibold">No Class Sessions Found</p>
                                        <p className="text-xs mt-1 text-slate-400">Try adjusting your filters or trigger auto-generation</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-1">
                                        {getGroupedSessions().map(gradeGroup => {
                                            const isExpanded = expandedGrades[gradeGroup.name] !== false;
                                            return (
                                                <div key={gradeGroup.name} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                                                    <button
                                                        onClick={() => toggleGrade(gradeGroup.name)}
                                                        className="w-full px-5 py-3 bg-slate-50 flex items-center justify-between border-b border-slate-100 font-extrabold text-xs text-slate-700 uppercase tracking-wider text-left"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen size={14} className="text-indigo-500" />
                                                            <span>{gradeGroup.name}</span>
                                                            <span className="text-[10px] font-normal text-slate-400 normal-case bg-white border px-2 py-0.5 rounded-full ml-1">
                                                                {gradeGroup.items.length} {gradeGroup.items.length === 1 ? 'session' : 'sessions'}
                                                            </span>
                                                        </div>
                                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="p-4 grid grid-cols-1 gap-4">
                                                            {(() => {
                                                                const activeItem = gradeGroup.items.find(s => s.status === 'active');
                                                                const nextProgression = getNextProgressionTarget(activeItem);
                                                                if (activeItem && nextProgression) {
                                                                    return (
                                                                        <div className="bg-gradient-to-r from-indigo-50/50 to-indigo-100/10 border border-indigo-150 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                                                    <ArrowRightLeft size={14} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Cohort Progression Step Available</p>
                                                                                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                                                                                        Progress students from <span className="font-bold text-slate-700">{activeItem.name}</span> to <span className="font-bold text-indigo-600">{nextProgression.name}</span>
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handlePromoteCohortTrigger(activeItem, nextProgression);
                                                                                }}
                                                                                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                                                                            >
                                                                                <UserCheck size={12} /> Progress Cohort
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}

                                                            {gradeGroup.items.map(session => (
                                                                <SessionCard
                                                                    key={session.id}
                                                                    session={session}
                                                                    isSelected={selectedSession?.id === session.id}
                                                                    onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                                                                    onStatusChange={handleUpdateSessionStatus}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Detail Panel with Stream-Grouping & Bulk Actions */}
                            {selectedSession && (
                                <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-md overflow-hidden flex flex-col">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/20 to-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-md font-black text-slate-800">{selectedSession.grade_name}</h2>
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${STATUS_COLORS[selectedSession.status] || STATUS_COLORS.scheduled}`}>
                                                    {selectedSession.status}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                                                {selectedSession.term_name} &bull; {selectedSession.academic_year_name} &bull; {selectedSession.curriculum_name}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => setShowEnrollModal(true)}
                                                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                                            >
                                                <UserPlus size={13} /> Enroll Student
                                            </button>
                                            <button onClick={() => fetchEnrollments(selectedSession.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Refresh">
                                                <RefreshCw size={13} />
                                            </button>
                                            <button onClick={() => setSelectedSession(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sub-search + Stream Group Pills */}
                                    <div className="px-6 py-4 border-b border-slate-100 space-y-3.5 bg-slate-50/20">
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search student by name or admission number in session..."
                                                value={enrollmentSearch}
                                                onChange={e => setEnrollmentSearch(e.target.value)}
                                                className={`${inputClass} pl-9 text-xs py-1.5`}
                                            />
                                        </div>

                                        {/* Dynamic Stream pills */}
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {['All', ...new Set(activeEnrollments.filter(e => e.stream_name).map(e => e.stream_name)), 'Unassigned'].map(streamName => {
                                                const isActive = selectedStreamFilter === streamName;
                                                const count = activeEnrollments.filter(e =>
                                                    streamName === 'All' ||
                                                    (streamName === 'Unassigned' && !e.stream_name) ||
                                                    e.stream_name === streamName
                                                ).length;

                                                return (
                                                    <button
                                                        key={streamName}
                                                        onClick={() => setSelectedStreamFilter(streamName)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase border tracking-wider transition-all ${isActive
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                            : 'bg-white text-slate-500 hover:text-slate-700 border-slate-200'
                                                            }`}
                                                    >
                                                        {streamName} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {selectedSession && selectedSession.status === 'active' && (() => {
                                        const nextProgression = getNextProgressionTarget(selectedSession);
                                        if (nextProgression) {
                                            return (
                                                <div className="mx-6 my-3 p-3 bg-gradient-to-r from-indigo-50/50 to-indigo-100/10 border border-indigo-150 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                        <ArrowRightLeft size={13} className="text-indigo-600 shrink-0" />
                                                        <span className="text-[11px] text-slate-600 font-bold">
                                                            Next Promotion Session: <span className="text-indigo-700 font-extrabold">{nextProgression.name}</span>
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handlePromoteCohortTrigger(selectedSession, nextProgression)}
                                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Promote Class
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {/* Bulk Action floating header within panel */}
                                    {selectedEnrollmentIds.length > 0 && (
                                        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-2.5 flex items-center justify-between gap-4 animate-fade-in">
                                            <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-2">
                                                <CheckSquare size={14} /> {selectedEnrollmentIds.length} students selected
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleBulkEnrollmentAction('promote')}
                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg tracking-wider uppercase transition-all shadow-sm"
                                                >
                                                    Promote
                                                </button>
                                                <button
                                                    onClick={() => handleBulkEnrollmentAction('retain')}
                                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-extrabold rounded-lg tracking-wider uppercase transition-all shadow-sm"
                                                >
                                                    Retain
                                                </button>
                                                <button
                                                    onClick={() => handleBulkEnrollmentAction('remove')}
                                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold rounded-lg tracking-wider uppercase transition-all shadow-sm"
                                                >
                                                    Drop
                                                </button>
                                                <button
                                                    onClick={() => setSelectedEnrollmentIds([])}
                                                    className="p-1 hover:bg-indigo-100 text-indigo-600 rounded-md"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Enrollments Scroll list */}
                                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                                        {enrollmentsLoading ? (
                                            <div className="py-16 flex justify-center">
                                                <Loader2 size={24} className="animate-spin text-indigo-500" />
                                            </div>
                                        ) : activeEnrollments.length === 0 && inactiveEnrollments.length === 0 ? (
                                            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
                                                <Users size={32} className="text-slate-200 mb-2" />
                                                <p className="text-xs font-semibold">No Students Enrolled Yet</p>
                                                <button onClick={() => setShowEnrollModal(true)} className="mt-3 text-xs text-indigo-600 font-bold hover:underline">
                                                    + Enroll a Student
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                {/* Active Enrollments Section */}
                                                {activeEnrollments.length > 0 && (
                                                    <div>
                                                        <div className="px-6 py-2 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                                                            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Active Students</span>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        const ids = activeEnrollments.map(e => e.id);
                                                                        const allSelected = ids.every(id => selectedEnrollmentIds.includes(id));
                                                                        if (allSelected) {
                                                                            setSelectedEnrollmentIds(prev => prev.filter(id => !ids.includes(id)));
                                                                        } else {
                                                                            setSelectedEnrollmentIds(prev => [...new Set([...prev, ...ids])]);
                                                                        }
                                                                    }}
                                                                    className="text-[9px] text-indigo-600 font-extrabold uppercase hover:underline"
                                                                >
                                                                    Toggle All
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="divide-y divide-slate-50">
                                                            {activeEnrollments
                                                                .filter(e => {
                                                                    const matchesSearch = !enrollmentSearch ||
                                                                        e.student_name?.toLowerCase().includes(enrollmentSearch.toLowerCase()) ||
                                                                        e.admission_number?.toLowerCase().includes(enrollmentSearch.toLowerCase());

                                                                    const matchesStream = selectedStreamFilter === 'All' ||
                                                                        (selectedStreamFilter === 'Unassigned' && !e.stream_name) ||
                                                                        e.stream_name === selectedStreamFilter;

                                                                    return matchesSearch && matchesStream;
                                                                })
                                                                .map(enrollment => (
                                                                    <EnrollmentRow
                                                                        key={enrollment.id}
                                                                        enrollment={enrollment}
                                                                        streams={bulkOptions.streams}
                                                                        onTransfer={handleTransfer}
                                                                        onRemove={handleRemoveEnrollment}
                                                                        onChangeStream={handleChangeStream}
                                                                        selected={selectedEnrollmentIds.includes(enrollment.id)}
                                                                        onSelect={() => {
                                                                            setSelectedEnrollmentIds(prev =>
                                                                                prev.includes(enrollment.id)
                                                                                    ? prev.filter(id => id !== enrollment.id)
                                                                                    : [...prev, enrollment.id]
                                                                            );
                                                                        }}
                                                                    />
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Inactive Enrollments Section */}
                                                {inactiveEnrollments.length > 0 && (
                                                    <div className="border-t border-slate-100 mt-4">
                                                        <div className="px-6 py-2 bg-slate-50">
                                                            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">Inactive Students</span>
                                                        </div>
                                                        <div className="divide-y divide-slate-50">
                                                            {inactiveEnrollments.map(enrollment => (
                                                                <EnrollmentRow key={enrollment.id} enrollment={enrollment} streams={bulkOptions.streams} inactive />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* ── TAB 3: BULK ENROLL WIZARD ──────────────────────────────────── */}
                {activeTab === 'bulk-enroll' && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm max-w-4xl mx-auto w-full">
                        {/* Wizard Progress steps bar */}
                        <div className="flex items-center justify-between mb-2 max-w-2xl mx-auto relative">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                            <div
                                style={{ width: `${(bulkStep - 1) / 3 * 100}%` }}
                                className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-300"
                            />

                            {[1, 2, 3, 4].map(stepNum => {
                                const labels = ["Target Session", "Cohort & Stream", "Find Students", "Confirm"];
                                const isCompleted = bulkStep > stepNum;
                                const isActive = bulkStep === stepNum;
                                return (
                                    <div key={stepNum} className="flex flex-col items-center relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isCompleted
                                            ? 'bg-indigo-600 text-white'
                                            : isActive
                                                ? 'bg-white border-2 border-indigo-600 text-indigo-600 shadow-md scale-110'
                                                : 'bg-white border border-slate-200 text-slate-400'
                                            }`}>
                                            {isCompleted ? <Check size={14} /> : stepNum}
                                        </div>
                                        <span className={`text-[10px] font-extrabold uppercase mt-2 tracking-wider ${isActive ? 'text-indigo-600 font-black' : 'text-slate-400'}`}>
                                            {labels[stepNum - 1]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Step content */}
                        <div className="min-h-[300px] border border-slate-100 rounded-2xl p-6 mb-3">

                            {/* STEP 1: SELECT SESSION */}
                            {bulkStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-md font-bold text-slate-800 mb-1">Select Target Class Session</h3>
                                        <p className="text-xs text-slate-400 font-medium">Choose which active grade/class session the students will be enrolled into.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Class Session <span className="text-red-400">*</span></label>
                                            <select
                                                value={bulkSession?.id || ''}
                                                onChange={e => {
                                                    const selected = sessions.find(s => s.id === parseInt(e.target.value));
                                                    setBulkSession(selected || null);
                                                }}
                                                className={inputClass}
                                            >
                                                <option value="">Select Target Class Session...</option>
                                                {sessions.filter(s => s.status === 'active').map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} ({s.curriculum_name})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {bulkSession && (
                                        <div className="p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start gap-4">
                                            <AlertCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-indigo-950">Target Session Preview</p>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-3 text-xs text-indigo-900 font-medium">
                                                    <div>Grade: <span className="font-bold">{bulkSession.grade_name}</span></div>
                                                    <div>Term: <span className="font-bold">{bulkSession.term_name}</span></div>
                                                    <div>Academic Year: <span className="font-bold">{bulkSession.academic_year_name}</span></div>
                                                    <div>Curriculum: <span className="font-bold">{bulkSession.curriculum_name}</span></div>
                                                    <div>Duration: <span className="font-bold">{bulkSession.start_date} &bull; {bulkSession.end_date}</span></div>
                                                    <div>Current Enrollment: <span className="font-bold">{bulkSession.enrollment_count || 0} students</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 2: SELECT COHORT & STREAM */}
                            {bulkStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-md font-bold text-slate-800 mb-1">Define Cohort (Intake) & Optional Stream</h3>
                                        <p className="text-xs text-slate-400 font-medium">Associate enrolled students with their primary intake group and choose their stream allocation.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelClass}>Intake Group (Cohort) <span className="text-red-400">*</span></label>
                                            <select
                                                value={bulkIntake}
                                                onChange={e => setBulkIntake(e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">Select Cohort / Intake Group...</option>
                                                {bulkOptions.intakes.map(i => (
                                                    <option key={i.id} value={i.id}>{i.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-1">This defines the student permanent academic entry year cohort.</p>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Stream Allocation (Optional)</label>
                                            <select
                                                value={bulkStream}
                                                onChange={e => setBulkStream(e.target.value)}
                                                className={inputClass}
                                            >
                                                <option value="">No Stream (Unassigned)</option>
                                                {bulkOptions.streams.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-1">You can change the stream allocation later per-student.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: FIND AND SELECT STUDENTS */}
                            {bulkStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-md font-bold text-slate-800 mb-1">Search & Select Students</h3>
                                        <p className="text-xs text-slate-400 font-medium">Find students in the system and multi-select them to enroll.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={bulkStudentSearch}
                                            onChange={e => setBulkStudentSearch(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSearchBulkStudents()}
                                            placeholder="Search students by name or admission number..."
                                            className={`${inputClass} flex-1`}
                                        />
                                        <button
                                            onClick={handleSearchBulkStudents}
                                            disabled={bulkSearching}
                                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2"
                                        >
                                            {bulkSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                            <span>Search</span>
                                        </button>
                                    </div>

                                    {bulkStudents.length > 0 && (
                                        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                            <div className="px-4 py-2 bg-slate-50 border-b flex items-center justify-between text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                                                <span>Search Results ({bulkStudents.length})</span>
                                                <button
                                                    onClick={() => {
                                                        const ids = bulkStudents.map(s => s.id);
                                                        const allSelected = ids.every(id => selectedBulkStudentIds.includes(id));
                                                        if (allSelected) {
                                                            setSelectedBulkStudentIds(prev => prev.filter(id => !ids.includes(id)));
                                                        } else {
                                                            setSelectedBulkStudentIds(prev => [...new Set([...prev, ...ids])]);
                                                        }
                                                    }}
                                                    className="text-indigo-600 font-bold hover:underline normal-case text-[10px]"
                                                >
                                                    Select All
                                                </button>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50">
                                                {bulkStudents.map(student => {
                                                    const isChecked = selectedBulkStudentIds.includes(student.id);
                                                    return (
                                                        <div
                                                            key={student.id}
                                                            onClick={() => {
                                                                setSelectedBulkStudentIds(prev =>
                                                                    isChecked ? prev.filter(id => id !== student.id) : [...prev, student.id]
                                                                );
                                                            }}
                                                            className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold font-mono">
                                                                    {(student.student?.first_name || student.first_name)?.[0] || '?'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-800">
                                                                        {student.student ? `${student.student.first_name} ${student.student.last_name}` : `${student.first_name} ${student.last_name}`}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-400 font-semibold">{student.admission_number}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-indigo-600">
                                                                {isChecked ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-300" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {selectedBulkStudentIds.length > 0 && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-center justify-between">
                                            <span className="text-xs font-bold flex items-center gap-1.5">
                                                <Check size={14} className="text-emerald-600" /> {selectedBulkStudentIds.length} student(s) selected
                                            </span>
                                            <button
                                                onClick={() => setSelectedBulkStudentIds([])}
                                                className="text-[10px] text-emerald-600 font-extrabold uppercase hover:underline"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 4: PREVIEW AND CONFIRM */}
                            {bulkStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-md font-bold text-slate-800 mb-1">Confirm Academic Allocation</h3>
                                        <p className="text-xs text-slate-400 font-medium">Verify your bulk enrollment details before committing students to active billing and nominal roll.</p>
                                    </div>

                                    <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-slate-50/30">
                                        <div className="px-5 py-3.5 flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Target Class Session</span>
                                            <span className="font-extrabold text-slate-800">{bulkSession?.name}</span>
                                        </div>
                                        <div className="px-5 py-3 flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Cohort / Intake Group</span>
                                            <span className="font-extrabold text-slate-800">
                                                {bulkOptions.intakes.find(i => i.id === parseInt(bulkIntake))?.name}
                                            </span>
                                        </div>
                                        <div className="px-5 py-3 flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Assigned Stream</span>
                                            <span className="font-extrabold text-slate-800">
                                                {bulkStream ? bulkOptions.streams.find(s => s.id === parseInt(bulkStream))?.name : 'Unassigned (No Stream)'}
                                            </span>
                                        </div>
                                        <div className="px-5 py-3 flex justify-between items-center text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Total Enrolled Count</span>
                                            <span className="font-black text-indigo-600 text-sm bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                                                {selectedBulkStudentIds.length} Students
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl flex items-start gap-3">
                                        <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                                        <div className="text-xs leading-relaxed">
                                            <p className="font-bold">Important Notice:</p>
                                            <p className="mt-1">Confirming this step will link all selected students to this session as <strong>Active</strong>. This will automatically trigger auto-billing and generate term invoices if finance rules are configured.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Wizard buttons footer */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => {
                                    if (bulkStep === 1) {
                                        setActiveTab('sessions');
                                    } else {
                                        setBulkStep(s => s - 1);
                                    }
                                }}
                                className="flex items-center gap-1 px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all"
                            >
                                <ChevronLeft size={14} />
                                <span>{bulkStep === 1 ? 'Cancel' : 'Back'}</span>
                            </button>

                            {bulkStep < 4 ? (
                                <button
                                    onClick={() => {
                                        if (bulkStep === 1 && !bulkSession) {
                                            toast.warning('Please select a target class session');
                                            return;
                                        }
                                        if (bulkStep === 2 && !bulkIntake) {
                                            toast.warning('Please select an intake cohort');
                                            return;
                                        }
                                        if (bulkStep === 3 && selectedBulkStudentIds.length === 0) {
                                            toast.warning('Please search and select at least one student');
                                            return;
                                        }
                                        setBulkStep(s => s + 1);
                                    }}
                                    className="flex items-center gap-1 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                                >
                                    <span>Next</span>
                                    <ArrowRight size={14} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleBulkEnrollSubmit}
                                    disabled={bulkSubmitting}
                                    className="flex items-center gap-1 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md"
                                >
                                    {bulkSubmitting ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                    <span>Confirm & Enroll</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

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
        indigo: 'from-indigo-600 to-blue-600 text-white shadow-indigo-100',
        green: 'from-emerald-600 to-teal-600 text-white shadow-emerald-100',
        purple: 'from-fuchsia-600 to-purple-600 text-white shadow-purple-100',
    };

    return (
        <div className="group relative bg-white border border-slate-200/60 rounded-[28px] p-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 w-full">
            <div className="flex items-center gap-5">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color] || colors.indigo} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
                    <p className="text-xl font-black text-slate-800 tracking-tighter tabular-nums">{value}</p>
                </div>
            </div>
        </div>
    );
};

/* ================================================================
   SESSION CARD
   ================================================================ */
const SessionCard = ({ session, isSelected, onClick, onStatusChange }) => {
    const statusConfig = {
        scheduled: { bg: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
        active: { bg: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' },
        closed: { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
        archived: { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
    };

    const currentStatus = statusConfig[session.status] || statusConfig.scheduled;

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer border-2 rounded-2xl p-5 transition-all relative overflow-hidden bg-white ${isSelected ? 'border-indigo-500 shadow-md bg-indigo-50/5' : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                }`}
        >
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex justify-between items-start gap-4 mb-3.5">
                <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 tracking-tight truncate uppercase tracking-wider">{session.grade_name}</h4>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">{session.curriculum_name}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border tracking-wider shrink-0 ${currentStatus.bg}`}>
                    <span className={`w-1 h-1 rounded-full ${currentStatus.dot}`} />
                    {session.status}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-600">{session.term_name} &bull; {session.academic_year_name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold pl-4.5">
                    {session.start_date} to {session.end_date}
                </div>
            </div>

            {/* Capacity indicator bar */}
            <div className="space-y-1 mb-4">
                <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                    <span>Enrollment Capacity</span>
                    <span className="text-slate-700 font-black">{session.enrollment_count || 0} / 40 Students</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        style={{ width: `${Math.min((session.enrollment_count || 0) / 40 * 100, 100)}%` }}
                        className={`h-full rounded-full transition-all ${session.enrollment_count >= 40 ? 'bg-rose-500' : session.enrollment_count >= 30 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                    />
                </div>
            </div>

            {/* Status control buttons */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-50">
                <span className="text-[10px] font-extrabold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                    <Users size={11} /> {session.enrollment_count || 0} Enrolled
                </span>

                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                    {session.status === 'scheduled' && (
                        <button
                            onClick={() => onStatusChange(session, 'activate')}
                            className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-extrabold uppercase rounded-lg border border-emerald-100 transition-colors"
                        >
                            Activate
                        </button>
                    )}
                    {session.status === 'active' && (
                        <button
                            onClick={() => onStatusChange(session, 'close')}
                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase rounded-lg border border-slate-200 transition-colors"
                        >
                            Close
                        </button>
                    )}
                    {session.status === 'closed' && (
                        <button
                            onClick={() => onStatusChange(session, 'archive')}
                            className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 text-[10px] font-extrabold uppercase rounded-lg border border-amber-200 transition-colors"
                        >
                            Archive
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ================================================================
   ENROLLMENT ROW
   ================================================================ */
const EnrollmentRow = ({ enrollment, streams, onTransfer, onRemove, onChangeStream, inactive, selected, onSelect }) => {
    const [showStreamSelect, setShowStreamSelect] = useState(false);

    return (
        <div className={`px-6 py-3.5 flex items-center gap-4 group ${inactive ? 'opacity-40 bg-slate-50/20' : 'hover:bg-slate-50/40'} transition-all`}>
            {/* Multi-select Checkbox */}
            {!inactive && onSelect && (
                <button
                    onClick={onSelect}
                    className="text-slate-400 hover:text-indigo-600 shrink-0 transition-colors"
                >
                    {selected ? <CheckSquare size={15} className="text-indigo-600" /> : <Square size={15} />}
                </button>
            )}

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black font-mono shrink-0">
                {enrollment.student_name?.[0] || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-800 truncate">{enrollment.student_name}</p>
                    {enrollment.progression_status && (
                        <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 border rounded-full shrink-0 ${PROGRESSION_COLORS[enrollment.progression_status] || PROGRESSION_COLORS.pending}`}>
                            {enrollment.progression_status}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-semibold text-slate-400">
                    <span>{enrollment.admission_number}</span>
                    {enrollment.stream_name && (
                        <span className="text-indigo-600 font-extrabold">• {enrollment.stream_name}</span>
                    )}
                    <span className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded ${ENROLLMENT_STATUS_COLORS[enrollment.status] || 'bg-slate-100 text-slate-500'}`}>
                        {enrollment.status}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {!inactive && (
                <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* Stream allocation */}
                    {showStreamSelect ? (
                        <select
                            autoFocus
                            className="text-[10px] font-bold border border-slate-200 rounded-lg px-1.5 py-0.5 bg-white shadow-sm"
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
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Change stream"
                        >
                            <BarChart3 size={12} />
                        </button>
                    )}
                    {/* Transfer */}
                    <button
                        onClick={() => onTransfer(enrollment)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Transfer to another session"
                    >
                        <ArrowRightLeft size={12} />
                    </button>
                    {/* Remove */}
                    <button
                        onClick={() => onRemove(enrollment)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from session"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

/* ================================================================
   COHORT PROGRESSION LIFECYCLE TIMELINE
   ================================================================ */
const CohortProgressionTimeline = ({
    intakes,
    selectedCohort,
    onSelectCohort,
    getCohortSessions,
    onSelectSession,
    selectedSession
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showPastSessions, setShowPastSessions] = useState(false);

    const filteredIntakes = intakes.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCohort = intakes.find(i => i.id.toString() === selectedCohort);
    const cohortSessions = getCohortSessions(selectedCohort);

    const filteredTimelineSessions = cohortSessions.filter(s => {
        if (showPastSessions) return true;
        return s.status !== 'closed' && s.status !== 'archived';
    });

    const statusConfig = {
        scheduled: { bg: 'border-blue-200 bg-white hover:border-blue-450', badge: 'bg-blue-50 text-blue-700 border-blue-150', dot: 'bg-blue-500' },
        active: { bg: 'border-indigo-500 bg-indigo-50/5 ring-4 ring-indigo-50 shadow-sm', badge: 'bg-emerald-50 text-emerald-700 border-emerald-150', dot: 'bg-emerald-500 animate-pulse' },
        closed: { bg: 'border-slate-100 bg-slate-50/20 opacity-55 filter blur-[0.4px] hover:opacity-100 hover:filter-none', badge: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
        archived: { bg: 'border-slate-100 bg-slate-50/20 opacity-55 filter blur-[0.4px] hover:opacity-100 hover:filter-none', badge: 'bg-amber-50 text-amber-700 border-amber-150', dot: 'bg-amber-500' }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start w-full" style={{ display: 'flex', flexWrap: 'wrap' }}>
            <style>{`
                .cohort-sidebar-custom { width: 100%; flex-shrink: 0; }
                .cohort-main-custom { flex: 1 1 0%; min-width: 0; width: 100%; }
                @media (min-width: 768px) {
                    .cohort-sidebar-custom { width: 300px; }
                }
                @media (min-width: 1024px) {
                    .cohort-sidebar-custom { width: 340px; }
                }
            `}</style>
            {/* LEFT SIDEBAR: Cohorts List */}
            <div className="cohort-sidebar-custom bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col max-h-[800px]">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Select Cohort</h3>

                <div className="relative mb-4 shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search cohorts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`${inputClass} pl-9 text-xs bg-white`}
                    />
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-2 pr-1">
                    {filteredIntakes.length === 0 ? (
                        <div className="text-center text-xs text-slate-400 py-8">No cohorts found</div>
                    ) : (
                        filteredIntakes.map(intake => {
                            const isSelected = selectedCohort === intake.id.toString();
                            const initial = intake.name ? intake.name.charAt(0).toUpperCase() : '?';
                            const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
                            const colorClass = colors[intake.id % colors.length];

                            return (
                                <div
                                    key={intake.id}
                                    onClick={() => onSelectCohort(intake.id.toString())}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected
                                        ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-500/10'
                                        : 'bg-transparent border-transparent hover:bg-slate-100'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${colorClass}`}>
                                        {initial}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                                            {intake.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                                            {intake.code || 'No Code'}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="shrink-0 text-indigo-500">
                                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Sessions View */}
            <div className="cohort-main-custom flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl min-h-[400px]">
                {!activeCohort ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-20 px-6">
                        <Users size={48} className="mb-4 text-slate-200" />
                        <h4 className="text-sm font-bold text-slate-600">Select a cohort to view details</h4>
                        <p className="text-xs mt-2 text-center max-w-sm">Select a cohort from the list on the left to view their progression timeline.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30 rounded-t-2xl">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">{activeCohort.name}</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1">Cohort Progression & Lifecycle Timeline</p>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={showPastSessions}
                                        onChange={() => setShowPastSessions(!showPastSessions)}
                                    />
                                    <div className={`block w-10 h-6 rounded-full transition-colors ${showPastSessions ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showPastSessions ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Show Past Sessions</span>
                            </label>
                        </div>

                        <div className="p-6 flex-1 overflow-x-auto hide-scrollbar">
                            {filteredTimelineSessions.length === 0 ? (
                                <div className="py-16 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-150 text-xs">
                                    No {showPastSessions ? '' : 'active or upcoming '}sessions found for this cohort.
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    {filteredTimelineSessions.map((session, idx) => {
                                        const isSelected = selectedSession?.id === session.id;
                                        const config = statusConfig[session.status] || statusConfig.scheduled;

                                        return (
                                            <React.Fragment key={session.id}>
                                                <div
                                                    onClick={() => onSelectSession(isSelected ? null : session)}
                                                    className={`relative min-w-[270px] max-w-[310px] p-5 border-2 rounded-2xl cursor-pointer transition-all ${config.bg} ${isSelected ? 'ring-4 ring-indigo-50 border-indigo-600 shadow-md scale-[1.02]' : ''
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start gap-2 mb-3.5">
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-black text-slate-800 tracking-tight truncate uppercase tracking-wider">
                                                                {session.grade_name}
                                                            </h4>
                                                            <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">{session.curriculum_name}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase border tracking-wider shrink-0 ${config.badge}`}>
                                                            <span className={`w-1 h-1 rounded-full ${config.dot}`} />
                                                            {session.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Calendar size={13} className="text-slate-400 shrink-0" />
                                                            <span className="font-bold text-slate-600">{session.term_name} &bull; {session.academic_year_name}</span>
                                                        </div>
                                                        <div className="text-[9px] text-slate-450 font-semibold pl-4.5">
                                                            {session.start_date} to {session.end_date}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 mb-4">
                                                        <div className="flex justify-between items-center text-[8px] uppercase tracking-wider font-extrabold text-slate-400">
                                                            <span>Session Capacity</span>
                                                            <span className="text-slate-700 font-black">{session.enrollment_count || 0} / 40 Students</span>
                                                        </div>
                                                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                style={{ width: `${Math.min((session.enrollment_count || 0) / 40 * 100, 100)}%` }}
                                                                className={`h-full rounded-full transition-all ${session.enrollment_count >= 40 ? 'bg-rose-500' : session.enrollment_count >= 30 ? 'bg-amber-500' : 'bg-indigo-500'
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                                                        <span className="flex items-center gap-1">
                                                            <Users size={11} /> {session.enrollment_count || 0} Enrolled
                                                        </span>
                                                        {isSelected && (
                                                            <span className="text-indigo-600 font-black flex items-center gap-0.5">
                                                                Selected Nominal Roll <ChevronRight size={10} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {idx < filteredTimelineSessions.length - 1 && (
                                                    <div className="flex flex-col items-center shrink-0 mx-1">
                                                        <div className="h-[2px] w-8 bg-slate-250" />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
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
        }).catch(() => { });
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
            title="Auto-Generate Class Sessions"
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
                            className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${mode === 'year'
                                ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
                                : 'border-slate-100 text-slate-600 hover:border-slate-200'
                                }`}
                        >
                            <Calendar size={18} className="mb-2 text-indigo-500" />
                            <div className="text-xs font-bold uppercase tracking-wider">By Academic Year</div>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">Bulk generate class sessions for all active grades and curricula levels in a year.</p>
                        </button>
                        <button
                            onClick={() => setMode('intake')}
                            className={`flex-1 p-4 rounded-2xl border-2 text-left transition-all ${mode === 'intake'
                                ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
                                : 'border-slate-100 text-slate-600 hover:border-slate-200'
                                }`}
                        >
                            <GraduationCap size={18} className="mb-2 text-indigo-500" />
                            <div className="text-xs font-bold uppercase tracking-wider">By Intake Progression</div>
                            <p className="text-[10px] font-semibold text-slate-400 mt-1">Generate complete lifecycle sequential sessions for a specific student cohort intake.</p>
                        </button>
                    </div>
                </div>

                {mode === 'year' ? (
                    <div>
                        <label className={labelClass}>Academic Year Target</label>
                        <select value={yearId} onChange={e => setYearId(e.target.value)} className={inputClass}>
                            <option value="">Default Current Year</option>
                            {options.academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1.5">Leave blank to use current active academic year.</p>
                    </div>
                ) : (
                    <div>
                        <label className={labelClass}>Select Student Cohort Intake <span className="text-red-400">*</span></label>
                        <select value={intakeId} onChange={e => setIntakeId(e.target.value)} className={inputClass}>
                            <option value="">Select intake...</option>
                            {intakes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1.5">Must have an entry grade structure assigned to prevent setup validation conflicts.</p>
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
        }).catch(() => { });
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
            subtitle={`Target: ${session.grade_name} &bull; ${session.term_name}`}
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
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors"
                        >
                            {searching ? <Loader2 size={16} className="animate-spin text-slate-500" /> : <Search size={16} />}
                        </button>
                    </div>
                </div>

                {/* Search Results */}
                {students.length > 0 && (
                    <div className="border border-slate-100 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-slate-50 shadow-inner bg-slate-50/20">
                        {students.map(student => (
                            <button
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50/20 transition-colors ${selectedStudent?.id === student.id ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : ''
                                    }`}
                            >
                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold font-mono">
                                    {(student.student?.first_name || student.first_name)?.[0] || '?'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                        {student.student ? `${student.student.first_name} ${student.student.last_name}` : `${student.first_name} ${student.last_name}`}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.2">{student.admission_number}</p>
                                </div>
                                {selectedStudent?.id === student.id && <Check size={14} className="text-indigo-600 ml-auto shrink-0" />}
                            </button>
                        ))}
                    </div>
                )}

                {selectedStudent && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 animate-fade-in">
                        <Check size={16} className="text-emerald-600 shrink-0" />
                        <p className="text-xs text-emerald-800 font-bold">
                            Selected: {selectedStudent.student ? `${selectedStudent.student.first_name} ${selectedStudent.student.last_name}` : `${selectedStudent.first_name} ${selectedStudent.last_name}`}
                            <span className="text-emerald-600 font-semibold ml-1">({selectedStudent.admission_number})</span>
                        </p>
                    </div>
                )}

                {/* Intake */}
                <div>
                    <label className={labelClass}>Intake Cohort Group <span className="text-red-400">*</span></label>
                    <select value={formData.intake} onChange={e => setFormData(f => ({ ...f, intake: e.target.value }))} className={inputClass}>
                        <option value="">Select intake...</option>
                        {intakes.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                </div>

                {/* Stream (optional) */}
                <div>
                    <label className={labelClass}>Class Stream Assignment (Optional)</label>
                    <select value={formData.stream} onChange={e => setFormData(f => ({ ...f, stream: e.target.value }))} className={inputClass}>
                        <option value="">No stream allocation</option>
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
                <div className="p-4 bg-amber-50 border border-amber-100/60 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                        <p className="font-bold">This operation will automatically:</p>
                        <ul className="list-disc ml-4 mt-1 space-y-0.5">
                            <li>Mark current enrollment as <strong>Transferred Out</strong> and set inactive.</li>
                            <li>Create a new active student enrollment in the target class session.</li>
                            <li>Trigger auto-billing pipeline and create new invoices (if enabled).</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Current Active Session</label>
                    <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl font-bold">{enrollment.session_name}</p>
                </div>

                <div>
                    <label className={labelClass}>Select Target Session <span className="text-red-400">*</span></label>
                    <select value={targetSession} onChange={e => setTargetSession(e.target.value)} className={inputClass}>
                        <option value="">Select target session...</option>
                        {availableSessions.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.grade_name} &bull; {s.term_name} ({s.academic_year_name}) [{s.status}]
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </Modal>
    );
};

export default AcademicSessionsDashboard;
