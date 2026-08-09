
import { procurementService } from './procurementService';
import { inventoryService } from './inventoryService';

// Mock data for reports that don't have underlying services yet
const MOCK_BUDGET_DATA = [
    { department: 'Administration', allocated: 5000000, spend: 3200000, committed: 450000, remaining: 1350000 },
    { department: 'Science Dept', allocated: 2500000, spend: 1800000, committed: 200000, remaining: 500000 },
    { department: 'Sports', allocated: 1500000, spend: 900000, committed: 100000, remaining: 500000 },
    { department: 'Maintenance', allocated: 3000000, spend: 2100000, committed: 600000, remaining: 300000 },
];

const MOCK_SUPPLIER_PERFORMANCE = [
    { id: 1, name: 'Office Depot Ltd', rating: 4.8, onTimeDelivery: '98%', rejectionRate: '0.5%', totalSpend: 1200000 },
    { id: 2, name: 'Tech Solutions', rating: 4.2, onTimeDelivery: '85%', rejectionRate: '2%', totalSpend: 4500000 },
    { id: 3, name: 'CleanAll Ltd', rating: 4.9, onTimeDelivery: '99%', rejectionRate: '0%', totalSpend: 800000 },
    { id: 4, name: 'Stationery World', rating: 3.5, onTimeDelivery: '70%', rejectionRate: '5%', totalSpend: 300000 },
];

export const procurementReportService = {
    // Aggregated KPI Stats for the Overview Dashboard
    getDashboardStats: async () => {
        // In a real app, this would be complex SQL aggregations
        // Here we simulate pulling from our other mock services
        const [inventoryStats, grnStats] = await Promise.all([
            inventoryService.getInventoryItems(),
            procurementService.getGRNs() // We need to make sure getGRNs exists in procurementService or use mock
        ]);

        return {
            totalSpendYTD: 14500000, // Mock
            requisitionConversionRate: '85%', // Mock
            avgApprovalTime: '2.4 Days', // Mock
            openPOValue: 2500000, // Mock based on open POs
            stockValue: inventoryStats.stats.totalStockValue,
            supplierPerformanceIndex: 4.5
        };
    },

    // Report Generator
    getReportData: async (reportId, filters = {}) => {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

        switch (reportId) {
            case 'spend_analysis':
                return {
                    columns: [
                        { key: 'department', label: 'Department' },
                        { key: 'allocated', label: 'Budget Allocated', type: 'currency' },
                        { key: 'spend', label: 'Actual Spend', type: 'currency' },
                        { key: 'committed', label: 'Committed', type: 'currency' },
                        { key: 'remaining', label: 'Remaining', type: 'currency' }
                    ],
                    data: MOCK_BUDGET_DATA
                };

            case 'supplier_performance':
                return {
                    columns: [
                        { key: 'name', label: 'Supplier Name' },
                        { key: 'rating', label: 'Rating (0-5)', type: 'rating' },
                        { key: 'onTimeDelivery', label: 'On-Time Delivery' },
                        { key: 'rejectionRate', label: 'Rejection Rate' },
                        { key: 'totalSpend', label: 'Total Spend', type: 'currency' }
                    ],
                    data: MOCK_SUPPLIER_PERFORMANCE
                };

            case 'stock_valuation':
                const stock = await inventoryService.getInventoryItems();
                return {
                    columns: [
                        { key: 'name', label: 'Item Name' },
                        { key: 'category', label: 'Category' },
                        { key: 'stock', label: 'Qty Hand' },
                        { key: 'unit', label: 'Unit' },
                        { key: 'unitCost', label: 'Unit Cost', type: 'currency' },
                        { key: 'totalValue', label: 'Total Value', type: 'currency' } // We calculate this below
                    ],
                    data: stock.data.map(i => ({ ...i, totalValue: i.stock * i.unitCost }))
                };

            case 'low_stock':
                const allStock = await inventoryService.getInventoryItems();
                const lowStock = allStock.data.filter(i => i.stock <= i.minLevel);
                return {
                    columns: [
                        { key: 'name', label: 'Item Name' },
                        { key: 'stock', label: 'Current Stock', type: 'number', highlight: true },
                        { key: 'minLevel', label: 'Reorder Level' },
                        { key: 'supplier', label: 'Preferred Supplier' }
                    ],
                    data: lowStock
                };

            default:
                return { columns: [], data: [] };
        }
    }
};
