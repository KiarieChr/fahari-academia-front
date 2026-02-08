import React from 'react';
import { AlertTriangle, Info, Bell } from 'lucide-react';

const AlertsWidget = () => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Bell className="text-gray-400" size={18} />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Notifications</h3>
                </div>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 rounded-full">3</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <p className="text-xs font-bold text-red-800">Missing Tax PINs</p>
                        <p className="text-xs text-red-600 mt-1">3 New employees are missing KRA PINs. Compliance risk.</p>
                        <button className="mt-2 text-[10px] font-bold text-red-700 underline">Fix Now</button>
                    </div>
                </div>

                <div className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <Info className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <p className="text-xs font-bold text-amber-800">Unapproved Overtime</p>
                        <p className="text-xs text-amber-700 mt-1">12hrs of overtime pending manager approval.</p>
                    </div>
                </div>

                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <p className="text-xs font-bold text-blue-800">New Policy Applied</p>
                        <p className="text-xs text-blue-700 mt-1">Housing levy updated to 1.5% as per new regulations.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertsWidget;
