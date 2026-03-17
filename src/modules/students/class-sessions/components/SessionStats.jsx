import React, { useState } from 'react';
import { Layout, Users, CheckCircle, AlertTriangle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Hardcoded color maps — avoids Tailwind JIT purging dynamic class names
const colorMap = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', bar: '#6366f1' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: '#3b82f6' },
    green: { bg: 'bg-green-50', text: 'text-green-600', bar: '#10b981' },
    red: { bg: 'bg-red-50', text: 'text-red-600', bar: '#ef4444' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: '#8b5cf6' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: '#f59e0b' },
};

const chartDataSets = {
    today: [
        { name: 'G1', sessions: 6 }, { name: 'G2', sessions: 5 },
        { name: 'G3', sessions: 7 }, { name: 'G4', sessions: 6 },
        { name: 'G5', sessions: 5 }, { name: 'G6', sessions: 8 },
        { name: 'JSS1', sessions: 5 },
    ],
    week: [
        { name: 'G1', sessions: 28 }, { name: 'G2', sessions: 24 },
        { name: 'G3', sessions: 33 }, { name: 'G4', sessions: 29 },
        { name: 'G5', sessions: 22 }, { name: 'G6', sessions: 36 },
        { name: 'JSS1', sessions: 25 },
    ],
    month: [
        { name: 'G1', sessions: 112 }, { name: 'G2', sessions: 98 },
        { name: 'G3', sessions: 130 }, { name: 'G4', sessions: 115 },
        { name: 'G5', sessions: 90 }, { name: 'G6', sessions: 142 },
        { name: 'JSS1', sessions: 100 },
    ],
};

const SessionStats = ({ analytics = null }) => {
    const [chartPeriod, setChartPeriod] = useState('today');

    // Derive KPIs from analytics, falling back to '—' when not yet loaded
    const total     = analytics?.planned_sessions   ?? null;
    const ongoing   = analytics?.ongoing_sessions   ?? null;
    const completed = analytics?.completed_sessions ?? null;
    const cancelled = (analytics?.cancelled_sessions ?? 0) + (analytics?.missed_sessions ?? 0);
    const attendanceRate = analytics?.overall_attendance_rate ?? null;

    const fmt = (v) => (v === null ? '—' : String(v));
    const fmtPct = (v) => (v === null ? '—' : `${Math.round(v)}%`);

    const kpiData = [
        {
            title: 'Total Sessions', value: fmt(total), subtitle: 'Scheduled today',
            icon: Layout, color: 'indigo', change: null,
        },
        {
            title: 'Ongoing', value: fmt(ongoing), subtitle: 'Active right now',
            icon: Clock, color: 'blue', live: !!analytics, change: null,
        },
        {
            title: 'Completed', value: fmt(completed),
            subtitle: total ? `${Math.round(((completed ?? 0) / total) * 100)}% of today` : 'Today',
            icon: CheckCircle, color: 'green', change: null,
        },
        {
            title: 'Cancelled / Missed', value: fmt(cancelled || null), subtitle: 'Need follow-up',
            icon: AlertTriangle, color: 'red', change: null,
        },
        {
            title: 'Avg Attendance', value: fmtPct(attendanceRate), subtitle: 'Across all streams',
            icon: Users, color: 'purple', change: null,
        },
        {
            title: 'Completion Rate',
            value: total ? `${Math.round(((completed ?? 0) / total) * 100)}%` : '—',
            subtitle: 'Sessions finished',
            icon: TrendingUp, color: 'amber', change: null,
        },
    ];

    const progressPct = total ? Math.round(((completed ?? 0) / total) * 100) : 0;

    return (
        <div className="space-y-4">
            {/* Operational progress bar */}
            <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4
                            shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">Today's Session Progress</span>
                    <span className="text-sm font-bold text-indigo-600 tabular-nums">
                        {fmt(completed)} <span className="font-normal text-gray-400">/ {fmt(total)} sessions</span>
                    </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400
                                   transition-all duration-700"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-400">{fmt(ongoing)} ongoing · {fmt(cancelled || null)} cancelled</span>
                    <span className="text-xs font-semibold text-indigo-600">{progressPct}% complete</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* KPI Cards */}
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {kpiData.map((kpi, index) => {
                        const c = colorMap[kpi.color];
                        return (
                            <div
                                key={index}
                                className="relative bg-white p-4 rounded-2xl border border-gray-100
                                           shadow-[0_1px_3px_rgba(0,0,0,0.05)]
                                           hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                                           transition-all duration-200 group"
                            >
                                {/* top accent strip */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r
                                                from-indigo-400 via-indigo-500 to-indigo-400 rounded-t-2xl" />
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${c.bg} ${c.text} transition-transform
                                                    duration-200 group-hover:scale-110`}>
                                        <kpi.icon size={18} />
                                    </div>
                                    {kpi.live && (
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full
                                                             rounded-full bg-blue-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                                        </span>
                                    )}
                                    {kpi.change && (
                                        <span className={`inline-flex items-center gap-0.5 text-[0.65rem] font-bold
                                                         px-1.5 py-0.5 rounded-full ${kpi.change.dir === 'up'
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            {kpi.change.dir === 'up'
                                                ? <TrendingUp size={9} />
                                                : <TrendingDown size={9} />}
                                            {kpi.change.label}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none mb-1">
                                    {kpi.value}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
                                <p className="text-[0.7rem] text-gray-400 mt-0.5">{kpi.subtitle}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Chart with period filter */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100
                                shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-gray-900">Sessions by Grade</h3>
                        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                            {['today', 'week', 'month'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setChartPeriod(p)}
                                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${chartPeriod === p
                                            ? 'bg-white text-indigo-700 shadow-sm border border-gray-100'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[210px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataSets[chartPeriod]} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#9ca3af" />
                                <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="#9ca3af" />
                                <Tooltip
                                    cursor={{ fill: '#f5f3ff' }}
                                    contentStyle={{
                                        borderRadius: '10px', border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Bar dataKey="sessions" name="Sessions" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionStats;
