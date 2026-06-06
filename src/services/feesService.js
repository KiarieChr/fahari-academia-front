import { api } from './api';

/**
 * Fees Service - Student fees, arrears, invoices
 */
export const feesService = {
    /**
     * Get arrears summary including KPIs and chart data
     * @param {Object} filters - Filter object { year, term, class, intake }
     * @returns {Promise} Promise resolving to arrears summary data
     */
    getArrearsSummary: async (filters = {}) => {
        const params = {};

        if (filters.year && filters.year !== 'All') {
            params.academic_year = filters.year;
        }
        if (filters.term && filters.term !== 'All') {
            params.term = filters.term;
        }
        if (filters.class && filters.class !== 'All') {
            params.grade = filters.class;
        }
        if (filters.intake && filters.intake !== 'All') {
            params.intake = filters.intake;
        }

        const response = await api.get('/api/fees/arrears/summary/', { params });

        // Transform API response to match mock data structure
        return {
            kpis: {
                totalArrears: response.kpis.total_arrears,
                studentCount: response.kpis.student_count,
                averageArrears: response.kpis.average_arrears,
                highestArrears: response.kpis.highest_arrears,
                fullyPaidCount: response.kpis.fully_paid_count,
                arrearsGrowth: response.kpis.arrears_growth,
            },
            arrearsByClass: response.by_class,  // Already matches { name, value }
            arrearsByIntake: response.by_intake,  // Already matches { name, value }
        };
    },

    /**
     * Get students with outstanding balances (arrears)
     * @param {Object} filters - Filter object { year, term, class, intake }
     * @param {string} search - Search query for student name or admission number
     * @param {number} page - Page number for pagination
     * @returns {Promise} Promise resolving to paginated student arrears data
     */
    getStudentsInArrears: async (filters = {}, search = '', page = 1) => {
        const params = { page, page_size: 20 };

        if (filters.year && filters.year !== 'All') {
            params.academic_year = filters.year;
        }
        if (filters.term && filters.term !== 'All') {
            params.term = filters.term;
        }
        if (filters.class && filters.class !== 'All') {
            params.grade = filters.class;
        }
        if (filters.intake && filters.intake !== 'All') {
            params.intake = filters.intake;
        }
        if (search) {
            params.search = search;
        }

        const response = await api.get('/api/fees/arrears/students/', { params });

        // Transform API response to match mock data structure
        return {
            count: response.count,
            next: response.next,
            previous: response.previous,
            results: response.results.map(student => ({
                id: student.id,
                name: student.name,
                admNo: student.admission_number,
                class: student.class_name,
                term: student.term,
                payable: student.total_payable,
                paid: student.total_paid,
                balance: student.balance,
                status: student.status,
            })),
        };
    },

    /**
   * Get available filter options for dropdowns
   * @param {string} academicYear - Optional academic year to filter terms
   * @returns {Promise} Promise resolving to filter options
   */
    getFilterOptions: async (academicYear = null) => {
        const params = {};
        if (academicYear && academicYear !== 'All') {
            params.academic_year = academicYear;
        }
        const response = await api.get('/api/fees/arrears/filter_options/', { params });
        return response;
    },

    /**
     * Get balance for a specific student
     * @param {number} studentId
     * @returns {Promise} Promise resolving to balance details
     */
    getStudentBalance: async (studentId) => {
        const response = await api.get('/api/fees/arrears/student_balance/', { params: { student_id: studentId } });
        return response;
    },

    /**
     * Get pending invoices for a student
     * @param {number} studentId
     * @returns {Promise} List of pending invoices with items
     */
    getPendingInvoices: async (studentId) => {
        const response = await api.get('/api/fees/billing/invoices/', {
            params: {
                student_id: studentId,
                status: 'SENT'  // Or handled by backend to include OVERDUE/PARTIALLY_PAID
            }
        });
       
        return response;
    },

    /**
     * Get ageing analysis — outstanding amounts bucketed by days overdue
     * @param {Object} filters - { year, term, grade, intake }
     */
    getAgeingAnalysis: async (filters = {}) => {
        const params = {};
        if (filters.year && filters.year !== 'All') params.academic_year = filters.year;
        if (filters.term && filters.term !== 'All') params.term = filters.term;
        if (filters.class && filters.class !== 'All') params.grade = filters.class;
        if (filters.intake && filters.intake !== 'All') params.intake = filters.intake;
        return await api.get('/api/fees/arrears/ageing_analysis/', { params });
    },

    /**
     * Get full fee statement for a student (invoices + payments + prepayments)
     * @param {number} studentId
     * @param {Object} filters - { year, term }
     */
    getStudentStatement: async (studentId, filters = {}) => {
        const params = { student_id: studentId };
        if (filters.year) params.year = filters.year;
        if (filters.term) params.term = filters.term;
        return await api.get('/api/fees/arrears/student_statement/', { params });
    },

    /**
     * Get all students with arrears — unpaginated, for export/report generation
     * @param {Object} filters
     */
    getAllStudentsInArrears: async (filters = {}) => {
        const params = { page: 1, page_size: 500 };
        if (filters.year && filters.year !== 'All') params.academic_year = filters.year;
        if (filters.term && filters.term !== 'All') params.term = filters.term;
        if (filters.class && filters.class !== 'All') params.grade = filters.class;
        if (filters.intake && filters.intake !== 'All') params.intake = filters.intake;
        const response = await api.get('/api/fees/arrears/students/', { params });
        return (response.results || []).map(s => ({
            id: s.id,
            name: s.name,
            admNo: s.admission_number,
            class: s.class_name,
            term: s.term,
            payable: s.total_payable,
            paid: s.total_paid,
            balance: s.balance,
            status: s.status,
        }));
    },
};
