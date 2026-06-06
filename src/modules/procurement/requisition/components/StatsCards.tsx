
import React from 'react';
import { FileText, Clock, CheckCircle, XCircle, ShoppingBag, DollarSign } from 'lucide-react';

const StatsCards = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="dashboard-stats-row">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="stat-card animate-pulse bg-gray-50" style={{ minHeight: '80px' }}></div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: 'Total Requests', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Converted to PO', value: stats.poCreated, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
        {
            label: 'Total Value',
            value: (stats.totalAmount || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
            icon: DollarSign,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            isCurrency: true
        },
    ];

    return (
        <div className="dashboard-stats-row">
            {cards.map((card, index) => (
                <div key={index} className="stat-card">
                    <div className="flex items-center justify-between mb-1">
                        <div className="stat-card-label">{card.label}</div>
                        <div className={`${card.color}`}>
                            <card.icon size={14} />
                        </div>
                    </div>
                    <div className="stat-card-value">
                        {card.value}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
