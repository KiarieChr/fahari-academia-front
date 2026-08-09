import { api } from './api';

export const financeService = {
    // Accounts
    getAccounts: () => api.get('/api/finance/accounts/'),
    getAccountTypes: () => api.get('/api/finance/accounts/types/'),
    getAccountSubTypes: () => api.get('/api/finance/accounts/sub_types/'),
    createAccount: (data) => api.post('/api/finance/accounts/', data),
    updateAccount: (id, data) => api.patch(`/api/finance/accounts/${id}/`, data),


    // Structure (if backend provides it, otherwise we build it)
    getStructure: () => api.get('/api/finance/accounts/structure/'),

    // Journals
    getJournals: (params) => api.get('/api/journals/journals/', { params }),
    createJournal: (data) => api.post('/api/journals/journals/', data),
    postJournal: (id) => api.post(`/api/journals/journals/${id}/post/`),

    // Reports
    getFinancialOverview: () => api.get('/api/finance-reports/reports/overview/'),
    getTrialBalance: (params) => api.get('/api/finance-reports/reports/trial_balance/', { params }),
    getBalanceSheet: (date) => api.get('/api/finance-reports/reports/balance_sheet/', { params: { date } }),
    getIncomeStatement: (start, end) => api.get('/api/finance-reports/reports/income_statement/', { params: { start_date: start, end_date: end } }),
    getCashFlowStatement: (start, end) => api.get('/api/finance-reports/reports/cash-flow/', { params: { start_date: start, end_date: end } }),
    getGeneralLedger: (params) => api.get('/api/finance-reports/reports/general-ledger/', { params }),
    getFinancialNotes: (startDate, endDate) => api.get('/api/finance-reports/reports/financial-notes/', { params: { start_date: startDate, end_date: endDate } }),

    // =========================================================================
    // EXTENDED FINANCE REPORTS
    // =========================================================================
    getFeeCollectionsReport: (params = {}) => api.get('/api/finance-reports/reports/fee-collections/', { params }),
    getArrearsReport: (params = {}) => api.get('/api/finance-reports/reports/arrears/', { params }),
    getPaymentSummaryReport: (params = {}) => api.get('/api/finance-reports/reports/payment-summary/', { params }),
    getExpenseAnalysis: (params = {}) => api.get('/api/finance-reports/reports/expense-analysis/', { params }),
    getSupplierBalances: (params = {}) => api.get('/api/finance-reports/reports/supplier-balances/', { params }),
    getCustomerBalances: (params = {}) => api.get('/api/finance-reports/reports/customer-balances/', { params }),
    getTopDefaulters: (params = {}) => api.get('/api/finance-reports/reports/top-defaulters/', { params }),


    // Invoicing (Customers)
    getCustomers: () => api.get('/api/invoicing/customers/'),
    createCustomer: (data) => api.post('/api/invoicing/customers/', data),
    getInvoices: (params) => api.get('/api/invoicing/invoices/', { params }),
    getInvoice: (id) => api.get(`/api/invoicing/invoices/${id}/`),
    createInvoice: (data) => api.post('/api/invoicing/invoices/', data),
    updateInvoice: (id, data) => api.patch(`/api/invoicing/invoices/${id}/`, data),
    postInvoice: (id) => api.post(`/api/invoicing/invoices/${id}/post_to_ledger/`),
    voidInvoice: (id) => api.post(`/api/invoicing/invoices/${id}/void/`),
    issueInvoice: (id) => api.post(`/api/invoicing/invoices/${id}/issue/`),

    // =========================================================================
    // ACCOUNTS PAYABLE - NEW ENDPOINTS
    // =========================================================================

    // Suppliers
    getSuppliers: (params) => api.get('/api/payables/suppliers/', { params }),
    getSupplier: (id) => api.get(`/api/payables/suppliers/${id}/`),
    createSupplier: (data) => api.post('/api/payables/suppliers/', data),
    updateSupplier: (id, data) => api.patch(`/api/payables/suppliers/${id}/`, data),
    deleteSupplier: (id) => api.delete(`/api/payables/suppliers/${id}/`),
    getSupplierOutstanding: (id) => api.get(`/api/payables/suppliers/${id}/outstanding/`),

    // Approval Thresholds
    getApprovalThresholds: () => api.get('/api/payables/approval-thresholds/'),
    createApprovalThreshold: (data) => api.post('/api/payables/approval-thresholds/', data),
    updateApprovalThreshold: (id, data) => api.patch(`/api/payables/approval-thresholds/${id}/`, data),
    deleteApprovalThreshold: (id) => api.delete(`/api/payables/approval-thresholds/${id}/`),

    // Supplier Invoices
    getSupplierInvoices: (params) => api.get('/api/payables/supplier-invoices/', { params }),
    getSupplierInvoice: (id) => api.get(`/api/payables/supplier-invoices/${id}/`),
    createSupplierInvoice: (data) => api.post('/api/payables/supplier-invoices/', data),
    updateSupplierInvoice: (id, data) => api.patch(`/api/payables/supplier-invoices/${id}/`, data),
    approveSupplierInvoice: (id) => api.post(`/api/payables/supplier-invoices/${id}/approve/`),
    postSupplierInvoice: (id) => api.post(`/api/payables/supplier-invoices/${id}/post/`),
    voidSupplierInvoice: (id, reason) => api.post(`/api/payables/supplier-invoices/${id}/void/`, { reason }),
    getOverdueInvoices: () => api.get('/api/payables/supplier-invoices/overdue/'),
    getAPAging: () => api.get('/api/payables/supplier-invoices/aging/'),
    getAPSummary: () => api.get('/api/payables/supplier-invoices/summary/'),

    // Payment Vouchers
    getPaymentVouchers: (params) => api.get('/api/payables/payment-vouchers/', { params }),
    getPaymentVoucher: (id) => api.get(`/api/payables/payment-vouchers/${id}/`),
    createPaymentVoucher: (data) => api.post('/api/payables/payment-vouchers/', data),
    updatePaymentVoucher: (id, data) => api.patch(`/api/payables/payment-vouchers/${id}/`, data),
    approvePaymentVoucher: (id, decision, comments) => api.post(`/api/payables/payment-vouchers/${id}/approve/`, { decision, comments }),
    payPaymentVoucher: (id) => api.post(`/api/payables/payment-vouchers/${id}/pay/`),
    voidPaymentVoucher: (id, reason) => api.post(`/api/payables/payment-vouchers/${id}/void/`, { reason }),
    getPendingApprovalVouchers: () => api.get('/api/payables/payment-vouchers/pending_approval/'),
    getVouchersByType: () => api.get('/api/payables/payment-vouchers/by_type/'),

    // Imprest Retirement
    getImprestRetirements: (params) => api.get('/api/payables/imprest-retirements/', { params }),
    getImprestRetirement: (id) => api.get(`/api/payables/imprest-retirements/${id}/`),
    createImprestRetirement: (data) => api.post('/api/payables/imprest-retirements/', data),
    approveImprestRetirement: (id) => api.post(`/api/payables/imprest-retirements/${id}/approve/`),
    postImprestRetirement: (id) => api.post(`/api/payables/imprest-retirements/${id}/post/`),
    getPendingRetirements: () => api.get('/api/payables/imprest-retirements/pending/'),

    // =========================================================================
    // LEGACY PAYABLES ENDPOINTS (kept for backward compatibility)
    // =========================================================================

    // Payables (Bills/Vendors) - Legacy
    getVendors: () => api.get('/api/payables/vendors/'),
    createVendor: (data) => api.post('/api/payables/vendors/', data),
    getBills: () => api.get('/api/payables/bills/'),
    createBill: (data) => api.post('/api/payables/bills/', data),

    // Finance Settings
    getSettings: () => api.get('/api/finance/settings/'),
    updateSettings: (data) => api.post('/api/finance/settings/', data),

    // Fiscal Periods
    getFiscalPeriods: () => api.get('/api/finance/fiscal-periods/'),
    createFiscalPeriod: (data) => api.post('/api/finance/fiscal-periods/', data),
    updateFiscalPeriod: (id, data) => api.patch(`/api/finance/fiscal-periods/${id}/`, data),

    // Taxes
    getTaxes: () => api.get('/api/finance/taxes/'),
    createTax: (data) => api.post('/api/finance/taxes/', data),
    updateTax: (id, data) => api.patch(`/api/finance/taxes/${id}/`, data),

    // Cashbooks
    getCashbooks: () => api.get('/api/finance/cashbooks/'),
    createCashbook: (data) => api.post('/api/finance/cashbooks/', data),
    updateCashbook: (id, data) => api.patch(`/api/finance/cashbooks/${id}/`, data),

    // Payment Methods
    getPaymentMethods: () => api.get('/api/finance/payment-methods/'),
    createPaymentMethod: (data) => api.post('/api/finance/payment-methods/', data),
    updatePaymentMethod: (id, data) => api.patch(`/api/finance/payment-methods/${id}/`, data),

    // Sponsor Types
    getSponsorTypes: () => api.get('/api/finance/sponsor-types/'),
    createSponsorType: (data) => api.post('/api/finance/sponsor-types/', data),
    updateSponsorType: (id, data) => api.patch(`/api/finance/sponsor-types/${id}/`, data),
    deleteSponsorType: (id) => api.delete(`/api/finance/sponsor-types/${id}/`),

    // Sponsorships
    getSponsorships: () => api.get('/api/finance/sponsorships/'),
    createSponsorship: (data) => api.post('/api/finance/sponsorships/', data),
    updateSponsorship: (id, data) => api.patch(`/api/finance/sponsorships/${id}/`, data),
    deleteSponsorship: (id) => api.delete(`/api/finance/sponsorships/${id}/`),
};
