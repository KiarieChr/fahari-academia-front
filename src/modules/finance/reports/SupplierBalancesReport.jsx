import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { Loader2, Package, Search } from 'lucide-react';
import ExportButton from './ExportButton';

const fmt = (v) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const SupplierBalancesReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('unpaid');
    const [expanded, setExpanded] = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await financeService.getSupplierBalances({ search, status: statusFilter });
            setData(res);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [statusFilter]);

    const handleSearch = () => fetchData();

    const summary = data?.summary || {};
    const rows = data?.rows || [];

    const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

    const getExportRows = () => rows.map((r) => [r.supplier_name, r.supplier_code, r.total_invoiced, r.total_paid, r.balance, r.invoice_count]);

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="relative flex-1 min-w-48">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search supplier..." value={search}
                            onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                    <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">Search</button>
                    <div className="ml-auto">
                        <ExportButton
                            title="Supplier Balances Report"
                            headers={['Supplier', 'Code', 'Total Invoiced (KES)', 'Total Paid (KES)', 'Balance (KES)', 'Invoices']}
                            getRows={getExportRows}
                            filename="supplier-balances"
                        />
                    </div>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Total AP Balance</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">{fmt(summary.grand_balance)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-medium">Suppliers</p>
                    <p className="text-2xl font-bold mt-1 text-slate-700 dark:text-slate-200">{summary.supplier_count ?? 0}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Supplier Balances</h3>
                    </div>
                    {rows.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Package size={32} className="mx-auto mb-3 opacity-40" />No supplier balances
                        </div>
                    ) : rows.map((r) => (
                        <div key={r.supplier_id} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                            <button
                                onClick={() => toggleExpand(r.supplier_id)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                            >
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white">{r.supplier_name}</p>
                                    <p className="text-xs text-slate-400">{r.supplier_code} · {r.invoice_count} invoice(s)</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Invoiced</p>
                                        <p className="text-sm font-medium text-indigo-600">{fmt(r.total_invoiced)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Paid</p>
                                        <p className="text-sm font-medium text-green-600">{fmt(r.total_paid)}</p>
                                    </div>
                                    <div className="text-right min-w-24">
                                        <p className="text-xs text-slate-400">Balance</p>
                                        <p className="text-base font-bold text-red-600">{fmt(r.balance)}</p>
                                    </div>
                                    <span className={`text-slate-400 transition-transform ${expanded[r.supplier_id] ? 'rotate-180' : ''}`}>▾</span>
                                </div>
                            </button>
                            {expanded[r.supplier_id] && (
                                <div className="px-6 pb-4">
                                    <table className="w-full text-xs text-left bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden">
                                        <thead className="text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold">Invoice #</th>
                                                <th className="px-4 py-2 font-semibold">Date</th>
                                                <th className="px-4 py-2 font-semibold">Due</th>
                                                <th className="px-4 py-2 font-semibold text-right">Amount</th>
                                                <th className="px-4 py-2 font-semibold text-right">Paid</th>
                                                <th className="px-4 py-2 font-semibold text-right text-red-500">Balance</th>
                                                <th className="px-4 py-2 font-semibold">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {r.invoices.map((inv, j) => (
                                                <tr key={j} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <td className="px-4 py-2 font-mono">{inv.invoice_number}</td>
                                                    <td className="px-4 py-2">{inv.invoice_date || '—'}</td>
                                                    <td className="px-4 py-2">{inv.due_date || '—'}</td>
                                                    <td className="px-4 py-2 text-right text-indigo-600">{fmt(inv.total_amount)}</td>
                                                    <td className="px-4 py-2 text-right text-green-600">{fmt(inv.amount_paid)}</td>
                                                    <td className="px-4 py-2 text-right text-red-600 font-bold">{fmt(inv.balance)}</td>
                                                    <td className="px-4 py-2">
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{inv.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SupplierBalancesReport;
