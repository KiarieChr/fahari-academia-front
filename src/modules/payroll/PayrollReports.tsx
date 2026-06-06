import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FileText, Download, Printer, Search, Filter, ChevronDown,
    ChevronRight, DollarSign, Building2, CreditCard, Users,
    TrendingDown, TrendingUp, Loader2, Calendar, Eye, Mail,
    ClipboardList, ArrowUpDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { payrollService } from '../../services/payrollService';

// ============================================================================
// UTILITIES
// ============================================================================
const fmt = (amount) => {
    if (!amount || amount === '0.00') return '-';
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount);
};

const fmtDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ============================================================================
// PERIOD SELECTOR (shared)
// ============================================================================
const PeriodSelector = ({ periods, selected, onChange }) => (
    <div className="flex items-center gap-2">
        <Calendar size={16} className="text-gray-400" />
        <select
            value={selected || ''}
            onChange={e => onChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 min-w-[240px]"
        >
            <option value="">All Periods</option>
            {periods.map(p => (
                <option key={p.id} value={p.id}>{p.period_name}</option>
            ))}
        </select>
    </div>
);

// ============================================================================
// 1. PAYROLL REGISTER TAB
// ============================================================================
const PayrollRegisterTab = ({ calculations, loading, periods, selectedPeriod, onPeriodChange }) => {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('employee_name');
    const [sortDir, setSortDir] = useState('asc');
    const printRef = useRef();

    const filtered = calculations
        .filter(c => {
            const q = search.toLowerCase();
            return !q || (c.employee_name || '').toLowerCase().includes(q) ||
                (c.employee_no || '').toLowerCase().includes(q) ||
                (c.department_name || '').toLowerCase().includes(q);
        })
        .sort((a, b) => {
            let va = a[sortField], vb = b[sortField];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const totals = filtered.reduce((acc, c) => ({
        basic: acc.basic + parseFloat(c.basic_salary || 0),
        gross: acc.gross + parseFloat(c.gross_pay || 0),
        deductions: acc.deductions + parseFloat(c.total_deductions || 0),
        tax: acc.tax + parseFloat(c.tax_amount || 0),
        net: acc.net + parseFloat(c.net_pay || 0),
    }), { basic: 0, gross: 0, deductions: 0, tax: 0, net: 0 });

    const handleExportCSV = () => {
        const headers = ['Employee No', 'Name', 'Department', 'Basic Salary', 'Gross Pay', 'PAYE', 'Deductions', 'Net Pay'];
        const rows = filtered.map(c => [
            c.employee_no, c.employee_name, c.department_name,
            c.basic_salary, c.gross_pay, c.tax_amount, c.total_deductions, c.net_pay
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `payroll_register_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        toast.success('Payroll register exported');
    };

    const SortHeader = ({ field, children, className = '' }) => (
        <th
            className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none ${className}`}
            onClick={() => toggleSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown size={12} className={sortField === field ? 'text-blue-500' : 'text-gray-300'} />
            </div>
        </th>
    );

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" placeholder="Search employee..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <PeriodSelector periods={periods} selected={selectedPeriod} onChange={onPeriodChange} />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                        <Download size={14} /> Export CSV
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all">
                        <Printer size={14} /> Print
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Employees', value: filtered.length, icon: Users, color: 'blue' },
                    { label: 'Total Basic', value: fmt(totals.basic), icon: DollarSign, color: 'gray' },
                    { label: 'Gross Pay', value: fmt(totals.gross), icon: TrendingUp, color: 'green' },
                    { label: 'Total Deductions', value: fmt(totals.deductions), icon: TrendingDown, color: 'red' },
                    { label: 'Net Pay', value: fmt(totals.net), icon: CreditCard, color: 'indigo' },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <c.icon size={14} className={`text-${c.color}-500`} />
                            <span className="text-xs text-gray-500 font-medium">{c.label}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto print-area" ref={printRef}>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <SortHeader field="employee_no" className="text-left">No.</SortHeader>
                            <SortHeader field="employee_name" className="text-left">Employee</SortHeader>
                            <SortHeader field="department_name" className="text-left">Department</SortHeader>
                            <SortHeader field="basic_salary" className="text-right">Basic</SortHeader>
                            <SortHeader field="total_allowances" className="text-right">Allowances</SortHeader>
                            <SortHeader field="gross_pay" className="text-right">Gross</SortHeader>
                            <SortHeader field="tax_amount" className="text-right">PAYE</SortHeader>
                            <SortHeader field="total_deductions" className="text-right">Deductions</SortHeader>
                            <SortHeader field="net_pay" className="text-right">Net Pay</SortHeader>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={9} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-500" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={9} className="py-12 text-center text-gray-400 text-sm">No payroll data found. Process a payroll period first.</td></tr>
                        ) : (
                            <>
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.employee_no}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{c.employee_name}</td>
                                        <td className="px-4 py-3 text-gray-500">{c.department_name || '-'}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.basic_salary)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_allowances)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(c.gross_pay)}</td>
                                        <td className="px-4 py-3 text-right text-red-600">{fmt(c.tax_amount)}</td>
                                        <td className="px-4 py-3 text-right text-red-600">{fmt(c.total_deductions)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-700">{fmt(c.net_pay)}</td>
                                    </tr>
                                ))}
                                {/* Totals row */}
                                <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                                    <td colSpan={3} className="px-4 py-3 text-gray-700 uppercase text-xs">Totals ({filtered.length} employees)</td>
                                    <td className="px-4 py-3 text-right text-gray-800">{fmt(totals.basic)}</td>
                                    <td className="px-4 py-3 text-right text-gray-800">{fmt(totals.gross - totals.basic)}</td>
                                    <td className="px-4 py-3 text-right text-gray-800">{fmt(totals.gross)}</td>
                                    <td className="px-4 py-3 text-right text-red-700">{fmt(totals.tax)}</td>
                                    <td className="px-4 py-3 text-right text-red-700">{fmt(totals.deductions)}</td>
                                    <td className="px-4 py-3 text-right text-green-800">{fmt(totals.net)}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ============================================================================
