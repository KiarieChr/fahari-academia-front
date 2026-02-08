// src/services/hrService.js
import { api } from './api';

export const hrService = {
    // Employees
    getEmployees: async (params = {}) => {
        const response = await api.get('/workforce/api/employees/', { params });
        return response;
    },

    getEmployee: async (id) => {
        const response = await api.get(`/workforce/api/employees/${id}/`);
        return response;
    },

    createEmployee: async (data) => {
        const response = await api.post('/workforce/api/employees/', data);
        return response;
    },

    updateEmployee: async (id, data) => {
        const response = await api.put(`/workforce/api/employees/${id}/`, data);
        return response;
    },

    deleteEmployee: async (id) => {
        const response = await api.delete(`/workforce/api/employees/${id}/`);
        return response;
    },

    // Departments
    getDepartments: async () => {
        const response = await api.get('/workforce/api/departments/');
        return response;
    },

    // Job Titles
    getJobTitles: async () => {
        const response = await api.get('/workforce/api/job-titles/');
        return response;
    },

    // Stats Dashboard
    getStaffStats: async () => {
        const response = await api.get('/workforce/api/employees/');
        return response;
    }
};