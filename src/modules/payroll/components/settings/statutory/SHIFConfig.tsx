import React, { useState, useEffect } from 'react';
import {
    Heart,
    Save,
    AlertCircle,
    AlertTriangle,
    Calendar,
    Info,
    ToggleLeft,
    ToggleRight,
    Check,
    X
} from 'lucide-react';
import { payrollService } from '../../../../../services/payrollService';

const SHIFConfig = ({ rates = [], onUpdate, showToast }) => {
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [activeSystem, setActiveSystem] = useState('shif'); // 'shif' or 'nhif'

    // Extract SHIF and NHIF from rates
    const shif = rates.find(r => r.rate_type === 'shif') || {
        rate_type: 'shif',
        name: 'Social Health Insurance Fund',
        employee_rate: 2.75,
        employer_rate: 0,
        lower_limit: null,
        upper_limit: null,
        max_contribution: null,
        is_enabled: true,
        effective_date: new Date().toISOString().split('T')[0]
    };

    const nhif = rates.find(r => r.rate_type === 'nhif') || {
        rate_type: 'nhif',
        name: 'National Hospital Insurance Fund (Legacy)',
        employee_rate: null,
        employer_rate: 0,
        fixed_amount: null,
        is_enabled: false,
        effective_date: null
    };

    const [formData, setFormData] = useState({
        shif: { ...shif },
        nhif: { ...nhif }
    });

    useEffect(() => {
        setFormData({
            shif: { ...shif },
            nhif: { ...nhif }
        });
        // Determine active system
        if (shif.is_enabled) {
            setActiveSystem('shif');
        } else if (nhif.is_enabled) {
            setActiveSystem('nhif');
        }
    }, [rates]);

    const handleToggleSystem = async (system) => {
        setSaving(true);
        try {
            // Disable other system first
            const otherSystem = system === 'shif' ? 'nhif' : 'shif';
            await payrollService.toggleStatutoryDeduction(otherSystem, false);
            await payrollService.toggleStatutoryDeduction(system, true);

            setActiveSystem(system);
            showToast(`${system.toUpperCase()} ${system === 'shif' ? '(SHA)' : ''} enabled`);
            onUpdate();
        } catch (error) {
            showToast('Failed to toggle health insurance', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDisableAll = async () => {
        setSaving(true);
        try {
            await payrollService.toggleStatutoryDeduction('shif', false);
            await payrollService.toggleStatutoryDeduction('nhif', false);
            setActiveSystem(null);
            showToast('Health insurance deductions disabled');
            onUpdate();
        } catch (error) {
            showToast('Failed to disable deductions', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const ratesData = [];

            if (activeSystem === 'shif') {
                ratesData.push({
                    rate_type: 'shif',
                    name: 'Social Health Insurance Fund',
                    employee_rate: parseFloat(formData.shif.employee_rate),
                    employer_rate: 0,
                    is_enabled: true,
                    effective_date: formData.shif.effective_date
                });
            }

            if (activeSystem === 'nhif') {
                // NHIF uses banded fixed amounts, but we store as reference
                ratesData.push({
                    rate_type: 'nhif',
                    name: 'National Hospital Insurance Fund',
                    is_enabled: true,
                    effective_date: formData.nhif.effective_date
                });
            }

            await payrollService.updateStatutoryRates(ratesData);
            showToast('Health insurance settings updated');
            setEditMode(false);
            onUpdate();
        } catch (error) {
            showToast('Failed to update settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    // NHIF Legacy Bands (for reference)
    const nhifBands = [
        { min: 0, max: 5999, amount: 150 },
        { min: 6000, max: 7999, amount: 300 },
        { min: 8000, max: 11999, amount: 400 },
        { min: 12000, max: 14999, amount: 500 },
        { min: 15000, max: 19999, amount: 600 },
        { min: 20000, max: 24999, amount: 750 },
        { min: 25000, max: 29999, amount: 850 },
        { min: 30000, max: 34999, amount: 900 },
        { min: 35000, max: 39999, amount: 950 },
        { min: 40000, max: 44999, amount: 1000 },
        { min: 45000, max: 49999, amount: 1100 },
        { min: 50000, max: 59999, amount: 1200 },
        { min: 60000, max: 69999, amount: 1300 },
        { min: 70000, max: 79999, amount: 1400 },
        { min: 80000, max: 89999, amount: 1500 },
        { min: 90000, max: 99999, amount: 1600 },
        { min: 100000, max: null, amount: 1700 }
    ];

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Heart size={20} />
                        </div>
                        Social Health Insurance (SHA/NHIF)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure health insurance deductions - SHIF (new) or NHIF (legacy)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {editMode ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                        >
                            Edit Settings
                        </button>
                    )}
                </div>
            </div>

            {/* SHIF Transition Notice */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertTriangle className="text-purple-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-purple-800">
                        <strong>SHA Transition (2024):</strong> Kenya is transitioning from NHIF to the
                        Social Health Authority (SHA) with the new Social Health Insurance Fund (SHIF).
                        SHIF is calculated as <strong>2.75% of gross salary</strong> with no cap.
                        Legacy NHIF bands remain available for historical calculations.
                    </div>
                </div>
            </div>

            {/* System Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SHIF Card */}
                <div
                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${activeSystem === 'shif'
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                    onClick={() => !saving && handleToggleSystem('shif')}
                >
                    {activeSystem === 'shif' && (
                        <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                <Check size={12} />
                                ACTIVE
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-purple-100 text-purple-600 rounded-lg">
                            <Heart size={22} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">SHIF (New System)</h4>
                            <p className="text-xs text-gray-500">Social Health Insurance Fund</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-purple-100">
                            <span className="text-sm text-gray-600">Calculation</span>
                            {editMode && activeSystem === 'shif' ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.shif.employee_rate}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            shif: { ...prev.shif, employee_rate: e.target.value }
                                        }))}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                </div>
                            ) : (
                                <span className="font-semibold text-purple-700">{formData.shif.employee_rate}% of Gross</span>
                            )}
                        </div>
                        <div className="flex justify-between py-2 border-b border-purple-100">
                            <span className="text-sm text-gray-600">Cap</span>
                            <span className="font-semibold text-gray-900">No Maximum</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-600">Employer Share</span>
                            <span className="font-semibold text-gray-900">None</span>
                        </div>
                    </div>

                    {editMode && activeSystem === 'shif' && (
                        <div className="mt-4 pt-3 border-t border-purple-200">
                            <label className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                    <Calendar size={14} />
                                    Effective From
                                </span>
                                <input
                                    type="date"
                                    value={formData.shif.effective_date}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        shif: { ...prev.shif, effective_date: e.target.value }
                                    }))}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* NHIF Card */}
                <div
                    className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${activeSystem === 'nhif'
                            ? 'border-gray-500 bg-gray-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                    onClick={() => !saving && handleToggleSystem('nhif')}
                >
                    {activeSystem === 'nhif' && (
                        <div className="absolute top-3 right-3">
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                                <Check size={12} />
                                ACTIVE
                            </span>
                        </div>
                    )}

                    <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">LEGACY</span>
                    </div>

                    <div className="flex items-center gap-3 mb-4 mt-4">
                        <div className="p-2.5 bg-gray-100 text-gray-600 rounded-lg">
                            <Heart size={22} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">NHIF (Legacy)</h4>
                            <p className="text-xs text-gray-500">National Hospital Insurance Fund</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Calculation</span>
                            <span className="font-semibold text-gray-700">Fixed Bands</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Range</span>
                            <span className="font-semibold text-gray-900">KES 150 - 1,700</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-600">17 Bands</span>
                            <span className="text-sm text-gray-500">Based on gross salary</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disable Option */}
            {activeSystem && (
                <div className="flex justify-end">
                    <button
                        onClick={handleDisableAll}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X size={16} />
                        Disable Health Insurance
                    </button>
                </div>
            )}

            {/* NHIF Bands Reference (shown when NHIF is active) */}
            {activeSystem === 'nhif' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="text-gray-600" size={16} />
                        <span className="font-semibold text-gray-700">NHIF Contribution Bands</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                        {nhifBands.map((band, index) => (
                            <div key={index} className="bg-white p-2 rounded-lg border border-gray-100 text-center">
                                <div className="text-xs text-gray-500">
                                    {band.max
                                        ? `${(band.min / 1000).toFixed(0)}k - ${(band.max / 1000).toFixed(0)}k`
                                        : `${(band.min / 1000).toFixed(0)}k+`
                                    }
                                </div>
                                <div className="font-bold text-gray-800 text-sm">{formatCurrency(band.amount)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calculation Example */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <Info className="text-purple-600 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-3">
                        <div className="text-sm text-purple-900">
                            <strong>Example Calculation</strong> (for KES 50,000 gross salary):
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-3 rounded-lg">
                                <div className="text-gray-500">SHIF (2.75%)</div>
                                <div className="font-bold text-purple-700">{formatCurrency(50000 * 0.0275)}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                                <div className="text-gray-500">NHIF (Band)</div>
                                <div className="font-bold text-gray-700">{formatCurrency(1200)}</div>
                            </div>
                        </div>
                        <p className="text-xs text-purple-700">
                            Under SHIF, higher earners pay more than under the old NHIF banded system.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SHIFConfig;
