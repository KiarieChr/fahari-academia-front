// Utility functions for Receipt Book Dashboard

/**
 * Generate next receipt number
 * @param {string} lastReceiptNumber - Last issued receipt number
 * @returns {string} Next receipt number
 */
export const generateReceiptNumber = (lastReceiptNumber = 'RCT-2026-0000') => {
    const parts = lastReceiptNumber.split('-');
    const year = parts[1];
    const number = parseInt(parts[2]) + 1;
    return `RCT-${year}-${number.toString().padStart(4, '0')}`;
};

/**
 * Get Bootstrap badge class for receipt status
 * @param {string} status - Receipt status
 * @returns {string} Bootstrap badge class
 */
export const getReceiptStatusBadge = (status) => {
    const badges = {
        'Draft': 'badge bg-secondary',
        'Issued': 'badge bg-primary',
        'Printed': 'badge bg-success',
        'Reversed': 'badge bg-danger'
    };
    return badges[status] || 'badge bg-secondary';
};

/**
 * Get icon for payment method
 * @param {string} method - Payment method
 * @returns {string} Icon name
 */
export const getPaymentMethodIcon = (method) => {
    const icons = {
        'Cash': '💵',
        'Bank': '🏦',
        'M-Pesa': '📱',
        'Cheque': '📝'
    };
    return icons[method] || '💰';
};

/**
 * Get color for payment method
 * @param {string} method - Payment method
 * @returns {string} Color class
 */
export const getPaymentMethodColor = (method) => {
    const colors = {
        'Cash': 'success',
        'Bank': 'primary',
        'M-Pesa': 'info',
        'Cheque': 'warning'
    };
    return colors[method] || 'secondary';
};

/**
 * Validate receipt data based on receipt type
 * @param {object} data - Receipt data
 * @param {string} type - Receipt type
 * @returns {object} Validation result {isValid, errors}
 */
