import React, { useState, useEffect, useCallback } from 'react';
import {
    DollarSign, Save, Loader2, Check, Plus, Trash2, Star, Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../services/api';

const COMMON_CURRENCIES = [
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
    { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF', flag: '🇷🇼' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
];

const CurrencySettings = () => {
    const [defaultCurrency, setDefaultCurrency] = useState('KES');
    const [enabledCurrencies, setEnabledCurrencies] = useState(['KES']);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            // Try to load from finance settings
            const data = await api.get('/finance/api/settings/');
            const settings = Array.isArray(data) ? data[0] : (data.results?.[0] || data);
            if (settings) {
                setDefaultCurrency(settings.currency_code || 'KES');
                setEnabledCurrencies(settings.enabled_currencies || [settings.currency_code || 'KES']);
            }
        } catch {
            // Fallback - just use defaults
            setDefaultCurrency('KES');
            setEnabledCurrencies(['KES']);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const handleSetDefault = (code) => {
        setDefaultCurrency(code);
        if (!enabledCurrencies.includes(code)) {
            setEnabledCurrencies(prev => [...prev, code]);
        }
        setHasChanges(true);
    };

    const toggleCurrency = (code) => {
        if (code === defaultCurrency) {
            toast.error('Cannot disable the default currency');
            return;
        }
        setEnabledCurrencies(prev =>
            prev.includes(code)
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/finance/api/settings/1/', {
                currency_code: defaultCurrency,
                enabled_currencies: enabledCurrencies,
            });
            toast.success('Currency settings saved');
            setHasChanges(false);
        } catch {
            // Try creating if doesn't exist
            try {
                await api.post('/finance/api/settings/', {
                    currency_code: defaultCurrency,
                    enabled_currencies: enabledCurrencies,
                });
                toast.success('Currency settings saved');
                setHasChanges(false);
            } catch (err) {
                toast.error('Failed to save currency settings');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
            </div>
        );
    }

    const defaultCurrencyInfo = COMMON_CURRENCIES.find(c => c.code === defaultCurrency);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign size={20} className="text-indigo-500" /> Currency Settings
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Configure default and enabled currencies for the system.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${hasChanges
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Default Currency Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/60 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Star size={16} className="text-indigo-600" />
                    <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Default Currency</h3>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-4xl">{defaultCurrencyInfo?.flag || '💱'}</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{defaultCurrency}</p>
                        <p className="text-sm text-gray-500">{defaultCurrencyInfo?.name || 'Unknown Currency'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Symbol: {defaultCurrencyInfo?.symbol || defaultCurrency}</p>
                    </div>
                </div>
            </div>

            {/* Currency List */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe size={16} className="text-gray-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Available Currencies</h3>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        {enabledCurrencies.length} enabled
                    </span>
                </div>
                <div className="divide-y divide-gray-50">
                    {COMMON_CURRENCIES.map(currency => {
                        const isEnabled = enabledCurrencies.includes(currency.code);
                        const isDefault = defaultCurrency === currency.code;
                        return (
                            <div
                                key={currency.code}
                                className={`flex items-center justify-between px-5 py-3.5 transition-colors ${isEnabled ? 'bg-white' : 'bg-gray-50/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{currency.flag}</span>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">{currency.code}</span>
                                            {isDefault && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-semibold uppercase">
                                                    <Star size={9} /> Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">{currency.name} ({currency.symbol})</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isDefault && isEnabled && (
                                        <button
                                            onClick={() => handleSetDefault(currency.code)}
                                            className="px-2.5 py-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
                                        >
                                            Set Default
                                        </button>
                                    )}
                                    <button
                                        onClick={() => toggleCurrency(currency.code)}
                                        className="relative"
                                    >
                                        <div className={`w-10 h-5.5 rounded-full transition-colors ${isEnabled ? 'bg-indigo-600' : 'bg-gray-200'} ${isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${isEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CurrencySettings;
