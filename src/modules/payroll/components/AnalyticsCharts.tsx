import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const dataTrend = [
    { name: 'Aug', payroll: 40.5 },
    { name: 'Sep', payroll: 41.2 },
    { name: 'Oct', payroll: 42.0 },
    { name: 'Nov', payroll: 41.8 },
    { name: 'Dec', payroll: 44.5 },
    { name: 'Jan', payroll: 45.2 },
];

const dataDeductions = [
    { name: 'PAYE', value: 4500000 },
    { name: 'NSSF', value: 1200000 },
    { name: 'NHIF', value: 950000 },
    { name: 'Loans', value: 800000 },
    { name: 'Pension', value: 950000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsCharts = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Payroll Trend (Last 6 Months)</h3>
                <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value}M`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`KES ${value}M`, 'Total Payroll']}
                            />
                            <Area type="monotone" dataKey="payroll" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPayroll)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Deductions Breakdown</h3>
                <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={dataDeductions}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {dataDeductions.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCharts;
