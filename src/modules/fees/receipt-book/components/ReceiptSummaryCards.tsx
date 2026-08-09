import React from 'react';
import { DollarSign, Receipt, Users, TrendingUp, CreditCard, Hash, BookOpen, FileText } from 'lucide-react';
import { formatKES, getPaymentMethodIcon } from '../utils/receiptUtils';

const ReceiptSummaryCards = ({ summary = {}, onCardClick }) => {
    // Helper to safely get nested values
    const safeGet = (obj, key, defaultVal = 0) => {
        return obj?.[key] ?? defaultVal;
    };

    const cards = [
        {
            id: 'total-receipts',
            title: 'Total Receipts Issued',
            value: safeGet(summary, 'totalReceiptsTerm'),
            subtitle: `${safeGet(summary, 'totalReceiptsToday')} today`,
            icon: Receipt,
            color: 'primary',
            bgClass: 'bg-primary-subtle',
            iconClass: 'text-primary',
            trend: summary.todayTrend,
            trendUp: true,
            tooltip: 'Total number of receipts issued this term'
        },
        {
            id: 'total-amount',
            title: 'Total Amount Collected',
            value: formatKES(safeGet(summary, 'totalAmountTerm')),
            subtitle: `${formatKES(safeGet(summary, 'totalAmountToday'))} today`,
            icon: DollarSign,
            color: 'success',
            bgClass: 'bg-success-subtle',
            iconClass: 'text-success',
            trend: summary.termTrend,
            trendUp: true,
            tooltip: 'Total amount collected this term'
        },
        {
            id: 'student-fee',
            title: 'Student Fee Receipts',
            value: summary.studentFeeReceipts?.count || 0,
            subtitle: formatKES(summary.studentFeeReceipts?.amount || 0),
            icon: FileText,
            color: 'info',
            bgClass: 'bg-info-subtle',
            iconClass: 'text-info',
            tooltip: 'Receipts for tuition, boarding, transport, etc.'
        },
        {
            id: 'non-fee',
            title: 'Non-Fee Student Receipts',
            value: summary.nonFeeReceipts?.count || 0,
            subtitle: formatKES(summary.nonFeeReceipts?.amount || 0),
            icon: BookOpen,
            color: 'warning',
            bgClass: 'bg-warning-subtle',
            iconClass: 'text-warning',
            tooltip: 'Receipts for uniforms, trips, ID cards, etc.'
        },
        {
            id: 'sponsor',
            title: 'Sponsor Receipts',
            value: summary.sponsorReceipts?.count || 0,
            subtitle: formatKES(summary.sponsorReceipts?.amount || 0),
            icon: Users,
            color: 'success',
            bgClass: 'bg-success-subtle',
            iconClass: 'text-success',
            tooltip: 'Sponsorship and donation receipts'
        },
        {
            id: 'general',
            title: 'General Receipts',
            value: summary.generalReceipts?.count || 0,
            subtitle: formatKES(summary.generalReceipts?.amount || 0),
            icon: Receipt,
            color: 'secondary',
            bgClass: 'bg-secondary-subtle',
            iconClass: 'text-secondary',
            tooltip: 'Other income receipts (rent, events, etc.)'
        },
        {
            id: 'payment-breakdown',
            title: 'Payment Method Breakdown',
            value: null,
            subtitle: null,
            icon: CreditCard,
            color: 'primary',
            bgClass: 'bg-light',
            iconClass: 'text-primary',
            isCustom: true,
            tooltip: 'Distribution by payment method'
        },
        {
            id: 'last-receipt',
            title: 'Last Receipt Number',
            value: summary.lastReceiptNumber || '-',
            subtitle: `Next: ${summary.nextReceiptNumber || '-'}`,
            icon: Hash,
            color: 'dark',
            bgClass: 'bg-light',
            iconClass: 'text-dark',
            tooltip: 'Most recent receipt number issued'
        }
    ];

    const handleCardClick = (cardId) => {
        if (onCardClick) {
            onCardClick(cardId);
        }
    };

    return (
        <div className="row g-2 mb-4">
            {cards.map((card) => (
                <div key={card.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                    <div
                        className={`card border-0 shadow-sm h-100 receipt-summary-card ${onCardClick ? 'cursor-pointer' : ''}`}
                        onClick={() => handleCardClick(card.id)}
                        title={card.tooltip}
                    >
                        <div className="card-body p-2">
                            {card.isCustom ? (
                                // Custom Payment Breakdown Card
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="flex-grow-1">
                                            <p className="text-muted text-xxsmall mb-1" style={{ fontSize: '0.65rem' }}>{card.title}</p>
                                        </div>
                                        <div className={`p-2 rounded ${card.bgClass}`}>
                                            <card.icon size={16} className={card.iconClass} />
                                        </div>
                                    </div>
                                    <div className="payment-breakdown">
                                        {Object.keys(summary.paymentMethodBreakdown || {}).map((method) => {
                                            const data = summary.paymentMethodBreakdown[method];
                                            return (
                                                <div key={method} className="d-flex justify-content-between align-items-center mb-1">
                                                    <div className="d-flex align-items-center gap-1">
                                                        <span style={{ fontSize: '0.75rem' }}>{getPaymentMethodIcon(method.charAt(0).toUpperCase() + method.slice(1))}</span>
                                                        <span className="text-xxsmall" style={{ fontSize: '0.65rem' }}>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="text-xxsmall fw-semibold" style={{ fontSize: '0.65rem' }}>{data.percentage.toFixed(1)}%</div>
                                                        <div className="text-muted" style={{ fontSize: '0.6rem' }}>
                                                            {formatKES(data.amount)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                // Standard Card
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="flex-grow-1">
                                            <p className="text-muted text-xxsmall mb-1" style={{ fontSize: '0.65rem' }}>{card.title}</p>
                                            <h5 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>{card.value}</h5>
                                            {card.subtitle && (
                                                <small className={`text-${card.color}`} style={{ fontSize: '0.65rem' }}>{card.subtitle}</small>
                                            )}
                                        </div>
                                        <div className={`p-2 rounded ${card.bgClass}`}>
                                            <card.icon size={16} className={card.iconClass} />
                                        </div>
                                    </div>
                                    {card.trend && (
                                        <div className="d-flex align-items-center gap-1">
                                            <TrendingUp
                                                size={12}
                                                className={card.trendUp ? 'text-success' : 'text-danger'}
                                                style={{ transform: card.trendUp ? 'none' : 'rotate(180deg)' }}
                                            />
                                            <span className={`text-xxsmall ${card.trendUp ? 'text-success' : 'text-danger'}`} style={{ fontSize: '0.65rem' }}>
                                                {card.trend}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReceiptSummaryCards;
