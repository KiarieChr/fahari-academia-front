// Mock data for Receipt Book Dashboard

// Mock Students
export const mockStudents = [
    { id: 'STD-001', admissionNo: 'ADM-2024-001', name: 'John Kamau', class: 'Form 4A', feeBalance: 45000 },
    { id: 'STD-002', admissionNo: 'ADM-2024-002', name: 'Mary Wanjiku', class: 'Form 3B', feeBalance: 0 },
    { id: 'STD-003', admissionNo: 'ADM-2024-003', name: 'Peter Ochieng', class: 'Form 2A', feeBalance: 28000 },
    { id: 'STD-004', admissionNo: 'ADM-2024-004', name: 'Grace Akinyi', class: 'Form 4C', feeBalance: 15000 },
    { id: 'STD-005', admissionNo: 'ADM-2024-005', name: 'David Mwangi', class: 'Form 1A', feeBalance: 52000 },
    { id: 'STD-006', admissionNo: 'ADM-2024-006', name: 'Sarah Njeri', class: 'Form 3A', feeBalance: 0 },
    { id: 'STD-007', admissionNo: 'ADM-2024-007', name: 'James Otieno', class: 'Form 2B', feeBalance: 38000 },
    { id: 'STD-008', admissionNo: 'ADM-2024-008', name: 'Lucy Wambui', class: 'Form 4B', feeBalance: 12000 },
    { id: 'STD-009', admissionNo: 'ADM-2024-009', name: 'Michael Kipchoge', class: 'Form 1B', feeBalance: 60000 },
    { id: 'STD-010', admissionNo: 'ADM-2024-010', name: 'Faith Chebet', class: 'Form 3C', feeBalance: 0 },
    { id: 'STD-011', admissionNo: 'ADM-2024-011', name: 'Daniel Mutua', class: 'Form 2C', feeBalance: 25000 },
    { id: 'STD-012', admissionNo: 'ADM-2024-012', name: 'Jane Auma', class: 'Form 4A', feeBalance: 8000 },
    { id: 'STD-013', admissionNo: 'ADM-2024-013', name: 'Kevin Karanja', class: 'Form 1C', feeBalance: 48000 },
    { id: 'STD-014', admissionNo: 'ADM-2024-014', name: 'Elizabeth Nyambura', class: 'Form 3B', feeBalance: 0 },
    { id: 'STD-015', admissionNo: 'ADM-2024-015', name: 'Patrick Omondi', class: 'Form 2A', feeBalance: 32000 },
    { id: 'STD-016', admissionNo: 'ADM-2024-016', name: 'Rose Wangari', class: 'Form 4C', feeBalance: 18000 },
    { id: 'STD-017', admissionNo: 'ADM-2024-017', name: 'Samuel Kibet', class: 'Form 1A', feeBalance: 55000 },
    { id: 'STD-018', admissionNo: 'ADM-2024-018', name: 'Anne Njoki', class: 'Form 3A', feeBalance: 0 },
    { id: 'STD-019', admissionNo: 'ADM-2024-019', name: 'Brian Wekesa', class: 'Form 2B', feeBalance: 42000 },
    { id: 'STD-020', admissionNo: 'ADM-2024-020', name: 'Catherine Moraa', class: 'Form 4B', feeBalance: 0 }
];

// Mock Sponsors
export const mockSponsors = [
    { id: 'SPO-001', name: 'Equity Bank Foundation', type: 'Corporate', totalContributions: 2500000 },
    { id: 'SPO-002', name: 'Safaricom Foundation', type: 'Corporate', totalContributions: 1800000 },
    { id: 'SPO-003', name: 'Wings to Fly - KQ', type: 'Corporate', totalContributions: 3200000 },
    { id: 'SPO-004', name: 'Mr. John Kariuki', type: 'Individual', totalContributions: 450000 },
    { id: 'SPO-005', name: 'St. Mary\'s Church', type: 'Religious', totalContributions: 680000 },
    { id: 'SPO-006', name: 'Alumni Association', type: 'Organization', totalContributions: 920000 },
    { id: 'SPO-007', name: 'Mrs. Grace Wambui', type: 'Individual', totalContributions: 320000 },
    { id: 'SPO-008', name: 'Rotary Club Nairobi', type: 'Organization', totalContributions: 1250000 },
    { id: 'SPO-009', name: 'KCB Foundation', type: 'Corporate', totalContributions: 2100000 },
    { id: 'SPO-010', name: 'Community Development Fund', type: 'Government', totalContributions: 1500000 }
];

