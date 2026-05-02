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
    Share2,
    AlertTriangle,
    BarChart3,
    Package,
    Receipt,
    BookOpen,
} from 'lucide-react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { reportCategories } from './data/mockReportData';
import './FinanceReports.css';

import { financeService } from '../../services/financeService';
import CashFlowReport from './reports/CashFlowReport';
import TrialBalanceReport from './reports/TrialBalanceReport';
import BalanceSheetReport from './reports/BalanceSheetReport';
import IncomeStatementReport from './reports/IncomeStatementReport';
import FinancialNotesReport from './reports/FinancialNotesReport';
import FeeCollectionsReport from './reports/FeeCollectionsReport';
import ArrearsReport from './reports/ArrearsReport';
import PaymentSummaryReport from './reports/PaymentSummaryReport';
import ExpenseAnalysisReport from './reports/ExpenseAnalysisReport';
import SupplierBalancesReport from './reports/SupplierBalancesReport';
import CustomerBalancesReport from './reports/CustomerBalancesReport';
import TopDefaultersReport from './reports/TopDefaultersReport';

const TABS = [
    { id: 'overview',         label: 'Overview',           icon: BarChart3 },
    { id: 'trial-balance',    label: 'Trial Balance',      icon: BookOpen },
    { id: 'income-statement', label: 'Income Statement',   icon: TrendingUp },
    { id: 'balance-sheet',    label: 'Balance Sheet',      icon: ShieldCheck },
    { id: 'cash-flow',        label: 'Cash Flow',          icon: Wallet },
    { id: 'notes',            label: 'Notes',              icon: FileBarChart },
    { id: 'fee-collections',  label: 'Fee Collections',    icon: Receipt },
    { id: 'arrears',          label: 'Arrears',            icon: AlertTriangle },
    { id: 'payment-summary',  label: 'Payment Summary',    icon: Download },
    { id: 'expense-analysis', label: 'Expense Analysis',   icon: TrendingDown },
    { id: 'top-defaulters',   label: 'Top Defaulters',     icon: Users },
    { id: 'supplier-balances',label: 'Supplier Balances',  icon: Package },
    { id: 'customer-balances',label: 'Customer Balances',  icon: Users },
];

const FinanceReports = () => {
    const [activeTab, setActiveTab] = useState('overview');
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

    const renderContent = () => {
        switch (activeTab) {
            case 'cash-flow':        return <CashFlowReport />;
            case 'notes':            return <FinancialNotesReport />;
            case 'trial-balance':    return <TrialBalanceReport />;
            case 'income-statement': return <IncomeStatementReport />;
            case 'balance-sheet':    return <BalanceSheetReport />;
            case 'fee-collections':  return <FeeCollectionsReport />;
            case 'arrears':          return <ArrearsReport />;
            case 'payment-summary':  return <PaymentSummaryReport />;
            case 'expense-analysis': return <ExpenseAnalysisReport />;
            case 'top-defaulters':   return <TopDefaultersReport />;
            case 'supplier-balances':return <SupplierBalancesReport />;
            case 'customer-balances':return <CustomerBalancesReport />;
            default: return null;
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
                                <Calendar size={14} /> Fiscal Year: <strong>{reportStats.fiscalYear}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="overflow-x-auto pb-1 mb-4">
                    <div className="flex gap-1 min-w-max border-b border-slate-200 dark:border-slate-700">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${isActive
                                        ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <Icon size={15} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
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

                            {/* Quick-access report cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { id: 'fee-collections',  label: 'Fee Collections',     desc: 'Invoiced vs collected by term, class or month', icon: Receipt,        color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
                                    { id: 'arrears',          label: 'Arrears Report',       desc: 'Students with outstanding balances, aged analysis', icon: AlertTriangle, color: 'bg-red-50 text-red-600 dark:bg-red-900/20' },
                                    { id: 'payment-summary',  label: 'Payment Summary',      desc: 'Daily/weekly/monthly collections breakdown', icon: Download,        color: 'bg-green-50 text-green-600 dark:bg-green-900/20' },
                                    { id: 'expense-analysis', label: 'Expense Analysis',     desc: 'Spending by account with trend and distribution', icon: TrendingDown,  color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
                                    { id: 'top-defaulters',   label: 'Top Defaulters',       desc: 'Students with the highest fee arrears', icon: Users,          color: 'bg-red-50 text-red-700 dark:bg-red-900/20' },
                                    { id: 'supplier-balances',label: 'Supplier Balances',    desc: 'AP outstanding by supplier with invoice drill-down', icon: Package,      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' },
                                    { id: 'customer-balances',label: 'Customer Balances',    desc: 'Non-student AR balances from invoicing module', icon: Users,          color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' },
                                    { id: 'trial-balance',    label: 'Trial Balance',        desc: 'Debit/credit totals per account for any period', icon: BookOpen,      color: 'bg-slate-50 text-slate-600 dark:bg-slate-700' },
                                    { id: 'income-statement', label: 'Income Statement',     desc: 'Revenue vs expenses P&L for any date range', icon: TrendingUp,     color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20' },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${item.color}`}>
                                                <Icon size={20} />
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</h4>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {activeTab !== 'overview' && renderContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinanceReports;
