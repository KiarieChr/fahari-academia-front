import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { formatKES } from '../utils/budgetUtils';
import {
    getCashDepositStatusBadge,
    isDepositOverdue,
    getDaysOverdue,
    filterDepositsByStatus,
    filterDepositsBySource,
    searchDeposits,
    formatDate,
    getTotalByStatus
} from '../utils/bankingUtils';
import AddCashDepositModal from './AddCashDepositModal';

const CashDepositPlanner = ({ deposits: initialDeposits }) => {
    const [deposits, setDeposits] = useState(initialDeposits);
    const [showModal, setShowModal] = useState(false);
    const [editingDeposit, setEditingDeposit] = useState(null);
    const [filters, setFilters] = useState({
        status: 'All',
        source: 'All',
        search: ''
    });

    // Apply filters
    let filteredDeposits = deposits;
    filteredDeposits = filterDepositsByStatus(filteredDeposits, filters.status);
    filteredDeposits = filterDepositsBySource(filteredDeposits, filters.source);
    filteredDeposits = searchDeposits(filteredDeposits, filters.search);

    // Calculate totals
    const totalPlanned = getTotalByStatus(deposits, 'Planned');
    const totalBanked = getTotalByStatus(deposits, 'Banked');
    const totalDelayed = getTotalByStatus(deposits, 'Delayed');
    const outstanding = totalPlanned + totalDelayed;

    const handleAddDeposit = () => {
        setEditingDeposit(null);
        setShowModal(true);
    };

    const handleEditDeposit = (deposit) => {
        setEditingDeposit(deposit);
        setShowModal(true);
    };

    const handleDeleteDeposit = (depositId) => {
        if (window.confirm('Are you sure you want to delete this deposit?')) {
            setDeposits(deposits.filter(d => d.id !== depositId));
        }
    };

    const handleSaveDeposit = (depositData) => {
        if (editingDeposit) {
            // Update existing
            setDeposits(deposits.map(d =>
                d.id === editingDeposit.id ? { ...depositData, id: editingDeposit.id } : d
            ));
        } else {
            // Add new
            const newDeposit = {
                ...depositData,
                id: `CASH-${String(deposits.length + 1).padStart(3, '0')}`
            };
            setDeposits([...deposits, newDeposit]);
        }
        setShowModal(false);
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1 fw-bold">💵 Cash Deposit Planning</h5>
                        <small className="text-muted">Plan and track cash deposits from various sources</small>
                    </div>
                    <button
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                        onClick={handleAddDeposit}
                    >
                        <Plus size={16} /> Add Cash Deposit
                    </button>
                </div>
            </div>

            <div className="card-body">
                {/* Filters */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light border-end-0">
                                <Search size={14} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search deposits..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select form-select-sm"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Planned">Planned</option>
                            <option value="Banked">Banked</option>
                            <option value="Delayed">Delayed</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select form-select-sm"
                            value={filters.source}
                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        >
                            <option value="All">All Sources</option>
                            <option value="Fees">Fees</option>
                            <option value="Sponsors">Sponsors</option>
                            <option value="Events">Events</option>
                            <option value="Donations">Donations</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="col-md-2 text-end">
                        <span className="badge bg-secondary">{filteredDeposits.length} deposits</span>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Source</th>
                                <th>Amount</th>
                                <th>Expected Date</th>
                                <th>Actual Date</th>
                                <th>Cashbook</th>
                                <th>Term</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeposits.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-4">
                                        No deposits found
                                    </td>
                                </tr>
                            ) : (
                                filteredDeposits.map((deposit) => {
                                    const overdue = isDepositOverdue(deposit.expectedBankingDate, deposit.status);
                                    const daysOverdue = getDaysOverdue(deposit.expectedBankingDate);

                                    return (
                                        <tr
                                            key={deposit.id}
                                            className={overdue ? 'deposit-overdue' : ''}
                                        >
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span>{deposit.source}</span>
                                                    {overdue && (
                                                        <AlertCircle size={16} className="text-danger" title={`Overdue by ${daysOverdue} days`} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="fw-semibold">{formatKES(deposit.amount)}</td>
                                            <td>{formatDate(deposit.expectedBankingDate)}</td>
                                            <td>{formatDate(deposit.actualBankingDate)}</td>
                                            <td>
                                                <span className="badge bg-light text-dark">{deposit.linkedCashbook}</span>
                                            </td>
                                            <td>{deposit.term}</td>
                                            <td>
                                                <span className={`badge ${getCashDepositStatusBadge(deposit.status)}`}>
                                                    {deposit.status}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => handleEditDeposit(deposit)}
                                                        title="Edit deposit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDeleteDeposit(deposit.id)}
                                                        title="Delete deposit"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Footer */}
                <div className="row g-3 mt-3 pt-3 border-top">
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-primary-subtle rounded">
                            <div className="small text-muted">Total Planned</div>
                            <div className="fw-bold text-primary">{formatKES(totalPlanned)}</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-success-subtle rounded">
                            <div className="small text-muted">Total Banked</div>
                            <div className="fw-bold text-success">{formatKES(totalBanked)}</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-warning-subtle rounded">
                            <div className="small text-muted">Delayed</div>
                            <div className="fw-bold text-warning">{formatKES(totalDelayed)}</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-info-subtle rounded">
                            <div className="small text-muted">Outstanding</div>
                            <div className="fw-bold text-info">{formatKES(outstanding)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <AddCashDepositModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onSave={handleSaveDeposit}
                    deposit={editingDeposit}
                />
            )}
        </div>
    );
};

export default CashDepositPlanner;
