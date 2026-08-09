import { api } from './api';

// Map backend snake_case fields to frontend camelCase for display
const mapItem = (item) => ({
    ...item,
    category: item.category_name || item.category?.name || item.category || '',
    type: item.item_type === 'CAPITAL_ASSET' ? 'Capital Asset'
        : item.item_type === 'RAW_MATERIAL' ? 'Raw Material'
        : 'Consumable',
    stock: parseFloat(item.stock_quantity || 0),
    unit: item.unit_of_measure || '',
    unitCost: parseFloat(item.unit_cost || 0),
    minLevel: parseFloat(item.min_level || 0),
    batch: item.batch_number || '-',
    expiry: item.expiry_date || null,
    supplier: item.supplier_name || '',
    status: item.status || 'ACTIVE',
    location: item.location || '',
    stockValue: parseFloat(item.stock_value || 0),
});

// Map frontend camelCase form data to backend snake_case for submission
const mapItemToAPI = (data) => {
    const payload = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.category !== undefined) payload.category = data.category;
    if (data.type !== undefined) {
        payload.item_type = data.type === 'Capital Asset' ? 'CAPITAL_ASSET'
            : data.type === 'Raw Material' ? 'RAW_MATERIAL' : 'CONSUMABLE';
    }
    if (data.unit !== undefined) payload.unit_of_measure = data.unit;
    if (data.unitCost !== undefined) payload.unit_cost = data.unitCost;
    if (data.stock !== undefined) payload.stock_quantity = data.stock;
    if (data.minLevel !== undefined) payload.min_level = data.minLevel;
    if (data.location !== undefined) payload.location = data.location;
    if (data.batch !== undefined && data.batch !== '-') payload.batch_number = data.batch;
    if (data.expiry !== undefined) payload.expiry_date = data.expiry || null;
    if (data.supplier !== undefined) payload.supplier = data.supplier || null;
    return payload;
};

