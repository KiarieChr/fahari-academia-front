export const journalEntries = [
    {
        id: 'VJ-2026-0001',
        date: '2026-01-20',
        description: 'Monthly Salary Accrual - Jan 2026',
        reference: 'SAL/JAN/26',
        totalDebit: 1540000,
        totalCredit: 1540000,
        status: 'Posted',
        source: 'Payroll',
        createdBy: 'Bursar Maina',
        approvedBy: 'Principal Okoth',
        lines: [
            { account: '5100 - Salaries & Wages', debit: 1540000, credit: 0 },
            { account: '2210 - PAYE Payable', debit: 0, credit: 450000 },
            { account: '2220 - NHIF Payable', debit: 0, credit: 120000 },
            { account: '2230 - NSSF Payable', debit: 0, credit: 280000 },
            { account: '2100 - Accounts Payable (Staff)', debit: 0, credit: 690000 }
        ]
    },
    {
        id: 'VJ-2026-0002',
        date: '2026-01-22',
        description: 'M-Pesa Till to Bank Settlement',
        reference: 'TXN-9821-MP',
        totalDebit: 120000,
        totalCredit: 120000,
        status: 'Pending',
        source: 'Manual',
        createdBy: 'Clerk Faith',
        approvedBy: '-',
        lines: [
            { account: '1140 - KCB Bank Account', debit: 120000, credit: 0 },
            { account: '1120 - M-Pesa Till', debit: 0, credit: 120000 }
        ]
    },
    {
        id: 'VJ-2026-0003',
        date: '2026-01-24',
        description: 'Bank Charges - KCB Statement',
        reference: 'KCB/CHG/JAN',
        totalDebit: 450,
        totalCredit: 0,
        status: 'Unbalanced',
        source: 'Manual',
        createdBy: 'Bursar Maina',
        approvedBy: '-',
        lines: [
            { account: '5200 - Utilities & maintenance', debit: 450, credit: 0 }
        ]
    },
    {
        id: 'VJ-2026-0004',
        date: '2026-01-25',
        description: 'Reversal: Wrong Fee Allocation (INV-882)',
        reference: 'REV-882',
        totalDebit: 15000,
        totalCredit: 15000,
        status: 'Posted',
        source: 'Fees',
        createdBy: 'System',
        approvedBy: 'Bursar Maina',
        isReversal: true
    }
];

export const journalStats = {
    totalThisMonth: 142,
    posted: 128,
    pendingApproval: 8,
    drafts: 5,
    unbalanced: 1,
    reversed: 2,
    lastPostingDate: '2026-01-25',
    periodStatus: 'Open'
};

export const journalTemplates = [
    { name: 'Bank Reconciliation', icon: 'Building2' },
    { name: 'M-Pesa Clearing', icon: 'Smartphone' },
    { name: 'Payroll Adjustments', icon: 'Users' },
    { name: 'Depreciation Posting', icon: 'TrendingDown' }
];
