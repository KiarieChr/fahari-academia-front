import { api } from './api';

export const examService = {
    // ── Grading Scales ──────────────────────────────────────────
    getGradingScales: (params = {}) =>
        api.get('/api/examinations/grading-scales/', { params }),

    getGradingScale: (id) =>
        api.get(`/api/examinations/grading-scales/${id}/`),

    createGradingScale: (data) =>
        api.post('/api/examinations/grading-scales/', data),

    updateGradingScale: (id, data) =>
        api.put(`/api/examinations/grading-scales/${id}/`, data),

    deleteGradingScale: (id) =>
        api.delete(`/api/examinations/grading-scales/${id}/`),

    duplicateGradingScale: (id) =>
        api.post(`/api/examinations/grading-scales/${id}/duplicate/`),

    // ── Assessment Types ────────────────────────────────────────
    getAssessmentTypes: (params = {}) =>
        api.get('/api/examinations/assessment-types/', { params }),

    getAssessmentType: (id) =>
        api.get(`/api/examinations/assessment-types/${id}/`),

    createAssessmentType: (data) =>
        api.post('/api/examinations/assessment-types/', data),

    updateAssessmentType: (id, data) =>
        api.put(`/api/examinations/assessment-types/${id}/`, data),

    deleteAssessmentType: (id) =>
        api.delete(`/api/examinations/assessment-types/${id}/`),

    // ── Examinations ────────────────────────────────────────────
    getExaminations: (params = {}) =>
        api.get('/api/examinations/examinations/', { params }),

    getExamination: (id) =>
        api.get(`/api/examinations/examinations/${id}/`),

    createExamination: (data) =>
        api.post('/api/examinations/examinations/', data),

    updateExamination: (id, data) =>
        api.put(`/api/examinations/examinations/${id}/`, data),

    deleteExamination: (id) =>
        api.delete(`/api/examinations/examinations/${id}/`),

    // ── Marks ───────────────────────────────────────────────────
    getExamStudents: (examId) =>
        api.get(`/api/examinations/examinations/${examId}/students/`),

    submitBulkMarks: (examId, marks) =>
        api.post(`/api/examinations/examinations/${examId}/bulk_marks/`, { marks }),

    uploadMarksFile: (examId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/api/examinations/examinations/${examId}/upload_marks/`, formData);
    },

    getExamAnalysis: (examId) =>
        api.get(`/api/examinations/examinations/${examId}/analysis/`),

    publishExam: (examId) =>
        api.post(`/api/examinations/examinations/${examId}/publish/`),

    // ── Term Results ────────────────────────────────────────────
    getTermResults: (params = {}) =>
        api.get('/api/examinations/term-results/', { params }),

    getTermResult: (id) =>
        api.get(`/api/examinations/term-results/${id}/`),

    computeTermResults: (classSessionId, gradingScaleId) =>
        api.post('/api/examinations/examinations/compute_term_results/', {
            class_session: classSessionId,
            grading_scale: gradingScaleId,
        }),

    publishTermResults: (classSessionId) =>
        api.post('/api/examinations/term-results/publish/', {
            class_session: classSessionId,
        }),

    getClassAnalysis: (classSessionId) =>
        api.get('/api/examinations/term-results/class_analysis/', {
            params: { class_session: classSessionId },
        }),

    // ── Report Card Templates ───────────────────────────────────
    getReportTemplates: (params = {}) =>
        api.get('/api/examinations/report-templates/', { params }),

    getReportTemplate: (id) =>
        api.get(`/api/examinations/report-templates/${id}/`),

    createReportTemplate: (data) =>
        api.post('/api/examinations/report-templates/', data),

    updateReportTemplate: (id, data) =>
        api.put(`/api/examinations/report-templates/${id}/`, data),

    deleteReportTemplate: (id) =>
        api.delete(`/api/examinations/report-templates/${id}/`),
};
