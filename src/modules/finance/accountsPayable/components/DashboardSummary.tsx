import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, CheckCircle, AlertCircle, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { formatKES } from '../utils/formatters';
import { financeService } from '../../../../services/financeService';

const DashboardSummary = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        setLoading(true);
        try {
            const data = await financeService.getAPSummary();
            setStats(data);
        } catch (err) {
            console.error('Failed to load AP summary', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Loader2 className="spin" size={24} />
                <span className="ms-2 text-muted">Loading summary...</span>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="alert alert-warning">Failed to load summary data. Please refresh.</div>
        );
    }

    const cards = [
        {
            title: 'Total Payables',
            value: stats.total_payables,
            icon: DollarSign,
            color: 'primary',
            isCurrency: true,
        },
        {
            title: 'Approved Invoices',
            value: stats.approved_invoices,
            icon: CheckCircle,
            color: 'success',
            suffix: ' invoices'
        },
        {
            title: 'Pending Vouchers',
            value: stats.pending_vouchers,
            icon: Clock,
            color: 'warning',
            suffix: ' vouchers'
        },
        {
            title: 'Paid Vouchers',
            value: stats.paid_vouchers,
            icon: FileText,
            color: 'info',
            suffix: ' vouchers'
        },
        {
            title: 'Refunds Issued',
            value: stats.refunds_issued,
            icon: RefreshCw,
            color: 'danger',
            suffix: ' refunds'
        },
        {
            title: 'Overdue Payables',
            value: stats.overdue_count,
            icon: AlertCircle,
            color: stats.overdue_count > 0 ? 'danger' : 'success',
            suffix: ' items'
        },
        {
            title: 'Pending Retirements',
            value: stats.pending_retirements,
            icon: Clock,
            color: 'secondary',
            suffix: ' items'
        }
    ];

    return (
        <div className="dashboard-stats-row mb-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="stat-card">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="stat-card-label">{card.title}</div>
                            <div className={`text-${card.color}`}>
                                <Icon size={18} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="stat-card-value">
                            {card.isCurrency ? formatKES(card.value) : `${card.value}${card.suffix || ''}`}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardSummary;
