import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';

interface MpesaConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MpesaConfigModal: React.FC<MpesaConfigModalProps> = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState<any>({
        provider: 'daraja',
        environment: 'sandbox',
        shortcode: '',
        consumer_key: '',
        consumer_secret: '',
        passkey: '',
        is_active: false
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [configId, setConfigId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchConfig();
        }
    }, [isOpen]);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payments/gateway-configs/');
            const daraja = res.data.find((c: any) => c.provider === 'daraja');
            if (daraja) {
                setConfigId(daraja.id);
                setConfig({
                    provider: 'daraja',
                    environment: daraja.environment,
                    shortcode: daraja.shortcode || '',
                    consumer_key: daraja.consumer_key || '',
                    consumer_secret: daraja.consumer_secret || '',
                    passkey: daraja.passkey || '',
                    is_active: daraja.is_active
                });
            }
        } catch (error) {
            console.error('Failed to fetch config', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...config, id: configId };
            const res = await api.post('/payments/gateway-configs/save/', payload);
            if (res.data.success) {
                toast.success('M-Pesa configuration saved successfully!');
                onClose();
            } else {
                toast.error(res.data.error || 'Failed to save configuration');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ color: 'var(--text-main)', background: 'var(--card-bg)' }}>
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }}>
                    <div>
                        <h2 className="text-xl font-bold">M-Pesa Integration Config</h2>
                        <p className="text-sm opacity-70">Configure your Safaricom Daraja API credentials</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full transition-colors hover:bg-gray-200/50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary-color)' }} />
                        </div>
                    ) : (
                        <>
                            <div className="p-4 rounded-lg flex items-start gap-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                                <div className="text-sm">
                                    <p className="font-semibold mb-1">C2B Auto-Receipting</p>
                                    <p>Ensure you have created an app on the Safaricom Developer Portal and generated the Consumer Key and Secret. These credentials are required to validate and confirm M-Pesa payments in real-time.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-semibold">Environment</label>
                                    <select 
                                        value={config.environment}
                                        onChange={e => setConfig({...config, environment: e.target.value})}
                                        className="w-full p-2.5 rounded-lg outline-none"
                                        style={{ border: '1px solid var(--border-color-light)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                    >
                                        <option value="sandbox">Sandbox / Test</option>
                                        <option value="production">Production / Live</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold">Business Shortcode (Paybill)</label>
                                    <input 
                                        type="text" 
                                        value={config.shortcode}
                                        onChange={e => setConfig({...config, shortcode: e.target.value})}
                                        placeholder="e.g. 600000"
                                        className="w-full p-2.5 rounded-lg outline-none focus:ring-2"
                                        style={{ border: '1px solid var(--border-color-light)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold">Lipa Na M-Pesa Passkey</label>
                                    <input 
                                        type="password" 
                                        value={config.passkey}
                                        onChange={e => setConfig({...config, passkey: e.target.value})}
                                        placeholder="bfb279f9aa9..."
                                        className="w-full p-2.5 rounded-lg outline-none focus:ring-2"
                                        style={{ border: '1px solid var(--border-color-light)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-semibold">Consumer Key</label>
                                    <input 
                                        type="text" 
                                        value={config.consumer_key}
                                        onChange={e => setConfig({...config, consumer_key: e.target.value})}
                                        placeholder="Enter your consumer key"
                                        className="w-full p-2.5 rounded-lg outline-none focus:ring-2"
                                        style={{ border: '1px solid var(--border-color-light)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-sm font-semibold">Consumer Secret</label>
                                    <input 
                                        type="password" 
                                        value={config.consumer_secret}
                                        onChange={e => setConfig({...config, consumer_secret: e.target.value})}
                                        placeholder="Enter your consumer secret"
                                        className="w-full p-2.5 rounded-lg outline-none focus:ring-2"
                                        style={{ border: '1px solid var(--border-color-light)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                                    />
                                </div>

                                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                                    <input 
                                        type="checkbox" 
                                        id="isActive" 
                                        checked={config.is_active}
                                        onChange={e => setConfig({...config, is_active: e.target.checked})}
                                        className="w-5 h-5 rounded"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">
                                        Enable M-Pesa Integration
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-5 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }}>
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 font-semibold rounded-lg transition-colors"
                        style={{ border: '1px solid var(--border-color-light)', background: 'var(--card-bg)' }}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-5 py-2.5 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70"
                        style={{ background: 'var(--primary-color)' }}
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MpesaConfigModal;
