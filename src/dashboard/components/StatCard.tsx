import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, CreditCard, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const icons = {
    'users': Users,
    'user-check': UserCheck,
    'credit-card': CreditCard,
    'alert-triangle': AlertTriangle
};

const StatCard = ({ title, count, icon, color, iconColor, trend, trendLabel }) => {
    const IconComponent = icons[icon] || Users;
    const isPositive = trend > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            style={{
                background: 'white',
                padding: '2rem', // Increased padding for spaciousness
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 'auto', // Allow aspect ratio to control height
                aspectRatio: '1 / 1', // Force perfect square
                position: 'relative',
                border: '1px solid var(--border-color-light)',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{title}</p>
                </div>
                <div
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: iconColor
                    }}
                >
                    <IconComponent size={20} strokeWidth={2.5} />
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1', letterSpacing: '-1px' }}>{count}</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{
                    color: isPositive ? '#16a34a' : '#dc2626',
                    background: isPositive ? '#dcfce7' : '#fee2e2',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8rem'
                }}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(trend)}%
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{trendLabel}</span>
            </div>
        </motion.div>
    );
};

export default StatCard;
