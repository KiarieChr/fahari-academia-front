// Enhanced API Client with Session Management
// Features: Auto-logout, session expiry detection, retry, caching

const API_URL = import.meta.env.VITE_API_URL;

// Session Management State
let sessionExpiredCallback = null;
let networkErrorCallback = null;
let isRefreshing = false;
let failedRequestsQueue = [];

// Session configuration
const SESSION_CONFIG = {
    inactivityTimeout: 30 * 60 * 1000, // 30 minutes
    warningBefore: 5 * 60 * 1000, // Show warning 5 minutes before expiry
    tokenRefreshBuffer: 60 * 1000, // Refresh token 1 minute before expiry
};

// Activity tracking
let lastActivityTime = Date.now();
let sessionWarningShown = false;
let inactivityTimer = null;
let warningTimer = null;

// Cache configuration
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHEABLE_ENDPOINTS = [
    '/workforce/api/departments/',
    '/workforce/api/job-titles/',
    '/workforce/api/job-grades/',
];

// ====================================
// Session Management Functions
// ====================================

export const setSessionExpiredCallback = (callback) => {
    sessionExpiredCallback = callback;
};

export const setNetworkErrorCallback = (callback) => {
    networkErrorCallback = callback;
};

export const updateLastActivity = () => {
    lastActivityTime = Date.now();
    sessionWarningShown = false;

    // Reset timers
    if (inactivityTimer) clearTimeout(inactivityTimer);
    if (warningTimer) clearTimeout(warningTimer);

    // Set warning timer
    warningTimer = setTimeout(() => {
        if (localStorage.getItem('token') && sessionExpiredCallback) {
            sessionWarningShown = true;
            sessionExpiredCallback('warning');
        }
    }, SESSION_CONFIG.inactivityTimeout - SESSION_CONFIG.warningBefore);

    // Set expiry timer
    inactivityTimer = setTimeout(() => {
        if (localStorage.getItem('token')) {
            handleSessionExpired('inactivity');
        }
    }, SESSION_CONFIG.inactivityTimeout);
};

export const extendSession = () => {
    updateLastActivity();
    return true;
};

export const getSessionTimeRemaining = () => {
    const elapsed = Date.now() - lastActivityTime;
    return Math.max(0, SESSION_CONFIG.inactivityTimeout - elapsed);
};

const handleSessionExpired = (reason = 'expired') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    if (sessionExpiredCallback) {
        sessionExpiredCallback(reason);
    }
};

const handleNetworkError = () => {
    if (networkErrorCallback) {
        networkErrorCallback();
    }
};

// ====================================
// Cache Functions
// ====================================

const getCacheKey = (url, params) => {
    const sortedParams = params ? JSON.stringify(Object.entries(params).sort()) : '';
    return `${url}:${sortedParams}`;
};

const getCachedResponse = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

const setCachedResponse = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = (pattern) => {
    if (pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    } else {
        cache.clear();
    }
};

// ====================================
// Response Handler
// ====================================

const handleResponse = async (response, options = {}) => {
    // Handle network errors
    if (!response) {
        handleNetworkError();
        throw new Error('Network request failed. Please check your connection.');
    }

    // Handle 401 Unauthorized - Session expired
    if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));

        // Don't trigger session expired for login attempts
        if (!options.skipAuthCheck) {
            handleSessionExpired('unauthorized');
        }

        const error = new Error(errorData.detail || 'Session expired. Please login again.');
        error.status = 401;
        error.data = errorData;
        throw error;
    }

    // Handle 403 Forbidden
    if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.detail || 'You do not have permission to perform this action.');
        error.status = 403;
        error.data = errorData;
        throw error;
    }

    // Handle blob responses
    if (options.responseType === 'blob') {
        if (!response.ok) {
            throw new Error('Failed to download file');
        }
        return response.blob();
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(
                data.detail ||
                data.message ||
                data.error ||
                (typeof data === 'object' ? JSON.stringify(data) : response.statusText) ||
                "Something went wrong"
            );
            error.data = data;
            error.status = response.status;
            throw error;
        }

        return data;
    }

    if (!response.ok) {
        throw new Error(response.statusText || "Network response was not ok");
    }

    return response.text();
};

