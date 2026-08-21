import React, { useState, useEffect } from 'react';
import { Printer, Download, Mail, X, FileText, AlertTriangle } from 'lucide-react';
import { formatKES, getInvoiceStatusBadge } from '../utils/invoiceUtils';
import { api } from '../../../../services/apiClient';

const InvoiceDetailsModal = ({ show, onClose, invoice }) => {
    const [institution, setInstitution] = useState({
        name: 'FAHARI ACADEMY',
        address: 'P.O. Box 12345, Nairobi',
        contact: 'info@fahari.co.ke | +254 700 000 000'
    });

    useEffect(() => {
        if (show) {
            api.get('/api/institution/')
                .then(res => {
                    if (res) {
                        setInstitution({
                            name: res.name || 'FAHARI ACADEMY',
                            address: res.address || 'P.O. Box 12345, Nairobi',
                            contact: `${res.email || ''} | ${res.phone_number || ''}`
                        });
                    }
                })
                .catch(err => console.log('Error fetching institution:', err));
        }
    }, [show]);

    if (!show || !invoice) return null;

    return (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl my-8">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h5 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                        <FileText size={20} className="text-indigo-500" />
                        Invoice {invoice.id}
                    </h5>
                    <button type="button" className="text-gray-400 hover:text-rose-500 transition-colors" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Header / School Info */}
                    <div className="flex flex-col md:flex-row justify-between mb-3 pb-2 border-b border-gray-100">
                        <div>
                            <h4 className="text-2xl font-black text-indigo-600 mb-2 uppercase">{institution.name}</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{institution.address}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{institution.contact}</p>
                        </div>
                        <div className="text-right mt-6 md:mt-0">
                            <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest">INVOICE</h2>
                            <div className="mt-3">
                                <span className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase bg-${getInvoiceStatusBadge(invoice.status)} text-gray-700 shadow-sm border border-gray-100`}>
                                    {invoice.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bill To & Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-2 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <div>
                            <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Bill To:</h6>
                            <h5 className="text-lg font-black text-gray-700 mb-1">{invoice.studentName}</h5>
                            <p className="text-sm font-bold text-gray-500">Adm No: {invoice.admissionNumber}</p>
                            <p className="text-sm font-bold text-gray-500">Class: {invoice.className}</p>
                        </div>
                        <div className="md:text-right">
                            <div className="mb-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">Date Issued:</span>
                                <span className="text-sm font-bold text-gray-700">{new Date(invoice.dateIssued).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">Due Date:</span>
                                <span className="text-sm font-bold text-gray-700">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-3">Term:</span>
                                <span className="text-sm font-bold text-gray-700">{invoice.term} {invoice.year}</span>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 mb-8 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16 text-center">#</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Account</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                    <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 border-b border-gray-100 text-center font-bold text-gray-500">{index + 1}</td>
                                        <td className="p-4 border-b border-gray-100 font-bold text-gray-700 text-xs">
                                            {item.gl_account || item.fee_item_name || 'N/A'}
                                        </td>
                                        <td className="p-4 border-b border-gray-100 text-right font-black text-gray-600">{formatKES(item.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="2" className="p-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-100">Total Amount</td>
                                    <td className="p-4 text-right font-black text-gray-700 border-b border-gray-100">{formatKES(invoice.totalAmount)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="p-4 text-right text-xs font-black text-emerald-500 uppercase tracking-widest border-b border-gray-100">Amount Paid</td>
                                    <td className="p-4 text-right font-black text-emerald-500 border-b border-gray-100">-{formatKES(invoice.paidAmount)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="p-4 text-right text-sm font-black text-rose-500 uppercase tracking-widest bg-rose-50/50">Balance Due</td>
                                    <td className="p-4 text-right text-lg font-black text-rose-500 bg-rose-50/50">{formatKES(invoice.balance)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer Notes */}
                    <div className="bg-indigo-50/30 rounded-2xl shadow-sm border border-gray-100 p-4 border-l-4 border-l-indigo-500 mb-4">
                        <h6 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-2">Remarks / Payment Instructions:</h6>
                        <p className="text-sm font-bold text-indigo-600/80 m-0">
                            {invoice.remarks || 'Please pay via Bank Account: 1234567890 (KCB) or M-PESA Paybill: 123456.'}
                        </p>
                    </div>

                    <div className="text-center">
                        <small className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Generated by {invoice.generatedBy} on {new Date(invoice.dateIssued).toLocaleString()}
                        </small>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 border-t border-gray-100">
                    <div>
                        {invoice.status !== 'Paid' && (
                            <span className="flex items-center text-xs font-black text-rose-500 uppercase tracking-widest">
                                <AlertTriangle size={14} className="mr-2" />
                                Payment Overdue if past {new Date(invoice.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" className="neo-btn px-4 py-2 flex items-center gap-2 text-gray-500 hover:text-indigo-600">
                            <Printer size={16} /> Print
                        </button>
                        <button type="button" className="neo-btn px-4 py-2 flex items-center gap-2 text-gray-500 hover:text-indigo-600">
                            <Download size={16} /> Download PDF
                        </button>
                        <button type="button" className="neo-btn neo-btn-accent px-4 py-2 flex items-center gap-2">
                            <Mail size={16} /> Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsModal;
