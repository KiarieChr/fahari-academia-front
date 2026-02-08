// Budget Utility Functions

// Format currency in KES
export const formatKES = (amount) => {
    if (amount === null || amount === undefined) return 'KES 0.00';
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount).replace('KES', 'KES ');
};

// Format percentage
export const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    return `${parseFloat(value).toFixed(1)}%`;
};

// Calculate budget utilization percentage
export const calculateUtilization = (spent, budget) => {
    if (!budget || budget === 0) return 0;
    return ((spent / budget) * 100).toFixed(1);
};

// Calculate remaining budget
export const calculateRemaining = (budget, spent) => {
    return budget - spent;
};

// Get status based on utilization
export const getStatusFromUtilization = (utilization) => {
    if (utilization > 100) return 'Over Budget';
    if (utilization >= 90) return 'Warning';
    if (utilization >= 80) return 'Monitor';
    return 'Within Budget';
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
    const statusMap = {
        'Within Budget': 'badge bg-success',
        'Monitor': 'badge bg-info',
        'Warning': 'badge bg-warning',
        'Over Budget': 'badge bg-danger',
        'Pending': 'badge bg-secondary'
    };
    return statusMap[status] || 'badge bg-secondary';
};

// Get status color for charts
export const getStatusColor = (status) => {
    const colorMap = {
        'Within Budget': '#10b981',
        'Monitor': '#3b82f6',
        'Warning': '#f59e0b',
        'Over Budget': '#ef4444',
        'Pending': '#6b7280'
    };
    return colorMap[status] || '#6b7280';
};

// Get utilization color
export const getUtilizationColor = (utilization) => {
    if (utilization > 100) return '#ef4444'; // Red
    if (utilization >= 90) return '#f59e0b'; // Orange
    if (utilization >= 80) return '#3b82f6'; // Blue
    return '#10b981'; // Green
};

// Format date
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Calculate total from array
export const calculateTotal = (items, field) => {
    return items.reduce((sum, item) => sum + (item[field] || 0), 0);
};

// Filter by term and year
export const filterByPeriod = (items, term, year) => {
    return items.filter(item => {
        const matchesTerm = !term || term === 'All' || item.term === term;
        const matchesYear = !year || year === 'All' || item.year === year;
        return matchesTerm && matchesYear;
    });
};

// Search filter
export const searchFilter = (items, searchTerm, fields) => {
    if (!searchTerm) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item =>
        fields.some(field =>
            item[field]?.toString().toLowerCase().includes(lowerSearch)
        )
    );
};

// Sort items
export const sortItems = (items, field, direction = 'asc') => {
    return [...items].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (typeof aVal === 'string') {
            return direction === 'asc'
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        return direction === 'asc'
            ? aVal - bVal
            : bVal - aVal;
    });
};

// Generate voucher number
export const generateVoucherNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PV-${year}-${random}`;
};

// Validate budget amount
export const validateBudgetAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
};

// Calculate budget variance
export const calculateVariance = (budget, actual) => {
    return actual - budget;
};

// Get variance percentage
export const getVariancePercentage = (budget, actual) => {
    if (!budget || budget === 0) return 0;
    return (((actual - budget) / budget) * 100).toFixed(1);
};

// Check if over budget
export const isOverBudget = (spent, budget) => {
    return spent > budget;
};

// Check if approaching limit
export const isApproachingLimit = (spent, budget, threshold = 90) => {
    const utilization = (spent / budget) * 100;
    return utilization >= threshold && utilization <= 100;
};

// Get alert severity
export const getAlertSeverity = (utilization) => {
    if (utilization > 100) return 'high';
    if (utilization >= 95) return 'medium';
    if (utilization >= 85) return 'low';
    return 'info';
};

// Export to CSV (mock)
export const exportToCSV = (data, filename) => {
    console.log(`Exporting ${filename}.csv with ${data.length} rows`);
    // In real implementation, this would generate and download CSV
    return true;
};

// Export to Excel (mock)
export const exportToExcel = (data, filename) => {
    console.log(`Exporting ${filename}.xlsx with ${data.length} rows`);
    // In real implementation, this would generate and download Excel
    return true;
};

// Export to PDF (mock)
export const exportToPDF = (data, filename) => {
    console.log(`Exporting ${filename}.pdf`);
    // In real implementation, this would generate and download PDF
    return true;
};
