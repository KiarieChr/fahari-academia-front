// Utility functions for Fee Structure Management

/**
 * Calculate total term fee from fee items
 * @param {array} feeItems - Array of fee items
 * @param {string} appliesTo - Filter by applies to (optional)
 * @returns {number} Total fee amount
 */
export const calculateTotalTermFee = (feeItems, appliesTo = null) => {
    return feeItems
        .filter(item => item.status === 'Active')
        .filter(item => !appliesTo || item.appliesTo === appliesTo || item.appliesTo === 'All Students')
        .reduce((sum, item) => {
            // Only count termly and once fees for term total
            if (item.frequency === 'Termly' || item.frequency === 'Once' || item.frequency === 'One Time') {
                return sum + item.amount;
            }
            // Annual fees are divided by 3 terms
            if (item.frequency === 'Annual') {
                return sum + (item.amount / 3);
            }
            return sum;
        }, 0);
};

/**
 * Calculate annual fee total
 * @param {array} feeItems - Array of fee items
 * @returns {number} Annual total
 */
export const calculateAnnualFee = (feeItems) => {
    return feeItems
        .filter(item => item.status === 'Active')
        .reduce((sum, item) => {
            if (item.frequency === 'Annual' || item.frequency === 'Once' || item.frequency === 'One Time') {
                return sum + item.amount;
            }
            if (item.frequency === 'Termly') {
                return sum + (item.amount * 3);
            }
            return sum;
        }, 0);
};

/**
 * Calculate mandatory vs optional fee breakdown
 * @param {array} feeItems - Array of fee items
 * @returns {object} {mandatory, optional}
 */
export const calculateMandatoryOptionalBreakdown = (feeItems) => {
    const mandatory = calculateTotalTermFee(feeItems.filter(item => item.mandatory));
    const optional = calculateTotalTermFee(feeItems.filter(item => !item.mandatory));
    return { mandatory, optional };
};

/**
 * Validate fee structure
 * @param {object} feeStructure - Fee structure object
 * @param {array} feeItems - Array of fee items
 * @param {array} incomeAccounts - List of income accounts
 * @returns {object} {isValid, errors, warnings}
 */
