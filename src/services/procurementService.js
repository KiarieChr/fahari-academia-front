
// Mock data for Purchase Requisitions
const MOCK_REQUISITIONS = [
    {
        id: 'REQ-2024-001',
        title: 'Office Supplies Q1',
        department: 'Administration',
        requestedBy: 'John Doe',
        requestDate: '2024-01-15',
        requiredDate: '2024-01-25',
        totalAmount: 45000,
        status: 'Approved',
        priority: 'Medium',
        description: 'Stationery and office consumables for Q1',
        items: [
            { id: 1, name: 'A4 Paper Reams', category: 'Stationery', quantity: 50, unit: 'Ream', unitCost: 500, total: 25000 },
            { id: 2, name: 'Ballpoint Pens (Blue)', category: 'Stationery', quantity: 20, unit: 'Box', unitCost: 200, total: 4000 },
            { id: 3, name: 'Staplers', category: 'Office Equipment', quantity: 10, unit: 'Pcs', unitCost: 600, total: 6000 },
            { id: 4, name: 'File Folders', category: 'Stationery', quantity: 100, unit: 'Pcs', unitCost: 100, total: 10000 },
        ],
        budgetLine: 'Office Expenses (vote-101)',
        approvals: [
            { stage: 'Dept Head', status: 'Approved', user: 'Jane Smith', date: '2024-01-16 10:00', comments: 'Approved' },
            { stage: 'Procurement', status: 'Approved', user: 'Admin User', date: '2024-01-17 09:30', comments: 'Sufficient budget' },
        ]
    },
    {
        id: 'REQ-2024-002',
        title: 'Science Lab Equipment',
        department: 'Science',
        requestedBy: 'Alice Cooper',
        requestDate: '2024-01-20',
        requiredDate: '2024-02-10',
        totalAmount: 1250000,
        status: 'Pending Approval',
        priority: 'High',
        description: 'New microscopes and chemicals for Chem Lab',
        items: [
            { id: 1, name: 'Microscope Model X', category: 'Lab Equipment', quantity: 20, unit: 'Pcs', unitCost: 50000, total: 1000000 },
            { id: 2, name: 'Chemical Kit A', category: 'Chemicals', quantity: 5, unit: 'Set', unitCost: 50000, total: 250000 },
        ],
        budgetLine: 'Lab Equipment (vote-205)',
        approvals: [
            { stage: 'Dept Head', status: 'Approved', user: 'Dr. Brown', date: '2024-01-21 14:00', comments: 'Urgent for exams' },
            { stage: 'Procurement', status: 'Pending', user: '-', date: '-', comments: '-' },
        ]
    },
    {
        id: 'REQ-2024-003',
        title: 'Library Books Donation',
        department: 'Library',
        requestedBy: 'Mary Librarian',
        requestDate: '2024-01-22',
        requiredDate: '2024-02-01',
        totalAmount: 0,
        status: 'Draft',
        priority: 'Low',
        description: 'Processing for donated books',
        items: [],
        budgetLine: 'Library (vote-301)',
        approvals: []
    },
    {
        id: 'REQ-2024-004',
        title: 'Staff Laptop Repairs',
        department: 'IT',
        requestedBy: 'Tech Support',
        requestDate: '2024-01-25',
        requiredDate: '2024-01-28',
        totalAmount: 85000,
        status: 'Rejected',
        priority: 'High',
        description: 'Urgent repairs for 3 laptops',
        items: [
            { id: 1, name: 'Screen Replacement', category: 'Repairs', quantity: 3, unit: 'Unit', unitCost: 15000, total: 45000 },
            { id: 2, name: 'Battery Replacement', category: 'Repairs', quantity: 4, unit: 'Unit', unitCost: 10000, total: 40000 },
        ],
        budgetLine: 'IT Maintenance (vote-402)',
        approvals: [
            { stage: 'Dept Head', status: 'Approved', user: 'IT Manager', date: '2024-01-25 09:00', comments: 'Critical' },
            { stage: 'Finance', status: 'Rejected', user: 'Finance Director', date: '2024-01-26 11:00', comments: 'Budget exhausted for repairs' },
        ]
    },
    {
        id: 'REQ-2024-005',
        title: 'Term 1 Sports Gear',
        department: 'Sports',
        requestedBy: 'Coach Carter',
        requestDate: '2024-01-10',
        requiredDate: '2024-01-30',
        totalAmount: 320000,
        status: 'PO Created',
        priority: 'Medium',
        description: 'Jerseys and balls',
        items: [],
        budgetLine: 'Sports & Co-curricular (vote-501)',
        approvals: []
    }
];

