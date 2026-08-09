import React, { useState, useEffect } from 'react';
import {
    Zap, FileText, AlertTriangle, CreditCard, Bell, Shield,
    Link as LinkIcon, Save, CheckCircle2, ChevronRight, Info,
    ToggleLeft, ToggleRight, Smartphone, MessageSquare, Loader2,
    RefreshCw, Settings2
} from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { api } from '../../../services/api';
import { toast } from 'react-toastify';

/* ── helpers ─────────────────────────────────────────── */
const Toggle = ({ checked, onChange, id }) => (
    <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: checked ? 'var(--primary-color)' : 'var(--border-color-light)',
            position: 'relative', flexShrink: 0,
            transition: 'background var(--transition-fast)',
            boxShadow: checked ? `0 0 0 3px var(--primary-light)` : 'none',
        }}
    >
        <span style={{
            position: 'absolute', top: 2, left: checked ? 22 : 2,
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            transition: 'left var(--transition-fast)',
        }} />
    </button>
);

const SettingRow = ({ label, description, children, last }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border-color-light)',
    }}>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: description ? 2 : 0 }}>{label}</div>
            {description && <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
);

const SectionCard = ({ title, icon: Icon, accent, children, badge }) => (
    <div style={{
        background: 'var(--card-bg)', borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color-light)', boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden', marginBottom: 20,
    }}>
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color-light)',
            background: 'var(--bg-light)',
        }}>
            <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: accent || 'var(--primary-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={16} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{title}</span>
                {badge && (
                    <span style={{ marginLeft: 8, fontSize: '0.65rem', fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: 999, padding: '1px 8px', textTransform: 'uppercase' }}>
                        {badge}
                    </span>
                )}
            </div>
        </div>
        <div style={{ padding: '0.25rem 1.25rem' }}>{children}</div>
    </div>
);

const SelectField = ({ value, onChange, options, style }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
            padding: '7px 10px', borderRadius: 'var(--border-radius-sm)',
            border: '1px solid var(--border-color-light)', fontSize: '0.82rem',
            background: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none',
            minWidth: 180, ...style,
        }}
    >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
);

const NumberInput = ({ value, onChange, prefix, min = 0 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border-color-light)', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', width: 150 }}>
        {prefix && (
            <span style={{ padding: '7px 10px', background: 'var(--bg-light)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color-light)' }}>
                {prefix}
            </span>
        )}
        <input
            type="number"
            min={min}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ flex: 1, padding: '7px 10px', border: 'none', outline: 'none', fontSize: '0.83rem', background: 'var(--input-bg)', color: 'var(--text-main)' }}
        />
    </div>
);

const InfoBox = ({ children, type = 'info' }) => {
    const colors = {
        info:    { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1e40af' },
        warning: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#92400e' },
        success: { bg: '#ecfdf5', border: '#a7f3d0', icon: '#059669', text: '#065f46' },
    };
    const c = colors[type] || colors.info;
    return (
        <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 'var(--border-radius-sm)', padding: '0.75rem 1rem', marginTop: 10, marginBottom: 6, display: 'flex', gap: 10 }}>
            <Info size={15} color={c.icon} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: '0.8rem', color: c.text, lineHeight: 1.55 }}>{children}</div>
        </div>
    );
};

const PaymentMethodCard = ({ label, icon, enabled, onChange }) => (
    <div
        style={{
            background: enabled ? 'var(--primary-light)' : 'var(--bg-light)',
            border: `2px solid ${enabled ? 'var(--primary-color)' : 'var(--border-color-light)'}`,
            borderRadius: 'var(--border-radius-sm)', padding: '0.85rem', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            minWidth: 100, transition: 'all var(--transition-fast)', textAlign: 'center',
        }}
        onClick={() => onChange(!enabled)}
    >
        <div style={{ fontSize: 22 }}>{icon}</div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: enabled ? 'var(--primary-color)' : 'var(--text-secondary)' }}>{label}</span>
        <Toggle checked={enabled} onChange={onChange} />
    </div>
);

