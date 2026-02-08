import React from 'react';
import { getUtilizationColor, formatPercentage } from '../utils/budgetUtils';

const BudgetUtilizationChart = ({ data }) => {
    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h6 className="fw-bold mb-3">Budget Utilization by Department</h6>
                <div className="budget-utilization-list">
                    {data.map((item, index) => {
                        const utilization = parseFloat(item.utilization);
                        const color = getUtilizationColor(utilization);

                        return (
                            <div key={index} className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="small fw-medium">{item.department}</span>
                                    <span className="small fw-bold" style={{ color }}>
                                        {formatPercentage(utilization)}
                                    </span>
                                </div>
                                <div className="progress" style={{ height: '12px' }}>
                                    <div
                                        className="progress-bar"
                                        role="progressbar"
                                        style={{
                                            width: `${Math.min(utilization, 100)}%`,
                                            backgroundColor: color
                                        }}
                                        aria-valuenow={utilization}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    >
                                        {utilization > 100 && (
                                            <span className="position-absolute end-0 me-2 small text-white">
                                                +{(utilization - 100).toFixed(1)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between mt-1">
                                    <small className="text-muted">{item.status}</small>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BudgetUtilizationChart;
