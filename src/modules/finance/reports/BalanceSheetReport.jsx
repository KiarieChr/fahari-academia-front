import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { toast } from 'react-toastify';
import { Download, Printer, RefreshCw, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

const BalanceSheetReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

    // Collapsible sections state
    const [expanded, setExpanded] = useState({
        assets: true,
        liabilities: true,
        equity: true
    });

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await financeService.getBalanceSheet(asOfDate);
            // Handle potentially wrapped response
            const reportData = res.assets ? res : (res.data || null);
            setData(reportData);
        } catch (error) {
            console.error("Failed to fetch Balance Sheet:", error);
            toast.error("Failed to load Balance Sheet.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const formatKES = (val) => new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
    }).format(val || 0);

    const renderAccountRow = (acc, idx) => (
        <div key={idx} className="d-flex justify-content-between py-2 border-bottom hover-bg-light small">
            <div className="ps-4">
                <span className="text-muted me-2 font-monospace">{acc.code}</span>
                <span>{acc.name}</span>
                {acc.sub_type && <span className="badge bg-light text-secondary ms-2 scale-75 border">{acc.sub_type}</span>}
            </div>
            <div className="font-monospace fw-medium">
                {formatKES(acc.balance)}
            </div>
        </div>
    );

    const renderSection = (title, sectionData, sectionKey, colorClass = "primary") => {
        const isExpanded = expanded[sectionKey];
        const total = sectionData?.total || 0;
        const lines = sectionData?.lines || [];

        return (
            <div className="mb-4">
                <div
                    className={`d-flex justify-content-between align-items-center p-3 bg-${colorClass} bg-opacity-10 rounded border border-${colorClass} border-opacity-25 cursor-pointer`}
                    onClick={() => toggleSection(sectionKey)}
                >
                    <div className="d-flex align-items-center gap-2">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        <h6 className="mb-0 fw-bold">{title}</h6>
                    </div>
                    <h6 className="mb-0 fw-bold font-monospace">{formatKES(total)}</h6>
                </div>

                {isExpanded && (
                    <div className="border-start border-end border-bottom rounded-bottom bg-white">
                        {lines.length > 0 ? (
                            <div className="p-2">
                                {lines.map(renderAccountRow)}
                            </div>
                        ) : (
                            <div className="text-center py-3 text-muted small fst-italic">No accounts with balances</div>
                        )}
                        <div className="p-2 bg-light border-top d-flex justify-content-between fw-bold">
                            <span className="ps-4">Total {title}</span>
                            <span className="font-monospace">{formatKES(total)}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Balance Sheet</h5>
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
                    <div style={{ minWidth: '200px' }}>
                        <label className="form-label small text-muted mb-1">As Of Date</label>
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-white"><Calendar size={14} /></span>
                            <input
                                type="date"
                                className="form-control"
                                value={asOfDate}
                                onChange={(e) => setAsOfDate(e.target.value)}
                            />
                        </div>
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
                        <p className="mt-2 text-muted">Calculating financial position...</p>
                    </div>
                ) : data ? (
                    <div className="row g-4">
                        {/* Assets Column */}
                        <div className="col-lg-6">
                            {renderSection('Assets', data.assets, 'assets', 'success')}
                        </div>

                        {/* Liabilities & Equity Column */}
                        <div className="col-lg-6">
                            {renderSection('Liabilities', data.liabilities, 'liabilities', 'warning')}
                            {renderSection('Equity', data.equity, 'equity', 'info')}

                            {/* Verification Check */}
                            <div className={`alert ${Math.abs(data.summary.check_diff) < 0.01 ? 'alert-success' : 'alert-danger'} d-flex justify-content-between align-items-center mt-3 mb-0`}>
                                <div>
                                    <div className="fw-bold small text-uppercase mb-1">Total Liabilities & Equity</div>
                                    <div className="font-monospace fs-5 fw-bold">{formatKES(data.summary.total_liabilities_equity)}</div>
                                </div>
                                <div className="text-end border-start ps-3">
                                    <div className="small text-muted">Difference</div>
                                    <div className="font-monospace fw-bold">{formatKES(data.summary.check_diff)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted">
                        No data available.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceSheetReport;
