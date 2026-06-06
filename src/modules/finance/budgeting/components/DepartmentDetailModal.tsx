import React from 'react';
import { X } from 'lucide-react';
import { formatKES, formatPercentage, calculateUtilization, getStatusBadgeClass } from '../utils/budgetUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const DepartmentDetailModal = ({ department, onClose }) => {
    const remaining = department.approvedBudget - department.actualSpent;
    const utilization = calculateUtilization(department.actualSpent, department.approvedBudget);

    const pieData = department.subCategories.map(sub => ({
        name: sub.name,
        value: sub.spent
    }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <div>
                            <h5 className="modal-title fw-bold">{department.department}</h5>
                            <small className="text-muted">{department.category}</small>
                        </div>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        {/* Summary Cards */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <div className="card bg-primary-subtle border-0">
                                    <div className="card-body">
                                        <p className="small text-muted mb-1">Approved Budget</p>
                                        <h5 className="mb-0 fw-bold">{formatKES(department.approvedBudget)}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-success-subtle border-0">
                                    <div className="card-body">
                                        <p className="small text-muted mb-1">Actual Spent</p>
                                        <h5 className="mb-0 fw-bold">{formatKES(department.actualSpent)}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className={`card ${remaining < 0 ? 'bg-danger-subtle' : 'bg-info-subtle'} border-0`}>
                                    <div className="card-body">
                                        <p className="small text-muted mb-1">Remaining</p>
                                        <h5 className="mb-0 fw-bold">{formatKES(remaining)}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card bg-warning-subtle border-0">
                                    <div className="card-body">
                                        <p className="small text-muted mb-1">Utilization</p>
                                        <h5 className="mb-0 fw-bold">{formatPercentage(utilization)}</h5>
                                        <span className={getStatusBadgeClass(department.status)}>
                                            {department.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            {/* Spending Breakdown Chart */}
                            <div className="col-md-6 mb-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">Spending Breakdown</h6>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => formatKES(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Sub-Categories Table */}
                            <div className="col-md-6 mb-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">Sub-Categories</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Category</th>
                                                        <th className="text-end">Budget</th>
                                                        <th className="text-end">Spent</th>
                                                        <th className="text-end">%</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {department.subCategories.map((sub, idx) => (
                                                        <tr key={idx}>
                                                            <td className="small">{sub.name}</td>
                                                            <td className="text-end small">{formatKES(sub.budget)}</td>
                                                            <td className="text-end small">{formatKES(sub.spent)}</td>
                                                            <td className="text-end small">
                                                                {formatPercentage(calculateUtilization(sub.spent, sub.budget))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Transactions */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">Payment Transactions</h6>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Date</th>
                                                <th>Supplier</th>
                                                <th>Description</th>
                                                <th className="text-end">Amount</th>
                                                <th>Voucher Ref</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {department.payments.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                                                    <td>{payment.supplier}</td>
                                                    <td>{payment.description}</td>
                                                    <td className="text-end fw-bold">{formatKES(payment.amount)}</td>
                                                    <td>
                                                        <span className="badge bg-secondary">{payment.voucherRef}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <td colSpan="3" className="fw-bold">Total Payments</td>
                                                <td className="text-end fw-bold">
                                                    {formatKES(department.payments.reduce((sum, p) => sum + p.amount, 0))}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-0">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                        <button type="button" className="btn btn-primary">Export Report</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetailModal;
