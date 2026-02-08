
// Mock Data for Inventory Items (Expanded for Stock Master)
const MOCK_ITEMS = [
    {
        id: 1,
        name: 'A4 Paper Reams',
        category: 'Stationery',
        type: 'Consumable',
        stock: 150,
        unit: 'Ream',
        unitCost: 500,
        minLevel: 20,
        location: 'Store A-12',
        expiry: null,
        batch: 'B-2023-001',
        supplier: 'Office Depot Ltd',
        status: 'Active'
    },
    {
        id: 2,
        name: 'Ballpoint Pens (Blue)',
        category: 'Stationery',
        type: 'Consumable',
        stock: 50,
        unit: 'Box',
        unitCost: 200,
        minLevel: 10,
        location: 'Store A-14',
        expiry: null,
        batch: 'B-2023-055',
        supplier: 'Office Depot Ltd',
        status: 'Active'
    },
    {
        id: 3,
        name: 'Staplers',
        category: 'Office Equipment',
        type: 'Consumable',
        stock: 25,
        unit: 'Pcs',
        unitCost: 600,
        minLevel: 5,
        location: 'Store B-01',
        expiry: null,
        batch: '-',
        supplier: 'Stationery World',
        status: 'Active'
    },
    {
        id: 4,
        name: 'File Folders',
        category: 'Stationery',
        type: 'Consumable',
        stock: 300,
        unit: 'Pcs',
        unitCost: 100,
        minLevel: 50,
        location: 'Store A-10',
        expiry: null,
        batch: '-',
        supplier: 'Office Depot Ltd',
        status: 'Active'
    },
    {
        id: 5,
        name: 'Whiteboard Markers',
        category: 'Stationery',
        type: 'Consumable',
        stock: 8,
        unit: 'Box',
        unitCost: 1200,
        minLevel: 10,
        location: 'Store B-05',
        expiry: '2024-12-31',
        batch: 'EXP-991',
        supplier: 'School Supplies Co',
        status: 'Active'
    },
    {
        id: 6,
        name: 'Cleaning Detergent',
        category: 'Cleaning',
        type: 'Consumable',
        stock: 40,
        unit: 'Jerrican',
        unitCost: 800,
        minLevel: 15,
        location: 'Store C-01',
        expiry: '2025-06-30',
        batch: 'CHEM-001',
        supplier: 'CleanAll Ltd',
        status: 'Active'
    },
    {
        id: 7,
        name: 'Toilet Tissue',
        category: 'Cleaning',
        type: 'Consumable',
        stock: 500,
        unit: 'Bale',
        unitCost: 400,
        minLevel: 100,
        location: 'Store C-02',
        expiry: null,
        batch: '-',
        supplier: 'CleanAll Ltd',
        status: 'Active'
    },
    {
        id: 8,
        name: 'Office Projector',
        category: 'Electronics',
        type: 'Capital Asset',
        stock: 2,
        unit: 'Unit',
        unitCost: 45000,
        minLevel: 1,
        location: 'Secure Store 1',
        expiry: null,
        batch: 'SN-998877',
        supplier: 'Tech Solutions',
        status: 'Active'
    },
    {
        id: 9,
        name: 'Expired Chemicals',
        category: 'Science Lab',
        type: 'Consumable',
        stock: 5,
        unit: 'Liters',
        unitCost: 2000,
        minLevel: 0,
        location: 'Hazmat Store',
        expiry: '2023-01-01', // Expired
        batch: 'OLD-001',
        supplier: 'SciLab Co',
        status: 'Expired'
    }
];

// Mock Stock Movement History
const MOCK_MOVEMENTS = [
    { id: 1, date: '2024-01-15', type: 'IN', reference: 'GRN-2024-001', itemId: 1, quantity: 100, balance: 100, user: 'Store Officer' },
    { id: 2, date: '2024-01-20', type: 'OUT', reference: 'ISS-2024-001', itemId: 1, quantity: 10, balance: 140, user: 'John Doe' },
    { id: 3, date: '2024-01-22', type: 'ADJ', reference: 'Audit', itemId: 1, quantity: -5, balance: 145, user: 'Auditor', reason: 'Damaged' }
];

// Mock Data for Issue Transactions (Existing)
const MOCK_ISSUES = [
    {
        id: 'ISS-2024-001',
        date: '2024-01-25',
        department: 'Administration',
        requestedBy: 'John Doe',
        approvedBy: 'Store Manager',
        status: 'Issued',
        totalItems: 3,
        totalValue: 12500,
        items: [
            { itemId: 1, name: 'A4 Paper Reams', quantity: 10, unit: 'Ream', cost: 500, total: 5000 },
            { itemId: 2, name: 'Ballpoint Pens (Blue)', quantity: 5, unit: 'Box', cost: 200, total: 1000 },
            { itemId: 4, name: 'File Folders', quantity: 65, unit: 'Pcs', cost: 100, total: 6500 }
        ]
    },
    {
        id: 'ISS-2024-002',
        date: '2024-01-28',
        department: 'Science Dept',
        requestedBy: 'Alice Cooper',
        approvedBy: 'Store Manager',
        status: 'Pending',
        totalItems: 1,
        totalValue: 2400,
        items: [
            { itemId: 5, name: 'Whiteboard Markers', quantity: 2, unit: 'Box', cost: 1200, total: 2400 }
        ]
    }
];

