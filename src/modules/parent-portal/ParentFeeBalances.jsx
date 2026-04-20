import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CreditCard, Loader2, ChevronRight, AlertCircle, CheckCircle2,
} from 'lucide-react';
import ParentLayout from '../../layouts/ParentLayout';
import { portalService } from '../student-portal/portalService';
import { toast } from 'react-toastify';

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const ParentFeeBalances = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [feeData, setFeeData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const childrenRes = await portalService.getChildren();
                const list = Array.isArray(childrenRes) ? childrenRes : [];
                setChildren(list);

                // Fetch fees for each child
                const feesMap = {};
                await Promise.all(
                    list.map(async (child) => {
                        try {
                            const fees = await portalService.getChildFees(child.id);
                            feesMap[child.id] = fees;
                        } catch {
                            feesMap[child.id] = { summary: {}, invoices: [] };
                        }
                    })
                );
                setFeeData(feesMap);
            } catch {
                toast.error('Failed to load fee data');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <ParentLayout title="Fee Balances">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                </div>
            </ParentLayout>
        );
    }

    // Aggregate totals
    const totalInvoiced = children.reduce((sum, c) => sum + (feeData[c.id]?.summary?.total_invoiced || 0), 0);
    const totalPaid = children.reduce((sum, c) => sum + (feeData[c.id]?.summary?.total_paid || 0), 0);
    const totalBalance = children.reduce((sum, c) => sum + (feeData[c.id]?.summary?.total_balance || 0), 0);

    return (
        <ParentLayout title="Fee Balances">
            <motion.div
                initial="hidden" animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                className="space-y-6 p-1"
            >
                {/* Overall Summary */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase">Total Invoiced</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(totalInvoiced)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{fmtCurrency(totalPaid)}</p>
                    </div>
                    <div className={`rounded-xl border p-5 ${totalBalance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <p className="text-xs font-medium text-gray-500 uppercase">Total Balance</p>
                        <p className={`text-2xl font-bold mt-1 ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {fmtCurrency(totalBalance)}
                        </p>
                    </div>
                </motion.div>

                {/* Per-child breakdown */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard size={20} className="text-indigo-500" /> By Child
                    </h3>
                    {children.length > 0 ? (
                        <div className="space-y-3">
                            {children.map(child => {
                                const fees = feeData[child.id] || {};
                                const summary = fees.summary || {};
                                const balance = summary.total_balance || 0;
                                const invoiceCount = (fees.invoices || []).length;

                                return (
                                    <div
                                        key={child.id}
                                        onClick={() => navigate(`/parent/children/${child.id}`)}
                                        className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                                                    {child.full_name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{child.full_name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {child.admission_number} &middot; {child.current_grade_name || 'N/A'}
                                                        {child.current_stream_name ? ` (${child.current_stream_name})` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1.5">
                                                        {balance > 0 ? (
                                                            <AlertCircle size={14} className="text-red-500" />
                                                        ) : (
                                                            <CheckCircle2 size={14} className="text-green-500" />
                                                        )}
                                                        <p className={`text-sm font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {fmtCurrency(balance)}
                                                        </p>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400">{invoiceCount} invoice{invoiceCount !== 1 ? 's' : ''}</p>
                                                </div>
                                                <ChevronRight size={16} className="text-gray-300" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                            <CreditCard size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No children linked</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </ParentLayout>
    );
};

export default ParentFeeBalances;
