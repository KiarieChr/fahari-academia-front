import React from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import { formatKES, calculateTotalTermFee, calculateAnnualFee, calculateExpectedRevenue } from '../utils/feeStructureUtils';

const FeeImpactPreview = ({ feeItems, studentCount, previousYearItems }) => {
    if (!feeItems || feeItems.length === 0) {
        return null;
    }

    const termTotal = calculateTotalTermFee(feeItems);
    const annualTotal = calculateAnnualFee(feeItems);
    const expectedRevenue = calculateExpectedRevenue(feeItems, studentCount);

    // Calculate comparison with previous year
    let comparison = null;
    if (previousYearItems && previousYearItems.length > 0) {
        const previousTermTotal = calculateTotalTermFee(previousYearItems);
        const difference = termTotal - previousTermTotal;
        const percentageChange = previousTermTotal > 0 ? ((difference / previousTermTotal) * 100) : 0;
        comparison = { difference, percentageChange, previous: previousTermTotal };
    }

    // Calculate breakdown by applies to
    const allStudentsFee = calculateTotalTermFee(feeItems, 'All Students');
    const boardersFee = calculateTotalTermFee(feeItems, 'Boarders Only');
    const dayScholarsFee = calculateTotalTermFee(feeItems, 'Day Scholars Only');

    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-bold">Fee Impact & Preview</h6>
            </div>
            <div className="card-body">
                <div className="row g-3">
                    {/* Term Total */}
                    <div className="col-md-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-success-subtle rounded">
                                <DollarSign size={24} className="text-success" />
                            </div>
                            <div>
                                <small className="text-muted">Total Term Fee</small>
                                <div className="fw-bold fs-5">{formatKES(termTotal)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Annual Total */}
                    <div className="col-md-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-primary-subtle rounded">
                                <DollarSign size={24} className="text-primary" />
                            </div>
                            <div>
                                <small className="text-muted">Annual Fee Total</small>
                                <div className="fw-bold fs-5">{formatKES(annualTotal)}</div>
                                <small className="text-muted">All 3 terms</small>
                            </div>
                        </div>
                    </div>

                    {/* Expected Revenue */}
                    <div className="col-md-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-3 bg-info-subtle rounded">
                                <Users size={24} className="text-info" />
                            </div>
                            <div>
                                <small className="text-muted">Expected Revenue</small>
                                <div className="fw-bold fs-5">{formatKES(expectedRevenue)}</div>
                                <small className="text-muted">{studentCount} students</small>
                            </div>
                        </div>
                    </div>

                    {/* Year-over-Year Comparison */}
                    {comparison && (
                        <div className="col-md-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`p-3 rounded ${comparison.difference >= 0 ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
                                    {comparison.difference >= 0 ? (
                                        <TrendingUp size={24} className="text-success" />
                                    ) : (
                                        <TrendingDown size={24} className="text-danger" />
                                    )}
                                </div>
                                <div>
                                    <small className="text-muted">vs Previous Year</small>
                                    <div className={`fw-bold fs-5 ${comparison.difference >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {comparison.difference >= 0 ? '+' : ''}{comparison.percentageChange.toFixed(1)}%
                                    </div>
                                    <small className="text-muted">{formatKES(Math.abs(comparison.difference))}</small>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Student Type Breakdown */}
                {(boardersFee > 0 || dayScholarsFee > 0) && (
                    <div className="mt-4">
                        <h6 className="fw-bold mb-3">Fee Breakdown by Student Type</h6>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="border rounded p-3">
                                    <small className="text-muted">All Students (Base)</small>
                                    <div className="fw-bold">{formatKES(allStudentsFee)}</div>
                                </div>
                            </div>
                            {boardersFee > 0 && (
                                <div className="col-md-4">
                                    <div className="border rounded p-3">
                                        <small className="text-muted">Boarders (Total)</small>
                                        <div className="fw-bold">{formatKES(allStudentsFee + boardersFee)}</div>
                                        <small className="text-success">+{formatKES(boardersFee)} boarding</small>
                                    </div>
                                </div>
                            )}
                            {dayScholarsFee > 0 && (
                                <div className="col-md-4">
                                    <div className="border rounded p-3">
                                        <small className="text-muted">Day Scholars (Total)</small>
                                        <div className="fw-bold">{formatKES(allStudentsFee + dayScholarsFee)}</div>
                                        <small className="text-info">+{formatKES(dayScholarsFee)} day scholar fees</small>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeeImpactPreview;
