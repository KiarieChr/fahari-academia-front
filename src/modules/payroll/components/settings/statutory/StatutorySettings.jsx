import React, { useState, useEffect } from 'react';
import { 
    Calculator, 
    Shield, 
    Home, 
    BadgePercent, 
    Settings, 
    RefreshCw,
    Download,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import PAYETaxBandsConfig from './PAYETaxBandsConfig';
import NSSFConfig from './NSSFConfig';
import SHIFConfig from './SHIFConfig';
import HousingLevyConfig from './HousingLevyConfig';
import CustomStatutoryDeductions from './CustomStatutoryDeductions';
import { payrollService } from '../../../../../services/payrollService';

const StatutorySettings = () => {
    const [activeTab, setActiveTab] = useState('paye');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [statutoryData, setStatutoryData] = useState({
        taxBands: [],
        taxReliefs: [],
        statutoryRates: [],
        lastUpdated: null
    });

    const tabs = [
        { id: 'paye', label: 'PAYE Tax Bands', icon: Calculator, color: 'blue' },
        { id: 'nssf', label: 'NSSF', icon: Shield, color: 'orange' },
        { id: 'shif', label: 'SHA/SHIF', icon: Shield, color: 'purple' },
        { id: 'housing', label: 'Housing Levy', icon: Home, color: 'teal' },
        { id: 'custom', label: 'Custom Deductions', icon: BadgePercent, color: 'gray' }
    ];

    useEffect(() => {
        loadAllStatutoryData();
    }, []);

    const loadAllStatutoryData = async () => {
        setLoading(true);
        try {
            const [taxBandsRes, taxReliefsRes, statutoryRatesRes] = await Promise.all([
                payrollService.getTaxBands(),
                payrollService.getTaxReliefs(),
                payrollService.getStatutoryRates()
            ]);

            setStatutoryData({
                taxBands: taxBandsRes.data?.tax_bands || [],
                taxReliefs: taxReliefsRes.data?.tax_reliefs || [],
                statutoryRates: statutoryRatesRes.data?.statutory_rates || [],
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            showToast('Failed to load statutory data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSeedDefaults = async () => {
        if (!confirm('This will reset all statutory settings to Kenyan defaults. Continue?')) return;
        
        setLoading(true);
        try {
            await payrollService.seedStatutoryDefaults();
            await loadAllStatutoryData();
            showToast('Default Kenyan statutory rates applied successfully');
        } catch (error) {
            showToast('Failed to seed defaults', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExportSettings = async () => {
        try {
            const response = await payrollService.exportSettings();
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payroll-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Settings exported successfully');
        } catch (error) {
            showToast('Failed to export settings', 'error');
        }
    };

    // Get counts for badges
    const getTabBadge = (tabId) => {
        switch (tabId) {
            case 'paye':
                return statutoryData.taxBands.length;
            case 'nssf':
                return statutoryData.statutoryRates.filter(r => r.rate_type.includes('nssf')).length;
            case 'shif':
                return statutoryData.statutoryRates.filter(r => r.rate_type === 'shif').length > 0 ? 'Active' : 'Inactive';
            case 'housing':
                return statutoryData.statutoryRates.filter(r => r.rate_type === 'housing_levy').length > 0 ? 'Active' : 'Inactive';
            default:
                return null;
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'paye':
                return (
                    <PAYETaxBandsConfig 
                        taxBands={statutoryData.taxBands}
                        taxReliefs={statutoryData.taxReliefs}
                        onUpdate={loadAllStatutoryData}
                        showToast={showToast}
                    />
                );
            case 'nssf':
                return (
                    <NSSFConfig 
                        rates={statutoryData.statutoryRates.filter(r => r.rate_type.includes('nssf'))}
                        onUpdate={loadAllStatutoryData}
                        showToast={showToast}
                    />
                );
            case 'shif':
                return (
                    <SHIFConfig 
                        rates={statutoryData.statutoryRates.filter(r => ['shif', 'nhif'].includes(r.rate_type))}
                        onUpdate={loadAllStatutoryData}
                        showToast={showToast}
                    />
                );
            case 'housing':
                return (
                    <HousingLevyConfig 
                        rates={statutoryData.statutoryRates.filter(r => r.rate_type === 'housing_levy')}
                        onUpdate={loadAllStatutoryData}
                        showToast={showToast}
                    />
                );
            case 'custom':
                return (
                    <CustomStatutoryDeductions 
                        onUpdate={loadAllStatutoryData}
                        showToast={showToast}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg
                    ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Statutory Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Configure PAYE tax bands, NSSF, SHA/SHIF, Housing Levy and other statutory deductions
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSeedDefaults}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <Settings size={16} />
                        Load KE Defaults
                    </button>
                    <button
                        onClick={handleExportSettings}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={loadAllStatutoryData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div className="text-sm text-blue-800">
                        <strong>Kenya Statutory Deductions:</strong> Changes to statutory rates are versioned with 
                        effective dates. Historical calculations will use rates that were active at the time of processing.
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px space-x-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const badge = getTabBadge(tab.id);
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors
                                    ${isActive 
                                        ? `border-${tab.color}-600 text-${tab.color}-600` 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                                {badge && (
                                    <span className={`px-2 py-0.5 text-xs rounded-full
                                        ${isActive 
                                            ? `bg-${tab.color}-100 text-${tab.color}-700` 
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                            <span className="text-gray-500">Loading statutory data...</span>
                        </div>
                    </div>
                ) : (
                    renderTabContent()
                )}
            </div>
        </div>
    );
};

export default StatutorySettings;
