import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatKES } from '../utils/budgetUtils';

const BudgetVsActualChart = ({ data }) => {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="card border-0 shadow-sm p-3">
                    <p className="fw-bold mb-2">{payload[0].payload.department}</p>
                    <p className="mb-1 small">
                        <span className="text-primary">●</span> Budget: {formatKES(payload[0].value)}
                    </p>
                    <p className="mb-1 small">
                        <span className="text-success">●</span> Actual: {formatKES(payload[1].value)}
                    </p>
                    {payload[2] && (
                        <p className="mb-0 small">
                            <span className="text-warning">●</span> Pending: {formatKES(payload[2].value)}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h6 className="fw-bold mb-3">Budget vs Actual Spending by Department</h6>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="department"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                            interval={0}
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar dataKey="budget" fill="#3b82f6" name="Approved Budget" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="actual" fill="#10b981" name="Actual Spent" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="pending" fill="#f59e0b" name="Pending Payments" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BudgetVsActualChart;