export const validateReceiptData = (data, type) => {
    const errors = [];

    // Common validations
    if (!data.payerName || data.payerName.trim() === '') {
        errors.push('Payer name is required');
    }
    if (!data.amount || data.amount <= 0) {
        errors.push('Amount must be greater than zero');
    }
    if (!data.paymentMethod) {
        errors.push('Payment method is required');
    }
    if (data.paymentMethod !== 'Cash' && (!data.reference || data.reference.trim() === '')) {
        errors.push('Reference number is required for non-cash payments');
    }

    // Type-specific validations
    if (type === 'Student Fee' || type === 'Student Non-Fee') {
        if (!data.studentId) {
            errors.push('Student selection is required');
        }
    }

    if (type === 'Student Fee') {
        if (!data.feeCategory) {
            errors.push('Fee category is required');
        }
        if (!data.term) {
            errors.push('Term is required');
        }
        if (!data.year) {
            errors.push('Academic year is required');
        }
    }

    if (type === 'Student Non-Fee') {
        if (!data.nonFeeCategory) {
            errors.push('Non-fee category is required');
        }
        if (!data.description || data.description.trim() === '') {
            errors.push('Description is required');
        }
    }

    if (type === 'General') {
        if (!data.incomeAccount) {
            errors.push('Income account is required');
        }
        if (!data.description || data.description.trim() === '') {
            errors.push('Description is required');
        }
    }

    if (type === 'Sponsor') {
        if (!data.sponsorId) {
            errors.push('Sponsor selection is required');
        }
        if (!data.sponsorshipType) {
            errors.push('Sponsorship type is required');
        }
        if (!data.sponsoredStudents || data.sponsoredStudents.length === 0) {
            errors.push('At least one sponsored student is required');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Calculate total amount from receipts
 * @param {array} receipts - Array of receipts
 * @returns {number} Total amount
 */
export const calculateTotalAmount = (receipts) => {
    return receipts.reduce((sum, receipt) => {
        // Don't count reversed receipts
        if (receipt.status === 'Reversed') return sum;
        return sum + receipt.amount;
    }, 0);
};

/**
 * Filter receipts by date range
 * @param {array} receipts - Array of receipts
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {array} Filtered receipts
 */
export const filterReceiptsByDateRange = (receipts, startDate, endDate) => {
    if (!startDate && !endDate) return receipts;

    return receipts.filter(receipt => {
        const receiptDate = new Date(receipt.date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-12-31');
        return receiptDate >= start && receiptDate <= end;
    });
};

/**
 * Filter receipts by type
 * @param {array} receipts - Array of receipts
 * @param {string} type - Receipt type
 * @returns {array} Filtered receipts
 */
export const filterReceiptsByType = (receipts, type) => {
    if (!type || type === 'All') return receipts;
    return receipts.filter(receipt => receipt.receiptType === type);
};

/**
 * Filter receipts by payment method
 * @param {array} receipts - Array of receipts
 * @param {string} method - Payment method
 * @returns {array} Filtered receipts
 */
export const filterReceiptsByPaymentMethod = (receipts, method) => {
    if (!method || method === 'All') return receipts;
    return receipts.filter(receipt => receipt.paymentMethod === method);
};

/**
 * Filter receipts by status
 * @param {array} receipts - Array of receipts
 * @param {string} status - Receipt status
 * @returns {array} Filtered receipts
 */
export const filterReceiptsByStatus = (receipts, status) => {
    if (!status || status === 'All') return receipts;
    return receipts.filter(receipt => receipt.status === status);
};

/**
 * Search receipts by keyword
 * @param {array} receipts - Array of receipts
 * @param {string} keyword - Search keyword
 * @returns {array} Filtered receipts
 */
export const searchReceipts = (receipts, keyword) => {
    if (!keyword || keyword.trim() === '') return receipts;

    const searchTerm = keyword.toLowerCase();
    return receipts.filter(receipt => {
        return (
            receipt.receiptNumber.toLowerCase().includes(searchTerm) ||
            receipt.payerName.toLowerCase().includes(searchTerm) ||
            (receipt.studentName && receipt.studentName.toLowerCase().includes(searchTerm)) ||
            (receipt.admissionNo && receipt.admissionNo.toLowerCase().includes(searchTerm)) ||
            (receipt.reference && receipt.reference.toLowerCase().includes(searchTerm))
        );
    });
};

/**
 * Format receipt for printing
 * @param {object} receipt - Receipt object
 * @returns {object} Formatted receipt
 */
export const formatReceiptForPrint = (receipt) => {
    return {
        ...receipt,
        amountInWords: numberToWords(receipt.amount),
        formattedDate: formatDate(receipt.date),
        formattedAmount: formatKES(receipt.amount)
    };
};

/**
 * Check if user can reverse receipt
 * @param {object} receipt - Receipt object
 * @param {string} userRole - User role
 * @returns {boolean} Can reverse
 */
export const canReverseReceipt = (receipt, userRole) => {
    // Already reversed
    if (receipt.status === 'Reversed') return false;

    // Draft receipts can be deleted instead
    if (receipt.status === 'Draft') return false;

    // Only Bursar and Accountant can reverse
    if (!['Bursar', 'Accountant'].includes(userRole)) return false;

    // Check if receipt is too old (e.g., more than 30 days)
    const receiptDate = new Date(receipt.date);
    const today = new Date();
    const daysDiff = Math.floor((today - receiptDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) return false;

    return true;
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
 * Format date
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Format date and time
 * @param {string} dateString - Date string
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Convert number to words (simplified for Kenyan Shillings)
 * @param {number} amount - Amount
 * @returns {string} Amount in words
 */
export const numberToWords = (amount) => {
    // Simplified implementation - in production, use a library
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (amount === 0) return 'Zero Shillings Only';

    let words = '';

    // Millions
    if (amount >= 1000000) {
        const millions = Math.floor(amount / 1000000);
        words += ones[millions] + ' Million ';
        amount %= 1000000;
    }

    // Thousands
    if (amount >= 1000) {
        const thousands = Math.floor(amount / 1000);
        if (thousands >= 100) {
            words += ones[Math.floor(thousands / 100)] + ' Hundred ';
        }
        const remainingThousands = thousands % 100;
        if (remainingThousands >= 20) {
            words += tens[Math.floor(remainingThousands / 10)] + ' ';
            words += ones[remainingThousands % 10] + ' ';
        } else if (remainingThousands >= 10) {
            words += teens[remainingThousands - 10] + ' ';
        } else if (remainingThousands > 0) {
            words += ones[remainingThousands] + ' ';
        }
        words += 'Thousand ';
        amount %= 1000;
    }

    // Hundreds
    if (amount >= 100) {
        words += ones[Math.floor(amount / 100)] + ' Hundred ';
        amount %= 100;
    }

    // Tens and ones
    if (amount >= 20) {
        words += tens[Math.floor(amount / 10)] + ' ';
        words += ones[amount % 10] + ' ';
    } else if (amount >= 10) {
        words += teens[amount - 10] + ' ';
    } else if (amount > 0) {
        words += ones[amount] + ' ';
    }

    return words.trim() + ' Shillings Only';
};

/**
 * Get receipt type badge color
 * @param {string} type - Receipt type
 * @returns {string} Badge color class
 */
export const getReceiptTypeBadge = (type) => {
    const badges = {
        'Student Fee': 'badge bg-primary',
        'Student Non-Fee': 'badge bg-info',
        'General': 'badge bg-secondary',
        'Sponsor': 'badge bg-success'
    };
    return badges[type] || 'badge bg-secondary';
};

/**
 * Calculate receipt statistics
 * @param {array} receipts - Array of receipts
 * @returns {object} Statistics
 */
export const calculateReceiptStatistics = (receipts) => {
    const activeReceipts = receipts.filter(r => r.status !== 'Reversed');

    const byType = {
        'Student Fee': activeReceipts.filter(r => r.receiptType === 'Student Fee'),
        'Student Non-Fee': activeReceipts.filter(r => r.receiptType === 'Student Non-Fee'),
        'General': activeReceipts.filter(r => r.receiptType === 'General'),
        'Sponsor': activeReceipts.filter(r => r.receiptType === 'Sponsor')
    };

    const byPaymentMethod = {
        'Cash': activeReceipts.filter(r => r.paymentMethod === 'Cash'),
        'Bank': activeReceipts.filter(r => r.paymentMethod === 'Bank'),
        'M-Pesa': activeReceipts.filter(r => r.paymentMethod === 'M-Pesa'),
        'Cheque': activeReceipts.filter(r => r.paymentMethod === 'Cheque')
    };

    return {
        total: {
            count: activeReceipts.length,
            amount: calculateTotalAmount(activeReceipts)
        },
        byType: Object.keys(byType).reduce((acc, type) => {
            acc[type] = {
                count: byType[type].length,
                amount: calculateTotalAmount(byType[type])
            };
            return acc;
        }, {}),
        byPaymentMethod: Object.keys(byPaymentMethod).reduce((acc, method) => {
            acc[method] = {
                count: byPaymentMethod[method].length,
                amount: calculateTotalAmount(byPaymentMethod[method])
            };
            return acc;
        }, {})
    };
};

/**
 * Get today's receipts
 * @param {array} receipts - Array of receipts
 * @returns {array} Today's receipts
 */
export const getTodayReceipts = (receipts) => {
    const today = new Date().toISOString().split('T')[0];
    return receipts.filter(receipt => receipt.date === today);
};

/**
 * Sort receipts
 * @param {array} receipts - Array of receipts
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction (asc/desc)
 * @returns {array} Sorted receipts
 */
export const sortReceipts = (receipts, field, direction = 'desc') => {
    return [...receipts].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Handle date fields
        if (field === 'date' || field === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        // Handle numeric fields
        if (field === 'amount') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }

        if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
};
