import { api } from '../../services/api';

const BASE = '/api/portal';

export const portalService = {
    // ── Student endpoints ────────────────────────────────
    getProfile: () => api.get(`${BASE}/me/`),
    updateProfile: (data) => api.patch(`${BASE}/me/`, data),
    getDashboardStats: () => api.get(`${BASE}/dashboard/`),
    getFees: (params = {}) => api.get(`${BASE}/fees/`, { params }),
    getPayments: (params = {}) => api.get(`${BASE}/payments/`, { params }),
    getResults: (params = {}) => api.get(`${BASE}/results/`, { params }),
    getExamResults: (params = {}) => api.get(`${BASE}/exam-results/`, { params }),
    getTimetable: (params = {}) => api.get(`${BASE}/timetable/`, { params }),
    getAttendance: () => api.get(`${BASE}/attendance/`),
    getAnnouncements: () => api.get(`${BASE}/announcements/`),
    getStatement: (params = {}) => api.get(`${BASE}/statement/`, { params }),

    // ── Parent endpoints ─────────────────────────────────
    getParentProfile: () => api.get(`${BASE}/parent/me/`),
    getParentDashboard: () => api.get(`${BASE}/parent/dashboard/`),
    getChildren: () => api.get(`${BASE}/parent/children/`),
    getChildFees: (studentId, params = {}) =>
        api.get(`${BASE}/parent/child/${studentId}/fees/`, { params }),
    getChildResults: (studentId) =>
        api.get(`${BASE}/parent/child/${studentId}/results/`),
    getChildAttendance: (studentId) =>
        api.get(`${BASE}/parent/child/${studentId}/attendance/`),
    getChildStatement: (studentId, params = {}) =>
        api.get(`${BASE}/parent/child/${studentId}/statement/`, { params }),
};
