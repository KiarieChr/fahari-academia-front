// Comprehensive Mock Data for Accounts Payable Dashboard

// Chart of Accounts
export const chartOfAccounts = [
    { code: '1000', name: 'Cash at Bank', type: 'Asset' },
    { code: '1100', name: 'Cash on Hand', type: 'Asset' },
    { code: '1200', name: 'M-Pesa Account', type: 'Asset' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability' },
    { code: '2100', name: 'Student Deposits', type: 'Liability' },
    { code: '5000', name: 'Food Supplies Expense', type: 'Expense' },
    { code: '5100', name: 'Utilities Expense', type: 'Expense' },
    { code: '5200', name: 'Stationery Expense', type: 'Expense' },
    { code: '5300', name: 'Repairs & Maintenance', type: 'Expense' },
    { code: '5400', name: 'Transport Expense', type: 'Expense' },
    { code: '4000', name: 'Refunds Payable', type: 'Liability' },
];

// Customer Invoices (Student/Sponsor)
export const customerInvoices = [
    {
        id: 'CI-2026-001',
        invoiceNumber: 'INV/STD/001/2026',
        customerType: 'Student',
        name: 'Jane Wanjiku Kamau',
        admissionNo: 'STD-2023-045',
        amount: 45000,
        paidAmount: 48000,
        balance: -3000, // Overpayment
        status: 'Overpaid',
        term: 'Term 1',
        dateIssued: '2026-01-05',
        dueDate: '2026-01-15',
        paymentHistory: [
            { date: '2026-01-10', amount: 25000, method: 'M-Pesa' },
            { date: '2026-01-12', amount: 23000, method: 'Bank Transfer' }
        ]
    },
    {
        id: 'CI-2026-002',
        invoiceNumber: 'INV/STD/002/2026',
        customerType: 'Student',
        name: 'John Omondi Otieno',
        admissionNo: 'STD-2024-112',
        amount: 52000,
        paidAmount: 52000,
        balance: 0,
        status: 'Paid',
        term: 'Term 1',
        dateIssued: '2026-01-05',
        dueDate: '2026-01-15',
        paymentHistory: [
            { date: '2026-01-08', amount: 52000, method: 'M-Pesa' }
        ]
    },
    {
        id: 'CI-2026-003',
        invoiceNumber: 'INV/SPO/003/2026',
        customerType: 'Sponsor',
        name: 'Wings to Fly Foundation',
        admissionNo: 'SPO-2025-008',
        amount: 150000,
        paidAmount: 100000,
        balance: 50000,
        status: 'Partial',
        term: 'Term 1',
        dateIssued: '2026-01-05',
        dueDate: '2026-01-20',
        paymentHistory: [
            { date: '2026-01-15', amount: 100000, method: 'Bank Transfer' }
        ]
    },
    {
        id: 'CI-2026-004',
        invoiceNumber: 'INV/STD/004/2026',
        customerType: 'Student',
        name: 'Mary Akinyi Odhiambo',
        admissionNo: 'STD-2023-089',
        amount: 38000,
        paidAmount: 40500,
        balance: -2500, // Overpayment
        status: 'Overpaid',
        term: 'Term 1',
        dateIssued: '2026-01-05',
        dueDate: '2026-01-15',
        paymentHistory: [
            { date: '2026-01-11', amount: 40500, method: 'M-Pesa' }
        ]
    }
];

// Procurement AP Invoices (from Procurement Module)
export const procurementAPInvoices = [
    {
        id: 'PAP-2026-001',
        procurementRef: 'GRN-2026-015',
        supplierName: 'Maziwa Bora Dairies',
        invoiceNumber: 'MBD/JAN/2026/22',
        description: 'Term 1 Milk Supply (Weeks 1-4)',
        amount: 65000,
        vat: 10400,
        totalAmount: 75400,
        approvalStatus: 'Approved',
        dueDate: '2026-02-05',
        term: 'Term 1',
        dateReceived: '2026-01-20',
        linkedToVoucher: false,
        voucherRef: null
    },
    {
        id: 'PAP-2026-002',
        procurementRef: 'GRN-2026-018',
        supplierName: 'Text Book Centre',
        invoiceNumber: 'TBC-8892',
        description: 'New CBC Grade 7 Textbooks - 150 copies',
        amount: 350000,
        vat: 0, // Zero-rated
        totalAmount: 350000,
        approvalStatus: 'Approved',
        dueDate: '2026-02-10',
        term: 'Term 1',
        dateReceived: '2026-01-18',
        linkedToVoucher: false,
        voucherRef: null
    },
    {
        id: 'PAP-2026-003',
        procurementRef: 'PO-2026-025',
        supplierName: 'KPLC (Kenya Power)',
        invoiceNumber: 'KPLC-PRE-90',
        description: 'Electricity Tokens - Science Lab',
        amount: 15200,
        vat: 2432,
        totalAmount: 17632,
        approvalStatus: 'Pending Approval',
        dueDate: '2026-01-28',
        term: 'Term 1',
        dateReceived: '2026-01-22',
        linkedToVoucher: false,
        voucherRef: null
    },
    {
        id: 'PAP-2026-004',
        procurementRef: 'GRN-2026-012',
        supplierName: 'Fresh Greens Suppliers',
        invoiceNumber: 'FGS-2026-045',
        description: 'Fresh Vegetables - January Supply',
        amount: 28000,
        vat: 4480,
        totalAmount: 32480,
        approvalStatus: 'Approved',
        dueDate: '2026-02-01',
        term: 'Term 1',
        dateReceived: '2026-01-15',
        linkedToVoucher: true,
        voucherRef: 'PV-2026-003'
    }
];

// Payment Vouchers
export const paymentVouchers = [
    {
        id: 'PV-2026-001',
        voucherNumber: 'PV-2026-001',
        voucherDate: '2026-01-20',
        voucherType: 'General Payment',
        payee: 'Nairobi Water Company',
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'NWTR-2026-001',
        description: 'Water Bill - January 2026',
        term: 'Term 1',
        totalAmount: 12500,
        approvalStatus: 'Approved',
        postingStatus: 'Posted',
        createdBy: 'Accounts Clerk',
        approvedBy: 'Bursar',
        postedBy: 'Bursar',
        postedDate: '2026-01-21',
        lineItems: [
            { account: '5100', accountName: 'Utilities Expense', amount: 12500, notes: 'Water consumption' }
        ]
    },
    {
        id: 'PV-2026-002',
        voucherNumber: 'PV-2026-002',
        voucherDate: '2026-01-22',
        voucherType: 'AP Payment',
        payee: 'Text Book Centre',
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'KCB-TXN-8892',
        description: 'Payment for CBC Textbooks',
        term: 'Term 1',
        totalAmount: 350000,
        approvalStatus: 'Pending Approval',
        postingStatus: 'Unposted',
        createdBy: 'Accounts Clerk',
        linkedInvoice: 'PAP-2026-002',
        lineItems: [
            { account: '5200', accountName: 'Stationery Expense', amount: 350000, notes: 'Grade 7 textbooks', linkedInvoice: 'PAP-2026-002' }
        ]
    },
    {
        id: 'PV-2026-003',
        voucherNumber: 'PV-2026-003',
        voucherDate: '2026-01-18',
        voucherType: 'AP Payment',
        payee: 'Fresh Greens Suppliers',
        paymentMethod: 'M-Pesa',
        referenceNumber: 'MPESA-XYZ123',
        description: 'Payment for vegetables supply',
        term: 'Term 1',
        totalAmount: 32480,
        approvalStatus: 'Approved',
        postingStatus: 'Posted',
        createdBy: 'Accounts Clerk',
        approvedBy: 'Bursar',
        postedBy: 'Bursar',
        postedDate: '2026-01-19',
        linkedInvoice: 'PAP-2026-004',
        lineItems: [
            { account: '5000', accountName: 'Food Supplies Expense', amount: 32480, notes: 'Fresh vegetables', linkedInvoice: 'PAP-2026-004' }
        ]
    },
    {
        id: 'PV-2026-004',
        voucherNumber: 'PV-2026-004',
        voucherDate: '2026-01-23',
        voucherType: 'Refund Payment',
        payee: 'Jane Wanjiku Kamau',
        paymentMethod: 'M-Pesa',
        referenceNumber: 'REF-STD-045',
        description: 'Refund for overpayment - Term 1 fees',
        term: 'Term 1',
        totalAmount: 3000,
        approvalStatus: 'Approved',
        postingStatus: 'Unposted',
        createdBy: 'Accounts Clerk',
        approvedBy: 'Bursar',
        linkedInvoice: 'CI-2026-001',
        refundReason: 'Student overpaid fees by KES 3,000',
        lineItems: [
            { account: '2100', accountName: 'Student Deposits', amount: 3000, notes: 'Refund overpayment', linkedInvoice: 'CI-2026-001' }
        ]
    },
    {
        id: 'PV-2026-005',
        voucherNumber: 'PV-2026-005',
        voucherDate: '2026-01-24',
        voucherType: 'General Payment',
        payee: 'ABC Repairs Ltd',
        paymentMethod: 'Cheque',
        referenceNumber: 'CHQ-001234',
        description: 'Repair of school bus - KBZ 456X',
        term: 'Term 1',
        totalAmount: 45000,
        approvalStatus: 'Pending Approval',
        postingStatus: 'Unposted',
        createdBy: 'Accounts Clerk',
        lineItems: [
            { account: '5300', accountName: 'Repairs & Maintenance', amount: 45000, notes: 'Bus engine repair' }
        ]
    }
];

// Refunds
export const refunds = [
    {
        id: 'REF-2026-001',
        refundNumber: 'REF-2026-001',
        refundDate: '2026-01-23',
        customerType: 'Student',
        customerName: 'Jane Wanjiku Kamau',
        admissionNo: 'STD-2023-045',
        linkedInvoice: 'CI-2026-001',
        originalAmount: 45000,
        paidAmount: 48000,
        refundAmount: 3000,
        reason: 'Student overpaid fees by KES 3,000',
        paymentMethod: 'M-Pesa',
        referenceNumber: 'REF-STD-045',
        status: 'Approved',
        voucherRef: 'PV-2026-004',
        processedBy: 'Accounts Clerk',
        approvedBy: 'Bursar'
    },
    {
        id: 'REF-2026-002',
        refundNumber: 'REF-2026-002',
        refundDate: '2026-01-25',
        customerType: 'Student',
        customerName: 'Mary Akinyi Odhiambo',
        admissionNo: 'STD-2023-089',
        linkedInvoice: 'CI-2026-004',
        originalAmount: 38000,
        paidAmount: 40500,
        refundAmount: 2500,
        reason: 'Overpayment - parent error',
        paymentMethod: 'Bank Transfer',
        referenceNumber: 'Pending',
        status: 'Pending Approval',
        voucherRef: null,
        processedBy: 'Accounts Clerk',
        approvedBy: null
    }
];

// Summary Statistics
export const summaryStats = {
    totalPayables: 485200,
    approvedAPInvoices: 2,
    pendingVouchers: 2,
    postedVouchers: 2,
    refundsIssued: 1,
    customerInvoiceBalance: 44500,
    overduePayables: 0
};

// AP Aging Data
export const apAgingData = [
    { bucket: '0-30 Days', amount: 450000, count: 3, percentage: 92.7 },
    { bucket: '31-60 Days', amount: 35200, count: 1, percentage: 7.3 },
    { bucket: '61-90 Days', amount: 0, count: 0, percentage: 0 },
    { bucket: '90+ Days', amount: 0, count: 0, percentage: 0 }
];

// Voucher Type Distribution
export const voucherTypeData = [
    { type: 'General Payment', count: 2, amount: 57500 },
    { type: 'AP Payment', count: 2, amount: 382480 },
    { type: 'Refund Payment', count: 1, amount: 3000 }
];

// Supplier Summary
export const supplierSummary = [
    { supplier: 'Text Book Centre', totalInvoices: 1, totalAmount: 350000, paid: 0, outstanding: 350000 },
    { supplier: 'Maziwa Bora Dairies', totalInvoices: 1, totalAmount: 75400, paid: 0, outstanding: 75400 },
    { supplier: 'Fresh Greens Suppliers', totalInvoices: 1, totalAmount: 32480, paid: 32480, outstanding: 0 },
    { supplier: 'KPLC (Kenya Power)', totalInvoices: 1, totalAmount: 17632, paid: 0, outstanding: 17632 }
];

// Posted vs Unposted Vouchers
export const postingStats = {
    posted: { count: 2, amount: 44980 },
    unposted: { count: 3, amount: 400000 }
};

// Payment Methods
export const paymentMethods = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'M-Pesa', label: 'M-Pesa' },
    { value: 'Cheque', label: 'Cheque' }
];

// Terms
export const terms = [
    { value: 'Term 1', label: 'Term 1' },
    { value: 'Term 2', label: 'Term 2' },
    { value: 'Term 3', label: 'Term 3' }
];

// Academic Years
export const academicYears = [
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' }
];
