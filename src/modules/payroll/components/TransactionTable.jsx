import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Download, Edit, FileText, X } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import PDFPayslipDocument from './settings/templates/PDFPayslipDocument';
import payrollService from '../../services/payrollService';

const transactions = [
    { id: 'PAY-001', name: 'John Doe', staffId: 'T-001', dept: 'Science', gross: '150,000', deductions: '25,000', net: '125,000', status: 'Paid' },
    { id: 'PAY-002', name: 'Jane Smith', staffId: 'T-004', dept: 'Maths', gross: '145,000', deductions: '22,500', net: '122,500', status: 'Paid' },
    { id: 'PAY-003', name: 'Michael Brown', staffId: 'NT-012', dept: 'Admin', gross: '85,000', deductions: '12,000', net: '73,000', status: 'Pending' },
    { id: 'PAY-004', name: 'Emily Davis', staffId: 'T-008', dept: 'English', gross: '135,000', deductions: '20,000', net: '115,000', status: 'Paid' },
    { id: 'PAY-005', name: 'Robert Wilson', staffId: 'NT-005', dept: 'Security', gross: '45,000', deductions: '5,000', net: '40,000', status: 'Processing' },
    { id: 'PAY-006', name: 'Sarah Miller', staffId: 'T-015', dept: 'Science', gross: '160,000', deductions: '28,000', net: '132,000', status: 'Paid' },
];

const StatusBadge = ({ status }) => {
    let classes = '';
    switch (status) {
        case 'Paid': classes = 'bg-green-100 text-green-700 border-green-200'; break;
        case 'Pending': classes = 'bg-amber-100 text-amber-700 border-amber-200'; break;
        case 'Processing': classes = 'bg-blue-100 text-blue-700 border-blue-200'; break;
        default: classes = 'bg-gray-100 text-gray-700 border-gray-200';
    }
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
            {status}
        </span>
    );
};

const TransactionTable = () => {
    const [previewTxn, setPreviewTxn] = useState(null);
    const [config, setConfig] = useState({});

    // Pre-fetch the latest PDF format config from DB
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await payrollService.getPayslipTemplates();
                const defaultTpl = response.data.find(t => t.is_default) || response.data[0];
                if (defaultTpl && defaultTpl.config) {
                    setConfig(defaultTpl.config);
                }
            } catch (err) {
                console.error("Failed loading payslip format", err);
            }
        };
        fetchConfig();
    }, []);

    // Format transaction layout data to match PDF expectations
    const openPreview = (t) => {
        setPreviewTxn({
            employeeName: t.name,
            employeeId: t.staffId,
            department: t.dept,
            period: 'Current Period',
            netPay: t.net,
            grossPay: t.gross,
            totalDeductions: t.deductions
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Staff ID</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Gross Pay</th>
                            <th className="px-6 py-4">Deductions</th>
                            <th className="px-6 py-4">Net Pay</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t, i) => (
                            <tr
                                key={t.id}
                                className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group"
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                                <td className="px-6 py-4">{t.staffId}</td>
                                <td className="px-6 py-4">{t.dept}</td>
                                <td className="px-6 py-4">KES {t.gross}</td>
                                <td className="px-6 py-4 text-red-500">KES {t.deductions}</td>
                                <td className="px-6 py-4 font-semibold text-gray-900">KES {t.net}</td>
                                <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => openPreview(t)}
                                            className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors" 
                                            title="Preview PDF Payslip"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-600" title="View Details"><Eye size={16} /></button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600" title="Edit"><Edit size={16} /></button>
                                        <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600" title="More"><MoreVertical size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-center">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All Transactions</button>
            </div>

            {/* Live React-PDF Preview Modal for Individual Payslip */}
            {previewTxn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-slate-700">
                        <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FileText size={18} className="text-indigo-400"/> 
                                Payslip Preview: {previewTxn.employeeName}
                            </h3>
                            <button onClick={() => setPreviewTxn(null)} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-100 flex items-center justify-center p-4">
                            <PDFViewer width="100%" height="100%" className="border-0 shadow-lg rounded">
                                <PDFPayslipDocument config={config} data={previewTxn} />
                            </PDFViewer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionTable;
