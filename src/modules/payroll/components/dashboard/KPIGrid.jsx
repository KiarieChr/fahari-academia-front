import React from 'react';
import { Users, DollarSign, Wallet, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const KPIGrid = () => {
    const stats = [
        {
            title: 'Total Employees',
            value: '142',
            sub: '+4 this month',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Gross Payroll',
            value: 'KES 4.2M',
            sub: 'vs 4.1M last month',
            icon: DollarSign,
            color: 'emerald'
        },
        {
            title: 'Net Payable',
            value: 'KES 3.1M',
            sub: 'Pending Approval',
            icon: Wallet,
            color: 'indigo'
        },
        {
            title: 'Pending Issues',
            value: '3',
            sub: 'Requires Action',
            icon: AlertCircle,
            color: 'amber'
        },
    ];

    return (
        <div className="dashboard-stats-row">
            {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                    <div className="flex justify-between items-start mb-1">
                        <div className="stat-card-label">{stat.title}</div>
                        <div className={`text-${stat.color}-600`}>
                            <stat.icon size={14} />
                        </div>
                    </div>
                    <div className="stat-card-value">
                        {stat.value}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                        {stat.sub}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPIGrid;
