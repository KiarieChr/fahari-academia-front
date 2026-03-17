import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download, Search, AlertCircle } from 'lucide-react';
import { financeService } from '../../../services/financeService';

const GeneralLedgerModal = ({ isOpen, onClose, accountId, dateRange }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && accountId) {
            fetchLedger();
        } else {
            setData(null);
            setError(null);
        }
    }, [isOpen, accountId, dateRange]);

    const fetchLedger = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                account_id: accountId,
                start_date: dateRange.start_date,
                end_date: dateRange.end_date
            };
            const response = await financeService.getGeneralLedger(params);

            // Handle potentially wrapped response
            const ledgerData = response.lines ? response : (response.data || response);
            setData(ledgerData);
        } catch (err) {
            console.error("Failed to fetch General Ledger:", err);
            setError("Failed to load General Ledger data.");
        } finally {
            setLoading(false);
        }
    };

    const formatKES = (val) => new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(val || 0);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title fw-bold">General Ledger</h5>
                            {data && (
                                <div className="text-muted small mt-1">
                                    {data.account_code} - {data.account_name}
                                </div>
                            )}
                        </div>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="modal-body p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-2 text-muted">Loading transactions...</p>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger m-3 d-flex align-items-center">
                                <AlertCircle size={20} className="me-2" />
                                <div>{error}</div>
                                <button className="btn btn-sm btn-outline-danger ms-auto" onClick={fetchLedger}>Retry</button>
                            </div>
                        ) : data ? (
                            <>
                                {/* Summary Header */}
                                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                    <div className="d-flex gap-4 text-sm">
                                        <div>
                                            <span className="text-muted d-block small">Period</span>
                                            <span className="fw-semibold">
                                                {formatDate(dateRange.start_date || 'Start')} - {formatDate(dateRange.end_date || 'Today')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted d-block small">Opening Balance</span>
                                            <span className="fw-semibold font-monospace">{formatKES(data.opening_balance)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted d-block small">Closing Balance</span>
                                            <span className="fw-semibold font-monospace text-primary">{formatKES(data.closing_balance)}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                                            <Printer size={14} /> Print
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                                            <Download size={14} /> Export
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover mb-0">
                                        <thead className="table-light sticky-top" style={{ zIndex: 1 }}>
                                            <tr>
                                                <th>Date</th>
                                                <th>Journal #</th>
                                                <th>Reference</th>
                                                <th>Description</th>
                                                <th className="text-end">Debit</th>
                                                <th className="text-end">Credit</th>
                                                <th className="text-end">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.opening_balance !== 0 && (
                                                <tr className="table-warning">
                                                    <td>{formatDate(dateRange.start_date)}</td>
                                                    <td>-</td>
                                                    <td>-</td>
                                                    <td className="fst-italic">Opening Balance Brought Forward</td>
                                                    <td className="text-end">-</td>
                                                    <td className="text-end">-</td>
                                                    <td className="text-end font-monospace fw-bold">{formatKES(data.opening_balance)}</td>
                                                </tr>
                                            )}

                                            {data.lines.length > 0 ? (
                                                data.lines.map((line) => (
                                                    <tr key={line.id}>
                                                        <td>{formatDate(line.date)}</td>
                                                        <td>
                                                            <span className="badge bg-light text-dark border">
                                                                {line.journal_no}
                                                            </span>
                                                        </td>
                                                        <td className="small">{line.reference}</td>
                                                        <td>{line.description}</td>
                                                        <td className="text-end font-monospace text-muted">
                                                            {line.debit > 0 ? formatKES(line.debit) : '-'}
                                                        </td>
                                                        <td className="text-end font-monospace text-muted">
                                                            {line.credit > 0 ? formatKES(line.credit) : '-'}
                                                        </td>
                                                        <td className="text-end font-monospace fw-semibold">
                                                            {formatKES(line.balance)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-5 text-muted">
                                                        No transactions found for this period.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {data.lines.length > 0 && (
                                            <tfoot className="table-light border-top-2">
                                                <tr>
                                                    <td colSpan="6" className="text-end fw-bold">Closing Balance</td>
                                                    <td className="text-end fw-bold font-monospace text-primary">
                                                        {formatKES(data.closing_balance)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-5 text-muted">Select an account to view details</div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GeneralLedgerModal;
