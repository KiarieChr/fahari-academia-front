import React from 'react';
import { User, UserPlus, Users, ArrowUpRight, ArrowDownRight, GraduationCap, ArrowRightLeft, UserMinus } from 'lucide-react';

const KPICard = ({ title, value, change, trend, icon: Icon, color, description }) => {
    const isPositive = trend === 'up';
    // Logic: For things like Dropouts/Transfers Out, 'down' is good (green), 'up' is bad (red)
    // But for general enrollment, 'up' is good.
    // Let's assume passed prop `trendUp` determines if Up is Good.
    // If not passed, assume Up is Good.

    const trendColor = isPositive ? 'text-green-600' : 'text-red-500';
    const bgColor = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    }[color] || 'bg-gray-50 text-gray-600';

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value?.toLocaleString() || 0}</h3>
                </div>
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex items-center gap-1`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {change}
                </span>
                <span className="text-xs text-slate-400">vs last term</span>
            </div>
        </div>
    );
};

const OverviewStats = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard
                title="Total Students"
                value={metrics?.totalStudents?.value || 0}
                change={metrics?.totalStudents?.change}
                trend={metrics?.totalStudents?.trend}
                icon={Users}
                color="blue"
            />
            <KPICard
                title="Active Students"
                value={metrics?.activeStudents?.value || 0}
                change={metrics?.activeStudents?.change}
                trend={metrics?.activeStudents?.trend}
                icon={User}
                color="green"
            />
            <KPICard
                title="New Admissions"
                value={metrics?.newAdmissions?.value || 0}
                change={metrics?.newAdmissions?.change}
                trend={metrics?.newAdmissions?.trend}
                icon={UserPlus}
                color="indigo"
            />
            <KPICard
                title="Transfers In"
                value={metrics?.transfersIn?.value || 0}
                change={metrics?.transfersIn?.change}
                trend={metrics?.transfersIn?.trend}
                icon={ArrowRightLeft}
                color="purple"
            />
            <KPICard
                title="Transfers Out"
                value={metrics?.transfersOut?.value || 0}
                change={metrics?.transfersOut?.change}
                trend={metrics?.transfersOut?.trend} // down is good, usually handled by prop logic but simple here
                icon={ArrowRightLeft}
                color="amber"
            />
            <KPICard
                title="Dropouts"
                value={metrics?.dropouts?.value || 0}
                change={metrics?.dropouts?.change}
                trend={metrics?.dropouts?.trend}
                icon={UserMinus}
                color="red"
            />
        </div>
    );
};

export default OverviewStats;
