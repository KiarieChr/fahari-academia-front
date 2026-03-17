import React, { useState, useEffect } from 'react';
import { Eye, Printer, RefreshCw, AlertCircle, Calendar, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import PayrollRunDetailsModal from './modals/PayrollRunDetailsModal';
import { payrollService } from '../../../../services/payrollService';

const RecentRunsTable = () => {
    const [selectedRun, setSelectedRun] = useState(null);
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecentRuns();
    }, []);

    const fetchRecentRuns = async () => {
        try {
            setLoading(true);
            const response = await payrollService.getRecentRuns(5);
            setRuns(response.runs || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching recent runs:', err);
            setError('Failed to load recent payroll runs');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `KES ${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `KES ${(value / 1000).toFixed(0)}K`;
        }
        return `KES ${value?.toLocaleString() || 0}`;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'paid': { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle, label: 'Paid' },
            'approved': { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Approved' },
            'calculated': { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'Calculated' },
            'processing': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Clock, label: 'Processing' },
            'closed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle, label: 'Closed' },
            'failed': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Failed' },
        };
        const config = statusConfig[status] || statusConfig.processing;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-center py-8">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 mb-3">{error}</p>
                    <button
                        onClick={fetchRecentRuns}
                        className="flex items-center gap-2 mx-auto px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                        <RefreshCw size={14} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-800">Recent Payroll Runs</h3>
                </div>
                <button
                    onClick={fetchRecentRuns}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {runs.length === 0 ? (
                <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No payroll runs found</p>
                    <p className="text-gray-400 text-sm mt-1">Start by processing your first payroll</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Period</th>
                                <th className="px-4 py-3">Employees</th>
                                <th className="px-4 py-3">Gross Pay</th>
                                <th className="px-4 py-3">Net Pay</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {runs.map((run, index) => (
                                <motion.tr
                                    key={run.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-blue-50/30 transition-colors group"
                                >
                                    <td className="px-4 py-4">
                                        <div>
                                            <span className="font-semibold text-gray-800">{run.period}</span>
                                            {run.payment_date && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Payment: {new Date(run.payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="flex items-center gap-1.5 text-gray-600">
                                            <Users size={14} className="text-gray-400" />
                                            {run.employees}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-700">{formatCurrency(run.gross_pay)}</td>
                                    <td className="px-4 py-4 font-medium text-emerald-600">{formatCurrency(run.net_pay)}</td>
                                    <td className="px-4 py-4">
                                        {getStatusBadge(run.status)}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setSelectedRun(run)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Print Summary"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Details Modal */}
            <PayrollRunDetailsModal run={selectedRun} onClose={() => setSelectedRun(null)} />
        </div>
    );
};

export default RecentRunsTable;
