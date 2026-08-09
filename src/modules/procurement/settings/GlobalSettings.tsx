
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { procurementSettingsService } from '../../../services/procurementSettingsService';
import { toast } from 'react-toastify';

const GlobalSettings = () => {
    const [formData, setFormData] = useState({
        financialYear: '',
        currency: '',
        taxEnabled: false,
        taxRate: 0,
        allowNegativeStock: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await procurementSettingsService.getSettings();
            setFormData(settings.general);
        } catch (error) {
            toast.error("Failed to load settings");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await procurementSettingsService.updateSettings('general', formData);
            toast.success("General settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-3xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">General Configuration</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
                        <select
                            name="financialYear"
                            value={formData.financialYear}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Base Currency</label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="KES">KES (Kenyan Shilling)</option>
                            <option value="USD">USD (US Dollar)</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                    <input
                        type="checkbox"
                        name="taxEnabled"
                        checked={formData.taxEnabled}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-800">Enable Tax Calculation</label>
                        <p className="text-xs text-gray-500">Apply VAT to procurement items by default.</p>
                    </div>
                    {formData.taxEnabled && (
                        <div className="w-24">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Rate (%)</label>
                            <input
                                type="number"
                                name="taxRate"
                                value={formData.taxRate}
                                onChange={handleChange}
                                className="w-full p-1 border rounded text-sm"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                    <input
                        type="checkbox"
                        name="allowNegativeStock"
                        checked={formData.allowNegativeStock}
                        onChange={handleChange}
                        className="w-4 h-4 text-red-600 rounded"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-800">Allow Negative Stock</label>
                        <p className="text-xs text-gray-500">Permit issuing items even if system stock is zero (Not Recommended).</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GlobalSettings;

