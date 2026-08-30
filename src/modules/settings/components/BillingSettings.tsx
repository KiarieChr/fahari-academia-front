import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemSubscription {
    id?: number;
    package_name: string;
    monthly_fee: string;
    ai_markup_percentage: string;
    ap_account: number | null;
}

interface SMSPricingBand {
    id: number;
    name: string;
    max_sms: number;
    fixed_price: string;
}

const BillingSettings: React.FC = () => {
    const [subscription, setSubscription] = useState<SystemSubscription>({
        package_name: '',
        monthly_fee: '0.00',
        ai_markup_percentage: '0.00',
        ap_account: null
    });
    const [smsBands, setSmsBands] = useState<SMSPricingBand[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // SMS Band Modal State
    const [isBandModalOpen, setIsBandModalOpen] = useState(false);
    const [editingBand, setEditingBand] = useState<SMSPricingBand | null>(null);
    const [bandForm, setBandForm] = useState({ name: '', max_sms: 0, fixed_price: '0.00' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            };

            const [subRes, bandsRes] = await Promise.all([
                fetch('/api/system-subscription/', { headers }),
                fetch('/api/sms-pricing-bands/', { headers })
            ]);

            if (subRes.ok) {
                const subData = await subRes.json();
                setSubscription(subData);
            }
            if (bandsRes.ok) {
                const bandsData = await bandsRes.json();
                // Depending on DRF pagination, it might be in .results
                setSmsBands(bandsData.results || bandsData);
            }
        } catch (error) {
            console.error('Error fetching billing settings:', error);
            toast.error('Failed to load billing configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSubscription = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/system-subscription/update/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                toast.success('Subscription settings updated');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to save subscription settings');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBand = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = editingBand 
                ? `/api/sms-pricing-bands/${editingBand.id}/` 
                : '/api/sms-pricing-bands/';
            const method = editingBand ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bandForm)
            });

            if (response.ok) {
                toast.success(`SMS Pricing Band ${editingBand ? 'updated' : 'added'}`);
                setIsBandModalOpen(false);
                fetchData();
            } else {
                throw new Error('Failed to save band');
            }
        } catch (error) {
            toast.error('Failed to save SMS pricing band');
        }
    };

    const handleDeleteBand = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this pricing band?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/sms-pricing-bands/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                toast.success('SMS Pricing Band deleted');
                fetchData();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            toast.error('Failed to delete SMS pricing band');
        }
    };

    const openBandModal = (band?: SMSPricingBand) => {
        if (band) {
            setEditingBand(band);
            setBandForm({ name: band.name, max_sms: band.max_sms, fixed_price: band.fixed_price });
        } else {
            setEditingBand(null);
            setBandForm({ name: '', max_sms: 1000, fixed_price: '0.00' });
        }
        setIsBandModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Base Subscription Settings */}
            <div>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Base System Subscription</h3>
                    <p className="text-sm text-gray-500">Configure the tenant's base package and AI markup.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                        <input
                            type="text"
                            value={subscription.package_name}
                            onChange={(e) => setSubscription({...subscription, package_name: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (KES)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={subscription.monthly_fee}
                            onChange={(e) => setSubscription({...subscription, monthly_fee: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AI Markup Percentage (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={subscription.ai_markup_percentage}
                            onChange={(e) => setSubscription({...subscription, ai_markup_percentage: e.target.value})}
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AP Account ID (Optional)</label>
                        <input
                            type="number"
                            value={subscription.ap_account || ''}
                            onChange={(e) => setSubscription({...subscription, ap_account: e.target.value ? parseInt(e.target.value) : null})}
                            placeholder="e.g. 15"
                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSaveSubscription}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Settings
                    </button>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* SMS Pricing Bands */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">SMS Pricing Bands</h3>
                        <p className="text-sm text-gray-500">Manage tiered pricing for SMS usage.</p>
                    </div>
                    <button
                        onClick={() => openBandModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Add Band
                    </button>
                </div>

                {smsBands.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-sm font-medium text-gray-900">No pricing bands</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new SMS pricing band.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                                    <th className="p-4 font-semibold">Band Name</th>
                                    <th className="p-4 font-semibold">Max SMS Limit</th>
                                    <th className="p-4 font-semibold">Fixed Price (KES)</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {smsBands.map((band) => (
                                    <tr key={band.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{band.name}</td>
                                        <td className="p-4 text-gray-600">Up to {band.max_sms}</td>
                                        <td className="p-4 text-gray-600">{band.fixed_price}</td>
                                        <td className="p-4 flex justify-end gap-2">
                                            <button 
                                                onClick={() => openBandModal(band)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteBand(band.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isBandModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingBand ? 'Edit Pricing Band' : 'New Pricing Band'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Band Name</label>
                                <input
                                    type="text"
                                    value={bandForm.name}
                                    onChange={(e) => setBandForm({...bandForm, name: e.target.value})}
                                    placeholder="e.g. Tier 1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max SMS Count</label>
                                <input
                                    type="number"
                                    value={bandForm.max_sms}
                                    onChange={(e) => setBandForm({...bandForm, max_sms: parseInt(e.target.value)})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Price (KES)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={bandForm.fixed_price}
                                    onChange={(e) => setBandForm({...bandForm, fixed_price: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                onClick={() => setIsBandModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveBand}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Save Band
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingSettings;
