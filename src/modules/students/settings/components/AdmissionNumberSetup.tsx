import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';

const AdmissionNumberSetup = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await studentSettingsService.getAdmissionConfig();
            setConfig(res.data || res);
        } catch (e) {
            toast.error("Failed to fetch admission config");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        try {
            await studentSettingsService.updateAdmissionConfig(config.id, config);
            toast.success('Admission settings updated');
        } catch (e) {
            toast.error("Failed to update admission settings");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!config) return <div>No configuration found.</div>;

    const getPreview = () => {
        if (config.admission_format !== 'auto') return 'MANUAL-INPUT';

        const year = new Date().getFullYear().toString();
        const yearStr = config.year_format === 'YY' ? year.slice(-2) : year;
        const serial = '0001';
        const sep = config.separator || '';
        const prefix = config.prefix || 'SCH';

        // Simulate logic
        if (!config.include_year) {
            // Fallback to Prefix-Serial if format was expecting year
            return `${prefix}${sep}${serial}`;
        }

        switch (config.sequence_format) {
            case 'P-Y-S': return `${prefix}${sep}${yearStr}${sep}${serial}`;
            case 'P-S-Y': return `${prefix}${sep}${serial}${sep}${yearStr}`;
            case 'Y-P-S': return `${yearStr}${sep}${prefix}${sep}${serial}`;
            case 'P-S': return `${prefix}${sep}${serial}`;
            default: return `${prefix}${sep}${yearStr}${sep}${serial}`;
        }
    };

    const preview = getPreview();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Admission Configuration</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Admission Number Generation</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        checked={config.admission_format === 'auto'}
                                        onChange={() => setConfig({ ...config, admission_format: 'auto' })}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium">Automatic</span>
                                        <span className="block text-xs text-gray-500">System generates based on format</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        checked={config.admission_format === 'manual'}
                                        onChange={() => setConfig({ ...config, admission_format: 'manual' })}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium">Manual</span>
                                        <span className="block text-xs text-gray-500">Admins input numbers manually</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {config.admission_format === 'auto' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Admission Prefix</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                                        value={config.prefix}
                                        onChange={e => setConfig({ ...config, prefix: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SCH"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Separator</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={config.separator || ''}
                                        onChange={e => setConfig({ ...config, separator: e.target.value })}
                                        placeholder="e.g. / or -"
                                        maxLength={5}
                                    />
                                </div>

                                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-4">Structure Settings</h4>

                                    <div className="flex items-center gap-4 mb-4">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={config.include_year}
                                                onChange={e => setConfig({ ...config, include_year: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">Include Year in Admission Number</span>
                                        </label>
                                    </div>

                                    {config.include_year && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Year Format</label>
                                                <select
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={config.year_format || 'YYYY'}
                                                    onChange={e => setConfig({ ...config, year_format: e.target.value })}
                                                >
                                                    <option value="YYYY">Full Year (e.g. 2026)</option>
                                                    <option value="YY">Last 2 Digits (e.g. 26)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Sequence Order</label>
                                                <select
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    value={config.sequence_format || 'P-Y-S'}
                                                    onChange={e => setConfig({ ...config, sequence_format: e.target.value })}
                                                >
                                                    <option value="P-Y-S">Prefix - Year - Serial</option>
                                                    <option value="P-S-Y">Prefix - Serial - Year</option>
                                                    <option value="Y-P-S">Year - Prefix - Serial</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="md:col-span-2 border-t border-gray-100 pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Initial Status for New Admissions</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={config.default_status}
                                onChange={e => setConfig({ ...config, default_status: e.target.value })}
                                placeholder="Active"
                            />
                        </div>

                        <div className="flex items-center gap-4 py-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.allow_mid_term}
                                    onChange={e => setConfig({ ...config, allow_mid_term: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Allow Mid-term Admissions</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="btn btn-primary px-5 py-2 fw-bold shadow-sm"
                        >
                            <Save size={18} /> Save Settings
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <RefreshCw size={16} />
                        <span className="text-sm font-medium uppercase tracking-wider">Format Preview</span>
                    </div>
                    <div className="text-3xl font-mono font-bold tracking-wider mt-2 bg-white/10 p-4 rounded-xl text-center border border-white/20 backdrop-blur-sm">
                        {preview}
                    </div>
                    <p className="text-indigo-100 text-xs mt-4 text-center">
                        This is a sample of how the first registration number will appear.
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3 text-yellow-800">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                        <p className="font-semibold mb-1">Impact Analysis</p>
                        <p className="opacity-90">Changing the prefix or sequence logic will only apply to future admissions. Past records will not be recalculated.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmissionNumberSetup;

