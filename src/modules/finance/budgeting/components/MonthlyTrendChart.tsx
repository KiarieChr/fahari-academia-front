import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatKES } from '../utils/budgetUtils';

const MonthlyTrendChart = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="card border-0 shadow-sm p-3">
                    <p className="fw-bold mb-2">{label}</p>
                    <p className="mb-1 small">
                        <span className="text-primary">●</span> Budget: {formatKES(payload[0].value)}
                    </p>
                    <p className="mb-0 small">
                        <span className="text-success">●</span> Actual: {formatKES(payload[1].value)}
                    </p>
                    <p className="mb-0 small text-muted">
                        Variance: {formatKES(payload[0].value - payload[1].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h6 className="fw-bold mb-3">Monthly Budget vs Actual Trend</h6>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="budget"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Budget"
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Actual"
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlyTrendChart;
