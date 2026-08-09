import React from 'react';
import { Layers, GraduationCap, BookOpen, AlertTriangle } from 'lucide-react';

const GradingSummaryCards = ({ scales = [], activeScales = [], loading }) => {
    const activeSystems = scales.filter(s => s.is_active).length;
    const totalLevels = scales.reduce((sum, s) => sum + (s.level_count || 0), 0);
    const curriculaCount = new Set(scales.map(s => s.curriculum)).size;
    const activeScaleLevels = activeScales.reduce((sum, s) => sum + (s.level_count || 0), 0);

    const stats = [
        {
            label: 'Active Systems',
            value: loading ? '—' : activeSystems,
            subtext: `Across ${curriculaCount} Curricula`,
            icon: Layers,
            color: 'blue',
        },
        {
            label: 'Total Grades',
            value: loading ? '—' : totalLevels,
            subtext: 'Defined Levels',
            icon: GraduationCap,
            color: 'purple',
        },
        {
            label: 'Current Scales',
            value: loading ? '—' : activeScales.length,
            subtext: `${activeScaleLevels} levels defined`,
            icon: BookOpen,
            color: 'emerald',
        },
        {
            label: 'Scale Types',
            value: loading ? '—' : new Set(scales.map(s => s.scale_type)).size,
            subtext: [...new Set(scales.map(s => s.scale_type))].join(', ') || 'N/A',
            icon: AlertTriangle,
            color: 'amber',
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
