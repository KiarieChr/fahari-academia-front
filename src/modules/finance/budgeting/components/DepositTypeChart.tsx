import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatKES } from '../utils/budgetUtils';

const DepositTypeChart = ({ data }) => {
    const [viewMode, setViewMode] = useState('planned'); // 'planned' or 'actual'

    // Transform data for chart
    const chartData = data.map(item => ({
        month: item.month,
        Cash: viewMode === 'planned' ? item.plannedCash : item.actualCash,
        Cheque: viewMode === 'planned' ? item.plannedCheque : item.actualCheque
    }));

    // Calculate totals
    const totalCash = chartData.reduce((sum, item) => sum + item.Cash, 0);
    const totalCheque = chartData.reduce((sum, item) => sum + item.Cheque, 0);
    const total = totalCash + totalCheque;
    const cashPercentage = total > 0 ? ((totalCash / total) * 100).toFixed(1) : 0;
    const chequePercentage = total > 0 ? ((totalCheque / total) * 100).toFixed(1) : 0;

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
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0 fw-bold">💰 Cash vs Cheque Deposits</h6>
                        <small className="text-muted">Breakdown by deposit type</small>
                    </div>
                    <div className="btn-group btn-group-sm">
                        <button
                            className={`btn ${viewMode === 'planned' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('planned')}
                        >
                            Planned
                        </button>
                        <button
                            className={`btn ${viewMode === 'actual' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewMode('actual')}
                        >
                            Actual
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="Cash" fill="#10b981" />
                        <Bar dataKey="Cheque" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>

                {/* Summary */}
                <div className="row g-3 mt-3">
                    <div className="col-6">
                        <div className="p-3 bg-success-subtle rounded">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small fw-semibold text-success">Cash Deposits</span>
                                <span className="badge bg-success">{cashPercentage}%</span>
                            </div>
                            <div className="h5 mb-0 fw-bold text-success">{formatKES(totalCash)}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="p-3 bg-primary-subtle rounded">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small fw-semibold text-primary">Cheque Deposits</span>
                                <span className="badge bg-primary">{chequePercentage}%</span>
                            </div>
                            <div className="h5 mb-0 fw-bold text-primary">{formatKES(totalCheque)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositTypeChart;
