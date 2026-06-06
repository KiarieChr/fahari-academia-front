import React, { useState, useEffect } from 'react';
import { Download, Printer, Filter, Calendar } from 'lucide-react';
import { financeService } from '../../../services/financeService';
import { toast } from 'react-toastify';
import ExportButton from './ExportButton';

const CashFlowReport = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await financeService.getCashFlowStatement(dateRange.startDate, dateRange.endDate);
            setReportData(res.data);
            toast.success("Report generated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
    };

    if (loading && !reportData) return <div className="p-5 text-center">Loading Cash Flow Statement...</div>;

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1 fw-bold">Statement of Cash Flows</h5>
                        <small className="text-muted">Indirect Method</small>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light"><Calendar size={14} /></span>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            />
                            <span className="input-group-text bg-light">to</span>
                            <input
                                type="date"
                                className="form-control"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            />
                            <button className="btn btn-primary" onClick={fetchReport}>Run Report</button>
                        </div>
                        {reportData && (
                            <ExportButton 
                                title="Statement of Cash Flows"
                                subtitle={`Period: ${dateRange.startDate || '-'} to ${dateRange.endDate || '-'}`}
                                headers={['Activity', 'Amount']}
                                getRows={() => {
                                    const rows = [];
                                    rows.push(['OPERATING ACTIVITIES', '']);
                                    rows.push(['Net Income', reportData.operating_activities.net_income]);
                                    rows.push(['Adjustments for Working Capital:', '']);
                                    rows.push(['Decrease (Increase) in Accounts Receivable', reportData.operating_activities.adjustments.accounts_receivable]);
                                    rows.push(['Decrease (Increase) in Inventory', reportData.operating_activities.adjustments.inventory]);
                                    rows.push(['Increase (Decrease) in Accounts Payable', reportData.operating_activities.adjustments.accounts_payable]);
                                    rows.push(['Net Cash from Operating Activities', reportData.operating_activities.net_cash]);
                                    
                                    rows.push(['INVESTING ACTIVITIES', '']);
                                    rows.push(['Purchase/Sale of Fixed Assets', reportData.investing_activities.fixed_assets]);
                                    rows.push(['Net Cash from Investing Activities', reportData.investing_activities.net_cash]);

                                    rows.push(['FINANCING ACTIVITIES', '']);
                                    rows.push(['Long Term Loans (Net)', reportData.financing_activities.loans]);
                                    rows.push(['Equity Capital / Drawings', reportData.financing_activities.equity]);
                                    rows.push(['Net Cash from Financing Activities', reportData.financing_activities.net_cash]);

                                    rows.push(['SUMMARY', '']);
                                    rows.push(['Net Change in Cash', reportData.summary.net_change]);
                                    rows.push(['Opening Cash Balance', reportData.summary.opening_balance]);
                                    rows.push(['Closing Cash Balance', reportData.summary.closing_balance]);

                                    return rows;
                                }}
                                filename="Statement_of_Cash_Flows"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="card-body p-4">
                {reportData ? (
                    <div className="reports-table-container">
                        {/* Operating Activities */}
                        <h6 className="fw-bold text-uppercase text-secondary mb-3">Operating Activities</h6>
                        <table className="table table-sm table-hover mb-4">
                            <tbody>
                                <tr>
                                    <td className="ps-0">Net Income</td>
                                    <td className="text-end fw-bold">{formatMoney(reportData.operating_activities.net_income)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" className="fw-bold text-muted small pt-3">Adjustments for Working Capital</td>
                                </tr>
                                <tr>
                                    <td className="ps-3">Decrease (Increase) in Accounts Receivable</td>
                                    <td className="text-end">{formatMoney(reportData.operating_activities.adjustments.accounts_receivable)}</td>
                                </tr>
                                <tr>
                                    <td className="ps-3">Decrease (Increase) in Inventory</td>
                                    <td className="text-end">{formatMoney(reportData.operating_activities.adjustments.inventory)}</td>
                                </tr>
                                <tr>
                                    <td className="ps-3">Increase (Decrease) in Accounts Payable</td>
                                    <td className="text-end">{formatMoney(reportData.operating_activities.adjustments.accounts_payable)}</td>
                                </tr>
                                <tr className="table-light">
                                    <td className="fw-bold">Net Cash from Operating Activities</td>
                                    <td className="text-end fw-bold text-primary">{formatMoney(reportData.operating_activities.net_cash)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Investing Activities */}
                        <h6 className="fw-bold text-uppercase text-secondary mb-3">Investing Activities</h6>
                        <table className="table table-sm table-hover mb-4">
                            <tbody>
                                <tr>
                                    <td className="ps-0">Purchase/Sale of Fixed Assets</td>
                                    <td className="text-end">{formatMoney(reportData.investing_activities.fixed_assets)}</td>
                                </tr>
                                <tr className="table-light">
                                    <td className="fw-bold">Net Cash from Investing Activities</td>
                                    <td className="text-end fw-bold text-primary">{formatMoney(reportData.investing_activities.net_cash)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Financing Activities */}
                        <h6 className="fw-bold text-uppercase text-secondary mb-3">Financing Activities</h6>
                        <table className="table table-sm table-hover mb-4">
                            <tbody>
                                <tr>
                                    <td className="ps-0">Long Term Loans (Net)</td>
                                    <td className="text-end">{formatMoney(reportData.financing_activities.loans)}</td>
                                </tr>
                                <tr>
                                    <td className="ps-0">Equity Capital / Drawings</td>
                                    <td className="text-end">{formatMoney(reportData.financing_activities.equity)}</td>
                                </tr>
                                <tr className="table-light">
                                    <td className="fw-bold">Net Cash from Financing Activities</td>
                                    <td className="text-end fw-bold text-primary">{formatMoney(reportData.financing_activities.net_cash)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Summary */}
                        <div className="bg-light p-3 rounded rounded-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Net Change in Cash</span>
                                <span className="fw-bold">{formatMoney(reportData.summary.net_change)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Opening Cash Balance</span>
                                <span>{formatMoney(reportData.summary.opening_balance)}</span>
                            </div>
                            <div className="d-flex justify-content-between pt-2 border-top border-secondary">
                                <strong className="fs-5">Closing Cash Balance</strong>
                                <strong className="fs-5 text-success">{formatMoney(reportData.summary.closing_balance)}</strong>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="text-center text-muted py-5">
                        Please select a date range and run the report.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashFlowReport;

