// Budget Mock Data for School ERP Budgeting Dashboard

// Department Budgets with Actual Payments
export const departmentBudgets = [
    {
        id: 'DEPT-001',
        department: 'Academic Department',
        category: 'Teaching & Learning',
        approvedBudget: 4500000,
        actualSpent: 3850000,
        pendingPayments: 250000,
        term: 'Term 1',
        year: '2026',
        status: 'Within Budget',
        subCategories: [
            { name: 'Textbooks & Materials', budget: 1200000, spent: 1050000 },
            { name: 'Laboratory Equipment', budget: 1500000, spent: 1300000 },
            { name: 'Teaching Aids', budget: 800000, spent: 650000 },
            { name: 'Library Books', budget: 1000000, spent: 850000 }
        ],
        payments: [
            { id: 'PV-2026-001', date: '2026-01-15', supplier: 'Kenya Publishers Ltd', amount: 450000, voucherRef: 'PV-001', description: 'Textbooks for Form 1-4' },
            { id: 'PV-2026-015', date: '2026-01-20', supplier: 'Science Supplies Co', amount: 680000, voucherRef: 'PV-015', description: 'Lab equipment and chemicals' },
            { id: 'PV-2026-028', date: '2026-01-25', supplier: 'Educational Resources', amount: 320000, voucherRef: 'PV-028', description: 'Teaching charts and models' }
        ]
    },
    {
        id: 'DEPT-002',
        department: 'Administration',
        category: 'Operations',
        approvedBudget: 2800000,
        actualSpent: 2950000,
        pendingPayments: 150000,
        term: 'Term 1',
        year: '2026',
        status: 'Over Budget',
        subCategories: [
            { name: 'Office Supplies', budget: 500000, spent: 580000 },
            { name: 'Communication', budget: 400000, spent: 420000 },
            { name: 'Travel & Transport', budget: 900000, spent: 950000 },
            { name: 'Meetings & Workshops', budget: 1000000, spent: 1000000 }
        ],
        payments: [
            { id: 'PV-2026-003', date: '2026-01-10', supplier: 'Office Mart Kenya', amount: 285000, voucherRef: 'PV-003', description: 'Office stationery and supplies' },
            { id: 'PV-2026-012', date: '2026-01-18', supplier: 'Safaricom Business', amount: 180000, voucherRef: 'PV-012', description: 'Internet and phone services' },
            { id: 'PV-2026-025', date: '2026-01-28', supplier: 'Various Staff', amount: 450000, voucherRef: 'PV-025', description: 'Staff travel allowances' }
        ]
    },
    {
        id: 'DEPT-003',
        department: 'Infrastructure & Maintenance',
        category: 'Capital Projects',
        approvedBudget: 5200000,
        actualSpent: 3100000,
        pendingPayments: 800000,
        term: 'Term 1',
        year: '2026',
        status: 'Within Budget',
        subCategories: [
            { name: 'Building Repairs', budget: 2000000, spent: 1200000 },
            { name: 'Plumbing & Electrical', budget: 1200000, spent: 800000 },
            { name: 'Furniture & Fittings', budget: 1000000, spent: 600000 },
            { name: 'Grounds Maintenance', budget: 1000000, spent: 500000 }
        ],
        payments: [
            { id: 'PV-2026-008', date: '2026-01-12', supplier: 'BuildRight Contractors', amount: 850000, voucherRef: 'PV-008', description: 'Classroom roof repairs' },
            { id: 'PV-2026-020', date: '2026-01-22', supplier: 'ElectroFix Ltd', amount: 420000, voucherRef: 'PV-020', description: 'Electrical wiring upgrade' },
            { id: 'PV-2026-030', date: '2026-01-30', supplier: 'Furniture World', amount: 380000, voucherRef: 'PV-030', description: 'Student desks and chairs' }
        ]
    },
    {
        id: 'DEPT-004',
        department: 'Sports & Co-Curricular',
        category: 'Student Activities',
        approvedBudget: 1800000,
        actualSpent: 1650000,
        pendingPayments: 100000,
        term: 'Term 1',
        year: '2026',
        status: 'Within Budget',
        subCategories: [
            { name: 'Sports Equipment', budget: 600000, spent: 550000 },
            { name: 'Music & Drama', budget: 400000, spent: 380000 },
            { name: 'Clubs & Societies', budget: 300000, spent: 270000 },
            { name: 'Competitions & Events', budget: 500000, spent: 450000 }
        ],
        payments: [
            { id: 'PV-2026-005', date: '2026-01-14', supplier: 'Sports Arena Kenya', amount: 320000, voucherRef: 'PV-005', description: 'Football and volleyball equipment' },
            { id: 'PV-2026-018', date: '2026-01-24', supplier: 'Music Instruments Ltd', amount: 280000, voucherRef: 'PV-018', description: 'Musical instruments' },
            { id: 'PV-2026-027', date: '2026-01-29', supplier: 'Event Organizers', amount: 180000, voucherRef: 'PV-027', description: 'Inter-school competition fees' }
        ]
    },
    {
        id: 'DEPT-005',
        department: 'ICT & Technology',
        category: 'Technology',
        approvedBudget: 3200000,
        actualSpent: 3350000,
        pendingPayments: 200000,
        term: 'Term 1',
        year: '2026',
        status: 'Over Budget',
        subCategories: [
            { name: 'Computer Hardware', budget: 1500000, spent: 1600000 },
            { name: 'Software Licenses', budget: 800000, spent: 850000 },
            { name: 'Internet & Connectivity', budget: 500000, spent: 500000 },
            { name: 'IT Support & Maintenance', budget: 400000, spent: 400000 }
        ],
        payments: [
            { id: 'PV-2026-002', date: '2026-01-08', supplier: 'Tech Solutions Kenya', amount: 950000, voucherRef: 'PV-002', description: 'Desktop computers and monitors' },
            { id: 'PV-2026-010', date: '2026-01-16', supplier: 'Microsoft Kenya', amount: 420000, voucherRef: 'PV-010', description: 'Office 365 licenses' },
            { id: 'PV-2026-022', date: '2026-01-26', supplier: 'Safaricom Business', amount: 250000, voucherRef: 'PV-022', description: 'Fiber internet installation' }
        ]
    },
    {
        id: 'DEPT-006',
        department: 'Utilities',
        category: 'Operations',
        approvedBudget: 1500000,
        actualSpent: 1200000,
        pendingPayments: 180000,
        term: 'Term 1',
        year: '2026',
        status: 'Within Budget',
        subCategories: [
            { name: 'Electricity', budget: 700000, spent: 580000 },
            { name: 'Water', budget: 400000, spent: 320000 },
            { name: 'Waste Management', budget: 200000, spent: 150000 },
            { name: 'Security Services', budget: 200000, spent: 150000 }
        ],
        payments: [
            { id: 'PV-2026-004', date: '2026-01-11', supplier: 'Kenya Power', amount: 285000, voucherRef: 'PV-004', description: 'Electricity bill - January' },
            { id: 'PV-2026-014', date: '2026-01-19', supplier: 'Nairobi Water', amount: 165000, voucherRef: 'PV-014', description: 'Water bill - January' },
            { id: 'PV-2026-024', date: '2026-01-27', supplier: 'SecureGuard Ltd', amount: 120000, voucherRef: 'PV-024', description: 'Security services - January' }
        ]
    },
    {
        id: 'DEPT-007',
        department: 'Catering & Nutrition',
        category: 'Student Welfare',
        approvedBudget: 2500000,
        actualSpent: 2480000,
        pendingPayments: 150000,
        term: 'Term 1',
        year: '2026',
        status: 'Warning',
        subCategories: [
            { name: 'Food Supplies', budget: 1800000, spent: 1780000 },
            { name: 'Kitchen Equipment', budget: 400000, spent: 400000 },
            { name: 'Kitchen Staff Uniforms', budget: 150000, spent: 150000 },
            { name: 'Hygiene & Sanitation', budget: 150000, spent: 150000 }
        ],
        payments: [
            { id: 'PV-2026-006', date: '2026-01-13', supplier: 'Fresh Foods Suppliers', amount: 680000, voucherRef: 'PV-006', description: 'Food supplies - Week 1-2' },
            { id: 'PV-2026-016', date: '2026-01-21', supplier: 'Fresh Foods Suppliers', amount: 720000, voucherRef: 'PV-016', description: 'Food supplies - Week 3-4' },
            { id: 'PV-2026-026', date: '2026-01-28', supplier: 'Kitchen Pro Ltd', amount: 280000, voucherRef: 'PV-026', description: 'Industrial cooker repair' }
        ]
    }
];

