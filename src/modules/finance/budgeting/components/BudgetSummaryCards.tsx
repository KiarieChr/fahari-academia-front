import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, PieChart, Clock, AlertCircle } from 'lucide-react';
import { formatKES, formatPercentage, getUtilizationColor } from '../utils/budgetUtils';

const BudgetSummaryCards = ({ summary }) => {
    const remaining = summary.totalApprovedBudget - summary.totalActualSpent;
    const overBudget = summary.totalActualSpent > summary.totalApprovedBudget;

    const cards = [
        {
            id: 'approved',
            title: 'Total Approved Budget',
            value: formatKES(summary.totalApprovedBudget),
            icon: DollarSign,
            color: 'primary',
            bgClass: 'bg-primary-subtle',
            iconClass: 'text-primary',
            trend: null
        },
        {
            id: 'spent',
            title: 'Total Spent',
            value: formatKES(summary.totalActualSpent),
            icon: TrendingDown,
            color: 'success',
            bgClass: 'bg-success-subtle',
            iconClass: 'text-success',
            subtitle: `${formatPercentage(summary.utilizationPercentage)} utilized`
        },
        {
            id: 'remaining',
            title: 'Remaining Budget',
            value: formatKES(remaining),
            icon: overBudget ? AlertTriangle : TrendingUp,
            color: overBudget ? 'danger' : 'info',
            bgClass: overBudget ? 'bg-danger-subtle' : 'bg-info-subtle',
            iconClass: overBudget ? 'text-danger' : 'text-info',
            subtitle: overBudget ? 'Over budget!' : 'Available'
        },
        {
            id: 'utilization',
            title: 'Budget Utilization',
            value: formatPercentage(summary.utilizationPercentage),
            icon: PieChart,
            color: 'warning',
            bgClass: 'bg-warning-subtle',
            iconClass: 'text-warning',
            progress: summary.utilizationPercentage
        },
        {
            id: 'pending',
            title: 'Pending Payments',
            value: formatKES(summary.totalPendingPayments),
            icon: Clock,
            color: 'secondary',
            bgClass: 'bg-secondary-subtle',
            iconClass: 'text-secondary',
            subtitle: 'Awaiting approval'
        },
        {
            id: 'overbudget',
            title: 'Departments Over Budget',
            value: summary.departmentsOverBudget,
            icon: AlertCircle,
            color: 'danger',
            bgClass: 'bg-danger-subtle',
            iconClass: 'text-danger',
            subtitle: `${summary.departmentsWithinBudget} within budget`
        }
    ];

    return (
        <div className="row g-3 mb-4">
            {cards.map((card) => (
                <div key={card.id} className="col-lg-4 col-md-6">
                    <div className="card border-0 shadow-sm h-100 budget-summary-card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="flex-grow-1">
                                    <p className="text-muted small mb-1">{card.title}</p>
                                    <h3 className="mb-0 fw-bold">{card.value}</h3>
                                    {card.subtitle && (
                                        <small className={`text-${card.color}`}>{card.subtitle}</small>
                                    )}
                                </div>
                                <div className={`p-3 rounded ${card.bgClass}`}>
                                    <card.icon size={24} className={card.iconClass} />
                                </div>
                            </div>

                            {card.progress !== undefined && (
                                <div className="mt-3">
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{
                                                width: `${Math.min(card.progress, 100)}%`,
                                                backgroundColor: getUtilizationColor(card.progress)
                                            }}
                                            aria-valuenow={card.progress}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BudgetSummaryCards;
