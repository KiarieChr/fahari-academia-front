// Banking Utility Functions for School ERP Budgeting Dashboard

/**
 * Calculate deposit variance between planned and actual amounts
 * @param {number} planned - Total planned deposits
 * @param {number} actual - Total actual banked amount
 * @returns {object} - { amount, percentage, isPositive }
 */
export const calculateDepositVariance = (planned, actual) => {
    const amount = actual - planned;
    const percentage = planned > 0 ? ((amount / planned) * 100).toFixed(1) : 0;
    return {
        amount,
        percentage,
        isPositive: amount >= 0
    };
};

/**
 * Get Bootstrap badge class for cash deposit status
 * @param {string} status - Deposit status (Planned, Banked, Delayed)
 * @returns {string} - Bootstrap badge class
 */
export const getCashDepositStatusBadge = (status) => {
    const statusMap = {
        'Planned': 'bg-primary',
        'Banked': 'bg-success',
        'Delayed': 'bg-warning'
    };
    return statusMap[status] || 'bg-secondary';
};

/**
 * Get Bootstrap badge class for cheque deposit status
 * @param {string} status - Cheque status (Received, Deposited, Cleared, Bounced)
 * @returns {string} - Bootstrap badge class
 */
export const getChequeDepositStatusBadge = (status) => {
    const statusMap = {
        'Received': 'bg-info',
        'Deposited': 'bg-warning',
        'Cleared': 'bg-success',
        'Bounced': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
};

/**
 * Get color code for cheque status (for timeline indicators)
 * @param {string} status - Cheque status
 * @returns {string} - Hex color code
 */
export const getChequeStatusColor = (status) => {
    const colorMap = {
        'Received': '#3b82f6',
        'Deposited': '#f59e0b',
        'Cleared': '#10b981',
        'Bounced': '#ef4444'
    };
    return colorMap[status] || '#6b7280';
};

/**
 * Calculate cash flow gap between deposits and budget obligations
 * @param {array} deposits - Array of deposit objects
 * @param {array} budgetObligations - Array of budget obligation objects
 * @param {string} month - Month to analyze
 * @returns {object} - { gap, hasShortfall, percentage }
 */
export const calculateCashFlowGap = (deposits, budgetObligations, month) => {
    const totalDeposits = deposits
        .filter(d => d.month === month)
        .reduce((sum, d) => sum + d.amount, 0);

    const totalObligations = budgetObligations
        .filter(b => b.month === month)
        .reduce((sum, b) => sum + b.amount, 0);

    const gap = totalDeposits - totalObligations;
    const percentage = totalObligations > 0 ? ((gap / totalObligations) * 100).toFixed(1) : 0;

    return {
        gap,
        hasShortfall: gap < 0,
        percentage,
        totalDeposits,
        totalObligations
    };
};

/**
 * Check if a deposit is overdue
 * @param {string} expectedDate - Expected banking/clearing date (YYYY-MM-DD)
 * @param {string} status - Current deposit status
 * @returns {boolean} - True if overdue
 */
export const isDepositOverdue = (expectedDate, status) => {
    if (status === 'Banked' || status === 'Cleared') {
        return false; // Already completed
    }

    const expected = new Date(expectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expected.setHours(0, 0, 0, 0);

    return expected < today;
};

/**
 * Calculate number of days overdue
 * @param {string} expectedDate - Expected date (YYYY-MM-DD)
 * @returns {number} - Days overdue (negative if not yet due)
 */
export const getDaysOverdue = (expectedDate) => {
    const expected = new Date(expectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expected.setHours(0, 0, 0, 0);

    const diffTime = today - expected;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Calculate budget coverage percentage
 * @param {number} totalBanked - Total actual banked amount
 * @param {number} totalBudget - Total approved budget
 * @returns {number} - Coverage percentage
 */
export const calculateBudgetCoverage = (totalBanked, totalBudget) => {
    if (totalBudget === 0) return 0;
    return ((totalBanked / totalBudget) * 100).toFixed(1);
};

/**
 * Filter deposits by period (term and year)
 * @param {array} deposits - Array of deposit objects
 * @param {string} term - Term filter (e.g., 'Term 1')
 * @param {string} year - Year filter (e.g., '2026')
 * @returns {array} - Filtered deposits
 */
export const filterDepositsByPeriod = (deposits, term, year) => {
    return deposits.filter(deposit => {
        const matchesTerm = !term || deposit.term === term;
        const matchesYear = !year || deposit.year === year;
        return matchesTerm && matchesYear;
    });
};

/**
 * Filter deposits by status
 * @param {array} deposits - Array of deposit objects
 * @param {string} status - Status filter
 * @returns {array} - Filtered deposits
 */
export const filterDepositsByStatus = (deposits, status) => {
    if (!status || status === 'All') return deposits;
    return deposits.filter(deposit => deposit.status === status);
};

/**
 * Filter deposits by source
 * @param {array} deposits - Array of deposit objects
 * @param {string} source - Source filter
 * @returns {array} - Filtered deposits
 */
export const filterDepositsBySource = (deposits, source) => {
    if (!source || source === 'All') return deposits;
    return deposits.filter(deposit => deposit.source === source);
};

/**
 * Format deposit source for display
 * @param {string} source - Source code
 * @returns {string} - Formatted source label
 */
export const formatDepositSource = (source) => {
    const sourceMap = {
        'Fees': '📚 Fees',
        'Sponsors': '🤝 Sponsors',
        'Events': '🎉 Events',
        'Donations': '💝 Donations',
        'Government Grants': '🏛️ Government Grants',
        'Other': '📋 Other'
    };
    return sourceMap[source] || source;
};

/**
 * Calculate total deposits by status
 * @param {array} deposits - Array of deposit objects
 * @param {string} status - Status to sum
 * @returns {number} - Total amount
 */
export const getTotalByStatus = (deposits, status) => {
    return deposits
        .filter(d => d.status === status)
        .reduce((sum, d) => sum + d.amount, 0);
};

/**
 * Calculate total cheques by status
 * @param {array} cheques - Array of cheque objects
 * @param {string} status - Status to sum
 * @returns {number} - Total amount
 */
export const getChequeTotalByStatus = (cheques, status) => {
    return cheques
        .filter(c => c.status === status)
        .reduce((sum, c) => sum + c.amount, 0);
};

/**
 * Get suggested deposit target based on budget obligations
 * @param {number} budgetObligations - Total budget obligations for period
 * @param {number} currentDeposits - Current planned deposits
 * @param {number} targetCoverage - Target coverage percentage (default 60%)
 * @returns {object} - { suggestedTarget, additionalNeeded, currentCoverage }
 */
export const getSuggestedDepositTarget = (budgetObligations, currentDeposits, targetCoverage = 60) => {
    const suggestedTarget = (budgetObligations * targetCoverage) / 100;
    const additionalNeeded = Math.max(0, suggestedTarget - currentDeposits);
    const currentCoverage = budgetObligations > 0 ? ((currentDeposits / budgetObligations) * 100).toFixed(1) : 0;

    return {
        suggestedTarget,
        additionalNeeded,
        currentCoverage
    };
};

/**
 * Sort deposits by date
 * @param {array} deposits - Array of deposit objects
 * @param {string} dateField - Field to sort by (e.g., 'expectedBankingDate')
 * @param {string} order - 'asc' or 'desc'
 * @returns {array} - Sorted deposits
 */
export const sortDepositsByDate = (deposits, dateField, order = 'asc') => {
    return [...deposits].sort((a, b) => {
        const dateA = new Date(a[dateField]);
        const dateB = new Date(b[dateField]);
        return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
};

/**
 * Format date for display
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @returns {string} - Formatted date (DD/MM/YYYY)
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Search deposits by keyword
 * @param {array} deposits - Array of deposit objects
 * @param {string} keyword - Search keyword
 * @returns {array} - Filtered deposits
 */
export const searchDeposits = (deposits, keyword) => {
    if (!keyword) return deposits;

    const lowerKeyword = keyword.toLowerCase();
    return deposits.filter(deposit => {
        return (
            deposit.source?.toLowerCase().includes(lowerKeyword) ||
            deposit.notes?.toLowerCase().includes(lowerKeyword) ||
            deposit.linkedCashbook?.toLowerCase().includes(lowerKeyword) ||
            deposit.amount?.toString().includes(keyword)
        );
    });
};

/**
 * Search cheques by keyword
 * @param {array} cheques - Array of cheque objects
 * @param {string} keyword - Search keyword
 * @returns {array} - Filtered cheques
 */
export const searchCheques = (cheques, keyword) => {
    if (!keyword) return cheques;

    const lowerKeyword = keyword.toLowerCase();
    return cheques.filter(cheque => {
        return (
            cheque.chequeNumber?.toLowerCase().includes(lowerKeyword) ||
            cheque.drawerName?.toLowerCase().includes(lowerKeyword) ||
            cheque.bankName?.toLowerCase().includes(lowerKeyword) ||
            cheque.notes?.toLowerCase().includes(lowerKeyword) ||
            cheque.amount?.toString().includes(keyword)
        );
    });
};
