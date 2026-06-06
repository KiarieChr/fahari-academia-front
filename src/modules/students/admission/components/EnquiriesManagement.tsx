import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Phone, Mail, MessageSquare, Plus, Search, Loader2, AlertCircle,
    RefreshCw, User, Calendar, BookOpen, ArrowUpRight, CheckCircle2, X,
    Filter, HelpCircle, FileText, ChevronRight, Edit3, Trash2, Link2, Info
} from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';
import { institutionService } from '../../../../services/institutionService';
import { toast } from 'react-toastify';
import Button from '../../../../components/common/Button';

const STATUS_BADGE_CONFIG = {
    new: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-900/50', label: 'New Interest' },
    contacted: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-900/50', label: 'Contacted' },
    converted: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-900/50', label: 'Converted' },
    dropped: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-900/50', label: 'Dropped' }
};

const SOURCE_CONFIG = {
    walk_in: { label: 'Walk-in', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    phone: { label: 'Phone Call', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    email: { label: 'Email', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    website: { label: 'Website Form', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    referral: { label: 'Referral', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    social_media: { label: 'Social Media', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
    open_day: { label: 'Open Day', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    other: { label: 'Other', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
};

const EnquiriesManagement = () => {
    // === State ===
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dropdowns data
    const [intakes, setIntakes] = useState([]);
    const [curriculums, setCurriculums] = useState([]);
    const [grades, setGrades] = useState([]);
    const [campuses, setCampuses] = useState([]);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [intakeFilter, setIntakeFilter] = useState('');

    // Active Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);

    // Form inputs
    const [newEnquiry, setNewEnquiry] = useState({
        full_name: '',
        child_name: '',
        phone_number: '',
        email: '',
        intake: '',
        curriculum: '',
        grade: '',
        campus: '',
        source: 'walk_in',
        message: '',
        follow_up_date: ''
    });

    const [followUpData, setFollowUpData] = useState({
        status: 'contacted',
        follow_up_notes: '',
        follow_up_date: ''
    });

    const [actionLoading, setActionLoading] = useState(false);

    // === Fetching ===
    const fetchDropdowns = useCallback(async () => {
        try {
            const [intakeRes, currRes, gradeRes, campusRes] = await Promise.allSettled([
                studentManagementService.getIntakes(),
                studentManagementService.getCurriculums(),
                studentManagementService.getGrades(),
                institutionService.getCampuses()
            ]);

            if (intakeRes.status === 'fulfilled') setIntakes(intakeRes.value?.data || intakeRes.value || []);
            if (currRes.status === 'fulfilled') setCurriculums(currRes.value?.data || currRes.value || []);
            if (gradeRes.status === 'fulfilled') setGrades(gradeRes.value?.data || gradeRes.value || []);
            if (campusRes.status === 'fulfilled') {
                const cData = campusRes.value?.data || campusRes.value;
                setCampuses(Array.isArray(cData) ? cData : cData?.results || []);
            }
        } catch (err) {
            console.error('Failed to load filters metadata dropdowns', err);
        }
    }, []);

    const fetchEnquiries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (sourceFilter) params.source = sourceFilter;
            if (gradeFilter) params.grade = gradeFilter;
            if (intakeFilter) params.intake = intakeFilter;

            const res = await studentManagementService.getEnquiries(params);
            const data = res?.data || res;
            setEnquiries(Array.isArray(data) ? data : data?.results || []);
        } catch (err) {
            setError('Failed to query enquiries pipeline');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, sourceFilter, gradeFilter, intakeFilter]);

    useEffect(() => {
        fetchDropdowns();
    }, [fetchDropdowns]);

    useEffect(() => {
        fetchEnquiries();
    }, [fetchEnquiries]);

    // === Handlers ===
    const handleCreateEnquiry = async (e) => {
        e.preventDefault();
        if (!newEnquiry.full_name) {
            toast.warn('Parent Name is required.');
            return;
        }

        setActionLoading(true);
        try {
            // prepare payload filtering empty strings to null
            const payload = { ...newEnquiry };
            Object.keys(payload).forEach(key => {
                if (payload[key] === '') payload[key] = null;
            });

            await studentManagementService.createEnquiry(payload);
            toast.success('Interest Enquiry logged successfully.');
            setShowCreateModal(false);
            setNewEnquiry({
                full_name: '',
                child_name: '',
                phone_number: '',
                email: '',
                intake: '',
                curriculum: '',
                grade: '',
                campus: '',
                source: 'walk_in',
                message: '',
                follow_up_date: ''
            });
            fetchEnquiries();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to submit enquiry.');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogFollowUp = async (e) => {
        e.preventDefault();
        if (!selectedEnquiry) return;

        setActionLoading(true);
        try {
            await studentManagementService.updateEnquiry(selectedEnquiry.id, {
                status: followUpData.status,
                follow_up_notes: followUpData.follow_up_notes || null,
                follow_up_date: followUpData.follow_up_date || null
            });
            toast.success('Follow-up activity recorded.');
            setShowFollowUpModal(false);
            setSelectedEnquiry(null);
            fetchEnquiries();
        } catch (err) {
            toast.error('Failed to save follow-up details.');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConvertToApplication = async (enquiryId) => {
        setActionLoading(true);
        try {
            const res = await studentManagementService.convertEnquiry(enquiryId);
            toast.success(res?.message || 'Enquiry successfully promoted to formal Admission Application.');
            setSelectedEnquiry(null);
            fetchEnquiries();
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Conversion failed. Make sure required fields are filled.');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDropEnquiry = async (enquiryId) => {
        if (!window.confirm('Are you sure you want to drop this enquiry?')) return;
        setActionLoading(true);
        try {
            await studentManagementService.updateEnquiry(enquiryId, { status: 'dropped' });
            toast.info('Enquiry marked as dropped/inactive.');
            fetchEnquiries();
        } catch (err) {
            toast.error('Failed to update enquiry status.');
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    // Filter local list based on real-time text input
    const filteredEnquiries = enquiries.filter(item => {
        const q = search.toLowerCase();
        return (
            (item.full_name || '').toLowerCase().includes(q) ||
            (item.child_name || '').toLowerCase().includes(q) ||
            (item.phone_number || '').toLowerCase().includes(q) ||
            (item.email || '').toLowerCase().includes(q)
        );
    });

    // Compute Stats
    const stats = {
        total: enquiries.length,
        new: enquiries.filter(e => e.status === 'new').length,
        contacted: enquiries.filter(e => e.status === 'contacted').length,
        converted: enquiries.filter(e => e.status === 'converted').length,
        dropped: enquiries.filter(e => e.status === 'dropped').length,
        conversionRate: enquiries.length > 0 
            ? Math.round((enquiries.filter(e => e.status === 'converted').length / enquiries.length) * 100) 
            : 0
    };

    // Format Date string helper
    const formatDate = (dStr) => {
        if (!dStr) return '—';
        try {
            return new Date(dStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Page Intro ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                        Admissions Pipeline: Enquiries
                    </h2>
                    <p className="text-xs flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-secondary)' }}>
                        <Info size={12} style={{ color: 'var(--primary-color)' }} />
                        Track prospective parent enquiries, schedule outreach, and convert inquiries to admission applications.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        onClick={fetchEnquiries}
                        disabled={loading}
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider border px-4 py-2 rounded-xl transition-all disabled:opacity-50 h-10 cursor-pointer"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} style={{ color: 'var(--primary-color)' }} />
                        Refresh
                    </button>

                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setShowCreateModal(true)}
                        className="h-10 text-xs font-black uppercase tracking-wider w-full sm:w-auto"
                    >
                        Log Enquiry
                    </Button>
                </div>
            </div>

            {/* ── Glassmorphic Stats Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Enquiries */}
                <div 
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                    className="p-5 border rounded-2xl flex items-center gap-4 shadow-sm"
                >
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Pipeline</p>
                        <h4 className="text-2xl font-black tabular-nums mt-1.5 leading-none" style={{ color: 'var(--text-main)' }}>{stats.total}</h4>
                    </div>
                </div>

                {/* New Leads */}
                <div 
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                    className="p-5 border rounded-2xl flex items-center gap-4 shadow-sm"
                >
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">New Inquiries</p>
                        <h4 className="text-2xl font-black tabular-nums mt-1.5 leading-none text-blue-600">{stats.new}</h4>
                    </div>
                </div>

                {/* Converted */}
                <div 
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                    className="p-5 border rounded-2xl flex items-center gap-4 shadow-sm"
                >
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Converted</p>
                        <h4 className="text-2xl font-black tabular-nums mt-1.5 leading-none text-emerald-600">{stats.converted}</h4>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div 
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                    className="p-5 border rounded-2xl flex items-center gap-4 shadow-sm"
                >
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
                        <ArrowUpRight size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Conversion Rate</p>
                        <h4 className="text-2xl font-black tabular-nums mt-1.5 leading-none text-amber-600">{stats.conversionRate}%</h4>
                    </div>
                </div>
            </div>

            {/* ── Filters & Search ── */}
            <div 
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                className="p-4 border rounded-2xl flex flex-col gap-4 shadow-sm"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Live Search */}
                    <div className="relative flex-1 group">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by parent name, child, phone, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="w-full pl-9 pr-4 py-2.5 text-xs font-bold border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all duration-300"
                        />
                    </div>

                    {/* Compact Filter Selectors */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0">
                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="px-3 py-2 text-xs font-black border rounded-xl outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New Interests</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="dropped">Dropped</option>
                        </select>

                        {/* Source */}
                        <select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value)}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="px-3 py-2 text-xs font-black border rounded-xl outline-none"
                        >
                            <option value="">All Sources</option>
                            <option value="walk_in">Walk-in</option>
                            <option value="phone">Phone Call</option>
                            <option value="email">Email</option>
                            <option value="website">Website Form</option>
                            <option value="referral">Referral</option>
                            <option value="social_media">Social Media</option>
                            <option value="open_day">Open Day</option>
                            <option value="other">Other</option>
                        </select>

                        {/* Grade level interest */}
                        <select
                            value={gradeFilter}
                            onChange={(e) => setGradeFilter(e.target.value)}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="px-3 py-2 text-xs font-black border rounded-xl outline-none"
                        >
                            <option value="">All Class Levels</option>
                            {grades.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>

                        {/* Intake */}
                        <select
                            value={intakeFilter}
                            onChange={(e) => setIntakeFilter(e.target.value)}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="px-3 py-2 text-xs font-black border rounded-xl outline-none"
                        >
                            <option value="">All Intakes</option>
                            {intakes.map(i => (
                                <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* ── Pipeline Table ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <p className="text-xs font-bold text-slate-400">Querying leads pipeline data...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 rounded-full bg-red-50 mb-3 text-red-500">
                        <AlertCircle size={28} />
                    </div>
                    <h4 className="text-sm font-black text-slate-700">Failed to query pipeline</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
                    <button onClick={fetchEnquiries} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-all">
                        Retry Call
                    </button>
                </div>
            ) : (
                <div 
                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                    className="border rounded-[24px] overflow-hidden"
                >
                    {filteredEnquiries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-800/40 mb-4 text-slate-300">
                                <Users size={32} />
                            </div>
                            <h4 className="text-sm font-black text-slate-500">No leads registered</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs">There are no matching admissions interest enquiries logged for the selected criteria.</p>
                            <button 
                                onClick={() => setShowCreateModal(true)} 
                                className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
                            >
                                <Plus size={13} /> Log New Lead
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                <thead style={{ background: 'var(--bg-light)' }}>
                                    <tr>
                                        <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prospect Parent</th>
                                        <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Child / Student</th>
                                        <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Curriculum / Grade</th>
                                        <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pipeline Stage</th>
                                        <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Source</th>
                                        <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scheduled Outreach</th>
                                        <th className="px-6 py-4.5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                    {filteredEnquiries.map((item) => {
                                        const badge = STATUS_BADGE_CONFIG[item.status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: item.status };
                                        const src = SOURCE_CONFIG[item.source] || { label: item.source, color: 'bg-slate-100 text-slate-700' };

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                                                {/* Parent Details */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black uppercase shadow-sm"
                                                        >
                                                            {item.full_name[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">{item.full_name}</span>
                                                            <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-400 leading-none">
                                                                {item.phone_number && <span className="flex items-center gap-1"><Phone size={10} />{item.phone_number}</span>}
                                                                {item.email && <span className="flex items-center gap-1"><Mail size={10} />{item.email}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Child Name */}
                                                <td className="px-6 py-4.5 whitespace-nowrap text-sm font-black text-slate-700 dark:text-slate-200">
                                                    {item.child_name || <span className="text-slate-300 dark:text-slate-700">Unspecified</span>}
                                                </td>

                                                {/* Curriculum and Grade level */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                                            <BookOpen size={11} className="text-indigo-400" />
                                                            {item.curriculum_name || 'Generic Curriculum'}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-400 ml-4">
                                                            {item.grade_name || 'Any Grade'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border leading-none ${badge.bg} ${badge.text} ${badge.border}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'converted' ? 'bg-emerald-500' : item.status === 'new' ? 'bg-indigo-500' : item.status === 'contacted' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                {/* Source */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${src.color}`}>
                                                        {src.label}
                                                    </span>
                                                </td>

                                                {/* Scheduled Follow-up */}
                                                <td className="px-6 py-4.5 whitespace-nowrap text-xs font-bold text-slate-400 tabular-nums">
                                                    {item.status === 'converted' ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider">
                                                            <CheckCircle2 size={12} /> Converted
                                                        </span>
                                                    ) : item.follow_up_date ? (
                                                        <span className={`flex items-center gap-1 ${new Date(item.follow_up_date) < new Date() ? 'text-rose-500 font-extrabold' : 'text-slate-500'}`}>
                                                            <Calendar size={12} /> {formatDate(item.follow_up_date)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-300 dark:text-slate-700">None Scheduled</span>
                                                    )}
                                                </td>

                                                {/* Action Operations */}
                                                <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button 
                                                            title="Details / Activity Log"
                                                            onClick={() => {
                                                                setSelectedEnquiry(item);
                                                                setFollowUpData({
                                                                    status: item.status === 'converted' ? 'converted' : item.status === 'dropped' ? 'dropped' : 'contacted',
                                                                    follow_up_notes: item.follow_up_notes || '',
                                                                    follow_up_date: item.follow_up_date || ''
                                                                });
                                                                setShowFollowUpModal(true);
                                                            }}
                                                            style={{ borderColor: 'var(--border-color-light)' }}
                                                            className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>

                                                        {item.status !== 'converted' && item.status !== 'dropped' && (
                                                            <>
                                                                <button 
                                                                    title="Promote to Application"
                                                                    disabled={actionLoading}
                                                                    onClick={() => handleConvertToApplication(item.id)}
                                                                    className="p-2 border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    <ArrowUpRight size={13} />
                                                                </button>

                                                                <button 
                                                                    title="Mark Dropped"
                                                                    disabled={actionLoading}
                                                                    onClick={() => handleDropEnquiry(item.id)}
                                                                    className="p-2 border border-rose-100 bg-rose-50/50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── MODAL: CREATE LEAD ENQUIRY ── */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 ">
                    <div 
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                        className="w-full max-w-2xl border rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-20 p-3"
                    >
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color-light)' }}>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Log New Admissions Enquiry</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1">Capture basic details of prospective leads and schedule follows.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateEnquiry} className="flex-1 overflow-y-auto max-h-[70vh] p-8 space-y-6">
                            {/* Personal Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Parent / Contact Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. John Mwangi"
                                        value={newEnquiry.full_name}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, full_name: e.target.value }))}
                                        className="w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Prospective Child Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Kelvin Mwangi"
                                        value={newEnquiry.child_name}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, child_name: e.target.value }))}
                                        className="w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Mobile Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. +254 712 345678"
                                        value={newEnquiry.phone_number}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, phone_number: e.target.value }))}
                                        className="w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. parent@example.com"
                                        value={newEnquiry.email}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    />
                                </div>
                            </div>

                            {/* Interest Dropdowns Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Interest Intake Cycle</label>
                                    <select
                                        value={newEnquiry.intake}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, intake: e.target.value }))}
                                        className="w-full px-3 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    >
                                        <option value="">Select Intake...</option>
                                        {intakes.map(i => (
                                            <option key={i.id} value={i.id}>{i.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Desired Curriculum</label>
                                    <select
                                        value={newEnquiry.curriculum}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, curriculum: e.target.value }))}
                                        className="w-full px-3 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    >
                                        <option value="">Select Curriculum...</option>
                                        {curriculums.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Target Grade / Class Level</label>
                                    <select
                                        value={newEnquiry.grade}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, grade: e.target.value }))}
                                        className="w-full px-3 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    >
                                        <option value="">Select Grade level...</option>
                                        {grades.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Interest Campus</label>
                                    <select
                                        value={newEnquiry.campus}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, campus: e.target.value }))}
                                        className="w-full px-3 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                    >
                                        <option value="">Select Campus...</option>
                                        {campuses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Discovery Source</label>
                                    <select
                                        value={newEnquiry.source}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, source: e.target.value }))}
                                        className="w-full px-3 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none"
                                    >
                                        <option value="walk_in">Walk-in</option>
                                        <option value="phone">Phone Call</option>
                                        <option value="email">Email</option>
                                        <option value="website">Website Form</option>
                                        <option value="referral">Referral</option>
                                        <option value="social_media">Social Media</option>
                                        <option value="open_day">Open Day</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">First Scheduled Follow-up Date</label>
                                    <input
                                        type="date"
                                        value={newEnquiry.follow_up_date}
                                        onChange={(e) => setNewEnquiry(prev => ({ ...prev, follow_up_date: e.target.value }))}
                                        className="w-full px-4 py-2.5 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Initial Message / Interest Notes</label>
                                <textarea
                                    rows={3}
                                    placeholder="Write details of discovery, parents' inquiries, questions asked, etc."
                                    value={newEnquiry.message}
                                    onChange={(e) => setNewEnquiry(prev => ({ ...prev, message: e.target.value }))}
                                    className="w-full px-4 py-3 text-xs font-bold border rounded-xl bg-slate-50/50 dark:bg-slate-800/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                />
                            </div>

                            {/* Actions footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color-light)' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 border rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl transition-all shadow-sm cursor-pointer"
                                >
                                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                                    Log Lead
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: FOLLOW-UP / DETAILS DRIVER ── */}
            {showFollowUpModal && selectedEnquiry && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] flex items-center justify-center p-4">
                    <div 
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                        className="w-full max-w-xl border rounded-[32px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color-light)' }}>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Enquiry Profile & Activity Log</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1">Lead ID: #{selectedEnquiry.id} • Registered {formatDate(selectedEnquiry.created_at)}</p>
                            </div>
                            <button onClick={() => { setShowFollowUpModal(false); setSelectedEnquiry(null); }} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Details body */}
                        <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
                            {/* Summary profile */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-md font-black text-slate-700 dark:text-slate-200 leading-tight">{selectedEnquiry.full_name}</h4>
                                        {selectedEnquiry.child_name && <p className="text-xs font-bold text-slate-400 mt-0.5">Parent of: <span className="text-slate-600 dark:text-slate-300 font-extrabold">{selectedEnquiry.child_name}</span></p>}
                                    </div>
                                    <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-bold ${SOURCE_CONFIG[selectedEnquiry.source]?.color || 'bg-slate-100 text-slate-700'}`}>
                                        {SOURCE_CONFIG[selectedEnquiry.source]?.label || selectedEnquiry.source}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-400">Intake Target</span>
                                        <span className="text-slate-700 dark:text-slate-300 mt-0.5">{selectedEnquiry.intake_name || 'Generic intake'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-400">Grade Level</span>
                                        <span className="text-slate-700 dark:text-slate-300 mt-0.5">{selectedEnquiry.grade_name || 'Any Grade'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-400">Curriculum</span>
                                        <span className="text-slate-700 dark:text-slate-300 mt-0.5">{selectedEnquiry.curriculum_name || 'Generic Curriculum'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-400">Campus Preferred</span>
                                        <span className="text-slate-700 dark:text-slate-300 mt-0.5">{selectedEnquiry.campus_name || 'Not Specified'}</span>
                                    </div>
                                </div>

                                {selectedEnquiry.message && (
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Prospect message:</span>
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic mt-1 leading-relaxed bg-white dark:bg-slate-900/40 p-3 rounded-lg border border-slate-50 dark:border-slate-800/50">
                                            "{selectedEnquiry.message}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Conversion block if converted */}
                            {selectedEnquiry.status === 'converted' && (
                                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-700 flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={18} />
                                    <div className="text-xs font-bold">
                                        This enquiry was successfully converted into an Application on <strong>{formatDate(selectedEnquiry.converted_at)}</strong>.
                                    </div>
                                </div>
                            )}

                            {/* Follow up Logger Form (if active) */}
                            {selectedEnquiry.status !== 'converted' && selectedEnquiry.status !== 'dropped' && (
                                <form onSubmit={handleLogFollowUp} className="space-y-4 pt-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Record Action Follow-up</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Stage Status</label>
                                            <select
                                                value={followUpData.status}
                                                onChange={(e) => setFollowUpData(prev => ({ ...prev, status: e.target.value }))}
                                                className="w-full px-3 py-2 text-xs font-bold border rounded-xl outline-none"
                                            >
                                                <option value="new">New Lead</option>
                                                <option value="contacted">Contacted / Outreach</option>
                                                <option value="dropped">Dropped Lead</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Next Scheduled Outreach</label>
                                            <input
                                                type="date"
                                                value={followUpData.follow_up_date}
                                                onChange={(e) => setFollowUpData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                                                className="w-full px-3 py-2 text-xs font-bold border rounded-xl outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Follow-up Notes / History Logs</label>
                                        <textarea
                                            rows={3}
                                            required
                                            placeholder="Write down follow up feedback, call response notes, parent queries, etc."
                                            value={followUpData.follow_up_notes}
                                            onChange={(e) => setFollowUpData(prev => ({ ...prev, follow_up_notes: e.target.value }))}
                                            className="w-full px-4 py-3 text-xs font-bold border rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between gap-4 pt-3">
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => handleConvertToApplication(selectedEnquiry.id)}
                                            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                                        >
                                            <Link2 size={13} /> Convert Lead
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setShowFollowUpModal(false); setSelectedEnquiry(null); }}
                                                className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border cursor-pointer"
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={actionLoading}
                                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                                            >
                                                Save Notes
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* View history only for dropped/converted */}
                            {(selectedEnquiry.status === 'converted' || selectedEnquiry.status === 'dropped') && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Outreach History</h4>
                                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/20 text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                                        <div className="text-[10px] font-black uppercase text-slate-400 mb-1 leading-none">Last follow-up Notes</div>
                                        {selectedEnquiry.follow_up_notes || 'No follow-up notes recorded.'}
                                    </div>
                                    <div className="flex justify-end pt-3">
                                        <button
                                            onClick={() => { setShowFollowUpModal(false); setSelectedEnquiry(null); }}
                                            className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer shadow-sm"
                                        >
                                            Close Profile
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnquiriesManagement;
