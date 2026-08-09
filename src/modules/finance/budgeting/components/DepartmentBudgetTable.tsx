import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, Download } from 'lucide-react';
import { formatKES, formatPercentage, calculateUtilization, getStatusBadgeClass } from '../utils/budgetUtils';
import DepartmentDetailModal from './DepartmentDetailModal';

const DepartmentBudgetTable = ({ departments }) => {
    const [expandedRows, setExpandedRows] = useState({});
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

    const toggleRow = (deptId) => {
        setExpandedRows(prev => ({ ...prev, [deptId]: !prev[deptId] }));
    };

    const handleViewDetails = (dept) => {
        setSelectedDepartment(dept);
        setShowDetailModal(true);
    };

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedDepartments = [...departments].sort((a, b) => {
        if (!sortConfig.field) return 0;

        const aVal = sortConfig.field === 'utilization'
            ? calculateUtilization(a.actualSpent, a.approvedBudget)
            : a[sortConfig.field];
        const bVal = sortConfig.field === 'utilization'
            ? calculateUtilization(b.actualSpent, b.approvedBudget)
            : b[sortConfig.field];

        if (typeof aVal === 'string') {
            return sortConfig.direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return (
        <>
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">Department Budget Breakdown</h6>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                            <Download size={16} />
                            Export
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th
                                        onClick={() => handleSort('department')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Department
                                    </th>
                                    <th
                                        onClick={() => handleSort('approvedBudget')}
                                        className="text-end"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Approved Budget
                                    </th>
                                    <th
                                        onClick={() => handleSort('actualSpent')}
                                        className="text-end"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Actual Spent
                                    </th>
                                    <th className="text-end">Remaining</th>
                                    <th
                                        onClick={() => handleSort('utilization')}
                                        className="text-end"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Utilization
                                    </th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedDepartments.map((dept) => {
                                    const remaining = dept.approvedBudget - dept.actualSpent;
                                    const utilization = calculateUtilization(dept.actualSpent, dept.approvedBudget);
                                    const isExpanded = expandedRows[dept.id];

                                    return (
                                        <React.Fragment key={dept.id}>
                                            <tr>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-link p-0"
                                                        onClick={() => toggleRow(dept.id)}
                                                    >
                                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </button>
                                                </td>
                                                <td className="fw-medium">{dept.department}</td>
                                                <td className="text-end">{formatKES(dept.approvedBudget)}</td>
                                                <td className="text-end fw-bold">{formatKES(dept.actualSpent)}</td>
                                                <td className={`text-end ${remaining < 0 ? 'text-danger' : 'text-success'}`}>
                                                    {formatKES(remaining)}
                                                </td>
                                                <td className="text-end">
                                                    <span className={utilization > 100 ? 'text-danger fw-bold' : ''}>
                                                        {formatPercentage(utilization)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={getStatusBadgeClass(dept.status)}>
                                                        {dept.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleViewDetails(dept)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan="8" className="bg-light">
                                                        <div className="p-3">
                                                            <h6 className="small fw-bold mb-2">Sub-Categories</h6>
                                                            <div className="table-responsive">
                                                                <table className="table table-sm mb-0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Category</th>
                                                                            <th className="text-end">Budget</th>
                                                                            <th className="text-end">Spent</th>
                                                                            <th className="text-end">Remaining</th>
                                                                            <th className="text-end">Utilization</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {dept.subCategories.map((sub, idx) => {
                                                                            const subRemaining = sub.budget - sub.spent;
                                                                            const subUtil = calculateUtilization(sub.spent, sub.budget);
                                                                            return (
                                                                                <tr key={idx}>
                                                                                    <td>{sub.name}</td>
                                                                                    <td className="text-end">{formatKES(sub.budget)}</td>
                                                                                    <td className="text-end">{formatKES(sub.spent)}</td>
                                                                                    <td className={`text-end ${subRemaining < 0 ? 'text-danger' : ''}`}>
                                                                                        {formatKES(subRemaining)}
                                                                                    </td>
                                                                                    <td className="text-end">{formatPercentage(subUtil)}</td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>

                                                            <h6 className="small fw-bold mt-3 mb-2">Recent Payments</h6>
                                                            <div className="table-responsive">
                                                                <table className="table table-sm mb-0">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Date</th>
                                                                            <th>Supplier</th>
                                                                            <th>Description</th>
                                                                            <th className="text-end">Amount</th>
                                                                            <th>Voucher</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {dept.payments.map((payment) => (
                                                                            <tr key={payment.id}>
                                                                                <td className="small">{new Date(payment.date).toLocaleDateString()}</td>
                                                                                <td className="small">{payment.supplier}</td>
                                                                                <td className="small">{payment.description}</td>
                                                                                <td className="text-end small">{formatKES(payment.amount)}</td>
                                                                                <td className="small">
                                                                                    <span className="badge bg-secondary">{payment.voucherRef}</span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                            <tfoot className="table-light">
                                <tr>
                                    <td colSpan="2" className="fw-bold">Total</td>
                                    <td className="text-end fw-bold">
                                        {formatKES(departments.reduce((sum, d) => sum + d.approvedBudget, 0))}
                                    </td>
                                    <td className="text-end fw-bold">
                                        {formatKES(departments.reduce((sum, d) => sum + d.actualSpent, 0))}
                                    </td>
                                    <td className="text-end fw-bold">
                                        {formatKES(departments.reduce((sum, d) => sum + (d.approvedBudget - d.actualSpent), 0))}
                                    </td>
                                    <td colSpan="3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {showDetailModal && selectedDepartment && (
                <DepartmentDetailModal
                    department={selectedDepartment}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </>
    );
};

export default DepartmentBudgetTable;
