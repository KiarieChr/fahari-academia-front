import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line,
    Legend,
    AreaChart,
    Area,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Users, Loader2, Activity, CalendarCheck, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';

const DashboardCharts = () => {
    const [data, setData] = useState({
        finance: [],
        workforce: [],
        loading: true,
        financialHealth: [],
        invoicingStatus: [],
        enrollmentTrend: [],
        collectionVelocity: [],
        attendanceTrends: [],
        academicPerformance: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all potential data sources
                const [payrollRes, financeRes, dashStatsRes, lessonRes, examRes] = await Promise.allSettled([
                    api.workforce.getPayrollSummary(),
                    api.fees.getInsights(),
                    import('../../services/dashboardService').then(m => m.dashboardService.getStats()),
                    api.lessonSessions.getAnalytics(),
                    api.examination.getExams()
                ]);

                const payroll = payrollRes.status === 'fulfilled' ? (payrollRes.value.data || payrollRes.value) : {};
                const financeData = financeRes.status === 'fulfilled' ? (financeRes.value.data || financeRes.value) : {};
                const dashStats = dashStatsRes.status === 'fulfilled' ? (dashStatsRes.value.data || dashStatsRes.value) : {};
                const lessonData = lessonRes.status === 'fulfilled' ? (lessonRes.value.data || lessonRes.value) : {};
                const examData = examRes.status === 'fulfilled' ? (examRes.value.data || examRes.value) : {};
                
                // 1. Prepare Revenue vs Expenses Data
                const financialHealth = [
                    {
                        name: 'Revenue (Fees)',
                        amount: financeData.collection?.total_collected || dashStats?.total_revenue || 0,
                        color: '#10b981'
                    },
                    {
                        name: 'Expenses (Payroll)',
                        amount: payroll?.gross_payroll || dashStats?.total_expenses || 0,
                        color: '#f43f5e'
                    }
                ];

                // 2. Prepare Invoicing Status Data
                const invoicingStatus = [
                    { name: 'Invoiced', value: financeData.invoicing?.invoiced || dashStats?.invoiced_amount || 0 },
                    { name: 'Pending', value: financeData.invoicing?.not_invoiced || dashStats?.pending_amount || 0 }
                ];

                // 3. Prepare Student Population Trend
                const enrollmentTrend = dashStats?.enrollment_trend || dashStats?.student_population_trend || [];

                // 4. Prepare Fee Collection Velocity
                const collectionVelocity = financeData?.collection_velocity || dashStats?.collection_velocity || [];

                // 5. Prepare Daily Attendance
                const attendanceTrends = lessonData?.attendance_trends || dashStats?.attendance_trends || [];

                // 6. Prepare Academic Performance
                const academicPerformance = examData?.academic_performance || dashStats?.academic_performance || [];

                setData({
                    financialHealth,
                    invoicingStatus,
                    enrollmentTrend,
                    collectionVelocity,
                    attendanceTrends,
                    academicPerformance,
                    loading: false
                });
            } catch (error) {
                console.error("Failed to fetch chart data", error);
                setData(prev => ({ ...prev, loading: false }));
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#6366f1', '#e2e8f0'];

    if (data.loading) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-300" size={32} />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 1. Financial Health Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <BarChart3 size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Financial Health</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">Revenue vs Payroll</p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.financialHealth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickFormatter={(value) => `KSh ${value > 1000 ? (value / 1000) + 'k' : value}`}
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
                                {data.financialHealth?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* 2. Student Population Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Student Population</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">6 Month Growth Trend</p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.enrollmentTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="students" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* 3. Invoicing Coverage */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <PieChartIcon size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Invoicing Coverage</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">Term Enrolment Status</p>
                    </div>
                </div>

                <div className="h-[250px] w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.invoicingStatus}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.invoicingStatus?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-slate-800">
                            {data.invoicingStatus?.[0]?.value + data.invoicingStatus?.[1]?.value}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Students</span>
                    </div>
                </div>
            </motion.div>

            {/* 4. Fee Collection Velocity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Activity size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Collection Velocity</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">Weekly Cash Flow Pace</p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.collectionVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="week" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickFormatter={(value) => `${value}k`}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVelocity)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* 5. Daily Attendance Trends */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                        <CalendarCheck size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Attendance Trends</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">Staff & Students (%)</p>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.attendanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="day" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                domain={[80, 100]}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            <Line type="monotone" dataKey="students" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Students" />
                            <Line type="monotone" dataKey="staff" stroke="#64748b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Staff" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* 6. Academic Performance Index */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm"
            >
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <GraduationCap size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">Academic Index</h3>
                        <p className="text-xs text-slate-400 uppercase tracking-tighter font-semibold">Average Score by Department</p>
                    </div>
                </div>

                <div className="h-[250px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.academicPerformance}>
                            <PolarGrid stroke="#f1f5f9" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Score" dataKey="score" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default DashboardCharts;