// Fee Categories
export const feeCategories = [
    { id: 'FEE-001', name: 'Tuition Fees', amount: 45000 },
    { id: 'FEE-002', name: 'Boarding Fees', amount: 35000 },
    { id: 'FEE-003', name: 'Transport Fees', amount: 12000 },
    { id: 'FEE-004', name: 'Laboratory Fees', amount: 8000 },
    { id: 'FEE-005', name: 'Library Fees', amount: 3000 },
    { id: 'FEE-006', name: 'Sports Fees', amount: 5000 },
    { id: 'FEE-007', name: 'Computer Fees', amount: 6000 },
    { id: 'FEE-008', name: 'Development Levy', amount: 10000 }
];

// Non-Fee Categories
export const nonFeeCategories = [
    { id: 'NF-001', name: 'School Uniform', description: 'Full set or individual items' },
    { id: 'NF-002', name: 'Educational Trip', description: 'Field trips and excursions' },
    { id: 'NF-003', name: 'ID Card', description: 'Student identification card' },
    { id: 'NF-004', name: 'Exam Fee', description: 'External examination fees' },
    { id: 'NF-005', name: 'Textbooks', description: 'Course textbooks and materials' },
    { id: 'NF-006', name: 'Medical Fee', description: 'School clinic and medical services' },
    { id: 'NF-007', name: 'Club Membership', description: 'Clubs and societies' },
    { id: 'NF-008', name: 'Other', description: 'Miscellaneous non-fee items' }
];

// Income Accounts (for General Receipts)
export const incomeAccounts = [
    { id: 'INC-001', name: 'Donations', code: '4100' },
    { id: 'INC-002', name: 'Rental Income', code: '4200' },
    { id: 'INC-003', name: 'Event Income', code: '4300' },
    { id: 'INC-004', name: 'Other Income', code: '4400' },
    { id: 'INC-005', name: 'Investment Income', code: '4500' },
    { id: 'INC-006', name: 'Consultancy Income', code: '4600' }
];

