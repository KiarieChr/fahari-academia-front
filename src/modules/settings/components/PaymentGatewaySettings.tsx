import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import {
    CreditCard, MessageSquare, Save, Trash2, Plus, CheckCircle2,
    AlertCircle, Eye, EyeOff, Loader2, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';

// ─── Provider definitions ─────────────────────────────────────────────────────

const PROVIDERS = [
    {
        key: 'daraja',
        label: 'Safaricom Daraja (M-Pesa)',
        category: 'payment',
        icon: '📱',
        color: 'green',
        fields: [
            { name: 'consumer_key',           label: 'Consumer Key',              secret: true,  required: true },
            { name: 'consumer_secret',         label: 'Consumer Secret',           secret: true,  required: true },
            { name: 'shortcode',               label: 'Shortcode (Paybill / Till)', secret: false, required: true },
            { name: 'passkey',                 label: 'Lipa Na M-Pesa Passkey',    secret: true,  required: true },
            { name: 'callback_url',            label: 'STK Callback URL',          secret: false, placeholder: 'https://api.yourdomain.com/payments/mpesa/callback/' },
            { name: 'b2c_initiator_name',      label: 'B2C Initiator Name',        secret: false },
            { name: 'b2c_initiator_password',  label: 'B2C Initiator Password',    secret: true  },
            { name: 'b2c_result_url',          label: 'B2C Result URL',            secret: false },
            { name: 'b2c_queue_timeout_url',   label: 'B2C Queue Timeout URL',     secret: false },
        ],
    },
    {
        key: 'paystack',
        label: 'Paystack',
        category: 'payment',
        icon: '💳',
        color: 'blue',
        fields: [
            { name: 'public_key',  label: 'Public Key',  secret: false, required: true },
            { name: 'secret_key',  label: 'Secret Key',  secret: true,  required: true },
            { name: 'callback_url', label: 'Webhook URL (optional)', secret: false, placeholder: 'https://api.yourdomain.com/payments/paystack/webhook/' },
        ],
    },
    {
        key: 'africastalking',
        label: "Africa's Talking SMS",
        category: 'sms',
        icon: '📨',
        color: 'orange',
        fields: [
            { name: 'username',   label: 'Username',    secret: false, required: true },
            { name: 'api_key',    label: 'API Key',     secret: true,  required: true },
            { name: 'sender_id',  label: 'Sender ID',   secret: false, placeholder: 'e.g. SCHOOL' },
        ],
    },
    {
        key: 'twilio',
        label: 'Twilio SMS',
        category: 'sms',
        icon: '📞',
        color: 'red',
        fields: [
            { name: 'account_sid',  label: 'Account SID',   secret: false, required: true },
            { name: 'auth_token',   label: 'Auth Token',    secret: true,  required: true },
            { name: 'from_number',  label: 'From Number',   secret: false, required: true, placeholder: '+1234567890' },
        ],
    },
    {
        key: 'infobip',
        label: 'Infobip SMS',
        category: 'sms',
        icon: '🔔',
        color: 'purple',
        fields: [
            { name: 'api_key',    label: 'API Key',    secret: true,  required: true },
            { name: 'api_secret', label: 'Base URL',   secret: false, required: true, placeholder: 'https://xxxxx.api.infobip.com' },
            { name: 'sender_id',  label: 'Sender ID',  secret: false, placeholder: 'InfoSMS' },
        ],
    },
];

const colorMap = {
    green:  { badge: 'bg-green-100 text-green-700',  icon: 'bg-green-50 text-green-600',  ring: 'ring-green-200'  },
    blue:   { badge: 'bg-blue-100 text-blue-700',    icon: 'bg-blue-50 text-blue-600',    ring: 'ring-blue-200'   },
    orange: { badge: 'bg-orange-100 text-orange-700', icon: 'bg-orange-50 text-orange-600', ring: 'ring-orange-200' },
    red:    { badge: 'bg-red-100 text-red-700',      icon: 'bg-red-50 text-red-600',      ring: 'ring-red-200'    },
    purple: { badge: 'bg-purple-100 text-purple-700', icon: 'bg-purple-50 text-purple-600', ring: 'ring-purple-200' },
};

// ─── Single provider card ─────────────────────────────────────────────────────

function ProviderCard({ provider, config, onSave, onDelete }) {
    const [expanded, setExpanded]   = useState(false);
    const [form, setForm]           = useState({});
    const [revealed, setRevealed]   = useState({});
    const [saving, setSaving]       = useState(false);
    const [deleting, setDeleting]   = useState(false);

    // Populate form from existing config
    useEffect(() => {
        if (config) {
            const initial = { environment: 'sandbox', ...config };
            setForm(initial);
        } else {
            setForm({ environment: 'sandbox', is_active: false });
        }
    }, [config]);

    const set = (name, value) => setForm(f => ({ ...f, [name]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ ...form, provider: provider.key });
            toast.success(`${provider.label} settings saved`);
        } catch {
            toast.error('Failed to save — check the values and try again');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!config?.id) return;
        setDeleting(true);
        try {
            await onDelete(config.id);
            toast.success(`${provider.label} config removed`);
        } catch {
            toast.error('Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const colors  = colorMap[provider.color];
    const isSetup = !!config;

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md`}>
            {/* Card header */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/60 transition-colors"
            >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colors.icon}`}>
                    {provider.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 text-sm">{provider.label}</span>
                        {isSetup && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                                <CheckCircle2 size={11} /> Configured
                            </span>
                        )}
                        {isSetup && config.is_active && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                Active
                            </span>
                        )}
                        {isSetup && config.environment === 'production' && (
                            <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                Live
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {provider.category === 'payment' ? 'Payment Gateway' : 'SMS Provider'}
                        {isSetup && ` · Last updated ${new Date(config.updated_at || config.created_at).toLocaleDateString()}`}
                    </p>
                </div>
                {expanded ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
            </button>

            {/* Expanded form */}
            {expanded && (
                <div className="px-5 pb-5 pt-1 border-t border-gray-100 space-y-4">
                    {/* Environment + Active row */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-3">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Environment</label>
                            <select
                                value={form.environment || 'sandbox'}
                                onChange={e => set('environment', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            >
                                <option value="sandbox">Sandbox / Test</option>
                                <option value="production">Production / Live</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-3 pb-0.5">
                            <label className="relative inline-flex items-center cursor-pointer gap-2">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={!!form.is_active}
                                    onChange={e => set('is_active', e.target.checked)}
                                />
                                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-indigo-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                        </div>
                    </div>

                    {/* Label */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Friendly Label <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input
                            type="text"
                            value={form.label || ''}
                            onChange={e => set('label', e.target.value)}
                            placeholder={`e.g. ${provider.label} - School Account`}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                    </div>

                    {/* Provider-specific fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {provider.fields.map(field => (
                            <div key={field.name}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                                    {field.label}
                                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type={field.secret && !revealed[field.name] ? 'password' : 'text'}
                                        value={form[field.name] || ''}
                                        onChange={e => set(field.name, e.target.value)}
                                        placeholder={field.placeholder || ''}
                                        autoComplete="off"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-9"
                                    />
                                    {field.secret && (
                                        <button
                                            type="button"
                                            onClick={() => setRevealed(r => ({ ...r, [field.name]: !r[field.name] }))}
                                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                                        >
                                            {revealed[field.name] ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Production warning */}
                    {form.environment === 'production' && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-700">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            <span>Production credentials will process <strong>real transactions</strong>. Ensure you have tested in sandbox first.</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                        {isSetup && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                            >
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PaymentGatewaySettings() {
    const [configs, setConfigs]   = useState([]);   // [{id, provider, ...}]
    const [loading, setLoading]   = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api('/payments/gateway-configs/', { method: 'GET' });
            setConfigs(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load gateway configurations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (formData) => {
        const data = await api('/payments/gateway-configs/save/', {
            method: 'POST',
            body: JSON.stringify(formData),
        });
        // Refresh list so badges / timestamps update
        await load();
        return data;
    };

    const handleDelete = async (id) => {
        await api(`/payments/gateway-configs/${id}/delete/`, { method: 'DELETE' });
        await load();
    };

    const getConfig = (providerKey) => configs.find(c => c.provider === providerKey) || null;

    const paymentProviders = PROVIDERS.filter(p => p.category === 'payment');
    const smsProviders     = PROVIDERS.filter(p => p.category === 'sms');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 gap-2">
                <Loader2 size={20} className="animate-spin" /> Loading configurations…
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard size={18} className="text-indigo-500" /> Payment &amp; SMS Integrations
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        API credentials are stored securely in the database and never exposed in source code or environment files.
                    </p>
                </div>
                <button
                    onClick={load}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Payment gateways */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={15} className="text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Gateways</h3>
                </div>
                <div className="space-y-3">
                    {paymentProviders.map(p => (
                        <ProviderCard
                            key={p.key}
                            provider={p}
                            config={getConfig(p.key)}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </section>

            {/* SMS providers */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={15} className="text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SMS Providers</h3>
                </div>
                <div className="space-y-3">
                    {smsProviders.map(p => (
                        <ProviderCard
                            key={p.key}
                            provider={p}
                            config={getConfig(p.key)}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
