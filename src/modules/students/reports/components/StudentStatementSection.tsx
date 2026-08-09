import React, { useState } from 'react';
import { Loader2, Search, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { reportsService } from '../../../../services/reportsService';
import { toast } from 'react-toastify';

const fmtCurrency = (v) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v ?? 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const StudentStatementSection = ({ filters = {} }) => {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [statement, setStatement] = useState(null);
    const [loadingStatement, setLoadingStatement] = useState(false);
    const [printableRef] = useState(() => React.createRef());

    const handleSearch = async () => {
        if (!search.trim()) return;
        setSearching(true);
        try {
            const res = await reportsService.getStudentList({ search, page_size: 10 });
            setSearchResults(res.results || []);
        } catch {
            toast.error('Student search failed');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectStudent = async (student) => {
        setSelectedStudent(student);
        setSearchResults([]);
        setSearch(student.name);
        setLoadingStatement(true);
        try {
            const res = await reportsService.getStudentStatement({
                student_id: student.id,
                ...filters,
            });
            setStatement(res);
        } catch {
            toast.error('Failed to load statement');
        } finally {
            setLoadingStatement(false);
        }
    };

    const handlePrint = () => {
        const content = printableRef.current;
        if (!content) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Statement of Account — ${statement?.student?.name}</title>
            <style>body{margin:20px;font-family:Georgia,serif;font-size:12px;}
            table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;}
            thead{background:#f3f4f6;}tfoot{font-weight:bold;background:#f9fafb;}
            .credit{color:#16a34a;}.debit{color:#dc2626;}</style></head>
            <body>${content.innerHTML}</body></html>
        `);
        win.document.close();
        win.focus();
        win.print();
    };

    const summary = statement?.summary || {};
    const entries = statement?.entries || [];

    return (
        <div className="space-y-5 animate-in fade-in duration-500">
            {/* Search Box */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 dark:text-white mb-3">Search Student</h3>
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Student name or admission number..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
                                {searchResults.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelectStudent(s)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {s.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{s.name}</p>
                                            <p className="text-xs text-slate-400">{s.admission_number}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={searching}
                        className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                        {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                    </button>
                </div>
            </div>

            {loadingStatement && (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={28} /></div>
            )}

            {!loadingStatement && statement && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Invoiced', value: fmtCurrency(summary.total_invoiced), color: 'text-indigo-600' },
                            { label: 'Total Paid', value: fmtCurrency(summary.total_paid), color: 'text-green-600' },
                            { label: 'Prepayment Credit', value: fmtCurrency(summary.prepayment_credit), color: 'text-blue-600' },
                            { label: 'Net Balance', value: fmtCurrency(summary.net_balance), color: summary.net_balance > 0 ? 'text-red-600' : 'text-green-600' },
                        ].map((c) => (
                            <div key={c.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                <p className="text-xs text-slate-400 uppercase font-medium">{c.label}</p>
                                <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Statement Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white">
                                    Statement — {statement.student?.name}
                                </h3>
                                <p className="text-xs text-slate-400">{statement.student?.admission_number}</p>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FileText size={13} /> Print / Download
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Date</th>
                                        <th className="px-5 py-3 font-semibold">Type</th>
                                        <th className="px-5 py-3 font-semibold">Reference</th>
                                        <th className="px-5 py-3 font-semibold">Description</th>
                                        <th className="px-5 py-3 font-semibold text-right text-red-500">Debit</th>
                                        <th className="px-5 py-3 font-semibold text-right text-green-600">Credit</th>
                                        <th className="px-5 py-3 font-semibold text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {entries.length === 0 ? (
                                        <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                            <AlertCircle size={28} className="mx-auto mb-2 opacity-40" />No transactions
                                        </td></tr>
                                    ) : entries.map((e, i) => (
                                        <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${e.type === 'RECEIPT' ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">{fmtDate(e.date)}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.type === 'INVOICE' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                    {e.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-500">{e.reference}</td>
                                            <td className="px-5 py-3 text-slate-800 dark:text-slate-200">{e.description}</td>
                                            <td className="px-5 py-3 text-right text-red-600 font-medium">{e.debit > 0 ? fmtCurrency(e.debit) : ''}</td>
                                            <td className="px-5 py-3 text-right text-green-600 font-medium">{e.credit > 0 ? fmtCurrency(e.credit) : ''}</td>
                                            <td className="px-5 py-3 text-right font-bold text-slate-800 dark:text-slate-200">{fmtCurrency(e.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50 dark:bg-slate-900 text-sm font-bold">
                                        <td colSpan={4} className="px-5 py-3 text-slate-700 dark:text-slate-300">TOTALS</td>
                                        <td className="px-5 py-3 text-right text-red-600">{fmtCurrency(summary.total_invoiced)}</td>
                                        <td className="px-5 py-3 text-right text-green-600">{fmtCurrency(summary.total_paid)}</td>
                                        <td className="px-5 py-3 text-right text-slate-900 dark:text-white">{fmtCurrency(summary.net_balance)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Hidden printable */}
                    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                        <div ref={printableRef}>
                            <h2 style={{ textAlign: 'center' }}>STATEMENT OF ACCOUNT</h2>
                            <p><strong>Student:</strong> {statement.student?.name} | <strong>Adm No:</strong> {statement.student?.admission_number}</p>
                            <table>
                                <thead><tr>
                                    <th>Date</th><th>Type</th><th>Reference</th><th>Description</th>
                                    <th>Debit</th><th>Credit</th><th>Balance</th>
                                </tr></thead>
                                <tbody>
                                    {entries.map((e, i) => (
                                        <tr key={i}>
                                            <td>{fmtDate(e.date)}</td>
                                            <td>{e.type}</td>
                                            <td>{e.reference}</td>
                                            <td>{e.description}</td>
                                            <td className="debit" style={{ textAlign: 'right' }}>{e.debit > 0 ? fmtCurrency(e.debit) : ''}</td>
                                            <td className="credit" style={{ textAlign: 'right' }}>{e.credit > 0 ? fmtCurrency(e.credit) : ''}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{fmtCurrency(e.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot><tr>
                                    <td colSpan={4}>TOTALS</td>
                                    <td style={{ textAlign: 'right' }}>{fmtCurrency(summary.total_invoiced)}</td>
                                    <td style={{ textAlign: 'right' }}>{fmtCurrency(summary.total_paid)}</td>
                                    <td style={{ textAlign: 'right' }}>{fmtCurrency(summary.net_balance)}</td>
                                </tr></tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {!loadingStatement && !statement && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-16 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Search for a student to view their statement</p>
                </div>
            )}
        </div>
    );
};

export default StudentStatementSection;
