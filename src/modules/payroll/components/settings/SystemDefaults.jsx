import React from 'react';
import { Settings, RefreshCw, FileText, Lock, Shield, History } from 'lucide-react';

const SystemDefaults = () => {
    return (
        <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-lg font-bold text-gray-900">System Defaults</h3>
                <p className="text-sm text-gray-500">Global configurations for currency, rounding, and audit security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Configuration */}
                <div className="space-y-6">
                    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Settings size={20} /></div>
                            <h4 className="font-bold text-gray-800">General Configuration</h4>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Base Currency</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                                    <option>KES (Kenyan Shilling)</option>
                                    <option>USD (United States Dollar)</option>
                                    <option>GBP (British Pound)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Rounding Precision</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                                    <option>No Rounding (Exact Amount)</option>
                                    <option>Round to Nearest Whole Number</option>
                                    <option>Round Up to Nearest 10</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><RefreshCw size={20} /></div>
                            <h4 className="font-bold text-gray-800">Calculation Logic</h4>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Overtime Multiplier</p>
                                    <p className="text-xs text-gray-500">Standard rate for extra hours</p>
                                </div>
                                <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
                                    <option>1.5x Hourly Rate</option>
                                    <option>2.0x Hourly Rate</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Proration</p>
                                    <p className="text-xs text-gray-500">Auto-calculate for mid-month joiners</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security & Audit */}
                <div className="space-y-6">
                    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Lock size={20} /></div>
                            <h4 className="font-bold text-gray-800">Security & Auditing</h4>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-gray-500" />
                                        <p className="text-sm font-bold text-gray-700">Audit Trail Logging</p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Active</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    System is currently recording all changes to salary structures, tax settings, and employee static data. Logs are retained for 7 years.
                                </p>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Retroactive Changes</p>
                                        <p className="text-xs text-gray-500">Allow modification of past payrolls</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Strict IP Access</p>
                                        <p className="text-xs text-gray-500">Restrict admin access to office IP</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security & Access Control */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={20} className="text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-800">Security & Permissions</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm">Strict Role-Based Access (RBAC)</h4>
                            <p className="text-xs text-gray-500">Only authorized HR & Finance roles can modify payroll</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm">Two-Factor Auth for Approvals</h4>
                            <p className="text-xs text-gray-500">Require OTP for final payroll disbursement</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <History size={20} className="text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-800">Audit Logs & History</h3>
                </div>

                <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-600">
                            <tr>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-3 font-medium">Admin User</td>
                                <td className="px-4 py-3 text-gray-600">Modified Housing Levy Rate</td>
                                <td className="px-4 py-3 text-gray-500">Just now</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">HR Manager</td>
                                <td className="px-4 py-3 text-gray-600">Updated Salary Structure (Grade A1)</td>
                                <td className="px-4 py-3 text-gray-500">2 hrs ago</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-200">
                        <button className="text-xs font-bold text-blue-600 hover:underline">View Full Audit Log</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemDefaults;
