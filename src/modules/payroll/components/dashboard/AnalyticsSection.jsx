import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { payrollService } from '../../../../services/payrollService';

const AnalyticsSection = () => {
    const [trendData, setTrendData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [totalPayroll, setTotalPayroll] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRange, setSelectedRange] = useState(6);

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [trendsRes, distributionRes, deptRes] = await Promise.all([
                payrollService.getMonthlyTrends(selectedRange),
                payrollService.getDistribution(),
                payrollService.getDepartmentCosts()
            ]);

            // Transform trends data for chart
            const trends = trendsRes.trends?.map(t => ({
                month: t.month,
                cost: t.gross / 1000000, // Convert to millions
                net: t.net / 1000000
            })) || [];
            setTrendData(trends);

            // Transform distribution data
            const distribution = distributionRes.distribution?.filter(d => d.value > 0) || [];
            setDistributionData(distribution);
            setTotalPayroll(distributionRes.total || 0);

            // Transform department data - top 5
            const depts = deptRes.departments?.slice(0, 5).map(d => ({
                name: d.name?.substring(0, 12) || 'Unknown',
                cost: d.gross / 1000000,
                employees: d.employees
            })) || [];
            setDepartmentData(depts);

            setError(null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1) {
            return `${value.toFixed(1)}M`;
        }
        return `${(value * 1000).toFixed(0)}K`;
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                    <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
                    <div className="h-64 bg-gray-100 rounded" />
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                    <div className="h-48 bg-gray-100 rounded" />
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">{error}</p>
                <button
                    onClick={fetchAnalyticsData}
                    className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Payroll Cost Trend</h3>
                    </div>
                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(parseInt(e.target.value))}
                        className="text-xs border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={3}>Last 3 Months</option>
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last 12 Months</option>
                    </select>
                </div>
                <div className="h-64 w-full">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={256}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `${val}M`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`KES ${value.toFixed(2)}M`, '']}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="cost" name="Gross" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                                <Area type="monotone" dataKey="net" name="Net" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <p>No trend data available</p>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        Gross Payroll
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        Net Payroll
                    </span>
                </div>
            </div>

            {/* Distribution Pie */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Cost Distribution</h3>
                <div className="flex-1 min-h-[200px] relative">
                    {distributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`KES ${(value / 1000000).toFixed(2)}M`, '']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            <p className="text-sm">No data</p>
                        </div>
                    )}
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-gray-400">Total</span>
                        <span className="text-lg font-bold text-gray-800">
                            {totalPayroll >= 1000000
                                ? `${(totalPayroll / 1000000).toFixed(1)}M`
                                : `${(totalPayroll / 1000).toFixed(0)}K`}
                        </span>
                    </div>
                </div>

                <div className="space-y-2.5 mt-4 pt-4 border-t border-gray-100">
                    {distributionData.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-gray-600">{item.name}</span>
                            </div>
                            <span className="font-semibold text-gray-800">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSection;
