import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { Loader2, Users, Search } from 'lucide-react';
import ExportButton from './ExportButton';

const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const CustomerBalancesReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('unpaid');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeService.getCustomerBalances({ search, status: statusFilter });
            setData(res);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [statusFilter]);

    const summary = data?.summary || {};
    const rows = data?.rows || [];
    const getExportRows = () => rows.map((r) => [r.customer_name, r.total_invoiced, r.total_paid, r.balance, r.invoice_count]);

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="relative flex-1 min-w-48">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search customer..." value={search}
                            onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-medium block mb-1">Status</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="unpaid">Unpaid Only</option>
                            <option value="all">All</option>
                        </select>
                    </div>
                    <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">Search</button>
                    <div className="ml-auto">
                        <ExportButton
                            title="Customer Balances Report"
                            headers={['Customer', 'Total Invoiced (KES)', 'Total Paid (KES)', 'Balance (KES)', 'Invoices']}
                            getRows={getExportRows}
                            filename="customer-balances"
                        />
                    </div>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total AR Balance</p>
                    <p className="text-2xl font-bold mt-1 text-amber-600">{fmt(summary.grand_balance)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Customers</p>
                    <p className="text-2xl font-bold mt-1 text-slate-700 dark:text-slate-200">{summary.customer_count ?? 0}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Customer Balances (Non-Student)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Customer</th>
                                    <th className="px-5 py-3 font-semibold text-right">Invoiced</th>
                                    <th className="px-5 py-3 font-semibold text-right">Paid</th>
                                    <th className="px-5 py-3 font-semibold text-right text-amber-600">Balance</th>
                                    <th className="px-5 py-3 font-semibold text-right">Invoices</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {rows.length === 0 ? (
                                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                                        <Users size={28} className="mx-auto mb-2 opacity-40" />No customer balances
                                    </td></tr>
                                ) : rows.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{r.customer_name}</td>
                                        <td className="px-5 py-3 text-right text-indigo-600">{fmt(r.total_invoiced)}</td>
                                        <td className="px-5 py-3 text-right text-green-600">{fmt(r.total_paid)}</td>
                                        <td className="px-5 py-3 text-right text-amber-600 font-bold">{fmt(r.balance)}</td>
                                        <td className="px-5 py-3 text-right text-slate-400">{r.invoice_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {rows.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-50 dark:bg-slate-900 font-bold text-sm">
                                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300">TOTAL</td>
                                        <td className="px-5 py-3 text-right text-indigo-600">{fmt(rows.reduce((a, b) => a + b.total_invoiced, 0))}</td>
                                        <td className="px-5 py-3 text-right text-green-600">{fmt(rows.reduce((a, b) => a + b.total_paid, 0))}</td>
                                        <td className="px-5 py-3 text-right text-amber-600">{fmt(summary.grand_balance)}</td>
                                        <td className="px-5 py-3 text-right text-slate-400">{rows.reduce((a, b) => a + b.invoice_count, 0)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerBalancesReport;
