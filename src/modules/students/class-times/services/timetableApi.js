/**
 * timetableApi.js — Enhanced API service layer for timetable operations.
 * 
 * This module provides:
 * 1. All timetable-related API endpoints
 * 2. Conflict checking before slot creation
 * 3. Work allocations for scheduling
 * 4. Analytics endpoints
 * 5. Version management
 * 6. Proper error handling with structured messages
 * 
 * Architecture:
 * - All methods return Promises
 * - Error responses include structured conflict data
 * - Caching support via cache parameter
 */

import axios from 'axios';

// Base API instance - reuse from main api.js or create dedicated one
const API_BASE = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token interceptor - matches main api.js auth pattern
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const errorData = {
            status: error.response?.status,
            message: error.response?.data?.detail || error.message,
            conflicts: error.response?.data?.non_field_errors || [],
            fieldErrors: error.response?.data || {},
        };
        return Promise.reject(errorData);
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// TIMETABLE API SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const timetableApi = {
    // ─── TIME PERIODS ─────────────────────────────────────────────────────────
    periods: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/periods/', { params }),

        getSchedulable: () =>
            apiClient.get('/api/timetable/periods/schedulable/'),

        create: (data) =>
            apiClient.post('/api/timetable/periods/', data),

        update: (id, data) =>
            apiClient.put(`/api/timetable/periods/${id}/`, data),

        delete: (id) =>
            apiClient.delete(`/api/timetable/periods/${id}/`),
    },

    // ─── SUBJECTS ─────────────────────────────────────────────────────────────
    subjects: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/subjects/', { params }),

        get: (id) =>
            apiClient.get(`/api/timetable/subjects/${id}/`),

        create: (data) =>
            apiClient.post('/api/timetable/subjects/', data),

        update: (id, data) =>
            apiClient.put(`/api/timetable/subjects/${id}/`, data),

        delete: (id) =>
            apiClient.delete(`/api/timetable/subjects/${id}/`),
    },

    // ─── ROOMS ────────────────────────────────────────────────────────────────
    rooms: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/rooms/', { params }),

        get: (id) =>
            apiClient.get(`/api/timetable/rooms/${id}/`),

        create: (data) =>
            apiClient.post('/api/timetable/rooms/', data),

        update: (id, data) =>
            apiClient.put(`/api/timetable/rooms/${id}/`, data),

        delete: (id) =>
            apiClient.delete(`/api/timetable/rooms/${id}/`),
    },

    // ─── TIMETABLE SLOTS (CORE) ───────────────────────────────────────────────
    slots: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/slots/', { params }),

        get: (id) =>
            apiClient.get(`/api/timetable/slots/${id}/`),

        /**
         * Create a new slot.
         * Backend automatically validates conflicts and returns structured errors.
         */
        create: (data) =>
            apiClient.post('/api/timetable/slots/', data),

        update: (id, data) =>
            apiClient.put(`/api/timetable/slots/${id}/`, data),

        patch: (id, data) =>
            apiClient.patch(`/api/timetable/slots/${id}/`, data),

        delete: (id) =>
            apiClient.delete(`/api/timetable/slots/${id}/`),

        /**
         * Get slots grouped by day for a class session.
         * Returns: { "0": [...], "1": [...], ... } where keys are day indices.
         */
        weeklyView: (classSessionId) =>
            apiClient.get('/api/timetable/slots/weekly-view/', {
                params: { class_session: classSessionId }
            }),

        /**
         * Replace an existing slot (for mid-term changes).
         * Expires old slot and creates new one, regenerates planned lessons.
         */
        replace: (id, data) =>
            apiClient.post(`/api/timetable/slots/${id}/replace-slot/`, data),
    },

    // ─── WORK ALLOCATIONS ─────────────────────────────────────────────────────
    allocations: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/allocations/', { params }),

        byClass: (classSessionId) =>
            apiClient.get(`/api/timetable/allocations/by-class/${classSessionId}/`),

        byTeacher: (teacherId) =>
            apiClient.get(`/api/timetable/allocations/by-teacher/${teacherId}/`),

        create: (data) =>
            apiClient.post('/api/timetable/allocations/', data),

        update: (id, data) =>
            apiClient.put(`/api/timetable/allocations/${id}/`, data),

        delete: (id) =>
            apiClient.delete(`/api/timetable/allocations/${id}/`),

        /**
         * Get available time slots for an allocation.
         * Used by the assignment modal to show valid options.
         */
        availableSlots: (allocationId) =>
            apiClient.get(`/api/timetable/allocations/${allocationId}/available_slots/`),
    },

    // ─── TEACHER AVAILABILITY ─────────────────────────────────────────────────
    availability: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/availability/', { params }),

        byTeacher: (teacherId) =>
            apiClient.get(`/api/timetable/availability/by-teacher/${teacherId}/`),

        create: (data) =>
            apiClient.post('/api/timetable/availability/', data),

        update: (id, data) =>
            apiClient.put(`/api/timetable/availability/${id}/`, data),

        delete: (id) =>
            apiClient.delete(`/api/timetable/availability/${id}/`),
    },

    // ─── CONFLICT CHECKING ────────────────────────────────────────────────────
    conflicts: {
        /**
         * Pre-validate a slot before creation.
         * Returns: { is_valid, conflicts: [], warnings: [] }
         */
        check: (data) =>
            apiClient.post('/api/timetable/check-conflict/', data),
    },

    // ─── SCHEDULING ───────────────────────────────────────────────────────────
    scheduling: {
        /**
         * Generate timetable for a class.
         * @param {Object} options
         * @param {number} options.class_session - Class session ID
         * @param {string} options.mode - 'semi_auto' | 'suggestions_only'
         * @param {Object} options.preferences - { prefer_morning, spread_subjects, etc. }
         */
        generate: (options) =>
            apiClient.post('/api/timetable/generate/', options),
    },

    // ─── TIMETABLE LOCKS ──────────────────────────────────────────────────────
    locks: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/locks/', { params }),

        get: (classSessionId) =>
            apiClient.get(`/api/timetable/locks/`, {
                params: { class_session: classSessionId }
            }),

        create: (data) =>
            apiClient.post('/api/timetable/locks/', data),

        lock: (id) =>
            apiClient.post(`/api/timetable/locks/${id}/lock/`),

        unlock: (id) =>
            apiClient.post(`/api/timetable/locks/${id}/unlock/`),
    },

    // ─── VERSION HISTORY ──────────────────────────────────────────────────────
    versions: {
        list: (classSessionId) =>
            apiClient.get('/api/timetable/versions/', {
                params: { class_session: classSessionId }
            }),

        createSnapshot: (data) =>
            apiClient.post('/api/timetable/versions/create-snapshot/', data),

        restore: (versionId) =>
            apiClient.post(`/api/timetable/versions/${versionId}/restore/`),
    },

    // ─── ANALYTICS ────────────────────────────────────────────────────────────
    analytics: {
        dashboard: () =>
            apiClient.get('/api/timetable/analytics/dashboard/'),

        workloads: () =>
            apiClient.get('/api/timetable/analytics/workloads/'),

        teacherDetail: (teacherId) =>
            apiClient.get(`/api/timetable/analytics/teacher/${teacherId}/`),

        classCoverage: (classSessionId) =>
            apiClient.get(`/api/timetable/analytics/coverage/${classSessionId}/`),

        roomUtilization: () =>
            apiClient.get('/api/timetable/analytics/rooms/'),

        roomDetail: (roomId) =>
            apiClient.get(`/api/timetable/analytics/room/${roomId}/`),

        periodUtilization: () =>
            apiClient.get('/api/timetable/analytics/periods/'),

        conflictAudit: () =>
            apiClient.get('/api/timetable/analytics/conflicts/'),
    },

    // ─── FULL TIMETABLE VIEWS ─────────────────────────────────────────────────
    views: {
        classFull: (classSessionId) =>
            apiClient.get(`/api/timetable/class/${classSessionId}/full/`),

        teacherFull: (teacherId) =>
            apiClient.get(`/api/timetable/teacher/${teacherId}/full/`),

        roomFull: (roomId) =>
            apiClient.get(`/api/timetable/room/${roomId}/full/`),
    },

    // ─── EXCEPTIONS (HOLIDAYS) ────────────────────────────────────────────────
    exceptions: {
        list: (params = {}) =>
            apiClient.get('/api/timetable/exceptions/', { params }),

        create: (data) =>
            apiClient.post('/api/timetable/exceptions/', data),

        update: (id, data) =>
            apiClient.put(`/api/timetable/exceptions/${id}/`, data),

        delete: (id) =>
            apiClient.delete(`/api/timetable/exceptions/${id}/`),
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse API error response into user-friendly message.
 */
export const parseApiError = (error) => {
    if (typeof error === 'string') return error;

    // Conflict errors from backend
    if (error.conflicts && error.conflicts.length > 0) {
        return error.conflicts.join('\n');
    }

    // Field-level errors
    if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        const fields = Object.entries(error.fieldErrors)
            .filter(([key]) => key !== 'non_field_errors')
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
        return fields || error.message;
    }

    return error.message || 'An unexpected error occurred';
};

/**
 * Debounce function for API calls.
 */
export const debounce = (fn, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        return new Promise((resolve) => {
            timeoutId = setTimeout(() => resolve(fn(...args)), delay);
        });
    };
};

/**
 * Simple in-memory cache for timetable data.
 */
class TimetableCache {
    constructor(ttl = 5 * 60 * 1000) { // 5 min default TTL
        this.cache = new Map();
        this.ttl = ttl;
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }

    set(key, data, ttl = this.ttl) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl,
        });
    }

    invalidate(keyPrefix) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(keyPrefix)) {
                this.cache.delete(key);
            }
        }
    }

    clear() {
        this.cache.clear();
    }
}

export const timetableCache = new TimetableCache();

export default timetableApi;
