
export const mockStatementData = {
    student: {
        name: "John Doe",
        admNo: "ADM001",
        class: "Form 4",
        intake: "Jan 2024",
        term: "Term 2 2024"
    },
    openingBalance: 5000,
    transactions: [
        { date: '2024-01-05', type: 'Invoice', ref: 'INV-001', description: 'Term 1 Tuition Fees', debit: 45000, credit: 0, balance: 50000 },
        { date: '2024-01-10', type: 'Payment', ref: 'RCP-001', description: 'Bank Deposit - Equity', debit: 0, credit: 20000, balance: 30000 },
        { date: '2024-02-01', type: 'Payment', ref: 'RCP-002', description: 'M-Pesa Payment', debit: 0, credit: 15000, balance: 15000 },
        { date: '2024-05-01', type: 'Invoice', ref: 'INV-002', description: 'Term 2 Tuition Fees', debit: 45000, credit: 0, balance: 60000 },
    ],
    totals: {
        invoiced: 90000,
        paid: 35000,
        outstanding: 60000
    }
};

export const mockIncomeProjection = [
    { term: 'Term 1', expected: 15000000, collected: 14200000 },
    { term: 'Term 2', expected: 15000000, collected: 11500000 },
    { term: 'Term 3', expected: 15000000, collected: 0 },
];

export const mockClassArrears = [
    { name: 'Form 1', expected: 4500000, paid: 4000000, arrears: 500000 },
    { name: 'Form 2', expected: 4200000, paid: 3000000, arrears: 1200000 },
    { name: 'Form 3', expected: 4000000, paid: 2500000, arrears: 1500000 },
    { name: 'Form 4', expected: 3800000, paid: 3500000, arrears: 300000 },
];

export const mockIncomeSummary = [
    { name: 'Bank Deposit', value: 25000000 },
    { name: 'M-Pesa', value: 15000000 },
    { name: 'Cash', value: 2000000 },
    { name: 'Cheque', value: 5000000 },
];

export const mockCollectionStats = {
    totalExpected: 60000000,
    totalCollected: 42000000,
    collectionRate: 70,
    statusBreakdown: [
        { name: 'Fully Paid', value: 450 },
        { name: 'Partial', value: 300 },
        { name: 'Unpaid', value: 100 },
    ]
};
