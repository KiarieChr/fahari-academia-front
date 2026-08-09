import React from 'react';

const SkeletonPulse = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`}></div>
);

const RecruitmentLoadingSkeleton = () => {
    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <SkeletonPulse className="h-8 w-64" />
                    <SkeletonPulse className="h-4 w-96" />
                </div>
                <div className="flex gap-3">
                    <SkeletonPulse className="h-10 w-32 rounded-xl" />
                    <SkeletonPulse className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                            <SkeletonPulse className="h-10 w-10 rounded-xl" />
                            <SkeletonPulse className="h-6 w-16 rounded-full" />
                        </div>
                        <SkeletonPulse className="h-8 w-24 mb-2" />
                        <SkeletonPulse className="h-4 w-32" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area Skeleton */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tabs Skeleton */}
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 inline-flex shadow-sm gap-2">
                        <SkeletonPulse className="h-9 w-24 rounded-lg" />
                        <SkeletonPulse className="h-9 w-24 rounded-lg" />
                        <SkeletonPulse className="h-9 w-24 rounded-lg" />
                    </div>

                    {/* Pipeline/Content Skeleton */}
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="min-w-[280px] w-full max-w-[320px] flex-shrink-0">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <SkeletonPulse className="h-5 w-32" />
                                    <SkeletonPulse className="h-5 w-8 rounded-full" />
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2 min-h-[400px] border border-slate-200/50 dark:border-slate-700/50 space-y-3">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm h-32" />
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm h-32" />
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm h-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentLoadingSkeleton;