// Mock Receipts
export const mockReceipts = [
    // Student Fee Receipts
    {
        id: 'RCP-001',
        receiptNumber: 'RCT-2026-0001',
        date: '2026-01-27',
        receiptType: 'Student Fee',
        payerName: 'Mr. Kamau (Parent)',
        studentId: 'STD-001',
        studentName: 'John Kamau',
        admissionNo: 'ADM-2024-001',
        amount: 45000,
        paymentMethod: 'M-Pesa',
        reference: 'SBK7H4M2P9',
        issuedBy: 'Jane Muthoni',
        status: 'Issued',
        feeCategory: 'Tuition Fees',
        term: 'Term 1',
        year: '2026',
        notes: 'Full tuition payment for Term 1',
        attachments: ['mpesa_confirmation.pdf'],
        printCount: 1,
        createdAt: '2026-01-27T09:15:00',
        reversalReason: null
    },
    {
        id: 'RCP-002',
        receiptNumber: 'RCT-2026-0002',
        date: '2026-01-27',
        receiptType: 'Student Fee',
        payerName: 'Mrs. Wanjiku',
        studentId: 'STD-002',
        studentName: 'Mary Wanjiku',
        admissionNo: 'ADM-2024-002',
        amount: 35000,
        paymentMethod: 'Bank',
        reference: 'BANK-SLIP-12345',
        issuedBy: 'Jane Muthoni',
        status: 'Printed',
        feeCategory: 'Boarding Fees',
        term: 'Term 1',
        year: '2026',
        notes: 'Boarding fees payment',
        attachments: ['bank_slip.pdf'],
        printCount: 2,
        createdAt: '2026-01-27T10:30:00',
        reversalReason: null
    },
    {
        id: 'RCP-003',
        receiptNumber: 'RCT-2026-0003',
        date: '2026-01-26',
        receiptType: 'Student Fee',
        payerName: 'Mr. Ochieng',
        studentId: 'STD-003',
        studentName: 'Peter Ochieng',
        admissionNo: 'ADM-2024-003',
        amount: 20000,
        paymentMethod: 'Cash',
        reference: 'CASH',
        issuedBy: 'Peter Kimani',
        status: 'Printed',
        feeCategory: 'Tuition Fees',
        term: 'Term 1',
        year: '2026',
        notes: 'Partial payment - Balance: KES 28,000',
        attachments: [],
        printCount: 1,
        createdAt: '2026-01-26T14:20:00',
        reversalReason: null
    },
    {
        id: 'RCP-004',
        receiptNumber: 'RCT-2026-0004',
        date: '2026-01-26',
        receiptType: 'Student Fee',
        payerName: 'Mrs. Akinyi',
        studentId: 'STD-004',
        studentName: 'Grace Akinyi',
        admissionNo: 'ADM-2024-004',
        amount: 12000,
        paymentMethod: 'Cheque',
        reference: 'CHQ-789456',
        issuedBy: 'Jane Muthoni',
        status: 'Issued',
        feeCategory: 'Transport Fees',
        term: 'Term 1',
        year: '2026',
        notes: 'Transport fees for Term 1',
        attachments: [],
        printCount: 1,
        createdAt: '2026-01-26T11:45:00',
        reversalReason: null
    },
    {
        id: 'RCP-005',
        receiptNumber: 'RCT-2026-0005',
        date: '2026-01-25',
        receiptType: 'Student Fee',
        payerName: 'Mr. Mwangi',
        studentId: 'STD-005',
        studentName: 'David Mwangi',
        admissionNo: 'ADM-2024-005',
        amount: 8000,
        paymentMethod: 'M-Pesa',
        reference: 'SBK9L3N5Q1',
        issuedBy: 'Peter Kimani',
        status: 'Reversed',
        feeCategory: 'Laboratory Fees',
        term: 'Term 1',
        year: '2026',
        notes: 'Laboratory fees',
        attachments: ['mpesa_confirmation.pdf'],
        printCount: 1,
        createdAt: '2026-01-25T13:10:00',
        reversalReason: 'Wrong amount entered - should be KES 6,000'
    },

    // Student Non-Fee Receipts
    {
        id: 'RCP-006',
        receiptNumber: 'RCT-2026-0006',
        date: '2026-01-27',
        receiptType: 'Student Non-Fee',
        payerName: 'Mrs. Njeri',
        studentId: 'STD-006',
        studentName: 'Sarah Njeri',
        admissionNo: 'ADM-2024-006',
        amount: 4500,
        paymentMethod: 'Cash',
        reference: 'CASH',
        issuedBy: 'Jane Muthoni',
        status: 'Issued',
        nonFeeCategory: 'School Uniform',
        description: 'Full uniform set',
        notes: '2 shirts, 2 skirts, 1 sweater',
        attachments: [],
        printCount: 1,
        createdAt: '2026-01-27T08:30:00',
        reversalReason: null
    },
    {
        id: 'RCP-007',
        receiptNumber: 'RCT-2026-0007',
        date: '2026-01-26',
        receiptType: 'Student Non-Fee',
        payerName: 'Mr. Otieno',
        studentId: 'STD-007',
        studentName: 'James Otieno',
        admissionNo: 'ADM-2024-007',
        amount: 3500,
        paymentMethod: 'M-Pesa',
        reference: 'SBK2P7R4T8',
        issuedBy: 'Peter Kimani',
        status: 'Printed',
        nonFeeCategory: 'Educational Trip',
        description: 'Science Congress Trip - Nairobi',
        notes: 'Trip scheduled for February 15-17',
        attachments: ['mpesa_confirmation.pdf'],
        printCount: 1,
        createdAt: '2026-01-26T15:20:00',
        reversalReason: null
    },
    {
        id: 'RCP-008',
        receiptNumber: 'RCT-2026-0008',
        date: '2026-01-25',
        receiptType: 'Student Non-Fee',
        payerName: 'Mrs. Wambui',
        studentId: 'STD-008',
        studentName: 'Lucy Wambui',
        admissionNo: 'ADM-2024-008',
        amount: 500,
        paymentMethod: 'Cash',
        reference: 'CASH',
        issuedBy: 'Jane Muthoni',
        status: 'Issued',
        nonFeeCategory: 'ID Card',
        description: 'Student ID card replacement',
        notes: 'Lost original card',
        attachments: [],
        printCount: 1,
        createdAt: '2026-01-25T10:15:00',
        reversalReason: null
    },

    // Sponsor Receipts
    {
        id: 'RCP-009',
        receiptNumber: 'RCT-2026-0009',
        date: '2026-01-27',
        receiptType: 'Sponsor',
        payerName: 'Equity Bank Foundation',
        sponsorId: 'SPO-001',
        amount: 500000,
        paymentMethod: 'Bank',
        reference: 'BANK-TRF-EBF-2026-001',
        issuedBy: 'Jane Muthoni',
        status: 'Issued',
        sponsorshipType: 'Full Scholarship',
        sponsoredStudents: ['STD-002', 'STD-006', 'STD-010', 'STD-014', 'STD-018'],
        allocationRule: 'Equal distribution - KES 100,000 per student',
        notes: 'Q1 2026 sponsorship disbursement',
        attachments: ['bank_statement.pdf', 'sponsorship_letter.pdf'],
        printCount: 1,
        createdAt: '2026-01-27T11:00:00',
        reversalReason: null
    },
    {
        id: 'RCP-010',
        receiptNumber: 'RCT-2026-0010',
        date: '2026-01-26',
        receiptType: 'Sponsor',
        payerName: 'Safaricom Foundation',
        sponsorId: 'SPO-002',
        amount: 300000,
        paymentMethod: 'Bank',
        reference: 'BANK-TRF-SAF-2026-001',
        issuedBy: 'Peter Kimani',
        status: 'Printed',
        sponsorshipType: 'Partial Scholarship',
        sponsoredStudents: ['STD-020'],
        allocationRule: 'Full amount to Catherine Moraa',
        notes: 'Annual scholarship for top performer',
        attachments: ['bank_statement.pdf'],
        printCount: 1,
        createdAt: '2026-01-26T16:30:00',
        reversalReason: null
    },
    {
        id: 'RCP-011',
        receiptNumber: 'RCT-2026-0011',
        date: '2026-01-24',
        receiptType: 'Sponsor',
        payerName: 'Mr. John Kariuki',
        sponsorId: 'SPO-004',
        amount: 150000,
        paymentMethod: 'Cheque',
        reference: 'CHQ-456123',
        issuedBy: 'Jane Muthoni',
        status: 'Printed',
        sponsorshipType: 'One-Time Donation',
        sponsoredStudents: ['STD-009', 'STD-013', 'STD-017'],
        allocationRule: 'KES 50,000 per student',
        notes: 'Personal donation for needy students',
        attachments: [],
        printCount: 2,
        createdAt: '2026-01-24T14:00:00',
        reversalReason: null
    },

    // General Receipts
    {
        id: 'RCP-012',
        receiptNumber: 'RCT-2026-0012',
        date: '2026-01-27',
        receiptType: 'General',
        payerName: 'ABC Company Ltd',
        amount: 50000,
        paymentMethod: 'Bank',
        reference: 'BANK-TRF-ABC-001',
        issuedBy: 'Jane Muthoni',
        status: 'Issued',
        incomeAccount: 'Rental Income',
        description: 'Hall rental for corporate event',
        notes: 'Event date: February 10, 2026',
        attachments: ['bank_statement.pdf', 'rental_agreement.pdf'],
        printCount: 1,
        createdAt: '2026-01-27T12:45:00',
        reversalReason: null
    },
    {
        id: 'RCP-013',
        receiptNumber: 'RCT-2026-0013',
        date: '2026-01-26',
        receiptType: 'General',
        payerName: 'Anonymous Donor',
        amount: 25000,
        paymentMethod: 'Cash',
        reference: 'CASH',
        issuedBy: 'Peter Kimani',
        status: 'Printed',
        incomeAccount: 'Donations',
        description: 'General donation for school development',
        notes: 'Donor requested anonymity',
        attachments: [],
        printCount: 1,
        createdAt: '2026-01-26T09:30:00',
        reversalReason: null
    },
    {
        id: 'RCP-014',
        receiptNumber: 'RCT-2026-0014',
        date: '2026-01-25',
        receiptType: 'General',
        payerName: 'Parents Association',
        amount: 80000,
        paymentMethod: 'M-Pesa',
        reference: 'SBK5T9W2X6',
        issuedBy: 'Jane Muthoni',
        status: 'Issued',
        incomeAccount: 'Event Income',
        description: 'Fundraising event proceeds',
        notes: 'Annual parents day fundraiser',
        attachments: ['mpesa_confirmation.pdf', 'event_report.pdf'],
        printCount: 1,
        createdAt: '2026-01-25T17:00:00',
        reversalReason: null
    },
    {
        id: 'RCP-015',
        receiptNumber: 'RCT-2026-0015',
        date: '2026-01-27',
        receiptType: 'Student Fee',
        payerName: 'Draft - Not Issued',
        studentId: 'STD-011',
        studentName: 'Daniel Mutua',
        admissionNo: 'ADM-2024-011',
        amount: 25000,
        paymentMethod: 'Cash',
        reference: '',
        issuedBy: 'Jane Muthoni',
        status: 'Draft',
        feeCategory: 'Tuition Fees',
        term: 'Term 1',
        year: '2026',
        notes: 'Draft - awaiting confirmation',
        attachments: [],
        printCount: 0,
        createdAt: '2026-01-27T13:00:00',
        reversalReason: null
    }
];