const IntegrationRow = ({ name, description, status, onConnect }) => {
    const isConnected = status === 'connected';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
            borderBottom: '1px solid var(--border-color-light)',
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--text-main)' }}>{name}</div>
                <div style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>{description}</div>
            </div>
            <span style={{
                fontSize: '0.72rem', fontWeight: 700, borderRadius: 999, padding: '3px 10px',
                background: isConnected ? '#ecfdf5' : 'var(--bg-light)',
                color: isConnected ? '#059669' : 'var(--text-muted)',
                border: `1px solid ${isConnected ? '#6ee7b7' : 'var(--border-color-light)'}`,
            }}>
                {isConnected ? '✓ Connected' : 'Not Connected'}
            </span>
            <button
                onClick={onConnect}
                style={{
                    padding: '6px 14px', borderRadius: 'var(--border-radius-sm)',
                    border: `1.5px solid var(--primary-color)`, background: 'var(--card-bg)',
                    color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--card-bg)'}
            >
                {isConnected ? 'Manage' : 'Connect'}
            </button>
        </div>
    );
};

/* ── TABS ────────────────────────────────────────────── */
const TABS = [
    { id: 'billing',       label: 'Auto Billing',         icon: Zap,           },
    { id: 'structure',     label: 'Fee Structure',         icon: FileText,      },
    { id: 'arrears',       label: 'Arrears & Penalties',   icon: AlertTriangle, },
    { id: 'payments',      label: 'Payments',              icon: CreditCard,    },
    { id: 'notifications', label: 'Notifications',         icon: Bell,          },
    { id: 'access',        label: 'Access & Approvals',    icon: Shield,        },
    { id: 'integrations',  label: 'Integrations',          icon: LinkIcon,      },
];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const FeeSettingsDashboard = () => {
    const [activeTab, setActiveTab] = useState('billing');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    /* ── state ── */
    const [billing, setBilling] = useState({
        auto_billing_enabled: false,
        billing_mode: 'AUTO',
        default_billing_days: 0,
        prorated_billing: false,
        re_billing_protocol: 'void',
    });
    const [structure, setStructure] = useState({
        lock_approved: true,
        mid_term_changes: false,
        rounding: 'none',
    });
    const [arrears, setArrears] = useState({
        warning_threshold: 1000,
        critical_threshold: 10000,
        penalties_enabled: true,
        penalty_type: 'percentage',
        penalty_value: 5,
        grace_days: 30,
    });
    const [payments, setPayments] = useState({
        methods: { cash: true, bank_check: true, mpesa: true, online_card: false, bank_transfer: true },
        allow_overpayments: true,
        allow_partial: true,
        allocation_priority: 'oldest_first',
    });
    const [notifications, setNotifications] = useState({
        email_on_invoice: true,
        sms_on_payment: true,
        whatsapp_on_invoice: false,
        whatsapp_on_arrears: false,
        weekly_arrears_reminder: false,
        critical_arrears_alert: true,
    });
    const [access, setAccess] = useState({
        teachers_view_balances: false,
        principal_approve_waivers: true,
        require_approval_above: 50000,
        cashier_can_void: false,
    });

    /* ── Local storage helpers ── */
    const saveToLocalStorage = (currentBilling, currentStructure, currentArrears, currentPayments, currentNotifications, currentAccess) => {
        try {
            localStorage.setItem('fee_settings_billing', JSON.stringify(currentBilling || billing));
            localStorage.setItem('fee_settings_structure', JSON.stringify(currentStructure || structure));
            localStorage.setItem('fee_settings_arrears', JSON.stringify(currentArrears || arrears));
            localStorage.setItem('fee_settings_payments', JSON.stringify(currentPayments || payments));
            localStorage.setItem('fee_settings_notifications', JSON.stringify(currentNotifications || notifications));
            localStorage.setItem('fee_settings_access', JSON.stringify(currentAccess || access));
        } catch (e) {
            console.error("Failed to save settings to localStorage", e);
        }
    };

    const changeTab = (tabId) => {
        saveToLocalStorage();
        setActiveTab(tabId);
    };

    /* ── Load settings ── */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await api.get('/api/finance/settings/');
                
                const localBilling = localStorage.getItem('fee_settings_billing');
                const localStructure = localStorage.getItem('fee_settings_structure');
                const localArrears = localStorage.getItem('fee_settings_arrears');
                const localPayments = localStorage.getItem('fee_settings_payments');
                const localNotifications = localStorage.getItem('fee_settings_notifications');
                const localAccess = localStorage.getItem('fee_settings_access');

                if (data) {
                    setBilling(prev => ({ 
                        ...prev, 
                        ...data,
                        ...(localBilling ? JSON.parse(localBilling) : {})
                    }));
                } else if (localBilling) {
                    setBilling(prev => ({ ...prev, ...JSON.parse(localBilling) }));
                }

                if (localStructure) setStructure(JSON.parse(localStructure));
                if (localArrears) setArrears(JSON.parse(localArrears));
                if (localPayments) setPayments(JSON.parse(localPayments));
                if (localNotifications) setNotifications(JSON.parse(localNotifications));
                if (localAccess) setAccess(JSON.parse(localAccess));

            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ── Save ── */
    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/api/finance/settings/', {
                auto_billing_enabled: billing.auto_billing_enabled,
                billing_mode: billing.billing_mode,
                default_billing_days: billing.default_billing_days,
            });
            saveToLocalStorage();
            toast.success('Settings saved successfully!');
        } catch {
            toast.error('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const active = TABS.find(t => t.id === activeTab);

    return (
        <DashboardLayout title="Fee Module Settings">
            <style>{`
                .fee-settings-tab { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:var(--border-radius-sm); border:none; background:transparent; color:var(--text-secondary); font-size:0.83rem; font-weight:500; cursor:pointer; text-align:left; width:100%; transition:all var(--transition-fast); }
                .fee-settings-tab:hover:not(.active) { background:var(--bg-light); color:var(--text-main); }
                .fee-settings-tab.active { background:var(--primary-color); color:#fff; font-weight:700; box-shadow:0 2px 8px rgba(63,81,181,0.25); }
                .fee-settings-tab.active svg { color:#fff !important; }
                .fee-settings-tab-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .fee-settings-save-btn { display:flex; align-items:center; gap:7px; padding:9px 20px; border-radius:var(--border-radius-sm); border:none; background:var(--primary-color); color:#fff; font-weight:700; font-size:0.85rem; cursor:pointer; box-shadow:0 2px 8px rgba(63,81,181,0.25); transition:all var(--transition-fast); }
                .fee-settings-save-btn:hover:not(:disabled) { background:var(--primary-dark); }
                .fee-settings-save-btn:disabled { opacity:0.7; cursor:not-allowed; }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>

            <div style={{ padding: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, color: 'var(--text-main)', fontSize: '1.45rem' }}>Fee Module Settings</h2>
                        <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            Configure billing automation, arrears rules, payments and integrations
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color-light)', background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '0.83rem', cursor: 'pointer' }}
                            onClick={() => setLoading(true) || setTimeout(() => setLoading(false), 400)}
                        >
                            <RefreshCw size={15} />
                        </button>
                        <button className="fee-settings-save-btn" onClick={handleSave} disabled={saving}>
                            {saving
                                ? <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />
                                : <Save size={15} />
                            }
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* ── Layout ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>

                    {/* Sidebar */}
                    <div style={{
                        background: 'var(--card-bg)', borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color-light)', boxShadow: 'var(--shadow-sm)',
                        padding: '0.5rem', position: 'sticky', top: 90,
                    }}>
                        {TABS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                className={`fee-settings-tab${activeTab === id ? ' active' : ''}`}
                                onClick={() => changeTab(id)}
                            >
                                <span className="fee-settings-tab-icon" style={{ background: activeTab === id ? 'rgba(255,255,255,0.15)' : 'var(--bg-light)' }}>
                                    <Icon size={14} color={activeTab === id ? '#fff' : 'var(--primary-color)'} />
                                </span>
                                {label}
                            </button>
                        ))}

                        {/* Status indicator */}
                        <div style={{ margin: '10px 4px 4px', padding: '10px 10px', background: 'var(--bg-light)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            <CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: -1 }} color="#059669" />
                            Settings auto-saved on navigate
                        </div>
                    </div>

                    {/* Main content */}
                    <div>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, background: 'var(--card-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color-light)' }}>
                                <Loader2 size={28} color="var(--primary-color)" style={{ animation: 'spin 0.7s linear infinite' }} />
                            </div>
                        ) : (
                            <>
                                {/* ── AUTO BILLING ── */}
                                {activeTab === 'billing' && (
                                    <>
                                        <SectionCard title="Auto Billing Automation" icon={Zap} badge="Core">
                                            <SettingRow
                                                label="Enable Auto-Billing on Student Reporting"
                                                description="Automatically generate invoices when a student's status changes to 'Reported' for a new term."
                                            >
                                                <Toggle
                                                    id="auto-billing"
                                                    checked={billing.auto_billing_enabled}
                                                    onChange={v => setBilling(p => ({ ...p, auto_billing_enabled: v }))}
                                                />
                                            </SettingRow>
                                            <SettingRow label="Billing Mode" description="Choose which fee pipeline to use when auto-generating invoices.">
                                                <SelectField
                                                    value={billing.billing_mode}
                                                    onChange={v => setBilling(p => ({ ...p, billing_mode: v }))}
                                                    options={[
                                                        { value: 'STRUCTURE', label: 'Per-Grade Fee Structure (Legacy)' },
                                                        { value: 'TEMPLATE',  label: 'Grade-Band Fee Template (Modern)' },
                                                        { value: 'AUTO',      label: 'Auto (Template → Structure fallback)' },
                                                    ]}
                                                />
                                            </SettingRow>
                                            {billing.billing_mode === 'AUTO' && (
                                                <InfoBox type="info">
                                                    <strong>Auto Mode:</strong> The system first looks for a matching fee template for the student's grade band. If not found, it falls back to the per-grade fee structure.
                                                </InfoBox>
                                            )}
                                            {billing.billing_mode === 'TEMPLATE' && (
                                                <InfoBox type="success">
                                                    <strong>Grade-Band Template:</strong> Group grades into bands (e.g. "Lower Primary", "Junior Secondary") and assign one fee template per band. Set up bands and templates under <em>Fee Templates</em>.
                                                </InfoBox>
                                            )}
                                            {billing.billing_mode === 'STRUCTURE' && (
                                                <InfoBox type="warning">
                                                    <strong>Per-Grade Structure:</strong> Each grade has its own fee structure per term. Set up structures under <em>Fee Structures</em> before enabling auto-billing.
                                                </InfoBox>
                                            )}
                                        </SectionCard>

                                        <SectionCard title="Billing Configuration" icon={Settings2}>
                                            <SettingRow label="Pro-rated Billing" description="Allow billing of partial fees for students joining mid-term.">
                                                <Toggle
                                                    id="prorated"
                                                    checked={billing.prorated_billing}
                                                    onChange={v => setBilling(p => ({ ...p, prorated_billing: v }))}
                                                />
                                            </SettingRow>
                                            <SettingRow label="Grace Period (Billing Delay)" description="Days to wait after reporting before generating the invoice.">
                                                <SelectField
                                                    value={billing.default_billing_days}
                                                    onChange={v => setBilling(p => ({ ...p, default_billing_days: Number(v) }))}
                                                    options={[
                                                        { value: 0, label: 'Immediate' },
                                                        { value: 1, label: '24 Hours' },
                                                        { value: 3, label: '3 Days' },
                                                        { value: 7, label: '7 Days' },
                                                        { value: 14, label: '14 Days' },
                                                        { value: 30, label: '30 Days' },
                                                    ]}
                                                />
                                            </SettingRow>
                                            <SettingRow label="Re-billing Protocol" description="Action to take if a student changes class or intake after initial billing." last>
                                                <SelectField
                                                    value={billing.re_billing_protocol}
                                                    onChange={v => setBilling(p => ({ ...p, re_billing_protocol: v }))}
                                                    options={[
                                                        { value: 'void',   label: 'Void & Re-issue Invoice' },
                                                        { value: 'adjust', label: 'Create Adjustment Invoice' },
                                                        { value: 'manual', label: 'Flag for Manual Review' },
                                                    ]}
                                                />
                                            </SettingRow>
                                        </SectionCard>
                                    </>
                                )}

                                {/* ── FEE STRUCTURE ── */}
                                {activeTab === 'structure' && (
                                    <>
                                        <SectionCard title="Fee Structure Controls" icon={FileText}>
                                            <SettingRow label="Lock Approved Structures" description="Prevent modification of fee structures once approved by finance.">
                                                <Toggle checked={structure.lock_approved} onChange={v => setStructure(p => ({ ...p, lock_approved: v }))} />
                                            </SettingRow>
                                            <SettingRow label="Allow Mid-Term Changes" description="Enable editing of fee items during an active term. Requires Admin Override." last>
                                                <Toggle checked={structure.mid_term_changes} onChange={v => setStructure(p => ({ ...p, mid_term_changes: v }))} />
                                            </SettingRow>
                                        </SectionCard>

                                        <SectionCard title="Invoice Generation Rules" icon={FileText}>
                                            <div style={{ padding: '12px 0' }}>
                                                <div style={{ background: 'var(--bg-light)', borderRadius: 'var(--border-radius-sm)', padding: '0.85rem 1rem', border: '1px solid var(--border-color-light)', marginBottom: 14 }}>
                                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Invoice Number Format (System Managed)</div>
                                                    <code style={{ fontSize: '0.85rem', background: 'var(--card-bg)', padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-color-light)', color: 'var(--primary-color)', fontWeight: 700 }}>
                                                        INV-&#123;YEAR&#125;-T&#123;TERM&#125;-&#123;SEQUENCE&#125;
                                                    </code>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                                                        Example: <strong>INV-2026-T1-0042</strong> — Sequence resets per year/term combination.
                                                    </div>
                                                </div>
                                            </div>
                                            <SettingRow label="Amount Rounding Rule" description="How invoice amounts are rounded before being saved.">
                                                <SelectField
                                                    value={structure.rounding}
                                                    onChange={v => setStructure(p => ({ ...p, rounding: v }))}
                                                    options={[
                                                        { value: 'none',    label: 'No Rounding (Exact Amount)' },
                                                        { value: 'nearest', label: 'Round to nearest whole number' },
                                                        { value: 'up10',    label: 'Round up to nearest 10' },
                                                    ]}
                                                />
                                            </SettingRow>
                                            <SettingRow label="Duplicate Invoice Prevention" description="One active invoice per student per term is enforced by the system." last>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#ecfdf5', color: '#059669', borderRadius: 999, padding: '3px 10px', border: '1px solid #6ee7b7' }}>
                                                    ✓ System Enforced
                                                </span>
                                            </SettingRow>
                                        </SectionCard>

                                        <SectionCard title="Kenya School Billing Rules" icon={Info} accent="#059669">
                                            <div style={{ padding: '12px 0' }}>
                                                {[
                                                    'Schools run 3 terms per year (Term 1, Term 2, Term 3)',
                                                    'One invoice per student per term (unless previous is VOID)',
                                                    'Students must be enrolled before invoicing',
                                                    'CBC and 8-4-4 students may have different fee structures',
                                                ].map((rule, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < 3 ? 8 : 0 }}>
                                                        <CheckCircle2 size={15} color="#059669" style={{ marginTop: 1, flexShrink: 0 }} />
                                                        <span style={{ fontSize: '0.83rem', color: 'var(--text-main)' }}>{rule}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </>
                                )}

                                {/* ── ARREARS & PENALTIES ── */}
                                {activeTab === 'arrears' && (
                                    <>
                                        <SectionCard title="Arrears Thresholds" icon={AlertTriangle} accent="#d97706">
                                            <SettingRow label="Warning Threshold" description="Balance above which an account is flagged as 'In Arrears'.">
                                                <NumberInput prefix="KES" value={arrears.warning_threshold} onChange={v => setArrears(p => ({ ...p, warning_threshold: v }))} />
                                            </SettingRow>
                                            <SettingRow label="Critical Threshold (Blocked)" description="Balance above which services (exams, portal access) are restricted." last>
                                                <NumberInput prefix="KES" value={arrears.critical_threshold} onChange={v => setArrears(p => ({ ...p, critical_threshold: v }))} />
                                            </SettingRow>
                                        </SectionCard>

                                        <SectionCard title="Late Payment Penalties" icon={AlertTriangle} accent="#dc2626">
                                            <SettingRow label="Enable Late Payment Penalties" description="Automatically apply penalties to overdue balances after the grace period.">
                                                <Toggle checked={arrears.penalties_enabled} onChange={v => setArrears(p => ({ ...p, penalties_enabled: v }))} />
                                            </SettingRow>
                                            <SettingRow label="Penalty Type" description="How the penalty is calculated against the outstanding balance.">
                                                <SelectField
                                                    value={arrears.penalty_type}
                                                    onChange={v => setArrears(p => ({ ...p, penalty_type: v }))}
                                                    options={[
                                                        { value: 'percentage', label: 'Percentage of Outstanding Balance' },
                                                        { value: 'fixed',      label: 'Fixed Amount (Fee Item)' },
                                                    ]}
                                                />
                                            </SettingRow>
                                            <SettingRow label={arrears.penalty_type === 'percentage' ? 'Penalty Rate (%)' : 'Penalty Amount (KES)'} description="Applied once per period after grace period expires.">
                                                <NumberInput
                                                    prefix={arrears.penalty_type === 'percentage' ? '%' : 'KES'}
                                                    value={arrears.penalty_value}
                                                    onChange={v => setArrears(p => ({ ...p, penalty_value: v }))}
                                                />
                                            </SettingRow>
                                            <SettingRow label="Grace Period (Days)" description="Days after the invoice issue date before the penalty kicks in." last>
                                                <NumberInput value={arrears.grace_days} onChange={v => setArrears(p => ({ ...p, grace_days: v }))} />
                                            </SettingRow>
                                        </SectionCard>
                                    </>
                                )}

                                {/* ── PAYMENTS ── */}
                                {activeTab === 'payments' && (
                                    <>
                                        <SectionCard title="Active Payment Methods" icon={CreditCard}>
                                            <div style={{ padding: '14px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                {[
                                                    { key: 'cash',          label: 'Cash',          icon: '💵' },
                                                    { key: 'bank_check',    label: 'Bank Cheque',   icon: '🏦' },
                                                    { key: 'mpesa',         label: 'M-Pesa',        icon: '📱' },
                                                    { key: 'bank_transfer', label: 'Bank Transfer', icon: '⇄' },
                                                    { key: 'online_card',   label: 'Online Card',   icon: '💳' },
                                                ].map(({ key, label, icon }) => (
                                                    <PaymentMethodCard
                                                        key={key}
                                                        label={label}
                                                        icon={icon}
                                                        enabled={payments.methods[key] || false}
                                                        onChange={v => setPayments(p => ({ ...p, methods: { ...p.methods, [key]: v } }))}
                                                    />
                                                ))}
                                            </div>
                                        </SectionCard>

                                        <SectionCard title="Payment Allocation Rules" icon={CreditCard}>
                                            <SettingRow label="Auto-Allocation Priority" description="Determines how payments are distributed across outstanding invoices.">
                                                <SelectField
                                                    value={payments.allocation_priority}
                                                    onChange={v => setPayments(p => ({ ...p, allocation_priority: v }))}
                                                    options={[
                                                        { value: 'oldest_first',  label: 'Oldest outstanding arrears first' },
                                                        { value: 'current_first', label: 'Current term invoice first' },
                                                        { value: 'manual',        label: 'Manual allocation by cashier' },
                                                    ]}
                                                />
                                            </SettingRow>
                                            <SettingRow label="Allow Overpayments" description="Treat excess payment as credit balance carried forward to next invoice.">
                                                <Toggle checked={payments.allow_overpayments} onChange={v => setPayments(p => ({ ...p, allow_overpayments: v }))} />
                                            </SettingRow>
                                            <SettingRow label="Allow Partial Payments" description="Allow students to pay less than the full invoice amount." last>
                                                <Toggle checked={payments.allow_partial} onChange={v => setPayments(p => ({ ...p, allow_partial: v }))} />
                                            </SettingRow>
                                        </SectionCard>
                                    </>
                                )}

                                {/* ── NOTIFICATIONS ── */}
                                {activeTab === 'notifications' && (
                                    <>
                                        <SectionCard title="Email Notifications" icon={Bell}>
                                            <SettingRow label="Email on Invoice Generation" description="Send an email to the student/parent when a new invoice is created.">
                                                <Toggle checked={notifications.email_on_invoice} onChange={v => setNotifications(p => ({ ...p, email_on_invoice: v }))} />
                                            </SettingRow>
                                            <SettingRow label="Email on Payment Receipt" description="Notify the parent when a payment receipt is recorded." last>
                                                <Toggle checked={notifications.sms_on_payment} onChange={v => setNotifications(p => ({ ...p, sms_on_payment: v }))} />
                                            </SettingRow>
                                        </SectionCard>

                                        <SectionCard title="WhatsApp Business Notifications" icon={MessageSquare} accent="#25D366" badge="Integration Required">
                                            <InfoBox type="info">
                                                WhatsApp Business API integration is planned. Once connected, these settings will activate automatically.
                                            </InfoBox>
                                            <SettingRow label="WhatsApp on Invoice Generation" description="Send a WhatsApp message to parent when invoice is generated.">
                                                <Toggle checked={notifications.whatsapp_on_invoice} onChange={v => setNotifications(p => ({ ...p, whatsapp_on_invoice: v }))} />
                                            </SettingRow>
                                            <SettingRow label="WhatsApp Arrears Reminder" description="Automated WhatsApp reminders for students with overdue balances." last>
                                                <Toggle checked={notifications.whatsapp_on_arrears} onChange={v => setNotifications(p => ({ ...p, whatsapp_on_arrears: v }))} />
                                            </SettingRow>
                                        </SectionCard>

                                        <SectionCard title="Automated Reminders" icon={Bell}>
                                            <SettingRow label="Weekly Arrears Reminder" description="Send weekly reminders to parents of students with outstanding balances.">
                                                <Toggle checked={notifications.weekly_arrears_reminder} onChange={v => setNotifications(p => ({ ...p, weekly_arrears_reminder: v }))} />
                                            </SettingRow>
                                            <SettingRow label="Critical Arrears Alert" description="Immediate alert to the Bursar when a student crosses the critical threshold." last>
                                                <Toggle checked={notifications.critical_arrears_alert} onChange={v => setNotifications(p => ({ ...p, critical_arrears_alert: v }))} />
                                            </SettingRow>
                                        </SectionCard>
                                    </>
                                )}

                                {/* ── ACCESS & APPROVALS ── */}
                                {activeTab === 'access' && (
                                    <SectionCard title="Access Control & Workflow" icon={Shield}>
                                        <SettingRow label="Teachers Can View Fee Balances" description="Allow teaching staff to view a student's fee balance in their profile.">
                                            <Toggle checked={access.teachers_view_balances} onChange={v => setAccess(p => ({ ...p, teachers_view_balances: v }))} />
                                        </SettingRow>
                                        <SettingRow label="Principal Approval for Fee Waivers" description="Require Principal approval before any fee waiver or discount is applied.">
                                            <Toggle checked={access.principal_approve_waivers} onChange={v => setAccess(p => ({ ...p, principal_approve_waivers: v }))} />
                                        </SettingRow>
                                        <SettingRow label="Approval Required Above Amount" description="Any payment override or discount above this amount requires approval.">
                                            <NumberInput prefix="KES" value={access.require_approval_above} onChange={v => setAccess(p => ({ ...p, require_approval_above: v }))} />
                                        </SettingRow>
                                        <SettingRow label="Cashier Can Void Invoices" description="Allow cashiers to void invoices without Bursar/Principal approval." last>
                                            <Toggle checked={access.cashier_can_void} onChange={v => setAccess(p => ({ ...p, cashier_can_void: v }))} />
                                        </SettingRow>
                                    </SectionCard>
                                )}

                                {/* ── INTEGRATIONS ── */}
                                {activeTab === 'integrations' && (
                                    <SectionCard title="System Integrations" icon={LinkIcon}>
                                        {[
                                            { name: 'M-Pesa Auto-Reconciliation',    description: 'Automatic matching of M-Pesa payments to student invoices via Daraja API', status: 'connected' },
                                            { name: 'WhatsApp Business API',         description: 'Send fee statements, payment reminders and receipts via WhatsApp', status: 'disconnected' },
                                            { name: 'QuickBooks / Xero Sync',        description: 'Sync invoices and receipts to your accounting software automatically', status: 'disconnected' },
                                            { name: 'SMS Gateway (Africa\'s Talking)', description: 'Send SMS notifications and payment confirmations to parents', status: 'disconnected' },
                                            { name: 'National e-Citizen Integration',description: 'Kenya Revenue Authority & eCitizen payment gateway connectivity', status: 'disconnected' },
                                        ].map((int, i, arr) => (
                                            <IntegrationRow
                                                key={int.name}
                                                {...int}
                                                onConnect={() => toast.info(`${int.name} — Integration coming soon.`)}
                                            />
                                        ))}
                                        <div style={{ height: 6 }} />
                                    </SectionCard>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FeeSettingsDashboard;
