import React, { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { toast } from 'react-toastify';
import { Download, Printer, RefreshCw, Calendar, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';

const IncomeStatementReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: new Date().toISOString().split('T')[0]
    });

    const [expanded, setExpanded] = useState({
        revenue: true,
        expenses: true
    });

    useEffect(() => {
        // Set default start date to beginning of current year
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
            const res = await financeService.getIncomeStatement(dateRange.start_date, dateRange.end_date);
            const reportData = res.revenue ? res : (res.data || null);
            setData(reportData);
        } catch (error) {
            console.error("Failed to fetch Income Statement:", error);
            toast.error("Failed to load Income Statement.");
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
                <h5 className="mb-0 fw-bold">Income Statement (P&L)</h5>
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
                        Apply Filters
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Calculating profitability...</p>
                    </div>
                ) : data ? (
                    <div className="row justify-content-center">
                        <div className="col-lg-10">
                            {/* Summary Card */}
                            <div className={`card mb-4 border-0 shadow-sm ${data.summary.net_income >= 0 ? 'bg-success' : 'bg-danger'} bg-opacity-10`}>
                                <div className="card-body d-flex justify-content-between align-items-center p-4">
                                    <div>
                                        <h6 className="text-muted text-uppercase small fw-bold mb-1">
                                            Net Income / (Loss)
                                        </h6>
                                        <h2 className={`mb-0 fw-bold ${data.summary.net_income >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {formatKES(data.summary.net_income)}
                                        </h2>
                                    </div>
                                    <div className={`p-3 rounded-circle bg-white shadow-sm ${data.summary.net_income >= 0 ? 'text-success' : 'text-danger'}`}>
                                        <TrendingUp size={32} />
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Section */}
                            {renderSection('Revenue', data.revenue, 'revenue', 'success')}

                            {/* Expenses Section */}
                            {renderSection('Expenses', data.expenses, 'expenses', 'danger')}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted">
                        Select a date range to generate report.
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomeStatementReport;
