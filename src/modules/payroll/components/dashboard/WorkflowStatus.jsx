import React, { useState, useEffect } from 'react';
import { Check, Lock, ArrowRight, RefreshCw, AlertCircle, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { payrollService } from '../../../../services/payrollService';

const WorkflowStatus = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCurrentPeriod();
    }, []);

    const fetchCurrentPeriod = async () => {
        try {
            setLoading(true);
            const response = await payrollService.getCurrentPeriod();
            setData(response);
            setError(null);
        } catch (err) {
            console.error('Error fetching current period:', err);
            setError('Failed to load workflow status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
            case 'processing': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' };
            case 'calculated': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
            case 'approved': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
            case 'paid': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100' };
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm mb-8 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                    </div>
                    <div className="h-8 w-32 bg-gray-200 rounded-lg" />
                </div>
                <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm mb-8">
                <div className="text-center py-6">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 mb-3">{error}</p>
                    <button
                        onClick={fetchCurrentPeriod}
                        className="btn btn-secondary mx-auto mt-2"
                    >
                        <RefreshCw size={16} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    // No period found
    if (!data?.period) {
        return (
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm mb-8">
                <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">No Active Payroll Period</h3>
                    <p className="text-gray-500 text-sm">Create a new payroll period to get started</p>
                    <button className="mt-4 btn btn-primary">
                        Create Period
                    </button>
                </div>
            </div>
        );
    }

    const { period, workflow, progress_percentage } = data;
    const statusColors = getStatusColor(period.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm mb-8"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{period.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">
                            Processing Cycle: <span className="font-semibold text-blue-600">{period.locked ? 'Locked' : 'Active'}</span>
                        </p>
                        {period.employee_count > 0 && (
                            <span className="text-xs text-gray-400">
                                • {period.employee_count} employees
                            </span>
                        )}
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                    {period.status === 'calculated' ? (
                        <>
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            Action Required
                        </>
                    ) : period.status === 'processing' ? (
                        <>
                            <Clock size={14} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Check size={14} />
                            {period.status_display}
                        </>
                    )}
                </div>
            </div>

            <div className="relative">
                {/* Connecting Line Background */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 rounded-full -z-10"></div>
                {/* Progress Line */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress_percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute top-4 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full -z-10"
                />

                <div className="flex justify-between">
                    {workflow.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center gap-2 group cursor-default"
                        >
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.status === 'completed'
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : step.status === 'current'
                                        ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50 shadow-md'
                                        : 'bg-white border-gray-200 text-gray-300'
                                }`}>
                                {step.status === 'completed' ? (
                                    <Check size={16} strokeWidth={3} />
                                ) : step.name === 'Disbursement' && step.status !== 'current' ? (
                                    <Lock size={14} />
                                ) : (
                                    <span className="text-xs font-bold">{step.id}</span>
                                )}
                            </div>
                            <div className="text-center">
                                <p className={`text-xs font-bold transition-colors ${step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-800'
                                    }`}>
                                    {step.name}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{step.date}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Period Summary */}
            {(period.total_gross > 0 || period.total_net > 0) && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="text-gray-500">Gross: </span>
                            <span className="font-semibold text-gray-800">
                                KES {(period.total_gross / 1000000).toFixed(2)}M
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Net: </span>
                            <span className="font-semibold text-emerald-600">
                                KES {(period.total_net / 1000000).toFixed(2)}M
                            </span>
                        </div>
                    </div>
                    <span className="text-xs text-gray-400">
                        Payment Date: {period.payment_date ? new Date(period.payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default WorkflowStatus;
