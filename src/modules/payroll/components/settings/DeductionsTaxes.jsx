import React, { useState, useEffect } from 'react';
import {
    DollarSign,
    Percent,
    Shield,
    AlertTriangle,
    Plus,
    Settings,
    ExternalLink,
    RefreshCw,
    Calculator,
    Home,
    Heart,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import AddDeductionModal from './modals/AddDeductionModal';
import { payrollService } from '../../../../services/payrollService';

const DeductionsTaxes = () => {
    const [isAddDeductionOpen, setIsAddDeductionOpen] = useState(false);
    const [showStatutorySettings, setShowStatutorySettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Data from API
    const [statutoryRates, setStatutoryRates] = useState([]);
    const [taxBands, setTaxBands] = useState([]);
    const [taxReliefs, setTaxReliefs] = useState([]);
    const [deductionTypes, setDeductionTypes] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [ratesRes, bandsRes, reliefsRes, deductionsRes] = await Promise.all([
                payrollService.getStatutoryRates(),
                payrollService.getTaxBands(),
                payrollService.getTaxReliefs(),
                payrollService.getDeductionTypes()
            ]);

            setStatutoryRates(ratesRes.data?.statutory_rates || []);
            setTaxBands(bandsRes.data?.tax_bands || []);
            setTaxReliefs(reliefsRes.data?.tax_reliefs || []);
            setDeductionTypes(deductionsRes.data?.deduction_types || []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleToggleStatutory = async (rateType, currentEnabled) => {
        try {
            await payrollService.toggleStatutoryDeduction(rateType, !currentEnabled);
            showToast(`${rateType.toUpperCase()} ${!currentEnabled ? 'enabled' : 'disabled'}`);
            loadData();
        } catch (error) {
            showToast('Failed to toggle', 'error');
        }
    };

    // Get specific rates
    const getNSSFRate = () => statutoryRates.find(r => r.rate_type === 'nssf_tier1');
    const getSHIFRate = () => statutoryRates.find(r => r.rate_type === 'shif');
    const getHousingRate = () => statutoryRates.find(r => r.rate_type === 'housing_levy');
    const getPersonalRelief = () => taxReliefs.find(r => r.relief_type === 'personal');

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    // Voluntary deductions
    const voluntaryDeductions = deductionTypes.filter(d => d.category === 'voluntary');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
                    ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Deductions & Taxes</h3>
                    <p className="text-sm text-gray-500">Manage statutory and voluntary deductions.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/dashboard/payroll/statutory'}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                    <Settings size={16} />
                    Advanced Statutory Settings
                    <ExternalLink size={14} />
                </button>
            </div>

            {/* PAYE Section */}
            <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                                <Calculator size={16} />
                            </div>
                            <h4 className="font-bold text-gray-800">Pay As You Earn (Income Tax)</h4>
                        </div>
                        <p className="text-sm text-gray-500 pl-10">
                            {taxBands.length} tax band{taxBands.length !== 1 ? 's' : ''} configured (KRA graduated scale)
                        </p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Auto-Enabled
                    </span>
                </div>

                <div className="pl-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 uppercase">Tax Bands</div>
                        <div className="font-bold text-gray-900 mt-1">{taxBands.length} Configured</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 uppercase">Personal Relief</div>
                        <div className="font-bold text-gray-900 mt-1">
                            {formatCurrency(getPersonalRelief()?.amount || 2400)}/mo
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <div className="text-xs text-gray-500 uppercase">Top Rate</div>
                        <div className="font-bold text-gray-900 mt-1">
                            {taxBands.length > 0 ? `${Math.max(...taxBands.map(b => b.rate))}%` : '35%'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Statutory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* NSSF */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-orange-300 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <h5 className="font-bold text-gray-800">NSSF</h5>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={getNSSFRate()?.is_enabled ?? true}
                                onChange={() => handleToggleStatutory('nssf_tier1', getNSSFRate()?.is_enabled)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                            <span className="text-gray-500">Employee</span>
                            <span className="font-semibold text-gray-800">{getNSSFRate()?.employee_rate || 6}%</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                            <span className="text-gray-500">Employer</span>
                            <span className="font-semibold text-gray-800">{getNSSFRate()?.employer_rate || 6}%</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-500">Max (Tier II)</span>
                            <span className="font-semibold text-gray-800">
                                {formatCurrency(statutoryRates.find(r => r.rate_type === 'nssf_tier2')?.upper_limit || 36000)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* SHIF */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Heart size={20} />
                            </div>
                            <h5 className="font-bold text-gray-800">SHIF</h5>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={getSHIFRate()?.is_enabled ?? true}
                                onChange={() => handleToggleStatutory('shif', getSHIFRate()?.is_enabled)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                    <div className="space-y-2">
                        <div className="bg-purple-50 p-2 rounded-lg text-xs text-purple-800 flex gap-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>New SHA system (2024)</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-500">Rate</span>
                            <span className="font-semibold text-gray-800">{getSHIFRate()?.employee_rate || 2.75}% of Gross</span>
                        </div>
                    </div>
                </div>

                {/* Housing Levy */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-teal-300 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                                <Home size={20} />
                            </div>
                            <h5 className="font-bold text-gray-800">Housing</h5>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={getHousingRate()?.is_enabled ?? true}
                                onChange={() => handleToggleStatutory('housing_levy', getHousingRate()?.is_enabled)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                            <span className="text-gray-500">Employee</span>
                            <span className="font-semibold text-gray-800">{getHousingRate()?.employee_rate || 1.5}%</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-500">Employer</span>
                            <span className="font-semibold text-gray-800">{getHousingRate()?.employer_rate || 1.5}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Voluntary Deductions */}
            <div className="pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Other Deductions</h4>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setIsAddDeductionOpen(true)}
                        className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-500 hover:text-blue-600"
                    >
                        <Plus className="mb-1" />
                        <span className="text-xs font-bold">Add New</span>
                    </button>

                    {voluntaryDeductions.map(deduction => (
                        <div key={deduction.id} className="w-48 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-700 text-sm">{deduction.name}</span>
                                <span className={`w-2 h-2 rounded-full ${deduction.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            </div>
                            <p className="text-xs text-gray-500">{deduction.category_display}</p>
                            <p className="text-sm font-semibold mt-2 text-gray-600">{deduction.code}</p>
                        </div>
                    ))}

                    {voluntaryDeductions.length === 0 && (
                        <>
                            <div className="w-48 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-700 text-sm">HELB Loan</span>
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                </div>
                                <p className="text-xs text-gray-500">Monthly Deduction</p>
                                <p className="text-sm font-semibold mt-2">Fixed Amount</p>
                            </div>

                            <div className="w-48 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-gray-700 text-sm">Sacco</span>
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                </div>
                                <p className="text-xs text-gray-500">Benevolent Fund</p>
                                <p className="text-sm font-semibold mt-2">KES 500.00</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add Deduction Modal */}
            <AddDeductionModal
                isOpen={isAddDeductionOpen}
                onClose={() => setIsAddDeductionOpen(false)}
                onSuccess={() => {
                    loadData();
                    showToast('Deduction added successfully');
                }}
            />
        </div>
    );
};

export default DeductionsTaxes;
