import React from 'react';
import { Building, Landmark, ShieldCheck, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, count }) => (
    <div className="stat-card">
        <div className="stat-card-label">{title}</div>
        <div className="stat-card-value">{count}</div>
    </div>
);

const InstitutionsStats = () => {
    return (
        <div className="dashboard-stats-row">
            <StatCard title="Banks" count="4" />
            <StatCard title="SACCOs" count="3" />
            <StatCard title="Insurance Providers" count="2" />
            <StatCard title="Pension / Other" count="2" />
        </div>
    );
};

export default InstitutionsStats;