export const inventoryService = {
    // --- ITEM MASTER METHODS ---

    getInventoryItems: async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const today = new Date().toISOString().split('T')[0];

        return {
            data: MOCK_ITEMS,
            stats: {
                totalItems: MOCK_ITEMS.length,
                totalStockValue: MOCK_ITEMS.reduce((sum, i) => sum + (i.stock * i.unitCost), 0),
                lowStock: MOCK_ITEMS.filter(i => i.stock <= i.minLevel).length,
                outOfStock: MOCK_ITEMS.filter(i => i.stock === 0).length,
                expired: MOCK_ITEMS.filter(i => i.expiry && i.expiry < today).length,
                capitalAssets: MOCK_ITEMS.filter(i => i.type === 'Capital Asset').length
            }
        };
    },

    getItemById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const item = MOCK_ITEMS.find(i => i.id === id);
        return { data: item };
    },

    createItem: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newItem = {
            ...data,
            id: MOCK_ITEMS.length + 1,
            stock: data.stock || 0, // Initial stock
            status: 'Active'
        };
        MOCK_ITEMS.push(newItem);
        return { data: newItem };
    },

    updateItem: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const index = MOCK_ITEMS.findIndex(i => i.id === id);
        if (index !== -1) {
            MOCK_ITEMS[index] = { ...MOCK_ITEMS[index], ...data };
            return { data: MOCK_ITEMS[index] };
        }
        throw new Error("Item not found");
    },

    // --- STOCK MOVEMENT & ADJUSTMENT ---

    getStockMovements: async (itemId) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        // Filter mock movements or generate random ones for demo
        const movements = MOCK_MOVEMENTS.filter(m => !itemId || m.itemId === itemId);
        return { data: movements };
    },

    adjustStock: async (data) => {
        // data: { itemId, adjustmentQty, type: 'Increase'|'Decrease', reason }
        await new Promise(resolve => setTimeout(resolve, 800));

        const item = MOCK_ITEMS.find(i => i.id === data.itemId);
        if (!item) throw new Error("Item not found");

        const qty = parseInt(data.adjustmentQty);
        if (data.type === 'Decrease') {
            item.stock -= qty;
        } else {
            item.stock += qty;
        }

        // Log movement
        const newMove = {
            id: MOCK_MOVEMENTS.length + 1,
            date: new Date().toISOString().split('T')[0],
            type: data.type === 'Decrease' ? 'OUT' : 'IN',
            reference: 'Manual Adj',
            itemId: item.id,
            quantity: qty,
            balance: item.stock,
            user: 'Admin',
            reason: data.reason
        };
        MOCK_MOVEMENTS.unshift(newMove);

        return { data: item };
    },

    // --- SUPPLY ISSUE METHODS (Existing) ---

    getIssues: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            data: MOCK_ISSUES,
            stats: {
                totalIssues: MOCK_ISSUES.length,
                pending: MOCK_ISSUES.filter(i => i.status === 'Pending').length,
                totalValueIssued: MOCK_ISSUES.filter(i => i.status === 'Issued').reduce((sum, i) => sum + i.totalValue, 0)
            }
        };
    },

    createIssue: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newIssue = {
            ...data,
            id: `ISS-2024-${Math.floor(Math.random() * 1000)}`,
            status: 'Pending',
            totalValue: data.items.reduce((sum, item) => sum + (item.quantity * item.cost), 0),
            totalItems: data.items.length
        };
        MOCK_ISSUES.unshift(newIssue);
        return { data: newIssue };
    },

    updateIssueStatus: async (id, status) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const issue = MOCK_ISSUES.find(i => i.id === id);
        if (!issue) throw new Error("Issue not found");

        if (status === 'Issued' && issue.status !== 'Issued') {
            issue.items.forEach(issueItem => {
                const inventoryItem = MOCK_ITEMS.find(i => i.id === issueItem.itemId);
                if (inventoryItem) {
                    inventoryItem.stock -= parseInt(issueItem.quantity);
                    // Log movement
                    MOCK_MOVEMENTS.unshift({
                        id: MOCK_MOVEMENTS.length + 1,
                        date: new Date().toISOString().split('T')[0],
                        type: 'OUT',
                        reference: issue.id,
                        itemId: inventoryItem.id,
                        quantity: parseInt(issueItem.quantity),
                        balance: inventoryItem.stock,
                        user: issue.requestedBy
                    });
                }
            });
        }

        issue.status = status;
        return { data: issue };
    }
};
