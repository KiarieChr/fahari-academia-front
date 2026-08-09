
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ArrearsCharts = ({ type, data }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-KE', { prefix: 'KES', notation: "compact", compactDisplay: "short" }).format(value);
    };

    if (type === 'distribution') {
        return (
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value)} />
                        <Legend />
                        <Bar dataKey="value" name="Arrears Amount" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (type === 'intake') {
        return (
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    }

    if (type === 'trend') {
        return (
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" name="Arrears Trend" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return null;
};

export default ArrearsCharts;
