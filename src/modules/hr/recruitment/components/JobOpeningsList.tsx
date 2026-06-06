import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../services/recruitmentService';
import {
    Search,
    Filter,
    MoreVertical,
    Briefcase,
    MapPin,
    Users,
    Clock
} from 'lucide-react';

const JobOpeningsList = ({ onEdit }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            params.search = searchTerm;

            const data = await recruitmentService.getJobOpenings(params);
            // Handle pagination if API returns { results: [...] } or just [...]
            setJobs(Array.isArray(data) ? data : data.results || []);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [filterStatus]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800',
            approval_pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            published: 'bg-green-100 text-green-800',
            closed: 'bg-red-100 text-red-800',
            on_hold: 'bg-orange-100 text-orange-800'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
                {status?.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    if (loading && jobs.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading job openings...</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Filters Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearch} className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>

                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                    {['all', 'published', 'draft', 'closed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {jobs.length > 0 ? (
                    jobs.map((job) => (
                        <div key={job.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-start justify-between sm:justify-start gap-3">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">{job.title}</h3>
                                        {getStatusBadge(job.status)}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={14} />
                                            {job.department?.name || 'No Dept'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {job.campus?.name || 'No Campus'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {job.number_of_positions} Positions
                                        </span>
                                        {job.closing_date && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                Closes {new Date(job.closing_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {job.number_of_applications || 0}
                                        </div>
                                        <div className="text-xs text-slate-500">Applicants</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/careers/apply/${job.id}`;
                                                navigator.clipboard.writeText(url);
                                                // Assuming we can use toast here if imported, or just alert? 
                                                // The file doesn't import toast currently. I should check imports.
                                                // Step 739 view showed no 'toast' import. 
                                                // Let's add simple alert or console for now, or assume global toast... 
                                                // Actually, better to just copy and maybe show a tooltip or standard alert.
                                                // The prompt asked "provide a link... to be posted". copying is key.
                                                alert("Public application link copied to clipboard!");
                                            }}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-blue-600"
                                            title="Copy Public Link"
                                        >
                                            <span className="sr-only">Copy Link</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                                        </button>
                                        <button
                                            onClick={() => onEdit && onEdit(job)}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <Briefcase className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No job openings found</h3>
                        <p>Get started by creating a new job position.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobOpeningsList;
