import React, { useState } from 'react';
import {
    FileBarChart,
    PieChart,
    TrendingUp,
    TrendingDown,
    Download,
    ExternalLink,
    Filter,
    Calendar,
    Search,
    Users,
    ShieldCheck,
    Wallet,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Printer,
    Mail,
    Share2
} from 'lucide-react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { reportStats, reportCategories } from './data/mockReportData';
import './FinanceReports.css';


import { financeService } from '../../services/financeService';
import CashFlowReport from './reports/CashFlowReport';
import TrialBalanceReport from './reports/TrialBalanceReport';
import BalanceSheetReport from './reports/BalanceSheetReport';
import IncomeStatementReport from './reports/IncomeStatementReport';
import FinancialNotesReport from './reports/FinancialNotesReport';

const FinanceReports = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [reportStats, setReportStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netSurplus: 0,
        cashBankBalance: 0,
        outstandingFees: 0,
        collectionRate: 0,
        currentTerm: '',
        fiscalYear: ''
    });

    // Fetch financial overview data on mount
    React.useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        setLoading(true);
        try {
            const data = await financeService.getFinancialOverview();
            setReportStats(data);
        } catch (error) {
            console.error('Failed to fetch financial overview:', error);
            // Keep default/empty values on error
        } finally {
            setLoading(false);
        }
    };

    const formatKES = (val) => new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 0
    }).format(val || 0);

    const kpiCards = [
        {
            label: 'Total Income',
            value: formatKES(reportStats.totalIncome),
            trend: '+12%',
            isPositive: true,
            icon: <TrendingUp size={20} className="text-success" />,
            desc: 'Current Term vs Previous'
        },
        {
            label: 'Total Expenses',
            value: formatKES(reportStats.totalExpenses),
            trend: '+5%',
            isPositive: false,
            icon: <TrendingDown size={20} className="text-danger" />,
            desc: 'Operating Costs'
        },
        {
            label: 'Net Surplus',
            value: formatKES(reportStats.netSurplus),
            trend: '+8%',
            isPositive: true,
            icon: <ArrowUpRight size={20} className="text-info" />,
            desc: 'Financial Margin'
        },
        {
            label: 'Fee Collection',
            value: reportStats.collectionRate + '%',
            trend: 'Target: 90%',
            isPositive: reportStats.collectionRate >= 90,
            icon: <Wallet size={20} className="text-warning" />,
            desc: 'Term Collections'
        }
    ];

    const filteredCategories = selectedCategory === 'all'
        ? reportCategories
        : reportCategories.filter(cat => cat.id === selectedCategory);

    const renderIcon = (iconName) => {
        switch (iconName) {
            case 'FileBarChart': return <FileBarChart size={20} />;
            case 'Users': return <Users size={20} />;
            case 'PieChart': return <PieChart size={20} />;
            case 'ShieldCheck': return <ShieldCheck size={20} />;
            default: return <FileBarChart size={20} />;
        }
    };

    return (
        <DashboardLayout title="Financial Intelligence & Reports">
            <div className="fr-dashboard">
                {/* Section Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Financial Reports</h2>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                            <span className="d-flex align-items-center gap-1">
                                <Calendar size={14} /> Fiscal Year: **{reportStats.fiscalYear}**
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="reports-tabs mb-4">
                    <button
                        className={`report-tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`report-tab ${activeTab === 'trial-balance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('trial-balance')}
                    >
                        Trial Balance
                    </button>
                    <button
                        className={`report-tab ${activeTab === 'income-statement' ? 'active' : ''}`}
                        onClick={() => setActiveTab('income-statement')}
                    >
                        Income Statement
                    </button>
                    <button
                        className={`report-tab ${activeTab === 'balance-sheet' ? 'active' : ''}`}
                        onClick={() => setActiveTab('balance-sheet')}
                    >
                        Balance Sheet
                    </button>
                    <button
                        className={`report-tab ${activeTab === 'cash-flow' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cash-flow')}
                    >
                        Cash Flow
                    </button>
                    <button
                        className={`report-tab ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes
                    </button>
                </div>

                {/* Content */}
                <div className="report-content-area">
                    {activeTab === 'overview' && (
                        <>
                            {/* Executive Summary Snapshot */}
                            <div className="fr-kpi-grid mb-4">
                                {kpiCards.map((card, idx) => (
                                    <div key={idx} className="fr-kpi-card border-0 shadow-sm border-bottom border-4 border-light-subtle">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="fr-kpi-label">{card.label}</span>
                                            {card.icon}
                                        </div>
                                        <div className="fr-kpi-value mb-1">{card.value}</div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className={`small fw-bold ${card.isPositive ? 'text-success' : 'text-danger'}`}>
                                                {card.trend}
                                            </span>
                                            <span className="text-muted x-small" style={{ fontSize: '0.65rem' }}>{card.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reports Grid */}
                            {filteredCategories.map(section => (
                                <div key={section.id} className="fr-category-section">
                                    <h5 className="fr-section-title">{section.name}</h5>
                                    <div className="fr-report-grid">
                                        {section.reports.map(report => (
                                            <div key={report.id} className="fr-report-card shadow-sm hover-shadow transition">
                                                <div className="fr-report-content">
                                                    <div className="fr-report-icon-box">
                                                        {renderIcon(section.icon)}
                                                    </div>
                                                    <h6 className="fr-report-name">{report.name}</h6>
                                                    <p className="fr-report-desc mb-0">{report.description}</p>
                                                </div>
                                                <div className="fr-report-actions">
                                                    <button className="btn btn-sm btn-light text-primary fw-bold d-flex align-items-center gap-1 border-0 bg-transparent p-0" onClick={() => setActiveTab('cash-flow')}>
                                                        <ExternalLink size={14} /> Open
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {activeTab === 'cash-flow' && <CashFlowReport />}
                    {activeTab === 'notes' && <FinancialNotesReport />}

                    {activeTab === 'trial-balance' && <TrialBalanceReport />}
                    {activeTab === 'income-statement' && <IncomeStatementReport />}
                    {activeTab === 'balance-sheet' && <BalanceSheetReport />}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinanceReports;
