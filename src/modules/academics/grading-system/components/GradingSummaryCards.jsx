import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, BookOpen, GraduationCap } from 'lucide-react';

const GradingSummaryCards = () => {
    const stats = [
        {
            label: 'Active Systems',
            value: 4,
            subtext: 'Across 3 Curricula',
            icon: Layers,
            color: 'blue',
            trend: '+1 this term'
        },
        {
            label: 'Total Grades',
            value: 28,
            subtext: 'Defined Levels',
            icon: GraduationCap,
            color: 'purple',
            trend: 'Stable'
        },
        {
            label: 'Linked Subjects',
            value: 124,
            subtext: 'Using Grading Rules',
            icon: BookOpen,
            color: 'emerald',
            trend: '98% Coverage'
        },
        {
            label: 'Validation Issues',
            value: 2,
            subtext: 'Requires Attention',
            icon: AlertTriangle,
            color: 'amber',
            trend: 'Low Priority'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={22} />
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${stat.color}-50 dark:bg-${stat.color}-900/10 text-${stat.color}-600`}>
                            {stat.trend}
                        </span>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                            {stat.value}
                        </h4>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{stat.label}</p>
                        <p className="text-xs text-slate-400 mt-1">{stat.subtext}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GradingSummaryCards;
