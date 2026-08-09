import { api } from '../../../services/api';

const BASE = '/api/fees';

export const templateService = {
    // ── Vote Heads ───────────────────────────────────────────
    getVoteHeads: (params = {}) => api.get(`${BASE}/vote-heads/`, { params }),
    createVoteHead: (data) => api.post(`${BASE}/vote-heads/`, data),
    updateVoteHead: (id, data) => api.patch(`${BASE}/vote-heads/${id}/`, data),
    deleteVoteHead: (id) => api.delete(`${BASE}/vote-heads/${id}/`),
    autoCreateVoteHeads: () => api.post(`${BASE}/vote-heads/auto_create_from_accounts/`, {}),

    // ── Grade Bands ──────────────────────────────────────────
    getGradeBands: (params = {}) => api.get(`${BASE}/grade-bands/`, { params }),
    createGradeBand: (data) => api.post(`${BASE}/grade-bands/`, data),
    updateGradeBand: (id, data) => api.patch(`${BASE}/grade-bands/${id}/`, data),
    deleteGradeBand: (id) => api.delete(`${BASE}/grade-bands/${id}/`),

    // ── Fee Templates ────────────────────────────────────────
    getTemplates: (params = {}) => api.get(`${BASE}/fee-templates/`, { params }),
    getTemplate: (id) => api.get(`${BASE}/fee-templates/${id}/`),
    createTemplate: (data) => api.post(`${BASE}/fee-templates/`, data),
    updateTemplate: (id, data) => api.patch(`${BASE}/fee-templates/${id}/`, data),
    deleteTemplate: (id) => api.delete(`${BASE}/fee-templates/${id}/`),

    activateTemplate: (id) => api.post(`${BASE}/fee-templates/${id}/activate/`),
    deactivateTemplate: (id) => api.post(`${BASE}/fee-templates/${id}/deactivate/`),
    cloneTemplate: (id, data) => api.post(`${BASE}/fee-templates/${id}/clone/`, data),
    bulkClone: (data) => api.post(`${BASE}/fee-templates/bulk-clone/`, data),
    readinessCheck: (params) => api.get(`${BASE}/fee-templates/readiness-check/`, { params }),

    // ── Template Line Items ──────────────────────────────────
    getLineItems: (params = {}) => api.get(`${BASE}/template-line-items/`, { params }),
    createLineItem: (data) => api.post(`${BASE}/template-line-items/`, data),
    updateLineItem: (id, data) => api.patch(`${BASE}/template-line-items/${id}/`, data),
    deleteLineItem: (id) => api.delete(`${BASE}/template-line-items/${id}/`),

    // ── Student Fee Profiles ─────────────────────────────────
    getProfiles: (params = {}) => api.get(`${BASE}/student-fee-profiles/`, { params }),
    createProfile: (data) => api.post(`${BASE}/student-fee-profiles/`, data),
    updateProfile: (id, data) => api.patch(`${BASE}/student-fee-profiles/${id}/`, data),

    // ── Year Rollover ────────────────────────────────────────
    rollover: (data) => api.post(`${BASE}/rollover/`, data),

    // ── Apply Template → Fee Structures ─────────────────────
    // Generates/updates fee-structure records for the given classes from a template
    applyToStructures: (templateId, data) =>
        api.post(`${BASE}/fee-templates/${templateId}/apply-to-structures/`, data),

};
