import { api } from '../../services/apiClient';

export const portalService = {
    // --- Student Endpoints ---
    getProfile: () => api.get('/portal/me/'),
    getDashboardStats: () => api.get('/portal/dashboard/'),
    getFees: () => api.get('/portal/fees/'),
    getPayments: () => api.get('/portal/payments/'),
    getResults: () => api.get('/portal/results/'),
    getExamResults: () => api.get('/portal/exam-results/'),
    getTimetable: (params) => api.get('/portal/timetable/', { params }),
    getAttendance: () => api.get('/portal/attendance/'),
    getAnnouncements: () => api.get('/portal/announcements/'),
    getStatement: (params) => api.get('/portal/statement/', { params }),

    // --- Student Assignment Endpoints ---
    getAssignments: () => api.get('/portal/assignments/'),
    submitAssignment: (id, data) => api.post(`/portal/assignments/${id}/submit/`, data),

    // --- Parent Endpoints ---
    getParentProfile: () => api.get('/portal/parent/me/'),
    getParentDashboard: () => api.get('/portal/parent/dashboard/'),
    getChildren: () => api.get('/portal/parent/children/'),
    getChildFees: (studentId) => api.get(`/portal/parent/child/${studentId}/fees/`),
    getChildResults: (studentId) => api.get(`/portal/parent/child/${studentId}/results/`),
    getChildAttendance: (studentId) => api.get(`/portal/parent/child/${studentId}/attendance/`),
    getChildAssignments: (studentId) => api.get(`/portal/parent/child/${studentId}/assignments/`),
    getChildStatement: (studentId, params) => api.get(`/portal/parent/child/${studentId}/statement/`, { params }),
};
