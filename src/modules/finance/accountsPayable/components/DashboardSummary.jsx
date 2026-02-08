import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatKES } from '../utils/formatters';

const DashboardSummary = ({ stats }) => {
    const cards = [
        {
            title: 'Total Payables',
            value: stats.totalPayables,
            icon: DollarSign,
            color: 'primary',
            trend: { value: '+12%', direction: 'up' }
        },
        {
            title: 'Approved AP Invoices',
            value: stats.approvedAPInvoices,
            icon: CheckCircle,
            color: 'success',
            suffix: ' invoices'
        },
        {
            title: 'Pending Vouchers',
            value: stats.pendingVouchers,
            icon: AlertCircle,
            color: 'warning',
            suffix: ' vouchers'
        },
        {
            title: 'Posted Vouchers',
            value: stats.postedVouchers,
            icon: FileText,
            color: 'info',
            suffix: ' vouchers'
        },
        {
            title: 'Refunds Issued',
            value: stats.refundsIssued,
            icon: RefreshCw,
            color: 'danger',
            suffix: ' refunds'
        },
        {
            title: 'Customer Balances',
            value: stats.customerInvoiceBalance,
            icon: DollarSign,
            color: 'secondary',
            trend: { value: '-8%', direction: 'down' }
        },
        {
            title: 'Overdue Payables',
            value: stats.overduePayables,
            icon: AlertCircle,
            color: stats.overduePayables > 0 ? 'danger' : 'success',
            suffix: ' items'
        }
    ];

    return (
        <div className="dashboard-stats-row mb-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const isCurrency = card.title.includes('Payables') || card.title.includes('Balances');

                return (
                    <div key={index} className="stat-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="stat-card-label">{card.title}</div>
                            <div className={`text-${card.color}`}>
                                <Icon size={18} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="stat-card-value">
                            {isCurrency ? formatKES(card.value) : `${card.value}${card.suffix || ''}`}
                        </div>
                        {card.trend && (
                            <div 
                                className={`small fw-bold text-${card.trend.direction === 'up' ? 'success' : 'danger'}`} 
                                style={{ fontSize: '11px', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                            >
                                {card.trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{card.trend.value}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardSummary;
