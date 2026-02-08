import React, { useState } from 'react';
import { Upload, Image, Eye, X } from 'lucide-react';
import ModernPayslipTemplate from './templates/ModernPayslipTemplate';

const PayslipSettings = () => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-800">Payslip & Document Settings</h3>
                <p className="text-sm text-gray-500">Customize the look and feel of generated payslips.</p>
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
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg" defaultValue="Fahari Academia" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Note</label>
                        <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg h-24" defaultValue="This is a system generated payslip. Signature not required." />
                    </div>
                </div>

                {/* Layout & Format */}
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Layout & Format</h4>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Payslip Template</label>
                            <button
                                onClick={() => setIsPreviewOpen(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <Eye size={12} /> Preview Selected
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-2 border-primary-500 bg-blue-50 p-3 rounded-lg cursor-pointer relative overflow-hidden group">
                                <div className="h-20 bg-white border border-gray-200 mb-2 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-400">Modern Layout</span>
                                </div>
                                <p className="text-center text-xs font-semibold text-blue-700">Modern (Default)</p>
                                <div className="absolute inset-0 bg-blue-900/5 hidden group-hover:flex items-center justify-center">
                                    <span className="bg-white text-blue-800 text-xs px-2 py-1 rounded shadow font-bold">Active</span>
                                </div>
                            </div>
                            <div className="border border-gray-200 p-3 rounded-lg cursor-pointer hover:border-gray-300 opacity-60">
                                <div className="h-20 bg-gray-50 border border-gray-200 mb-2 flex items-center justify-center">
                                    <span className="text-[10px] text-gray-300">Classic Layout</span>
                                </div>
                                <p className="text-center text-xs text-gray-600">Classic Table</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Number Format</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                            <option>1,234.56 (English)</option>
                            <option>1 234,56 (European)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                <span className="text-sm text-gray-600">Show Leave Balance</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded text-blue-600" defaultChecked />
                                <span className="text-sm text-gray-600">Show YTD Totals</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input type="checkbox" className="rounded text-blue-600" />
                                <span className="text-sm text-gray-600">Show Bank Details</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                            <h3 className="font-bold text-gray-800">Preview: Modern Template</h3>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                            <div className="w-full max-w-2xl bg-white shadow-lg min-h-[800px]">
                                <ModernPayslipTemplate />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayslipSettings;
