import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, Receipt } from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const MyPaymentHistory = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await portalService.getPayments();
                setData(res);
            } catch {
                toast.error('Failed to load payment history');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <StudentLayout title="Payment History">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            </StudentLayout>
        );
    }

    const receipts = data?.receipts || [];
    const totalPaid = data?.total_paid || 0;

    return (
        <StudentLayout title="Payment History">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-1">
                {/* Total */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-emerald-100 text-sm">Total Payments Made</p>
                    <p className="text-3xl font-bold mt-1">{fmtCurrency(totalPaid)}</p>
                </div>

                {/* Receipts */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Receipt size={20} className="text-emerald-500" /> Payment Receipts
                    </h3>
                    {receipts.length > 0 ? (
                        <div className="space-y-3">
                            {receipts.map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                <CreditCard size={18} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{r.receipt_number}</p>
                                                <p className="text-xs text-gray-500">
                                                    {r.received_date} • {r.payment_method_name || 'N/A'}
                                                    {r.reference ? ` • Ref: ${r.reference}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-emerald-600">{fmtCurrency(r.amount_received)}</p>
                                    </div>

                                    {r.allocations?.length > 0 && (
                                        <div className="mt-3 pl-[52px]">
                                            <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Allocated to</p>
                                            <div className="space-y-1">
                                                {r.allocations.map(a => (
                                                    <div key={a.id} className="flex justify-between text-xs text-gray-600">
                                                        <span>Invoice {a.invoice_number}</span>
                                                        <span className="font-medium">{fmtCurrency(a.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                            <CreditCard size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No payments recorded</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </StudentLayout>
    );
};

export default MyPaymentHistory;
