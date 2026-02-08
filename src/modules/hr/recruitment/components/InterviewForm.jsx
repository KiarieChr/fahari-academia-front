import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../services/recruitmentService';
import { api } from '../../../../services/api';
import { X, Calendar, Clock, MapPin, Video, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InterviewForm = ({ isOpen, onClose, onSuccess, application = null, interview = null }) => {
    const [formData, setFormData] = useState({
        application: '',
        interview_round: '',
        interview_date: '',
        start_time: '',
        end_time: '',
        interview_mode: 'video',
        location: '',
        interviewers: [],
        notes: ''
    });

    const [options, setOptions] = useState({
        applications: [], // Candidates
        rounds: [],
        employees: []
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
            if (interview) {
                setFormData({
                    ...interview,
                    application: interview.application_id || interview.application?.id || interview.application,
                    interview_round: interview.interview_round_id || interview.interview_round?.id || interview.interview_round,
                    interviewers: interview.interviewers?.map(i => i.id || i) || [],
                });
            } else if (application) {
                setFormData(prev => ({ ...prev, application: application.id }));
            }
        }
    }, [isOpen, interview, application]);

    const fetchOptions = async () => {
        try {
            // Fetch potential candidates (broaden scope to allow scheduling for any active application)
            const appsPromise = !application ?
                recruitmentService.getApplications({ status: 'submitted,screening,shortlisted,interview' }) :
                Promise.resolve({ results: [application] });

            // We fetch employees for interviewers
            const empPromise = api.get('/workforce/api/employees/');

            // We need rounds. If application is selected, we should filter rounds for its job opening.
            // But for now let's fetch all or filter if we can.
            // Ideally we fetch rounds when application is selected.

            const [appsRes, empRes] = await Promise.all([appsPromise, empPromise]);

            setOptions(prev => ({
                ...prev,
                applications: appsRes.results || appsRes, // Handle different paginated responses
                employees: empRes.results || empRes
            }));

            // If we have an application, fetch its job's rounds
            if (application || formData.application) {
                const appId = application?.id || formData.application;
                // We need to know the job opening ID to filter rounds.
                // Assuming application object has job_opening detail or ID.
                // If it's just ID, we might need to fetch application details first.
                // For simplified flow, let's assume we can fetch all rounds or we fetch rounds for the specific job if known.

                // Workaround: Fetch rounds for the specific job opening if available in application object
                if (application && application.job_opening) {
                    const jobOpeningId = typeof application.job_opening === 'object' ? application.job_opening.id : application.job_opening;
                    const roundsRes = await api.get('/api/recruitment/interview-rounds/', { params: { job_opening: jobOpeningId } });
                    setOptions(prev => ({ ...prev, rounds: roundsRes.results || roundsRes }));
                } else {
                    // Fallback: fetch all
                    const roundsRes = await api.get('/api/recruitment/interview-rounds/');
                    setOptions(prev => ({ ...prev, rounds: roundsRes.results || roundsRes }));
                }
            }

        } catch (error) {
            console.error("Failed to load options", error);
        }
    };

    // Effect to fetch rounds when application changes (if user selects from dropdown)
    // Effect to fetch rounds when application changes (if user selects from dropdown)
    useEffect(() => {
        if (!application && formData.application) {
            const selectedApp = options.applications.find(a => a.id == formData.application);

            if (selectedApp) {
                // Fetch rounds for this app's job
                const jobOpeningId = typeof selectedApp.job_opening === 'object' ? selectedApp.job_opening.id : selectedApp.job_opening;

                api.get('/api/recruitment/interview-rounds/', { params: { job_opening: jobOpeningId } })
                    .then(res => setOptions(prev => ({ ...prev, rounds: res.results || res })));
            }
        }
    }, [formData.application, options.applications]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleInterviewerChange = (e) => {
        const options = e.target.options;
        const value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormData(prev => ({ ...prev, interviewers: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.application) newErrors.application = "Candidate is required";
        if (!formData.interview_round) newErrors.interview_round = "Round is required";
        if (!formData.interview_date) newErrors.interview_date = "Date is required";
        if (!formData.start_time) newErrors.start_time = "Start time is required";
        if (!formData.end_time) newErrors.end_time = "End time is required";
        if (!formData.interviewers || formData.interviewers.length === 0) newErrors.interviewers = "At least one interviewer is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            if (interview) {
                await recruitmentService.updateInterview(interview.id, formData);
            } else {
                await recruitmentService.scheduleInterview(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Submit error", error);
            setErrors({ submit: error.data?.error || error.data?.detail || error.message || "Failed to schedule interview" });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {interview ? 'Reschedule Interview' : 'Schedule Interview'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 flex-1">
                        {errors.submit && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                                <User size={18} />
                                {errors.submit}
                            </div>
                        )}

                        <form id="interviewForm" onSubmit={handleSubmit} className="space-y-4">

                            {!application && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Candidate *</label>
                                    <select
                                        name="application"
                                        value={formData.application}
                                        onChange={handleChange}
                                        className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.application ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                        disabled={!!application}
                                    >
                                        <option value="">Select Candidate</option>
                                        {options.applications.map(app => (
                                            <option key={app.id} value={app.id}>
                                                {app.first_name} {app.last_name} - {typeof app.job_opening === 'string' ? 'Job' : app.job_opening.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.application && <span className="text-xs text-red-500">{errors.application}</span>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interview Round *</label>
                                <select
                                    name="interview_round"
                                    value={formData.interview_round}
                                    onChange={handleChange}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${errors.interview_round ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                >
                                    <option value="">Select Round</option>
                                    {options.rounds.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.round_name} {r.job_opening_title ? `- ${r.job_opening_title}` : ''} ({r.get_round_type_display || r.round_type})
                                        </option>
                                    ))}
                                </select>
                                {errors.interview_round && <span className="text-xs text-red-500">{errors.interview_round}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date *</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            name="interview_date"
                                            value={formData.interview_date}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                        />
                                    </div>
                                    {errors.interview_date && <span className="text-xs text-red-500">{errors.interview_date}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mode</label>
                                    <div className="relative">
                                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select
                                            name="interview_mode"
                                            value={formData.interview_mode}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                        >
                                            <option value="video">Video Call</option>
                                            <option value="in_person">In Person</option>
                                            <option value="phone">Phone Call</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Time *</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={formData.start_time}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                        />
                                    </div>
                                    {errors.start_time && <span className="text-xs text-red-500">{errors.start_time}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Time *</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={formData.end_time}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                        />
                                    </div>
                                    {errors.end_time && <span className="text-xs text-red-500">{errors.end_time}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location / Link</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Meeting Room 1 or Zoom Link"
                                        className="w-full pl-10 pr-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interviewers *</label>
                                <select
                                    multiple
                                    name="interviewers"
                                    value={formData.interviewers}
                                    onChange={handleInterviewerChange}
                                    className={`w-full p-2 border rounded-lg dark:bg-slate-900 h-32 ${errors.interviewers ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                                >
                                    {options.employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name} ({emp.department?.name})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500">Hold Ctrl/Cmd to select multiple</p>
                                {errors.interviewers && <span className="text-xs text-red-500">{errors.interviewers}</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                                ></textarea>
                            </div>

                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="interviewForm"
                            disabled={loading}
                            className="btn btn-primary px-6"
                        >
                            {loading ? 'Scheduling...' : 'Schedule Interview'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InterviewForm;
