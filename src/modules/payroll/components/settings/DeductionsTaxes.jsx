import React, { useState } from 'react';
import { DollarSign, Percent, Shield, AlertTriangle, Plus } from 'lucide-react';
import AddDeductionModal from './modals/AddDeductionModal';

const DeductionsTaxes = () => {
    const [isAddDeductionOpen, setIsAddDeductionOpen] = useState(false);

    return (
        <div className="space-y-8">
            <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Deductions & Taxes</h3>
                <p className="text-sm text-gray-500">Manage statutory and voluntary deductions.</p>
            </div>

            {/* PAYE Section - Distinct Style */}
            <div className="bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10"></div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-4 ring-slate-100">PAYE</div>
                            <h4 className="font-bold text-gray-800">Pay As You Earn (Income Tax)</h4>
                        </div>
                        <p className="text-sm text-gray-500 pl-10">Automatic calculation based on KRA tax brackets.</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Auto-Enabled</span>
                </div>

                <div className="pl-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Tax Modality</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-200 outline-none">
                            <option>Graduated Scale (Kenya 2024)</option>
                            <option>Fixed Rate (Consultants / Directors)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Personal Relief</label>
                        <input type="text" value="KES 2,400" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50" readOnly />
                    </div>
                </div>
            </div>

            {/* NSSF & NHIF Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NSSF */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <h5 className="font-bold text-gray-800">NSSF</h5>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                    </div>
                    <div className="space-y-3 pl-11">
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                            <span className="text-gray-500">Employee</span>
                            <span className="font-semibold text-gray-800">6.0%</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50">
                            <span className="text-gray-500">Employer</span>
                            <span className="font-semibold text-gray-800">6.0%</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-500">Tier II Cap</span>
                            <span className="font-semibold text-gray-800">KES 18,000</span>
                        </div>
                    </div>
                </div>

                {/* NHIF */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Shield size={20} />
                            </div>
                            <h5 className="font-bold text-gray-800">SHIF / NHIF</h5>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                    <div className="space-y-3 pl-11">
                        <div className="bg-purple-50 p-3 rounded-lg text-xs text-purple-800 flex gap-2">
                            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                            <span>New SHIF rates apply (2.75% of Gross Salary). Legacy NHIF bands are disabled.</span>
                        </div>
                        <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-500">Calculation</span>
                            <span className="font-semibold text-gray-800">2.75% of Gross</span>
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
                </div>
            </div>

            {/* Add Deduction Modal */}
            <AddDeductionModal isOpen={isAddDeductionOpen} onClose={() => setIsAddDeductionOpen(false)} />
        </div>
    );
};

export default DeductionsTaxes;
