import React from 'react';
import {
    Users, TrendingUp, BookOpen, AlertCircle,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    AreaChart, Area
} from 'recharts';

const ReportsOverview = ({ curriculum }) => {
    // Mock Data based on curriculum
    const metrics = [
        { label: 'Total Assessed', value: '450', sub: '98% Attendance', icon: Users, color: 'blue' },
        { label: curriculum === 'CBC' ? 'Exceeding Exp.' : 'Distinctions (A*-A)', value: curriculum === 'CBC' ? '120' : '85', sub: '+12% vs last term', icon: TrendingUp, color: 'emerald' },
        { label: 'Class Average', value: curriculum === 'CBC' ? 'Meets Exp.' : '72% (B)', sub: 'Top 10% in School', icon: BookOpen, color: 'violet' },
        { label: 'Needs Support', value: '18', sub: 'Action Plan Required', icon: AlertCircle, color: 'amber' },
    ];

    const gradeData = curriculum === 'CBC'
        ? [
            { name: 'EE', count: 120 }, { name: 'ME', count: 210 },
            { name: 'AE', count: 85 }, { name: 'BE', count: 35 }
        ]
        : [
            { name: 'A*', count: 25 }, { name: 'A', count: 60 }, { name: 'B', count: 110 },
            { name: 'C', count: 140 }, { name: 'D', count: 65 }, { name: 'E', count: 30 }, { name: 'U', count: 20 }
        ];

    const radarData = [
        { subject: 'Math', A: 120, B: 110, fullMark: 150 },
        { subject: 'Eng', A: 98, B: 130, fullMark: 150 },
        { subject: 'Sci', A: 86, B: 130, fullMark: 150 },
        { subject: 'Hist', A: 99, B: 100, fullMark: 150 },
        { subject: 'Geog', A: 85, B: 90, fullMark: 150 },
        { subject: 'Arts', A: 65, B: 85, fullMark: 150 },
    ];

    const themeColor = curriculum === 'CBC' ? '#0d9488' : '#4f46e5'; // Teal vs Indigo

    const attendanceData = [
        { month: 'Jan', attendance: 92 },
        { month: 'Feb', attendance: 95 },
        { month: 'Mar', attendance: 88 },
        { month: 'Apr', attendance: 96 },
        { month: 'May', attendance: 98 },
        { month: 'Jun', attendance: 94 },
    ];

    const gradingSchemes = {
        CBC: [
            { grade: 'EE', range: '80-100%', desc: 'Exceeding Expectations', color: 'bg-teal-100 text-teal-800' },
            { grade: 'ME', range: '65-79%', desc: 'Meeting Expectations', color: 'bg-emerald-100 text-emerald-800' },
            { grade: 'AE', range: '50-64%', desc: 'Approaching Expectations', color: 'bg-yellow-100 text-yellow-800' },
            { grade: 'BE', range: '0-49%', desc: 'Below Expectations', color: 'bg-red-100 text-red-800' },
        ],
        IGCSE: [
            { grade: 'A*', range: '90-100%', desc: 'Outstanding', color: 'bg-indigo-100 text-indigo-800' },
            { grade: 'A', range: '80-89%', desc: 'Excellent', color: 'bg-blue-100 text-blue-800' },
            { grade: 'B', range: '70-79%', desc: 'Very Good', color: 'bg-cyan-100 text-cyan-800' },
            { grade: 'C', range: '60-69%', desc: 'Good', color: 'bg-green-100 text-green-800' },
            { grade: 'D', range: '50-59%', desc: 'Pass', color: 'bg-yellow-100 text-yellow-800' },
            { grade: 'E', range: '40-49%', desc: 'Weak Pass', color: 'bg-orange-100 text-orange-800' },
            { grade: 'U', range: '0-39%', desc: 'Ungraded', color: 'bg-red-100 text-red-800' },
        ]
    };

    const currentScheme = gradingSchemes[curriculum] || gradingSchemes.IGCSE;

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className={`p-2.5 rounded-xl bg-${m.color}-50 dark:bg-${m.color}-900/20 text-${m.color}-600`}>
                                <m.icon size={20} />
                            </div>
                            {m.sub.includes('+') ? (
                                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={12} className="mr-0.5" /> {m.sub.split(' ')[0]}
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-slate-500">{m.sub}</span>
                            )}
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{m.value}</h3>
                            <p className="text-sm font-medium text-slate-500">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                        {curriculum === 'CBC' ? 'Performance Level Distribution' : 'Grade Distribution'}
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill={themeColor} radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Performance Radar (or Bar comparison) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                        Subject Performance Analysis
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Class Average" dataKey="A" stroke={themeColor} fill={themeColor} fillOpacity={0.3} />
                                <Legend />
                                <RechartsTooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Attendance & Grading Scheme Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Trends */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Average Attendance Trends</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">Term 1 2024</span>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={attendanceData}>
                                <defs>
                                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={themeColor} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={themeColor} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={[80, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attendance"
                                    stroke={themeColor}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAttendance)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grading Scheme Reference */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Grading Scheme ({curriculum})
                    </h3>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {currentScheme.map((grade, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3">
                                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${grade.color}`}>
                                        {grade.grade}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{grade.desc}</span>
                                        <span className="text-xs text-slate-500">{grade.range}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-center text-slate-400">
                            * Based on current academic policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsOverview;
