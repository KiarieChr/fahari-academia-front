
import React from 'react';
import { FileText, CheckCircle, XCircle, ShoppingCart, DollarSign, Send, Truck } from 'lucide-react';

const POStatsCards = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Draft POs', value: stats.draft, icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
        { label: 'Issued Ops', value: stats.issued, icon: Send, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Partially Delivered', value: stats.partial, icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const valueCards = [
        {
            label: 'Total PO Value',
            value: (stats.totalValue || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
            icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50'
        },
        {
            label: 'Outstanding Value',
            value: (stats.outstandingValue || 0).toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }),
            icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50'
        }
    ];

    return (
        <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                <card.icon size={18} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                            <h4 className="text-2xl font-bold text-gray-900">{card.value}</h4>
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {valueCards.map((card, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                            <h4 className={`text-xl font-bold ${card.color}`}>{card.value}</h4>
                        </div>
                        <div className={`p-3 rounded-full ${card.bg} ${card.color}`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default POStatsCards;
