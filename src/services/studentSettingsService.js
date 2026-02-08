import { api } from './api';

const studentSettingsService = {
    // Academic Years
    getAcademicYears: () => api.get('/api/settings/academic-years/'),
    createAcademicYear: (data) => api.post('/api/settings/academic-years/', data),
    updateAcademicYear: (id, data) => api.patch(`/api/settings/academic-years/${id}/`, data),
    deleteAcademicYear: (id) => api.delete(`/api/settings/academic-years/${id}/`),

    // Intakes
    getIntakes: (params) => api.get('/api/settings/intakes/', { params }),
    createIntake: (data) => api.post('/api/settings/intakes/', data),
    updateIntake: (id, data) => api.put(`/api/settings/intakes/${id}/`, data),
    deleteIntake: (id) => api.delete(`/api/settings/intakes/${id}/`),

    // Terms
    getTerms: () => api.get('/api/settings/terms/'),
    createTerm: (data) => api.post('/api/settings/terms/', data),
    updateTerm: (id, data) => api.patch(`/api/settings/terms/${id}/`, data),
    deleteTerm: (id) => api.delete(`/api/settings/terms/${id}/`),

    // Curricula
    getCurricula: () => api.get('/api/settings/curricula/'),
    createCurriculum: (data) => api.post('/api/settings/curricula/', data),
    updateCurriculum: (id, data) => api.patch(`/api/settings/curricula/${id}/`, data),
    deleteCurriculum: (id) => api.delete(`/api/settings/curricula/${id}/`),

    // Curriculum Levels
    getCurriculumLevels: () => api.get('/api/settings/curriculum-levels/'),
    createCurriculumLevel: (data) => api.post('/api/settings/curriculum-levels/', data),
    updateCurriculumLevel: (id, data) => api.patch(`/api/settings/curriculum-levels/${id}/`, data),
    deleteCurriculumLevel: (id) => api.delete(`/api/settings/curriculum-levels/${id}/`),

    // Classes / Grade Structures
    getClasses: () => api.get('/api/settings/classes/'),
    createClass: (data) => api.post('/api/settings/classes/', data),
    updateClass: (id, data) => api.patch(`/api/settings/classes/${id}/`, data),
    deleteClass: (id) => api.delete(`/api/settings/classes/${id}/`),

    // Streams
    getStreams: () => api.get('/api/settings/streams/'),
    createStream: (data) => api.post('/api/settings/streams/', data),
    updateStream: (id, data) => api.patch(`/api/settings/streams/${id}/`, data),
    deleteStream: (id) => api.delete(`/api/settings/streams/${id}/`),

    // Admission Configuration
    getAdmissionConfig: () => api.get('/api/settings/admission-config/'),
    updateAdmissionConfig: (id, data) => api.patch(`/api/settings/admission-config/${id}/`, data),

    // Student Statuses
    getStudentStatuses: () => api.get('/api/settings/student-statuses/'),
    createStudentStatus: (data) => api.post('/api/settings/student-statuses/', data),
    updateStudentStatus: (id, data) => api.patch(`/api/settings/student-statuses/${id}/`, data),
    deleteStudentStatus: (id) => api.delete(`/api/settings/student-statuses/${id}/`),

    // Promotion Rules
    getPromotionRules: () => api.get('/api/settings/promotion-rules/'),
    updatePromotionRule: (id, data) => api.patch(`/api/settings/promotion-rules/${id}/`, data),

    // Demographic Configuration
    getDemographicConfig: () => api.get('/api/settings/demographic-config/'),
    createDemographicConfig: (data) => api.post('/api/settings/demographic-config/', data),
    updateDemographicConfig: (id, data) => api.patch(`/api/settings/demographic-config/${id}/`, data),
    deleteDemographicConfig: (id) => api.delete(`/api/settings/demographic-config/${id}/`),

    // School Calendar
    getCalendar: () => api.get('/api/settings/calendar/'),
    createCalendarEvent: (data) => api.post('/api/settings/calendar/', data),
    updateCalendarEvent: (id, data) => api.patch(`/api/settings/calendar/${id}/`, data),
    deleteCalendarEvent: (id) => api.delete(`/api/settings/calendar/${id}/`),

    // Class Sessions (Academics)
    getClassSessions: (params) => api.get('/api/academics/sessions/', { params }),
    generateSessions: (data) => api.post('/api/academics/sessions/auto_generate/', data),
    getSessionEnrollments: (params) => api.get('/api/academics/enrollments/', { params }),

    // Enrollments
    getEnrollments: (params) => api.get('/api/settings/enrollments/', { params }),
    getEnrollment: (id) => api.get(`/api/settings/enrollments/${id}/`),
    createEnrollment: (data) => api.post('/api/settings/enrollments/', data),
    updateEnrollment: (id, data) => api.patch(`/api/settings/enrollments/${id}/`, data),
    deleteEnrollment: (id) => api.delete(`/api/settings/enrollments/${id}/`),

    // Enrollment Actions
    promoteStudents: (data) => api.post('/api/settings/enrollments/promote/', data),
    repeatStudent: (data) => api.post('/api/settings/enrollments/repeat/', data),
    transferOut: (id, data) => api.post(`/api/settings/enrollments/${id}/transfer_out/`, data),
    changeCurriculum: (data) => api.post('/api/settings/enrollments/change_curriculum/', data),
    bulkEnroll: (data) => api.post('/api/settings/enrollments/bulk_enroll/', data),
    closeEnrollment: (id, data) => api.post(`/api/settings/enrollments/${id}/close/`, data),
    getStudentTimeline: (studentId) => api.get('/api/settings/enrollments/timeline/', { params: { student_id: studentId } }),
};

export default studentSettingsService;
