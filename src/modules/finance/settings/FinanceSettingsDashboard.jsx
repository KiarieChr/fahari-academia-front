import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Settings, Wallet, CreditCard, FileText, Receipt, DollarSign, Briefcase, Bell, Calendar, Database, CheckCircle2, AlertTriangle, Loader2, ChevronRight, BookOpen } from 'lucide-react';
import CashbookSettings from './components/CashbookSettings';
import FiscalPeriodSettings from './components/FiscalPeriodSettings';
import PaymentMethodSettings from './components/PaymentMethodSettings';
import DocumentNumberingSettings from './components/DocumentNumberingSettings';
import ReceiptFormatSettings from './components/ReceiptFormatSettings';
import OtherSettings from './components/OtherSettings';
import { financeService } from '../../../services/financeService';
import { api } from '../../../services/api';
import './FinanceSettings.css';

import { toast } from 'react-toastify';

const GeneralSettingsPanel = ({ settings, onSave }) => {
    const [formData, setFormData] = React.useState(settings || {});

    // Update formData when settings prop changes
    React.useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h6 className="fw-bold mb-3">General Finance Configuration</h6>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Currency</label>
                        <select className="form-select" name="currency_code" value={formData.currency_code} onChange={handleChange}>
                            <option value="KES">KES - Kenyan Shilling</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Fiscal Year Start Month</label>
                        <select className="form-select" name="financial_year_start_month" value={formData.financial_year_start_month} onChange={handleChange}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Tax ID Label</label>
                        <input type="text" className="form-control" name="tax_id_label" value={formData.tax_id_label} onChange={handleChange} />
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => onSave(formData)}>Save General Settings</button>
            </div>
        </div>
    );
};

