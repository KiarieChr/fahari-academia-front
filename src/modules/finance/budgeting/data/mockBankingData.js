// Banking Planning Mock Data for School ERP Budgeting Dashboard

// Cash Deposit Planning Data
export const cashDeposits = [
    {
        id: 'CASH-001',
        source: 'Fees',
        amount: 850000,
        expectedBankingDate: '2026-01-15',
        actualBankingDate: '2026-01-15',
        linkedCashbook: 'CB-001',
        term: 'Term 1',
        month: 'January',
        year: '2026',
        status: 'Banked',
        notes: 'Form 1-4 school fees collection - Week 1'
    },
    {
        id: 'CASH-002',
        source: 'Fees',
        amount: 920000,
        expectedBankingDate: '2026-01-22',
        actualBankingDate: '2026-01-23',
        linkedCashbook: 'CB-001',
        term: 'Term 1',
        month: 'January',
        year: '2026',
        status: 'Banked',
        notes: 'School fees collection - Week 2'
    },
    {
        id: 'CASH-003',
        source: 'Events',
        amount: 180000,
        expectedBankingDate: '2026-01-20',
        actualBankingDate: null,
        linkedCashbook: 'CB-002',
        term: 'Term 1',
        month: 'January',
        year: '2026',
        status: 'Delayed',
        notes: 'Inter-school sports day ticket sales'
    },
    {
        id: 'CASH-004',
        source: 'Fees',
        amount: 1050000,
        expectedBankingDate: '2026-01-29',
        actualBankingDate: '2026-01-29',
        linkedCashbook: 'CB-001',
        term: 'Term 1',
        month: 'January',
        year: '2026',
        status: 'Banked',
        notes: 'School fees collection - Week 3'
    },
    {
        id: 'CASH-005',
        source: 'Donations',
        amount: 250000,
        expectedBankingDate: '2026-02-05',
        actualBankingDate: null,
        linkedCashbook: 'CB-003',
        term: 'Term 1',
        month: 'February',
        year: '2026',
        status: 'Planned',
        notes: 'Alumni association donation for library'
    },
    {
        id: 'CASH-006',
        source: 'Sponsors',
        amount: 500000,
        expectedBankingDate: '2026-02-10',
        actualBankingDate: null,
        linkedCashbook: 'CB-004',
        term: 'Term 1',
        month: 'February',
        year: '2026',
        status: 'Planned',
        notes: 'Corporate sponsor - ABC Company'
    },
    {
        id: 'CASH-007',
        source: 'Fees',
        amount: 980000,
        expectedBankingDate: '2026-02-12',
        actualBankingDate: null,
        linkedCashbook: 'CB-001',
        term: 'Term 1',
        month: 'February',
        year: '2026',
        status: 'Planned',
        notes: 'School fees collection - Week 4'
    },
    {
        id: 'CASH-008',
        source: 'Events',
        amount: 120000,
        expectedBankingDate: '2026-01-18',
        actualBankingDate: null,
        linkedCashbook: 'CB-002',
        term: 'Term 1',
        month: 'January',
        year: '2026',
        status: 'Delayed',
        notes: 'School drama performance ticket sales - OVERDUE'
    }
];

