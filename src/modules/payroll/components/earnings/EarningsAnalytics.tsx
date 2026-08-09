import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const EarningsAnalytics = () => {
    const trendData = [
        { month: 'Sep', basic: 7800000, allowances: 2900000, overtime: 950000 },
        { month: 'Oct', basic: 7900000, allowances: 2950000, overtime: 1200000 },
        { month: 'Nov', basic: 8000000, allowances: 3000000, overtime: 1100000 },
        { month: 'Dec', basic: 8100000, allowances: 3100000, overtime: 1400000 },
        { month: 'Jan', basic: 8150000, allowances: 3120000, overtime: 1000000 },
        { month: 'Feb', basic: 8200000, allowances: 3150000, overtime: 1100000 },
    ];

    const distributionData = [
        { name: 'Basic Salary', value: 65, color: '#3b82f6' },
        { name: 'House Allowance', value: 15, color: '#8b5cf6' },
        { name: 'Transport', value: 8, color: '#10b981' },
        { name: 'Overtime', value: 7, color: '#f59e0b' },
        { name: 'Bonuses', value: 5, color: '#ec4899' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trend Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Earnings Trend (6 Months)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAllow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}M`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="basic" name="Basic Pay" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBasic)" />
                            <Area type="monotone" dataKey="allowances" name="Allowances" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorAllow)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Cost Distribution</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {distributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default EarningsAnalytics;
