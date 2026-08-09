import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Loader, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { recruitmentService } from '../services/recruitmentService';
import OnboardingStage from '../workflow/components/OnboardingStage';

const PROGRESS_COLOR = (p) => {
    if (p === 100) return 'bg-emerald-500';
    if (p >= 60) return 'bg-blue-500';
    if (p >= 30) return 'bg-amber-500';
    return 'bg-slate-300';
};

const OnboardingPage = () => {
    // In a full implementation, we'd list all applications in onboarding stage
    // and let the HR click to manage each one.
    const [onboardingList, setOnboardingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [onboardingData, setOnboardingData] = useState(null);

    const fetchOnboarding = async () => {
        try {
            setLoading(true);
            // Fetch applications that are in the hired/onboarding stage
            const data = await recruitmentService.getApplications({ status: 'hired' });
            const apps = Array.isArray(data) ? data : (data.results || []);
            setOnboardingList(apps);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load onboarding data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOnboarding(); }, []);

    const handleOpenOnboarding = async (app) => {
        setSelected(app);
        try {
            const data = await recruitmentService.getOnboarding(app.id);
            setOnboardingData(data ? {
                profileCreated: data.profile_created,
                systemAccess: data.system_access_granted,
                departmentAssigned: data.department_assigned,
                timetableAssigned: data.timetable_assigned,
                documentsSubmitted: data.documents_submitted,
                progress: data.progress_percentage,
            } : null);
        } catch {
            setOnboardingData(null);
        }
    };

    const handleOnboardingComplete = async (checklist) => {
        try {
            const existing = await recruitmentService.getOnboarding(selected.id);
            const payload = {
                application: selected.id,
                profile_created: checklist.profileCreated,
                system_access_granted: checklist.systemAccess,
                department_assigned: checklist.departmentAssigned,
                timetable_assigned: checklist.timetableAssigned,
                documents_submitted: checklist.documentsSubmitted,
                progress_percentage: checklist.progress,
                is_completed: checklist.progress === 100,
            };
            await recruitmentService.updateOnboarding(existing?.id || null, payload);
            toast.success('Onboarding updated!');
            fetchOnboarding();
        } catch (err) {
            toast.error('Failed to save onboarding progress');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader size={32} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (selected) {
        return (
            <div>
                <button
                    onClick={() => { setSelected(null); setOnboardingData(null); }}
                    className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                    <ChevronRight size={16} className="rotate-180" />
                    Back to Onboarding List
                </button>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                        Onboarding: {selected.full_name}
                    </h2>
                    <p className="text-slate-500 text-sm">
                        {typeof selected.job_opening === 'object' ? selected.job_opening?.title : selected.job_opening}
                    </p>
                </div>
                <OnboardingStage
                    data={onboardingData}
                    onComplete={handleOnboardingComplete}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Onboarding</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                        Track new hire onboarding progress
                    </p>
                </div>
            </div>

            {onboardingList.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <Briefcase size={40} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No active onboarding</h3>
                    <p className="text-slate-500 text-sm">Hired candidates will appear here for onboarding.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {onboardingList.map((app, idx) => {
                        const progress = app.onboarding_progress || 0;
                        const isComplete = progress === 100;
                        
                        return (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleOpenOnboarding(app)}
                                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                                            {(app.full_name || '?').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{app.full_name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {typeof app.job_opening === 'object' ? app.job_opening?.title : app.job_opening}
                                            </p>
                                        </div>
                                    </div>
                                    {isComplete ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                                            <CheckCircle size={11} /> Complete
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-full">
                                            <Clock size={11} /> In Progress
                                        </span>
                                    )}
                                </div>

                                {/* Progress bar */}
                                <div className="mb-2">
                                    <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                                        <span>Onboarding progress</span>
                                        <span className="font-semibold">{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${PROGRESS_COLOR(progress)}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-3">
                                    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                                        Manage <ChevronRight size={13} />
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OnboardingPage;
