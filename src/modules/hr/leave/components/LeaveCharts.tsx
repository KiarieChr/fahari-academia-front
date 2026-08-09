import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const LeaveCharts = ({ data }) => {
    // If dailyTrend is missing, use empty array
    const chartData = data?.dailyTrend || [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Leave Trend</h3>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-blue-600 font-medium outline-none hover:bg-gray-50">
                    <option>Weekly View</option>
                    <option>Monthly View</option>
                </select>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickCount={6}
                        />
                        <Tooltip
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend 
                            verticalAlign="top" 
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
                        />
                        <Bar
                            dataKey="Emergency Leave"
                            stackId="a"
                            fill="#BFDBFE"
                            barSize={20}
                        />
                        <Bar
                            dataKey="Sick Leave"
                            stackId="a"
                            fill="#FCA5A5"
                        />
                        <Bar
                            dataKey="Annual Leave"
                            stackId="a"
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default LeaveCharts;
