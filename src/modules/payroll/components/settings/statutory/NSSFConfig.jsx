import React, { useState, useEffect } from 'react';
import {
    Shield,
    Save,
    AlertCircle,
    Calendar,
    Info,
    ToggleLeft,
    ToggleRight,
    Users,
    Building2
} from 'lucide-react';
import { payrollService } from '../../../../../services/payrollService';

const NSSFConfig = ({ rates = [], onUpdate, showToast }) => {
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Extract Tier I and Tier II from rates
    const tier1 = rates.find(r => r.rate_type === 'nssf_tier1') || {
        rate_type: 'nssf_tier1',
        name: 'NSSF Tier I',
        employee_rate: 6,
        employer_rate: 6,
        lower_limit: 0,
        upper_limit: 7000,
        max_contribution: 420,
        is_enabled: true,
        effective_date: new Date().toISOString().split('T')[0]
    };

    const tier2 = rates.find(r => r.rate_type === 'nssf_tier2') || {
        rate_type: 'nssf_tier2',
        name: 'NSSF Tier II',
        employee_rate: 6,
        employer_rate: 6,
        lower_limit: 7000,
        upper_limit: 36000,
        max_contribution: 1740,
        is_enabled: true,
        effective_date: new Date().toISOString().split('T')[0]
    };

    const [formData, setFormData] = useState({
        tier1: { ...tier1 },
        tier2: { ...tier2 },
        isEnabled: tier1.is_enabled ?? true
    });

    useEffect(() => {
        setFormData({
            tier1: { ...tier1 },
            tier2: { ...tier2 },
            isEnabled: tier1.is_enabled ?? true
        });
    }, [rates]);

    const handleToggleEnabled = async () => {
        setSaving(true);
        try {
            await payrollService.toggleStatutoryDeduction('nssf_tier1', !formData.isEnabled);
            await payrollService.toggleStatutoryDeduction('nssf_tier2', !formData.isEnabled);
            setFormData(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
            showToast(`NSSF ${!formData.isEnabled ? 'enabled' : 'disabled'}`);
            onUpdate();
        } catch (error) {
            showToast('Failed to toggle NSSF', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await payrollService.updateStatutoryRates([
                {
                    rate_type: 'nssf_tier1',
                    name: formData.tier1.name || 'NSSF Tier I',
                    employee_rate: parseFloat(formData.tier1.employee_rate),
                    employer_rate: parseFloat(formData.tier1.employer_rate),
                    lower_limit: parseFloat(formData.tier1.lower_limit),
                    upper_limit: parseFloat(formData.tier1.upper_limit),
                    max_contribution: parseFloat(formData.tier1.max_contribution),
                    is_enabled: formData.isEnabled,
                    effective_date: formData.tier1.effective_date
                },
                {
                    rate_type: 'nssf_tier2',
                    name: formData.tier2.name || 'NSSF Tier II',
                    employee_rate: parseFloat(formData.tier2.employee_rate),
                    employer_rate: parseFloat(formData.tier2.employer_rate),
                    lower_limit: parseFloat(formData.tier2.lower_limit),
                    upper_limit: parseFloat(formData.tier2.upper_limit),
                    max_contribution: parseFloat(formData.tier2.max_contribution),
                    is_enabled: formData.isEnabled,
                    effective_date: formData.tier2.effective_date
                }
            ]);
            showToast('NSSF rates updated successfully');
            setEditMode(false);
            onUpdate();
        } catch (error) {
            showToast('Failed to update NSSF rates', 'error');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'KES 0';
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    const TierCard = ({ tier, tierKey, label, color }) => {
        const data = formData[tierKey];

        return (
            <div className={`bg-white p-6 rounded-xl border-2 ${formData.isEnabled ? `border-${color}-200 shadow-sm` : 'border-gray-200 opacity-60'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 bg-${color}-50 text-${color}-600 rounded-lg`}>
                            <Shield size={22} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{label}</h4>
                            <p className="text-xs text-gray-500">
                                {formatCurrency(data.lower_limit)} - {formatCurrency(data.upper_limit)}
                            </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${formData.isEnabled
                            ? `bg-${color}-100 text-${color}-800`
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {formData.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                </div>

                {/* Rate Display / Edit */}
                <div className="space-y-4">
                    {/* Employee Rate */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Users size={16} />
                            <span className="text-sm">Employee Contribution</span>
                        </div>
                        {editMode ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.employee_rate}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        [tierKey]: { ...prev[tierKey], employee_rate: e.target.value }
                                    }))}
                                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
                                />
                                <span className="text-gray-500">%</span>
                            </div>
                        ) : (
                            <span className="font-semibold text-gray-900">{data.employee_rate}%</span>
                        )}
                    </div>

                    {/* Employer Rate */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Building2 size={16} />
                            <span className="text-sm">Employer Contribution</span>
                        </div>
                        {editMode ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.employer_rate}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        [tierKey]: { ...prev[tierKey], employer_rate: e.target.value }
                                    }))}
                                    className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
                                />
                                <span className="text-gray-500">%</span>
                            </div>
                        ) : (
                            <span className="font-semibold text-gray-900">{data.employer_rate}%</span>
                        )}
                    </div>

                    {/* Upper Limit */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Upper Pensionable Limit</span>
                        {editMode ? (
                            <input
                                type="number"
                                value={data.upper_limit}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    [tierKey]: { ...prev[tierKey], upper_limit: e.target.value }
                                }))}
                                className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
                            />
                        ) : (
                            <span className="font-semibold text-gray-900">{formatCurrency(data.upper_limit)}</span>
                        )}
                    </div>

                    {/* Max Contribution */}
                    <div className="flex items-center justify-between py-3">
                        <span className="text-sm text-gray-600">Maximum Contribution</span>
                        {editMode ? (
                            <input
                                type="number"
                                value={data.max_contribution}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    [tierKey]: { ...prev[tierKey], max_contribution: e.target.value }
                                }))}
                                className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
                            />
                        ) : (
                            <span className={`font-bold text-${color}-600`}>{formatCurrency(data.max_contribution)}</span>
                        )}
                    </div>
                </div>

                {/* Effective Date (edit mode only) */}
                {editMode && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                Effective From
                            </span>
                            <input
                                type="date"
                                value={data.effective_date}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    [tierKey]: { ...prev[tierKey], effective_date: e.target.value }
                                }))}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                            />
                        </label>
                    </div>
                )}
            </div>
        );
    };

    // Calculate total contributions example
    const exampleSalary = 50000;
    const tier1Contribution = Math.min(formData.tier1.upper_limit * (formData.tier1.employee_rate / 100), formData.tier1.max_contribution);
    const tier2Contribution = exampleSalary > formData.tier1.upper_limit
        ? Math.min((Math.min(exampleSalary, formData.tier2.upper_limit) - formData.tier1.upper_limit) * (formData.tier2.employee_rate / 100), formData.tier2.max_contribution)
        : 0;
    const totalContribution = tier1Contribution + tier2Contribution;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <Shield size={20} />
                        </div>
                        National Social Security Fund (NSSF)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure NSSF Tier I and Tier II contribution rates and limits
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Enable/Disable Toggle */}
                    <button
                        onClick={handleToggleEnabled}
                        disabled={saving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${formData.isEnabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {formData.isEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        {formData.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>

                    {/* Edit / Save Button */}
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
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                        >
                            Edit Rates
                        </button>
                    )}
                </div>
            </div>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TierCard tier={tier1} tierKey="tier1" label="Tier I (Lower Earnings)" color="orange" />
                <TierCard tier={tier2} tierKey="tier2" label="Tier II (Upper Earnings)" color="amber" />
            </div>

            {/* Calculation Example */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <Info className="text-orange-600 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-3">
                        <div className="text-sm text-orange-900">
                            <strong>Example Calculation</strong> (for KES {exampleSalary.toLocaleString()} gross salary):
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-white p-3 rounded-lg">
                                <div className="text-gray-500">Tier I</div>
                                <div className="font-bold text-orange-700">{formatCurrency(tier1Contribution)}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                                <div className="text-gray-500">Tier II</div>
                                <div className="font-bold text-amber-700">{formatCurrency(tier2Contribution)}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border-2 border-orange-300">
                                <div className="text-gray-500">Total Employee</div>
                                <div className="font-bold text-orange-800">{formatCurrency(totalContribution)}</div>
                            </div>
                        </div>
                        <p className="text-xs text-orange-700">
                            Employer matches with equal contribution of {formatCurrency(totalContribution)}.
                            Total remitted: {formatCurrency(totalContribution * 2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-800">
                        <strong>NSSF Act 2013:</strong> Contributions are mandatory for all employees.
                        Tier I covers pensionable earnings up to KES 7,000 (Lower Earnings Limit).
                        Tier II covers earnings between KES 7,000 and KES 36,000 (Upper Earnings Limit).
                        Both employee and employer contribute at 6% of pensionable pay for each tier.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NSSFConfig;
