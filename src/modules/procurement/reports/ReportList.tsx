
import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, Download, Filter, Search } from 'lucide-react';
import { procurementReportService } from '../../../services/procurementReportService';

const AVAILABLE_REPORTS = [
    { id: 'spend_analysis', name: 'Departmental Spend Analysis', category: 'Finance' },
    { id: 'supplier_performance', name: 'Supplier Performance Scorecard', category: 'Suppliers' },
    { id: 'stock_valuation', name: 'Current Stock Valuation', category: 'Inventory' },
    { id: 'low_stock', name: 'Low Stock & Reorder Report', category: 'Inventory' },
    { id: 'po_register', name: 'Purchase Order Register', category: 'Procurement' }, // Placeholder
    { id: 'grn_summary', name: 'Goods Received Summary', category: 'Procurement' }, // Placeholder
];

const ReportList = () => {
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [reportData, setReportData] = useState({ columns: [], data: [] });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSelectReport = async (reportId) => {
        setSelectedReportId(reportId);
        setLoading(true);
        try {
            const data = await procurementReportService.getReportData(reportId);
            setReportData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const groupedReports = AVAILABLE_REPORTS.reduce((acc, report) => {
        if (!acc[report.category]) acc[report.category] = [];
        acc[report.category].push(report);
        return acc;
    }, {});

    const renderCell = (item, col) => {
        const val = item[col.key];
        if (col.type === 'currency') return `KSh ${val?.toLocaleString()}`;
        if (col.type === 'rating') return <span className={`font-bold ${val >= 4 ? 'text-green-600' : 'text-orange-600'}`}>{val}</span>;
        if (col.highlight) return <span className="font-bold text-red-600">{val}</span>;
        return val;
    };

    return (
        <div className="flex flex-col md:flex-row h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find a report..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {Object.entries(groupedReports).map(([category, reports]) => (
                        <div key={category} className="mb-4">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">{category}</h4>
                            <div className="space-y-1">
                                {reports.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map(report => (
                                    <button
                                        key={report.id}
                                        onClick={() => handleSelectReport(report.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${selectedReportId === report.id
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} />
                                            {report.name}
                                        </div>
                                        {selectedReportId === report.id && <ChevronRight size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main View */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedReportId ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">
                                {AVAILABLE_REPORTS.find(r => r.id === selectedReportId)?.name}
                            </h3>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 max-md:hidden">
                                    <Filter size={14} /> Filter
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                                    <Download size={14} /> Export
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-auto">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-gray-500">Generating Report...</div>
                            ) : reportData.data.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400">No data found for this report.</div>
                            ) : (
                                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                            <tr>
                                                {reportData.columns.map(col => (
                                                    <th key={col.key} className="p-3">{col.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reportData.data.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    {reportData.columns.map(col => (
                                                        <td key={col.key} className="p-3">
                                                            {renderCell(item, col)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>Select a report from the list to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportList;
