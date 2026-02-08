import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatKES } from '../utils/budgetUtils';

const BudgetVsBankingChart = ({ data }) => {
    // Transform data for chart
    const chartData = data.map(item => ({
        month: item.month,
        'Planned Deposits': item.plannedCash + item.plannedCheque,
        'Actual Banked': item.actualCash + item.actualCheque,
        'Budget Obligations': item.budgetObligations
    }));

    // Calculate totals
    const totalPlanned = data.reduce((sum, item) => sum + item.plannedCash + item.plannedCheque, 0);
    const totalActual = data.reduce((sum, item) => sum + item.actualCash + item.actualCheque, 0);
    const totalObligations = data.reduce((sum, item) => sum + item.budgetObligations, 0);
    const coveragePercentage = totalObligations > 0 ? ((totalActual / totalObligations) * 100).toFixed(1) : 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="fw-bold mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="mb-1 small" style={{ color: entry.color }}>
                            {entry.name}: <strong>{formatKES(entry.value)}</strong>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-bold">📊 Budget vs Banking Inflows</h6>
                <small className="text-muted">Comparing planned deposits, actual banked amounts, and budget needs</small>
            </div>
            <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="Planned Deposits"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Actual Banked"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="Budget Obligations"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* Budget Coverage Indicator */}
                <div className="mt-4 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-semibold">Budget Coverage</span>
                        <span className={`badge ${parseFloat(coveragePercentage) >= 60 ? 'bg-success' : parseFloat(coveragePercentage) >= 40 ? 'bg-warning' : 'bg-danger'}`}>
                            {coveragePercentage}%
                        </span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                        <div
                            className={`progress-bar ${parseFloat(coveragePercentage) >= 60 ? 'bg-success' : parseFloat(coveragePercentage) >= 40 ? 'bg-warning' : 'bg-danger'}`}
                            style={{ width: `${Math.min(coveragePercentage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">Actual Banked: {formatKES(totalActual)}</small>
                        <small className="text-muted">Total Obligations: {formatKES(totalObligations)}</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetVsBankingChart;