// Cheque Deposit Planning Data
export const chequeDeposits = [
    {
        id: 'CHQ-001',
        chequeNumber: '001234',
        bankName: 'KCB Bank',
        drawerName: 'Ministry of Education',
        amount: 2000000,
        receivedDate: '2026-01-10',
        expectedClearingDate: '2026-01-13',
        actualClearingDate: '2026-01-13',
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Cleared',
        notes: 'Government capitation - Term 1'
    },
    {
        id: 'CHQ-002',
        chequeNumber: '005678',
        bankName: 'Equity Bank',
        drawerName: 'XYZ Foundation',
        amount: 750000,
        receivedDate: '2026-01-15',
        expectedClearingDate: '2026-01-18',
        actualClearingDate: '2026-01-18',
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Cleared',
        notes: 'Scholarship fund for needy students'
    },
    {
        id: 'CHQ-003',
        chequeNumber: '009012',
        bankName: 'Co-operative Bank',
        drawerName: 'Parent - John Kamau',
        amount: 45000,
        receivedDate: '2026-01-20',
        expectedClearingDate: '2026-01-23',
        actualClearingDate: null,
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Deposited',
        notes: 'School fees for 2 students'
    },
    {
        id: 'CHQ-004',
        chequeNumber: '003456',
        bankName: 'NCBA Bank',
        drawerName: 'ABC Corporation',
        amount: 1200000,
        receivedDate: '2026-01-22',
        expectedClearingDate: '2026-01-25',
        actualClearingDate: null,
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Deposited',
        notes: 'Corporate sponsorship for ICT lab'
    },
    {
        id: 'CHQ-005',
        chequeNumber: '007890',
        bankName: 'Equity Bank',
        drawerName: 'Parent - Mary Wanjiru',
        amount: 38000,
        receivedDate: '2026-01-25',
        expectedClearingDate: '2026-01-28',
        actualClearingDate: '2026-01-28',
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Bounced',
        notes: 'BOUNCED - Insufficient funds. Parent contacted.'
    },
    {
        id: 'CHQ-006',
        chequeNumber: '002345',
        bankName: 'KCB Bank',
        drawerName: 'County Government',
        amount: 1500000,
        receivedDate: '2026-01-28',
        expectedClearingDate: '2026-01-31',
        actualClearingDate: null,
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Received',
        notes: 'Bursary fund for students'
    },
    {
        id: 'CHQ-007',
        chequeNumber: '008901',
        bankName: 'Stanbic Bank',
        drawerName: 'Parent - Peter Omondi',
        amount: 52000,
        receivedDate: '2026-02-01',
        expectedClearingDate: '2026-02-04',
        actualClearingDate: null,
        linkedBankAccount: 'ACC-001',
        term: 'Term 1',
        year: '2026',
        status: 'Received',
        notes: 'School fees for 1 student'
    }
];

// Banking Summary Statistics
export const bankingSummary = {
    totalPlannedCashDeposits: 5050000, // Sum of all cash deposits
    totalPlannedChequeDeposits: 5585000, // Sum of all cheque deposits
    totalActualBanked: 5570000, // Sum of banked cash + cleared cheques
    pendingDeposits: 4065000, // Planned + Received + Deposited - Bounced
    depositVariance: -38000, // Actual - Planned (negative means shortfall)
    cashFlowGap: 1500000, // Expected shortfall vs budget needs
    budgetCoveragePercentage: 52.4, // (totalActualBanked / totalBudget) * 100
    overdueDeposits: 2, // Count of delayed/overdue deposits
    bouncedCheques: 1, // Count of bounced cheques
    term: 'Term 1',
    year: '2026'
};

// Monthly Deposit Trends (for charts)
export const depositTrends = [
    {
        month: 'Jan',
        plannedCash: 3120000,
        actualCash: 2820000,
        plannedCheque: 4035000,
        actualCheque: 2750000,
        budgetObligations: 7200000
    },
    {
        month: 'Feb',
        plannedCash: 1930000,
        actualCash: 0,
        plannedCheque: 1550000,
        actualCheque: 0,
        budgetObligations: 7200000
    },
    {
        month: 'Mar',
        plannedCash: 2100000,
        actualCash: 0,
        plannedCheque: 1800000,
        actualCheque: 0,
        budgetObligations: 7200000
    },
    {
        month: 'Apr',
        plannedCash: 1850000,
        actualCash: 0,
        plannedCheque: 2200000,
        actualCheque: 0,
        budgetObligations: 6000000
    },
    {
        month: 'May',
        plannedCash: 2200000,
        actualCash: 0,
        plannedCheque: 1900000,
        actualCheque: 0,
        budgetObligations: 6500000
    }
];

