import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, DollarSign, Clock, CheckCircle, AlertTriangle,
    ChevronRight, TrendingDown, CreditCard, ClipboardList
} from 'lucide-react';
import { api } from '../../services/api';

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const PayablesFinanceTab = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [aging, setAging] = useState(null);
    const [pendingVouchers, setPendingVouchers] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [sumRes, ageRes, pvRes] = await Promise.all([
                    api.get('/api/payables/supplier-invoices/summary/').catch(() => null),
                    api.get('/api/payables/supplier-invoices/aging/').catch(() => null),
                    api.get('/api/payables/payment-vouchers/pending_approval/').catch(() => null),
                ]);
                setSummary(sumRes);
                setAging(ageRes);
                setPendingVouchers(pvRes);
            } catch (err) {
                console.error('Payables tab load error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner" />
            </div>
        );
    }

    const s = summary || {};
    const a = aging || {};
    const vouchers = Array.isArray(pendingVouchers) ? pendingVouchers : (pendingVouchers?.results || []);

    const fmt = (v) => {
        if (v == null) return '—';
        const n = Number(v);
        if (isNaN(n)) return '—';
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toLocaleString();
    };

    const agingBuckets = [
        { key: 'current', label: 'Current', color: '#16a34a' },
        { key: '31_60', label: '31–60 days', color: '#ca8a04' },
        { key: '61_90', label: '61–90 days', color: '#ea580c' },
        { key: 'over_90', label: '90+ days', color: '#dc2626' },
    ];

    const agingTotal = agingBuckets.reduce((t, b) => t + Number(a[b.key] || 0), 0) || 1;

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="dashboard-content">
            {/* KPI Cards */}
            <div className="stats-grid-dense p-5">
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<DollarSign />} color="#2563eb" label="Total Payables" value={`KSh ${fmt(s.total_payables)}`} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<CheckCircle />} color="#16a34a" label="Approved Invoices" value={s.approved_invoices ?? '—'} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<Clock />} color="#ca8a04" label="Pending Approval" value={s.pending_invoices ?? '—'} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<CreditCard />} color="#7c3aed" label="Total Paid" value={`KSh ${fmt(s.total_paid)}`} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<TrendingDown />} color="#dc2626" label="Overdue" value={`KSh ${fmt(a.over_90)}`} sub="90+ days" subColor="#dc2626" />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<ClipboardList />} color="#0891b2" label="Pending Vouchers" value={vouchers.length} />
                </motion.div>
            </div>

            {/* Two-column detail area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem' }}>
                {/* Aging Chart */}
                <motion.div variants={cardVariants} className="widget-compact">
                    <div className="widget-header-compact">
                        <h3>Payables Aging</h3>
                    </div>
                    <div className="widget-content-compact" style={{ padding: '0.75rem 1rem' }}>
                        {/* Bar chart */}
                        <div style={{ display: 'flex', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: '0.75rem' }}>
                            {agingBuckets.map(b => {
                                const w = (Number(a[b.key] || 0) / agingTotal) * 100;
                                return w > 0 ? <div key={b.key} style={{ width: `${w}%`, background: b.color, minWidth: 2 }} title={`${b.label}: KSh ${fmt(a[b.key])}`} /> : null;
                            })}
                        </div>
                        {agingBuckets.map(b => (
                            <div key={b.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{b.label}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>KSh {fmt(a[b.key])}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Pending Vouchers */}
                <motion.div variants={cardVariants} className="widget-compact">
                    <div className="widget-header-compact">
                        <h3>Pending Payment Vouchers</h3>
                        <button className="view-all-btn" onClick={() => navigate('/dashboard/payables/vouchers')}>
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="widget-content-compact" style={{ padding: '0.5rem 1rem' }}>
                        {vouchers.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>No pending vouchers</p>}
                        {vouchers.slice(0, 6).map((v, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{v.voucher_number || v.reference || `#${v.id}`}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>{v.supplier_name || v.payee || ''}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>KSh {fmt(v.amount || v.total)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style>{`
                .view-all-btn {
                    display: flex; align-items: center; gap: 2px;
                    background: none; border: none; color: #2563eb;
                    font-size: 0.8rem; font-weight: 600; cursor: pointer;
                }
                .view-all-btn:hover { text-decoration: underline; }
            `}</style>
        </motion.div>
    );
};

const KpiCard = ({ icon, color, label, value, sub, subColor }) => (
    <div style={{
        background: 'var(--card-bg, #fff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: 12, padding: '1rem 1.1rem',
        display: 'flex', flexDirection: 'column', gap: '0.3rem',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color, opacity: 0.85 }}>{React.cloneElement(icon, { size: 18 })}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: subColor || '#64748b' }}>{sub}</div>}
    </div>
);

export default PayablesFinanceTab;
