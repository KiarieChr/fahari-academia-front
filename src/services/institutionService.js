import { api } from './api';

export const institutionService = {
    // ─── Institution Profile (singleton) ─────────────────────────
    getProfile: () =>
        api.get('/api/institution/'),

    updateProfile: (data) =>
        api.patch('/api/institution/update/', data),

    uploadLogo: (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        return api.patch('/api/institution/update/', formData);
    },

    // ─── Campus CRUD ─────────────────────────────────────────────
    getCampuses: (params = {}) =>
        api.get('/workforce/api/campuses/', { params }),

    getCampus: (id) =>
        api.get(`/workforce/api/campuses/${id}/`),

    createCampus: (data) =>
        api.post('/workforce/api/campuses/', data),

    updateCampus: (id, data) =>
        api.put(`/workforce/api/campuses/${id}/`, data),

    deleteCampus: (id) =>
        api.delete(`/workforce/api/campuses/${id}/`),

    // ─── Audit Logs (read-only) ──────────────────────────────────
    getAuditLogs: (params = {}) =>
        api.get('/api/audit-logs/', { params }),

    getAuditLog: (id) =>
        api.get(`/api/audit-logs/${id}/`),

    // ─── System Configuration ────────────────────────────────────
    getSystemConfigs: (params = {}) =>
        api.get('/api/system-config/', { params }),

    updateSystemConfig: (id, data) =>
        api.patch(`/api/system-config/${id}/`, data),

    bulkUpdateConfigs: (configs) =>
        api.post('/api/system-config/bulk-update/', { configs }),
};

export default institutionService;
