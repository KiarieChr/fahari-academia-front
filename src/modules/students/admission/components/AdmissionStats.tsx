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
    Info,
    Sparkles,
    Calendar,
    MapPin,
    Layers,
    BarChart3,
    LineChart,
    BookOpen
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

import { studentManagementService } from '../../../../services/studentManagementService';
import { institutionService } from '../../../../services/institutionService';
import StatCardMini from '../../../../dashboard/components/StatCardMini';
import '../../../../dashboard/dashboard.css';

// Memoized Chart Component for Trends (supporting Area/Bar and Highlighting)
const TrendChart = React.memo(({ data, chartType = 'area', highlightMetric = null }) => {
    // Read live CSS variable values so the chart inherits the active dashboard theme
    const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const textMuted     = cssVar('--text-muted')      || '#94a3b8';
    const borderLight   = cssVar('--border-color-light') || '#eaedf3';
    const primaryColor  = cssVar('--primary-color')   || '#3f51b5';
    const cardBg        = cssVar('--card-bg')          || '#ffffff';
    const textMain      = cssVar('--text-main')        || '#1e293b';
    const textSecondary = cssVar('--text-secondary')   || '#64748b';

    const CustomTooltip = useCallback(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const apps = payload[0]?.value || 0;
            const admitted = payload[1]?.value || 0;
            const conversionRate = apps > 0 ? ((admitted / apps) * 100).toFixed(1) : 0;

            return (
                <div style={{
                    background: cardBg,
                    border: `1px solid ${borderLight}`,
                    color: textMain,
                }} className="backdrop-blur-md p-4 rounded-2xl shadow-2xl min-w-[180px]">
                    <p className="font-bold mb-3 pb-2" style={{ color: textMain, borderBottom: `1px solid ${borderLight}` }}>{label}</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Apps</span>
                            </div>
                            <span className="font-black tabular-nums" style={{ color: textMain }}>{apps.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: textSecondary }}>Admitted</span>
                            </div>
                            <span className="font-black tabular-nums" style={{ color: textMain }}>{admitted.toLocaleString()}</span>
                        </div>
                        <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${borderLight}` }}>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>Conversion</span>
                                <span className="text-sm font-black" style={{ color: primaryColor }}>{conversionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }, [cardBg, borderLight, textMain, textSecondary, primaryColor]);

    const isAppsActive = highlightMetric === null || highlightMetric === 'apps';
    const isAdmittedActive = highlightMetric === null || highlightMetric === 'admitted';

    if (chartType === 'bar') {
        return (
            <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderLight} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: textMuted, fontSize: 11, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: textMuted, fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{ fill: `${borderLight}99`, radius: [6, 6, 0, 0] }}
                    />
                    <Bar 
                        dataKey="apps" 
                        name="Applications" 
                        fill="#3b82f6" 
                        radius={[6, 6, 0, 0]}
                        opacity={isAppsActive ? 1 : 0.15}
                        animationDuration={1500}
                    />
                    <Bar 
                        dataKey="admitted" 
                        name="Admissions" 
                        fill="#10b981" 
                        radius={[6, 6, 0, 0]}
                        opacity={isAdmittedActive ? 1 : 0.15}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={isAppsActive ? 0.25 : 0.04} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAdmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={isAdmittedActive ? 0.25 : 0.04} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderLight} />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: textMuted, fontSize: 11, fontWeight: 600 }}
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: textMuted, fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip 
                    content={<CustomTooltip />} 
                    cursor={{ stroke: primaryColor, strokeWidth: 1.5, strokeDasharray: '5 4' }} 
                />
                <Area 
                    type="monotone" 
                    dataKey="apps" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorApps)" 
                    opacity={isAppsActive ? 1 : 0.15}
                    animationDuration={2000}
                />
                <Area 
                    type="monotone" 
                    dataKey="admitted" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAdmitted)" 
                    opacity={isAdmittedActive ? 1 : 0.15}
                    animationDuration={2000}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
});

TrendChart.displayName = 'TrendChart';


// High-Fidelity Radial/Circular SVG Progress Gauge
const IntakeProgressGauge = React.memo(({ admitted = 0, target = 100 }) => {
    const displayPercentage = target > 0 ? (admitted / target) * 100 : 0;
    const strokePercentage = Math.min(100, Math.max(0, displayPercentage));
    const strokeWidth = 12;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (strokePercentage / 100) * circumference;

    return (
        <div 
            className="lg:p-6 rounded-[40px] border border-slate-200/60 dark:border-slate-800/60 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_40px_80px_rgba(0,0,0,0.3)] hover:-translate-y-1 flex flex-col items-center justify-between min-h-[420px] p-5 bg-white dark:bg-slate-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors duration-700" />
            <div className="w-full text-left mb-6 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 shadow-sm">
                    Intake Cap
                </span>
                <h3 className="text-2xl font-black tracking-tight mt-4 text-slate-800 dark:text-white">Target Progress</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 text-slate-400">Capacity Yield Analysis</p>
            </div>
            
            <div className="relative flex items-center justify-center my-2 group">
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-xl group-hover:scale-110 transition-transform duration-700" />
                
                <svg className="w-44 h-44 transform -rotate-90 filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.08)]">
                    <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        style={{ stroke: 'var(--border-color-light)' }}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.3))' }}
                    />
                    
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--primary-color)" />
                            <stop offset="50%" stopColor="var(--primary-color)" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                </svg>
                
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-3xl font-black tracking-tighter tabular-nums" style={{ color: 'var(--text-main)' }}>
                        {displayPercentage.toFixed(0)}%
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
                        Capacity
                    </span>
                </div>
            </div>

            <div className="w-full mt-4 pt-4 border-t flex items-center justify-between text-center" style={{ borderColor: 'var(--border-color-light)' }}>
                <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Admitted</span>
                    <span className="text-lg font-black tabular-nums" style={{ color: 'var(--text-main)' }}>{admitted}</span>
                </div>
                <div className="w-px h-8" style={{ background: 'var(--border-color-light)' }} />
                <div className="flex-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Target</span>
                    <span className="text-lg font-black tabular-nums" style={{ color: 'var(--text-main)' }}>{target}</span>
                </div>
            </div>
        </div>
    );
});

IntakeProgressGauge.displayName = 'IntakeProgressGauge';

// Memoized Pie Chart Component for Status Distribution
const StatusPieChart = React.memo(({ data, total, highlightMetric }) => {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.value - a.value);
    }, [data]);

    const CustomTooltip = useCallback(({ active, payload }) => {
        const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
        const cardBg     = cssVar('--card-bg')           || '#fff';
        const borderCol  = cssVar('--border-color-light') || '#eaedf3';
        const textMain   = cssVar('--text-main')          || '#1e293b';
        const textMuted  = cssVar('--text-muted')         || '#94a3b8';

        if (active && payload && payload.length) {
            const item = payload[0];
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

            return (
                <div style={{ background: cardBg, border: `1px solid ${borderCol}`, color: textMain }}
                    className="backdrop-blur-md p-3 rounded-xl shadow-xl min-w-[140px]"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.payload.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>{item.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-black tabular-nums" style={{ color: textMain }}>{item.value.toLocaleString()}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}>{percentage}%</span>
                    </div>
                </div>
            );
        }
        return null;
    }, [total]);

    return (
        <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
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
                    {sortedData.map((entry, index) => {
                        // Apply interactive dimming if a specific metric is selected
                        let opacity = 1;
                        if (highlightMetric === 'admitted' && entry.name !== 'Admitted') opacity = 0.2;
                        if (highlightMetric === 'pending' && !['Pending', 'Interview', 'Waitlist'].includes(entry.name)) opacity = 0.2;
                        if (highlightMetric === 'apps' && false) opacity = 1;

                        return (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth={4}
                                opacity={opacity}
                                className="outline-none"
                            />
                        );
                    })}
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
        const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
        const cardBg    = cssVar('--card-bg')           || '#fff';
        const borderCol = cssVar('--border-color-light') || '#eaedf3';
        const textMain  = cssVar('--text-main')          || '#1e293b';
        const textMuted = cssVar('--text-muted')         || '#94a3b8';

        if (active && payload && payload.length) {
            const boys = payload.find(p => p.dataKey === 'boys')?.value || 0;
            const girls = payload.find(p => p.dataKey === 'girls')?.value || 0;

            return (
                <div style={{ background: cardBg, border: `1px solid ${borderCol}`, color: textMain }}
                    className="backdrop-blur-md p-4 rounded-2xl shadow-2xl min-w-[200px]"
                >
                    <p className="font-bold mb-3 pb-2" style={{ color: textMain, borderBottom: `1px solid ${borderCol}` }}>{label}</p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold uppercase" style={{ color: textMuted }}>Boys</span>
                            </div>
                            <span className="font-black tabular-nums" style={{ color: textMain }}>
                                {viewMode === 'percentage' ? `${boys.toFixed(1)}%` : boys.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                                <span className="text-[10px] font-bold uppercase" style={{ color: textMuted }}>Girls</span>
                            </div>
                            <span className="font-black tabular-nums" style={{ color: textMain }}>
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
            <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                        Academic Distribution
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--primary-color)', boxShadow: '0 0 8px var(--primary-color)' }} />
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Demographic spread by class level</p>
                </div>
                <div className="flex p-1.5 rounded-2xl border" style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}>
                    <button
                        onClick={() => setViewMode('absolute')}
                        className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300"
                        style={viewMode === 'absolute'
                            ? { background: 'var(--card-bg)', color: 'var(--primary-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                            : { color: 'var(--text-muted)' }}
                    >
                        Volume
                    </button>
                    <button
                        onClick={() => setViewMode('percentage')}
                        className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300"
                        style={viewMode === 'percentage'
                            ? { background: 'var(--card-bg)', color: 'var(--primary-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                            : { color: 'var(--text-muted)' }}
                    >
                        Density
                    </button>
                </div>
            </div>

            <div className="w-full" style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
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

// Premium Skeleton Loader
const SkeletonLoader = () => (
    <div className="space-y-12 py-4 px-3 animate-pulse">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-24 h-4 rounded-lg" style={{ background: 'var(--bg-light)' }} />
                    <div className="w-12 h-0.5" style={{ background: 'var(--bg-light)' }} />
                    <div className="w-16 h-4 rounded-lg" style={{ background: 'var(--bg-light)' }} />
                </div>
                <div className="w-64 h-10 rounded-2xl" style={{ background: 'var(--bg-light)' }} />
                <div className="w-48 h-3 rounded-lg" style={{ background: 'var(--bg-light)' }} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 rounded-[24px] border h-[100px]" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }} />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
            <div className="p-10 rounded-[48px] border lg:col-span-2 h-[450px]" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }} />
            <div className="p-10 rounded-[40px] border h-[450px]" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }} />
        </div>
    </div>
);

const AdmissionStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        campus_id: '',
        intake_id: '',
        date_start: '',
        date_end: ''
    });

    // Options for dropdowns
    const [options, setOptions] = useState({
        campuses: [],
        intakes: []
    });

    // Interactive states
    const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
    const [highlightMetric, setHighlightMetric] = useState(null); // null | 'apps' | 'admitted' | 'pending'

    // Fetch filters options once
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [campusesRes, intakesRes] = await Promise.all([
                    institutionService.getCampuses(),
                    studentManagementService.getIntakes()
                ]);
                setOptions({
                    campuses: Array.isArray(campusesRes?.results) ? campusesRes.results : (Array.isArray(campusesRes) ? campusesRes : []),
                    intakes: Array.isArray(intakesRes?.results) ? intakesRes.results : (Array.isArray(intakesRes) ? intakesRes : [])
                });
            } catch (err) {
                console.error("Failed to fetch filter options", err);
            }
        };
        fetchOptions();
    }, []);

    // Fetch stats on filter change
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Clean empty filters before sending
            const cleanFilters = {};
            Object.keys(filters).forEach(key => {
                if (filters[key] !== '') {
                    cleanFilters[key] = filters[key];
                }
            });

            const data = await studentManagementService.getDashboardStats(cleanFilters);
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch dashboard stats", err);
            setError("Unable to load admission statistics. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleResetFilters = () => {
        setFilters({
            campus_id: '',
            intake_id: '',
            date_start: '',
            date_end: ''
        });
    };

    // Card interactive highlights mapping
    const handleMetricClick = (metricType) => {
        if (highlightMetric === metricType) {
            setHighlightMetric(null); // Toggle off if clicked again
        } else {
            setHighlightMetric(metricType);
        }
    };

    // Derived statistics calculations
    const derivedMetrics = useMemo(() => {
        if (!stats) return null;

        const { metrics } = stats;
        const totalApps = metrics.total_apps || 0;
        const admitted = metrics.admitted || 0;
        const pending = metrics.pending || 0;
        const repeaters = metrics.repeaters || 0;
        const transfers = Math.abs(metrics.transfers || 0);

        const admissionRate = totalApps > 0 ? ((admitted / totalApps) * 100) : 0;
        const conversionRate = (admitted + pending) > 0 ? (admitted / (admitted + pending) * 100) : 0;
        const repeaterPercentage = admitted > 0 ? ((repeaters / admitted) * 100) : 0;

        const admissionTrend = admissionRate > 25 ? 'up' : 'down';
        const pendingTrend = pending > (totalApps * 0.3) ? 'up' : 'down';

        return {
            admissionRate: admissionRate.toFixed(1),
            conversionRate: conversionRate.toFixed(1),
            repeaterPercentage: repeaterPercentage.toFixed(1),
            admissionTrend,
            pendingTrend,
            admissionChange: admissionTrend === 'up' ? 12.5 : -8.3,
            pendingChange: pendingTrend === 'up' ? 5.2 : -2.1
        };
    }, [stats]);

    if (loading && !stats) {
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
                    onClick={fetchStats}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const NeoStatCard = ({ title, value, icon: Icon, iconBg, iconColor, trendLabel, trendData, dataKey, highlightColor, isActive, onClick }) => {
        return (
            <div 
                onClick={onClick}
                className={`relative overflow-hidden cursor-pointer transition-all duration-500 rounded-[32px] p-4 h-[160px] flex flex-col justify-between border neo-card ${
                    isActive 
                    ? `neo-card` 
                    : 'neo-card:hover'
                }`}
            >
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] pointer-events-none opacity-40 transition-opacity group-hover:opacity-60" style={{ background: highlightColor }} />
                
                <div className="relative z-10 flex items-start justify-between">
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isActive ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{title}</p>
                        <h4 className={`text-4xl font-black tabular-nums tracking-tighter ${isActive ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{value}</h4>
                    </div>
                    <div className={`p-3 rounded-[18px] neo-pressed backdrop-blur-sm ${isActive ? 'bg-white/20 text-white' : `${iconBg} ${iconColor}`}`}>
                        <Icon size={24} />
                    </div>
                </div>
                
                <div className="relative z-10 mt-auto flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isActive ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{trendLabel}</span>
                </div>

                {/* Sparkline Background */}
                <div className="absolute bottom-0 left-0 right-0 h-20 opacity-40 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={highlightColor} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={highlightColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey={dataKey} stroke={highlightColor} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${dataKey})`} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full space-y-8 py-2">
            {/* Admissions Intelligence — Unified Header & Filters */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-3 sm:p-4 rounded-[32px] border border-slate-200/60 dark:border-slate-800/60 shadow-sm mb-4">
                
                {/* Header */}
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                            <Sparkles size={12} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live Engine</span>
                        </div>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Module 01</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white mt-1">
                        Admissions Intelligence
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span>Predictive metrics</span>
                        <span className="text-indigo-500">•</span>
                        <span>Real-time monitoring</span>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[9px] font-black tracking-widest">Optimal Status</span>
                        </div>
                    </div>
                </div>

                {/* Compact Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto relative z-10">
                    <div className="flex-1 min-w-[140px]">
                        <select
                            value={filters.campus_id}
                            onChange={(e) => handleFilterChange('campus_id', e.target.value)}
                            className="w-full neo-pressed dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-3 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all"
                        >
                            <option value="">All Campuses</option>
                            {options.campuses?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <select
                            value={filters.intake_id}
                            onChange={(e) => handleFilterChange('intake_id', e.target.value)}
                            className="w-full neo-pressed dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-3 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all"
                        >
                            <option value="">All Intakes</option>
                            {options.intakes?.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[130px]">
                        <input
                            type="date"
                            value={filters.date_start}
                            onChange={(e) => handleFilterChange('date_start', e.target.value)}
                            className="w-full neo-pressed dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-3 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all"
                        />
                    </div>
                    <div className="flex-1 min-w-[130px] relative">
                        <input
                            type="date"
                            value={filters.date_end}
                            onChange={(e) => handleFilterChange('date_end', e.target.value)}
                            className="w-full neo-pressed dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-3 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all"
                        />
                        {Object.values(filters).some(v => v !== '') && (
                            <button
                                onClick={handleResetFilters}
                                className="absolute -top-3 -right-3 p-1.5 neo-pressed dark:bg-slate-700 text-slate-400 hover:text-indigo-600 rounded-full border border-slate-200 dark:border-slate-600 shadow-md"
                                title="Reset filters"
                            >
                                <RefreshCw size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Metrics Grid — Clickable for interactivity */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-5 mb-4">
                <NeoStatCard
                    title="Intake Pipeline"
                    value={stats.metrics.total_apps?.toLocaleString() || '0'}
                    icon={ClipboardList}
                    iconBg="bg-blue-100 dark:bg-blue-900/30"
                    iconColor="text-blue-600 dark:text-blue-400"
                    trendLabel="Overall volume"
                    trendData={stats.trends}
                    dataKey="apps"
                    highlightColor="#3b82f6"
                    isActive={highlightMetric === 'apps'}
                    onClick={() => handleMetricClick('apps')}
                />
                
                <NeoStatCard
                    title="Successful Admissions"
                    value={stats.metrics.admitted?.toLocaleString() || '0'}
                    icon={UserPlus}
                    iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                    iconColor="text-emerald-600 dark:text-emerald-400"
                    trendLabel={`${derivedMetrics?.conversionRate}% yield`}
                    trendData={stats.trends}
                    dataKey="admitted"
                    highlightColor="#10b981"
                    isActive={highlightMetric === 'admitted'}
                    onClick={() => handleMetricClick('admitted')}
                />

                <NeoStatCard
                    title="Awaiting Review"
                    value={stats.metrics.pending?.toLocaleString() || '0'}
                    icon={Users}
                    iconBg="bg-amber-100 dark:bg-amber-900/30"
                    iconColor="text-amber-600 dark:text-amber-400"
                    trendLabel="Processing queue"
                    trendData={stats.trends}
                    dataKey="apps"
                    highlightColor="#f59e0b"
                    isActive={highlightMetric === 'pending'}
                    onClick={() => handleMetricClick('pending')}
                />

                <NeoStatCard
                    title="Student Repeaters"
                    value={stats.metrics.repeaters?.toLocaleString() || '0'}
                    icon={Repeat}
                    iconBg="bg-purple-100 dark:bg-purple-900/30"
                    iconColor="text-purple-600 dark:text-purple-400"
                    trendLabel={`${derivedMetrics?.repeaterPercentage}% of intake`}
                    trendData={stats.trends}
                    dataKey="apps"
                    highlightColor="#8b5cf6"
                    isActive={false}
                    onClick={() => {}}
                />

                <NeoStatCard
                    title="Mobility Index"
                    value={stats.metrics.transfers?.toLocaleString() || '0'}
                    icon={ArrowRightLeft}
                    iconBg="bg-sky-100 dark:bg-sky-900/30"
                    iconColor="text-sky-600 dark:text-sky-400"
                    trendLabel={stats.metrics.transfers >= 0 ? "Growth net" : "Reduction net"}
                    trendData={stats.trends}
                    dataKey="admitted"
                    highlightColor="#0ea5e9"
                    isActive={false}
                    onClick={() => {}}
                />
            </div>

            {/* Analytics Engine Section */}
            <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-6 p-3">
                {/* Enrollment Velocity Trends Card */}
                <div
                    className="border border-slate-200/60 dark:border-slate-800/60 lg:col-span-2 transition-all duration-500  hover:-translate-y-1 group overflow-hidden neo-card dark:bg-slate-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] relative p-4"
                >
                    <div className="absolute -top-32 -left-10 w-96 h-96 bg-indigo-50/50 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                    
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 pt-3 pb-2 relative z-10 gap-3">
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-3 text-slate-800 dark:text-white">
                                Enrollment Velocity
                                <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                            </h3>
                            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                                Real-time growth dynamics
                            </p>
                        </div>

                        {/* Chart Toggles (Area vs. Bar) */}
                        <div className="flex items-center gap-4">
                            <div
                                className="flex p-1 rounded-xl border"
                                style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                            >
                                <button
                                    onClick={() => setChartType('area')}
                                    style={chartType === 'area' ? { background: 'var(--card-bg)', color: 'var(--primary-color)' } : { color: 'var(--text-muted)' }}
                                    className="p-2 rounded-lg neo-pressed transition-all shadow-sm"
                                >
                                    <LineChart size={15} />
                                </button>
                                <button
                                    onClick={() => setChartType('bar')}
                                    style={chartType === 'bar' ? { background: 'var(--card-bg)', color: 'var(--primary-color)' } : { color: 'var(--text-muted)' }}
                                    className="p-2 rounded-lg transition-all shadow-sm"
                                >
                                    <BarChart3 size={15} />
                                </button>
                            </div>

                            <div className="hidden sm:flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-muted)' }}>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" /> Applications
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" /> Admitted
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thin divider */}
                    <div className="mx-8" style={{ height: '1px', background: 'var(--border-color-light)' }} />

                    {/* Chart canvas — padded inset */}
                    <div className="px-6 pt-5 pb-7">
                        <div
                            className="w-full rounded-2xl overflow-hidden"
                            style={{ height: 320, background: 'var(--bg-light)' }}
                        >
                            <TrendChart data={stats.trends} chartType={chartType} highlightMetric={highlightMetric} />
                        </div>
                    </div>
                </div>

                {/* Intake Progress Gauge Card */}
                <IntakeProgressGauge 
                    admitted={stats.metrics.admitted} 
                    target={stats.metrics.target_capacity || 100} 
                />

                {/* Status Distribution Card */}
                <div
                    className="border border-slate-200/60 dark:border-slate-800/60 rounded-[40px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-900 transition-all duration-500 hover:shadow-[0_20px_48px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.3)] hover:-translate-y-1 overflow-hidden relative group p-4"
                >
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-50 dark:bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="px-3 pt-3 pb-2 relative z-10">
                        <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Status Ecosystem</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5 text-slate-400">Lifecycle status spread</p>
                    </div>
                    <div className="mx-8" style={{ height: '1px', background: 'var(--border-color-light)' }} />
                    <div className="px-6 pt-5 pb-7">
                        <div className="w-full relative rounded-2xl overflow-hidden" style={{ height: 300, background: 'var(--bg-light)' }}>
                            <StatusPieChart
                                data={stats.status_distribution}
                                total={stats.metrics.total_apps}
                                highlightMetric={highlightMetric}
                            />
                            <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="text-4xl font-black tracking-tighter tabular-nums" style={{ color: 'var(--text-main)' }}>
                                    {stats.metrics.total_apps}
                                </span>
                                <span className="block text-[10px] font-black uppercase tracking-[0.3em] mt-1" style={{ color: 'var(--text-muted)' }}>Entries</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class Distribution Card */}
                <div
                    className="border border-slate-200/60 dark:border-slate-800/60 rounded-[40px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-900 lg:col-span-2 transition-all duration-500 hover:shadow-[0_20px_48px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.3)] hover:-translate-y-1 overflow-hidden relative group p-4"
                >
                    <div className="absolute -top-20 -left-10 w-64 h-64 bg-pink-50/50 dark:bg-pink-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-50/50 dark:group-hover:bg-blue-500/10 transition-colors duration-1000" />
                    <div className="px-3 pt-3 pb-3 relative z-10">
                        <GenderBarChart data={stats.class_distribution} />
                    </div>
                </div>
            </div>

            {/* Smart Intelligence Panel */}
            <div className="mt-4 mb-4">
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="flex items-center justify-center w-9 h-9 rounded-xl"
                        style={{ background: 'rgba(63,81,181,0.10)' }}
                    >
                        <TrendingUp size={16} style={{ color: 'var(--primary-color)' }} />
                    </div>
                    <div>
                        <h4 className="text-base font-black tracking-tight" style={{ color: 'var(--text-main)' }}>
                            Smart Admissions Intelligence
                        </h4>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>
                            Executive Analytics &amp; Strategic Forecasting
                        </p>
                    </div>
                    <div className="ml-auto h-px flex-1 max-w-[120px]" style={{ background: 'var(--border-color-light)' }} />
                </div>

                {/* Stat Card Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 md:grid-cols-2 sm:grid-cols-2 gap-5">

                    {/* Card 1 — Enrollment Yield */}
                    <div
                        style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color-light)',
                            boxShadow: 'var(--shadow-card)',
                        }}
                        className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] transition-all duration-300 overflow-hidden hover:-translate-y-1"
                    >
                        {/* Glow */}
                        <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-50"
                            style={{ background: 'var(--primary-light)' }} />
                        
                        {/* Top row: Icon + Title */}
                        <div className="flex items-center gap-2.5 w-full relative z-10">
                            <div className="flex-shrink-0 w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                style={{ background: 'var(--primary-light)' }}>
                                <TrendingUp size={13} style={{ color: 'var(--primary-color)' }} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[8px] sm:text-[10px] font-black uppercase  mt-1">
                                Enrollment Yield
                            </h3>
                        </div>

                        {/* Bottom Row: Value + Pill Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mt-3 w-full relative z-10">
                            <span className="text-[1.4rem] sm:text-[1.65rem] font-black tracking-tight leading-none tabular-nums" style={{ color: 'var(--text-main)' }}>
                                {derivedMetrics?.admissionRate}%
                            </span>
                            <div className="flex-shrink-0">
                                <span 
                                    className="px-2 py-1 rounded-full text-[9px] font-bold tracking-wide shadow-sm"
                                    style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                >
                                    Stable
                                </span>
                            </div>
                        </div>

                        {/* Footer insight */}
                        <p className="mt-3 text-[10px] sm:text-[11px] leading-relaxed font-semibold relative z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}>
                            Inquiry-to-admitted conversion at peak optimal levels.
                        </p>
                    </div>

                    {/* Card 2 — Cohort Balance */}
                    <div
                        style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color-light)',
                            boxShadow: 'var(--shadow-card)',
                        }}
                        className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] transition-all duration-300 overflow-hidden hover:-translate-y-1"
                    >
                        {/* Glow */}
                        <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-50"
                            style={{ background: 'rgba(59,130,246,0.06)' }} />
                        
                        {/* Top row: Icon + Title */}
                        <div className="flex items-center gap-2.5 w-full relative z-10">
                            <div className="flex-shrink-0 w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                style={{ background: 'rgba(59,130,246,0.08)' }}>
                                <Users size={13} style={{ color: '#3b82f6' }} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[9px] sm:text-[10px] font-black uppercase leading-none mt-0.5" >
                                Cohort Balance
                            </h3>
                        </div>

                        {/* Bottom Row: Value + Pill Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mt-3 w-full relative z-10">
                            <span className="text-[1.4rem] sm:text-[1.65rem] font-black tracking-tight leading-none tabular-nums" style={{ color: 'var(--text-main)' }}>
                                {stats.class_distribution.reduce((s, c) => s + c.boys, 0)}
                                <span className="text-sm mx-1" style={{ color: 'var(--text-muted)' }}>:</span>
                                {stats.class_distribution.reduce((s, c) => s + c.girls, 0)}
                            </span>
                            <div className="flex-shrink-0">
                                <span 
                                    className="px-2 py-1 rounded-full text-[9px] font-bold tracking-wide shadow-sm"
                                    style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}
                                >
                                    Diverse
                                </span>
                            </div>
                        </div>

                        <p className="mt-3 text-[10px] sm:text-[11px] leading-relaxed font-semibold relative z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}>
                            Gender parity consistent across all recruitment channels.
                        </p>
                    </div>

                    {/* Card 3 — Intake Leader */}
                    <div
                        style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--border-color-light)',
                            boxShadow: 'var(--shadow-card)',
                        }}
                        className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-[16px] sm:rounded-[20px] transition-all duration-300 overflow-hidden hover:-translate-y-1"
                    >
                        {/* Glow */}
                        <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-50"
                            style={{ background: 'rgba(16,185,129,0.06)' }} />
                        
                        {/* Top row: Icon + Title */}
                        <div className="flex items-center gap-2.5 w-full relative z-10">
                            <div className="flex-shrink-0 w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                style={{ background: 'rgba(16,185,129,0.08)' }}>
                                <BookOpen size={13} style={{ color: '#10b981' }} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[9px] sm:text-[10px] font-black uppercase  leading-none mt-0.5" >
                                Intake Leader
                            </h3>
                        </div>

                        {/* Bottom Row: Value + Pill Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mt-3 w-full relative z-10">
                            <span className="text-[1.2rem] sm:text-[1.35rem] font-black tracking-tight leading-none truncate block flex-1 max-w-[140px]" style={{ color: 'var(--text-main)' }}>
                                {stats.class_distribution.slice().sort((a, b) => (b.boys + b.girls) - (a.boys + a.girls))[0]?.name || 'N/A'}
                            </span>
                            <div className="flex-shrink-0">
                                <span 
                                    className="px-2 py-1 rounded-full text-[9px] font-bold tracking-wide shadow-sm"
                                    style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}
                                >
                                    Primary
                                </span>
                            </div>
                        </div>

                        <p className="mt-3 text-[10px] sm:text-[11px] leading-relaxed font-semibold relative z-10 opacity-70 group-hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}>
                            This level dominates the current intake cycle in volume.
                        </p>
                    </div>

            </div>
            </div>
        </div>
    );
};

export default AdmissionStats;
