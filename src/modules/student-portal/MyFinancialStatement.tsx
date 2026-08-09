import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Download, FileText, Loader2, ChevronDown, ChevronUp,
    Printer, ToggleLeft, ToggleRight,
} from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);

const fmtDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ── Printable Statement ──────────────────────────────── */
const PrintableStatement = React.forwardRef(({ data, statementType }, ref) => {
    const { student_name, admission_number, summary, entries } = data;
    const today = new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <div ref={ref} className="print-statement" style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#222', padding: '10mm 15mm' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 'bold', margin: 0 }}>STUDENT FINANCIAL STATEMENT</h2>
                <p style={{ fontSize: 11, color: '#666', margin: '4px 0' }}>
                    {statementType === 'detailed' ? 'Detailed Statement' : 'Summary Statement'}
                </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 12 }}>
                <div>
                    <p style={{ margin: '2px 0' }}><strong>Student:</strong> {student_name}</p>
                    <p style={{ margin: '2px 0' }}><strong>Admission No:</strong> {admission_number}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '2px 0' }}><strong>Date Printed:</strong> {today}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 16 }}>
                <thead>
                    <tr style={{ background: '#f3f4f6' }}>
                        <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Date</th>
                        <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Description</th>
                        <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Reference</th>
                        <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>Debit (KES)</th>
                        <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>Credit (KES)</th>
                        <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'right' }}>Balance (KES)</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((e, i) => (
                        <React.Fragment key={i}>
                            <tr style={{ background: e.type === 'RECEIPT' ? '#f0fdf4' : '#fff' }}>
                                <td style={{ border: '1px solid #d1d5db', padding: '5px 8px' }}>{fmtDate(e.date)}</td>
                                <td style={{ border: '1px solid #d1d5db', padding: '5px 8px' }}>{e.description}</td>
                                <td style={{ border: '1px solid #d1d5db', padding: '5px 8px' }}>{e.reference}</td>
                                <td style={{ border: '1px solid #d1d5db', padding: '5px 8px', textAlign: 'right' }}>{e.debit > 0 ? fmtCurrency(e.debit) : ''}</td>
                                <td style={{ border: '1px solid #d1d5db', padding: '5px 8px', textAlign: 'right' }}>{e.credit > 0 ? fmtCurrency(e.credit) : ''}</td>
                                <td style={{ border: '1px solid #d1d5db', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold' }}>{fmtCurrency(e.balance)}</td>
                            </tr>
                            {statementType === 'detailed' && e.items?.length > 0 && e.items.map((item, j) => (
                                <tr key={`${i}-${j}`} style={{ background: '#fafbff' }}>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '3px 8px 3px 24px', fontSize: 10, color: '#666' }} colSpan={3}>
                                        ↳ {item.vote_head || item.description}
                                    </td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '3px 8px', textAlign: 'right', fontSize: 10, color: '#666' }}>{fmtCurrency(item.amount)}</td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '3px 8px' }} colSpan={2}></td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

            <div style={{ borderTop: '2px solid #111', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <div><strong>Total Invoiced:</strong> {fmtCurrency(summary.total_invoiced)}</div>
                <div><strong>Total Paid:</strong> {fmtCurrency(summary.total_paid)}</div>
                <div style={{ fontSize: 14 }}><strong>Net Balance:</strong> {fmtCurrency(summary.net_balance)}</div>
            </div>
            {summary.prepayment_credit > 0 && (
                <p style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                    * Includes prepayment credit of {fmtCurrency(summary.prepayment_credit)}
                </p>
            )}
        </div>
    );
});
PrintableStatement.displayName = 'PrintableStatement';


