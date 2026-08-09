import React from 'react';
import {
    CreditCard,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    FileText,
    Clock,
    PieChart,
    Users
} from 'lucide-react';
import { formatKES } from '../utils/invoiceUtils';

const InvoiceSummaryCards = ({ summary }) => {
    const cards = [
        {
            id: 'invoiced',
            title: 'Total Invoiced',
            value: formatKES(summary.totalInvoiced),
            subtitle: `${summary.invoiceCount} invoices generated`,
            icon: FileText,
            color: 'primary',
            bgClass: 'bg-primary-subtle',
            iconClass: 'text-primary'
        },
        {
            id: 'collected',
            title: 'Total Collected',
            value: formatKES(summary.totalCollected),
            subtitle: `${summary.collectionRate.toFixed(1)}% collection rate`,
            icon: CheckCircle,
            color: 'success',
            bgClass: 'bg-success-subtle',
            iconClass: 'text-success'
        },
        {
            id: 'outstanding',
            title: 'Outstanding Balance',
            value: formatKES(summary.totalOutstanding),
            subtitle: 'Pending payments',
            icon: CreditCard,
            color: 'warning',
            bgClass: 'bg-warning-subtle',
            iconClass: 'text-warning'
        },
        {
            id: 'overdue',
            title: 'Overdue Amount',
            value: formatKES(summary.classBreakdown ? 0 : 0), // Placeholder until calculated
            subtitle: 'Past due date',
            icon: Clock,
            color: 'danger',
            bgClass: 'bg-danger-subtle',
            iconClass: 'text-danger'
        }
    ];

    return (
        <div className="row g-3 mb-4">
            {cards.map((card) => (
                <div key={card.id} className="col-md-3">
                    <div className="card border-0 shadow-sm h-100 invoice-summary-card">
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

                            {/* Mini Progress Bar for Collection */}
                            {card.id === 'collected' && (
                                <div className="progress" style={{ height: '4px' }}>
                                    <div
                                        className="progress-bar bg-success"
                                        role="progressbar"
                                        style={{ width: `${summary.collectionRate}%` }}
                                        aria-valuenow={summary.collectionRate}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InvoiceSummaryCards;
