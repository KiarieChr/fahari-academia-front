import { api } from './api';

/**
 * Curriculum Dashboard Service
 * Handles all curriculum-related API calls
 */
export const curriculumService = {
    // ─── Dashboard Stats ─────────────────────────────────────────
    /**
     * Get dashboard statistics for curriculum overview
     * Returns metrics, charts data for subjects distribution, class coverage, etc.
     */
    getDashboardStats: () =>
        api.get('/api/settings/curricula/dashboard_stats/'),

    // ─── Curricula CRUD ──────────────────────────────────────────
    getCurricula: (params = {}) =>
        api.get('/api/settings/curricula/', { params }),

    getCurriculum: (id) =>
        api.get(`/api/settings/curricula/${id}/`),

    createCurriculum: (data) =>
        api.post('/api/settings/curricula/', data),

    updateCurriculum: (id, data) =>
        api.put(`/api/settings/curricula/${id}/`, data),

    deleteCurriculum: (id) =>
        api.delete(`/api/settings/curricula/${id}/`),

    // ─── Curriculum Levels ───────────────────────────────────────
    getCurriculumLevels: (params = {}) =>
        api.get('/api/settings/curriculum-levels/', { params }),

    getCurriculumLevel: (id) =>
        api.get(`/api/settings/curriculum-levels/${id}/`),

    createCurriculumLevel: (data) =>
        api.post('/api/settings/curriculum-levels/', data),

    updateCurriculumLevel: (id, data) =>
        api.put(`/api/settings/curriculum-levels/${id}/`, data),

    deleteCurriculumLevel: (id) =>
        api.delete(`/api/settings/curriculum-levels/${id}/`),

    // ─── Learning Areas ──────────────────────────────────────────
    getLearningAreas: (params = {}) =>
        api.get('/api/settings/learning-areas/', { params }),

    getLearningArea: (id) =>
        api.get(`/api/settings/learning-areas/${id}/`),

    createLearningArea: (data) =>
        api.post('/api/settings/learning-areas/', data),

    updateLearningArea: (id, data) =>
        api.put(`/api/settings/learning-areas/${id}/`, data),

    deleteLearningArea: (id) =>
        api.delete(`/api/settings/learning-areas/${id}/`),

    // ─── Subjects ────────────────────────────────────────────────
    getSubjects: (params = {}) =>
        api.get('/api/timetable/subjects/', { params }),

    getSubject: (id) =>
        api.get(`/api/timetable/subjects/${id}/`),

    createSubject: (data) =>
        api.post('/api/timetable/subjects/', data),

    updateSubject: (id, data) =>
        api.put(`/api/timetable/subjects/${id}/`, data),

    deleteSubject: (id) =>
        api.delete(`/api/timetable/subjects/${id}/`),

    // ─── Classes (Grade Structure) ───────────────────────────────
    getClasses: (params = {}) =>
        api.get('/api/settings/classes/', { params }),

    getClass: (id) =>
        api.get(`/api/settings/classes/${id}/`),

    createClass: (data) =>
        api.post('/api/settings/classes/', data),

    updateClass: (id, data) =>
        api.put(`/api/settings/classes/${id}/`, data),

    deleteClass: (id) =>
        api.delete(`/api/settings/classes/${id}/`),
};

export default curriculumService;
