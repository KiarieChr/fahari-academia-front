import React from 'react';
import { Clock, AlertTriangle, AlertOctagon, XCircle } from 'lucide-react';

const fmtKES = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const BUCKETS = [
    { key: '0_30',    label: '0 – 30 days',  icon: Clock,         cls: 'aging-success' },
    { key: '31_60',   label: '31 – 60 days', icon: AlertTriangle, cls: 'aging-warning' },
    { key: '61_90',   label: '61 – 90 days', icon: AlertOctagon,  cls: 'aging-orange'  },
    { key: '90_plus', label: '90+ days',     icon: XCircle,       cls: 'aging-danger'  },
];

const AgingBands = ({ data = [] }) => {
    if (!data.length) return null;

    const total = data.reduce((s, d) => s + (d.amount || 0), 0);
    const byKey = {};
    data.forEach(d => { byKey[d.bucket] = d; });

    return (
        <>
            <style>{`
                .aging-card { border-radius: var(--border-radius-sm); padding: 0.85rem 1rem; border: 1.5px solid; transition: box-shadow var(--transition-fast); }
                .aging-card:hover { box-shadow: var(--shadow-md); }
                .aging-success { background: #ecfdf5; border-color: #6ee7b7; color: #059669; }
                .aging-warning { background: #fffbeb; border-color: #fcd34d; color: #d97706; }
                .aging-orange  { background: #fff7ed; border-color: #fdba74; color: #ea580c; }
                .aging-danger  { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
                .aging-label   { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                .aging-amount  { font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin: 4px 0 2px; }
                .aging-sub     { font-size: 0.73rem; color: var(--text-secondary); }
                .aging-badge   { font-size: 0.67rem; font-weight: 700; border-radius: 999px; padding: 1px 7px; color: #fff; }
                .aging-bar-bg  { height: 4px; border-radius: 999px; background: rgba(0,0,0,0.08); margin-top: 8px; }
                .aging-bar-fill{ height: 100%; border-radius: 999px; transition: width 0.6s ease; }
                .dark-mode .aging-success { background: rgba(5,150,105,0.12); border-color: rgba(16,185,129,0.3); }
                .dark-mode .aging-warning { background: rgba(217,119,6,0.12); border-color: rgba(252,211,77,0.3); }
                .dark-mode .aging-orange  { background: rgba(234,88,12,0.12); border-color: rgba(253,186,116,0.3); }
                .dark-mode .aging-danger  { background: rgba(220,38,38,0.12); border-color: rgba(252,165,165,0.3); }
                .dark-mode .aging-amount  { color: var(--text-main); }
            `}</style>
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color-light)',
                boxShadow: 'var(--shadow-sm)',
                padding: '1.25rem 1.5rem',
                marginTop: '1rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h6 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        📊 Arrears Ageing Analysis
                    </h6>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Based on invoice issue date</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {BUCKETS.map(({ key, label, icon: Icon, cls }) => {
                        const bucket = byKey[key] || { amount: 0, count: 0 };
                        const pct = total > 0 ? ((bucket.amount / total) * 100).toFixed(1) : '0.0';
                        return (
                            <div key={key} className={`aging-card ${cls}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                    <Icon size={13} />
                                    <span className={`aging-label`}>{label}</span>
                                </div>
                                <div className="aging-amount">{fmtKES(bucket.amount)}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="aging-sub">{bucket.count} invoice{bucket.count !== 1 ? 's' : ''}</span>
                                    <span className="aging-badge" style={{ background: 'currentColor', color: '#fff' }}>
                                        <span style={{ filter: 'brightness(4)' }}>{pct}%</span>
                                    </span>
                                </div>
                                <div className="aging-bar-bg">
                                    <div className="aging-bar-fill" style={{ background: 'currentColor', width: `${pct}%`, opacity: 0.6 }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default AgingBands;