// Banking Alerts
export const bankingAlerts = [
    {
        id: 'BANK-ALERT-001',
        type: 'overdue-deposit',
        severity: 'high',
        category: 'Cash Deposit',
        message: 'Cash deposit CASH-008 (KES 120,000) is overdue by 9 days',
        date: '2026-01-27',
        relatedId: 'CASH-008',
        actionRequired: 'Contact cashbook officer to bank immediately'
    },
    {
        id: 'BANK-ALERT-002',
        type: 'overdue-deposit',
        severity: 'warning',
        category: 'Cash Deposit',
        message: 'Cash deposit CASH-003 (KES 180,000) is delayed - expected 2026-01-20',
        date: '2026-01-27',
        relatedId: 'CASH-003',
        actionRequired: 'Follow up on banking status'
    },
    {
        id: 'BANK-ALERT-003',
        type: 'bounced-cheque',
        severity: 'high',
        category: 'Cheque Deposit',
        message: 'Cheque CHQ-005 (KES 38,000) has bounced - Insufficient funds',
        date: '2026-01-28',
        relatedId: 'CHQ-005',
        actionRequired: 'Contact parent Mary Wanjiru for alternative payment'
    },
    {
        id: 'BANK-ALERT-004',
        type: 'cash-flow-gap',
        severity: 'high',
        category: 'Cash Flow',
        message: 'February cash flow gap: Planned deposits (KES 3,480,000) fall short of budget obligations (KES 7,200,000) by KES 3,720,000',
        date: '2026-01-27',
        relatedId: null,
        actionRequired: 'Plan additional deposits or defer non-critical expenses'
    },
    {
        id: 'BANK-ALERT-005',
        type: 'suggested-target',
        severity: 'info',
        category: 'Recommendation',
        message: 'Suggested deposit target for February: KES 4,500,000 to maintain 60% budget coverage',
        date: '2026-01-27',
        relatedId: null,
        actionRequired: 'Review fee collection and sponsorship pipeline'
    },
    {
        id: 'BANK-ALERT-006',
        type: 'pending-clearance',
        severity: 'warning',
        category: 'Cheque Deposit',
        message: '2 cheques (KES 1,245,000) pending clearance - monitor bank statements',
        date: '2026-01-27',
        relatedId: null,
        actionRequired: 'Verify clearance by end of week'
    }
];

// Cashbook Reference Data (for dropdowns)
export const cashbooks = [
    { id: 'CB-001', name: 'Main Cashbook - School Fees', code: 'CB-001' },
    { id: 'CB-002', name: 'Events Cashbook', code: 'CB-002' },
    { id: 'CB-003', name: 'Donations Cashbook', code: 'CB-003' },
    { id: 'CB-004', name: 'Sponsors Cashbook', code: 'CB-004' }
];

// Bank Account Reference Data (for dropdowns)
export const bankAccounts = [
    { id: 'ACC-001', name: 'KCB - Main Operating Account', accountNumber: '1234567890', code: 'ACC-001' },
    { id: 'ACC-002', name: 'Equity - Projects Account', accountNumber: '0987654321', code: 'ACC-002' },
    { id: 'ACC-003', name: 'Co-op - Savings Account', accountNumber: '5678901234', code: 'ACC-003' }
];

// Kenyan Banks (for dropdowns)
export const kenyanBanks = [
    'KCB Bank',
    'Equity Bank',
    'Co-operative Bank',
    'NCBA Bank',
    'Stanbic Bank',
    'Standard Chartered',
    'Absa Bank',
    'DTB Bank',
    'I&M Bank',
    'Family Bank',
    'Barclays Bank',
    'CBA Bank',
    'National Bank',
    'Prime Bank',
    'Gulf African Bank'
];

// Deposit Sources (for dropdowns)
export const depositSources = [
    'Fees',
    'Sponsors',
    'Events',
    'Donations',
    'Government Grants',
    'Other'
];

// Deposit Status Options
export const cashDepositStatuses = [
    { value: 'Planned', label: 'Planned', color: 'primary' },
    { value: 'Banked', label: 'Banked', color: 'success' },
    { value: 'Delayed', label: 'Delayed', color: 'warning' }
];

export const chequeDepositStatuses = [
    { value: 'Received', label: 'Received', color: 'info' },
    { value: 'Deposited', label: 'Deposited', color: 'warning' },
    { value: 'Cleared', label: 'Cleared', color: 'success' },
    { value: 'Bounced', label: 'Bounced', color: 'danger' }
];
