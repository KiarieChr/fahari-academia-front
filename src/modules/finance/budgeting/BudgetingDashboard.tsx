import React, { useState } from 'react';
import { Calendar, Filter, Download, FileSpreadsheet, Printer } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import BudgetSummaryCards from './components/BudgetSummaryCards';
import BudgetVsActualChart from './components/BudgetVsActualChart';
import BudgetUtilizationChart from './components/BudgetUtilizationChart';
import MonthlyTrendChart from './components/MonthlyTrendChart';
import BudgetAlerts from './components/BudgetAlerts';
import DepartmentBudgetTable from './components/DepartmentBudgetTable';
import BankingSummaryCards from './components/BankingSummaryCards';
import CashDepositPlanner from './components/CashDepositPlanner';
import ChequeDepositPlanner from './components/ChequeDepositPlanner';
import BudgetVsBankingChart from './components/BudgetVsBankingChart';
import DepositTypeChart from './components/DepositTypeChart';
import CashFlowProjection from './components/CashFlowProjection';
import {
    departmentBudgets,
    monthlyTrend,
    budgetSummary,
    budgetAlerts,
    budgetPeriods,
    budgetUtilization,
    budgetVsActualChart
} from './data/mockBudgetData';
import {
    bankingSummary,
    cashDeposits,
    chequeDeposits,
    depositTrends,
    bankingAlerts
} from './data/mockBankingData';
import { filterByPeriod } from './utils/budgetUtils';



const BudgetingDashboard = () => {
    const [selectedYear, setSelectedYear] = useState(budgetPeriods.currentYear);
    const [selectedTerm, setSelectedTerm] = useState(budgetPeriods.currentTerm);
    const [activeTab, setActiveTab] = useState('overview');

    // Filter data by selected period
    const filteredDepartments = filterByPeriod(departmentBudgets, selectedTerm, selectedYear);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'departments', label: 'Departments', icon: '🏢' },
        { id: 'trends', label: 'Trends', icon: '📈' },
        { id: 'alerts', label: 'Alerts', icon: '🔔', badge: budgetAlerts.length },
        { id: 'banking', label: 'Banking', icon: '🏦', badge: bankingAlerts.length }
    ];

    return (
        <DashboardLayout title="Budgeting Dashboard">
            <div className="budgeting-dashboard">
                {/* Header Section */}
                <div className="budget-section-header">
                    <div>
                        <h2 className="fw-bold mb-1">Budget vs Actual Analysis</h2>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                            <span className="d-flex align-items-center gap-1">
                                <Calendar size={14} /> Academic Year: <strong>{selectedYear}</strong>
                            </span>
                            <span className="d-flex align-items-center gap-1">
                                <Filter size={14} /> Current Term: <strong>{selectedTerm}</strong>
                            </span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <select
                            className="form-select form-select-sm"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{ width: '120px' }}
                        >
                            {budgetPeriods.years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <select
                            className="form-select form-select-sm"
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                            style={{ width: '120px' }}
                        >
                            {budgetPeriods.terms.map(term => (
                                <option key={term} value={term}>{term}</option>
                            ))}
                        </select>
                        <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-1">
                                <Printer size={14} /> Print
                            </button>
                            <button className="btn btn-outline-secondary d-flex align-items-center gap-1">
                                <FileSpreadsheet size={14} /> Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <BudgetSummaryCards summary={budgetSummary} />

                {/* Tab Navigation */}
                <div className="budget-tabs-container mb-4">
                    <div className="budget-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`budget-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="me-2">{tab.icon}</span>
                                {tab.label}
                                {tab.badge && (
                                    <span className="badge bg-danger ms-2">{tab.badge}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="budget-tab-content">
                    {activeTab === 'overview' && (
                        <div>
                            {/* Alerts */}
                            <BudgetAlerts alerts={budgetAlerts} />

                            {/* Charts Row */}
                            <div className="row mb-4">
                                <div className="col-lg-8 mb-4">
                                    <BudgetVsActualChart data={budgetVsActualChart} />
                                </div>
                                <div className="col-lg-4 mb-4">
                                    <BudgetUtilizationChart data={budgetUtilization} />
                                </div>
                            </div>

                            {/* Monthly Trend */}
                            <div className="row">
                                <div className="col-12">
                                    <MonthlyTrendChart data={monthlyTrend} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'departments' && (
                        <DepartmentBudgetTable departments={filteredDepartments} />
                    )}

                    {activeTab === 'trends' && (
                        <div>
                            <div className="row mb-4">
                                <div className="col-12">
                                    <MonthlyTrendChart data={monthlyTrend} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-6">
                                    <BudgetVsActualChart data={budgetVsActualChart} />
                                </div>
                                <div className="col-lg-6">
                                    <BudgetUtilizationChart data={budgetUtilization} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div>
                            <BudgetAlerts alerts={budgetAlerts} />

                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">Alert Summary</h6>
                                    <div className="row text-center">
                                        <div className="col-md-4">
                                            <div className="p-3 bg-danger-subtle rounded">
                                                <div className="h3 mb-0 text-danger">
                                                    {budgetAlerts.filter(a => a.severity === 'high').length}
                                                </div>
                                                <div className="small text-muted">High Priority</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-warning-subtle rounded">
                                                <div className="h3 mb-0 text-warning">
                                                    {budgetAlerts.filter(a => a.severity === 'warning').length}
                                                </div>
                                                <div className="small text-muted">Warnings</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 bg-info-subtle rounded">
                                                <div className="h3 mb-0 text-info">
                                                    {budgetAlerts.filter(a => a.severity === 'info').length}
                                                </div>
                                                <div className="small text-muted">Informational</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'banking' && (
                        <div>
                            <BankingSummaryCards summary={bankingSummary} />

                            <div className="row mb-4">
                                <div className="col-lg-8 mb-4">
                                    <BudgetVsBankingChart data={depositTrends} />
                                </div>
                                <div className="col-lg-4 mb-4">
                                    <DepositTypeChart data={depositTrends} />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <CashFlowProjection
                                        deposits={[...cashDeposits, ...chequeDeposits]}
                                        budgetObligations={departmentBudgets}
                                    />
                                </div>
                            </div>

                            <div className="row mb-4">
                                <div className="col-12">
                                    <CashDepositPlanner deposits={cashDeposits} />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-12">
                                    <ChequeDepositPlanner deposits={chequeDeposits} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BudgetingDashboard;
