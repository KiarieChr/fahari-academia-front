import React from 'react';
import { Mail, Phone } from 'lucide-react';

const RecentApplicantsWidget = ({ applicants = [] }) => {
    const displayApplicants = applicants.map((app, idx) => {
        const bgPalette = [
            'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
            'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
        ];
        return {
            name: app.full_name || `${app.first_name} ${app.last_name}`,
            role: `Applied for ${app.job_opening?.title || app.job_opening || 'Unknown Role'}`,
            initials: (app.first_name?.[0] || '') + (app.last_name?.[0] || ''),
            bg: bgPalette[idx % bgPalette.length],
            email: app.email,
            phone: app.phone
        };
    });

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">New Applicants</h3>
                <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors underline decoration-transparent hover:decoration-slate-400 underline-offset-4">
                    see all
                </button>
            </div>

            <div className="space-y-5">
                {displayApplicants.length > 0 ? displayApplicants.map((applicant, idx) => (
                    <div key={idx} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${applicant.bg || 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                {applicant.initials}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {applicant.name}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                    {applicant.role}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {applicant.email && (
                            <button className="p-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${applicant.email}`; }}>
                                <Mail size={14} />
                            </button>
                            )}
                            {applicant.phone && (
                            <button className="p-1.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 transition-colors" onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${applicant.phone}`; }}>
                                <Phone size={14} />
                            </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-sm text-slate-500 text-center py-4">No recent applicants</div>
                )}
            </div>
        </div>
    );
};

export default RecentApplicantsWidget;
