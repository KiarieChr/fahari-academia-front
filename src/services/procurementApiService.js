import { api } from './api';

const BASE = '/api/procurement';

// =============================================================================
// PURCHASE REQUISITIONS
// =============================================================================

const requisitions = {
    list: (params) => api.get(`${BASE}/requisitions/`, { params }),
    get: (id) => api.get(`${BASE}/requisitions/${id}/`),
    create: (data) => api.post(`${BASE}/requisitions/`, data),
    update: (id, data) => api.put(`${BASE}/requisitions/${id}/`, data),
    patch: (id, data) => api.patch(`${BASE}/requisitions/${id}/`, data),
    delete: (id) => api.delete(`${BASE}/requisitions/${id}/`),

    // Actions
    submit: (id) => api.post(`${BASE}/requisitions/${id}/submit/`),
    approve: (id) => api.post(`${BASE}/requisitions/${id}/approve/`),
    reject: (id, reason) => api.post(`${BASE}/requisitions/${id}/reject/`, { reason }),
    convertToPO: (id, supplierId) => api.post(`${BASE}/requisitions/${id}/convert_to_po/`, { supplier_id: supplierId }),
    stats: () => api.get(`${BASE}/requisitions/stats/`),

    // Lines
    getLines: (requisitionId) => api.get(`${BASE}/requisitions/${requisitionId}/lines/`),
    addLine: (requisitionId, data) => api.post(`${BASE}/requisitions/${requisitionId}/lines/`, data),
    updateLine: (requisitionId, lineId, data) => api.put(`${BASE}/requisitions/${requisitionId}/lines/${lineId}/`, data),
    deleteLine: (requisitionId, lineId) => api.delete(`${BASE}/requisitions/${requisitionId}/lines/${lineId}/`),
};

// =============================================================================
// RFQs
// =============================================================================

const rfqs = {
    list: (params) => api.get(`${BASE}/rfqs/`, { params }),
    get: (id) => api.get(`${BASE}/rfqs/${id}/`),
    create: (data) => api.post(`${BASE}/rfqs/`, data),
    update: (id, data) => api.put(`${BASE}/rfqs/${id}/`, data),
    delete: (id) => api.delete(`${BASE}/rfqs/${id}/`),

    // Actions
    sendToSuppliers: (id) => api.post(`${BASE}/rfqs/${id}/send_to_suppliers/`),
    close: (id) => api.post(`${BASE}/rfqs/${id}/close/`),
    addSupplier: (id, supplierId) => api.post(`${BASE}/rfqs/${id}/add_supplier/`, { supplier_id: supplierId }),
    getQuotations: (id) => api.get(`${BASE}/rfqs/${id}/quotations/`),
    award: (id, quotationId, createPO = true) => api.post(`${BASE}/rfqs/${id}/award/`, {
        quotation_id: quotationId,
        create_po: createPO,
    }),
};

// =============================================================================
// SUPPLIER QUOTATIONS (internal read-only + review)
// =============================================================================

const quotations = {
    list: (params) => api.get(`${BASE}/quotations/`, { params }),
    get: (id) => api.get(`${BASE}/quotations/${id}/`),
    review: (id, status) => api.post(`${BASE}/quotations/${id}/review/`, { status }),
};

// =============================================================================
// PUBLIC QUOTATION (no auth — for supplier portal link)
// =============================================================================

const publicQuote = {
    getRFQ: (token) => api.get(`${BASE}/quote/${token}/`),
    submit: (token, data) => {
        // Handle file upload via FormData
        if (data.document) {
            const formData = new FormData();
            formData.append('document', data.document);
            formData.append('quotation_reference', data.quotation_reference || '');
            formData.append('delivery_period', data.delivery_period || '');
            formData.append('payment_terms', data.payment_terms || '');
            formData.append('validity_days', data.validity_days || 30);
            formData.append('notes', data.notes || '');
            formData.append('lines', JSON.stringify(data.lines));
            return api.post(`${BASE}/quote/${token}/submit/`, formData);
        }
        return api.post(`${BASE}/quote/${token}/submit/`, data);
    },
};

// =============================================================================
// PURCHASE ORDERS
// =============================================================================

const purchaseOrders = {
    list: (params) => api.get(`${BASE}/purchase-orders/`, { params }),
    get: (id) => api.get(`${BASE}/purchase-orders/${id}/`),
    create: (data) => api.post(`${BASE}/purchase-orders/`, data),
    update: (id, data) => api.put(`${BASE}/purchase-orders/${id}/`, data),
    patch: (id, data) => api.patch(`${BASE}/purchase-orders/${id}/`, data),
    delete: (id) => api.delete(`${BASE}/purchase-orders/${id}/`),

    // Actions
    submitForApproval: (id) => api.post(`${BASE}/purchase-orders/${id}/submit_for_approval/`),
    approve: (id) => api.post(`${BASE}/purchase-orders/${id}/approve/`),
    send: (id) => api.post(`${BASE}/purchase-orders/${id}/send/`),
    cancel: (id) => api.post(`${BASE}/purchase-orders/${id}/cancel/`),
    close: (id) => api.post(`${BASE}/purchase-orders/${id}/close/`),
    stats: () => api.get(`${BASE}/purchase-orders/stats/`),

    // Lines
    getLines: (poId) => api.get(`${BASE}/purchase-orders/${poId}/lines/`),
    addLine: (poId, data) => api.post(`${BASE}/purchase-orders/${poId}/lines/`, data),
    updateLine: (poId, lineId, data) => api.put(`${BASE}/purchase-orders/${poId}/lines/${lineId}/`, data),
    deleteLine: (poId, lineId) => api.delete(`${BASE}/purchase-orders/${poId}/lines/${lineId}/`),
};

// =============================================================================
// SUPPLIER CONTRACTS
// =============================================================================

const contracts = {
    list: (params) => api.get(`${BASE}/contracts/`, { params }),
    get: (id) => api.get(`${BASE}/contracts/${id}/`),
    create: (data) => api.post(`${BASE}/contracts/`, data),
    update: (id, data) => api.put(`${BASE}/contracts/${id}/`, data),
    delete: (id) => api.delete(`${BASE}/contracts/${id}/`),

    // Actions
    activate: (id) => api.post(`${BASE}/contracts/${id}/activate/`),
    terminate: (id) => api.post(`${BASE}/contracts/${id}/terminate/`),
    renew: (id, newEndDate) => api.post(`${BASE}/contracts/${id}/renew/`, { new_end_date: newEndDate }),
    expiringSoon: () => api.get(`${BASE}/contracts/expiring_soon/`),
    stats: () => api.get(`${BASE}/contracts/stats/`),

    // Milestones
    getMilestones: (contractId) => api.get(`${BASE}/contracts/${contractId}/milestones/`),
    addMilestone: (contractId, data) => api.post(`${BASE}/contracts/${contractId}/milestones/`, data),
    updateMilestone: (contractId, milestoneId, data) =>
        api.put(`${BASE}/contracts/${contractId}/milestones/${milestoneId}/`, data),
    deleteMilestone: (contractId, milestoneId) =>
        api.delete(`${BASE}/contracts/${contractId}/milestones/${milestoneId}/`),
    completeMilestone: (contractId, milestoneId) =>
        api.post(`${BASE}/contracts/${contractId}/milestones/${milestoneId}/complete/`),
};

export const procurementApi = {
    requisitions,
    rfqs,
    quotations,
    publicQuote,
    purchaseOrders,
    contracts,
};

export default procurementApi;
