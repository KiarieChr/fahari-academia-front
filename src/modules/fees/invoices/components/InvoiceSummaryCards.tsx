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
            color: 'text-indigo-600',
            bgClass: 'neo-pressed text-indigo-600',
        },
        {
            id: 'collected',
            title: 'Total Collected',
            value: formatKES(summary.totalCollected),
            subtitle: `${summary.collectionRate.toFixed(1)}% collection rate`,
            icon: CheckCircle,
            color: 'text-emerald-500',
            bgClass: 'neo-pressed text-emerald-500',
        },
        {
            id: 'outstanding',
            title: 'Outstanding Balance',
            value: formatKES(summary.totalOutstanding),
            subtitle: 'Pending payments',
            icon: CreditCard,
            color: 'text-amber-500',
            bgClass: 'neo-pressed text-amber-500',
        },
        {
            id: 'overdue',
            title: 'Overdue Amount',
            value: formatKES(summary.classBreakdown ? 0 : 0), // Placeholder until calculated
            subtitle: 'Past due date',
            icon: Clock,
            color: 'text-rose-500',
            bgClass: 'neo-pressed text-rose-500',
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
            {cards.map((card) => (
                <div key={card.id} className="neo-card p-3 border-none flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-grow">
                                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">{card.title}</p>
                                <h3 className="text-2xl font-black text-gray-700">{card.value}</h3>
                                {card.subtitle && (
                                    <small className={`font-bold ${card.color}`}>{card.subtitle}</small>
                                )}
                            </div>
                            <div className={`p-3 rounded-full ${card.bgClass} flex items-center justify-center`}>
                                <card.icon size={24} />
                            </div>
                        </div>

                        {/* Mini Progress Bar for Collection */}
                        {card.id === 'collected' && (
                            <div className="h-2 neo-pressed rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-emerald-500 shadow-sm transition-all duration-1000"
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
            ))}
        </div>
    );
};

export default InvoiceSummaryCards;