// ====================================
// Auth Headers Helper
// ====================================

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}` } : {};
};

// ====================================
// Fetch with Retry
// ====================================

const fetchWithRetry = async (url, options, retries = 2, delay = 1000) => {
    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        if (retries > 0 && !navigator.onLine === false) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        handleNetworkError();
        throw error;
    }
};

// ====================================
// Enhanced API Object
// ====================================

export const api = {
    // Generic HTTP methods
    get: async (url, options = {}) => {
        updateLastActivity();

        // Check cache for cacheable endpoints
        const isCacheable = CACHEABLE_ENDPOINTS.some(ep => url.startsWith(ep));
        if (isCacheable && !options.skipCache) {
            const cacheKey = getCacheKey(url, options.params);
            const cached = getCachedResponse(cacheKey);
            if (cached) return cached;
        }

        try {
            const separator = url.includes('?') ? '&' : '?';
            const queryString = options.params ? `${separator}${new URLSearchParams(options.params)}` : '';

            const response = await fetchWithRetry(`${API_URL}${url}${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                },
            });

            const data = await handleResponse(response, options);

            // Cache successful response
            if (isCacheable) {
                const cacheKey = getCacheKey(url, options.params);
                setCachedResponse(cacheKey, data);
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    post: async (url, data, options = {}) => {
        updateLastActivity();

        // Clear related cache on mutations
        clearCache(url.split('?')[0]);

        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            if (!isFormData && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const body = options.body || (isFormData ? data : JSON.stringify(data));

            const response = await fetchWithRetry(`${API_URL}${url}`, {
                method: 'POST',
                headers,
                body,
            });

            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    put: async (url, data, options = {}) => {
        updateLastActivity();
        clearCache(url.split('/').slice(0, -2).join('/'));

        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            if (!isFormData && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetchWithRetry(`${API_URL}${url}`, {
                method: 'PUT',
                headers,
                body: isFormData ? data : JSON.stringify(data),
            });

            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    patch: async (url, data, options = {}) => {
        updateLastActivity();
        clearCache(url.split('/').slice(0, -2).join('/'));

        try {
            const isFormData = data instanceof FormData;
            const headers = {
                ...getAuthHeaders(),
                ...(options.headers || {})
            };

            if (!isFormData && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetchWithRetry(`${API_URL}${url}`, {
                method: 'PATCH',
                headers,
                body: isFormData ? data : JSON.stringify(data),
            });

            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    delete: async (url, options = {}) => {
        updateLastActivity();
        clearCache(url.split('/').slice(0, -2).join('/'));

        try {
            const response = await fetchWithRetry(`${API_URL}${url}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                },
            });

            return handleResponse(response, options);
        } catch (error) {
            throw error;
        }
    },

    // Authentication
    login: async (credentials) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await handleResponse(response, { skipAuthCheck: true });

            // Start session tracking after successful login
            if (data.token) {
                localStorage.setItem('token', data.token);
                updateLastActivity();
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    firstTimeSetup: async (data) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/first-time-setup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            // Clear session tracking
            if (inactivityTimer) clearTimeout(inactivityTimer);
            if (warningTimer) clearTimeout(warningTimer);

            const response = await fetch(`${API_URL}/api/auth/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
            });

            // Clear local storage regardless of response
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            clearCache();

            return handleResponse(response).catch(() => ({ success: true }));
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            clearCache();
            return { success: true };
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
            });
            return handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (email) => {
        console.warn("Forgot password not implemented on backend");
        throw new Error("Feature not available yet.");
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
        // Slots
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
        getWeeklyView: (classSessionId) =>
            api.get('/api/timetable/slots/weekly-view/', { params: { class_session: classSessionId } }),
        replaceSlot: (id, data) =>
            api.post(`/api/timetable/slots/${id}/replace-slot/`, data),
        // Exceptions
        getExceptions: (params = {}) =>
            api.get('/api/timetable/exceptions/', { params }),
        createException: (data) =>
            api.post('/api/timetable/exceptions/', data),
        updateException: (id, data) =>
            api.put(`/api/timetable/exceptions/${id}/`, data),
        deleteException: (id) =>
            api.delete(`/api/timetable/exceptions/${id}/`),
        // Curriculum Units
        getCurriculumUnits: (params = {}) =>
            api.get('/api/timetable/curriculum-units/', { params }),
        createCurriculumUnit: (data) =>
            api.post('/api/timetable/curriculum-units/', data),
        updateCurriculumUnit: (id, data) =>
            api.put(`/api/timetable/curriculum-units/${id}/`, data),
        deleteCurriculumUnit: (id) =>
            api.delete(`/api/timetable/curriculum-units/${id}/`),
        // Time Periods
        getPeriods: (params = {}) =>
            api.get('/api/timetable/periods/', { params }),
        getSchedulablePeriods: () =>
            api.get('/api/timetable/periods/schedulable/'),
        createPeriod: (data) =>
            api.post('/api/timetable/periods/', data),
        updatePeriod: (id, data) =>
            api.put(`/api/timetable/periods/${id}/`, data),
        deletePeriod: (id) =>
            api.delete(`/api/timetable/periods/${id}/`),
        // Work Allocations
        getAllocations: (params = {}) =>
            api.get('/api/timetable/allocations/', { params }),
        getAllocationsByClass: (classId) =>
            api.get(`/api/timetable/allocations/by-class/${classId}/`),
        getAllocationsByTeacher: (teacherId) =>
            api.get(`/api/timetable/allocations/by-teacher/${teacherId}/`),
        getAvailableSlots: (allocationId) =>
            api.get(`/api/timetable/allocations/${allocationId}/available_slots/`),
        createAllocation: (data) =>
            api.post('/api/timetable/allocations/', data),
        updateAllocation: (id, data) =>
            api.put(`/api/timetable/allocations/${id}/`, data),
        deleteAllocation: (id) =>
            api.delete(`/api/timetable/allocations/${id}/`),
        // Teacher Availability
        getAvailability: (params = {}) =>
            api.get('/api/timetable/availability/', { params }),
        getAvailabilityByTeacher: (teacherId) =>
            api.get(`/api/timetable/availability/by-teacher/${teacherId}/`),
        createAvailability: (data) =>
            api.post('/api/timetable/availability/', data),
        updateAvailability: (id, data) =>
            api.put(`/api/timetable/availability/${id}/`, data),
        deleteAvailability: (id) =>
            api.delete(`/api/timetable/availability/${id}/`),
        // Locks
        getLocks: (params = {}) =>
            api.get('/api/timetable/locks/', { params }),
        createLock: (data) =>
            api.post('/api/timetable/locks/', data),
        lockTimetable: (lockId) =>
            api.post(`/api/timetable/locks/${lockId}/lock/`),
        unlockTimetable: (lockId, reason = '') =>
            api.post(`/api/timetable/locks/${lockId}/unlock/`, { reason }),
        // Versions
        getVersions: (params = {}) =>
            api.get('/api/timetable/versions/', { params }),
        createSnapshot: (data) =>
            api.post('/api/timetable/versions/create-snapshot/', data),
        restoreVersion: (versionId) =>
            api.post(`/api/timetable/versions/${versionId}/restore/`),
        // Conflict Check
        checkConflict: (data) =>
            api.post('/api/timetable/check-conflict/', data),
        // Auto-generate
        generate: (data) =>
            api.post('/api/timetable/generate/', data),
        // Analytics
        getAnalytics: (reportType) =>
            api.get(`/api/timetable/analytics/${reportType}/`),
        getAnalyticsDetail: (reportType, entityId) =>
            api.get(`/api/timetable/analytics/${reportType}/${entityId}/`),
        // Full timetable views
        getClassTimetable: (classId) =>
            api.get(`/api/timetable/class/${classId}/full/`),
        getTeacherTimetable: (teacherId) =>
            api.get(`/api/timetable/teacher/${teacherId}/full/`),
        getRoomTimetable: (roomId) =>
            api.get(`/api/timetable/room/${roomId}/full/`),
        // Teachers (from users API)
        getTeachers: (params = {}) =>
            api.get('/api/users/', { params: { is_lecturer: true, ...params } }),
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
        start: (id, data = {}) =>
            api.post(`/api/lesson-sessions/sessions/${id}/start/`, data),
        startAdhoc: (data) =>
            api.post('/api/lesson-sessions/sessions/', data),
        complete: (id, data = {}) =>
            api.post(`/api/lesson-sessions/sessions/${id}/complete/`, data),
        cancel: (id, data = {}) =>
            api.post(`/api/lesson-sessions/sessions/${id}/cancel/`, data),
        getAttendance: (id) =>
            api.get(`/api/lesson-sessions/sessions/${id}/attendance/`),
        markAttendance: (id, records) =>
            api.post(`/api/lesson-sessions/sessions/${id}/attendance/`, { records }),
        getToday: (params = {}) =>
            api.get('/api/lesson-sessions/sessions/today/', { params }),
        getAnalytics: (params = {}) =>
            api.get('/api/lesson-sessions/sessions/analytics/', { params }),
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

    // ─── Daily Attendance ────────────────────────────────────────
    dailyAttendance: {
        list: (params = {}) =>
            api.get('/api/attendance/daily/', { params }),
        getRegister: (classSession, date) =>
            api.get('/api/attendance/daily/register/', { params: { class_session: classSession, date } }),
        bulkMark: (data) =>
            api.post('/api/attendance/daily/bulk_mark/', data),
        getSummary: (params = {}) =>
            api.get('/api/attendance/daily/summary/', { params }),
    },

    // ─── Assignments ─────────────────────────────────────────────
    assignments: {
        list: (params = {}) =>
            api.get('/api/assignments/assignments/', { params }),
        get: (id) =>
            api.get(`/api/assignments/assignments/${id}/`),
        create: (data) =>
            api.post('/api/assignments/assignments/', data),
        update: (id, data) =>
            api.put(`/api/assignments/assignments/${id}/`, data),
        delete: (id) =>
            api.delete(`/api/assignments/assignments/${id}/`),
        publish: (id) =>
            api.post(`/api/assignments/assignments/${id}/publish/`),
        close: (id) =>
            api.post(`/api/assignments/assignments/${id}/close/`),
        getSubmissions: (id) =>
            api.get(`/api/assignments/assignments/${id}/submissions/`),
        getStats: (id) =>
            api.get(`/api/assignments/assignments/${id}/stats/`),

        // Submissions
        listSubmissions: (params = {}) =>
            api.get('/api/assignments/submissions/', { params }),
        gradeSubmission: (id, data) =>
            api.patch(`/api/assignments/submissions/${id}/grade/`, data),

        // Portal endpoints
        myAssignments: () =>
            api.get('/api/portal/assignments/'),
        submitAssignment: (assignmentId, data) =>
            api.post(`/api/portal/assignments/${assignmentId}/submit/`, data),
        parentChildAssignments: (studentId) =>
            api.get(`/api/portal/parent/child/${studentId}/assignments/`),
    },
};

// Initialize activity tracking on import
if (typeof window !== 'undefined') {
    // Track user activity
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        window.addEventListener(event, () => {
            if (localStorage.getItem('token')) {
                updateLastActivity();
            }
        }, { passive: true });
    });

    // Start session tracking if already logged in
    if (localStorage.getItem('token')) {
        updateLastActivity();
    }
}
