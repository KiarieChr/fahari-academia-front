export const reportStats = {
    totalIncome: 24300000,
    totalExpenses: 19850000,
    netSurplus: 4450000,
    cashBankBalance: 5200000,
    outstandingFees: 3200000,
    supplierPayables: 1200000,
    budgetUtilization: 78.5,
    collectionRate: 88,
    currentTerm: 'Term 1, 2026',
    fiscalYear: '2026/2027'
};

export const reportCategories = [
    {
        id: 'statements',
        name: 'Financial Statements',
        description: 'Audit-mandatory summaries of school financial position.',
        icon: 'FileBarChart',
        reports: [
            { id: 'inc_exp', name: 'Income & Expenditure Statement', description: 'Monthly/Term category-wise P&L.' },
            { id: 'bal_sheet', name: 'Balance Sheet', description: 'Assets, Liabilities, and Equity snapshot.' },
            { id: 'cashflow', name: 'Cashflow Statement', description: 'Net cash movement across activities.' }
        ]
    },
    {
        id: 'fees',
        name: 'Fees & Receivables',
        description: 'Tracking collections, arrears, and sponsor contributions.',
        icon: 'Users',
        reports: [
            { id: 'fee_summary', name: 'Fee Collection Summary', description: 'Daily/Monthly collection tracking.' },
            { id: 'arrears_list', name: 'Arrears & Defaulters List', description: 'Detailed breakdown of outstanding fees.' },
            { id: 'sponsor_stmt', name: 'Sponsor & Bursary Report', description: 'Allocation and utilization of sponsorships.' }
        ]
    },
    {
        id: 'operational',
        name: 'Operational & Management',
        description: 'Internal reports for board and management decisions.',
        icon: 'PieChart',
        reports: [
            { id: 'supplier_aging', name: 'Supplier Aging Report', description: 'Payables breakdown by age segments.' },
            { id: 'budget_vs_actual', name: 'Budget vs Actual Analysis', description: 'Variance analysis of departmental spending.' },
            { id: 'dept_util', name: 'Departmental Utilization', description: 'Spend tracking by cost centers.' }
        ]
    },
    {
        id: 'statutory',
        name: 'Statutory & Compliance',
        description: 'Kenyan government and tax compliance reports.',
        icon: 'ShieldCheck',
        reports: [
            { id: 'paye_summary', name: 'PAYE Remittance Report', description: 'Statutory income tax summary.' },
            { id: 'nhif_nssf', name: 'NHIF & NSSF Summary', description: 'Social security and health insurance returns.' },
            { id: 'withholding', name: 'Withholding Tax Report', description: 'Taxes withheld from supplier payments.' }
        ]
    }
];

export const incomeSummary = [
    { category: 'Tuition Fees', actual: 8000000, budget: 8500000, variance: -500000 },
    { category: 'Boarding Fees', actual: 2500000, budget: 2200000, variance: 300000 },
    { category: 'Transport Fees', actual: 1000000, budget: 1200000, variance: -200000 },
    { category: 'Canteen Sales', actual: 450000, budget: 400000, variance: 50000 }
];

export const expenseSummary = [
    { category: 'Teacher Salaries', actual: 6500000, budget: 6400000, variance: 100000 },
    { category: 'Support Staff Pay', actual: 1200000, budget: 1200000, variance: 0 },
    { category: 'Food Supplies', actual: 2800000, budget: 3000000, variance: -200000 },
    { category: 'Utilities (Water/Elec)', actual: 450000, budget: 400000, variance: 50000 }
];
