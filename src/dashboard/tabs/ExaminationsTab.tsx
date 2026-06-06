import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    GraduationCap, ClipboardList, CheckCircle2, Clock,
    BarChart3, ChevronRight, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const ExaminationsTab = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/api/examinations/examinations/').catch(() => null);
                const list = Array.isArray(res) ? res : (res?.results || []);
                setExams(list);
            } catch (err) {
                console.error('Examinations tab load error:', err);
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

    const statusGroups = {
        marks_entry: exams.filter(e => e.status === 'marks_entry'),
        published: exams.filter(e => e.status === 'published'),
        scheduled: exams.filter(e => e.status === 'scheduled' || e.status === 'upcoming'),
        draft: exams.filter(e => e.status === 'draft'),
    };

    const total = exams.length;

    const statusMeta = {
        marks_entry: { label: 'Marks Entry', color: '#ca8a04', icon: <ClipboardList size={18} /> },
        published: { label: 'Published', color: '#16a34a', icon: <CheckCircle2 size={18} /> },
        scheduled: { label: 'Scheduled', color: '#2563eb', icon: <Clock size={18} /> },
        draft: { label: 'Draft', color: '#64748b', icon: <FileSpreadsheet size={18} /> },
    };

    return (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="dashboard-content">
            {/* KPI Cards */}
            <div className="stats-grid-dense p-5">
                <motion.div variants={cardVariants}>
                    <KpiCard icon={<GraduationCap />} color="#2563eb" label="Total Exams" value={total} />
                </motion.div>
                {Object.entries(statusMeta).map(([key, meta]) => (
                    <motion.div key={key} variants={cardVariants}>
                        <KpiCard icon={meta.icon} color={meta.color} label={meta.label} value={statusGroups[key].length} />
                    </motion.div>
                ))}
            </div>

            {/* Marks Entry Progress */}
            {statusGroups.marks_entry.length > 0 && (
                <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
                    <motion.div variants={cardVariants} className="widget-compact" style={{ borderLeft: '4px solid #ca8a04' }}>
                        <div className="widget-header-compact">
                            <h3>Pending Marks Entry</h3>
                            <button className="view-all-btn" onClick={() => navigate('/dashboard/examinations')}>
                                View All <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="widget-content-compact" style={{ padding: '0.5rem 1rem' }}>
                            {statusGroups.marks_entry.slice(0, 6).map((exam, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{exam.name}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                                            {exam.grade_name || exam.class_name || ''} {exam.term_name ? `· ${exam.term_name}` : ''}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <AlertCircle size={14} color="#ca8a04" />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ca8a04' }}>Marks Entry</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Recent Exams */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem' }}>
                {/* Published */}
                <motion.div variants={cardVariants} className="widget-compact">
                    <div className="widget-header-compact">
                        <h3>Recently Published</h3>
                    </div>
                    <div className="widget-content-compact" style={{ padding: '0.5rem 1rem' }}>
                        {statusGroups.published.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>No published exams</p>}
                        {statusGroups.published.slice(0, 5).map((exam, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{exam.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>{exam.grade_name || exam.class_name || ''}</span>
                                </div>
                                <CheckCircle2 size={14} color="#16a34a" />
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Scheduled */}
                <motion.div variants={cardVariants} className="widget-compact">
                    <div className="widget-header-compact">
                        <h3>Upcoming / Scheduled</h3>
                    </div>
                    <div className="widget-content-compact" style={{ padding: '0.5rem 1rem' }}>
                        {statusGroups.scheduled.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem 0' }}>No scheduled exams</p>}
                        {statusGroups.scheduled.slice(0, 5).map((exam, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{exam.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>
                                        {exam.start_date || ''} {exam.grade_name || exam.class_name ? `· ${exam.grade_name || exam.class_name}` : ''}
                                    </span>
                                </div>
                                <Clock size={14} color="#2563eb" />
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

const KpiCard = ({ icon, color, label, value }) => (
    <div style={{
        background: 'var(--card-bg, #fff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: 12, padding: '1rem 1.1rem',
        display: 'flex', flexDirection: 'column', gap: '0.3rem',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color, opacity: 0.85 }}>{icon}</div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #64748b)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
        </div>
        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{value}</div>
    </div>
);

export default ExaminationsTab;