const FinanceSettingsDashboard = () => {
    const [activeSection, setActiveSection] = useState('cashbooks');
    const [loading, setLoading] = useState(true);
    const [settingsData, setSettingsData] = useState({
        settings: {},
        cashbooks: [],
        fiscalPeriods: [],
        paymentMethods: [],
        taxes: [],
        accounts: []
    });

    React.useEffect(() => {
        const fetchAllSettings = async () => {
            setLoading(true);
            try {
                // Fetch all settings in parallel
                const [settingsRes, cashbooksRes, fiscalRes, methodsRes, taxesRes, accountsRes] = await Promise.all([
                    financeService.getSettings(),
                    financeService.getCashbooks(),
                    financeService.getFiscalPeriods(),
                    financeService.getPaymentMethods(),
                    financeService.getTaxes(),
                    financeService.getAccounts()
                ]);

                // Helper to safely extract array (handles pagination vs direct list)
                // Since api.js unwraps response, 'res' IS the data.
                const getList = (res) => {
                    if (Array.isArray(res)) return res;
                    if (res && res.results && Array.isArray(res.results)) return res.results;
                    return [];
                };

                setSettingsData({
                    settings: settingsRes, // Settings is a single object
                    cashbooks: getList(cashbooksRes),
                    fiscalPeriods: getList(fiscalRes),
                    paymentMethods: getList(methodsRes),
                    taxes: getList(taxesRes),
                    accounts: getList(accountsRes)
                });
            } catch (error) {
                console.error("Failed to load finance settings", error);
                toast.error('Failed to load finance settings. Check your connection or token.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllSettings();
    }, []);

    const handleSaveSettings = async (updatedSettings) => {
        try {
            await financeService.updateSettings(updatedSettings);
            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Failed to update settings", error);
            toast.error("Error updating settings");
        }
    };

    const sections = [
        { id: 'fiscal-periods', label: 'Fiscal Periods', icon: Calendar, description: 'Manage financial years' },
        { id: 'cashbooks', label: 'Cashbooks', icon: Wallet, description: 'Manage cash and bank accounts' },
        { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard, description: 'Configure payment options' },
        { id: 'document-numbering', label: 'Document Numbering', icon: FileText, description: 'Set up document formats' },
        { id: 'receipts', label: 'Receipt Format', icon: Receipt, description: 'Configure receipt appearance' },
        { id: 'other', label: 'Account Mapping', icon: DollarSign, description: 'Account Mapping,Voucher, invoice, imprest settings' },
        { id: 'general', label: 'General Settings', icon: Settings, description: 'Currency, fiscal year, etc.' },
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert settings' },
        { id: 'seeding', label: 'Database Seeding', icon: Database, description: 'Seed COA & student accounts' },
    ];

    const renderContent = () => {
        if (loading) return <div className="p-5 text-center">Loading settings...</div>;

        switch (activeSection) {
            case 'fiscal-periods':
                return <FiscalPeriodSettings periods={settingsData.fiscalPeriods} />;
            case 'cashbooks':
                return <CashbookSettings cashbooks={settingsData.cashbooks} accounts={settingsData.accounts} />;
            case 'payment-methods':
                return <PaymentMethodSettings methods={settingsData.paymentMethods} accounts={settingsData.accounts} />;
            case 'document-numbering':
                return <DocumentNumberingSettings settings={settingsData.settings} onSave={handleSaveSettings} />;
            case 'receipts':
                return <ReceiptFormatSettings settings={settingsData.settings} onSave={handleSaveSettings} />;
            case 'other':
                return <OtherSettings settings={settingsData.settings} accounts={settingsData.accounts} onSave={handleSaveSettings} />;
            case 'general':
                return <GeneralSettingsPanel settings={settingsData.settings} onSave={handleSaveSettings} />;
            case 'notifications':
                return <NotificationSettingsPanel settings={settingsData.settings} onSave={handleSaveSettings} />;
            case 'seeding':
                return <SeedingPanel />;
            default:
                return <CashbookSettings cashbooks={settingsData.cashbooks} accounts={settingsData.accounts} />;
        }
    };

    return (
        <DashboardLayout title="Finance Settings">
            <div className="finance-settings-dashboard">
                <div className="settings-header mb-4">
                    <h4 className="fw-bold mb-1">Finance Settings</h4>
                    <p className="text-muted small mb-0">Configure financial system behavior and preferences</p>
                </div>

                <div className="d-flex flex-column flex-lg-row gap-4">
                    {/* Left Navigation — horizontal scroll on mobile, vertical sidebar on lg+ */}
                    <div className="flex-shrink-0" style={{ width: 'auto' }}>
                        <div className="card border-0 shadow-sm" style={{ position: 'sticky', top: '20px' }}>
                            <div className="card-body p-2">
                                <div className="settings-nav d-flex flex-row flex-lg-column overflow-auto">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            className={`settings-nav-item flex-shrink-0 ${activeSection === section.id ? 'active' : ''}`}
                                            onClick={() => setActiveSection(section.id)}
                                        >
                                            <section.icon size={18} className="me-2" />
                                            <div className="flex-grow-1 text-start text-nowrap text-lg-wrap">
                                                <div className="fw-medium">{section.label}</div>
                                                <small className="text-muted d-none d-lg-block">{section.description}</small>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="settings-content">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// ==========================================================================
// SeedingPanel — triggers finance seed management commands via the API
// ==========================================================================
const SeedingPanel = () => {
    const SEEDS = [
        {
            key: 'seed_coa',
            label: 'Seed Chart of Accounts',
            icon: BookOpen,
            color: '#3f51b5',
            badge: 'Step 1 — Run First',
            badgeColor: '#3f51b5',
            description:
                'Seeds the full standard Chart of Accounts required for the Finance module: ' +
                'Assets (Cash, Receivables, Fixed Assets), Liabilities (Payables, Loans), ' +
                'Equity (Capital, Retained Earnings), Income (Tuition Fees, Other Revenue) ' +
                'and Expenses (Salaries, Utilities, Depreciation). ' +
                'Safe to re-run — uses update_or_create so existing accounts are not duplicated.',
        },
        {
            key: 'seed_student_accounts',
            label: 'Seed Student Fee Accounts',
            icon: Database,
            color: '#059669',
            badge: 'Step 2 — Run After COA',
            badgeColor: '#059669',
            description:
                'Seeds student-related sub-accounts under the COA: fee vote heads ' +
                '(Tuition, Boarding, Transport, Library, Lab … 20 items), ' +
                'Student Receivables, Student Prepaid Fees and Caution Deposits. ' +
                'These accounts appear as options in Fee Structures. ' +
                'Requires COA to be seeded first.',
        },
    ];

    const [states, setStates] = useState(
        Object.fromEntries(SEEDS.map(s => [s.key, { loading: false, result: null }]))
    );

    const runSeed = async (commandKey) => {
        setStates(prev => ({ ...prev, [commandKey]: { loading: true, result: null } }));
        try {
            const result = await api.post('/api/system/run-command/', { command: commandKey });
            setStates(prev => ({ ...prev, [commandKey]: { loading: false, result } }));
            if (result.status === 'success') {
                toast.success(`✅ ${commandKey} completed successfully`);
            } else {
                toast.error(`❌ ${commandKey} failed`);
            }
        } catch (err) {
            const errMsg = err?.response?.data?.error || err?.message || 'Unknown error';
            setStates(prev => ({
                ...prev,
                [commandKey]: { loading: false, result: { status: 'error', error: errMsg } }
            }));
            toast.error(`❌ ${commandKey} failed: ${errMsg}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    borderRadius: 14,
                    padding: '1.5rem 1.75rem',
                    border: '1px solid rgba(99,102,241,0.25)',
                    marginBottom: '1.5rem',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        background: 'rgba(99,102,241,0.15)',
                        borderRadius: 10,
                        padding: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Database size={22} color="#818cf8" />
                    </div>
                    <div>
                        <h5 style={{ color: '#f1f5f9', fontWeight: 700, margin: 0 }}>Database Seeding</h5>
                        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                            One-click data seeding for the Finance module. Safe to run on fresh or existing databases.
                        </p>
                    </div>
                </div>
                <div style={{
                    background: 'rgba(245,158,11,0.1)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: 8,
                    padding: '0.65rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginTop: 12,
                }}>
                    <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ color: '#fbbf24', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                        <strong>Order matters:</strong> Seed the Chart of Accounts first, then Seed Student Accounts.
                        Running Student Accounts without COA will fail because the parent accounts won't exist.
                    </p>
                </div>
            </div>

            {/* Seed Cards */}
            {SEEDS.map((seed) => {
                const state = states[seed.key];
                const Icon = seed.icon;
                const isSuccess = state.result?.status === 'success';
                const isError = state.result?.status === 'error';

                return (
                    <div
                        key={seed.key}
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 14,
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        }}
                    >
                        {/* Card header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            padding: '1.25rem 1.5rem',
                            gap: 16,
                            flexWrap: 'wrap',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: 0 }}>
                                <div style={{
                                    background: `${seed.color}18`,
                                    borderRadius: 10,
                                    padding: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Icon size={20} color={seed.color} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                        <h6 style={{ fontWeight: 700, color: '#1e293b', margin: 0, fontSize: '0.95rem' }}>
                                            {seed.label}
                                        </h6>
                                        <span style={{
                                            background: `${seed.badgeColor}18`,
                                            color: seed.badgeColor,
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: 999,
                                            border: `1px solid ${seed.badgeColor}30`,
                                            letterSpacing: '0.05em',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {seed.badge}
                                        </span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, lineHeight: 1.6 }}>
                                        {seed.description}
                                    </p>
                                </div>
                            </div>

                            {/* Action button */}
                            <button
                                onClick={() => runSeed(seed.key)}
                                disabled={state.loading}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '0.6rem 1.25rem',
                                    background: state.loading
                                        ? '#f1f5f9'
                                        : isSuccess
                                            ? '#ecfdf5'
                                            : isError
                                                ? '#fef2f2'
                                                : `linear-gradient(135deg, ${seed.color} 0%, ${seed.color}cc 100%)`,
                                    color: state.loading
                                        ? '#94a3b8'
                                        : isSuccess
                                            ? '#059669'
                                            : isError
                                                ? '#dc2626'
                                                : '#ffffff',
                                    border: `1px solid ${
                                        state.loading ? '#e2e8f0' :
                                        isSuccess ? '#a7f3d0' :
                                        isError ? '#fecaca' :
                                        seed.color
                                    }`,
                                    borderRadius: 10,
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: state.loading ? 'not-allowed' : 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    transition: 'all 0.2s',
                                    boxShadow: (!state.loading && !isSuccess && !isError)
                                        ? `0 4px 12px ${seed.color}40`
                                        : 'none',
                                }}
                            >
                                {state.loading ? (
                                    <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Running...</>
                                ) : isSuccess ? (
                                    <><CheckCircle2 size={15} /> Done — Run Again</>                  
                                ) : isError ? (
                                    <><AlertTriangle size={15} /> Failed — Retry</>
                                ) : (
                                    <><ChevronRight size={15} /> Run Seed</>
                                )}
                            </button>
                        </div>

                        {/* Output terminal */}
                        {state.result && (
                            <div style={{
                                borderTop: `1px solid ${
                                    isSuccess ? '#d1fae5' : isError ? '#fee2e2' : '#e2e8f0'
                                }`,
                                background: isSuccess ? '#f0fdf4' : isError ? '#fef2f2' : '#f8fafc',
                                padding: '1rem 1.5rem',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginBottom: 8,
                                    color: isSuccess ? '#059669' : '#dc2626',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}>
                                    {isSuccess
                                        ? <><CheckCircle2 size={13} /> Output</>  
                                        : <><AlertTriangle size={13} /> Error</>}
                                </div>
                                <pre style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.78rem',
                                    color: isSuccess ? '#166534' : '#991b1b',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    margin: 0,
                                    maxHeight: 220,
                                    overflowY: 'auto',
                                    lineHeight: 1.7,
                                }}>
                                    {isError
                                        ? (state.result.error || 'An unknown error occurred.')
                                        : (state.result.output || 'Command completed with no output.')}
                                </pre>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Spin keyframes */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// NotificationSettingsPanel
const NotificationSettingsPanel = ({ settings, onSave }) => {
    const [formData, setFormData] = React.useState(settings || {});

    React.useEffect(() => {
        if (settings) setFormData(settings);
    }, [settings]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.id]: value });
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <h6 className="fw-bold mb-3">Notification & Alert Settings</h6>

                <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="low_cash_alert_enabled" checked={formData.low_cash_alert_enabled || false} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="low_cash_alert_enabled">
                        <strong>Low Balance Alert</strong>
                        <div className="small text-muted">Alert when cashbook balance falls below threshold</div>
                    </label>
                </div>

                <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="overdue_invoice_alert_enabled" checked={formData.overdue_invoice_alert_enabled || false} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="overdue_invoice_alert_enabled">
                        <strong>Overdue Invoice Alert</strong>
                        <div className="small text-muted">Alert for unpaid invoices past due date</div>
                    </label>
                </div>

                <button className="btn btn-primary" onClick={() => onSave(formData)}>Save Notification Settings</button>
            </div>
        </div>
    );
};

export default FinanceSettingsDashboard;

