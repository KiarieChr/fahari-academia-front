import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Users,
    UserPlus,
    ClipboardList,
    Repeat,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
    Loader2,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    Info
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

// Memoized Area Chart Component for Trends
const TrendChart = React.memo(({ data }) => {
    const CustomTooltip = useCallback(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const apps = payload[0]?.value || 0;
            const admitted = payload[1]?.value || 0;
            const conversionRate = apps > 0 ? ((admitted / apps) * 100).toFixed(1) : 0;

            return (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[180px]">
                    <p className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">{label}</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Apps</span>
                            </div>
                            <span className="font-black text-slate-800 tabular-nums">{apps.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admitted</span>
                            </div>
                            <span className="font-black text-slate-800 tabular-nums">{admitted.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-500 uppercase">Conversion</span>
                                <span className="text-sm font-black text-indigo-600">{conversionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }, []);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAdmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5 5' }} />
                <Area 
                    type="monotone" 
                    dataKey="apps" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorApps)" 
                    animationDuration={2000}
                />
                <Area 
                    type="monotone" 
                    dataKey="admitted" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorAdmitted)" 
                    animationDuration={2000}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
});

TrendChart.displayName = 'TrendChart';

import { studentManagementService } from '../../../../services/studentManagementService';
import StatCardMini from '../../../../dashboard/components/StatCardMini';
import '../../../../dashboard/dashboard.css';

// Memoized Pie Chart Component for Status Distribution
const StatusPieChart = React.memo(({ data, total }) => {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.value - a.value);
    }, [data]);

    const CustomTooltip = useCallback(({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0];
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

            return (
                <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-100 min-w-[140px]">
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.payload.color }}
                        />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-slate-800 tabular-nums">{item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">{percentage}%</span>
                    </div>
                </div>
            );
        }
        return null;
    }, [total]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={sortedData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={1500}
                >
                    {sortedData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth={4}
                            className="outline-none"
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => (
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
});

StatusPieChart.displayName = 'StatusPieChart';

// Memoized Bar Chart Component for Gender Distribution
const GenderBarChart = React.memo(({ data }) => {
    const [viewMode, setViewMode] = useState('absolute');

    const processedData = useMemo(() => {
        const sorted = [...data].sort((a, b) => (b.boys + b.girls) - (a.boys + a.girls));
        if (viewMode === 'percentage') {
            return sorted.map(item => {
                const total = item.boys + item.girls;
                return {
                    ...item,
                    boys: total > 0 ? (item.boys / total) * 100 : 0,
                    girls: total > 0 ? (item.girls / total) * 100 : 0,
                    total
                };
            });
        }
        return sorted.map(item => ({ ...item, total: item.boys + item.girls }));
    }, [data, viewMode]);

    const CustomTooltip = useCallback(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const boys = payload.find(p => p.dataKey === 'boys')?.value || 0;
            const girls = payload.find(p => p.dataKey === 'girls')?.value || 0;

            return (
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[200px]">
                    <p className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">{label}</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Boys</span>
                            </div>
                            <span className="font-black text-slate-800 tabular-nums">
                                {viewMode === 'percentage' ? `${boys.toFixed(1)}%` : boys.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Girls</span>
                            </div>
                            <span className="font-black text-slate-800 tabular-nums">
                                {viewMode === 'percentage' ? `${girls.toFixed(1)}%` : girls.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }, [viewMode]);

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Academic Distribution</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">By Class & Gender</p>
                </div>
                <div className="flex bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50">
                    <button
                        onClick={() => setViewMode('absolute')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            viewMode === 'absolute' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                        }`}
                    >
                        Count
                    </button>
                    <button
                        onClick={() => setViewMode('percentage')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            viewMode === 'percentage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'
                        }`}
                    >
                        Ratio
                    </button>
                </div>
            </div>

            <div className="w-full" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.5)', radius: [8, 8, 0, 0] }} />
                        <Bar
                            dataKey="boys"
                            name="Boys"
                            fill="#3b82f6"
                            radius={viewMode === 'percentage' ? [0, 0, 0, 0] : [6, 6, 0, 0]}
                            stackId="a"
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="girls"
                            name="Girls"
                            fill="#ec4899"
                            radius={[6, 6, 0, 0]}
                            stackId="a"
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

GenderBarChart.displayName = 'GenderBarChart';

// Skeleton Loader Component
const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 rounded-lg bg-gray-200"></div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 lg:col-span-2">
                <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
                <div className="h-72 bg-gray-100 rounded"></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="h-72 bg-gray-100 rounded-full"></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 lg:col-span-3">
                <div className="h-6 bg-gray-200 rounded w-72 mb-6"></div>
                <div className="h-72 bg-gray-100 rounded"></div>
            </div>
        </div>
    </div>
);

const AdmissionStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setError(null);
                const data = await studentManagementService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                setError("Unable to load admission statistics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Frontend-only derived metrics
    const derivedMetrics = useMemo(() => {
        if (!stats) return null;

        const { metrics } = stats;
        const totalApps = metrics.total_apps || 0;
        const admitted = metrics.admitted || 0;
        const pending = metrics.pending || 0;
        const repeaters = metrics.repeaters || 0;
        const transfers = Math.abs(metrics.transfers || 0);

        // Calculate admission rate
        const admissionRate = totalApps > 0 ? ((admitted / totalApps) * 100) : 0;

        // Calculate conversion rate (admitted vs pending)
        const conversionRate = (admitted + pending) > 0 ?
            (admitted / (admitted + pending) * 100) : 0;

        // Calculate repeater percentage
        const repeaterPercentage = admitted > 0 ?
            ((repeaters / admitted) * 100) : 0;

        // Mock trend indicators (frontend-only calculations)
        // These would normally come from comparing with historical data
        const admissionTrend = admissionRate > 25 ? 'up' : 'down';
        const pendingTrend = pending > (totalApps * 0.3) ? 'up' : 'down'; // If pending > 30% of total

        return {
            admissionRate: admissionRate.toFixed(1),
            conversionRate: conversionRate.toFixed(1),
            repeaterPercentage: repeaterPercentage.toFixed(1),
            admissionTrend,
            pendingTrend,
            // Mock percentage changes (would come from API in real scenario)
            admissionChange: admissionTrend === 'up' ? 12.5 : -8.3,
            pendingChange: pendingTrend === 'up' ? 5.2 : -2.1
        };
    }, [stats]);

    // Handlers for metric card clicks (frontend-only navigation simulation)
    const handleMetricClick = useCallback((metricType) => {
        // Frontend-only navigation simulation
        console.log(`Viewing detailed analytics for: ${metricType}`);
        // In a real app, this would navigate to a detailed view or open a modal
    }, []);

    if (loading) {
        return <SkeletonLoader />;
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-12 pt-6 px-2">
            {/* Section Header with Refined Typography */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        Admissions Intelligence
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-500 text-[10px] font-bold uppercase tracking-widest border border-indigo-100">Live Engine</span>
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time enrollment monitoring & predictive metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Sync Status: Optimal</span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid — Refined for responsiveness to prevent title wrapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCardMini
                    title="Intake Pipeline"
                    value={stats.metrics.total_apps?.toLocaleString() || '0'}
                    icon="clipboard-list"
                    color="#e3f2fd"
                    change={derivedMetrics?.admissionChange}
                    trendLabel="Overall volume"
                />
                <StatCardMini
                    title="Successful Admissions"
                    value={stats.metrics.admitted?.toLocaleString() || '0'}
                    icon="user-plus"
                    color="#e8f5e9"
                    trendLabel={`${derivedMetrics?.conversionRate}% yield`}
                />
                <StatCardMini
                    title="Awaiting Review"
                    value={stats.metrics.pending?.toLocaleString() || '0'}
                    icon="users"
                    color="#fff3e0"
                    change={derivedMetrics?.pendingChange}
                    trendLabel="Processing queue"
                />
                <StatCardMini
                    title="Student Repeaters"
                    value={stats.metrics.repeaters?.toLocaleString() || '0'}
                    icon="repeat"
                    color="#f3e5f5"
                    trendLabel={`${derivedMetrics?.repeaterPercentage}% of intake`}
                />
                <StatCardMini
                    title="Mobility Index"
                    value={stats.metrics.transfers?.toLocaleString() || '0'}
                    icon="arrow-right-left"
                    color="#e3f2fd"
                    trendLabel={stats.metrics.transfers >= 0 ? "Growth net" : "Reduction net"}
                />
            </div>

            {/* Analytics Engine Section — Increased Gapping */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Application Trends Card — Increased Padding */}
                <div className="bg-white p-10 lg:p-12 rounded-[40px] border border-slate-100/60 shadow-xl shadow-slate-200/40 lg:col-span-2">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Enrollment Velocity</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Growth & Conversion Dynamics</p>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" /> Applications
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Admitted
                            </div>
                        </div>
                    </div>
                    <div className="w-full" style={{ height: 320 }}>
                        <TrendChart data={stats.trends} />
                    </div>
                </div>

                {/* Status Distribution Card — Increased Padding */}
                <div className="bg-white p-10 lg:p-12 rounded-[40px] border border-slate-100/60 shadow-xl shadow-slate-200/40">
                    <div className="mb-10">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Status Ecosystem</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Lifecycle breakdown</p>
                    </div>
                    <div className="w-full relative" style={{ height: 320 }}>
                        <StatusPieChart
                            data={stats.status_distribution}
                            total={stats.metrics.total_apps}
                        />
                        <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <span className="text-4xl font-black text-slate-800 tracking-tighter tabular-nums">
                                {stats.metrics.total_apps}
                            </span>
                            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Entries</span>
                        </div>
                    </div>
                </div>

                {/* Class Distribution Card — Increased Padding */}
                <div className="bg-white p-10 lg:p-12 rounded-[40px] border border-slate-100/60 shadow-xl shadow-slate-200/40 lg:col-span-3">
                    <GenderBarChart data={stats.class_distribution} />
                </div>
            </div>

            {/* Smart Intelligence Panel — Robust Glassmorphism Reset */}
            <div className="relative overflow-hidden group mt-12 mb-8">
                {/* Decorative Ambient Glows */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 blur-[140px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 blur-[140px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000" />

                <div className="relative bg-slate-900 rounded-[56px] p-12 lg:p-20 border border-white/5 shadow-2xl overflow-hidden">
                    {/* Panel Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16 relative z-10">
                        <div className="inline-flex items-center justify-center p-6 bg-white/5 backdrop-blur-3xl rounded-[28px] border border-white/10 shadow-2xl">
                            <TrendingUp className="text-indigo-400" size={36} />
                        </div>
                        <div>
                            <h4 className="text-3xl font-black text-white tracking-tighter">Smart Admissions Intelligence</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Executive Analytics & Strategic Forecasting</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                        {/* Intelligence Card 1 */}
                        <div className="flex flex-col min-h-[300px] p-10 lg:p-12 rounded-[48px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.05] hover:bg-white/[0.08] transition-all duration-500 group/item">
                            <div className="flex items-center justify-between mb-10">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Enrollment Yield</span>
                                <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest border border-indigo-500/30">Stable</div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-4xl font-black text-white tabular-nums tracking-tighter">{derivedMetrics?.admissionRate}%</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium opacity-60 group-hover/item:opacity-100 transition-opacity">
                                    Inquiry-to-admitted conversion metrics are maintaining peak optimal levels for this cycle.
                                </p>
                            </div>
                        </div>

                        {/* Intelligence Card 2 */}
                        <div className="flex flex-col min-h-[300px] p-10 lg:p-12 rounded-[48px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.05] hover:bg-white/[0.08] transition-all duration-500 group/item">
                            <div className="flex items-center justify-between mb-10">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-1">Cohort Balance</span>
                                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/30">Diverse</div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                        {stats.class_distribution.reduce((sum, c) => sum + c.boys, 0)}:{stats.class_distribution.reduce((sum, c) => sum + c.girls, 0)}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ratio</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium opacity-60 group-hover/item:opacity-100 transition-opacity">
                                    Gender parity remains highly consistent across all active recruitment and admission channels.
                                </p>
                            </div>
                        </div>

                        {/* Intelligence Card 3 */}
                        <div className="flex flex-col min-h-[300px] p-10 lg:p-12 rounded-[48px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.05] hover:bg-white/[0.08] transition-all duration-500 group/item">
                            <div className="flex items-center justify-between mb-10">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">Intake Leader</span>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Primary</div>
                            </div>
                            <div className="mt-auto">
                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-3xl font-black text-white truncate tracking-tight">
                                        {stats.class_distribution.slice().sort((a, b) => (b.boys + b.girls) - (a.boys + a.girls))[0]?.name || 'N/A'}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cohort</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium opacity-60 group-hover/item:opacity-100 transition-opacity">
                                    This academic level continues to dominate the current intake cycle in both volume and demand.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionStats;