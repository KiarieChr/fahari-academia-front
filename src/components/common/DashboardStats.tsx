import React from 'react';

const DashboardStats = ({ stats = [], onFilter = () => { } }) => {
    return (
        <div className="dashboard-stats-row">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="stat-card"
                    onClick={() => onFilter(stat.filter)}
                    role="button"
                    tabIndex={0}
                >
                    <div className="stat-card-label">{stat.label}</div>
                    <div className="stat-card-value">{stat.value}</div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
