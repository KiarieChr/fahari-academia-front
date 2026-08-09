
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import {
    Users,
    FileText,
    Calendar,
    TrendingUp,
    Plus,
    Filter,
    Download
} from 'lucide-react';

import RecruitmentMetricCard from './components/RecruitmentMetricCard';
import RecruitmentPipeline from './components/RecruitmentPipeline';
import CandidateTable from './components/CandidateTable';
import InterviewCalendar from './components/InterviewCalendar';
import RecruitmentQuickActions from './components/RecruitmentQuickActions';
import RecruitmentLoadingSkeleton from './components/RecruitmentLoadingSkeleton';
import JobOpeningsList from './components/JobOpeningsList';
import JobOpeningForm from './components/JobOpeningForm';
import InterviewForm from './components/InterviewForm';
import JobApplicationModal from './components/JobApplicationModal';
import ShortlistModal from './components/ShortlistModal';
import RecruitmentWorkflow from './workflow/RecruitmentWorkflow';

// New layout components
import RecruitmentSidebar from './components/RecruitmentSidebar';
import RecruitmentWelcomeBanner from './components/RecruitmentWelcomeBanner';
import HiringNeedsWidget from './components/HiringNeedsWidget';
import RecentApplicantsWidget from './components/RecentApplicantsWidget';
import MiniInterviewCalendar from './components/MiniInterviewCalendar';
import InterviewsPage from './components/InterviewsPage';
import OnboardingPage from './components/OnboardingPage';
import RecruitmentChartsWidget from './components/RecruitmentChartsWidget';

import { recruitmentService } from './services/recruitmentService';
import { useAuth } from '../../../auth/AuthProvider';

