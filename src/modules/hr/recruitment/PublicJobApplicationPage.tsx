import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import JobApplicationForm from './components/JobApplicationForm';
import { isDeadlineExpired, formatClosingDate, getCountdownInfo } from './utils/deadlineUtils';
import { Briefcase, MapPin, Clock, Calendar, Lock, AlertTriangle, Timer } from 'lucide-react';

/* ─── Skeleton ─────────────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const PageSkeleton = () => (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Skeleton className="h-32 rounded-none" />
                <div className="px-8 pb-8">
                    <Skeleton className="h-24 w-24 -mt-12 mb-6 rounded-xl" />
                    <Skeleton className="h-8 w-2/3 mb-3" />
                    <div className="flex gap-4 mb-6">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-4">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10 col-span-2" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
            </div>
        </div>
    </div>
);

/* ─── Countdown Banner ──────────────────────────────────────────────────────── */
const CountdownBanner = ({ closingDate }) => {
    const [info, setInfo] = useState(() => getCountdownInfo(closingDate));

    useEffect(() => {
        if (!closingDate) return;
        const id = setInterval(() => setInfo(getCountdownInfo(closingDate)), 60_000);
        return () => clearInterval(id);
    }, [closingDate]);

    if (!info) return null;

    const colors = {
        normal: 'bg-blue-50  border-blue-200  text-blue-800',
        warning: 'bg-amber-50 border-amber-300 text-amber-800',
        critical: 'bg-red-50   border-red-300   text-red-800',
    };
    const iconColors = {
        normal: 'text-blue-500',
        warning: 'text-amber-500',
        critical: 'text-red-500',
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg text-sm font-medium mb-6 ${colors[info.urgency]}`}
            role="status" aria-label="Application deadline countdown">
            <Timer size={18} className={`flex-shrink-0 ${iconColors[info.urgency]}`} />
            <span>{info.label}</span>
            {info.urgency === 'critical' && (
                <span className="ml-auto text-xs font-semibold uppercase tracking-wide">Urgent!</span>
            )}
        </div>
    );
};

/* ─── Expired Notice ────────────────────────────────────────────────────────── */
const ExpiredNotice = ({ job, onViewOthers }) => (
    <div className="min-h-screen bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-start justify-center">
        <div className="max-w-lg w-full">
            {/* Job header card (greyed) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 opacity-60">
                <div className="h-24 bg-gradient-to-r from-slate-400 to-slate-500" />
                <div className="px-8 pb-6">
                    <div className="relative -mt-10 mb-4">
                        <div className="h-20 w-20 bg-white rounded-xl shadow flex items-center justify-center border-4 border-white">
                            <Briefcase className="h-8 w-8 text-slate-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-500 mb-1">{job.title}</h2>
                    {job.campus?.name && (
                        <span className="text-sm text-slate-400">{job.campus.name}</span>
                    )}
                </div>
            </div>

            {/* Expired alert */}
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center"
                role="alert" aria-live="assertive">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-5">
                    <Lock className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Applications Closed</h1>
                {job.closing_date && (
                    <p className="text-slate-500 mb-1 text-sm">
                        This position closed on{' '}
                        <span className="font-semibold text-slate-700">{formatClosingDate(job.closing_date)}</span>.
                    </p>
                )}
                <p className="text-slate-500 text-sm mb-8">
                    We are no longer accepting applications for <strong>{job.title}</strong>.
                    Thank you for your interest.
                </p>
                <button
                    onClick={onViewOthers}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg
                               hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    View Other Open Positions
                </button>
            </div>
        </div>
    </div>
);

/* ─── Main Component ────────────────────────────────────────────────────────── */
const PublicJobApplicationPage = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/api/recruitment/job-openings/${jobId}/`);
                setJob(response);
                setExpired(isDeadlineExpired(response));
            } catch (err) {
                console.error('Error fetching job', err);
                setFetchError('Job opening not found or unavailable.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleDeadlineExpired = useCallback(() => {
        setExpired(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    /* ── States ── */
    if (loading) return <PageSkeleton />;

    if (fetchError) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Job Not Found</h1>
                <p className="text-slate-600 text-center max-w-sm">{fetchError}</p>
                <button
                    onClick={() => navigate('/careers')}
                    className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    Browse All Positions
                </button>
            </div>
        );
    }

    if (expired) {
        return <ExpiredNotice job={job} onViewOthers={() => navigate('/careers')} />;
    }

    /* ── Active state ── */
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* ── Job Header Card ── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
                    <div className="px-8 pb-8">
                        <div className="relative -mt-12 mb-6">
                            <div className="h-24 w-24 bg-white rounded-xl shadow-md flex items-center justify-center border-4 border-white">
                                <Briefcase className="h-10 w-10 text-blue-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                            {job.campus?.name && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={16} className="text-slate-400" />
                                    {job.campus.name}
                                    {job.campus.location && ` — ${job.campus.location}`}
                                </span>
                            )}
                            {job.department?.name && (
                                <span className="flex items-center gap-1">
                                    <Briefcase size={16} className="text-slate-400" />
                                    {job.department.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Clock size={16} className="text-slate-400" />
                                {job.job_type || 'Full Time'}
                            </span>
                            {job.closing_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} className="text-slate-400" />
                                    Closes {formatClosingDate(job.closing_date)}
                                </span>
                            )}
                        </div>

                        <div className="prose max-w-none text-slate-600">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">About the Role</h3>
                            <p className="whitespace-pre-line mb-4">{job.description}</p>
                            {job.requirements && (
                                <>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Requirements</h3>
                                    <p className="whitespace-pre-line">{job.requirements}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Application Form Card ── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Apply for this Position</h2>
                    <p className="text-slate-500 text-sm mb-6">
                        Fill in the form below. Fields marked <span className="text-red-500">*</span> are required.
                    </p>

                    {/* Countdown banner lives inside the form card so it's near the submit button */}
                    {job.closing_date && <CountdownBanner closingDate={job.closing_date} />}

                    <JobApplicationForm
                        jobOpeningId={jobId}
                        isPublic={true}
                        closingDate={job.closing_date}
                        onDeadlineExpired={handleDeadlineExpired}
                    />
                </div>

            </div>
        </div>
    );
};

export default PublicJobApplicationPage;
