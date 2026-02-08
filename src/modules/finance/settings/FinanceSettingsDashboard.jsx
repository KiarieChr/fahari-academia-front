import React, { useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Settings, Wallet, CreditCard, FileText, Receipt, DollarSign, Briefcase, Bell, Calendar } from 'lucide-react';
import CashbookSettings from './components/CashbookSettings';
import FiscalPeriodSettings from './components/FiscalPeriodSettings';
import PaymentMethodSettings from './components/PaymentMethodSettings';
import DocumentNumberingSettings from './components/DocumentNumberingSettings';
import ReceiptFormatSettings from './components/ReceiptFormatSettings';
import OtherSettings from './components/OtherSettings';
import { financeService } from '../../../services/financeService';
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
                // Fallback to mock data if API fails (optional, but good for dev)
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
        { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert settings' }
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

                <div className="row g-4">
                    {/* Left Navigation */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                            <div className="card-body p-2">
                                <div className="settings-nav">
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                                            onClick={() => setActiveSection(section.id)}
                                        >
                                            <section.icon size={18} className="me-2" />
                                            <div className="flex-grow-1 text-start">
                                                <div className="fw-medium">{section.label}</div>
                                                <small className="text-muted">{section.description}</small>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="col-lg-9">
                        <div className="settings-content">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
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

