import React from 'react';
import { ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';

const SocialFundsConfig = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* NSSF Configuration */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">NSSF Rates (Tiered)</h3>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-bold">New Act 2013</span>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Tier I (Lower Limit)</p>
                            <p className="text-xs text-gray-500">Up to KES 7,000</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">KES 420</p>
                            <p className="text-[10px] text-gray-400">6% Employee + 6% Employer</p>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Tier II (Upper Limit)</p>
                            <p className="text-xs text-gray-500">KES 7,001 - KES 36,000</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">KES 1,740</p>
                            <p className="text-[10px] text-gray-400">6% Employee + 6% Employer</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertTriangle size={14} />
                        <span>Rates updated automatically based on gov gazette.</span>
                    </div>
                </div>
            </div>

            {/* NHIF & Levies */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">SHA / NHIF & Levies</h3>

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-semibold text-gray-700">Social Health Authority (SHA)</label>
                            <span className="text-xs font-bold text-blue-600">2.75% of Gross</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-full"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Replacing NHIF. Applied to gross salary.</p>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-semibold text-gray-700">Affordable Housing Levy</label>
                            <span className="text-xs font-bold text-purple-600">1.5% Gross</span>
                        </div>
                        <p className="text-xs text-gray-500">Matched by employer (1.5% + 1.5%).</p>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-semibold text-gray-700">NITA Levy</label>
                            <span className="text-xs font-bold text-gray-600">KES 50 / Employee</span>
                        </div>
                        <p className="text-xs text-gray-500">Employer cost only.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialFundsConfig;