// Receipt Summary Statistics
export const receiptSummary = {
    totalReceiptsToday: 5,
    totalReceiptsTerm: 15,
    totalAmountToday: 599500,
    totalAmountTerm: 1238500,
    studentFeeReceipts: { count: 6, amount: 120000 },
    nonFeeReceipts: { count: 3, amount: 8500 },
    sponsorReceipts: { count: 3, amount: 950000 },
    generalReceipts: { count: 3, amount: 155000 },
    paymentMethodBreakdown: {
        cash: { count: 4, amount: 74500, percentage: 6.0 },
        bank: { count: 4, amount: 880000, percentage: 71.1 },
        mpesa: { count: 5, amount: 134000, percentage: 10.8 },
        cheque: { count: 2, amount: 150000, percentage: 12.1 }
    },
    lastReceiptNumber: 'RCT-2026-0015',
    nextReceiptNumber: 'RCT-2026-0016',
    activeReceiptBook: 'Receipt Book 2026 - Term 1',
    todayTrend: '+12%',
    termTrend: '+8%'
};

// Payment Method Options
export const paymentMethods = ['Cash', 'Bank', 'M-Pesa', 'Cheque'];

// Receipt Status Options
export const receiptStatuses = ['Draft', 'Issued', 'Printed', 'Reversed'];

// Receipt Type Options
export const receiptTypes = ['Student Fee', 'Student Non-Fee', 'General', 'Sponsor'];

// Terms
export const terms = ['Term 1', 'Term 2', 'Term 3'];

// Academic Years
export const academicYears = ['2024', '2025', '2026'];

// Users (for issued by)
export const users = [
    { id: 'USR-001', name: 'Jane Muthoni', role: 'Bursar' },
    { id: 'USR-002', name: 'Peter Kimani', role: 'Accountant' },
    { id: 'USR-003', name: 'Mary Wanjiru', role: 'Clerk' },
    { id: 'USR-004', name: 'John Omondi', role: 'Principal' }
];

// Reversal Reasons
export const reversalReasons = [
    'Wrong Amount',
    'Duplicate Receipt',
    'Wrong Student',
    'Wrong Payment Method',
    'Payment Cancelled',
    'Other'
];
