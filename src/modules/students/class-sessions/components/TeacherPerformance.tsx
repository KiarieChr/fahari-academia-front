import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Shorten long teacher names for chart axis
const shortName = (name = '') => {
    const parts = name.trim().split(' ');
    // e.g. "John Omondi" → "J. Omondi"
    return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name;
};

const TeacherPerformance = ({ analytics = null }) => {
    const [period, setPeriod] = useState('month');

    // analytics.teacher_workload: [{teacher_name, sessions_count, attendance_rate, ...}]
    const workload = analytics?.teacher_workload ?? [];

    const data = useMemo(() => {
        if (workload.length === 0) return [];
        return workload.map(t => ({
            name: shortName(t.teacher_name ?? t.name ?? 'Unknown'),
            sessions: t.sessions_count ?? t.sessions ?? 0,
            attendance: Math.round(t.attendance_rate ?? t.attendance ?? 0),
        }));
    }, [workload]);

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden
                        shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Teacher Performance</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Sessions conducted &amp; avg. attendance %</p>
                </div>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                    {['week', 'month', 'term'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${period === p
                                ? 'bg-white text-indigo-700 shadow-sm border border-gray-100'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            {data.length === 0 && (
                <p className="text-sm text-gray-400 text-center pb-4">
                    {analytics ? 'No teacher workload data available.' : 'Loading data…'}
                </p>
            )}
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} stroke="#6b7280" />
                        <YAxis axisLine={false} tickLine={false} fontSize={11} stroke="#6b7280" />
                        <Tooltip
                            cursor={{ fill: '#f5f3ff' }}
                            contentStyle={{
                                borderRadius: '10px', border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        <Bar dataKey="sessions" name="Sessions Conducted" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="attendance" name="Avg. Attendance %" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TeacherPerformance;
