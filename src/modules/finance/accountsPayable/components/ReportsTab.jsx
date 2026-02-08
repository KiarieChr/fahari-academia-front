import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { formatKES } from '../utils/formatters';

const ReportsTab = ({ agingData, voucherTypeData, supplierSummary, postingStats }) => {
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div>
            {/* Export Actions */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Reports & Analytics</h5>
                <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
                        <Download size={16} />
                        PDF
                    </button>
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
                        <FileSpreadsheet size={16} />
                        Excel
                    </button>
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
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

            {/* Supplier Summary Table */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <h6 className="fw-bold mb-3">Payables Summary by Supplier</h6>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Supplier</th>
                                    <th className="text-end">Total Invoices</th>
                                    <th className="text-end">Total Amount</th>
                                    <th className="text-end">Paid</th>
                                    <th className="text-end">Outstanding</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierSummary.map((supplier, index) => (
                                    <tr key={index}>
                                        <td className="fw-bold">{supplier.supplier}</td>
                                        <td className="text-end">{supplier.totalInvoices}</td>
                                        <td className="text-end">{formatKES(supplier.totalAmount)}</td>
                                        <td className="text-end text-success">{formatKES(supplier.paid)}</td>
                                        <td className="text-end text-warning fw-bold">{formatKES(supplier.outstanding)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="table-light">
                                <tr>
                                    <td className="fw-bold">Total</td>
                                    <td className="text-end fw-bold">
                                        {supplierSummary.reduce((sum, s) => sum + s.totalInvoices, 0)}
                                    </td>
                                    <td className="text-end fw-bold">
                                        {formatKES(supplierSummary.reduce((sum, s) => sum + s.totalAmount, 0))}
                                    </td>
                                    <td className="text-end fw-bold text-success">
                                        {formatKES(supplierSummary.reduce((sum, s) => sum + s.paid, 0))}
                                    </td>
                                    <td className="text-end fw-bold text-warning">
                                        {formatKES(supplierSummary.reduce((sum, s) => sum + s.outstanding, 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Posting Statistics */}
            <div className="row">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Posted vs Unposted Vouchers</h6>
                            <div className="row text-center">
                                <div className="col-6">
                                    <div className="p-3 bg-success-subtle rounded">
                                        <div className="text-muted small mb-1">Posted</div>
                                        <div className="h4 mb-0 text-success">{postingStats.posted.count}</div>
                                        <div className="small text-muted">{formatKES(postingStats.posted.amount)}</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 bg-warning-subtle rounded">
                                        <div className="text-muted small mb-1">Unposted</div>
                                        <div className="h4 mb-0 text-warning">{postingStats.unposted.count}</div>
                                        <div className="small text-muted">{formatKES(postingStats.unposted.amount)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Voucher Type Summary</h6>
                            <div className="table-responsive">
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th className="text-end">Count</th>
                                            <th className="text-end">Amount</th>
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
