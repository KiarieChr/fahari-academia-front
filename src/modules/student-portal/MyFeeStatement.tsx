import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, FileText, ChevronDown, ChevronUp,
    Loader2, AlertCircle, CheckCircle2, Clock,
} from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const statusConfig = {
    PAID: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    PARTIALLY_PAID: { color: 'bg-amber-100 text-amber-700', icon: Clock },
    SENT: { color: 'bg-blue-100 text-blue-700', icon: FileText },
    OVERDUE: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    DRAFT: { color: 'bg-gray-100 text-gray-600', icon: FileText },
};

const InvoiceCard = ({ invoice }) => {
    const [expanded, setExpanded] = useState(false);
    const cfg = statusConfig[invoice.status] || statusConfig.DRAFT;
    const StatusIcon = cfg.icon;

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <FileText size={18} className="text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{invoice.invoice_number}</p>
                            <p className="text-xs text-gray-500">
                                {invoice.term_name} • {invoice.year_name}
                                {invoice.grade_name ? ` • ${invoice.grade_name}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{fmtCurrency(invoice.total_amount)}</p>
                            {invoice.balance > 0 && (
                                <p className="text-xs text-red-500 font-medium">Bal: {fmtCurrency(invoice.balance)}</p>
                            )}
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${cfg.color}`}>
                            <StatusIcon size={11} /> {invoice.status?.replace('_', ' ')}
                        </span>
                        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                </div>
            </div>

            {expanded && invoice.items?.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/30">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase">
                                <th className="text-left pb-2 font-medium">Item</th>
                                <th className="text-right pb-2 font-medium">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map(item => (
                                <tr key={item.id} className="border-t border-gray-100">
                                    <td className="py-2 text-gray-700">
                                        {item.name}
                                        {item.is_optional && (
                                            <span className="ml-1.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Optional</span>
                                        )}
                                    </td>
                                    <td className="py-2 text-right font-medium text-gray-900">{fmtCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-200">
                                <td className="py-2 font-bold text-gray-800">Total</td>
                                <td className="py-2 text-right font-bold text-gray-900">{fmtCurrency(invoice.total_amount)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

const MyFeeStatement = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await portalService.getFees();
                setData(res);
            } catch {
                toast.error('Failed to load fee statement');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <StudentLayout title="Fee Statement">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            </StudentLayout>
        );
    }

    const summary = data?.summary || {};
    const invoices = data?.invoices || [];

    return (
        <StudentLayout title="Fee Statement">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-1">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase">Total Invoiced</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{fmtCurrency(summary.total_invoiced)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{fmtCurrency(summary.total_paid)}</p>
                    </div>
                    <div className={`rounded-xl border p-5 ${summary.total_balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <p className="text-xs font-medium text-gray-500 uppercase">Balance</p>
                        <p className={`text-2xl font-bold mt-1 ${summary.total_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {fmtCurrency(summary.total_balance)}
                        </p>
                    </div>
                </div>

                {/* Invoices */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard size={20} className="text-indigo-500" /> Invoices
                    </h3>
                    {invoices.length > 0 ? (
                        <div className="space-y-3">
                            {invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                            <FileText size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No invoices found</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </StudentLayout>
    );
};

export default MyFeeStatement;
