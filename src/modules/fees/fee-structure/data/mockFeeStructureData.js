// Mock Fee Structure Data for Student Fees Module

// Kenyan School Classes
export const classes = [
    // Pre-Primary
    { id: 'PP1', name: 'PP1', level: 'Pre-Primary', order: 1 },
    { id: 'PP2', name: 'PP2', level: 'Pre-Primary', order: 2 },
    // Primary (Grade 1-9 - CBC)
    { id: 'G1', name: 'Grade 1', level: 'Primary', order: 3 },
    { id: 'G2', name: 'Grade 2', level: 'Primary', order: 4 },
    { id: 'G3', name: 'Grade 3', level: 'Primary', order: 5 },
    { id: 'G4', name: 'Grade 4', level: 'Primary', order: 6 },
    { id: 'G5', name: 'Grade 5', level: 'Primary', order: 7 },
    { id: 'G6', name: 'Grade 6', level: 'Primary', order: 8 },
    { id: 'G7', name: 'Grade 7', level: 'Junior Secondary', order: 9 },
    { id: 'G8', name: 'Grade 8', level: 'Junior Secondary', order: 10 },
    { id: 'G9', name: 'Grade 9', level: 'Junior Secondary', order: 11 },
    // Secondary (Form 1-4)
    { id: 'F1', name: 'Form 1', level: 'Secondary', order: 12 },
    { id: 'F2', name: 'Form 2', level: 'Secondary', order: 13 },
    { id: 'F3', name: 'Form 3', level: 'Secondary', order: 14 },
    { id: 'F4', name: 'Form 4', level: 'Secondary', order: 15 }
];

// Academic Years
export const academicYears = ['2024', '2025', '2026'];

// Terms
export const terms = ['Term 1', 'Term 2', 'Term 3'];

// Fee Categories
export const feeCategories = [
    { id: 'TUITION', name: 'Tuition', color: 'primary', suggestedAccount: '4001' },
    { id: 'BOARDING', name: 'Boarding', color: 'success', suggestedAccount: '4003' },
    { id: 'TRANSPORT', name: 'Transport', color: 'info', suggestedAccount: '4002' },
    { id: 'EXAMS', name: 'Exams', color: 'warning', suggestedAccount: '4004' },
    { id: 'LUNCH', name: 'Lunch', color: 'secondary', suggestedAccount: '4005' },
    { id: 'ACTIVITIES', name: 'Activities', color: 'primary', suggestedAccount: '4006' },
    { id: 'LIBRARY', name: 'Library', color: 'info', suggestedAccount: '4007' },
    { id: 'LAB', name: 'Laboratory', color: 'danger', suggestedAccount: '4008' },
    { id: 'MEDICAL', name: 'Medical', color: 'success', suggestedAccount: '4009' },
    { id: 'SPORTS', name: 'Sports', color: 'warning', suggestedAccount: '4010' },
    { id: 'TECHNOLOGY', name: 'Technology', color: 'primary', suggestedAccount: '4011' },
    { id: 'OTHER', name: 'Other', color: 'secondary', suggestedAccount: '4099' }
];

// Billing Frequency Options
export const billingFrequencies = ['Once', 'Termly', 'Annual'];

// Applies To Options
export const appliesTo = ['All Students', 'Boarders Only', 'Day Scholars Only', 'Optional'];

// Fee Structure Status
export const feeStructureStatuses = ['Draft', 'Active', 'Archived'];

// Chart of Accounts - Student-Related Income Accounts
export const incomeAccounts = [
    { id: '4001', code: '4001', name: 'Tuition Fees Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4002', code: '4002', name: 'Transport Fees Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4003', code: '4003', name: 'Boarding Fees Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4004', code: '4004', name: 'Examination Fees Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4005', code: '4005', name: 'Lunch Program Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4006', code: '4006', name: 'Activities & Clubs Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4007', code: '4007', name: 'Library Fees Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4008', code: '4008', name: 'Laboratory Fees Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4009', code: '4009', name: 'Medical & Insurance Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4010', code: '4010', name: 'Sports & Games Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4011', code: '4011', name: 'Technology & Computer Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4012', code: '4012', name: 'Uniform Sales Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4013', code: '4013', name: 'Textbook Sales Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4099', code: '4099', name: 'Other Student Fees Income', type: 'Income', category: 'Student Fees', status: 'Active' },
    { id: '4100', code: '4100', name: 'Late Payment Penalties', type: 'Income', category: 'Student Fees', status: 'Inactive' }
];