const RecruitmentDashboard = ({ noLayout = false }) => {
    const { user } = useAuth();
    const userName = user?.full_name || user?.first_name || user?.name || user?.username || 'HR';

    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    // Modal State
    const [showJobForm, setShowJobForm] = useState(false);
    const [showInterviewForm, setShowInterviewForm] = useState(false);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [showShortlistModal, setShowShortlistModal] = useState(false);
    const [shortlistMode, setShortlistMode] = useState('single');

    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedInterview, setSelectedInterview] = useState(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const data = await recruitmentService.getDashboardStats();
            setDashboardData(data);
        } catch (error) {
            console.error("Failed to fetch recruitment dashboard data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCreateJob = () => {
        setSelectedJob(null);
        setShowJobForm(true);
    };

    const handleRecordApplication = () => {
        setShowApplicationForm(true);
    };

    const handleShortlist = () => {
        setShortlistMode('single');
        setShowShortlistModal(true);
    };

    const handleBulkShortlist = () => {
        setShortlistMode('bulk');
        setShowShortlistModal(true);
    };

    const handleEditJob = (job) => {
        setSelectedJob(job);
        setShowJobForm(true);
    };

    const handleScheduleInterview = () => {
        setSelectedInterview(null);
        setShowInterviewForm(true);
    };

    const handleEditInterview = (interview) => {
        const rawInterview = dashboardData?.upcoming_interviews.find(i => i.id === interview.id);
        setSelectedInterview(rawInterview || interview);
        setShowInterviewForm(true);
    };

    const handleCancelInterview = async (id) => {
        if (window.confirm("Are you sure you want to cancel this interview?")) {
            try {
                await recruitmentService.deleteInterview(id);
                toast.success("Interview cancelled");
                fetchDashboardData();
            } catch (error) {
                toast.error("Failed to cancel interview");
            }
        }
    };

    const handleJobSuccess = () => {
        fetchDashboardData();
    };

    // --- HELPERS & TRANSFORMATIONS ---
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (timeStr, endStr) => {
        const t1 = timeStr?.substring(0, 5) || '';
        const t2 = endStr?.substring(0, 5) || '';
        return `${t1} - ${t2}`;
    };

    // 1. Pipeline Transformation
    const buildPipeline = (distribution, recentApps) => {
        const stages = [
            { id: 'applied', db_status: ['submitted', 'draft'], title: 'Applied', color: 'blue' },
            { id: 'screening', db_status: ['screening', 'background_check'], title: 'Screening', color: 'purple' },
            { id: 'shortlisted', db_status: ['shortlisted'], title: 'Shortlisted', color: 'indigo' },
            { id: 'interview', db_status: ['interview'], title: 'Interview', color: 'amber' },
            { id: 'offer', db_status: ['offered', 'hired'], title: 'Offer', color: 'emerald' },
        ];

        return {
            stages: stages.map(stage => {
                let count = 0;
                stage.db_status.forEach(st => {
                    count += distribution?.[st] || 0;
                });

                const stageCandidates = recentApps?.filter(app =>
                    stage.db_status.includes(app.application_status)
                ).map(app => ({
                    id: app.id,
                    name: app.full_name,
                    role: typeof app.job_opening === 'object' ? app.job_opening.title : app.job_opening,
                    experience: `${app.total_experience_years}y`,
                    score: 0,
                    date: formatDate(app.application_date),
                    avatar: getInitials(app.full_name)
                })) || [];

                return {
                    id: stage.id,
                    title: stage.title,
                    color: stage.color,
                    count: count,
                    candidates: stageCandidates
                };
            })
        };
    };

    // 2. Candidate Table Transformation
    const transformCandidates = (apps) => {
        if (!apps) return [];
        return apps.map(app => ({
            id: app.id,
            name: app.full_name,
            position: typeof app.job_opening === 'object' ? app.job_opening.title : app.job_opening,
            stage: app.application_status.charAt(0).toUpperCase() + app.application_status.slice(1).replace('_', ' '),
            appliedDate: formatDate(app.application_date),
            status: app.application_status,
            email: app.email,
            avatar: getInitials(app.full_name)
        }));
    };

    // 3. Interview Calendar Transformation
    const transformInterviews = (interviews) => {
        if (!interviews) return [];
        return interviews.map(int => ({
            id: int.id,
            candidateName: int.application,
            position: int.job_title,
            date: formatDate(int.interview_date),
            time: formatTime(int.start_time, int.end_time),
            interviewers: int.interviewers?.map(i => i.full_name) || [],
            type: int.interview_round,
            status: int.status_display
        }));
    };

    // Construct data from API response
    const metrics_data = [
        {
            id: 1,
            title: "Total Applicants",
            value: dashboardData?.total_applications || 0,
            trend: dashboardData?.applications_today ? `+${dashboardData.applications_today}` : "",
            trendUp: true,
            icon: Users,
            color: "blue",
            description: "Total applications received"
        },
        {
            id: 2,
            title: "Open Positions",
            value: dashboardData?.active_job_openings || 0,
            trend: "",
            trendUp: true,
            icon: FileText,
            color: "indigo",
            description: "Active job listings"
        },
        {
            id: 3,
            title: "Active Interviews",
            value: dashboardData?.pending_interviews || 0,
            trend: "",
            trendUp: true,
            icon: Calendar,
            color: "amber",
            description: "Scheduled interviews"
        },
        {
            id: 4,
            title: "Hired this Month",
            value: dashboardData?.hired_this_month || 0,
            trend: "",
            trendUp: true,
            icon: TrendingUp,
            color: "emerald",
            description: "Candidates hired this month"
        }
    ];

    const pipeline_stages = buildPipeline(
        dashboardData?.application_status_distribution || {},
        dashboardData?.recent_applications || []
    );

    const candidates_list = transformCandidates(dashboardData?.recent_applications);
    const interviews_list = transformInterviews(dashboardData?.upcoming_interviews);


    if (loading) {
        const skeleton = (
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors">
                <RecruitmentLoadingSkeleton />
            </div>
        );
        if (noLayout) return skeleton;
        return (
            <DashboardLayout title="Recruitment">
                {skeleton}
            </DashboardLayout>
        );
    }

    const content = (
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 transition-colors flex">
                <RecruitmentSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <div className="flex-1 max-w-[1600px] mx-auto p-6 space-y-6 overflow-y-auto h-[calc(100vh-100px)]">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Recruitment Overview</h1>
                            <p className="text-slate-500 dark:text-slate-400">Track candidates, manage pipeline, and schedule interviews.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-2 shadow-sm">
                                <Download size={18} />
                                Export Report
                            </button>
                            <button
                                onClick={handleCreateJob}
                                className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                            >
                                <Plus size={18} />
                                Post New Job
                            </button>
                        </div>
                    </div>

                    {/* Overview Dashboard View */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <RecruitmentWelcomeBanner newApplicationsCount={dashboardData?.applications_today || 0} userName={userName} />
                            
                            {/* KPI Metrics row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
                                {metrics_data.map(metric => (
                                    <RecruitmentMetricCard key={metric.id} {...metric} />
                                ))}
                            </div>

                            <RecruitmentChartsWidget 
                                statusDistribution={dashboardData?.application_status_distribution} 
                                sourceDistribution={dashboardData?.source_distribution} 
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Hiring Needs & Pipeline */}
                                <div className="lg:col-span-2 space-y-6">
                                    <HiringNeedsWidget openings={dashboardData?.expiring_jobs || []} />
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Recruitment progress</h3>
                                            <button 
                                                onClick={() => setActiveTab('pipeline')}
                                                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                See all
                                            </button>
                                        </div>
                                        {/* A simplified candidate table for the overview */}
                                        <CandidateTable candidates={candidates_list.slice(0, 5)} />
                                    </div>
                                </div>
                                {/* Right Column: Calendar & Applicants */}
                                <div className="space-y-6">
                                    <MiniInterviewCalendar interviews={interviews_list} />
                                    <RecentApplicantsWidget applicants={dashboardData?.recent_applications || []} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={activeTab === 'dashboard' ? 'hidden' : 'block'}>
                        {/* Main Content Area */}
                        <div className="space-y-6">

                            {/* Tab Content */}
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {activeTab === 'pipeline' && <RecruitmentPipeline stages={pipeline_stages.stages} />}
                                {activeTab === 'candidates' && <CandidateTable candidates={candidates_list} />}
                                {activeTab === 'interviews' && <InterviewsPage />}
                                {activeTab === 'jobs' && <JobOpeningsList onEdit={handleEditJob} />}
                                {activeTab === 'workflow' && <RecruitmentWorkflow />}
                                {activeTab === 'onboarding' && <OnboardingPage />}
                            </motion.div>
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
                        <RecruitmentQuickActions
                            onScheduleInterview={handleScheduleInterview}
                            onPostJob={handleCreateJob}
                            onRecordApplication={handleRecordApplication}
                            onShortlist={handleShortlist}
                            onBulkShortlist={handleBulkShortlist}
                        />
                    </div>

                    {/* Modals */}
                    <JobOpeningForm
                        isOpen={showJobForm}
                        onClose={() => setShowJobForm(false)}
                        onSuccess={handleJobSuccess}
                        job={selectedJob}
                    />

                    <InterviewForm
                        isOpen={showInterviewForm}
                        onClose={() => setShowInterviewForm(false)}
                        onSuccess={() => {
                            fetchDashboardData();
                        }}
                        interview={selectedInterview}
                    />

                    <JobApplicationModal
                        isOpen={showApplicationForm}
                        onClose={() => setShowApplicationForm(false)}
                        onSuccess={() => {
                            fetchDashboardData();
                            toast.success("Application recorded successfully");
                        }}
                    />

                    <ShortlistModal
                        isOpen={showShortlistModal}
                        onClose={() => setShowShortlistModal(false)}
                        onSuccess={() => {
                            fetchDashboardData();
                        }}
                        mode={shortlistMode}
                    />

                </div>
            </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Recruitment">
            {content}
        </DashboardLayout>
    );
};

export default RecruitmentDashboard;

