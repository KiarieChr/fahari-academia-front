import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const RecruitmentChartsWidget = ({ statusDistribution = {}, sourceDistribution = {} }) => {
    // Format status distribution for BarChart
    const statusData = Object.entries(statusDistribution).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: value
    })).sort((a, b) => b.count - a.count);

    // Format source distribution for PieChart
    const sourceData = Object.entries(sourceDistribution).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Distribution Bar Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Application Status Pipeline</h3>
                <div className="h-[300px] w-full">
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 12 }} 
                                    allowDecimals={false}
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
                    )}
                </div>
            </div>

            {/* Source Distribution Pie Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Application Sources</h3>
                <div className="h-[300px] w-full">
                    {sourceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruitmentChartsWidget;
