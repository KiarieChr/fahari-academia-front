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


    // Invoicing (Customers)
    getCustomers: () => api.get('/api/invoicing/customers/'),
    createCustomer: (data) => api.post('/api/invoicing/customers/', data),
    getInvoices: () => api.get('/api/invoicing/invoices/'),
    createInvoice: (data) => api.post('/api/invoicing/invoices/', data),

    // Payables (Bills/Vendors)
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
};
