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
            color: 'indigo',
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
            color: 'emerald',
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
            color: 'blue',
            tooltip: 'Receipts for tuition, boarding, transport, etc.'
        },
        {
            id: 'non-fee',
            title: 'Non-Fee Student Receipts',
            value: summary.nonFeeReceipts?.count || 0,
            subtitle: formatKES(summary.nonFeeReceipts?.amount || 0),
            icon: BookOpen,
            color: 'amber',
            tooltip: 'Receipts for uniforms, trips, ID cards, etc.'
        },
        {
            id: 'sponsor',
            title: 'Sponsor Receipts',
            value: summary.sponsorReceipts?.count || 0,
            subtitle: formatKES(summary.sponsorReceipts?.amount || 0),
            icon: Users,
            color: 'emerald',
            tooltip: 'Sponsorship and donation receipts'
        },
        {
            id: 'general',
            title: 'General Receipts',
            value: summary.generalReceipts?.count || 0,
            subtitle: formatKES(summary.generalReceipts?.amount || 0),
            icon: Receipt,
            color: 'gray',
            tooltip: 'Other income receipts (rent, events, etc.)'
        },
        {
            id: 'payment-breakdown',
            title: 'Payment Method Breakdown',
            value: null,
            subtitle: null,
            icon: CreditCard,
            color: 'primary',
            isCustom: true,
            tooltip: 'Distribution by payment method'
        },
        {
            id: 'last-receipt',
            title: 'Last Receipt Number',
            value: summary.lastReceiptNumber || '-',
            subtitle: `Next: ${summary.nextReceiptNumber || '-'}`,
            icon: Hash,
            color: 'gray',
            tooltip: 'Most recent receipt number issued'
        }
    ];

    const handleCardClick = (cardId) => {
        if (onCardClick) {
            onCardClick(cardId);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            {cards.map((card) => (
                <div key={card.id} 
                     className={`neo-card p-3 border-none flex flex-col justify-between ${onCardClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                     onClick={() => handleCardClick(card.id)}
                     title={card.tooltip}
                >
                    <div>
                        {card.isCustom ? (
                            // Custom Payment Breakdown Card
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-grow">
                                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">{card.title}</p>
                                    </div>
                                    <div className={`p-3 rounded-full neo-pressed text-primary flex items-center justify-center`}>
                                        <card.icon size={24} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {Object.keys(summary.paymentMethodBreakdown || {}).map((method) => {
                                        const data = summary.paymentMethodBreakdown[method];
                                        return (
                                            <div key={method} className="flex justify-between items-center text-sm font-bold text-gray-700">
                                                <div className="flex items-center gap-2">
                                                    <span>{getPaymentMethodIcon(method.charAt(0).toUpperCase() + method.slice(1))}</span>
                                                    <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div>{data.percentage.toFixed(1)}%</div>
                                                    <div className="text-xs text-gray-500 font-medium">
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
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-grow">
                                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">{card.title}</p>
                                        <h3 className="text-2xl font-black text-gray-700">{card.value}</h3>
                                        {card.subtitle && (
                                            <small className={`font-bold text-${card.color}-500`}>{card.subtitle}</small>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-full neo-pressed text-${card.color}-500 flex items-center justify-center`}>
                                        <card.icon size={24} />
                                    </div>
                                </div>
                                {card.trend && (
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp
                                            size={16}
                                            className={card.trendUp ? 'text-emerald-500' : 'text-rose-500'}
                                            style={{ transform: card.trendUp ? 'none' : 'rotate(180deg)' }}
                                        />
                                        <span className={`text-xs font-bold ${card.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {card.trend}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReceiptSummaryCards;
