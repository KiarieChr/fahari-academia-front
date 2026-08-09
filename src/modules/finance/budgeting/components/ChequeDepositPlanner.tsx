import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { formatKES } from '../utils/budgetUtils';
import {
    getChequeDepositStatusBadge,
    getChequeStatusColor,
    searchCheques,
    formatDate,
    getChequeTotalByStatus
} from '../utils/bankingUtils';
import AddChequeDepositModal from './AddChequeDepositModal';

const ChequeDepositPlanner = ({ deposits: initialDeposits }) => {
    const [deposits, setDeposits] = useState(initialDeposits);
    const [showModal, setShowModal] = useState(false);
    const [editingDeposit, setEditingDeposit] = useState(null);
    const [filters, setFilters] = useState({
        status: 'All',
        bank: 'All',
        search: ''
    });

    // Apply filters
    let filteredDeposits = deposits;

    if (filters.status !== 'All') {
        filteredDeposits = filteredDeposits.filter(d => d.status === filters.status);
    }

    if (filters.bank !== 'All') {
        filteredDeposits = filteredDeposits.filter(d => d.bankName === filters.bank);
    }

    filteredDeposits = searchCheques(filteredDeposits, filters.search);

    // Get unique banks for filter
    const uniqueBanks = [...new Set(deposits.map(d => d.bankName))];

    // Calculate totals
    const totalReceived = getChequeTotalByStatus(deposits, 'Received');
    const totalDeposited = getChequeTotalByStatus(deposits, 'Deposited');
    const totalCleared = getChequeTotalByStatus(deposits, 'Cleared');
    const totalBounced = getChequeTotalByStatus(deposits, 'Bounced');

    const handleAddDeposit = () => {
        setEditingDeposit(null);
        setShowModal(true);
    };

    const handleEditDeposit = (deposit) => {
        setEditingDeposit(deposit);
        setShowModal(true);
    };

    const handleDeleteDeposit = (depositId) => {
        if (window.confirm('Are you sure you want to delete this cheque deposit?')) {
            setDeposits(deposits.filter(d => d.id !== depositId));
        }
    };

    const handleSaveDeposit = (depositData) => {
        if (editingDeposit) {
            setDeposits(deposits.map(d =>
                d.id === editingDeposit.id ? { ...depositData, id: editingDeposit.id } : d
            ));
        } else {
            const newDeposit = {
                ...depositData,
                id: `CHQ-${String(deposits.length + 1).padStart(3, '0')}`
            };
            setDeposits([...deposits, newDeposit]);
        }
        setShowModal(false);
    };

    const getStatusSteps = (status) => {
        const steps = ['Received', 'Deposited', 'Cleared'];
        const currentIndex = steps.indexOf(status);

        if (status === 'Bounced') {
            return (
                <div className="d-flex align-items-center gap-1">
                    <span className="badge bg-danger">Bounced</span>
                </div>
            );
        }

        return (
            <div className="d-flex align-items-center gap-1">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <span
                            className={`badge ${index <= currentIndex ? getChequeDepositStatusBadge(step) : 'bg-light text-muted'}`}
                            style={{ fontSize: '0.7rem' }}
                        >
                            {step}
                        </span>
                        {index < steps.length - 1 && (
                            <span className="text-muted">→</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1 fw-bold">🧾 Cheque Deposit Planning</h5>
                        <small className="text-muted">Track cheque deposits from received to cleared</small>
                    </div>
                    <button
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                        onClick={handleAddDeposit}
                    >
                        <Plus size={16} /> Add Cheque Deposit
                    </button>
                </div>
            </div>

            <div className="card-body">
                {/* Filters */}
                <div className="row g-3 mb-4">
                    <div className="col-md-5">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light border-end-0">
                                <Search size={14} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Search by cheque #, drawer, or bank..."
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
                            <option value="Received">Received</option>
                            <option value="Deposited">Deposited</option>
                            <option value="Cleared">Cleared</option>
                            <option value="Bounced">Bounced</option>
                        </select>
                    </div>
                    <div className="col-md-3">
                        <select
                            className="form-select form-select-sm"
                            value={filters.bank}
                            onChange={(e) => setFilters({ ...filters, bank: e.target.value })}
                        >
                            <option value="All">All Banks</option>
                            {uniqueBanks.map(bank => (
                                <option key={bank} value={bank}>{bank}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-1 text-end">
                        <span className="badge bg-secondary">{filteredDeposits.length}</span>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Cheque #</th>
                                <th>Bank</th>
                                <th>Drawer</th>
                                <th>Amount</th>
                                <th>Received Date</th>
                                <th>Expected Clearing</th>
                                <th>Status Timeline</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeposits.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center text-muted py-4">
                                        No cheque deposits found
                                    </td>
                                </tr>
                            ) : (
                                filteredDeposits.map((deposit) => (
                                    <tr
                                        key={deposit.id}
                                        className={deposit.status === 'Bounced' ? 'table-danger' : ''}
                                    >
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <code className="small">{deposit.chequeNumber}</code>
                                                {deposit.status === 'Bounced' && (
                                                    <AlertTriangle size={16} className="text-danger" title="Bounced cheque" />
                                                )}
                                            </div>
                                        </td>
                                        <td>{deposit.bankName}</td>
                                        <td>{deposit.drawerName}</td>
                                        <td className="fw-semibold">{formatKES(deposit.amount)}</td>
                                        <td>{formatDate(deposit.receivedDate)}</td>
                                        <td>{formatDate(deposit.expectedClearingDate)}</td>
                                        <td>
                                            {getStatusSteps(deposit.status)}
                                        </td>
                                        <td className="text-end">
                                            <div className="btn-group btn-group-sm">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => handleEditDeposit(deposit)}
                                                    title="Edit cheque"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDeleteDeposit(deposit.id)}
                                                    title="Delete cheque"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Footer */}
                <div className="row g-3 mt-3 pt-3 border-top">
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-info-subtle rounded">
                            <div className="small text-muted">Received</div>
                            <div className="fw-bold text-info">{formatKES(totalReceived)}</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-warning-subtle rounded">
                            <div className="small text-muted">Deposited</div>
                            <div className="fw-bold text-warning">{formatKES(totalDeposited)}</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-success-subtle rounded">
                            <div className="small text-muted">Cleared</div>
                            <div className="fw-bold text-success">{formatKES(totalCleared)}</div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-center p-2 bg-danger-subtle rounded">
                            <div className="small text-muted">Bounced</div>
                            <div className="fw-bold text-danger">{formatKES(totalBounced)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <AddChequeDepositModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onSave={handleSaveDeposit}
                    deposit={editingDeposit}
                />
            )}
        </div>
    );
};

export default ChequeDepositPlanner;