// Mock Fee Structures
export const mockFeeStructures = [
    // PP1 - 2025
    {
        id: 'FS-001',
        classId: 'PP1',
        className: 'PP1',
        academicYear: '2025',
        term: 'Term 1',
        status: 'Active',
        version: 1,
        createdBy: 'Jane Muthoni',
        createdAt: '2024-12-01T10:00:00Z',
        lastModified: '2024-12-15T14:30:00Z',
        activatedAt: '2025-01-02T09:00:00Z',
        billingStarted: false,
        studentCount: 45
    },
    {
        id: 'FS-002',
        classId: 'PP1',
        className: 'PP1',
        academicYear: '2025',
        term: 'Term 2',
        status: 'Draft',
        version: 1,
        createdBy: 'Jane Muthoni',
        createdAt: '2025-01-10T10:00:00Z',
        lastModified: '2025-01-10T10:00:00Z',
        activatedAt: null,
        billingStarted: false,
        studentCount: 45
    },
    // Grade 4 - 2025
    {
        id: 'FS-003',
        classId: 'G4',
        className: 'Grade 4',
        academicYear: '2025',
        term: 'Term 1',
        status: 'Active',
        version: 1,
        createdBy: 'John Kamau',
        createdAt: '2024-12-01T10:00:00Z',
        lastModified: '2024-12-20T16:00:00Z',
        activatedAt: '2025-01-02T09:00:00Z',
        billingStarted: true,
        studentCount: 120
    },
    // Form 1 - 2025
    {
        id: 'FS-004',
        classId: 'F1',
        className: 'Form 1',
        academicYear: '2025',
        term: 'Term 1',
        status: 'Active',
        version: 2,
        createdBy: 'Mary Wanjiku',
        createdAt: '2024-11-15T10:00:00Z',
        lastModified: '2024-12-28T11:00:00Z',
        activatedAt: '2025-01-02T09:00:00Z',
        billingStarted: true,
        studentCount: 200
    },
    // Form 4 - 2025
    {
        id: 'FS-005',
        classId: 'F4',
        className: 'Form 4',
        academicYear: '2025',
        term: 'Term 1',
        status: 'Active',
        version: 1,
        createdBy: 'Mary Wanjiku',
        createdAt: '2024-12-01T10:00:00Z',
        lastModified: '2024-12-01T10:00:00Z',
        activatedAt: '2025-01-02T09:00:00Z',
        billingStarted: true,
        studentCount: 180
    },
    // Grade 7 - 2024 (Archived)
    {
        id: 'FS-006',
        classId: 'G7',
        className: 'Grade 7',
        academicYear: '2024',
        term: 'Term 3',
        status: 'Archived',
        version: 1,
        createdBy: 'John Kamau',
        createdAt: '2024-08-01T10:00:00Z',
        lastModified: '2024-08-01T10:00:00Z',
        activatedAt: '2024-08-15T09:00:00Z',
        archivedAt: '2024-12-20T17:00:00Z',
        billingStarted: true,
        studentCount: 95
    }
];

