import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsSection = () => {
    const trendData = [
        { month: 'Aug', cost: 3.8 },
        { month: 'Sep', cost: 3.9 },
        { month: 'Oct', cost: 3.85 },
        { month: 'Nov', cost: 4.0 },
        { month: 'Dec', cost: 4.1 },
        { month: 'Jan', cost: 4.2 },
    ];

    const pieData = [
        { name: 'Allowances', value: 35, color: '#3b82f6' },
        { name: 'Basic Pay', value: 50, color: '#10b981' },
        { name: 'Deductions', value: 15, color: '#f59e0b' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">6-Month Cost Trend</h3>
                    <select className="text-xs border-gray-200 rounded-lg px-2 py-1 bg-gray-50">
                        <option>Last 6 Months</option>
                        <option>YTD</option>
                    </select>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height={256}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `${val}M`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1f2937' }}
                            />
                            <Area type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Distribution Pie */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Cost Distribution</h3>
                <div className="flex-1 min-h-[200px] relative">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-gray-400">Total</span>
                        <span className="text-lg font-bold text-gray-800">4.2M</span>
                    </div>
                </div>

                <div className="space-y-3 mt-4">
                    {pieData.map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-gray-600">{item.name}</span>
                            </div>
                            <span className="font-semibold text-gray-800">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsSection;
