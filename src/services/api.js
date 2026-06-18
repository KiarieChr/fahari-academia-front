// Use empty string to force relative URLs. Next.js rewrites will proxy /api to the backend.
const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'academia-token';

const handleResponse = async (response, options = {}) => {
    const contentType = response.headers.get("content-type");
    if (options.responseType === 'blob') {
        return response.blob();
    }
    if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (!response.ok) {
            // Backend error message
            // Create error object but attach the full data for component handling
            const error = new Error(data.detail || data.message || response.statusText || "Something went wrong");
            error.data = data;
            error.status = response.status;
            error.code = data.code;
            throw error;
        }
        return data;
    }
    // Handle non-JSON responses
    if (!response.ok) {
        const error = new Error(response.statusText || "Network response was not ok");
        error.status = response.status;
        throw error;
    }
    return response.text();
};

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { 'Authorization': `Token ${token}` } : {};
};

export const api = {
    // Generic HTTP methods
    get: async (url, options = {}) => {
        try {
            // Add cache-busting parameter
            const params = { ...(options.params || {}), _t: new Date().getTime() };
            const separator = url.includes('?') ? '&' : '?';
            const queryString = `${separator}${new URLSearchParams(params)}`;
            const response = await fetch(`${API_URL}${url}${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                },
                credentials: 'include',
                cache: 'no-store',
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    post: async (url, data, options = {}) => {
        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            // For FormData, remove Content-Type to let browser set it with boundary
            if (isFormData) {
                delete headers['Content-Type'];
            } else if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_URL}${url}`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: isFormData ? data : JSON.stringify(data),
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    put: async (url, data, options = {}) => {
        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            // For FormData, remove Content-Type to let browser set it with boundary
            if (isFormData) {
                delete headers['Content-Type'];
            } else if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_URL}${url}`, {
                method: 'PUT',
                headers,
                credentials: 'include',
                body: isFormData ? data : JSON.stringify(data),
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    patch: async (url, data, options = {}) => {
        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            // For FormData, remove Content-Type to let browser set it with boundary
            if (isFormData) {
                delete headers['Content-Type'];
            } else if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_URL}${url}`, {
                method: 'PATCH',
                headers,
                credentials: 'include',
                body: isFormData ? data : JSON.stringify(data),
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    delete: async (url, options = {}) => {
        try {
            const response = await fetch(`${API_URL}${url}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                },
                credentials: 'include',
            });
            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            // Assuming DRF/Django, endpoint likely requires username & password
            const response = await fetch(`${API_URL}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(credentials),
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    // Used for changing the password on first login
    firstTimeSetup: async (data) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/first-time-setup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/logout/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                credentials: 'include',
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                credentials: 'include',
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    // ─── Password Reset Flow ─────────────────────────────────────
    forgotPassword: async (email) => {
        const response = await fetch(`${API_URL}/api/auth/forgot-password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email }),
        });
        return handleResponse(response);
    },

    verifyOtp: async (email, code) => {
        const response = await fetch(`${API_URL}/api/auth/verify-otp/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, code }),
        });
        return handleResponse(response);
    },

    resetPassword: async (email, code, password, confirm_password) => {
        const response = await fetch(`${API_URL}/api/auth/reset-password/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, code, password, confirm_password }),
        });
        return handleResponse(response);
    },

    // ─── Academics (class sessions, grades, terms) ────────────────
    academics: {
        getActiveSessions: (params = {}) =>
            api.get('/api/academics/sessions/', { params: { is_active: true, ...params } }),
        getClassSession: (id) =>
            api.get(`/api/academics/sessions/${id}/`),
        getTerms: (params = {}) =>
            api.get('/api/academics/terms/', { params }),
        getGrades: (params = {}) =>
            api.get('/api/academics/grades/', { params }),
    },

    // ─── Timetable ─── Planning layer ────────────────────────────
    timetable: {
        // Subjects
        getSubjects: (params = {}) =>
            api.get('/api/timetable/subjects/', { params }),
        getGradeSubjects: (params = {}) =>
            api.get('/api/timetable/grade-subjects/', { params }),
        bulkUpdateGradeSubjects: (data) =>
            api.post('/api/timetable/grade-subjects/bulk-update/', data),
        createSubject: (data) =>
            api.post('/api/timetable/subjects/', data),
        updateSubject: (id, data) =>
            api.put(`/api/timetable/subjects/${id}/`, data),
        deleteSubject: (id) =>
            api.delete(`/api/timetable/subjects/${id}/`),

        // Rooms
        getRooms: (params = {}) =>
            api.get('/api/timetable/rooms/', { params }),
        createRoom: (data) =>
            api.post('/api/timetable/rooms/', data),
        updateRoom: (id, data) =>
            api.put(`/api/timetable/rooms/${id}/`, data),
        deleteRoom: (id) =>
            api.delete(`/api/timetable/rooms/${id}/`),

        // Timetable Slots
        getSlots: (params = {}) =>
            api.get('/api/timetable/slots/', { params }),
        getSlot: (id) =>
            api.get(`/api/timetable/slots/${id}/`),
        createSlot: (data) =>
            api.post('/api/timetable/slots/', data),
        updateSlot: (id, data) =>
            api.put(`/api/timetable/slots/${id}/`, data),
        patchSlot: (id, data) =>
            api.patch(`/api/timetable/slots/${id}/`, data),
        deleteSlot: (id) =>
            api.delete(`/api/timetable/slots/${id}/`),
        // Weekly view: returns slots grouped by day for a given class session
        getWeeklyView: (classSessionId) =>
            api.get('/api/timetable/slots/weekly_view/', { params: { class_session: classSessionId } }),
        // Replace a slot (keeps history, creates new)
        replaceSlot: (id, data) =>
            api.post(`/api/timetable/slots/${id}/replace_slot/`, data),

        // Exceptions (holidays / cancelled days)
        getExceptions: (params = {}) =>
            api.get('/api/timetable/exceptions/', { params }),
        createException: (data) =>
            api.post('/api/timetable/exceptions/', data),
        updateException: (id, data) =>
            api.put(`/api/timetable/exceptions/${id}/`, data),
        deleteException: (id) =>
            api.delete(`/api/timetable/exceptions/${id}/`),

        // Curriculum units
        getCurriculumUnits: (params = {}) =>
            api.get('/api/timetable/curriculum-units/', { params }),
        createCurriculumUnit: (data) =>
            api.post('/api/timetable/curriculum-units/', data),
        updateCurriculumUnit: (id, data) =>
            api.put(`/api/timetable/curriculum-units/${id}/`, data),
        deleteCurriculumUnit: (id) =>
            api.delete(`/api/timetable/curriculum-units/${id}/`),
    },

    // ─── Planned Lessons ─── Generation layer ────────────────────
    plannedLessons: {
        list: (params = {}) =>
            api.get('/api/scheduled/planned-lessons/', { params }),
        getToday: (params = {}) =>
            api.get('/api/scheduled/planned-lessons/today/', { params }),
        getSummary: (params = {}) =>
            api.get('/api/scheduled/planned-lessons/summary/', { params }),
        cancel: (id, data = {}) =>
            api.post(`/api/scheduled/planned-lessons/${id}/cancel/`, data),
        regenerate: (data = {}) =>
            api.post('/api/scheduled/planned-lessons/regenerate/', data),
    },

    // ─── Lesson Sessions ─── Execution layer ─────────────────────
    lessonSessions: {
        list: (params = {}) =>
            api.get('/api/lesson-sessions/sessions/', { params }),
        get: (id) =>
            api.get(`/api/lesson-sessions/sessions/${id}/`),
        create: (data) =>
            api.post('/api/lesson-sessions/sessions/', data),
        update: (id, data) =>
            api.put(`/api/lesson-sessions/sessions/${id}/`, data),
        patch: (id, data) =>
            api.patch(`/api/lesson-sessions/sessions/${id}/`, data),
        // Actions
        start: (id, data = {}) =>
            api.post(`/api/lesson-sessions/sessions/${id}/start/`, data),
        // Ad-hoc (no planned lesson): pass planned_lesson=null + required fields
        startAdhoc: (data) =>
            api.post('/api/lesson-sessions/sessions/', data),
        complete: (id, data = {}) =>
            api.post(`/api/lesson-sessions/sessions/${id}/complete/`, data),
        cancel: (id, data = {}) =>
            api.post(`/api/lesson-sessions/sessions/${id}/cancel/`, data),
        // Attendance
        getAttendance: (id) =>
            api.get(`/api/lesson-sessions/sessions/${id}/attendance/`),
        markAttendance: (id, records) =>
            api.post(`/api/lesson-sessions/sessions/${id}/attendance/`, records),
        // Today's sessions
        getToday: (params = {}) =>
            api.get('/api/lesson-sessions/sessions/today/', { params }),
        // Analytics
        getAnalytics: (params = {}) =>
            api.get('/api/lesson-sessions/sessions/analytics/', { params }),
        // Teacher workload
        getTeacherWorkload: (params = {}) =>
            api.get('/api/lesson-sessions/teacher-workload/', { params }),
    },

    // ─── Substitutions ────────────────────────────────────────────
    substitutions: {
        list: (params = {}) =>
            api.get('/api/lesson-sessions/substitutions/', { params }),
        create: (data) =>
            api.post('/api/lesson-sessions/substitutions/', data),
        update: (id, data) =>
            api.put(`/api/lesson-sessions/substitutions/${id}/`, data),
        delete: (id) =>
            api.delete(`/api/lesson-sessions/substitutions/${id}/`),
    },

    // ─── Curriculum Coverage ─────────────────────────────────────
    curriculumCoverage: {
        list: (params = {}) =>
            api.get('/api/lesson-sessions/coverage/', { params }),
        getSubjectSummary: (params = {}) =>
            api.get('/api/lesson-sessions/coverage/subject_summary/', { params }),
    },

    // ─── Workforce & HR ──────────────────────────────────────────
    workforce: {
        getStats: () => api.get('/workforce/api/employees/statistics/'),
        getHRAnalytics: () => api.get('/workforce/api/hr-analytics/dashboard/'),
        getPayrollSummary: () => api.get('/workforce/api/payroll-dashboard/summary/'),
        getMySummary: () => api.get('/workforce/api/employees/my_comprehensive_summary/'),
    },

    // ─── Fees & Finance ──────────────────────────────────────────
    fees: {
        getInsights: () => api.get('/api/fees/insights/'),
    },

    // ─── Examinations ─────────────────────────────────────────────
    examination: {
        getExams: (params) => api.get('/examinations/api/examinations/', { params }),
        getAnalysis: (id) => api.get(`/examinations/api/examinations/${id}/analysis/`),
        getClassAnalysis: (session_id) => api.get('/examinations/api/term-results/class_analysis/', { params: { class_session: session_id } }),
    }
};