export const inventoryService = {
    // --- ITEM MASTER METHODS ---

    getInventoryItems: async (params = {}) => {
        const [items, stats] = await Promise.all([
            api.get('/api/inventory/items/', { params }),
            api.get('/api/inventory/items/stats/')
        ]);
        const rawData = Array.isArray(items) ? items : (items.results || []);
        const data = rawData.map(mapItem);

        return {
            data,
            stats: {
                totalItems: stats.total_items,
                totalStockValue: parseFloat(stats.total_stock_value || 0),
                lowStock: stats.low_stock,
                outOfStock: stats.out_of_stock,
                expired: stats.expired,
                capitalAssets: stats.capital_assets,
                totalValue: parseFloat(stats.total_stock_value || 0),
            }
        };
    },

    getItemById: async (id) => {
        const item = await api.get(`/api/inventory/items/${id}/`);
        return { data: mapItem(item) };
    },

    createItem: async (data) => {
        const item = await api.post('/api/inventory/items/', mapItemToAPI(data));
        return { data: mapItem(item) };
    },

    updateItem: async (id, data) => {
        const item = await api.put(`/api/inventory/items/${id}/`, mapItemToAPI(data));
        return { data: mapItem(item) };
    },

    deleteItem: async (id) => {
        await api.delete(`/api/inventory/items/${id}/`);
    },

    // --- CATEGORIES ---

    getCategories: async () => {
        const data = await api.get('/api/inventory/categories/');
        return Array.isArray(data) ? data : (data.results || []);
    },

    createCategory: async (data) => {
        return api.post('/api/inventory/categories/', data);
    },

    // --- STOCK MOVEMENT & ADJUSTMENT ---

    getStockMovements: async (itemId) => {
        const data = await api.get(`/api/inventory/items/${itemId}/movements/`);
        return { data: Array.isArray(data) ? data : (data.results || []) };
    },

    adjustStock: async (itemId, data) => {
        // data: { adjustment_type: 'INCREASE'|'DECREASE', quantity, reason, post_to_gl }
        const result = await api.post(`/api/inventory/items/${itemId}/adjust/`, data);
        return { data: result };
    },

    // Legacy signature support: adjustStock({ itemId, type, adjustmentQty, reason })
    adjustStockLegacy: async (data) => {
        const payload = {
            adjustment_type: data.type === 'Decrease' ? 'DECREASE' : 'INCREASE',
            quantity: parseInt(data.adjustmentQty),
            reason: data.reason || '',
        };
        return inventoryService.adjustStock(data.itemId, payload);
    },

    getStats: async () => {
        return api.get('/api/inventory/items/stats/');
    },

    // --- EXCEL UPLOAD/DOWNLOAD ---

    downloadTemplate: async () => {
        return api.get('/api/inventory/items/download_template/', { responseType: 'blob' });
    },

    uploadExcel: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/api/inventory/items/upload/', formData);
    },

    // --- GOODS RECEIVED NOTES ---

    getGRNs: async (params = {}) => {
        const data = await api.get('/api/inventory/grns/', { params });
        return Array.isArray(data) ? data : (data.results || []);
    },

    getGRN: async (id) => {
        return api.get(`/api/inventory/grns/${id}/`);
    },

    createGRN: async (data) => {
        return api.post('/api/inventory/grns/', data);
    },

    confirmGRN: async (id) => {
        return api.post(`/api/inventory/grns/${id}/confirm/`);
    },

    postGRNToGL: async (id) => {
        return api.post(`/api/inventory/grns/${id}/post_to_gl/`);
    },

    // --- SUPPLY ISSUES ---

    getIssues: async (params = {}) => {
        const data = await api.get('/api/inventory/issues/', { params });
        const rawIssues = Array.isArray(data) ? data : (data.results || []);
        const issues = rawIssues.map(issue => ({
            ...issue,
            id: issue.issue_number || issue.id,
            date: issue.issue_date || issue.created_at?.split('T')[0],
            requestedBy: issue.requested_by || '',
            approvedBy: issue.approved_by_name || '',
            totalItems: issue.item_count || issue.items?.length || 0,
            totalValue: parseFloat(issue.total_value || 0),
        }));

        const stats = {
            total: issues.length,
            totalIssues: issues.length,
            pending: issues.filter(i => i.status === 'PENDING').length,
            approved: issues.filter(i => i.status === 'APPROVED').length,
            issued: issues.filter(i => i.status === 'ISSUED').length,
            totalValueIssued: issues.filter(i => i.status === 'ISSUED').reduce((sum, i) => sum + parseFloat(i.total_value || 0), 0),
        };

        return { data: issues, stats };
    },

    getIssue: async (id) => {
        return api.get(`/api/inventory/issues/${id}/`);
    },

    createIssue: async (data) => {
        // Map from frontend form shape to API shape
        const payload = {
            department: data.department,
            requested_by: data.requestedBy,
            issue_date: data.date,
            notes: data.remarks || '',
            items: (data.items || []).map(item => ({
                item: item.itemId,
                quantity_requested: item.quantity,
                quantity_issued: 0,
                unit_cost: item.cost,
            })),
        };
        return api.post('/api/inventory/issues/', payload);
    },

    approveIssue: async (id) => {
        return api.post(`/api/inventory/issues/${id}/approve/`);
    },

    processIssue: async (id, postToGL = false) => {
        return api.post(`/api/inventory/issues/${id}/issue/`, { post_to_gl: postToGL });
    },

    updateIssueStatus: async (id, status) => {
        // Convenience wrapper mapping old status names to actions
        if (status === 'Approved') return inventoryService.approveIssue(id);
        if (status === 'Issued') return inventoryService.processIssue(id);
        return api.patch(`/api/inventory/issues/${id}/`, { status });
    },

    // --- STOCK TAKES ---

    getStockTakes: async (params = {}) => {
        const data = await api.get('/api/inventory/stock-takes/', { params });
        return Array.isArray(data) ? data : (data.results || []);
    },

    getStockTake: async (id) => {
        return api.get(`/api/inventory/stock-takes/${id}/`);
    },

    createStockTake: async (data) => {
        return api.post('/api/inventory/stock-takes/', data);
    },

    reconcileStockTake: async (id, postToGL = false) => {
        return api.post(`/api/inventory/stock-takes/${id}/reconcile/`, { post_to_gl: postToGL });
    },
};
