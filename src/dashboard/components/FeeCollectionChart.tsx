import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const FeeCollectionChart = ({ data, currentTerm }) => {
    // Format large numbers
    const formatValue = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toLocaleString();
    };

    return (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color-light)', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>Fee Collection</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentTerm || 'Current Term'}</span>
            </div>
            <div style={{ width: '100%', height: 260, position: 'relative' }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', padding: '12px' }} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend to match design */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                    {data.map((item, index) => (
                        <div key={index} style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                                {item.name}
                            </div>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                KES {formatValue(item.value)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeeCollectionChart;
