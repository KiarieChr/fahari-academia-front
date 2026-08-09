import React, { useState, useEffect } from 'react';
import {
    Home,
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

const HousingLevyConfig = ({ rates = [], onUpdate, showToast }) => {
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Extract Housing Levy from rates
    const housingLevy = rates.find(r => r.rate_type === 'housing_levy') || {
        rate_type: 'housing_levy',
        name: 'Affordable Housing Levy',
        employee_rate: 1.5,
        employer_rate: 1.5,
        lower_limit: null,
        upper_limit: null,
        max_contribution: null,
        is_enabled: true,
        effective_date: new Date().toISOString().split('T')[0]
    };

    const [formData, setFormData] = useState({
        ...housingLevy,
        isEnabled: housingLevy.is_enabled ?? true
    });

    useEffect(() => {
        setFormData({
            ...housingLevy,
            isEnabled: housingLevy.is_enabled ?? true
        });
    }, [rates]);

    const handleToggleEnabled = async () => {
        setSaving(true);
        try {
            await payrollService.toggleStatutoryDeduction('housing_levy', !formData.isEnabled);
            setFormData(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
            showToast(`Housing Levy ${!formData.isEnabled ? 'enabled' : 'disabled'}`);
            onUpdate();
        } catch (error) {
            showToast('Failed to toggle Housing Levy', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await payrollService.updateStatutoryRates([{
                rate_type: 'housing_levy',
                name: 'Affordable Housing Levy',
                employee_rate: parseFloat(formData.employee_rate),
                employer_rate: parseFloat(formData.employer_rate),
                is_enabled: formData.isEnabled,
                effective_date: formData.effective_date
            }]);
            showToast('Housing Levy settings updated successfully');
            setEditMode(false);
            onUpdate();
        } catch (error) {
            showToast('Failed to update Housing Levy', 'error');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    // Calculate example
    const exampleSalary = 50000;
    const employeeContribution = exampleSalary * (formData.employee_rate / 100);
    const employerContribution = exampleSalary * (formData.employer_rate / 100);
    const totalContribution = employeeContribution + employerContribution;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                            <Home size={20} />
                        </div>
                        Affordable Housing Levy (AHL)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure the Affordable Housing Levy contribution rates
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
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                            >
                                <Save size={16} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700"
                        >
                            Edit Rates
                        </button>
                    )}
                </div>
            </div>

            {/* Main Configuration Card */}
            <div className={`bg-white p-6 rounded-xl border-2 ${formData.isEnabled ? 'border-teal-200 shadow-sm' : 'border-gray-200 opacity-60'
                }`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                            <Home size={28} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">Housing Levy Configuration</h4>
                            <p className="text-sm text-gray-500">
                                Percentage of gross salary
                            </p>
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 text-sm font-semibold rounded-full ${formData.isEnabled
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {formData.isEnabled ? 'Active' : 'Disabled'}
                    </span>
                </div>

                {/* Rate Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee Contribution */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="text-teal-600" size={20} />
                            <span className="font-semibold text-gray-800">Employee Contribution</span>
                        </div>

                        {editMode ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.employee_rate}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            employee_rate: e.target.value
                                        }))}
                                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-lg font-bold text-center"
                                    />
                                    <span className="text-xl text-gray-600">%</span>
                                </div>
                                <p className="text-xs text-gray-500">Percentage of gross salary</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-4xl font-bold text-teal-600">{formData.employee_rate}%</div>
                                <p className="text-sm text-gray-500 mt-1">of Gross Salary</p>
                            </div>
                        )}
                    </div>

                    {/* Employer Contribution */}
                    <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Building2 className="text-cyan-600" size={20} />
                            <span className="font-semibold text-gray-800">Employer Contribution</span>
                        </div>

                        {editMode ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.employer_rate}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            employer_rate: e.target.value
                                        }))}
                                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-lg font-bold text-center"
                                    />
                                    <span className="text-xl text-gray-600">%</span>
                                </div>
                                <p className="text-xs text-gray-500">Matching employer contribution</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-4xl font-bold text-cyan-600">{formData.employer_rate}%</div>
                                <p className="text-sm text-gray-500 mt-1">of Gross Salary</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Effective Date (Edit Mode) */}
                {editMode && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <label className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <Calendar size={16} />
                                Effective From
                            </span>
                            <input
                                type="date"
                                value={formData.effective_date}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    effective_date: e.target.value
                                }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Calculation Example */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                    <Info className="text-teal-600 shrink-0 mt-0.5" size={18} />
                    <div className="space-y-3 flex-1">
                        <div className="text-sm text-teal-900">
                            <strong>Example Calculation</strong> (for KES {exampleSalary.toLocaleString()} gross salary):
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-white p-3 rounded-lg text-center">
                                <div className="text-gray-500 text-xs mb-1">Employee ({formData.employee_rate}%)</div>
                                <div className="font-bold text-teal-700">{formatCurrency(employeeContribution)}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg text-center">
                                <div className="text-gray-500 text-xs mb-1">Employer ({formData.employer_rate}%)</div>
                                <div className="font-bold text-cyan-700">{formatCurrency(employerContribution)}</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border-2 border-teal-300 text-center">
                                <div className="text-gray-500 text-xs mb-1">Total Remitted</div>
                                <div className="font-bold text-teal-800">{formatCurrency(totalContribution)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-800 mb-1">No Cap</div>
                    <p className="text-sm text-gray-500">
                        Unlike NSSF, there is no maximum limit on housing levy contributions.
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-800 mb-1">Tax Relief</div>
                    <p className="text-sm text-gray-500">
                        15% affordable housing relief applies to employee contribution (max KES 9,000).
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="font-semibold text-gray-800 mb-1">Mandatory</div>
                    <p className="text-sm text-gray-500">
                        Applies to all employers and employees under the Affordable Housing Act.
                    </p>
                </div>
            </div>

            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-800">
                        <strong>Affordable Housing Act 2024:</strong> The Housing Levy is mandatory at 1.5%
                        from both employee and employer (3% total), calculated on gross salary. Contributions
                        go to the National Housing Development Fund to finance affordable housing projects.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HousingLevyConfig;