export const validateFeeStructure = (feeStructure, feeItems, incomeAccounts = []) => {
    const errors = [];
    const warnings = [];

    // Check if fee structure has items
    if (!feeItems || feeItems.length === 0) {
        errors.push('Fee structure must have at least one fee item');
    }

    // Check for missing CoA mappings
    const unmappedItems = feeItems.filter(item => !item.accountId);
    if (unmappedItems.length > 0) {
        errors.push(`${unmappedItems.length} fee item(s) missing Chart of Accounts mapping`);
    }

    // Check for inactive accounts
    const inactiveAccounts = feeItems.filter(item => {
        const account = incomeAccounts.find(acc => acc.id === item.accountId);
        return account && account.status === 'Inactive';
    });
    if (inactiveAccounts.length > 0) {
        warnings.push(`${inactiveAccounts.length} fee item(s) linked to inactive accounts`);
    }

    // Check for duplicate fee items
    const itemNames = feeItems.map(item => item.name.toLowerCase());
    const duplicates = itemNames.filter((name, index) => itemNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
        warnings.push('Duplicate fee item names detected');
    }

    // Check if total fee is reasonable
    const total = calculateTotalTermFee(feeItems);
    if (total === 0) {
        errors.push('Total term fee cannot be zero');
    }
    if (total > 200000) {
        warnings.push('Total term fee exceeds KES 200,000 - please verify');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Check if account mapping is valid
 * @param {string} accountId - Account ID
 * @param {string} feeCategory - Fee category
 * @param {array} incomeAccounts - List of accounts
 * @param {array} feeCategories - List of categories
 * @returns {object} {isValid, message, account}
 */
export const checkAccountMapping = (accountId, feeCategory, incomeAccounts = [], feeCategories = []) => {
    const account = incomeAccounts.find(acc => acc.id == accountId);

    if (!account) {
        return { isValid: false, message: 'Account not found', account: null };
    }

    if (!account.is_active) {
        return { isValid: false, message: 'Account is inactive', account };
    }

    // Relaxed check: API might filter type already, but good to check
    // Ensure we handle case sensitivity if needed
    if (account.type?.toLowerCase() !== 'income') {
        return { isValid: false, message: 'Account must be an Income account', account };
    }

    // Check suggested mapping
    const category = feeCategories.find(cat => cat.id === feeCategory);
    if (category && category.suggestedAccount && category.suggestedAccount !== account.code) {
        return {
            isValid: true,
            message: `Suggested account for ${category.name} is ${category.suggestedAccount}`,
            account,
            warning: true
        };
    }

    return { isValid: true, message: 'Valid mapping', account };
};

/**
 * Get category badge class
 * @param {string} categoryId - Category ID
 * @param {array} feeCategories - List of categories
 * @returns {string} Badge class
 */
export const getCategoryBadge = (categoryId, feeCategories = []) => {
    const category = feeCategories.find(cat => cat.id === categoryId);
    return category ? `badge bg-${category.color}` : 'badge bg-secondary';
};

/**
 * Copy fee structure to another class/term/year
 * @param {object} sourceFeeStructure - Source fee structure
 * @param {array} sourceFeeItems - Source fee items
 * @param {object} destination - {classId, term, academicYear}
 * @param {number} percentageIncrease - Optional percentage increase (e.g., 10 for 10%)
 * @returns {object} {newStructure, newFeeItems}
 */
export const copyFeeStructure = (sourceFeeStructure, sourceFeeItems, destination, percentageIncrease = 0) => {
    const newStructure = {
        ...sourceFeeStructure,
        id: `FS-${Date.now()}`,
        classId: destination.classId,
        className: destination.className,
        term: destination.term,
        academicYear: destination.academicYear,
        status: 'Draft',
        version: 1,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        activatedAt: null,
        billingStarted: false
    };

    const multiplier = 1 + (percentageIncrease / 100);

    const newFeeItems = sourceFeeItems.map((item, index) => ({
        ...item,
        id: `FI-${Date.now()}-${index}`,
        structureId: newStructure.id,
        amount: Math.round(item.amount * multiplier)
    }));

    return { newStructure, newFeeItems };
};

/**
 * Apply percentage increase to fee items
 * @param {array} feeItems - Array of fee items
 * @param {number} percentage - Percentage increase
 * @returns {array} Updated fee items
 */
export const applyPercentageIncrease = (feeItems, percentage) => {
    const multiplier = 1 + (percentage / 100);
    return feeItems.map(item => ({
        ...item,
        amount: Math.round(item.amount * multiplier)
    }));
};



/**
 * Compare fee structures (year-over-year)
 * @param {array} currentFeeItems - Current year fee items
 * @param {array} previousFeeItems - Previous year fee items
 * @returns {object} Comparison data
 */
export const compareFeeStructures = (currentFeeItems, previousFeeItems) => {
    const currentTotal = calculateTotalTermFee(currentFeeItems);
    const previousTotal = calculateTotalTermFee(previousFeeItems);
    const difference = currentTotal - previousTotal;
    const percentageChange = previousTotal > 0 ? ((difference / previousTotal) * 100) : 0;

    const itemComparisons = currentFeeItems.map(currentItem => {
        const previousItem = previousFeeItems.find(item => item.name === currentItem.name);
        if (previousItem) {
            const itemDiff = currentItem.amount - previousItem.amount;
            const itemPercent = previousItem.amount > 0 ? ((itemDiff / previousItem.amount) * 100) : 0;
            return {
                name: currentItem.name,
                current: currentItem.amount,
                previous: previousItem.amount,
                difference: itemDiff,
                percentageChange: itemPercent
            };
        }
        return {
            name: currentItem.name,
            current: currentItem.amount,
            previous: 0,
            difference: currentItem.amount,
            percentageChange: 100,
            isNew: true
        };
    });

    return {
        currentTotal,
        previousTotal,
        difference,
        percentageChange,
        itemComparisons
    };
};

/**
 * Calculate expected revenue
 * @param {array} feeItems - Array of fee items
 * @param {number} studentCount - Number of students
 * @param {string} appliesTo - Filter by applies to
 * @returns {number} Expected revenue
 */
export const calculateExpectedRevenue = (feeItems, studentCount, appliesTo = 'All Students') => {
    const totalFee = calculateTotalTermFee(feeItems, appliesTo);
    return totalFee * studentCount;
};

/**
 * Get fee items for a structure
 * @param {string} structureId - Fee structure ID
 * @returns {array} Fee items
 */
export const getFeeItemsForStructure = (structureId) => {
    return mockFeeItems.filter(item => item.structureId === structureId);
};

/**
 * Format currency in KES
 * @param {number} amount - Amount
 * @returns {string} Formatted amount
 */
export const formatKES = (amount) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Get status badge class
 * @param {string} status - Status
 * @returns {string} Badge class
 */
export const getStatusBadge = (status) => {
    const badges = {
        'Draft': 'badge bg-secondary',
        'Active': 'badge bg-success',
        'Archived': 'badge bg-warning'
    };
    return badges[status] || 'badge bg-secondary';
};



/**
 * Check if fee structure can be edited
 * @param {object} feeStructure - Fee structure
 * @returns {boolean} Can edit
 */
export const canEditFeeStructure = (feeStructure) => {
    // Cannot edit if billing has started
    if (feeStructure.billingStarted) {
        return false;
    }
    // Cannot edit if archived
    if (feeStructure.status === 'Archived') {
        return false;
    }
    return true;
};

/**
 * Check if fee structure can be activated
 * @param {object} feeStructure - Fee structure
 * @param {array} feeItems - Fee items
 * @returns {object} {canActivate, reason}
 */
export const canActivateFeeStructure = (feeStructure, feeItems, incomeAccounts = []) => {
    if (feeStructure.status === 'Active') {
        return { canActivate: false, reason: 'Fee structure is already active' };
    }

    if (feeStructure.status === 'Archived') {
        return { canActivate: false, reason: 'Cannot activate archived fee structure' };
    }

    const validation = validateFeeStructure(feeStructure, feeItems, incomeAccounts);
    if (!validation.isValid) {
        return { canActivate: false, reason: validation.errors.join(', ') };
    }

    if (feeItems.length === 0) {
        return { canActivate: false, reason: 'Fee structure must have at least one fee item' };
    }

    return { canActivate: true, reason: null };
};

/**
 * Filter fee structures
 * @param {array} structures - Array of fee structures
 * @param {object} filters - Filter criteria
 * @returns {array} Filtered structures
 */
export const filterFeeStructures = (structures, filters) => {
    return structures.filter(structure => {
        if (filters.classId && structure.classId !== filters.classId) return false;
        if (filters.academicYear && structure.academicYear !== filters.academicYear) return false;
        if (filters.term && structure.term !== filters.term) return false;
        if (filters.status && structure.status !== filters.status) return false;
        return true;
    });
};

/**
 * Sort fee items by order
 * @param {array} feeItems - Array of fee items
 * @returns {array} Sorted fee items
 */
export const sortFeeItems = (feeItems) => {
    return [...feeItems].sort((a, b) => a.order - b.order);
};
