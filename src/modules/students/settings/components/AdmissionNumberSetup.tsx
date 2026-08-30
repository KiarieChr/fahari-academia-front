import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import studentSettingsService from '../../../../services/studentSettingsService';
import ContentLoader from '../../../../components/common/ContentLoader';

const neoCardClass = 'bg-[#f8f9fa] rounded-3xl shadow-[6px_6px_16px_#e5e7eb,-6px_-6px_16px_#ffffff] border border-white p-6 space-y-6';
const inputClass = 'w-full px-4 py-3 bg-gray-50/80 rounded-xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white/40 focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:border-indigo-200 outline-none text-sm transition-all text-slate-700 placeholder-slate-400';
const labelClass = 'text-[13px] font-bold text-slate-600 block mb-2 tracking-wide ml-1';

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

    if (loading) return <div className="p-8 flex justify-center"><ContentLoader size="lg" message="Loading..." /></div>;
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
                <div className={neoCardClass}>
                    <h3 className="text-lg font-bold text-slate-800 drop-shadow-sm mb-6">Admission Configuration</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Admission Number Generation</label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-2xl flex-1 transition-all border border-white ${config.admission_format === 'auto' ? 'bg-[#f8f9fa] shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff]' : 'bg-gray-50/50 shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff]'}`}>
                                    <input
                                        type="radio"
                                        checked={config.admission_format === 'auto'}
                                        onChange={() => setConfig({ ...config, admission_format: 'auto' })}
                                        className="w-5 h-5 accent-indigo-600"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-slate-700">Automatic</span>
                                        <span className="block text-xs font-medium text-slate-500">System generates based on format</span>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-2xl flex-1 transition-all border border-white ${config.admission_format === 'manual' ? 'bg-[#f8f9fa] shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff]' : 'bg-gray-50/50 shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff]'}`}>
                                    <input
                                        type="radio"
                                        checked={config.admission_format === 'manual'}
                                        onChange={() => setConfig({ ...config, admission_format: 'manual' })}
                                        className="w-5 h-5 accent-indigo-600"
                                    />
                                    <div>
                                        <span className="block text-sm font-bold text-slate-700">Manual</span>
                                        <span className="block text-xs font-medium text-slate-500">Admins input numbers manually</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {config.admission_format === 'auto' && (
                            <>
                                <div>
                                    <label className={labelClass}>Admission Prefix</label>
                                    <input
                                        type="text"
                                        className={`${inputClass} uppercase`}
                                        value={config.prefix}
                                        onChange={e => setConfig({ ...config, prefix: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SCH"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Separator</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={config.separator || ''}
                                        onChange={e => setConfig({ ...config, separator: e.target.value })}
                                        placeholder="e.g. / or -"
                                        maxLength={5}
                                    />
                                </div>

                                <div className="md:col-span-2 border-t border-slate-200/50 pt-6 mt-2">
                                    <h4 className="text-sm font-extrabold text-slate-700 mb-5">Structure Settings</h4>

                                    <div className="flex items-center gap-4 mb-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={config.include_year}
                                                onChange={e => setConfig({ ...config, include_year: e.target.checked })}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]"></div>
                                            <span className="ml-3 text-sm font-bold text-slate-600">Include Year in Admission Number</span>
                                        </label>
                                    </div>

                                    {config.include_year && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <label className={labelClass}>Year Format</label>
                                                <select
                                                    className={inputClass + ' font-bold'}
                                                    value={config.year_format || 'YYYY'}
                                                    onChange={e => setConfig({ ...config, year_format: e.target.value })}
                                                >
                                                    <option value="YYYY">Full Year (e.g. 2026)</option>
                                                    <option value="YY">Last 2 Digits (e.g. 26)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Sequence Order</label>
                                                <select
                                                    className={inputClass + ' font-bold'}
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

                        <div className="md:col-span-2 border-t border-slate-200/50 pt-6">
                            <label className={labelClass}>Initial Status for New Admissions</label>
                            <input
                                type="text"
                                className={inputClass}
                                value={config.default_status}
                                onChange={e => setConfig({ ...config, default_status: e.target.value })}
                                placeholder="Active"
                            />
                        </div>

                        <div className="flex items-center gap-4 py-2 md:col-span-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={config.allow_mid_term}
                                    onChange={e => setConfig({ ...config, allow_mid_term: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)]"></div>
                                <span className="ml-3 text-sm font-bold text-slate-600">Allow Mid-term Admissions</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200/50 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-indigo-700 bg-[#f8f9fa] rounded-xl shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all border border-white"
                        >
                            <Save size={18} className="text-indigo-600" /> Save Settings
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

