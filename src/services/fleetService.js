import { api } from './api';

export const fleetService = {
    getDashboardSummary: () => api.get('/api/fleet/vehicles/dashboard_summary/'),

    vehicles: {
        list: (params = {}) => api.get('/api/fleet/vehicles/', { params }),
        create: (data) => api.post('/api/fleet/vehicles/', data),
        update: (id, data) => api.put(`/api/fleet/vehicles/${id}/`, data),
        remove: (id) => api.delete(`/api/fleet/vehicles/${id}/`),
    },

    drivers: {
        list: (params = {}) => api.get('/api/fleet/drivers/', { params }),
        create: (data) => api.post('/api/fleet/drivers/', data),
    },

    trips: {
        list: (params = {}) => api.get('/api/fleet/trips/', { params }),
        create: (data) => api.post('/api/fleet/trips/', data),
    },

    fuelLogs: {
        list: (params = {}) => api.get('/api/fleet/fuel-logs/', { params }),
        create: (data) => api.post('/api/fleet/fuel-logs/', data),
    },

    maintenanceRecords: {
        list: (params = {}) => api.get('/api/fleet/maintenance-records/', { params }),
        create: (data) => api.post('/api/fleet/maintenance-records/', data),
    },

    expenses: {
        list: (params = {}) => api.get('/api/fleet/expenses/', { params }),
        create: (data) => api.post('/api/fleet/expenses/', data),
    },
};

export default fleetService;
