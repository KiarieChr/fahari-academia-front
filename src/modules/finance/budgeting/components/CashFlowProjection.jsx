import React from 'react';
import { AlertTriangle, TrendingDown, Target } from 'lucide-react';
import { formatKES } from '../utils/budgetUtils';
import { calculateCashFlowGap, getSuggestedDepositTarget } from '../utils/bankingUtils';

const CashFlowProjection = ({ deposits, budgetObligations }) => {
    // Analyze cash flow for upcoming months
    const months = ['February', 'March', 'April', 'May'];

    const cashFlowAnalysis = months.map(month => {
        const monthDeposits = deposits.filter(d => d.month === month);
        const totalPlanned = monthDeposits.reduce((sum, d) => sum + d.amount, 0);

        // Mock budget obligations per month (in real app, this would come from budgetObligations)
        const monthlyBudget = month === 'February' ? 7200000 :
            month === 'March' ? 7200000 :
                month === 'April' ? 6000000 : 6500000;

        const gap = totalPlanned - monthlyBudget;
        const hasShortfall = gap < 0;
        const coverage = monthlyBudget > 0 ? ((totalPlanned / monthlyBudget) * 100).toFixed(1) : 0;

        const suggested = getSuggestedDepositTarget(monthlyBudget, totalPlanned);

        return {
            month,
            totalPlanned,
            monthlyBudget,
            gap,
            hasShortfall,
            coverage,
            suggested
        };
    });

    const shortfalls = cashFlowAnalysis.filter(m => m.hasShortfall);
    const totalShortfall = shortfalls.reduce((sum, m) => sum + Math.abs(m.gap), 0);

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-bold">📈 Cash Flow Projection & Warnings</h6>
                <small className="text-muted">Upcoming months analysis and recommendations</small>
            </div>
            <div className="card-body">
                {/* Overall Status */}
                {shortfalls.length > 0 ? (
                    <div className="alert alert-danger d-flex align-items-start gap-3 mb-4">
                        <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                        <div className="flex-grow-1">
                            <h6 className="alert-heading mb-2">Cash Flow Shortfall Detected</h6>
                            <p className="mb-2">
                                {shortfalls.length} month(s) have projected shortfalls totaling <strong>{formatKES(totalShortfall)}</strong>
                            </p>
                            <p className="mb-0 small">
                                <strong>Action Required:</strong> Plan additional deposits or defer non-critical expenses
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                        <Target size={20} />
                        <span>Cash flow projections are healthy for upcoming months</span>
                    </div>
                )}

                {/* Monthly Breakdown */}
                <div className="row g-3 mb-4">
                    {cashFlowAnalysis.map((analysis) => (
                        <div key={analysis.month} className="col-md-6">
                            <div className={`card border ${analysis.hasShortfall ? 'border-danger' : 'border-success'}`}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h6 className="mb-1">{analysis.month}</h6>
                                            <small className="text-muted">Budget Coverage: {analysis.coverage}%</small>
                                        </div>
                                        {analysis.hasShortfall && (
                                            <TrendingDown size={20} className="text-danger" />
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-muted">Planned Deposits</span>
                                            <span className="fw-semibold">{formatKES(analysis.totalPlanned)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between small mb-1">
                                            <span className="text-muted">Budget Obligations</span>
                                            <span className="fw-semibold">{formatKES(analysis.monthlyBudget)}</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between small">
                                            <span className={`fw-bold ${analysis.hasShortfall ? 'text-danger' : 'text-success'}`}>
                                                {analysis.hasShortfall ? 'Shortfall' : 'Surplus'}
                                            </span>
                                            <span className={`fw-bold ${analysis.hasShortfall ? 'text-danger' : 'text-success'}`}>
                                                {formatKES(Math.abs(analysis.gap))}
                                            </span>
                                        </div>
                                    </div>

                                    {analysis.hasShortfall && (
                                        <div className="p-2 bg-warning-subtle rounded">
                                            <small className="text-warning-emphasis">
                                                <strong>Suggested Target:</strong> {formatKES(analysis.suggested.suggestedTarget)}
                                                <br />
                                                <strong>Additional Needed:</strong> {formatKES(analysis.suggested.additionalNeeded)}
                                            </small>
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    <div className="progress mt-3" style={{ height: '8px' }}>
                                        <div
                                            className={`progress-bar ${parseFloat(analysis.coverage) >= 60 ? 'bg-success' : parseFloat(analysis.coverage) >= 40 ? 'bg-warning' : 'bg-danger'}`}
                                            style={{ width: `${Math.min(analysis.coverage, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                <div className="card bg-info-subtle border-0">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">💡 Recommendations</h6>
                        <ul className="mb-0 small">
                            <li className="mb-2">Accelerate fee collection for upcoming months</li>
                            <li className="mb-2">Follow up on pending sponsorship commitments</li>
                            <li className="mb-2">Consider deferring non-critical capital projects</li>
                            <li className="mb-0">Explore short-term financing options if shortfall persists</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashFlowProjection;
