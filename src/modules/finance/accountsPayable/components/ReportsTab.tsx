import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import { formatKES, exportToCSV } from '../utils/formatters';
import { financeService } from '../../../../services/financeService';

const VOUCHER_TYPE_LABELS = {
    AP: 'AP Payment',
    GENERAL: 'General Payment',
    IMPREST: 'Imprest',
    REFUND: 'Refund',
};

const ReportsTab = () => {
    const [agingData, setAgingData] = useState([]);
    const [voucherTypeData, setVoucherTypeData] = useState([]);
    const [supplierSummary, setSupplierSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        setLoading(true);
        try {
            const [agingRes, voucherRes, suppliersRes] = await Promise.all([
                financeService.getAPAging().catch(() => null),
                financeService.getVouchersByType().catch(() => []),
                financeService.getSuppliers({ is_active: true }).catch(() => null),
            ]);

            // Transform aging data for chart
            if (agingRes) {
                setAgingData([
                    { bucket: '0-30 Days', amount: parseFloat(agingRes.current || 0) },
                    { bucket: '31-60 Days', amount: parseFloat(agingRes['31_60'] || 0) },
                    { bucket: '61-90 Days', amount: parseFloat(agingRes['61_90'] || 0) },
                    { bucket: '90+ Days', amount: parseFloat(agingRes.over_90 || 0) },
                ]);
            }

            // Transform voucher type data
            const vtData = (Array.isArray(voucherRes) ? voucherRes : voucherRes?.results || []).map(v => ({
                type: VOUCHER_TYPE_LABELS[v.voucher_type] || v.voucher_type,
                count: v.count,
                amount: parseFloat(v.total_amount || 0),
            }));
            setVoucherTypeData(vtData);

            // Build supplier summary from supplier list with outstanding_balance
            const suppliers = suppliersRes?.results || suppliersRes || [];
            const summary = suppliers
                .filter(s => parseFloat(s.outstanding_balance || 0) > 0 || true)
                .map(s => ({
                    supplier: s.name,
                    outstanding: parseFloat(s.outstanding_balance || 0),
                }))
                .filter(s => s.outstanding > 0);
            setSupplierSummary(summary);
        } catch (err) {
            console.error('Failed to load report data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportAging = () => {
        exportToCSV(agingData, [
            { label: 'Aging Bucket', accessor: 'bucket' },
            { label: 'Amount (KES)', accessor: 'amount' },
        ], 'ap_aging_report');
    };

    const handleExportSuppliers = () => {
        exportToCSV(supplierSummary, [
            { label: 'Supplier', accessor: 'supplier' },
            { label: 'Outstanding (KES)', accessor: 'outstanding' },
        ], 'supplier_outstanding');
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Loader2 className="spin" size={24} />
                <span className="ms-2 text-muted">Loading reports...</span>
            </div>
        );
    }

    return (
        <div>
            {/* Export Actions */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Reports & Analytics</h5>
                <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={handleExportAging}>
                        <FileSpreadsheet size={16} />
                        Aging CSV
                    </button>
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={handleExportSuppliers}>
                        <Download size={16} />
                        Suppliers CSV
                    </button>
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" onClick={handlePrint}>
                        <Printer size={16} />
                        Print
                    </button>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="row mb-4">
                {/* AP Aging Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Accounts Payable Aging Analysis</h6>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={agingData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="bucket" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatKES(value)} />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#3b82f6" name="Amount (KES)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Voucher Type Distribution */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Voucher Type Distribution</h6>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={voucherTypeData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ type, count }) => `${type}: ${count}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {voucherTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Supplier Outstanding Table */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <h6 className="fw-bold mb-3">Supplier Outstanding Balances</h6>
                    {supplierSummary.length === 0 ? (
                        <p className="text-muted">No outstanding balances.</p>
                    ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Supplier</th>
                                    <th className="text-end">Outstanding</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierSummary.map((supplier, index) => (
                                    <tr key={index}>
                                        <td className="fw-bold">{supplier.supplier}</td>
                                        <td className="text-end text-warning fw-bold">{formatKES(supplier.outstanding)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light">
                                <tr>
                                    <td className="fw-bold">Total</td>
                                    <td className="text-end fw-bold text-warning">
                                        {formatKES(supplierSummary.reduce((sum, s) => sum + s.outstanding, 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    )}
                </div>
            </div>

            {/* Voucher Type Summary */}
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Voucher Type Summary</h6>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th className="text-end">Count</th>
                                            <th className="text-end">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {voucherTypeData.map((type, index) => (
                                            <tr key={index}>
                                                <td>{type.type}</td>
                                                <td className="text-end">{type.count}</td>
                                                <td className="text-end fw-bold">{formatKES(type.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-light">
                                        <tr>
                                            <td className="fw-bold">Total</td>
                                            <td className="text-end fw-bold">{voucherTypeData.reduce((s, v) => s + v.count, 0)}</td>
                                            <td className="text-end fw-bold">{formatKES(voucherTypeData.reduce((s, v) => s + v.amount, 0))}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsTab;
