import { api } from '../../../../services/api';

export const recruitmentService = {
    /**
     * Fetches the comprehensive dashboard data including metrics, 
     * recent applications, upcoming interviews, and pipeline stats.
     */
    getDashboardStats: async () => {
        return await api.get('/api/recruitment/dashboard/');
    },

    /**
     * Fetches the job openings (can be filtered)
     */
    getJobOpenings: async (params = {}) => {
        return await api.get('/api/recruitment/job-openings/', { params });
    },

    /**
     * Fetches the applications list
     */
    getApplications: async (params = {}) => {
        return await api.get('/api/recruitment/applications/', { params });
    },

    /**
     * Fetches specific application details
     */
    getApplicationDetails: async (id) => {
        return await api.get(`/api/recruitment/applications/${id}/`);
    },

    /**
     * Fetches full workflow data for an application
     */
    getWorkflow: async (applicationId) => {
        return await api.get(`/api/recruitment/applications/${applicationId}/workflow/`);
    },

    /**
     * Fetches interview schedule
     */
    getInterviews: async (params = {}) => {
        return await api.get('/api/recruitment/interviews/', { params });
    },

    /**
     * Job Opening Operations
     */
    createJobOpening: async (data) => {
        return await api.post('/api/recruitment/job-openings/', data);
    },

    updateJobOpening: async (id, data) => {
        return await api.patch(`/api/recruitment/job-openings/${id}/`, data);
    },

    /**
     * Application Operations
     */
    updateApplicationStatus: async (id, status, notes = '') => {
        return await api.post(`/api/recruitment/applications/${id}/change_status/`, { status, notes });
    },

    createApplication: async (data) => {
        // data should be FormData since it contains files
        return await api.post('/api/recruitment/applications/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    /**
     * Interview Operations
     */
    scheduleInterview: async (data) => {
        return await api.post('/api/recruitment/interviews/', data);
    },

    updateInterviewStatus: async (id, status, notes = '') => {
        return await api.post(`/api/recruitment/interviews/${id}/update_status/`, { status, notes });
    },

    updateInterview: async (id, data) => {
        return await api.put(`/api/recruitment/interviews/${id}/`, data);
    },

    deleteInterview: async (id) => {
        await api.delete(`/api/recruitment/interviews/${id}/`);
    },

    sendInterviewInvitation: async (id) => {
        return await api.post(`/api/recruitment/interviews/${id}/send_invitation/`);
    },

    createInterviewEvaluation: async (data) => {
        return await api.post('/api/recruitment/interview-evaluations/', data);
    },

    /**
     * Workflow Stage Operations
     */

    // Stage 5: Compliance
    getCompliance: async (applicationId) => {
        const data = await api.get('/api/recruitment/compliance-checklists/', { params: { application: applicationId } });
        return data[0] || null;
    },
    updateCompliance: async (id, data) => { // id can be null if creating
        if (id) {
            return await api.patch(`/api/recruitment/compliance-checklists/${id}/`, data);
        } else {
            return await api.post('/api/recruitment/compliance-checklists/', data);
        }
    },

    // Stage 6: Selection
    getSelection: async (applicationId) => {
        const data = await api.get('/api/recruitment/selection-decisions/', { params: { application: applicationId } });
        return data[0] || null;
    },
    updateSelection: async (id, data) => {
        if (id) {
            return await api.patch(`/api/recruitment/selection-decisions/${id}/`, data);
        } else {
            return await api.post('/api/recruitment/selection-decisions/', data);
        }
    },
    approveSelection: async (id, role) => {
        return await api.post(`/api/recruitment/selection-decisions/${id}/approve/`, { role });
    },

    // Stage 7: Offer
    getOffer: async (applicationId) => {
        const data = await api.get('/api/recruitment/offer-letters/', { params: { application: applicationId } });
        return data[0] || null;
    },
    createOffer: async (data) => {
        return await api.post('/api/recruitment/offer-letters/', data);
    },
    updateOffer: async (id, data) => {
        return await api.patch(`/api/recruitment/offer-letters/${id}/`, data);
    },
    sendOffer: async (id) => {
        return await api.post(`/api/recruitment/offer-letters/${id}/send_offer/`);
    },

    // Stage 8: Onboarding
    getOnboarding: async (applicationId) => {
        const data = await api.get('/api/recruitment/onboarding-processes/', { params: { application: applicationId } });
        return data[0] || null;
    },
    updateOnboarding: async (id, data) => {
        if (id) {
            return await api.patch(`/api/recruitment/onboarding-processes/${id}/`, data);
        } else {
            return await api.post('/api/recruitment/onboarding-processes/', data);
        }
    },

    // Stage 9: Probation
    getProbation: async (employeeId) => {
        // probation is linked to employee, but we might search via employee ID if known
    },
    updateProbation: async (id, data) => {
        const response = await api.patch(`/api/recruitment/probation-reviews/${id}/`, data);
        return response.data;
    }
};
