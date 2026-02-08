import React, { useState, useEffect } from 'react';
import { AlertCircle, Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

const PayrollCycleSettings = () => {
    const [settings, setSettings] = useState({
        payFrequency: 'monthly',
        runDate: 25,
        cutoffDate: 20,
        financialYearStart: 'july',
        isLocked: false
    });

    const [errors, setErrors] = useState({});

    // Validation Effect
    useEffect(() => {
        const newErrors = {};
        if (settings.runDate < 1 || settings.runDate > 31) newErrors.runDate = "Must be between 1 and 31";
        if (settings.cutoffDate < 1 || settings.cutoffDate > 31) newErrors.cutoffDate = "Must be between 1 and 31";

        // Logic check: usually cutoff is before run date
        if (Number(settings.cutoffDate) >= Number(settings.runDate)) {
            newErrors.global = "Cut-off date usually precedes the payroll run date.";
        }

        setErrors(newErrors);
    }, [settings]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Payroll Cycle Settings</h3>
                    <p className="text-sm text-gray-500">Configure processing dates and frequency.</p>
                </div>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${settings.isLocked ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}
                >
                    {settings.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    {settings.isLocked ? 'Cycle Locked' : 'Cycle Active'}
                </motion.div>
            </div>

            {errors.global && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 text-sm text-amber-800 animate-pulse">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{errors.global}</p>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Pay Frequency */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Pay Frequency</label>
                        <select
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                            value={settings.payFrequency}
                            onChange={(e) => setSettings({ ...settings, payFrequency: e.target.value })}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="bi-weekly">Bi-Weekly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <p className="text-xs text-gray-400">Frequency of salary disbursement.</p>
                    </div>

                    {/* Financial Year */}
                    <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700">Financial Year Start</label>
                        <select
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                            value={settings.financialYearStart}
                            onChange={(e) => setSettings({ ...settings, financialYearStart: e.target.value })}
                        >
                            <option value="january">January (Calendar Year)</option>
                            <option value="april">April (UK/India)</option>
                            <option value="july">July (East Africa)</option>
                            <option value="october">October (US)</option>
                        </select>
                        <p className="text-xs text-gray-400">Determines tax year boundaries.</p>
                    </div>

                    {/* Run Date */}
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="block text-sm font-semibold text-gray-700">Payroll Run Date</label>
                            {errors.runDate && <span className="text-xs text-red-500 font-medium">{errors.runDate}</span>}
                        </div>
                        <div className="relative group">
                            <input
                                type="number"
                                min="1"
                                max="31"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.runDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                value={settings.runDate}
                                onChange={(e) => setSettings({ ...settings, runDate: e.target.value })}
                            />
                            <span className="absolute right-4 top-2.5 text-sm text-gray-400 group-hover:text-gray-600 transition-colors">of month</span>
                        </div>
                        <p className="text-xs text-gray-400">Day when finalized payroll is processed.</p>
                    </div>

                    {/* Cut-off Date */}
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="block text-sm font-semibold text-gray-700">Attendance Cut-off</label>
                            {errors.cutoffDate && <span className="text-xs text-red-500 font-medium">{errors.cutoffDate}</span>}
                        </div>
                        <div className="relative group">
                            <input
                                type="number"
                                min="1"
                                max="31"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${errors.cutoffDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'}`}
                                value={settings.cutoffDate}
                                onChange={(e) => setSettings({ ...settings, cutoffDate: e.target.value })}
                            />
                            <span className="absolute right-4 top-2.5 text-sm text-gray-400 group-hover:text-gray-600 transition-colors">of month</span>
                        </div>
                        <p className="text-xs text-gray-400">Last day for inclusion of OT/Claims.</p>
                    </div>
                </div>

                {/* Lock Toggle Action Area */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Operational Lock</h4>
                        <p className="text-xs text-gray-500 max-w-sm mt-0.5">Prevent any changes to the current payroll structure. Useful during audit or final processing.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.isLocked}
                            onChange={(e) => setSettings({ ...settings, isLocked: e.target.checked })}
                        />
                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default PayrollCycleSettings;
