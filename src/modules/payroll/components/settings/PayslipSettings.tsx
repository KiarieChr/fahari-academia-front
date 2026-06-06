import React, { useState, useEffect } from 'react';
import { Upload, Image, Eye, X, Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PDFViewer } from '@react-pdf/renderer';
import payrollService from '../../../../services/payrollService';
import PDFPayslipDocument from './templates/PDFPayslipDocument';

const PayslipSettings = () => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [templateId, setTemplateId] = useState(null);
    const [config, setConfig] = useState({
        companyName: 'Fahari Academia',
        footerNote: 'This is a system generated payslip. Signature not required.',
        showLeaveBalance: true,
        showYTD: true,
        showBankDetails: true,
    });

    // Fetch existing default template on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setIsLoading(true);
                const response = await payrollService.getPayslipTemplates();
                // Find the default template or just use the first active one
                const defaultTpl = response.data.find(t => t.is_default) || response.data[0];
                if (defaultTpl) {
                    setTemplateId(defaultTpl.id);
                    if (defaultTpl.config && Object.keys(defaultTpl.config).length > 0) {
                        setConfig(prev => ({ ...prev, ...defaultTpl.config }));
                    }
                }
            } catch (error) {
                console.error("Failed to load templates", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleChange = (key, value) => {
        setConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                name: 'Modern Settings',
                is_active: true,
                is_default: true,
                config: config
            };

            if (templateId) {
                await payrollService.updatePayslipTemplate(templateId, payload);
                toast.success('Template updated successfully');
            } else {
                const response = await payrollService.createPayslipTemplate(payload);
                setTemplateId(response.data.id);
                toast.success('Template created successfully');
            }
        } catch (error) {
            toast.error('Failed to save template. Ensure backend migrations are applied.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 text-gray-500">
                <RefreshCw className="animate-spin mr-2" /> Loading Template...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Payslip & Document Settings</h3>
                    <p className="text-sm text-gray-500">Customize the look and feel of generated payslips.</p>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {isSaving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Save Formatting
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Branding */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Branding</h4>

                    <div className="bg-white p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <Image size={24} className="text-gray-400" />
                            </div>
                            <div>
                                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    <Upload size={16} /> Upload New Logo
                                </button>
                                <p className="text-xs text-gray-500 mt-2">Recommended: 400x400px, PNG or JPG</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">School / Company Name</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg" 
                            value={config.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Note</label>
                        <textarea 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg h-24" 
                            value={config.footerNote}
                            onChange={(e) => handleChange('footerNote', e.target.value)}
                        />
                    </div>
                </div>

                {/* Layout & Format */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Layout & Format</h4>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Live Preview Engine</label>
                            <button
                                onClick={() => setIsPreviewOpen(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                            >
                                <Eye size={12} /> Open PDF Preview
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-2 border-primary-500 bg-blue-50 p-3 rounded-lg cursor-pointer relative overflow-hidden group">
                                <div className="h-20 bg-white border border-gray-200 mb-2 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-400 font-bold">@react-pdf/renderer</span>
                                </div>
                                <p className="text-center text-xs font-semibold text-blue-700">Dynamic PDF Engine</p>
                                <div className="absolute inset-0 bg-blue-900/5 hidden group-hover:flex items-center justify-center">
                                    <span className="bg-white text-blue-800 text-xs px-2 py-1 rounded shadow font-bold">Active Engine</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Component Toggles</label>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="rounded w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                                    checked={config.showLeaveBalance}
                                    onChange={(e) => handleChange('showLeaveBalance', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700 font-medium">Show Leave Balance</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="rounded w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                                    checked={config.showYTD}
                                    onChange={(e) => handleChange('showYTD', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700 font-medium">Show YTD Earnings & Deductions</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="rounded w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                                    checked={config.showBankDetails}
                                    onChange={(e) => handleChange('showBankDetails', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700 font-medium">Show Bank Account Details</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live React-PDF Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-700">
                        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Eye size={18} className="text-blue-400"/> Live PDF Preview
                                <span className="p-1 px-2 text-[10px] bg-blue-500/20 text-blue-300 rounded uppercase tracking-wider ml-2">Native Render</span>
                            </h3>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-100 flex items-center justify-center p-4">
                            <PDFViewer width="100%" height="100%" className="border-0 shadow-lg rounded">
                                <PDFPayslipDocument config={config} data={{}} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayslipSettings;
