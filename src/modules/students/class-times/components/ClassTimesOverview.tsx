import React from 'react';
import { Clock, BookOpen, Users, AlertTriangle, CheckCircle, LayoutGrid } from 'lucide-react';

const KPICard = ({ title, value, status, icon: Icon, color }) => {
    const statusColors = {
        success: 'text-green-600 bg-green-50 border-green-100',
        warning: 'text-amber-600 bg-amber-50 border-amber-100',
        error: 'text-red-600 bg-red-50 border-red-100',
        info: 'text-blue-600 bg-blue-50 border-blue-100',
        neutral: 'text-slate-600 bg-slate-50 border-slate-100',
    };

    const styles = statusColors[status] || statusColors.neutral;

    return (
        <div className={`p-5 rounded-2xl border ${styles} hover:shadow-md transition-shadow`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                </div>
                <div className="p-2 rounded-xl bg-white/50 backdrop-blur-sm">
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
};

const ClassTimesOverview = ({ metrics }) => {
    if (!metrics) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-in fade-in duration-500">
            <KPICard
                title={metrics.totalClasses.label}
                value={metrics.totalClasses.value}
                status={metrics.totalClasses.status}
                icon={LayoutGrid}
            />
            <KPICard
                title={metrics.totalSubjects.label}
                value={metrics.totalSubjects.value}
                status={metrics.totalSubjects.status}
                icon={BookOpen}
            />
            <KPICard
                title={metrics.totalSlots.label}
                value={metrics.totalSlots.value}
                status={metrics.totalSlots.status}
                icon={Clock}
            />
            <KPICard
                title={metrics.assignedTeachers.label}
                value={metrics.assignedTeachers.value}
                status={metrics.assignedTeachers.status}
                icon={Users}
            />
            <KPICard
                title={metrics.roomUtilization.label}
                value={metrics.roomUtilization.value}
                status={metrics.roomUtilization.status}
                icon={CheckCircle}
            />
            <KPICard
                title={metrics.conflicts.label}
                value={metrics.conflicts.value}
                status={metrics.conflicts.status}
                icon={AlertTriangle}
            />
        </div>
    );
};

export default ClassTimesOverview;
