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
     * Unlock payroll period for re-run
     */
    unlockPayrollPeriod: async (periodId) => {
        try {
            return await api.post(`${BASE_URL}/payroll-periods/${periodId}/unlock/`);
        } catch (error) {
            console.error('Error unlocking payroll period:', error);
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

    /**
     * Get Payslip Templates
     */
    getPayslipTemplates: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/payslip-templates/`, { params });
        } catch (error) {
            console.error('Error fetching payslip templates:', error);
            throw error;
        }
    },

    /**
     * Update Payslip Template 
     */
    updatePayslipTemplate: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/payslip-templates/${id}/`, data);
        } catch (error) {
            console.error('Error updating payslip template:', error);
            throw error;
        }
    },

    /**
     * Create Payslip Template 
     */
    createPayslipTemplate: async (data) => {
        try {
            return await api.post(`${BASE_URL}/payslip-templates/`, data);
        } catch (error) {
            console.error('Error creating payslip template:', error);
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
    },

    // ========================================================================
    // EMPLOYEE PAY PROFILES
    // ========================================================================

    getEmployeePayProfiles: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/employee-pay-profiles/`, { params });
        } catch (error) {
            console.error('Error fetching employee pay profiles:', error);
            throw error;
        }
    },

    getEmployeePayProfile: async (id) => {
        try {
            return await api.get(`${BASE_URL}/employee-pay-profiles/${id}/`);
        } catch (error) {
            console.error('Error fetching employee pay profile:', error);
            throw error;
        }
    },

    createEmployeePayProfile: async (data) => {
        try {
            return await api.post(`${BASE_URL}/employee-pay-profiles/`, data);
        } catch (error) {
            console.error('Error creating employee pay profile:', error);
            throw error;
        }
    },

    updateEmployeePayProfile: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/employee-pay-profiles/${id}/`, data);
        } catch (error) {
            console.error('Error updating employee pay profile:', error);
            throw error;
        }
    },

    deleteEmployeePayProfile: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/employee-pay-profiles/${id}/`);
        } catch (error) {
            console.error('Error deleting employee pay profile:', error);
            throw error;
        }
    },

    // ========================================================================
    // PAYROLL ACCOUNTS
    // ========================================================================

    getPayrollAccounts: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/payroll-accounts/`, { params });
        } catch (error) {
            console.error('Error fetching payroll accounts:', error);
            throw error;
        }
    },

    createPayrollAccount: async (data) => {
        try {
            return await api.post(`${BASE_URL}/payroll-accounts/`, data);
        } catch (error) {
            console.error('Error creating payroll account:', error);
            throw error;
        }
    },

    updatePayrollAccount: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/payroll-accounts/${id}/`, data);
        } catch (error) {
            console.error('Error updating payroll account:', error);
            throw error;
        }
    },

    deletePayrollAccount: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/payroll-accounts/${id}/`);
        } catch (error) {
            console.error('Error deleting payroll account:', error);
            throw error;
        }
    },

    getGLAccounts: async () => {
        try {
            return await api.get(`${BASE_URL}/payroll-accounts/gl_accounts/`);
        } catch (error) {
            console.error('Error fetching GL accounts:', error);
            throw error;
        }
    },

    // ========================================================================
    // PAY GRADE STEPS
    // ========================================================================

    getPayGradeSteps: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/pay-grade-steps/`, { params });
        } catch (error) {
            console.error('Error fetching pay grade steps:', error);
            throw error;
        }
    },

    createPayGradeStep: async (data) => {
        try {
            return await api.post(`${BASE_URL}/pay-grade-steps/`, data);
        } catch (error) {
            console.error('Error creating pay grade step:', error);
            throw error;
        }
    },

    updatePayGradeStep: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/pay-grade-steps/${id}/`, data);
        } catch (error) {
            console.error('Error updating pay grade step:', error);
            throw error;
        }
    },

    deletePayGradeStep: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/pay-grade-steps/${id}/`);
        } catch (error) {
            console.error('Error deleting pay grade step:', error);
            throw error;
        }
    },

    // ========================================================================
    // JOB GRADES
    // ========================================================================

    getJobGrades: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/job-grades/`, { params });
        } catch (error) {
            console.error('Error fetching job grades:', error);
            throw error;
        }
    },

    getJobGrade: async (id) => {
        try {
            return await api.get(`${BASE_URL}/job-grades/${id}/`);
        } catch (error) {
            console.error('Error fetching job grade:', error);
            throw error;
        }
    },

    createJobGrade: async (data) => {
        try {
            return await api.post(`${BASE_URL}/job-grades/`, data);
        } catch (error) {
            console.error('Error creating job grade:', error);
            throw error;
        }
    },

    updateJobGrade: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/job-grades/${id}/`, data);
        } catch (error) {
            console.error('Error updating job grade:', error);
            throw error;
        }
    },

    deleteJobGrade: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/job-grades/${id}/`);
        } catch (error) {
            console.error('Error deleting job grade:', error);
            throw error;
        }
    },

    // ========================================================================
    // PAYROLL PERIODS CRUD
    // ========================================================================

    createPayrollPeriod: async (data) => {
        try {
            return await api.post(`${BASE_URL}/payroll-periods/`, data);
        } catch (error) {
            console.error('Error creating payroll period:', error);
            throw error;
        }
    },

    updatePayrollPeriod: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/payroll-periods/${id}/`, data);
        } catch (error) {
            console.error('Error updating payroll period:', error);
            throw error;
        }
    },

    deletePayrollPeriod: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/payroll-periods/${id}/`);
        } catch (error) {
            console.error('Error deleting payroll period:', error);
            throw error;
        }
    },

    // ========================================================================
    // PAY PROFILES (templates)
    // ========================================================================

    getPayProfiles: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/pay-profiles/`, { params });
        } catch (error) {
            console.error('Error fetching pay profiles:', error);
            throw error;
        }
    },

    // ========================================================================
    // EMPLOYEE EARNINGS & DEDUCTIONS
    // ========================================================================

    getEmployeeEarnings: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/employee-earnings/`, { params });
        } catch (error) {
            console.error('Error fetching employee earnings:', error);
            throw error;
        }
    },

    createEmployeeEarning: async (data) => {
        try {
            return await api.post(`${BASE_URL}/employee-earnings/`, data);
        } catch (error) {
            console.error('Error creating employee earning:', error);
            throw error;
        }
    },

    updateEmployeeEarning: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/employee-earnings/${id}/`, data);
        } catch (error) {
            console.error('Error updating employee earning:', error);
            throw error;
        }
    },

    deleteEmployeeEarning: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/employee-earnings/${id}/`);
        } catch (error) {
            console.error('Error deleting employee earning:', error);
            throw error;
        }
    },

    getEmployeeDeductions: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/employee-deductions/`, { params });
        } catch (error) {
            console.error('Error fetching employee deductions:', error);
            throw error;
        }
    },

    createEmployeeDeduction: async (data) => {
        try {
            return await api.post(`${BASE_URL}/employee-deductions/`, data);
        } catch (error) {
            console.error('Error creating employee deduction:', error);
            throw error;
        }
    },

    updateEmployeeDeduction: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/employee-deductions/${id}/`, data);
        } catch (error) {
            console.error('Error updating employee deduction:', error);
            throw error;
        }
    },

    deleteEmployeeDeduction: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/employee-deductions/${id}/`);
        } catch (error) {
            console.error('Error deleting employee deduction:', error);
            throw error;
        }
    },

    // ========================================================================
    // GROUP EARNINGS (by Job Grade)
    // ========================================================================

    getGroupEarnings: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/group-earnings/`, { params });
        } catch (error) {
            console.error('Error fetching group earnings:', error);
            throw error;
        }
    },

    createGroupEarning: async (data) => {
        try {
            return await api.post(`${BASE_URL}/group-earnings/`, data);
        } catch (error) {
            console.error('Error creating group earning:', error);
            throw error;
        }
    },

    updateGroupEarning: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/group-earnings/${id}/`, data);
        } catch (error) {
            console.error('Error updating group earning:', error);
            throw error;
        }
    },

    deleteGroupEarning: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/group-earnings/${id}/`);
        } catch (error) {
            console.error('Error deleting group earning:', error);
            throw error;
        }
    },

    // ========================================================================
    // GROUP DEDUCTIONS (by Job Grade)
    // ========================================================================

    getGroupDeductions: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/group-deductions/`, { params });
        } catch (error) {
            console.error('Error fetching group deductions:', error);
            throw error;
        }
    },

    createGroupDeduction: async (data) => {
        try {
            return await api.post(`${BASE_URL}/group-deductions/`, data);
        } catch (error) {
            console.error('Error creating group deduction:', error);
            throw error;
        }
    },

    updateGroupDeduction: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/group-deductions/${id}/`, data);
        } catch (error) {
            console.error('Error updating group deduction:', error);
            throw error;
        }
    },

    deleteGroupDeduction: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/group-deductions/${id}/`);
        } catch (error) {
            console.error('Error deleting group deduction:', error);
            throw error;
        }
    },

    // ========================================================================
    // EMPLOYEES (for dropdowns)
    // ========================================================================

    getEmployees: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/employees/`, { params });
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    },

    // ========================================================================
    // PENSION SCHEMES
    // ========================================================================

    getPensionSchemes: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/pension-schemes/`, { params });
        } catch (error) {
            console.error('Error fetching pension schemes:', error);
            throw error;
        }
    },

    getPensionScheme: async (id) => {
        try {
            return await api.get(`${BASE_URL}/pension-schemes/${id}/`);
        } catch (error) {
            console.error('Error fetching pension scheme:', error);
            throw error;
        }
    },

    createPensionScheme: async (data) => {
        try {
            return await api.post(`${BASE_URL}/pension-schemes/`, data);
        } catch (error) {
            console.error('Error creating pension scheme:', error);
            throw error;
        }
    },

    updatePensionScheme: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/pension-schemes/${id}/`, data);
        } catch (error) {
            console.error('Error updating pension scheme:', error);
            throw error;
        }
    },

    deletePensionScheme: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/pension-schemes/${id}/`);
        } catch (error) {
            console.error('Error deleting pension scheme:', error);
            throw error;
        }
    },

    // ========================================================================
    // PENSION GRADE RATES
    // ========================================================================

    getPensionGradeRates: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/pension-grade-rates/`, { params });
        } catch (error) {
            console.error('Error fetching pension grade rates:', error);
            throw error;
        }
    },

    createPensionGradeRate: async (data) => {
        try {
            return await api.post(`${BASE_URL}/pension-grade-rates/`, data);
        } catch (error) {
            console.error('Error creating pension grade rate:', error);
            throw error;
        }
    },

    updatePensionGradeRate: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/pension-grade-rates/${id}/`, data);
        } catch (error) {
            console.error('Error updating pension grade rate:', error);
            throw error;
        }
    },

    deletePensionGradeRate: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/pension-grade-rates/${id}/`);
        } catch (error) {
            console.error('Error deleting pension grade rate:', error);
            throw error;
        }
    },

    // ========================================================================
    // PENSION ENROLLMENTS
    // ========================================================================

    getPensionEnrollments: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/pension-enrollments/`, { params });
        } catch (error) {
            console.error('Error fetching pension enrollments:', error);
            throw error;
        }
    },

    createPensionEnrollment: async (data) => {
        try {
            return await api.post(`${BASE_URL}/pension-enrollments/`, data);
        } catch (error) {
            console.error('Error creating pension enrollment:', error);
            throw error;
        }
    },

    updatePensionEnrollment: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/pension-enrollments/${id}/`, data);
        } catch (error) {
            console.error('Error updating pension enrollment:', error);
            throw error;
        }
    },

    deletePensionEnrollment: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/pension-enrollments/${id}/`);
        } catch (error) {
            console.error('Error deleting pension enrollment:', error);
            throw error;
        }
    },

    // ========================================================================
    // PENSION CONTRIBUTIONS
    // ========================================================================

    getPensionContributions: async (params = {}) => {
        try {
            return await api.get(`${BASE_URL}/pension-contributions/`, { params });
        } catch (error) {
            console.error('Error fetching pension contributions:', error);
            throw error;
        }
    },

    createPensionContribution: async (data) => {
        try {
            return await api.post(`${BASE_URL}/pension-contributions/`, data);
        } catch (error) {
            console.error('Error creating pension contribution:', error);
            throw error;
        }
    },

    updatePensionContribution: async (id, data) => {
        try {
            return await api.put(`${BASE_URL}/pension-contributions/${id}/`, data);
        } catch (error) {
            console.error('Error updating pension contribution:', error);
            throw error;
        }
    },

    deletePensionContribution: async (id) => {
        try {
            return await api.delete(`${BASE_URL}/pension-contributions/${id}/`);
        } catch (error) {
            console.error('Error deleting pension contribution:', error);
            throw error;
        }
    }
};

export default payrollService;