// 2. BANK INSTRUCTIONS TAB
// ============================================================================
const BankInstructionsTab = ({ calculations, loading, periods, selectedPeriod, onPeriodChange }) => {
    const [search, setSearch] = useState('');

    const bankData = calculations
        .filter(c => c.net_pay > 0)
        .filter(c => {
            const q = search.toLowerCase();
            return !q || (c.employee_name || '').toLowerCase().includes(q) || (c.employee_no || '').toLowerCase().includes(q);
        });

    // Group by bank
    const byBank = {};
    bankData.forEach(c => {
        const bank = c.bank_name || 'Unknown Bank';
        if (!byBank[bank]) byBank[bank] = { items: [], total: 0 };
        byBank[bank].items.push(c);
        byBank[bank].total += parseFloat(c.net_pay || 0);
    });

    const grandTotal = bankData.reduce((s, c) => s + parseFloat(c.net_pay || 0), 0);

    const handleExportCSV = () => {
        const headers = ['Employee No', 'Employee Name', 'Bank', 'Account Number', 'Net Pay', 'Payment Method'];
        const rows = bankData.map(c => [
            c.employee_no, c.employee_name, c.bank_name || 'N/A',
            c.bank_account_number || 'N/A', c.net_pay, c.payment_method
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `bank_instructions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        toast.success('Bank instructions exported');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <PeriodSelector periods={periods} selected={selectedPeriod} onChange={onPeriodChange} />
                </div>
                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    <Download size={14} /> Export CSV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Total Transfers</p>
                    <p className="text-xl font-bold text-gray-800">{bankData.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Banks</p>
                    <p className="text-xl font-bold text-gray-800">{Object.keys(byBank).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Total Amount</p>
                    <p className="text-xl font-bold text-green-700">{fmt(grandTotal)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bank</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Account No.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Net Pay</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-500" /></td></tr>
                        ) : bankData.length === 0 ? (
                            <tr><td colSpan={6} className="py-12 text-center text-gray-400 text-sm">No payment data available</td></tr>
                        ) : (
                            <>
                                {bankData.map(c => (
                                    <tr key={c.id} className="hover:bg-blue-50/30">
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.employee_no}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{c.employee_name}</td>
                                        <td className="px-4 py-3 text-gray-600">{c.bank_name || '-'}</td>
                                        <td className="px-4 py-3 font-mono text-gray-600">{c.bank_account_number || '-'}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                {(c.payment_method || 'bank_transfer').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-green-700">{fmt(c.net_pay)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                                    <td colSpan={5} className="px-4 py-3 text-gray-700 uppercase text-xs">Grand Total</td>
                                    <td className="px-4 py-3 text-right text-green-800">{fmt(grandTotal)}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ============================================================================
// 3. PAYSLIPS TAB
// ============================================================================
const PayslipsTab = ({ calculations, loading, periods, selectedPeriod, onPeriodChange }) => {
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [breakdownData, setBreakdownData] = useState({});
    const [loadingBreakdown, setLoadingBreakdown] = useState(null);

    const filtered = calculations.filter(c => {
        const q = search.toLowerCase();
        return !q || (c.employee_name || '').toLowerCase().includes(q) || (c.employee_no || '').toLowerCase().includes(q);
    });

    const loadBreakdown = async (calcId) => {
        if (breakdownData[calcId]) {
            setExpandedId(expandedId === calcId ? null : calcId);
            return;
        }
        setLoadingBreakdown(calcId);
        try {
            const data = await payrollService.getCalculationBreakdown(calcId);
            setBreakdownData(prev => ({ ...prev, [calcId]: data }));
            setExpandedId(calcId);
        } catch {
            toast.error('Failed to load breakdown');
        } finally {
            setLoadingBreakdown(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search employee..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <PeriodSelector periods={periods} selected={selectedPeriod} onChange={onPeriodChange} />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No payslip data available</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(c => {
                        const bd = breakdownData[c.id];
                        const isExpanded = expandedId === c.id;
                        return (
                            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div
                                    className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    onClick={() => loadBreakdown(c.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {(c.employee_name || '?')[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{c.employee_name}</p>
                                            <p className="text-xs text-gray-400">{c.employee_no} · {c.department_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Gross</p>
                                            <p className="font-semibold text-gray-700">{fmt(c.gross_pay)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Net Pay</p>
                                            <p className="font-bold text-green-700 text-lg">{fmt(c.net_pay)}</p>
                                        </div>
                                        {loadingBreakdown === c.id ? (
                                            <Loader2 size={16} className="animate-spin text-blue-500" />
                                        ) : (
                                            <ChevronRight size={16} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                        )}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {isExpanded && bd && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 border-t border-gray-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                    {/* Earnings */}
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                                            <TrendingUp size={12} className="text-green-500" /> Earnings
                                                        </h4>
                                                        <div className="space-y-1.5">
                                                            {(bd.earnings || []).map((e, i) => (
                                                                <div key={i} className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">{e.description}</span>
                                                                    <span className="font-medium text-gray-800">{fmt(e.amount)}</span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1.5">
                                                                <span className="text-gray-700">Gross Pay</span>
                                                                <span className="text-gray-900">{fmt(bd.summary?.gross_pay)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Deductions */}
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                                                            <TrendingDown size={12} className="text-red-500" /> Deductions
                                                        </h4>
                                                        <div className="space-y-1.5">
                                                            {(bd.deductions || []).map((d, i) => (
                                                                <div key={i} className="flex justify-between text-sm">
                                                                    <span className="text-gray-600">{d.description}</span>
                                                                    <span className="font-medium text-red-600">{fmt(d.amount)}</span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1.5">
                                                                <span className="text-gray-700">Total Deductions</span>
                                                                <span className="text-red-700">{fmt(bd.summary?.total_deductions)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Net */}
                                                <div className="mt-4 p-3 bg-green-50 rounded-lg flex justify-between items-center">
                                                    <span className="font-bold text-green-800">NET PAY</span>
                                                    <span className="text-xl font-bold text-green-800">{fmt(bd.summary?.net_pay)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// 4. DEDUCTION REPORT TAB
// ============================================================================
const DeductionReportTab = ({ calculations, loading, periods, selectedPeriod, onPeriodChange }) => {
    const [search, setSearch] = useState('');

    const filtered = calculations.filter(c => {
        const q = search.toLowerCase();
        return !q || (c.employee_name || '').toLowerCase().includes(q) || (c.employee_no || '').toLowerCase().includes(q);
    });

    const totals = filtered.reduce((acc, c) => ({
        paye: acc.paye + parseFloat(c.tax_amount || 0),
        pension_ee: acc.pension_ee + parseFloat(c.pension_employee || 0),
        pension_er: acc.pension_er + parseFloat(c.pension_employer || 0),
        statutory: acc.statutory + parseFloat(c.total_statutory_deductions || 0),
        voluntary: acc.voluntary + parseFloat(c.total_voluntary_deductions || 0),
        loans: acc.loans + parseFloat(c.total_loan_deductions || 0),
        total: acc.total + parseFloat(c.total_deductions || 0),
    }), { paye: 0, pension_ee: 0, pension_er: 0, statutory: 0, voluntary: 0, loans: 0, total: 0 });

    const handleExportCSV = () => {
        const headers = ['Employee No', 'Name', 'PAYE', 'Pension (EE)', 'Pension (ER)', 'Statutory', 'Voluntary', 'Loans', 'Total'];
        const rows = filtered.map(c => [
            c.employee_no, c.employee_name, c.tax_amount, c.pension_employee, c.pension_employer,
            c.total_statutory_deductions, c.total_voluntary_deductions, c.total_loan_deductions, c.total_deductions
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `deduction_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        toast.success('Deduction report exported');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <PeriodSelector periods={periods} selected={selectedPeriod} onChange={onPeriodChange} />
                </div>
                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'PAYE', value: fmt(totals.paye), color: 'red' },
                    { label: 'Pension (EE)', value: fmt(totals.pension_ee), color: 'orange' },
                    { label: 'Statutory', value: fmt(totals.statutory), color: 'purple' },
                    { label: 'Total Deductions', value: fmt(totals.total), color: 'gray' },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                        <p className={`text-lg font-bold text-${c.color}-700`}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">PAYE</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Pension (EE)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Pension (ER)</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Statutory</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Voluntary</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Loans</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={9} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-500" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={9} className="py-12 text-center text-gray-400 text-sm">No deduction data</td></tr>
                        ) : (
                            <>
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-blue-50/30">
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.employee_no}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{c.employee_name}</td>
                                        <td className="px-4 py-3 text-right text-red-600">{fmt(c.tax_amount)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.pension_employee)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.pension_employer)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_statutory_deductions)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_voluntary_deductions)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_loan_deductions)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-red-700">{fmt(c.total_deductions)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                                    <td colSpan={2} className="px-4 py-3 text-gray-700 uppercase text-xs">Totals</td>
                                    <td className="px-4 py-3 text-right text-red-700">{fmt(totals.paye)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.pension_ee)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.pension_er)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.statutory)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.voluntary)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.loans)}</td>
                                    <td className="px-4 py-3 text-right text-red-800">{fmt(totals.total)}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ============================================================================
