import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, DollarSign, CalendarCheck, UserCheck, Clock,
    TrendingUp, Briefcase, PieChart
} from 'lucide-react';
import { api } from '../../services/api';

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const HRPayrollTab = () => {
    const [hrData, setHrData] = useState(null);
    const [payrollData, setPayrollData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [hrRes, prRes] = await Promise.all([
                    api.get('/workforce/api/hr-analytics/dashboard/').catch(() => null),
                    api.get('/workforce/api/payroll-dashboard/summary/').catch(() => null),
                ]);
                setHrData(hrRes);
                setPayrollData(prRes);
            } catch (err) {
                console.error('HR tab load error:', err);
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

    const hr = hrData || {};
    const pr = payrollData || {};

    const fmt = (v) => {
        if (v == null) return '—';
        const n = Number(v);
        if (isNaN(n)) return '—';
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toLocaleString();
    };

    // Nested sub-objects from /workforce/api/hr-analytics/dashboard/
    const headcount = hr.headcount || {};
    const turnover = hr.turnover || {};
    const demographics = hr.demographics || {};
    const deptBreakdown = headcount.by_department || [];

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="dashboard-content">
            {/* KPI Cards */}
            <div className="stats-grid-dense p-5">
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<Users />} color="#2563eb" label="Total Staff" value={headcount.total_headcount ?? demographics.total_employees ?? '—'} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<UserCheck />} color="#16a34a" label="Active"
                        value={headcount.by_status?.active ?? '—'}
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<TrendingUp />} color="#ea580c" label="Turnover Rate"
                        value={turnover.turnover_rate != null ? `${Number(turnover.turnover_rate).toFixed(1)}%` : '—'}
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<DollarSign />} color="#7c3aed" label="Gross Payroll" value={`KSh ${fmt(pr.gross_payroll)}`} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<DollarSign />} color="#16a34a" label="Net Payroll" value={`KSh ${fmt(pr.net_payable)}`} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard
                        icon={<CalendarCheck />} color="#0891b2" label="Payroll Period"
                        value={pr.current_period?.name || '—'}
                    />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<Clock />} color="#ca8a04" label="New Hires" value={headcount.new_hires_this_month ?? turnover.new_hires ?? '—'} />
                </motion.div>
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<Briefcase />} color="#4f46e5" label="Departments" value={deptBreakdown.length || '—'} />
                </motion.div>
            </div>

            {/* Detail panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem' }}>
                {/* Department Breakdown */}
                <motion.div variants={cardVariants} className="widget-compact">
                    <div className="widget-header-compact">
                        <h3>Staff by Department</h3>
                    </div>
                    <div className="widget-content-compact" style={{ padding: '0.5rem 1rem' }}>
                        {deptBreakdown.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>No department data</p>}
                        {deptBreakdown.slice(0, 8).map((dept, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{dept.department__name || dept.name || 'Unknown'}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>{dept.count ?? dept.total ?? 0}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Payroll Summary */}
                <motion.div variants={cardVariants} className="widget-compact">
                    <div className="widget-header-compact">
                        <h3>Payroll Breakdown</h3>
                    </div>
                    <div className="widget-content-compact" style={{ padding: '0.5rem 1rem' }}>
                        {[
                            { label: 'Gross Pay', value: pr.gross_payroll },
                            { label: 'Net Payable', value: pr.net_payable },
                            { label: 'Allowances', value: pr.total_allowances },
                            { label: 'Deductions', value: pr.total_deductions },
                            { label: 'Employees Processed', value: pr.employees_processed, isCurrency: false },
                            { label: 'Pending Approvals', value: pr.pending_approvals, isCurrency: false },
                        ].filter(r => r.value != null).map((row, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{row.label}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{row.isCurrency === false ? row.value : `KSh ${fmt(row.value)}`}</span>
                            </div>
                        ))}
                        {pr && Object.keys(pr).length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>No payroll data</p>}
                    </div>
                </motion.div>
            </div>
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

export default HRPayrollTab;