// Mock data for Purchase Orders
const MOCK_POS = [
    {
        id: 'PO-2024-001',
        requisitionId: 'REQ-2024-001',
        supplier: 'Office Depot Ltd',
        poDate: '2024-01-18',
        expectedDate: '2024-01-25',
        totalAmount: 45000,
        amountDelivered: 45000,
        balance: 0,
        paymentStatus: 'Paid',
        status: 'Completed',
        items: [
            { id: 1, name: 'A4 Paper Reams', quantity: 50, unit: 'Ream', unitPrice: 500, total: 25000, delivered: 50 },
            { id: 2, name: 'Ballpoint Pens (Blue)', quantity: 20, unit: 'Box', unitPrice: 200, total: 4000, delivered: 20 },
            { id: 3, name: 'Staplers', quantity: 10, unit: 'Pcs', unitPrice: 600, total: 6000, delivered: 10 },
            { id: 4, name: 'File Folders', quantity: 100, unit: 'Pcs', unitPrice: 100, total: 10000, delivered: 100 },
        ],
        approvals: [
            { stage: 'Procurement', status: 'Approved', user: 'Admin User', date: '2024-01-18', comments: 'Confirmed' },
            { stage: 'Finance', status: 'Approved', user: 'Finance Manager', date: '2024-01-18', comments: 'Funds reserved' }
        ]
    },
    {
        id: 'PO-2024-002',
        requisitionId: 'REQ-2024-002',
        supplier: 'SciLab Equipment co.',
        poDate: '2024-01-22',
        expectedDate: '2024-02-15',
        totalAmount: 1250000,
        amountDelivered: 0,
        balance: 1250000,
        paymentStatus: 'Unpaid',
        status: 'Issued',
        items: [
            { id: 1, name: 'Microscope Model X', quantity: 20, unit: 'Pcs', unitPrice: 50000, total: 1000000, delivered: 0 },
            { id: 2, name: 'Chemical Kit A', quantity: 5, unit: 'Set', unitPrice: 50000, total: 250000, delivered: 0 },
        ],
        approvals: [
            { stage: 'Procurement', status: 'Approved', user: 'Admin User', date: '2024-01-22', comments: 'Verified' }
        ]
    },
    {
        id: 'PO-2024-003',
        requisitionId: 'REQ-2024-005',
        supplier: 'Sports World',
        poDate: '2024-01-28',
        expectedDate: '2024-02-05',
        totalAmount: 320000,
        amountDelivered: 150000,
        balance: 170000,
        paymentStatus: 'Partial',
        status: 'Partially Delivered',
        items: [
            // Simulated items matching the requisition if it had them
            { id: 1, name: 'Football Jerseys', quantity: 50, unit: 'Set', unitPrice: 4000, total: 200000, delivered: 25 },
            { id: 2, name: 'Footballs (Pro)', quantity: 40, unit: 'Pcs', unitPrice: 3000, total: 120000, delivered: 10 },
        ],
        approvals: [
            { stage: 'Procurement', status: 'Approved', user: 'Admin User', date: '2024-01-28', comments: 'Approved' },
            { stage: 'Finance', status: 'Approved', user: 'Finance Manager', date: '2024-01-29', comments: 'Approved' }
        ]
    },
    {
        id: 'PO-2024-004',
        requisitionId: '-',
        supplier: 'Tech Solutions',
        poDate: '2024-01-30',
        expectedDate: '2024-02-10',
        totalAmount: 0,
        amountDelivered: 0,
        balance: 0,
        paymentStatus: 'Unpaid',
        status: 'Draft',
        items: [],
        approvals: []
    }
];

// Mock data for Goods Received Notes (GRN)
const MOCK_GRNS = [
    {
        id: 'GRN-2024-001',
        poId: 'PO-2024-001',
        supplier: 'Office Depot Ltd',
        dateReceived: '2024-01-20',
        receivedBy: 'Store Officer 1',
        deliveryNote: 'DN-998877',
        status: 'Posted',
        totalItems: 4,
        totalValue: 45000,
        items: [
            { id: 1, name: 'A4 Paper Reams', quantityReceived: 50, quantityRejected: 0, status: 'Passed' },
            { id: 2, name: 'Ballpoint Pens (Blue)', quantityReceived: 20, quantityRejected: 0, status: 'Passed' },
            { id: 3, name: 'Staplers', quantityReceived: 10, quantityRejected: 0, status: 'Passed' },
            { id: 4, name: 'File Folders', quantityReceived: 100, quantityRejected: 0, status: 'Passed' }
        ]
    },
    {
        id: 'GRN-2024-002',
        poId: 'PO-2024-003',
        supplier: 'Sports World',
        dateReceived: '2024-01-30',
        receivedBy: 'Store Officer 2',
        deliveryNote: 'DN-554433',
        status: 'Inspected',
        totalItems: 2,
        totalValue: 150000,
        items: [
            { id: 1, name: 'Football Jerseys', quantityReceived: 25, quantityRejected: 0, status: 'Passed' },
            { id: 2, name: 'Footballs (Pro)', quantityReceived: 10, quantityRejected: 0, status: 'Passed' }
        ]
    }
];