// 5. EARNINGS REPORT TAB
// ============================================================================
const EarningsReportTab = ({ calculations, loading, periods, selectedPeriod, onPeriodChange }) => {
    const [search, setSearch] = useState('');

    const filtered = calculations.filter(c => {
        const q = search.toLowerCase();
        return !q || (c.employee_name || '').toLowerCase().includes(q) || (c.employee_no || '').toLowerCase().includes(q);
    });

    const totals = filtered.reduce((acc, c) => ({
        basic: acc.basic + parseFloat(c.basic_salary || 0),
        allowances: acc.allowances + parseFloat(c.total_allowances || 0),
        overtime: acc.overtime + parseFloat(c.total_overtime || 0),
        bonuses: acc.bonuses + parseFloat(c.total_bonuses || 0),
        total: acc.total + parseFloat(c.total_earnings || 0),
        gross: acc.gross + parseFloat(c.gross_pay || 0),
    }), { basic: 0, allowances: 0, overtime: 0, bonuses: 0, total: 0, gross: 0 });

    const handleExportCSV = () => {
        const headers = ['Employee No', 'Name', 'Basic Salary', 'Allowances', 'Overtime', 'Bonuses', 'Total Earnings', 'Gross Pay'];
        const rows = filtered.map(c => [
            c.employee_no, c.employee_name, c.basic_salary, c.total_allowances,
            c.total_overtime, c.total_bonuses, c.total_earnings, c.gross_pay
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `earnings_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
        toast.success('Earnings report exported');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <PeriodSelector periods={periods} selected={selectedPeriod} onChange={onPeriodChange} />
                </div>
                <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    <Download size={14} /> Export CSV
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Basic Salary', value: fmt(totals.basic), color: 'blue' },
                    { label: 'Allowances', value: fmt(totals.allowances), color: 'teal' },
                    { label: 'Overtime', value: fmt(totals.overtime), color: 'amber' },
                    { label: 'Total Gross', value: fmt(totals.gross), color: 'green' },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                        <p className={`text-lg font-bold text-${c.color}-700`}>{c.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No.</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Employee</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Basic</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Allowances</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Overtime</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Bonuses</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Earnings</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Gross Pay</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={8} className="py-12 text-center"><Loader2 size={24} className="animate-spin mx-auto text-blue-500" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={8} className="py-12 text-center text-gray-400 text-sm">No earnings data</td></tr>
                        ) : (
                            <>
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-blue-50/30">
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.employee_no}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{c.employee_name}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.basic_salary)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_allowances)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_overtime)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_bonuses)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(c.total_earnings)}</td>
                                        <td className="px-4 py-3 text-right font-bold text-green-700">{fmt(c.gross_pay)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                                    <td colSpan={2} className="px-4 py-3 text-gray-700 uppercase text-xs">Totals</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.basic)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.allowances)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.overtime)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.bonuses)}</td>
                                    <td className="px-4 py-3 text-right">{fmt(totals.total)}</td>
                                    <td className="px-4 py-3 text-right text-green-800">{fmt(totals.gross)}</td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN REPORTS PAGE
// ============================================================================
const PayrollReports = ({ noLayout = false }) => {
    const [activeTab, setActiveTab] = useState('register');
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [calculations, setCalculations] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'register', label: 'Payroll Register', icon: ClipboardList, desc: 'Full payroll summary' },
        { id: 'bank', label: 'Bank Instructions', icon: Building2, desc: 'Payment transfers' },
        { id: 'payslips', label: 'Payslips', icon: FileText, desc: 'Employee payslips' },
        { id: 'deductions', label: 'Deduction Report', icon: TrendingDown, desc: 'All deductions breakdown' },
        { id: 'earnings', label: 'Earnings Report', icon: TrendingUp, desc: 'All earnings breakdown' },
    ];

    const loadPeriods = useCallback(async () => {
        try {
            const data = await payrollService.getPayrollPeriods();
            const list = Array.isArray(data) ? data : data.results || [];
            setPeriods(list);
            // Auto-select latest calculated/approved/paid period
            const recent = list.find(p => ['calculated', 'approved', 'paid'].includes(p.status));
            if (recent && !selectedPeriod) setSelectedPeriod(String(recent.id));
        } catch {
            toast.error('Failed to load periods');
        }
    }, []);

    const loadCalculations = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedPeriod) params.payroll_period = selectedPeriod;
            const data = await payrollService.getPayrollCalculations(params);
            setCalculations(Array.isArray(data) ? data : data.results || []);
        } catch {
            toast.error('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => { loadPeriods(); }, [loadPeriods]);
    useEffect(() => { loadCalculations(); }, [loadCalculations]);

    const sharedProps = {
        calculations,
        loading,
        periods,
        selectedPeriod,
        onPeriodChange: setSelectedPeriod,
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'register': return <PayrollRegisterTab {...sharedProps} />;
            case 'bank': return <BankInstructionsTab {...sharedProps} />;
            case 'payslips': return <PayslipsTab {...sharedProps} />;
            case 'deductions': return <DeductionReportTab {...sharedProps} />;
            case 'earnings': return <EarningsReportTab {...sharedProps} />;
            default: return null;
        }
    };

    const content = (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Payroll Reports</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">View, export, and print payroll reports</p>
                </div>
                {selectedPeriod && (
                    <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        {periods.find(p => String(p.id) === selectedPeriod)?.period_name || 'Selected Period'}
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-100 bg-gray-50/50 flex flex-col overflow-y-auto">
                    <div className="p-4 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 group ${
                                    activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${
                                    activeTab === tab.id ? 'bg-blue-50' : 'bg-gray-100 group-hover:bg-white'
                                }`}>
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className={`block text-sm font-semibold ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {tab.label}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-medium">{tab.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50/10 overflow-y-auto relative p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Payroll Reports">
            {content}
        </DashboardLayout>
    );
};

export default PayrollReports;
