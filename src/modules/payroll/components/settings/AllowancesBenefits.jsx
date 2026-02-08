import React, { useState } from 'react';
import { ShieldCheck, Bus, Home, Plus } from 'lucide-react';
import AddCustomAllowanceModal from './modals/AddCustomAllowanceModal';

const AllowancesBenefits = () => {
    const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900">Allowances & Benefits</h3>
                <p className="text-sm text-gray-500">Configure recurring allowances and employee benefits logic.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Housing Allowance Card */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Home size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Housing Allowance</h4>
                                <p className="text-xs text-gray-500">Standard monthly benefit</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="space-y-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                        <div>
                            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Calculation Method</label>
                            <select className="w-full mt-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                <option>Fixed Amount (User Defined)</option>
                                <option>15% of Basic Salary</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-medium text-gray-600">Is this allowance taxable?</span>
                            <div className="flex bg-gray-200 p-1 rounded-lg">
                                <button className="px-3 py-1 text-xs font-medium rounded-md bg-white text-gray-800 shadow-sm">Yes</button>
                                <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700">No</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transport Allowance Card */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                <Bus size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">Transport Allowance</h4>
                                <p className="text-xs text-gray-500">Commuter support benefit</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>

                    <div className="space-y-4 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Daily Rate</label>
                                <input type="number" className="w-full mt-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Monthly Cap</label>
                                <input type="number" className="w-full mt-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" placeholder="Max limit" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <p className="text-xs text-emerald-700">Non-taxable up to KES 10,000 / month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Allowances Section */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Additional Allowances</h4>
                    <button
                        onClick={() => setIsAddCustomOpen(true)}
                        className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <Plus size={16} /> Add Custom
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Hardship */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Hardship Allowance</p>
                            <p className="text-xs text-gray-500">Fixed • Taxable</p>
                        </div>
                        <button className="text-gray-400 hover:text-blue-600">Edit</button>
                    </div>

                    {/* Medical */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Medical Allowance</p>
                            <p className="text-xs text-gray-500">Fixed • Non-Taxable</p>
                        </div>
                        <button className="text-gray-400 hover:text-blue-600">Edit</button>
                    </div>

                    {/* Acting */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                        <div>
                            <p className="font-semibold text-gray-800 text-sm">Acting Allowance</p>
                            <p className="text-xs text-gray-500">% Basic • Taxable</p>
                        </div>
                        <button className="text-gray-400 hover:text-blue-600">Edit</button>
                    </div>
                </div>
            </div>

            {/* Add Custom Modal */}
            <AddCustomAllowanceModal isOpen={isAddCustomOpen} onClose={() => setIsAddCustomOpen(false)} />
        </div>
    );
};

export default AllowancesBenefits;
