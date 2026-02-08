import React from 'react';
import { Layout, Users, CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SessionStats = () => {
    const kpiData = [
        { title: 'Total Sessions', value: '42', subtitle: 'Scheduled Today', icon: Layout, color: 'indigo' },
        { title: 'Ongoing', value: '8', subtitle: 'Active Now', icon: Clock, color: 'blue' },
        { title: 'Completed', value: '30', subtitle: 'Finished', icon: CheckCircle, color: 'green' },
        { title: 'Missed', value: '4', subtitle: 'No Show / Late', icon: AlertTriangle, color: 'red' },
        { title: 'Avg Attendance', value: '94%', subtitle: 'Across all streams', icon: Users, color: 'purple' },
        { title: 'Content Delay', value: '2', subtitle: 'Classes Behind', icon: TrendingUp, color: 'orange' },
    ];

    const chartData = [
        { name: 'G1', sessions: 6 },
        { name: 'G2', sessions: 5 },
        { name: 'G3', sessions: 7 },
        { name: 'G4', sessions: 6 },
        { name: 'G5', sessions: 5 },
        { name: 'G6', sessions: 8 },
        { name: 'JSS1', sessions: 5 },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KPI Cards Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                {kpiData.map((kpi, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg bg-${kpi.color}-50 text-${kpi.color}-600`}>
                                <kpi.icon size={20} />
                            </div>
                            {index === 1 && <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                            <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{kpi.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mini Chart */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sessions by Grade</h3>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SessionStats;
