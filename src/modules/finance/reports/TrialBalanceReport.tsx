import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { toast } from 'react-toastify';
import { Download, Filter, Printer, RefreshCw } from 'lucide-react';

import GeneralLedgerModal from './GeneralLedgerModal';
import ExportButton from './ExportButton';

const TrialBalanceReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ lines: [], total_debit: 0, total_credit: 0 });
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: new Date().toISOString().split('T')[0] // today
    });

    // Modal State
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [showLedgerModal, setShowLedgerModal] = useState(false);

    useEffect(() => {
        fetchFiscalPeriod();
        fetchReport();
    }, []);

    const fetchFiscalPeriod = async () => {
        try {
            const res = await financeService.getFiscalPeriods();
            const periods = res.data || res; // Handle potential wrapper
            const today = new Date().toISOString().split('T')[0];

            // Find active period for today
            const currentPeriod = periods.find(p =>
                !p.is_closed && p.start_date <= today && p.end_date >= today
            );

            if (currentPeriod) {
                setDateRange(prev => ({ ...prev, start_date: currentPeriod.start_date }));
            } else {
                // Fallback: 1st Jan of current year
                const currentYear = new Date().getFullYear();
                setDateRange(prev => ({ ...prev, start_date: `${currentYear}-01-01` }));
            }
        } catch (error) {
            console.error("Failed to fetch fiscal periods:", error);
            // Fallback
            const currentYear = new Date().getFullYear();
            setDateRange(prev => ({ ...prev, start_date: `${currentYear}-01-01` }));
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            // Only send start_date if it's set (it should be now)
            if (dateRange.start_date) params.start_date = dateRange.start_date;
            if (dateRange.end_date) params.end_date = dateRange.end_date;

            const res = await financeService.getTrialBalance(params);

            // Handle unwrapped response similar to other components
            const reportData = res.lines ? res : (res.data || { lines: [], total_debit: 0, total_credit: 0 });

            setData(reportData);
        } catch (error) {
            console.error("Failed to fetch Trial Balance:", error);
            toast.error("Failed to load Trial Balance.");
        } finally {
            setLoading(false);
        }
    };

    const handleRowDoubleClick = (account) => {
        setSelectedAccount(account);
        setShowLedgerModal(true);
    };

    const formatKES = (val) => new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(val || 0);

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Trial Balance</h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" onClick={fetchReport}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <ExportButton 
                        title="Trial Balance"
                        subtitle={`Period: ${dateRange.start_date || '-'} to ${dateRange.end_date || '-'}`}
                        headers={['Code', 'Account Name', 'Type', 'Debit (KES)', 'Credit (KES)']}
                        getRows={() => data.lines.map(line => [line.code, line.name, line.type, line.debit, line.credit])}
                        filename="Trial_Balance_Report"
                    />
                </div>
            </div>

            <div className="card-body p-0">
                {/* Filters */}
                <div className="bg-light p-3 border-bottom d-flex gap-3 align-items-end">
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
                        <label className="form-label small text-muted mb-1">As At</label>
                        <input
                            type="date"
                            className="form-control form-control-sm"
                            value={dateRange.end_date}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={fetchReport}>
                        <Filter size={14} /> Apply Filters
                    </button>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '15%' }}>Code</th>
                                <th style={{ width: '45%' }}>Account Name</th>
                                <th style={{ width: '10%' }}>Type</th>
                                <th className="text-end" style={{ width: '15%' }}>Debit</th>
                                <th className="text-end" style={{ width: '15%' }}>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-5 text-muted">Loading Report...</td>
                                </tr>
                            ) : data.lines?.length > 0 ? (
                                data.lines.map((line, idx) => (
                                    <tr
                                        key={idx}
                                        onDoubleClick={() => handleRowDoubleClick(line)}
                                        className="cursor-pointer highlight-hover"
                                        title="Double click to view ledger"
                                    >
                                        <td className="font-monospace small fw-bold">{line.code}</td>
                                        <td>{line.name}</td>
                                        <td><span className="badge bg-light text-dark border">{line.type}</span></td>
                                        <td className="text-end font-monospace">
                                            {line.debit > 0 ? formatKES(line.debit) : '-'}
                                        </td>
                                        <td className="text-end font-monospace">
                                            {line.credit > 0 ? formatKES(line.credit) : '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-5 text-muted">No records found for this period.</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="table-light fw-bold border-top-2">
                            <tr>
                                <td colSpan="3" className="text-end text-uppercase">Total</td>
                                <td className="text-end text-primary">{formatKES(data.total_debit)}</td>
                                <td className="text-end text-primary">{formatKES(data.total_credit)}</td>
                            </tr>
                            {!loading && (Math.abs(data.total_debit - data.total_credit) > 0.01) && (
                                <tr className="bg-danger-subtle text-danger">
                                    <td colSpan="3" className="text-end">Difference (Unbalanced)</td>
                                    <td colSpan="2" className="text-center">
                                        {formatKES(data.total_debit - data.total_credit)}
                                    </td>
                                </tr>
                            )}
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* General Ledger Modal */}
            <GeneralLedgerModal
                isOpen={showLedgerModal}
                onClose={() => setShowLedgerModal(false)}
                accountId={selectedAccount?.account_id}
                dateRange={dateRange}
            />
        </div>
    );
};

export default TrialBalanceReport;
