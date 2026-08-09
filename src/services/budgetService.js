import { api } from './api';

export const budgetService = {
    // --- BUDGETS ---

    getBudgets: async (params = {}) => {
        const data = await api.get('/api/budgets/budgets/', { params });
        return Array.isArray(data) ? data : (data.results || []);
    },

    getBudget: async (id) => {
        return api.get(`/api/budgets/budgets/${id}/`);
    },

    createBudget: async (data) => {
        return api.post('/api/budgets/budgets/', data);
    },

    updateBudget: async (id, data) => {
        return api.put(`/api/budgets/budgets/${id}/`, data);
    },

    deleteBudget: async (id) => {
        return api.delete(`/api/budgets/budgets/${id}/`);
    },

    getBudgetVsActual: async (id) => {
        return api.get(`/api/budgets/budgets/${id}/budget_vs_actual/`);
    },

    // --- BUDGET LINES (for dropdowns) ---

    getBudgetLines: async (params = {}) => {
        const data = await api.get('/api/budgets/budget-lines/', { params });
        return Array.isArray(data) ? data : (data.results || []);
    },
};
