import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const DeductionsAnalytics = () => {
    const trendData = [
        { month: 'Sep', statutory: 2700000, voluntary: 900000, loans: 550000 },
        { month: 'Oct', statutory: 2750000, voluntary: 920000, loans: 530000 },
        { month: 'Nov', statutory: 2780000, voluntary: 930000, loans: 520000 },
        { month: 'Dec', statutory: 2800000, voluntary: 940000, loans: 510000 },
        { month: 'Jan', statutory: 2800000, voluntary: 950000, loans: 500000 },
        { month: 'Feb', statutory: 2800000, voluntary: 950000, loans: 500000 },
    ];

    const distributionData = [
        { name: 'PAYE (Tax)', value: 55, color: '#ef4444' }, // Red
        { name: 'NSSF', value: 10, color: '#f97316' },       // Orange
        { name: 'NHIF/SHA', value: 8, color: '#f59e0b' },     // Amber
        { name: 'SACCO', value: 15, color: '#10b981' },       // Emerald
        { name: 'Loans', value: 12, color: '#6366f1' },       // Indigo
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trend Chart - Stacked Bar */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Deductions Trend (6 Months)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `${value / 1000000}M`} />
                            <Tooltip
                                cursor={{ fill: '#f9fafb' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="statutory" name="Statutory" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="voluntary" name="Voluntary" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="loans" name="Loans" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Deduction Types</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={2}
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

export default DeductionsAnalytics;
