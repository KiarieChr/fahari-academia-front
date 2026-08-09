import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { toast } from 'react-toastify';
import { Download, Printer, RefreshCw, Calendar, ChevronDown, ChevronRight, FileText } from 'lucide-react';

const FinancialNotesReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        // Default to beginning of year
        const currentYear = new Date().getFullYear();
        setDateRange(prev => ({ ...prev, start_date: `${currentYear}-01-01` }));
    }, []);

    useEffect(() => {
        if (dateRange.start_date) {
            fetchReport();
        }
    }, [dateRange.start_date]);

    const fetchReport = async () => {
        if (!dateRange.start_date || !dateRange.end_date) return;

        setLoading(true);
        try {
            const res = await financeService.getFinancialNotes(dateRange.start_date, dateRange.end_date);
            // Handle wrapper if present
            const reportData = res.notes ? res : (res.data || null);
            setData(reportData);
        } catch (error) {
            console.error("Failed to fetch Financial Notes:", error);
            toast.error("Failed to load Financial Notes.");
        } finally {
            setLoading(false);
        }
    };

    const formatKES = (val) => new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(val || 0);

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Notes to the Financial Statements</h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={fetchReport}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                        <Printer size={14} /> Print
                    </button>
                    <button className="btn btn-primary btn-sm d-flex align-items-center gap-2">
                        <Download size={14} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="card-body bg-light-subtle">
                {/* Filters */}
                <div className="bg-white p-3 rounded shadow-sm mb-4 d-flex gap-3 align-items-end border">
                    <div>
                        <label className="form-label small text-muted mb-1">Start Date</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dateRange.start_date}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="form-label small text-muted mb-1">End Date</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dateRange.end_date}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={fetchReport}>
                        Apply
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Compiling notes...</p>
                    </div>
                ) : data && data.notes ? (
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            {/* Header */}
                            <div className="text-center mb-5">
                                <h4 className="fw-bold">Notes to the Financial Statements</h4>
                                <p className="text-muted">For the period {data.period}</p>
                            </div>

                            {/* Notes List */}
                            {data.notes.map((note) => (
                                <div key={note.number} className="card shadow-sm border-0 mb-4">
                                    <div className="card-header bg-white py-3 border-bottom">
                                        <h6 className="mb-0 fw-bold text-primary">
                                            Original Note {note.number}: {note.title}
                                        </h6>
                                    </div>
                                    <div className="card-body p-0">
                                        <table className="table table-hover mb-0">
                                            <thead className="bg-light small text-muted text-uppercase">
                                                <tr>
                                                    <th className="ps-4 py-2 border-0">Account</th>
                                                    <th className="text-end pe-4 py-2 border-0">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {note.accounts.map((acc, idx) => (
                                                    <tr key={idx}>
                                                        <td className="ps-4">
                                                            <div className="fw-medium text-dark">{acc.name}</div>
                                                            <div className="small text-muted font-monospace">{acc.code}</div>
                                                        </td>
                                                        <td className="text-end pe-4 align-middle font-monospace">
                                                            {formatKES(acc.balance)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-light fw-bold border-top">
                                                    <td className="ps-4 py-3">Total</td>
                                                    <td className="text-end pe-4 py-3 font-monospace">
                                                        {formatKES(note.total)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            {data.notes.length === 0 && (
                                <div className="text-center py-5 text-muted fst-italic">
                                    No significant balances found to report in the notes for this period.
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted">
                        Select a date range to view the financial notes.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinancialNotesReport;
