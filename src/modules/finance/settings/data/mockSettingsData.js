// Finance Settings Mock Data

// Cashbook Settings
export const cashbooks = [
    {
        id: 'CB-001',
        name: 'Petty Cash',
        type: 'Cash',
        accountNumber: 'PC-2026',
        linkedAccount: 'Cash on Hand',
        currency: 'KES',
        openingBalance: 50000,
        currentBalance: 32500,
        isActive: true,
        isDefault: false,
        createdDate: '2026-01-01'
    },
    {
        id: 'CB-002',
        name: 'KCB Main Account',
        type: 'Bank',
        accountNumber: '1234567890',
        linkedAccount: 'Bank - KCB',
        currency: 'KES',
        openingBalance: 5000000,
        currentBalance: 4250000,
        isActive: true,
        isDefault: true,
        createdDate: '2026-01-01'
    },
    {
        id: 'CB-003',
        name: 'M-Pesa Paybill',
        type: 'Mobile Money',
        accountNumber: '247247',
        linkedAccount: 'M-Pesa Collections',
        currency: 'KES',
        openingBalance: 0,
        currentBalance: 850000,
        isActive: true,
        isDefault: false,
        createdDate: '2026-01-01'
    },
    {
        id: 'CB-004',
        name: 'M-Pesa Till',
        type: 'Mobile Money',
        accountNumber: '5678901',
        linkedAccount: 'M-Pesa Till',
        currency: 'KES',
        openingBalance: 0,
        currentBalance: 125000,
        isActive: true,
        isDefault: false,
        createdDate: '2026-01-01'
    }
];

// Payment Methods
export const paymentMethods = [
    {
        id: 'PM-001',
        name: 'M-Pesa Paybill',
        type: 'mobile_money',
        linkedCashbook: 'CB-003',
        isActive: true,
        requiresReference: true,
        referenceLabel: 'M-Pesa Code',
        allowedModules: ['Fees', 'AP', 'Payroll'],
        isDefault: false
    },
    {
        id: 'PM-002',
        name: 'M-Pesa Till',
        type: 'mobile_money',
        linkedCashbook: 'CB-004',
        isActive: true,
        requiresReference: true,
        referenceLabel: 'M-Pesa Code',
        allowedModules: ['Fees'],
        isDefault: false
    },
    {
        id: 'PM-003',
        name: 'Bank Transfer',
        type: 'bank',
        linkedCashbook: 'CB-002',
        isActive: true,
        requiresReference: true,
        referenceLabel: 'Transaction Reference',
        allowedModules: ['Fees', 'AP', 'Payroll'],
        isDefault: true
    },
    {
        id: 'PM-004',
        name: 'Cash',
        type: 'cash',
        linkedCashbook: 'CB-001',
        isActive: true,
        requiresReference: false,
        referenceLabel: null,
        allowedModules: ['Fees', 'AP'],
        isDefault: false
    },
    {
        id: 'PM-005',
        name: 'Cheque',
        type: 'cheque',
        linkedCashbook: 'CB-002',
        isActive: true,
        requiresReference: true,
        referenceLabel: 'Cheque Number',
        allowedModules: ['Fees', 'AP', 'Payroll'],
        isDefault: false
    },
    {
        id: 'PM-006',
        name: 'Sponsor Transfer',
        type: 'bank',
        linkedCashbook: 'CB-002',
        isActive: true,
        requiresReference: true,
        referenceLabel: 'Sponsor Reference',
        allowedModules: ['Fees'],
        isDefault: false
    }
];

// Document Numbering Settings
export const documentNumbering = {
    receipts: {
        prefix: 'RCT',
        includeYear: true,
        includeMonth: false,
        startNumber: 1,
        currentNumber: 1245,
        format: 'RCT-2026-0001',
        resetBy: 'year',
        padLength: 4
    },
    invoices: {
        prefix: 'INV',
        includeYear: true,
        includeMonth: false,
        startNumber: 1,
        currentNumber: 856,
        format: 'INV-2026-0001',
        resetBy: 'term',
        padLength: 4
    },
    vouchers: {
        prefix: 'PV',
        includeYear: true,
        includeMonth: false,
        startNumber: 1,
        currentNumber: 342,
        format: 'PV-2026-0001',
        resetBy: 'year',
        padLength: 4
    },
    imprest: {
        prefix: 'IMP',
        includeYear: true,
        includeMonth: true,
        startNumber: 1,
        currentNumber: 28,
        format: 'IMP-2026-01-0001',
        resetBy: 'month',
        padLength: 4
    }
};

// Receipt Format Settings
export const receiptSettings = {
    size: 'A5', // A5 or Thermal
    showLogo: true,
    logoUrl: '/assets/school-logo.png',
    schoolName: 'Fahari Academy',
    address: 'P.O. Box 12345-00100, Nairobi, Kenya',
    phone: '+254 700 123456',
    email: 'accounts@fahariacademy.ac.ke',
    showStudentName: true,
    showAdmissionNumber: true,
    showBalance: true,
    showPaymentMethod: true,
    footerNote: 'Thank you for your payment. Keep this receipt for your records.',
    watermark: 'ORIGINAL', // ORIGINAL, COPY, DRAFT
    showWatermark: true
};

// Voucher Settings
export const voucherSettings = {
    numberingFormat: 'PV-2026-0001',
    approvalWorkflow: ['Clerk', 'Bursar', 'Principal'],
    requireAttachments: true,
    lockAfterPosting: true,
    autoPostToJournal: true,
    editableBeforePosting: true,
    defaultAccounts: {
        generalPayment: 'General Expenses',
        apPayment: 'Accounts Payable',
        refund: 'Refunds Payable'
    }
};

// Invoice Settings
export const invoiceSettings = {
    numberingFormat: 'INV-2026-0001',
    generationRule: 'per_term', // per_term, per_class, per_student
    defaultDueDays: 30,
    enableDiscounts: true,
    enableBursaries: true,
    penaltyRate: 0, // percentage
    lateFeeAmount: 0,
    allowPartialPayment: true,
    autoSendInvoice: false,
    sendVia: ['SMS', 'Email'],
    invoiceTemplate: 'standard'
};

// Imprest Settings
export const imprestSettings = {
    numberingFormat: 'IMP-2026-01-0001',
    maxImprestAmount: 50000,
    approvalLevels: ['Supervisor', 'Bursar', 'Principal'],
    retirementDeadlineDays: 14,
    requireRetirementDocuments: true,
    autoDeductSalary: false,
    allowMultipleImprests: false,
    statusRules: {
        pending: 'Awaiting approval',
        approved: 'Approved - funds released',
        retired: 'Fully retired',
        overdue: 'Retirement overdue'
    }
};

// General Finance Settings
export const generalSettings = {
    currency: 'KES',
    fiscalYearStart: 'January',
    currentFiscalYear: '2026',
    currentTerm: 'Term 1',
    enableMultiCurrency: false,
    decimalPlaces: 2,
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Africa/Nairobi'
};

// Approval Limits
export const approvalLimits = {
    clerk: 10000,
    bursar: 100000,
    principal: 500000,
    board: Infinity
};

// Notification Settings
export const notificationSettings = {
    lowBalanceAlert: true,
    lowBalanceThreshold: 100000,
    overdueInvoiceAlert: true,
    overdueInvoiceDays: 30,
    pendingApprovalAlert: true,
    budgetThresholdAlert: true,
    budgetThreshold: 90,
    emailNotifications: true,
    smsNotifications: false
};
