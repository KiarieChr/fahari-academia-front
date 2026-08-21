import React from 'react';
import { Eye, Printer, MoreVertical, Mail, AlertCircle } from 'lucide-react';
import { formatKES, getInvoiceStatusBadge } from '../utils/invoiceUtils';

const InvoiceTable = ({ invoices, onView, onPrint, onEmail }) => {

    if (!invoices || invoices.length === 0) {
        return (
            <div className="neo-card p-12 flex flex-col items-center justify-center">
                <AlertCircle size={48} className="text-gray-300 mb-4" />
                <h5 className="text-gray-500 font-bold mb-2">No Invoices Found</h5>
                <p className="text-gray-400 text-sm font-bold">Adjust filters or generate new invoices to see data.</p>
            </div>
        );
    }

    // A helper to map status to tailwind colors for our badges
    const getStatusStyle = (status) => {
        const lower = (status || '').toLowerCase();
        if (lower === 'paid') return 'text-emerald-500 bg-emerald-50';
        if (lower === 'partial') return 'text-amber-500 bg-amber-50';
        if (lower === 'overdue') return 'text-rose-500 bg-rose-50';
        return 'text-gray-500 bg-gray-100';
    };

    return (
        <div className="neo-card p-0 overflow-hidden mb-6">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest w-12 text-center">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                            </th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Invoice #</th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Class / Term</th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Paid</th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Balance</th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="transition-colors hover:bg-gray-50/50 group">
                                <td className="p-4 border-b border-gray-100 text-center">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                </td>
                                <td className="p-4 border-b border-gray-100">
                                    <span className="font-black text-indigo-600 cursor-pointer hover:underline" onClick={() => onView(invoice)}>
                                        {invoice.invoiceNumber || invoice.id}
                                    </span>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        {new Date(invoice.dateIssued).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="p-4 border-b border-gray-100">
                                    <div className="font-bold text-gray-700">{invoice.studentName}</div>
                                    <div className="text-[10px] text-gray-400 font-bold tracking-widest">{invoice.admissionNumber}</div>
                                </td>
                                <td className="p-4 border-b border-gray-100">
                                    <div className="font-bold text-gray-700">{invoice.className}</div>
                                    <div className="flex gap-2 items-center mt-1">
                                        <span className="text-[10px] text-gray-500 font-bold tracking-widest">{invoice.term}</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-black text-gray-600">{invoice.year}</span>
                                    </div>
                                </td>
                                <td className="p-4 border-b border-gray-100 text-right font-black text-gray-600">{formatKES(invoice.totalAmount)}</td>
                                <td className="p-4 border-b border-gray-100 text-right font-black text-emerald-500">{formatKES(invoice.paidAmount)}</td>
                                <td className="p-4 border-b border-gray-100 text-right">
                                    <span className={invoice.balance > 0 ? 'text-rose-500 font-black' : 'text-gray-400 font-bold'}>
                                        {formatKES(invoice.balance)}
                                    </span>
                                </td>
                                <td className="p-4 border-b border-gray-100">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusStyle(invoice.status)}`}>
                                        {invoice.status}
                                    </span>
                                </td>
                                <td className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="neo-btn p-2 text-gray-400 hover:text-indigo-600" onClick={() => onView(invoice)} title="View">
                                            <Eye size={14} />
                                        </button>
                                        <button className="neo-btn p-2 text-gray-400 hover:text-indigo-600" onClick={() => onPrint(invoice)} title="Print">
                                            <Printer size={14} />
                                        </button>
                                        <button className="neo-btn p-2 text-gray-400 hover:text-indigo-600" onClick={() => onEmail(invoice)} title="Email">
                                            <Mail size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-500 bg-gray-50/30">
                <div>Showing {invoices.length} invoices</div>
                <div className="flex gap-2">
                    <button className="neo-btn px-4 py-2 text-xs uppercase tracking-widest text-gray-400 cursor-not-allowed">Previous</button>
                    <button className="neo-btn neo-btn-accent px-4 py-2 text-xs font-black">1</button>
                    <button className="neo-btn px-4 py-2 text-xs font-black">2</button>
                    <button className="neo-btn px-4 py-2 text-xs uppercase tracking-widest">Next</button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;
