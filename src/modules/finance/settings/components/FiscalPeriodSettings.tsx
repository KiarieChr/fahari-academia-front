import React, { useState } from 'react';
import { Plus, Check, Calendar, AlertCircle, Lock, Unlock } from 'lucide-react';
import { financeService } from '../../../../services/financeService';
import { toast } from 'react-toastify';

const FiscalPeriodSettings = ({ periods: initialPeriods }) => {
    const [periods, setPeriods] = useState(initialPeriods || []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // New Period Form State
    const [newPeriod, setNewPeriod] = useState({
        name: '',
        start_date: '',
        end_date: ''
    });

    React.useEffect(() => {
        if (initialPeriods) {
            // Sort by start date descending
            const sorted = [...initialPeriods].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
            setPeriods(sorted);
        }
    }, [initialPeriods]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await financeService.createFiscalPeriod(newPeriod);
            setPeriods([res.data, ...periods]);
            setShowAddModal(false);
            setNewPeriod({ name: '', start_date: '', end_date: '' });
            toast.success('Fiscal period created');
        } catch (err) {
            console.error(err);
            toast.error('Failed to create fiscal period');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (period) => {
        try {
            const res = await financeService.updateFiscalPeriod(period.id, { is_closed: !period.is_closed });
            setPeriods(periods.map(p => p.id === period.id ? res.data : p));
            toast.success(`Period ${res.data.is_closed ? 'Closed' : 'Reopened'}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    // Determine current period
    const today = new Date();
    const currentPeriod = periods.find(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        return today >= start && today <= end;
    });

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h6 className="fw-bold mb-1">Fiscal Periods Configuration</h6>
                        <small className="text-muted">Manage financial years and posting periods</small>
                    </div>
                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> New Fiscal Year
                    </button>
                </div>

                {/* Current Period Highlight */}
                {currentPeriod ? (
                    <div className="alert alert-soft-primary d-flex align-items-center gap-3 mb-4 border-primary border-opacity-25">
                        <Calendar className="text-primary" size={24} />
                        <div>
                            <div className="small text-uppercase fw-bold text-primary opacity-75">Current Active Period</div>
                            <div className="fw-bold fs-5 text-dark">{currentPeriod.name}</div>
                            <div className="small text-muted">
                                {new Date(currentPeriod.start_date).toLocaleDateString()} - {new Date(currentPeriod.end_date).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="ms-auto">
                            <span className="badge bg-primary">Active</span>
                        </div>
                    </div>
                ) : (
                    <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
                        <AlertCircle size={18} />
                        <div>
                            <strong>No Active Period!</strong> Transactions dated today cannot be posted. Please create a fiscal period that includes today's date.
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Period Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th className="text-center">Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map(period => {
                                const isCurrent = currentPeriod?.id === period.id;
                                return (
                                    <tr key={period.id} className={isCurrent ? 'table-warning' : ''}>
                                        <td className="fw-medium">
                                            {period.name}
                                            {isCurrent && <span className="badge bg-primary ms-2 x-small">Current</span>}
                                        </td>
                                        <td>{new Date(period.start_date).toLocaleDateString()}</td>
                                        <td>{new Date(period.end_date).toLocaleDateString()}</td>
                                        <td className="text-center">
                                            {period.is_closed ? (
                                                <span className="badge bg-secondary"><Lock size={12} className="me-1" /> Closed</span>
                                            ) : (
                                                <span className="badge bg-success"><Unlock size={12} className="me-1" /> Open</span>
                                            )}
                                        </td>
                                        <td className="text-end">
                                            <button
                                                className={`btn btn-sm ${period.is_closed ? 'btn-outline-secondary' : 'btn-outline-danger'}`}
                                                onClick={() => toggleStatus(period)}
                                                title={period.is_closed ? "Re-open Period" : "Close Period"}
                                            >
                                                {period.is_closed ? 'Re-open' : 'Close'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {periods.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">No fiscal periods found. Create one to start.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showAddModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">New Fiscal Period</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <form onSubmit={handleCreate}>
                                <div className="modal-body p-4">
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Period Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newPeriod.name}
                                            onChange={e => setNewPeriod({ ...newPeriod, name: e.target.value })}
                                            placeholder="e.g. FY 2024"
                                            required
                                        />
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={newPeriod.start_date}
                                                onChange={e => setNewPeriod({ ...newPeriod, start_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-bold">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={newPeriod.end_date}
                                                onChange={e => setNewPeriod({ ...newPeriod, end_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light text-muted" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                        {loading ? 'Creating...' : 'Create Period'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiscalPeriodSettings;

