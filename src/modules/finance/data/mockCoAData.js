export const coaHierarchy = [
    {
        id: '1000',
        code: '1000',
        name: 'ASSETS',
        type: 'Asset',
        balance: 18450000,
        children: [
            {
                id: '1100',
                code: '1100',
                name: 'Cash & Cash Equivalents',
                type: 'Asset',
                balance: 5200000,
                children: [
                    { id: '1110', code: '1110', name: 'Petty Cash', type: 'Asset', subType: 'Cash', balance: 50000 },
                    { id: '1120', code: '1120', name: 'M-Pesa Till (School Canteen)', type: 'Asset', subType: 'Mobile Money', balance: 120000 },
                    { id: '1130', code: '1130', name: 'M-Pesa Paybill (Fee Collection)', type: 'Asset', subType: 'Mobile Money', balance: 3450000 },
                    { id: '1140', code: '1140', name: 'KCB Bank Account', type: 'Asset', subType: 'Bank', balance: 1580000 }
                ]
            },
            {
                id: '1200',
                code: '1200',
                name: 'Accounts Receivable',
                type: 'Asset',
                balance: 4500000,
                children: [
                    { id: '1210', code: '1210', name: 'Student Fees Receivable', type: 'Asset', balance: 4200000 },
                    { id: '1220', code: '1220', name: 'Other Receivables', type: 'Asset', balance: 300000 }
                ]
            }
        ]
    },
    {
        id: '2000',
        code: '2000',
        name: 'LIABILITIES',
        type: 'Liability',
        balance: 3150000,
        children: [
            { id: '2100', code: '2100', name: 'Accounts Payable', type: 'Liability', balance: 1200000 },
            {
                id: '2200',
                code: '2200',
                name: 'Statutory Payables',
                type: 'Liability',
                balance: 850000,
                children: [
                    { id: '2210', code: '2210', name: 'PAYE Payable', type: 'Liability', balance: 450000 },
                    { id: '2220', code: '2220', name: 'NHIF Payable', type: 'Liability', balance: 120000 },
                    { id: '2230', code: '2230', name: 'NSSF Payable', type: 'Liability', balance: 280000 }
                ]
            }
        ]
    },
    {
        id: '3000',
        code: '3000',
        name: 'INCOME',
        type: 'Income',
        balance: 12300000,
        children: [
            {
                id: '3100',
                code: '3100',
                name: 'Fee Income',
                type: 'Income',
                balance: 11500000,
                children: [
                    { id: '3110', code: '3110', name: 'Tuition Fees', type: 'Income', balance: 8000000 },
                    { id: '3120', code: '3120', name: 'Boarding Fees', type: 'Income', balance: 2500000 },
                    { id: '3130', code: '3130', name: 'Transport Fees', type: 'Income', balance: 1000000 }
                ]
            }
        ]
    },
    {
        id: '4000',
        code: '4000',
        name: 'EXPENSES',
        type: 'Expense',
        balance: 9180000,
        children: [
            { id: '4100', code: '4100', name: 'Salaries & Wages', type: 'Expense', balance: 6500000 },
            { id: '4200', code: '4200', name: 'Utilities (Water/Electricity)', type: 'Expense', balance: 450000 }
        ]
    }
];

export const coaStats = {
    totalActiveRecords: 52,
    assetsTotal: 18450000,
    liabilitiesTotal: 3150000,
    incomeTotal: 12300000,
    expensesTotal: 9180000,
    unpostedTransactions: 14,
    archivedAccounts: 3
};
