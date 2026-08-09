import React, { useState, useEffect } from 'react';
import { X, Check, Users, User, Filter } from 'lucide-react';
import { recruitmentService } from '../services/recruitmentService';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';

const ShortlistModal = ({ isOpen, onClose, onSuccess, mode = 'single' }) => {
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);

    // Form State
    const [selectedJob, setSelectedJob] = useState('');
    const [selectedCandidates, setSelectedCandidates] = useState([]); // Array of IDs
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            // Reset state
            setSelectedJob('');
            setSelectedCandidates([]);
            setNotes('');
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            // Load Active Jobs
            const jobsRes = await recruitmentService.getJobOpenings({ status: 'published,internal' });
            setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes.results || []);

            // If Single mode, load all relevant candidates immediately
            if (mode === 'single') {
                loadCandidates();
            }
        } catch (error) {
            console.error("Failed to load data", error);
            toast.error("Failed to load options");
        }
    };

    const loadCandidates = async (jobId = null) => {
        try {
            const params = {
                status: 'submitted,screening', // Only these can be shortlisted
            };
            if (jobId) params.job_opening = jobId;

            const res = await recruitmentService.getApplications(params);
            setCandidates(Array.isArray(res) ? res : res.results || []);
        } catch (error) {
            console.error("Failed to load candidates", error);
        }
    };

    // Effect for Bulk: When job changes, reload candidates
    useEffect(() => {
        if (mode === 'bulk' && selectedJob) {
            loadCandidates(selectedJob);
            setSelectedCandidates([]); // Clear selection on job change
        }
    }, [selectedJob, mode]);

    const handleToggleCandidate = (id) => {
        if (mode === 'single') {
            setSelectedCandidates([id]);
        } else {
            setSelectedCandidates(prev =>
                prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
            );
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedCandidates(candidates.map(c => c.id));
        } else {
            setSelectedCandidates([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedCandidates.length === 0) {
            toast.error("Please select at least one candidate");
            return;
        }

        setLoading(true);
        try {
            // Process all selected
            const promises = selectedCandidates.map(id =>
                recruitmentService.updateApplicationStatus(id, 'shortlisted', notes)
            );

            await Promise.all(promises);

            toast.success(`Successfully shortlisted ${selectedCandidates.length} candidate(s)`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error("Shortlist error", error);
            toast.error("Failed to update status for some candidates");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {mode === 'bulk' ? <Users className="text-indigo-600" /> : <User className="text-emerald-600" />}
                        {mode === 'bulk' ? 'Bulk Shortlist' : 'Shortlist Candidate'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">

                    {/* Job Filter (Required for Bulk, Optional for Single) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {mode === 'bulk' ? 'Select Job Opening *' : 'Filter by Job (Optional)'}
                        </label>
                        <select
                            value={selectedJob}
                            onChange={(e) => {
                                setSelectedJob(e.target.value);
                                if (mode === 'single') loadCandidates(e.target.value);
                            }}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                        >
                            <option value="">{mode === 'bulk' ? 'Select a job...' : 'All Jobs'}</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>{job.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Candidates List */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Select Candidate(s)
                            </label>
                            {mode === 'bulk' && candidates.length > 0 && (
                                <label className="text-xs text-blue-600 cursor-pointer flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedCandidates.length === candidates.length && candidates.length > 0}
                                        className="rounded border-slate-300"
                                    />
                                    Select All
                                </label>
                            )}
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                            {candidates.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    {mode === 'bulk' && !selectedJob ? 'Please select a job first.' : 'No candidates found for review.'}
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {candidates.map(candidate => (
                                        <label
                                            key={candidate.id}
                                            className={`flex items-center p-3 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-colors ${selectedCandidates.includes(candidate.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                        >
                                            <input
                                                type={mode === 'bulk' ? 'checkbox' : 'radio'}
                                                name="candidate_select"
                                                checked={selectedCandidates.includes(candidate.id)}
                                                onChange={() => handleToggleCandidate(candidate.id)}
                                                className={`mr-3 ${mode === 'bulk' ? 'rounded' : 'rounded-full'} border-slate-300 text-blue-600 focus:ring-blue-500`}
                                            />
                                            <div>
                                                <p className="font-medium text-sm text-slate-900 dark:text-white">
                                                    {candidate.first_name} {candidate.last_name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {candidate.email} • Exp: {candidate.total_experience_years}y
                                                </p>
                                            </div>
                                            <span className="ml-auto text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                                                {candidate.application_status}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Shortlisting Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Reason for shortlisting..."
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedCandidates.length === 0}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Check size={18} />
                                {mode === 'bulk' ? `Shortlist (${selectedCandidates.length})` : 'Confirm Shortlist'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShortlistModal;