/* ── Main Component ───────────────────────────────────── */
const MyFinancialStatement = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statementType, setStatementType] = useState('summary');
    const [expandedRows, setExpandedRows] = useState({});
    const printRef = useRef(null);

    const loadStatement = async (type) => {
        setLoading(true);
        try {
            const res = await portalService.getStatement({ type });
            setData(res);
        } catch {
            toast.error('Failed to load financial statement');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStatement(statementType); }, [statementType]);

    const toggleType = () => {
        const next = statementType === 'summary' ? 'detailed' : 'summary';
        setStatementType(next);
        setExpandedRows({});
    };

    const toggleRow = (i) => setExpandedRows(prev => ({ ...prev, [i]: !prev[i] }));

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Financial Statement</title>
            <style>
                body { margin: 0; font-family: Georgia, serif; }
                @media print { body { margin: 0; } }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; }
            </style></head>
            <body>${content.innerHTML}</body></html>
        `);
        win.document.close();
        win.focus();
        win.print();
    };

    if (loading) {
        return (
            <StudentLayout title="Financial Statement">
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            </StudentLayout>
        );
    }

    const summary = data?.summary || {};
    const entries = data?.entries || [];

    return (
        <StudentLayout title="Financial Statement">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 p-1">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Financial Statement</h2>
                        <p className="text-sm text-gray-500">
                            {data?.student_name} &bull; {data?.admission_number}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleType}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                        >
                            {statementType === 'summary' ? <ToggleLeft size={18} /> : <ToggleRight size={18} className="text-indigo-600" />}
                            {statementType === 'summary' ? 'Summary' : 'Detailed'}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                            <Download size={16} /> Download
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-[10px] font-medium text-gray-400 uppercase">Total Invoiced</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{fmtCurrency(summary.total_invoiced)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-[10px] font-medium text-gray-400 uppercase">Total Paid</p>
                        <p className="text-xl font-bold text-green-600 mt-1">{fmtCurrency(summary.total_paid)}</p>
                    </div>
                    {summary.prepayment_credit > 0 && (
                        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                            <p className="text-[10px] font-medium text-blue-500 uppercase">Prepayment Credit</p>
                            <p className="text-xl font-bold text-blue-600 mt-1">{fmtCurrency(summary.prepayment_credit)}</p>
                        </div>
                    )}
                    <div className={`rounded-xl border p-4 ${summary.net_balance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <p className="text-[10px] font-medium text-gray-500 uppercase">Net Balance</p>
                        <p className={`text-xl font-bold mt-1 ${summary.net_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {fmtCurrency(summary.net_balance)}
                        </p>
                    </div>
                </div>

                {/* Statement Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <th className="text-left px-4 py-3 font-medium">Date</th>
                                    <th className="text-left px-4 py-3 font-medium">Description</th>
                                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Reference</th>
                                    <th className="text-right px-4 py-3 font-medium">Debit</th>
                                    <th className="text-right px-4 py-3 font-medium">Credit</th>
                                    <th className="text-right px-4 py-3 font-medium">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                            <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry, i) => (
                                        <React.Fragment key={i}>
                                            <tr
                                                className={`${entry.type === 'RECEIPT' ? 'bg-green-50/40' : 'hover:bg-gray-50/50'} ${entry.items?.length > 0 ? 'cursor-pointer' : ''}`}
                                                onClick={() => entry.items?.length > 0 && toggleRow(i)}
                                            >
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(entry.date)}</td>
                                                <td className="px-4 py-3 text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${entry.type === 'INVOICE' ? 'bg-amber-400' : 'bg-green-400'}`} />
                                                        <span className="font-medium">{entry.description}</span>
                                                        {entry.items?.length > 0 && (
                                                            expandedRows[i]
                                                                ? <ChevronUp size={14} className="text-gray-400" />
                                                                : <ChevronDown size={14} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{entry.reference}</td>
                                                <td className="px-4 py-3 text-right font-medium text-red-600">
                                                    {entry.debit > 0 ? fmtCurrency(entry.debit) : ''}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-green-600">
                                                    {entry.credit > 0 ? fmtCurrency(entry.credit) : ''}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">{fmtCurrency(entry.balance)}</td>
                                            </tr>
                                            {expandedRows[i] && entry.items?.map((item, j) => (
                                                <tr key={`${i}-${j}`} className="bg-indigo-50/30">
                                                    <td className="px-4 py-2" />
                                                    <td className="px-4 py-2 pl-10 text-xs text-gray-600" colSpan={2}>
                                                        ↳ {item.vote_head || item.description}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-xs text-gray-600">{fmtCurrency(item.amount)}</td>
                                                    <td className="px-4 py-2" colSpan={2} />
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                            {entries.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold text-sm">
                                        <td className="px-4 py-3" colSpan={3}>TOTALS</td>
                                        <td className="px-4 py-3 text-right text-red-700">{fmtCurrency(summary.total_invoiced)}</td>
                                        <td className="px-4 py-3 text-right text-green-700">{fmtCurrency(summary.total_paid)}</td>
                                        <td className="px-4 py-3 text-right text-gray-900">{fmtCurrency(summary.net_balance)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* Hidden printable */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <PrintableStatement ref={printRef} data={data || { summary: {}, entries: [] }} statementType={statementType} />
                </div>
            </motion.div>
        </StudentLayout>
    );
};

export default MyFinancialStatement;
