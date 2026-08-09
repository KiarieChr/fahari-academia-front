import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, Star, ChevronRight, Loader, Video, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { recruitmentService } from '../services/recruitmentService';
import InterviewEvaluation from '../workflow/components/InterviewEvaluation';

const STATUS_STYLES = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    rescheduled: 'bg-amber-100 text-amber-700',
    no_show: 'bg-slate-100 text-slate-500',
    in_progress: 'bg-purple-100 text-purple-700',
};

const MODE_ICON = {
    video: Video,
    phone: Phone,
    in_person: MapPin,
};

const InterviewsPage = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [showEvaluation, setShowEvaluation] = useState(false);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const data = await recruitmentService.getInterviews();
            // Normalize: API may return array or {results: []}
            setInterviews(Array.isArray(data) ? data : (data.results || []));
        } catch (err) {
            console.error(err);
            toast.error('Failed to load interviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInterviews(); }, []);

    const handleScore = (interview) => {
        setSelectedInterview(interview);
        setShowEvaluation(true);
    };

    const handleEvaluationComplete = () => {
        setShowEvaluation(false);
        setSelectedInterview(null);
        fetchInterviews();
        toast.success('Evaluation saved!');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (showEvaluation && selectedInterview) {
        return (
            <div>
                <button
                    onClick={() => setShowEvaluation(false)}
                    className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to Interviews
                </button>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                        Interview Scoring
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                        {selectedInterview.candidateName} — {selectedInterview.position}
                    </p>
                    <InterviewEvaluation
                        applicationId={selectedInterview.applicationId}
                        interviewId={selectedInterview.id}
                        data={selectedInterview.evaluation || null}
                        onComplete={handleEvaluationComplete}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Interview Schedule</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        {interviews.length} interview{interviews.length !== 1 ? 's' : ''} scheduled
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-700 transition-colors text-sm">
                    <Calendar size={16} />
                    Schedule Interview
                </button>
            </div>

            {interviews.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <Calendar size={40} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No interviews scheduled</h3>
                    <p className="text-slate-500 text-sm">Upcoming interviews will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {interviews.map((interview, idx) => {
                        const ModeIcon = MODE_ICON[interview.type?.toLowerCase()] || MapPin;
                        const statusStyle = STATUS_STYLES[interview.status?.toLowerCase()] || 'bg-slate-100 text-slate-500';
                        const hasEvaluation = !!interview.evaluation;

                        return (
                            <motion.div
                                key={interview.id || idx}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                {/* Left: Candidate info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-base flex-shrink-0">
                                        {(interview.candidateName || '?').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{interview.candidateName || 'Candidate'}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{interview.position}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Calendar size={11} />
                                                {interview.date}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock size={11} />
                                                {interview.time}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                                <ModeIcon size={11} />
                                                {interview.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: status + action */}
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle}`}>
                                        {interview.status}
                                    </span>
                                    {hasEvaluation ? (
                                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                            <Star size={12} />
                                            Scored
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleScore({
                                                ...interview,
                                                applicationId: interview.applicationId || interview.application_id,
                                            })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            <Star size={12} />
                                            Score
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InterviewsPage;
