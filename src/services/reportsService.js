import { api } from './api';

const BASE = '/api/academics/reports';

export const reportsService = {
    getOverview: (params = {}) => api.get(`${BASE}/overview/`, { params }),
    getStudentList: (params = {}) => api.get(`${BASE}/student-list/`, { params }),
    getClassList: (params = {}) => api.get(`${BASE}/class-list/`, { params }),
    getFeeCollections: (params = {}) => api.get(`${BASE}/fee-collections/`, { params }),
    getAttendance: (params = {}) => api.get(`${BASE}/attendance/`, { params }),
    getClassStatistics: (params = {}) => api.get(`${BASE}/class-statistics/`, { params }),
    getSessionStatistics: (params = {}) => api.get(`${BASE}/session-statistics/`, { params }),
    getApplicantStatistics: (params = {}) => api.get(`${BASE}/applicant-statistics/`, { params }),
    getEnrollmentStatistics: (params = {}) => api.get(`${BASE}/enrollment-statistics/`, { params }),
    getStudentStatement: (params = {}) => api.get(`${BASE}/student-statement/`, { params }),
    getAcademic: (params = {}) => api.get(`${BASE}/academic/`, { params }),
    getTransfers: (params = {}) => api.get(`${BASE}/transfers/`, { params }),
    getDemographics: (params = {}) => api.get(`${BASE}/demographics/`, { params }),
};
