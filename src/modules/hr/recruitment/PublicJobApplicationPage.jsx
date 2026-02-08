import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../services/api';
import JobApplicationForm from './components/JobApplicationForm';
import { Briefcase, MapPin, Clock, Calendar } from 'lucide-react';

const PublicJobApplicationPage = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                // Public endpoint or allowing unauthenticated access to this
                const response = await api.get(`/api/recruitment/job-openings/${jobId}/`);
                setJob(response);
            } catch (err) {
                console.error("Error fetching job", err);
                setError("Job opening not found or has expired.");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="text-red-500 mb-4">
                    <Briefcase size={48} />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Job Not Found</h1>
                <p className="text-slate-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                    <div className="px-8 pb-8">
                        <div className="relative -mt-12 mb-6">
                            <div className="h-24 w-24 bg-white rounded-xl shadow-md flex items-center justify-center border-4 border-white">
                                <Briefcase className="h-10 w-10 text-blue-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} className="text-slate-400" />
                                {job.campus?.name} {job.campus?.location && `- ${job.campus.location}`}
                            </span>
                            <span className="flex items-center gap-1">
                                <Briefcase size={16} className="text-slate-400" />
                                {job.department?.name}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={16} className="text-slate-400" />
                                {job.job_type || 'Full Time'}
                            </span>
                            {job.closing_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} className="text-slate-400" />
                                    Closes {new Date(job.closing_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        <div className="prose max-w-none text-slate-600">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">About the Role</h3>
                            <p className="whitespace-pre-line mb-4">{job.description}</p>

                            {job.requirements && (
                                <>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Requirements</h3>
                                    <p className="whitespace-pre-line mb-4">{job.requirements}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Application Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Apply for this Position</h2>
                    <JobApplicationForm
                        jobOpeningId={jobId}
                        isPublic={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default PublicJobApplicationPage;
