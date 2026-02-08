import React from 'react';
import { Banknote, FileText, CheckCircle, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatKES, formatPercentage } from '../utils/budgetUtils';
import { calculateDepositVariance } from '../utils/bankingUtils';

const BankingSummaryCards = ({ summary }) => {
    const variance = calculateDepositVariance(
        summary.totalPlannedCashDeposits + summary.totalPlannedChequeDeposits,
        summary.totalActualBanked
    );

    const cards = [
        {
            id: 'planned-cash',
            title: 'Total Planned Cash Deposits',
            value: formatKES(summary.totalPlannedCashDeposits),
            icon: Banknote,
            color: 'primary',
            bgClass: 'bg-primary-subtle',
            iconClass: 'text-primary',
            tooltip: 'Total expected cash deposits from fees, events, donations, and sponsors'
        },
        {
            id: 'planned-cheque',
            title: 'Total Planned Cheque Deposits',
            value: formatKES(summary.totalPlannedChequeDeposits),
            icon: FileText,
            color: 'info',
            bgClass: 'bg-info-subtle',
            iconClass: 'text-info',
            tooltip: 'Total expected cheque deposits including government grants and sponsorships'
        },
        {
            id: 'actual-banked',
            title: 'Total Actual Banked',
            value: formatKES(summary.totalActualBanked),
            icon: CheckCircle,
            color: 'success',
            bgClass: 'bg-success-subtle',
            iconClass: 'text-success',
            subtitle: `${formatPercentage(summary.budgetCoveragePercentage)} budget coverage`,
            tooltip: 'Total amount successfully banked (cash banked + cheques cleared)'
        },
        {
            id: 'pending',
            title: 'Pending Deposits',
            value: formatKES(summary.pendingDeposits),
            icon: Clock,
            color: 'warning',
            bgClass: 'bg-warning-subtle',
            iconClass: 'text-warning',
            subtitle: `${summary.overdueDeposits} overdue`,
            tooltip: 'Deposits planned or in process but not yet cleared'
        },
        {
            id: 'variance',
            title: 'Deposit Variance',
            value: formatKES(Math.abs(variance.amount)),
            icon: variance.isPositive ? TrendingUp : TrendingDown,
            color: variance.isPositive ? 'success' : 'danger',
            bgClass: variance.isPositive ? 'bg-success-subtle' : 'bg-danger-subtle',
            iconClass: variance.isPositive ? 'text-success' : 'text-danger',
            subtitle: `${variance.isPositive ? '+' : '-'}${Math.abs(variance.percentage)}% vs planned`,
            tooltip: 'Difference between planned and actual deposits'
        },
        {
            id: 'bounced',
            title: 'Bounced Cheques',
            value: summary.bouncedCheques,
            icon: AlertCircle,
            color: summary.bouncedCheques > 0 ? 'danger' : 'secondary',
            bgClass: summary.bouncedCheques > 0 ? 'bg-danger-subtle' : 'bg-secondary-subtle',
            iconClass: summary.bouncedCheques > 0 ? 'text-danger' : 'text-secondary',
            subtitle: summary.bouncedCheques > 0 ? 'Requires follow-up' : 'All clear',
            tooltip: 'Number of cheques that bounced due to insufficient funds or other issues'
        }
    ];

    return (
        <div className="row g-3 mb-4">
            {cards.map((card) => (
                <div key={card.id} className="col-lg-4 col-md-6">
                    <div
                        className="card border-0 shadow-sm h-100 banking-summary-card"
                        title={card.tooltip}
                    >
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
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BankingSummaryCards;
