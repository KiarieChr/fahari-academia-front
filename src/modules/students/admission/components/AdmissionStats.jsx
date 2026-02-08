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
    Info
} from 'lucide-react';
import {
    LineChart,
    Line,
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

// Memoized Metric Card Component
const MetricCard = React.memo(({ title, value, subValue, icon: Icon, change, isPositive, color, onClick }) => {
    const getChangeIndicator = useCallback(() => {
        if (change === undefined) return null;
        
        const ChangeIcon = isPositive ? ChevronUp : ChevronDown;
        const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
        const bgColor = isPositive ? 'bg-green-50' : 'bg-red-50';
        
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${bgColor} ${changeColor} text-sm`}>
                <ChangeIcon size={14} />
                <span>{Math.abs(change)}%</span>
            </div>
        );
    }, [change, isPositive]);

    return (
        <div 
            onClick={onClick}
            className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-indigo-200 hover:bg-gray-50' : ''} group`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-lg ${color} group-hover:scale-105 transition-transform`}>
                    <Icon size={20} />
                </div>
                {getChangeIndicator()}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            {subValue && (
                <p className="text-sm text-gray-600 mb-1">{subValue}</p>
            )}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{title}</p>
                {onClick && (
                    <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View details →
                    </span>
                )}
            </div>
        </div>
    );
});

MetricCard.displayName = 'MetricCard';

// Memoized Line Chart Component
const TrendChart = React.memo(({ data }) => {
    const CustomTooltip = useCallback(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const apps = payload[0]?.value || 0;
            const admitted = payload[1]?.value || 0;
            const conversionRate = apps > 0 ? ((admitted / apps) * 100).toFixed(1) : 0;
            const conversionGap = apps - admitted;
            
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-blue-600">Applications:</span>
                            <span className="font-semibold">{apps.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-green-600">Admitted:</span>
                            <span className="font-semibold">{admitted.toLocaleString()}</span>
                        </div>
                        <div className="pt-1 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Conversion:</span>
                                <span className="font-semibold">{conversionRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Remaining:</span>
                                <span className="font-semibold text-amber-600">{conversionGap.toLocaleString()}</span>
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
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={10}
                />
                <defs>
                    <linearGradient id="appsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="admittedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Line 
                    type="monotone" 
                    dataKey="apps" 
                    name="Applications" 
                    stroke="url(#appsGradient)" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="admitted" 
                    name="Admitted" 
                    stroke="url(#admittedGradient)" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#16a34a' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
});

TrendChart.displayName = 'TrendChart';

// Memoized Pie Chart Component
const StatusPieChart = React.memo(({ data, total }) => {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.value - a.value);
    }, [data]);

    const CustomTooltip = useCallback(({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0];
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-gray-900">{item.name}</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Count:</span>
                            <span className="font-semibold">{item.value.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Percentage:</span>
                            <span className="font-semibold">{percentage}%</span>
                        </div>
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
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                >
                    {sortedData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                        <span className="text-sm text-gray-700">{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
});

StatusPieChart.displayName = 'StatusPieChart';

// Memoized Bar Chart Component
const GenderBarChart = React.memo(({ data }) => {
    const [viewMode, setViewMode] = useState('absolute'); // 'absolute' or 'percentage'
    
    const processedData = useMemo(() => {
        // Sort by total students (boys + girls) descending
        const sorted = [...data].sort((a, b) => 
            (b.boys + b.girls) - (a.boys + a.girls)
        );
        
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
        
        return sorted.map(item => ({
            ...item,
            total: item.boys + item.girls
        }));
    }, [data, viewMode]);

    const CustomTooltip = useCallback(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const boys = payload.find(p => p.dataKey === 'boys')?.value || 0;
            const girls = payload.find(p => p.dataKey === 'girls')?.value || 0;
            
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-blue-600">Boys:</span>
                            </div>
                            <span className="font-semibold">
                                {viewMode === 'percentage' ? `${boys.toFixed(1)}%` : boys.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-pink-500" />
                                <span className="text-pink-600">Girls:</span>
                            </div>
                            <span className="font-semibold">
                                {viewMode === 'percentage' ? `${girls.toFixed(1)}%` : girls.toLocaleString()}
                            </span>
                        </div>
                        {viewMode === 'absolute' && (
                            <div className="pt-1 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-semibold">{(boys + girls).toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    }, [viewMode]);

    const yAxisFormatter = useCallback((value) => {
        if (viewMode === 'percentage') {
            return `${value}%`;
        }
        return value.toLocaleString();
    }, [viewMode]);

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Class-wise Active Students by Gender</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">View:</span>
                    <div className="inline-flex rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => setViewMode('absolute')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                viewMode === 'absolute' 
                                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Count
                        </button>
                        <button
                            onClick={() => setViewMode('percentage')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                viewMode === 'percentage' 
                                ? 'bg-indigo-100 text-indigo-700 font-medium' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Percentage
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="w-full" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={processedData} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barSize={40}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6b7280', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={yAxisFormatter}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                        <Legend 
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            iconSize={10}
                        />
                        <Bar 
                            dataKey="boys" 
                            name="Boys" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                            stackId={viewMode === 'percentage' ? 'a' : undefined}
                        />
                        <Bar 
                            dataKey="girls" 
                            name="Girls" 
                            fill="#ec4899" 
                            radius={[4, 4, 0, 0]}
                            stackId={viewMode === 'percentage' ? 'a' : undefined}
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
        <div className="space-y-6">
            {/* Header with contextual info */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Admission Analytics Dashboard</h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <Info size={16} />
                        Insights derived from current admission data
                    </p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    Last updated: Today
                </div>
            </div>

            {/* Metrics Grid with Enhanced Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard
                    title="Total Applications"
                    value={stats.metrics.total_apps?.toLocaleString() || '0'}
                    subValue={`${derivedMetrics?.admissionRate}% admission rate`}
                    icon={ClipboardList}
                    color="bg-blue-50 text-blue-600"
                    change={derivedMetrics?.admissionChange}
                    isPositive={derivedMetrics?.admissionTrend === 'up'}
                    onClick={() => handleMetricClick('applications')}
                />
                <MetricCard
                    title="Admitted Students"
                    value={stats.metrics.admitted?.toLocaleString() || '0'}
                    subValue={`${derivedMetrics?.conversionRate}% conversion rate`}
                    icon={UserPlus}
                    color="bg-green-50 text-green-600"
                    onClick={() => handleMetricClick('admitted')}
                />
                <MetricCard
                    title="Pending Review"
                    value={stats.metrics.pending?.toLocaleString() || '0'}
                    subValue={`${Math.round((stats.metrics.pending / stats.metrics.total_apps) * 100)}% of total`}
                    icon={Users}
                    color="bg-yellow-50 text-yellow-600"
                    change={derivedMetrics?.pendingChange}
                    isPositive={derivedMetrics?.pendingTrend === 'up'}
                    onClick={() => handleMetricClick('pending')}
                />
                <MetricCard
                    title="Repeaters"
                    value={stats.metrics.repeaters?.toLocaleString() || '0'}
                    subValue={`${derivedMetrics?.repeaterPercentage}% of admitted`}
                    icon={Repeat}
                    color="bg-orange-50 text-orange-600"
                    onClick={() => handleMetricClick('repeaters')}
                />
                <MetricCard
                    title="Net Transfers"
                    value={stats.metrics.transfers?.toLocaleString() || '0'}
                    subValue={stats.metrics.transfers >= 0 ? "Net gain" : "Net loss"}
                    icon={ArrowRightLeft}
                    color="bg-purple-50 text-purple-600"
                    onClick={() => handleMetricClick('transfers')}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart - Application Trends */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2 min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Application Trends</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                Last 6 months • 
                                <span className="flex items-center gap-1 text-blue-600">
                                    <TrendingUp size={14} />
                                    Gap: {Math.max(0, ...stats.trends.map(t => t.apps - t.admitted))} average
                                </span>
                            </p>
                        </div>
                        <div className="text-sm text-gray-600">
                            Total trend: {stats.trends.reduce((sum, t) => sum + t.apps, 0).toLocaleString()} applications
                        </div>
                    </div>
                    <div className="w-full" style={{ height: 300 }}>
                        <TrendChart data={stats.trends} />
                    </div>
                </div>

                {/* Pie Chart - Admission Status */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-w-0">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Admission Status Distribution</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span className="font-medium">{stats.metrics.total_apps?.toLocaleString()}</span>
                            total
                        </div>
                    </div>
                    <div className="w-full relative" style={{ height: 300 }}>
                        <StatusPieChart 
                            data={stats.status_distribution} 
                            total={stats.metrics.total_apps} 
                        />
                        {/* Center Display */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                            <span className="text-3xl font-bold text-gray-900">
                                {stats.metrics.total_apps?.toLocaleString()}
                            </span>
                            <span className="block text-xs text-gray-500">Total Applications</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Hover over segments for detailed breakdown
                    </div>
                </div>

                {/* Bar Chart - Class-wise Gender Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-3 min-w-0">
                    <GenderBarChart data={stats.class_distribution} />
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>Total Boys: {stats.class_distribution.reduce((sum, c) => sum + c.boys, 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-pink-500" />
                                <span>Total Girls: {stats.class_distribution.reduce((sum, c) => sum + c.girls, 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="text-gray-600">
                            Sorted by total students
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Section (Frontend-only derived insights) */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-indigo-900 mb-3">Key Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-indigo-100">
                        <div className="text-sm text-gray-600 mb-1">Admission Efficiency</div>
                        <div className="text-2xl font-bold text-gray-900">{derivedMetrics?.admissionRate}%</div>
                        <div className="text-sm text-gray-500">Rate of applications converted to admissions</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-indigo-100">
                        <div className="text-sm text-gray-600 mb-1">Gender Balance</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.class_distribution.reduce((sum, c) => sum + c.boys, 0)}:{stats.class_distribution.reduce((sum, c) => sum + c.girls, 0)}
                        </div>
                        <div className="text-sm text-gray-500">Overall boys to girls ratio</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-indigo-100">
                        <div className="text-sm text-gray-600 mb-1">Top Performing Class</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {stats.class_distribution.sort((a, b) => (b.boys + b.girls) - (a.boys + a.girls))[0]?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">Highest total active students</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for refresh button (used in error state)
const RefreshCw = ({ size = 16 }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="rotate-90"
    >
        <path d="M21 2v6h-6" />
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
);

export default AdmissionStats;