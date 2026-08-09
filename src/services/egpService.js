
// Mock Data for Tenders/RFQs
const MOCK_TENDERS = [
    {
        id: 'TND-2024-001',
        title: 'Supply of Laboratory Equipment',
        method: 'Open Tender',
        status: 'Active',
        value: 12000000,
        startDate: '2024-05-01',
        endDate: '2024-05-30',
        bidsReceived: 8,
        complianceStatus: 'Compliant'
    },
    {
        id: 'RFQ-2024-045',
        title: 'Repair of School Bus Engine',
        method: 'RFQ',
        status: 'Evaluation',
        value: 450000,
        startDate: '2024-05-10',
        endDate: '2024-05-17',
        bidsReceived: 3,
        complianceStatus: 'Compliant'
    },
    {
        id: 'DIR-2024-012',
        title: 'Emergency Plumbing Works',
        method: 'Direct Procurement',
        status: 'Awarded',
        value: 85000,
        startDate: '2024-05-15',
        endDate: '2024-05-15',
        bidsReceived: 1,
        complianceStatus: 'Flagged',
        justification: 'Water pipe burst flooding library'
    }
];

// Mock Audit Logs
const MOCK_LOGS = [
    { id: 1, date: '2024-05-20 10:30', user: 'Procurement Officer', action: 'Tender Created', details: 'Created TND-2024-001' },
    { id: 2, date: '2024-05-20 11:15', user: 'System', action: 'Compliance Check', details: 'RFQ-2024-045 passed threshold check' },
    { id: 3, date: '2024-05-21 09:00', user: 'Admin', action: 'Override Approval', details: 'Approved Direct Procurement DIR-2024-012 (Emergency)' }
];

export const egpService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 600));

        return {
            totalProcurements: 45,
            complianceRate: 94, // %
            activeTenders: 5,
            flaggedTransactions: 2,
            methodDistribution: [
                { name: 'Open Tender', value: 12 },
                { name: 'RFQ', value: 25 },
                { name: 'Direct', value: 8 }
            ]
        };
    },

    // Get Tenders List
    getTenders: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_TENDERS;
    },

    // Get Audit Logs
    getAuditLogs: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_LOGS;
    },

    // Validate if a procurement is compliant based on value and method
    validateCompliance: (value, method) => {
        // Simple Threshold Rules (Mock)
        if (method === 'RFQ' && value > 500000) {
            return { valid: false, message: 'Value exceeds RFQ threshold (500k). Use Restricted Tender.' };
        }
        if (method === 'Direct Procurement' && value > 50000) {
            return { valid: false, message: 'Value exceeds Direct Procurement threshold (50k). Justification required.' };
        }
        return { valid: true, message: 'Compliant' };
    }
};
