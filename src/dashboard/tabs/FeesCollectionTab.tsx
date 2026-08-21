import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, AlertTriangle, Receipt,
    Users, ArrowUpRight, ArrowDownRight, ChevronRight,
    CreditCard, PieChart, Clock
} from 'lucide-react';
import { api } from '../../services/api';

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const FeesCollectionTab = () => {
    const navigate = useNavigate();
    const [insights, setInsights] = useState(null);
    const [arrears, setArrears] = useState(null);
    const [receiptSummary, setReceiptSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [insRes, arrRes, rcptRes] = await Promise.all([
                    api.get('/api/fees/insights/').catch(() => null),
                    api.get('/api/fees/arrears/summary/').catch(() => null),
                    api.get('/api/fees/receipts/summary/').catch(() => null),
                ]);
                setInsights(insRes?.data || insRes);
                setArrears(arrRes);
                setReceiptSummary(rcptRes);
            } catch (err) {
                console.error('Fee tab load error:', err);
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

    const collection = insights?.collection || {};
    const invoicing = insights?.invoicing || {};
    const defaulters = insights?.defaulters?.current_term || {};
    const arrearsKpis = arrears?.kpis || {};
    const rcpt = receiptSummary || {};

    const fmt = (v) => {
        if (v == null) return '—';
        const n = Number(v);
        if (isNaN(n)) return '—';
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toLocaleString();
    };

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="dashboard-content">
            {/* KPI Cards */}
            <div className="stats-grid-dense p-5">
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<DollarSign />} color="#2563eb" label="Total Billed"
                        value={`KSh ${fmt(collection.total_billed)}`}
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<TrendingUp />} color="#16a34a" label="Collected"
                        value={`KSh ${fmt(collection.total_collected)}`}
                        sub={collection.collection_rate ? `${Number(collection.collection_rate).toFixed(1)}% rate` : null}
                        subColor="#16a34a"
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<AlertTriangle />} color="#ea580c" label="Outstanding"
                        value={`KSh ${fmt(collection.total_outstanding)}`}
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<Users />} color="#dc2626" label="Defaulters"
                        value={defaulters.count ?? arrearsKpis.student_count ?? '—'}
                        sub={arrearsKpis.total_arrears ? `KSh ${fmt(arrearsKpis.total_arrears)} total` : null}
                        subColor="#dc2626"
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<Receipt />} color="#7c3aed" label="Receipts Today"
                        value={rcpt.total_receipts_today ?? '—'}
                        sub={rcpt.total_amount_today ? `KSh ${fmt(rcpt.total_amount_today)}` : null}
                        subColor="#7c3aed"
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<CreditCard />} color="#0891b2" label="Receipts (Term)"
                        value={rcpt.total_receipts_term ?? '—'}
                        sub={rcpt.total_amount_term ? `KSh ${fmt(rcpt.total_amount_term)}` : null}
                        subColor="#0891b2"
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<PieChart />} color="#4f46e5" label="Invoicing Rate"
                        value={invoicing.invoicing_rate ? `${Number(invoicing.invoicing_rate).toFixed(0)}%` : '—'}
                        sub={invoicing.total_enrolled ? `${invoicing.invoiced}/${invoicing.total_enrolled} students` : null}
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<Clock />} color="#ca8a04" label="Avg Arrears"
                        value={arrearsKpis.average_arrears ? `KSh ${fmt(arrearsKpis.average_arrears)}` : '—'}
                    />
                </motion.div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem' }}>
                {/* Arrears by Class */}
                <motion.div variants={cardVariants} className="neo-card p-4 border-none flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-800">Arrears by Class</h3>
                        <button className="neo-btn px-3 py-1 text-xs flex items-center gap-1" onClick={() => navigate('/dashboard/fees/arrears')}>
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="flex-1" style={{ padding: '0 0.5rem' }}>
                        {(arrears?.by_class || []).length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>No arrears data</p>}
                        {(arrears?.by_class || []).slice(0, 8).map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.name}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>KSh {fmt(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Payment Method Breakdown */}
                <motion.div variants={cardVariants} className="neo-card p-4 border-none flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-800">Collection by Payment Method</h3>
                        <button className="neo-btn px-3 py-1 text-xs flex items-center gap-1" onClick={() => navigate('/dashboard/fees/receipts')}>
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="flex-1" style={{ padding: '0 0.5rem' }}>
                        {rcpt.payment_method_breakdown ? (
                            Object.entries(rcpt.payment_method_breakdown).map(([method, data], i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{method}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>({data.count} receipts)</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>KSh {fmt(data.amount)}</span>
                                        {data.percentage && <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>{Number(data.percentage).toFixed(1)}%</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>No receipt data</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Alerts */}
            {insights?.alerts && insights.alerts.length > 0 && (
                <motion.div variants={cardVariants} style={{ padding: '0 1rem', marginTop: '1rem' }}>
                    <div className="neo-card p-4 border-none" style={{ borderLeft: '4px solid #f59e0b' }}>
                        <div className="mb-2">
                            <h3 className="text-sm font-bold text-slate-800">Alerts</h3>
                        </div>
                        <div className="space-y-2">
                            {insights.alerts.slice(0, 5).map((alert, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.4rem 0', fontSize: '0.85rem', color: '#92400e' }}>
                                    <AlertTriangle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                                    <span>{alert.message || alert}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            <style>{`
            `}</style>
        </motion.div>
    );
};

const KpiCard = ({ icon, color, label, value, sub, subColor }) => (
    <div className="neo-card flex flex-col gap-1 p-4 border-none">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="neo-pressed rounded-lg p-2 flex items-center justify-center" style={{ color }}>{React.cloneElement(icon, { size: 18 })}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{value}</div>
        {sub && <div style={{ fontSize: '0.75rem', fontWeight: 600, color: subColor || '#64748b' }}>{sub}</div>}
    </div>
);

export default FeesCollectionTab;
