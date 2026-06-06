import { api } from '../services/api';

export const studentManagementService = {
    // === Applications ===
    getApplications: async (params = {}) => {
        const response = await api.get('/api/student-management/applications/', { params });
        return response;
    },
    createApplication: async (data) => {
        const response = await api.post('/api/student-management/applications/', data);
        return response;
    },
    getApplication: async (id) => {
        const response = await api.get(`/api/student-management/applications/${id}/`);
        return response;
    },
    updateApplication: async (id, data) => {
        const response = await api.patch(`/api/student-management/applications/${id}/`, data);
        return response;
    },
    getDashboardStats: async (params = {}) => {
        const response = await api.get('/api/student-management/applications/dashboard_stats/', { params });
        return response;
    },
    getRecentActivity: async () => {
        const response = await api.get('/api/student-management/applications/recent_activity/');
        return response;
    },
    getIntakeDeadlines: async () => {
        const response = await api.get('/api/student-management/applications/intake_deadlines/');
        return response;
    },

    // === Workflow Status ===
    getWorkflowStatus: async (applicationId) => {
        const response = await api.get(`/api/student-management/applications/${applicationId}/workflow_status/`);
        return response;
    },
    recordFeePayment: async (applicationId, data) => {
        const response = await api.post(`/api/student-management/applications/${applicationId}/record_fee_payment/`, data);
        return response;
    },
    waiveFee: async (applicationId, data) => {
        const response = await api.post(`/api/student-management/applications/${applicationId}/waive_fee/`, data);
        return response;
    },
    scheduleInterview: async (applicationId, data) => {
        const response = await api.post(`/api/student-management/applications/${applicationId}/schedule_interview/`, data);
        return response;
    },
    recordInterviewOutcome: async (applicationId, data) => {
        const response = await api.post(`/api/student-management/applications/${applicationId}/record_interview_outcome/`, data);
        return response;
    },
    scheduleReporting: async (applicationId, data) => {
        const response = await api.post(`/api/student-management/applications/${applicationId}/schedule_reporting/`, data);
        return response;
    },
    recordReporting: async (applicationId, data) => {
        const response = await api.post(`/api/student-management/applications/${applicationId}/record_reporting/`, data);
        return response;
    },

    // === Admission Actions ===
    admitApplicant: async (applicationId, admissionData) => {
        const response = await api.post(`/api/student-management/applications/${applicationId}/admit/`, admissionData);
        return response;
    },
    getAdmissions: async (params = {}) => {
        const response = await api.get('/api/student-management/admissions/', { params });
        return response;
    },
    getAdmission: async (id) => {
        const response = await api.get(`/api/student-management/admissions/${id}/`);
        return response;
    },
    updateAdmission: async (id, data) => {
        const response = await api.patch(`/api/student-management/admissions/${id}/`, data);
        return response;
    },

    // === Enquiries ===
    getEnquiries: async (params = {}) => {
        const response = await api.get('/api/student-management/enquiries/', { params });
        return response;
    },
    createEnquiry: async (data) => {
        const response = await api.post('/api/student-management/enquiries/', data);
        return response;
    },
    updateEnquiry: async (id, data) => {
        const response = await api.patch(`/api/student-management/enquiries/${id}/`, data);
        return response;
    },
    convertEnquiry: async (id, data = {}) => {
        const response = await api.post(`/api/student-management/enquiries/${id}/convert/`, data);
        return response;
    },

    // === Settings & Dropdowns (from student_settings) ===
    getIntakes: async () => {
        const response = await api.get('/api/settings/intakes/');
        return response;
    },
    getCurriculums: async () => {
        const response = await api.get('/api/settings/curricula/');
        return response;
    },
    getGrades: async () => {
        const response = await api.get('/api/settings/classes/');
        return response;
    },
    getStreams: async (gradeId) => {
        const url = gradeId ? `/api/settings/streams/?grade=${gradeId}` : '/api/settings/streams/';
        const response = await api.get(url);
        return response;
    },
    getAcademicYears: async () => {
        const response = await api.get('/api/settings/academic-years/');
        return response;
    },
    getTerms: async () => {
        const response = await api.get('/api/settings/terms/');
        return response;
    },
    getEnrollments: async (params = {}) => {
        const response = await api.get('/api/settings/enrollments/', { params });
        return response;
    },
    getStudentEnrollments: async (studentId) => {
        const response = await api.get(`/api/settings/enrollments/?student=${studentId}`);
        return response;
    },

    // === Admission Config ===
    getAdmissionConfig: async () => {
        const response = await api.get('/api/settings/admission-config/');
        return response;
    },
    updateAdmissionConfig: async (data) => {
        const response = await api.patch('/api/settings/admission-config/1/', data);
        return response;
    },

    // === Admission Workflow Config ===
    getWorkflowConfig: async () => {
        const response = await api.get('/api/settings/admission-workflow/');
        return response;
    },
    updateWorkflowConfig: async (data) => {
        const response = await api.patch('/api/settings/admission-workflow/1/', data);
        return response;
    },
    getActiveStages: async () => {
        const response = await api.get('/api/settings/admission-workflow/stages/');
        return response;
    },

    // === Programmes (Tertiary) ===
    getProgrammes: async (params = {}) => {
        const response = await api.get('/api/programmes/programmes/', { params });
        return response;
    },
    getProgramme: async (id) => {
        const response = await api.get(`/api/programmes/programmes/${id}/`);
        return response;
    },
    createProgramme: async (data) => {
        const response = await api.post('/api/programmes/programmes/', data);
        return response;
    },
    updateProgramme: async (id, data) => {
        const response = await api.patch(`/api/programmes/programmes/${id}/`, data);
        return response;
    },
    getFaculties: async () => {
        const response = await api.get('/api/programmes/faculties/');
        return response;
    },
    getDepartments: async (params = {}) => {
        const response = await api.get('/api/programmes/departments/', { params });
        return response;
    },
    getProgrammeUnits: async (programmeId) => {
        const response = await api.get(`/api/programmes/units/?programme=${programmeId}`);
        return response;
    },
    getProgrammeEnrollments: async (params = {}) => {
        const response = await api.get('/api/programmes/enrollments/', { params });
        return response;
    },
};
