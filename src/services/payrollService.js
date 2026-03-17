/**
 * Payroll Service
 * Centralized API calls for payroll dashboard and operations
 */

import { api } from './api';

const BASE_URL = '/workforce/api';

export const payrollService = {
    /**
     * Dashboard Summary
     * Returns all KPI data for the dashboard
     */
    getDashboardSummary: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-dashboard/summary/`);
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    },

    /**
     * Monthly Trends
     * Returns payroll trends for charts
     * @param {number} months - Number of months to fetch (default: 6)
     */
    getMonthlyTrends: async (months = 6) => {
        try {
            return await api.get(`${BASE_URL}/payroll-dashboard/monthly-trends/`, {
                params: { months }
            });
        } catch (error) {
            console.error('Error fetching monthly trends:', error);
            throw error;
        }
    },

    /**
     * Department Costs
     * Returns payroll breakdown by department
     * @param {number} periodId - Optional period ID
     */
    getDepartmentCosts: async (periodId = null) => {
        try {
            const params = periodId ? { period_id: periodId } : {};
            return await api.get(`${BASE_URL}/payroll-dashboard/department-costs/`, { params });
        } catch (error) {
            console.error('Error fetching department costs:', error);
            throw error;
        }
    },

    /**
     * Current Period
     * Returns active payroll period with workflow status
     */
    getCurrentPeriod: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-dashboard/current-period/`);
        } catch (error) {
            console.error('Error fetching current period:', error);
            throw error;
        }
    },

    /**
     * Alerts
     * Returns payroll alerts and notifications
     */
    getAlerts: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-dashboard/alerts/`);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            throw error;
        }
    },

    /**
     * Recent Runs
     * Returns recent payroll runs history
     * @param {number} limit - Number of runs to fetch (default: 5)
     */
    getRecentRuns: async (limit = 5) => {
        try {
            return await api.get(`${BASE_URL}/payroll-dashboard/recent-runs/`, {
                params: { limit }
            });
        } catch (error) {
            console.error('Error fetching recent runs:', error);
            throw error;
        }
    },

    /**
     * Distribution
     * Returns payroll distribution for pie charts
     * @param {number} periodId - Optional period ID
     */
    getDistribution: async (periodId = null) => {
        try {
            const params = periodId ? { period_id: periodId } : {};
            return await api.get(`${BASE_URL}/payroll-dashboard/distribution/`, { params });
        } catch (error) {
            console.error('Error fetching distribution:', error);
            throw error;
        }
    },

    // ========================================================================
    // EXISTING PAYROLL API METHODS
    // ========================================================================

    /**
     * Get all payroll periods
     */
    getPayrollPeriods: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/payroll-periods/`, { params });
        } catch (error) {
            console.error('Error fetching payroll periods:', error);
            throw error;
        }
    },

    /**
     * Get payroll period by ID
     */
    getPayrollPeriod: async (periodId) => {
        try {
            return await api.get(`${BASE_URL}/payroll-periods/${periodId}/`);
        } catch (error) {
            console.error('Error fetching payroll period:', error);
            throw error;
        }
    },

    /**
     * Get period summary
     */
    getPeriodSummary: async (periodId) => {
        try {
            return await api.get(`${BASE_URL}/payroll-periods/${periodId}/summary/`);
        } catch (error) {
            console.error('Error fetching period summary:', error);
            throw error;
        }
    },

    /**
     * Process payroll for a period
     */
    processPayroll: async (periodId) => {
        try {
            return await api.post(`${BASE_URL}/payroll-periods/${periodId}/process/`);
        } catch (error) {
            console.error('Error processing payroll:', error);
            throw error;
        }
    },

    /**
     * Approve payroll period
     */
    approvePayroll: async (periodId) => {
        try {
            return await api.post(`${BASE_URL}/payroll-periods/${periodId}/approve/`);
        } catch (error) {
            console.error('Error approving payroll:', error);
            throw error;
        }
    },

    /**
     * Get payroll calculations
     */
    getPayrollCalculations: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/payroll-calculations/`, { params });
        } catch (error) {
            console.error('Error fetching calculations:', error);
            throw error;
        }
    },

    /**
     * Get calculation breakdown
     */
    getCalculationBreakdown: async (calculationId) => {
        try {
            return await api.get(`${BASE_URL}/payroll-calculations/${calculationId}/breakdown/`);
        } catch (error) {
            console.error('Error fetching breakdown:', error);
            throw error;
        }
    },

    /**
     * Get payslips
     */
    getPayslips: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/payslips/`, { params });
        } catch (error) {
            console.error('Error fetching payslips:', error);
            throw error;
        }
    },

    // ========================================================================
    // STATUTORY SETTINGS API
    // ========================================================================

    /**
     * Get all tax bands (PAYE)
     */
    getTaxBands: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-settings/tax-bands/`);
        } catch (error) {
            console.error('Error fetching tax bands:', error);
            throw error;
        }
    },

    /**
     * Create a new tax band
     */
    createTaxBand: async (data) => {
        try {
            return await api.post(`${BASE_URL}/payroll-settings/tax-bands/`, data);
        } catch (error) {
            console.error('Error creating tax band:', error);
            throw error;
        }
    },

    /**
     * Update a tax band
     */
    updateTaxBand: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/payroll-settings/tax-bands/${id}/`, data);
        } catch (error) {
            console.error('Error updating tax band:', error);
            throw error;
        }
    },

    /**
     * Delete a tax band
     */
    deleteTaxBand: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/payroll-settings/tax-bands/${id}/`);
        } catch (error) {
            console.error('Error deleting tax band:', error);
            throw error;
        }
    },

    /**
     * Get tax reliefs
     */
    getTaxReliefs: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-settings/tax-reliefs/`);
        } catch (error) {
            console.error('Error fetching tax reliefs:', error);
            throw error;
        }
    },

    /**
     * Update tax reliefs
     */
    updateTaxReliefs: async (reliefs) => {
        try {
            return await api.put(`${BASE_URL}/payroll-settings/tax-reliefs/`, { reliefs });
        } catch (error) {
            console.error('Error updating tax reliefs:', error);
            throw error;
        }
    },

    /**
     * Get statutory rates (NSSF, SHIF, Housing Levy, etc.)
     */
    getStatutoryRates: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-settings/statutory-rates/`);
        } catch (error) {
            console.error('Error fetching statutory rates:', error);
            throw error;
        }
    },

    /**
     * Update statutory rates
     */
    updateStatutoryRates: async (rates) => {
        try {
            return await api.put(`${BASE_URL}/payroll-settings/statutory-rates/`, { rates });
        } catch (error) {
            console.error('Error updating statutory rates:', error);
            throw error;
        }
    },

    /**
     * Toggle statutory deduction on/off
     */
    toggleStatutoryDeduction: async (rateType, isEnabled) => {
        try {
            return await api.post(`${BASE_URL}/payroll-settings/statutory-rates/toggle/`, {
                rate_type: rateType,
                is_enabled: isEnabled
            });
        } catch (error) {
            console.error('Error toggling statutory deduction:', error);
            throw error;
        }
    },

    /**
     * Seed default Kenyan statutory settings
     */
    seedStatutoryDefaults: async () => {
        try {
            return await api.post(`${BASE_URL}/payroll-settings/seed-defaults/`);
        } catch (error) {
            console.error('Error seeding defaults:', error);
            throw error;
        }
    },

    /**
     * Export all payroll settings
     */
    exportSettings: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-settings/export/`);
        } catch (error) {
            console.error('Error exporting settings:', error);
            throw error;
        }
    },

    /**
     * Get earning types
     */
    getEarningTypes: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-settings/earning-types/`);
        } catch (error) {
            console.error('Error fetching earning types:', error);
            throw error;
        }
    },

    /**
     * Get deduction types
     */
    getDeductionTypes: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-settings/deduction-types/`);
        } catch (error) {
            console.error('Error fetching deduction types:', error);
            throw error;
        }
    },

    /**
     * Create deduction type
     */
    createDeductionType: async (data) => {
        try {
            return await api.post(`${BASE_URL}/payroll-settings/deduction-types/`, data);
        } catch (error) {
            console.error('Error creating deduction type:', error);
            throw error;
        }
    },

    /**
     * Update deduction type
     */
    updateDeductionType: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/payroll-settings/deduction-types/${id}/`, data);
        } catch (error) {
            console.error('Error updating deduction type:', error);
            throw error;
        }
    },

    /**
     * Delete deduction type
     */
    deleteDeductionType: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/payroll-settings/deduction-types/${id}/`);
        } catch (error) {
            console.error('Error deleting deduction type:', error);
            throw error;
        }
    }
};

export default payrollService;