// Monthly Budget Trend Data
export const monthlyTrend = [
    { month: 'Jan', budget: 18000000, actual: 15580000 },
    { month: 'Feb', budget: 18000000, actual: 16200000 },
    { month: 'Mar', budget: 18000000, actual: 17100000 },
    { month: 'Apr', budget: 18000000, actual: 14800000 },
    { month: 'May', budget: 18000000, actual: 15900000 }
];

// Budget Summary Statistics
export const budgetSummary = {
    totalApprovedBudget: 21500000,
    totalActualSpent: 18580000,
    totalPendingPayments: 1830000,
    totalRemaining: 2920000,
    utilizationPercentage: 86.4,
    departmentsOverBudget: 2,
    departmentsWithinBudget: 5,
    term: 'Term 1',
    year: '2026'
};

// Budget Alerts
export const budgetAlerts = [
    {
        id: 'ALERT-001',
        type: 'over-budget',
        severity: 'high',
        department: 'Administration',
        message: 'Department has exceeded approved budget by KES 150,000',
        date: '2026-01-28',
        threshold: 100
    },
    {
        id: 'ALERT-002',
        type: 'over-budget',
        severity: 'high',
        department: 'ICT & Technology',
        message: 'Department has exceeded approved budget by KES 150,000',
        date: '2026-01-26',
        threshold: 104.7
    },
    {
        id: 'ALERT-003',
        type: 'threshold',
        severity: 'warning',
        department: 'Catering & Nutrition',
        message: 'Budget utilization at 99.2% - approaching limit',
        date: '2026-01-28',
        threshold: 99.2
    },
    {
        id: 'ALERT-004',
        type: 'threshold',
        severity: 'warning',
        department: 'Academic Department',
        message: 'Budget utilization at 91.1% - monitor spending',
        date: '2026-01-25',
        threshold: 91.1
    }
];

// Budget Periods
export const budgetPeriods = {
    years: ['2024', '2025', '2026'],
    terms: ['Term 1', 'Term 2', 'Term 3'],
    currentYear: '2026',
    currentTerm: 'Term 1'
};

// Budget Utilization by Department (for charts)
export const budgetUtilization = departmentBudgets.map(dept => ({
    department: dept.department,
    utilization: ((dept.actualSpent / dept.approvedBudget) * 100).toFixed(1),
    status: dept.status
}));

// Over-Budget Departments
export const overBudgetDepartments = departmentBudgets
    .filter(dept => dept.actualSpent > dept.approvedBudget)
    .map(dept => ({
        department: dept.department,
        approved: dept.approvedBudget,
        spent: dept.actualSpent,
        overAmount: dept.actualSpent - dept.approvedBudget,
        percentage: (((dept.actualSpent - dept.approvedBudget) / dept.approvedBudget) * 100).toFixed(1)
    }));

// Budget vs Actual Chart Data
export const budgetVsActualChart = departmentBudgets.map(dept => ({
    department: dept.department.length > 20 ? dept.department.substring(0, 17) + '...' : dept.department,
    budget: dept.approvedBudget,
    actual: dept.actualSpent,
    pending: dept.pendingPayments
}));
