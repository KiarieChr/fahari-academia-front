import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    Users,
    FileText,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    XCircle,
    DollarSign,
    Calendar,
    ChevronRight,
    RefreshCw,
    Bell,
    UserCheck,
    UserX,
    Receipt,
    Truck
} from 'lucide-react';
import { api } from '../../services/api';

/**
 * SmartInsightsWidget
 * 
 * Displays intelligent insights about fees, invoicing, defaulters,
 * attendance, and payables on the main dashboard.
 */
const SmartInsightsWidget = ({ compact = false }) => {
    const navigate = useNavigate();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/fees/insights/');
            if (response.success) {
                setInsights(response.data);
            } else {
                setError('Failed to load insights');
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
            setError(err.message || 'Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return `KES ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `KES ${(amount / 1000).toFixed(0)}K`;
        }
        return `KES ${amount.toLocaleString()}`;
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'invoicing', label: 'Invoicing', icon: FileText },
        { id: 'defaulters', label: 'Defaulters', icon: AlertTriangle },
        { id: 'attendance', label: 'Attendance', icon: UserCheck },
    ];

    if (loading) {
        return (
            <div className="smart-insights-widget">
                <div className="insights-loading">
                    <RefreshCw className="spin" size={24} />
                    <span>Loading insights...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="smart-insights-widget">
                <div className="insights-error">
                    <AlertTriangle size={24} />
                    <span>{error}</span>
                    <button onClick={fetchInsights} className="btn btn-sm btn-outline-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!insights) return null;

    return (
        <div className="smart-insights-widget">
            {/* Header */}
            <div className="insights-header">
                <div className="insights-title">
                    <Bell size={18} />
                    <h3>Smart Insights</h3>
                    <span className="term-badge">{insights.current_term} {insights.current_year}</span>
                </div>
                <button
                    onClick={fetchInsights}
                    className="btn-refresh"
                    title="Refresh insights"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Alerts Section */}
            {insights.alerts && insights.alerts.length > 0 && (
                <div className="insights-alerts">
                    {insights.alerts.map((alert, index) => (
                        <motion.div
                            key={index}
                            className={`alert-card alert-${alert.type}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(alert.action_url)}
                        >
                            <div className="alert-icon">
                                {alert.type === 'danger' ? <AlertTriangle size={18} /> : <Bell size={18} />}
                            </div>
                            <div className="alert-content">
                                <strong>{alert.title}</strong>
                                <span>{alert.message}</span>
                            </div>
                            <ChevronRight size={18} className="alert-arrow" />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Tab Navigation */}
            {!compact && (
                <div className="insights-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="insights-content"
                >
                    {activeTab === 'overview' && (
                        <OverviewTab insights={insights} formatCurrency={formatCurrency} navigate={navigate} />
                    )}
                    {activeTab === 'invoicing' && (
                        <InvoicingTab insights={insights} navigate={navigate} />
                    )}
                    {activeTab === 'defaulters' && (
                        <DefaultersTab insights={insights} formatCurrency={formatCurrency} navigate={navigate} />
                    )}
                    {activeTab === 'attendance' && (
                        <AttendanceTab insights={insights} />
                    )}
                </motion.div>
            </AnimatePresence>

            <style>{`
                .smart-insights-widget {
                    background: var(--card-bg, #fff);
                    border-radius: 12px;
                    padding: 1rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .insights-loading, .insights-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 2rem;
                    color: var(--text-secondary);
                }

                .insights-error {
                    color: var(--danger, #dc3545);
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .insights-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border-color, #e5e7eb);
                }

                .insights-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .insights-title h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .term-badge {
                    background: var(--primary-light, #e3f2fd);
                    color: var(--primary, #2196f3);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .btn-refresh {
                    background: none;
                    border: none;
                    padding: 0.4rem;
                    cursor: pointer;
                    color: var(--text-secondary);
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .btn-refresh:hover {
                    background: var(--hover-bg, #f3f4f6);
                    color: var(--primary, #2196f3);
                }

                .insights-alerts {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .alert-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.6rem 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .alert-card:hover {
                    transform: translateX(4px);
                }

                .alert-warning {
                    background: #fff3e0;
                    border-left: 3px solid #ff9800;
                }

                .alert-warning .alert-icon { color: #ff9800; }

                .alert-danger {
                    background: #ffebee;
                    border-left: 3px solid #f44336;
                }

                .alert-danger .alert-icon { color: #f44336; }

                .alert-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .alert-content strong {
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .alert-content span {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                .alert-arrow {
                    color: var(--text-muted);
                }

                .insights-tabs {
                    display: flex;
                    gap: 0.25rem;
                    margin-bottom: 0.75rem;
                    padding: 0.25rem;
                    background: var(--bg-secondary, #f3f4f6);
                    border-radius: 8px;
                }

                .tab-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.5rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    font-weight: 500;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tab-btn:hover {
                    color: var(--text-main);
                }

                .tab-btn.active {
                    background: var(--card-bg, #fff);
                    color: var(--primary, #2196f3);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .insights-content {
                    flex: 1;
                    overflow-y: auto;
                }

                /* Stats Grid */
                .stats-mini-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .stat-mini {
                    background: var(--bg-secondary, #f9fafb);
                    padding: 0.6rem;
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-mini-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .stat-mini-label {
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-mini.success .stat-mini-value { color: #4caf50; }
                .stat-mini.warning .stat-mini-value { color: #ff9800; }
                .stat-mini.danger .stat-mini-value { color: #f44336; }
                .stat-mini.info .stat-mini-value { color: #2196f3; }

                /* Progress Bar */
                .progress-section {
                    margin-bottom: 0.75rem;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.35rem;
                }

                .progress-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .progress-value {
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .progress-bar-bg {
                    height: 8px;
                    background: var(--bg-secondary, #e5e7eb);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .progress-bar-fill.success { background: linear-gradient(90deg, #4caf50, #66bb6a); }
                .progress-bar-fill.warning { background: linear-gradient(90deg, #ff9800, #ffb74d); }
                .progress-bar-fill.danger { background: linear-gradient(90deg, #f44336, #ef5350); }

                /* List Items */
                .insights-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .insights-list-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem;
                    background: var(--bg-secondary, #f9fafb);
                    border-radius: 6px;
                    font-size: 0.75rem;
                }

                .insights-list-item-left {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .insights-list-item-name {
                    font-weight: 500;
                }

                .insights-list-item-meta {
                    color: var(--text-muted);
                    font-size: 0.65rem;
                }

                .insights-list-item-value {
                    font-weight: 600;
                    color: var(--danger, #f44336);
                }

                /* Section Headers */
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .section-header-icon {
                    padding: 0.3rem;
                    background: var(--bg-secondary, #f3f4f6);
                    border-radius: 6px;
                }

                /* Action Buttons */
                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.6rem;
                    margin-top: 0.75rem;
                    background: var(--primary, #2196f3);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: var(--primary-dark, #1976d2);
                }

                .action-btn.secondary {
                    background: var(--bg-secondary, #f3f4f6);
                    color: var(--text-main);
                }

                .action-btn.secondary:hover {
                    background: var(--border-color, #e5e7eb);
                }

                /* Attendance Dots */
                .attendance-visual {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 0.5rem;
                }

                .attendance-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.75rem;
                }

                .attendance-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .attendance-dot.present { background: #4caf50; }
                .attendance-dot.absent { background: #f44336; }
                .attendance-dot.late { background: #ff9800; }
            `}</style>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ insights, formatCurrency, navigate }) => (
    <div className="overview-tab">
        <div className="stats-mini-grid">
            <div className="stat-mini success">
                <div className="stat-mini-value">{insights.collection?.collection_rate || 0}%</div>
                <div className="stat-mini-label">Collection Rate</div>
            </div>
            <div className="stat-mini info">
                <div className="stat-mini-value">{insights.invoicing?.invoicing_rate || 0}%</div>
                <div className="stat-mini-label">Invoiced</div>
            </div>
            <div className="stat-mini warning">
                <div className="stat-mini-value">{insights.defaulters?.current_term?.count || 0}</div>
                <div className="stat-mini-label">Defaulters</div>
            </div>
            <div className="stat-mini">
                <div className="stat-mini-value">{insights.attendance?.today?.rate || 0}%</div>
                <div className="stat-mini-label">Attendance Today</div>
            </div>
        </div>

        <div className="progress-section">
            <div className="progress-header">
                <span className="progress-label">Fee Collection Progress</span>
                <span className="progress-value">{formatCurrency(insights.collection?.total_collected || 0)}</span>
            </div>
            <div className="progress-bar-bg">
                <div
                    className={`progress-bar-fill ${insights.collection?.collection_rate >= 70 ? 'success' : insights.collection?.collection_rate >= 40 ? 'warning' : 'danger'}`}
                    style={{ width: `${insights.collection?.collection_rate || 0}%` }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Billed: {formatCurrency(insights.collection?.total_billed || 0)}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Outstanding: {formatCurrency(insights.collection?.total_outstanding || 0)}
                </span>
            </div>
        </div>

        {insights.payables && (insights.payables.due_within_7_days?.count > 0 || insights.payables.overdue?.count > 0) && (
            <div className="payables-section" style={{
                background: '#fff3e0',
                padding: '0.6rem',
                borderRadius: '8px',
                marginTop: '0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Truck size={14} style={{ color: '#ff9800' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Supplier Payments</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem' }}>
                    <span>Due Soon: {insights.payables.due_within_7_days?.count || 0}</span>
                    <span style={{ color: '#f44336' }}>Overdue: {insights.payables.overdue?.count || 0}</span>
                </div>
            </div>
        )}

        <button className="action-btn" onClick={() => navigate('/dashboard/fees/invoices')}>
            <Receipt size={16} />
            View Fee Dashboard
        </button>
    </div>
);

// Invoicing Tab Component
const InvoicingTab = ({ insights, navigate }) => (
    <div className="invoicing-tab">
        <div className="stats-mini-grid">
            <div className="stat-mini info">
                <div className="stat-mini-value">{insights.invoicing?.total_enrolled || 0}</div>
                <div className="stat-mini-label">Total Enrolled</div>
            </div>
            <div className="stat-mini success">
                <div className="stat-mini-value">{insights.invoicing?.invoiced || 0}</div>
                <div className="stat-mini-label">Invoiced</div>
            </div>
            <div className="stat-mini warning">
                <div className="stat-mini-value">{insights.invoicing?.not_invoiced || 0}</div>
                <div className="stat-mini-label">Not Invoiced</div>
            </div>
            <div className="stat-mini">
                <div className="stat-mini-value">{insights.invoicing?.needs_manual_count || 0}</div>
                <div className="stat-mini-label">Need Manual</div>
            </div>
        </div>

        <div className="progress-section">
            <div className="progress-header">
                <span className="progress-label">Invoicing Coverage</span>
                <span className="progress-value">{insights.invoicing?.invoicing_rate || 0}%</span>
            </div>
            <div className="progress-bar-bg">
                <div
                    className={`progress-bar-fill ${insights.invoicing?.invoicing_rate >= 90 ? 'success' : insights.invoicing?.invoicing_rate >= 60 ? 'warning' : 'danger'}`}
                    style={{ width: `${insights.invoicing?.invoicing_rate || 0}%` }}
                />
            </div>
        </div>

        {insights.invoicing?.needs_manual_invoicing?.length > 0 && (
            <>
                <div className="section-header">
                    <div className="section-header-icon"><UserX size={14} /></div>
                    Students Needing Invoices
                </div>
                <div className="insights-list">
                    {insights.invoicing.needs_manual_invoicing.slice(0, 5).map((student, idx) => (
                        <div key={idx} className="insights-list-item">
                            <div className="insights-list-item-left">
                                <span className="insights-list-item-name">
                                    {student.student__first_name} {student.student__last_name}
                                </span>
                            </div>
                            <span className="insights-list-item-meta">{student.admission_number}</span>
                        </div>
                    ))}
                </div>
            </>
        )}

        <button className="action-btn" onClick={() => navigate('/dashboard/fees/invoices')}>
            <FileText size={16} />
            Generate Invoices
        </button>
    </div>
);

// Defaulters Tab Component
const DefaultersTab = ({ insights, formatCurrency, navigate }) => (
    <div className="defaulters-tab">
        <div className="stats-mini-grid">
            <div className="stat-mini danger">
                <div className="stat-mini-value">{insights.defaulters?.current_term?.count || 0}</div>
                <div className="stat-mini-label">{insights.current_term} Defaulters</div>
            </div>
            <div className="stat-mini warning">
                <div className="stat-mini-value">{insights.defaulters?.previous_term?.count || 0}</div>
                <div className="stat-mini-label">Previous Term</div>
            </div>
        </div>

        <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '0.75rem'
        }}>
            <div style={{
                flex: 1,
                background: '#ffebee',
                padding: '0.6rem',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.65rem', color: '#f44336', marginBottom: '0.25rem' }}>Current Arrears</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#d32f2f' }}>
                    {formatCurrency(insights.defaulters?.current_term?.total_arrears || 0)}
                </div>
            </div>
            <div style={{
                flex: 1,
                background: '#fff3e0',
                padding: '0.6rem',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.65rem', color: '#ff9800', marginBottom: '0.25rem' }}>Previous Arrears</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f57c00' }}>
                    {formatCurrency(insights.defaulters?.previous_term?.total_arrears || 0)}
                </div>
            </div>
        </div>

        {insights.defaulters?.current_term?.top_defaulters?.length > 0 && (
            <>
                <div className="section-header">
                    <div className="section-header-icon"><AlertTriangle size={14} /></div>
                    Top Defaulters
                </div>
                <div className="insights-list">
                    {insights.defaulters.current_term.top_defaulters.slice(0, 5).map((student, idx) => (
                        <div key={idx} className="insights-list-item">
                            <div className="insights-list-item-left">
                                <span className="insights-list-item-name">
                                    {student.student__student__first_name} {student.student__student__last_name}
                                </span>
                                <span className="insights-list-item-meta">{student.student__admission_number}</span>
                            </div>
                            <span className="insights-list-item-value">
                                {formatCurrency(student.balance)}
                            </span>
                        </div>
                    ))}
                </div>
            </>
        )}

        <button className="action-btn" onClick={() => navigate('/dashboard/fees/arrears')}>
            <AlertTriangle size={16} />
            View All Defaulters
        </button>
    </div>
);

// Attendance Tab Component
const AttendanceTab = ({ insights }) => (
    <div className="attendance-tab">
        <div className="section-header">
            <div className="section-header-icon"><Calendar size={14} /></div>
            Today's Attendance
        </div>

        <div className="stats-mini-grid">
            <div className="stat-mini success">
                <div className="stat-mini-value">{insights.attendance?.today?.present || 0}</div>
                <div className="stat-mini-label">Present</div>
            </div>
            <div className="stat-mini danger">
                <div className="stat-mini-value">{insights.attendance?.today?.absent || 0}</div>
                <div className="stat-mini-label">Absent</div>
            </div>
            <div className="stat-mini warning">
                <div className="stat-mini-value">{insights.attendance?.today?.late || 0}</div>
                <div className="stat-mini-label">Late</div>
            </div>
            <div className="stat-mini info">
                <div className="stat-mini-value">{insights.attendance?.today?.rate || 0}%</div>
                <div className="stat-mini-label">Rate</div>
            </div>
        </div>

        <div className="progress-section" style={{ marginTop: '0.75rem' }}>
            <div className="progress-header">
                <span className="progress-label">Today's Attendance Rate</span>
                <span className="progress-value">{insights.attendance?.today?.rate || 0}%</span>
            </div>
            <div className="progress-bar-bg">
                <div
                    className={`progress-bar-fill ${insights.attendance?.today?.rate >= 90 ? 'success' : insights.attendance?.today?.rate >= 75 ? 'warning' : 'danger'}`}
                    style={{ width: `${insights.attendance?.today?.rate || 0}%` }}
                />
            </div>
        </div>

        <div className="section-header" style={{ marginTop: '1rem' }}>
            <div className="section-header-icon"><TrendingUp size={14} /></div>
            This Week
        </div>

        <div style={{
            background: 'var(--bg-secondary, #f9fafb)',
            padding: '0.75rem',
            borderRadius: '8px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Records</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{insights.attendance?.this_week?.total || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Weekly Rate</span>
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: insights.attendance?.this_week?.rate >= 90 ? '#4caf50' : insights.attendance?.this_week?.rate >= 75 ? '#ff9800' : '#f44336'
                }}>
                    {insights.attendance?.this_week?.rate || 0}%
                </span>
            </div>
            <div className="attendance-visual">
                <div className="attendance-stat">
                    <div className="attendance-dot present"></div>
                    <span>{insights.attendance?.this_week?.present || 0} Present</span>
                </div>
                <div className="attendance-stat">
                    <div className="attendance-dot absent"></div>
                    <span>{insights.attendance?.this_week?.absent || 0} Absent</span>
                </div>
            </div>
        </div>
    </div>
);

export default SmartInsightsWidget;
