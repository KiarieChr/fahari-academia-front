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

    getDashboardStats: async () => {
        const response = await api.get('/api/student-management/applications/dashboard_stats/');
        return response;
    },

    // === Admission Actions ===
    admitApplicant: async (applicationId, admissionData) => {
        // admissionData should contain class_id, stream_id, admission_number (optional)
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

    // === Settings & Dropdowns (from student_settings) ===
    getIntakes: async () => {
        const response = await api.get('/api/settings/intakes/');
        return response;
    },

    getCurriculums: async () => {
        const response = await api.get('/api/settings/curricula/');
        return response;
    },

    getCurriculumLevels: async () => {
        const response = await api.get('/api/settings/curriculum-levels/');
        return response;
    },

    getClasses: async () => {
        // Fetch all grades/classes
        const response = await api.get('/api/settings/classes/');
        return response;
    },

    getStreams: async () => {
        const response = await api.get('/api/settings/streams/');
        return response;
    },

    // === Bulk Import ===
    downloadImportTemplate: async () => {
        const response = await api.get('/api/student-management/import/template/', {
            responseType: 'blob', // Important for file download
        });
        return response;
    },

    importStudents: async (file, dryRun = false) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`/api/student-management/import/upload/?dry_run=${dryRun}`, formData);
        return response;
    },

    processImportChunk: async (importId, offset, chunkSize = 50) => {
        const response = await api.post('/api/student-management/import/process-chunk/', {
            import_id: importId,
            offset,
            chunk_size: chunkSize,
        });
        return response;
    },

    // === Guardian Email Check ===
    checkGuardianEmail: async (email) => {
        const response = await api.get('/api/check-guardian-email/', { params: { email } });
        return response;
    },
};