export const procurementService = {
    getRequisitions: async (params) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            data: MOCK_REQUISITIONS,
            stats: {
                total: 125,
                pending: 14,
                approved: 86,
                rejected: 5,
                poCreated: 20,
                totalAmount: 4500000
            }
        };
    },

    getRequisitionStats: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            data: {
                total: 125,
                pending: 14,
                approved: 86,
                rejected: 5,
                poCreated: 20,
                totalAmount: 4500000,
                monthlyTrend: [10, 15, 8, 20, 15, 25] // Example data
            }
        };
    },

    createRequisition: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newReq = {
            ...data,
            id: `REQ-2024-${Math.floor(Math.random() * 1000)}`,
            status: 'Draft',
            approvals: []
        };
        MOCK_REQUISITIONS.unshift(newReq);
        return { data: newReq };
    },

    getRequisitionById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const req = MOCK_REQUISITIONS.find(r => r.id === id);
        if (!req) throw new Error("Requisition not found");
        return { data: req };
    },

    updateRequisitionStatus: async (id, status, comments) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const req = MOCK_REQUISITIONS.find(r => r.id === id);
        if (req) {
            req.status = status;
        }
        return { data: req };
    },

    // --- Purchase Order Methods ---

    getPurchaseOrders: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            data: MOCK_POS,
            stats: {
                total: MOCK_POS.length,
                draft: MOCK_POS.filter(p => p.status === 'Draft').length,
                issued: MOCK_POS.filter(p => p.status === 'Issued').length,
                partial: MOCK_POS.filter(p => p.status === 'Partially Delivered').length,
                completed: MOCK_POS.filter(p => p.status === 'Completed').length,
                cancelled: MOCK_POS.filter(p => p.status === 'Cancelled').length,
                totalValue: MOCK_POS.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
                outstandingValue: MOCK_POS.reduce((sum, p) => sum + (p.balance || 0), 0)
            }
        };
    },

    createPurchaseOrder: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newPO = {
            ...data,
            id: `PO-2024-${Math.floor(Math.random() * 1000)}`,
            status: 'Draft',
            approvals: [],
            amountDelivered: 0,
            balance: data.totalAmount || 0
        };
        MOCK_POS.unshift(newPO);
        return { data: newPO };
    },

    getPurchaseOrderById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const po = MOCK_POS.find(p => p.id === id);
        if (!po) throw new Error("Purchase Order not found");
        return { data: po };
    },

    // --- GRN Methods ---

    getGRNs: async (params) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            data: MOCK_GRNS,
            stats: {
                total: MOCK_GRNS.length,
                pendingInspection: MOCK_GRNS.filter(g => g.status === 'Submitted').length,
                posted: MOCK_GRNS.filter(g => g.status === 'Posted').length,
                totalValue: MOCK_GRNS.reduce((sum, g) => sum + g.totalValue, 0)
            }
        };
    },

    getGRNById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const grn = MOCK_GRNS.find(g => g.id === id);
        if (!grn) throw new Error("GRN not found");
        return { data: grn };
    },

    createGRN: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 1200));
        const newGRN = {
            ...data,
            id: `GRN-2024-${Math.floor(Math.random() * 1000)}`,
            status: 'Submitted',
            totalValue: data.items.reduce((sum, item) => sum + (item.quantityReceived * (item.unitPrice || 0)), 0)
        };
        MOCK_GRNS.unshift(newGRN);

        // Update linked PO (Mock Logic)
        const po = MOCK_POS.find(p => p.id === data.poId);
        if (po) {
            let totalDeliveredValue = 0;
            newGRN.items.forEach(item => {
                const poItem = po.items.find(i => i.id === item.id);
                if (poItem) {
                    poItem.delivered = (poItem.delivered || 0) + parseInt(item.quantityReceived);
                    totalDeliveredValue += item.quantityReceived * poItem.unitPrice;
                }
            });
            po.amountDelivered = (po.amountDelivered || 0) + totalDeliveredValue;
            po.balance = po.totalAmount - po.amountDelivered;

            if (po.balance <= 0) po.status = 'Completed';
            else po.status = 'Partially Delivered';
        }

        return { data: newGRN };
    },

    updateGRNStatus: async (id, status, comments) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const grn = MOCK_GRNS.find(g => g.id === id);
        if (grn) {
            grn.status = status;
        }
        return { data: grn };
    }
};