// Mock Fee Items
export const mockFeeItems = [
    // PP1 - Term 1
    { id: 'FI-001', structureId: 'FS-001', name: 'Tuition Fee', category: 'TUITION', accountId: '4001', amount: 15000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 1 },
    { id: 'FI-002', structureId: 'FS-001', name: 'Lunch Program', category: 'LUNCH', accountId: '4005', amount: 3000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 2 },
    { id: 'FI-003', structureId: 'FS-001', name: 'Activities & Play', category: 'ACTIVITIES', accountId: '4006', amount: 1500, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 3 },
    { id: 'FI-004', structureId: 'FS-001', name: 'Medical & Insurance', category: 'MEDICAL', accountId: '4009', amount: 1000, mandatory: true, frequency: 'Annual', appliesTo: 'All Students', status: 'Active', order: 4 },

    // PP1 - Term 2 (Draft)
    { id: 'FI-005', structureId: 'FS-002', name: 'Tuition Fee', category: 'TUITION', accountId: '4001', amount: 15000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 1 },
    { id: 'FI-006', structureId: 'FS-002', name: 'Lunch Program', category: 'LUNCH', accountId: '4005', amount: 3000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 2 },

    // Grade 4 - Term 1
    { id: 'FI-007', structureId: 'FS-003', name: 'Tuition Fee', category: 'TUITION', accountId: '4001', amount: 25000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 1 },
    { id: 'FI-008', structureId: 'FS-003', name: 'Lunch Program', category: 'LUNCH', accountId: '4005', amount: 4000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 2 },
    { id: 'FI-009', structureId: 'FS-003', name: 'Library Fee', category: 'LIBRARY', accountId: '4007', amount: 1500, mandatory: true, frequency: 'Annual', appliesTo: 'All Students', status: 'Active', order: 3 },
    { id: 'FI-010', structureId: 'FS-003', name: 'Laboratory Fee', category: 'LAB', accountId: '4008', amount: 2000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 4 },
    { id: 'FI-011', structureId: 'FS-003', name: 'Technology & Computer', category: 'TECHNOLOGY', accountId: '4011', amount: 2500, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 5 },
    { id: 'FI-012', structureId: 'FS-003', name: 'Sports & Games', category: 'SPORTS', accountId: '4010', amount: 1000, mandatory: false, frequency: 'Termly', appliesTo: 'Optional', status: 'Active', order: 6 },

    // Form 1 - Term 1
    { id: 'FI-013', structureId: 'FS-004', name: 'Tuition Fee', category: 'TUITION', accountId: '4001', amount: 40000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 1 },
    { id: 'FI-014', structureId: 'FS-004', name: 'Boarding Fee', category: 'BOARDING', accountId: '4003', amount: 25000, mandatory: true, frequency: 'Termly', appliesTo: 'Boarders Only', status: 'Active', order: 2 },
    { id: 'FI-015', structureId: 'FS-004', name: 'Transport Fee', category: 'TRANSPORT', accountId: '4002', amount: 8000, mandatory: false, frequency: 'Termly', appliesTo: 'Day Scholars Only', status: 'Active', order: 3 },
    { id: 'FI-016', structureId: 'FS-004', name: 'Lunch Program', category: 'LUNCH', accountId: '4005', amount: 5000, mandatory: true, frequency: 'Termly', appliesTo: 'Day Scholars Only', status: 'Active', order: 4 },
    { id: 'FI-017', structureId: 'FS-004', name: 'Examination Fee', category: 'EXAMS', accountId: '4004', amount: 3000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 5 },
    { id: 'FI-018', structureId: 'FS-004', name: 'Library Fee', category: 'LIBRARY', accountId: '4007', amount: 2000, mandatory: true, frequency: 'Annual', appliesTo: 'All Students', status: 'Active', order: 6 },
    { id: 'FI-019', structureId: 'FS-004', name: 'Laboratory Fee', category: 'LAB', accountId: '4008', amount: 4000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 7 },
    { id: 'FI-020', structureId: 'FS-004', name: 'Technology & Computer', category: 'TECHNOLOGY', accountId: '4011', amount: 3500, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 8 },
    { id: 'FI-021', structureId: 'FS-004', name: 'Sports & Games', category: 'SPORTS', accountId: '4010', amount: 2000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 9 },
    { id: 'FI-022', structureId: 'FS-004', name: 'Medical & Insurance', category: 'MEDICAL', accountId: '4009', amount: 3000, mandatory: true, frequency: 'Annual', appliesTo: 'All Students', status: 'Active', order: 10 },

    // Form 4 - Term 1
    { id: 'FI-023', structureId: 'FS-005', name: 'Tuition Fee', category: 'TUITION', accountId: '4001', amount: 45000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 1 },
    { id: 'FI-024', structureId: 'FS-005', name: 'Boarding Fee', category: 'BOARDING', accountId: '4003', amount: 28000, mandatory: true, frequency: 'Termly', appliesTo: 'Boarders Only', status: 'Active', order: 2 },
    { id: 'FI-025', structureId: 'FS-005', name: 'KCSE Examination Fee', category: 'EXAMS', accountId: '4004', amount: 15000, mandatory: true, frequency: 'Once', appliesTo: 'All Students', status: 'Active', order: 3 },
    { id: 'FI-026', structureId: 'FS-005', name: 'Mock Exams', category: 'EXAMS', accountId: '4004', amount: 5000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 4 },
    { id: 'FI-027', structureId: 'FS-005', name: 'Laboratory Fee', category: 'LAB', accountId: '4008', amount: 5000, mandatory: true, frequency: 'Termly', appliesTo: 'All Students', status: 'Active', order: 5 },
    { id: 'FI-028', structureId: 'FS-005', name: 'Library Fee', category: 'LIBRARY', accountId: '4007', amount: 2500, mandatory: true, frequency: 'Annual', appliesTo: 'All Students', status: 'Active', order: 6 }
];

// Summary Statistics
export const feeStructureSummary = {
    totalStructures: 6,
    activeStructures: 4,
    draftStructures: 1,
    archivedStructures: 1,
    classesConfigured: 5,
    totalLinkedAccounts: 11,
    missingMappings: 0,
    lastUpdated: '2025-01-10T10:00:00Z',
    totalExpectedRevenue: 15750000, // Calculated from active structures
    structuresNeedingReview: 1
};

// Audit Log Sample
export const auditLog = [
    { id: 'AL-001', structureId: 'FS-004', action: 'Created', user: 'Mary Wanjiku', timestamp: '2024-11-15T10:00:00Z', details: 'Created Form 1 Term 1 fee structure' },
    { id: 'AL-002', structureId: 'FS-004', action: 'Modified', user: 'Mary Wanjiku', timestamp: '2024-12-28T11:00:00Z', details: 'Updated tuition fee from KES 38,000 to KES 40,000' },
    { id: 'AL-003', structureId: 'FS-004', action: 'Activated', user: 'Jane Muthoni', timestamp: '2025-01-02T09:00:00Z', details: 'Activated fee structure for billing' },
    { id: 'AL-004', structureId: 'FS-006', action: 'Archived', user: 'John Kamau', timestamp: '2024-12-20T17:00:00Z', details: 'Archived Grade 7 2024 Term 3 structure' }
];
