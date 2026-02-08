// Utility functions for formatting

// Format currency in KES
export const formatKES = (amount) => {
    if (amount === null || amount === undefined) return 'KES 0.00';
    return `KES ${parseFloat(amount).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
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

// Get status badge class
export const getStatusBadgeClass = (status) => {
    const statusMap = {
        'Paid': 'ap-badge ap-badge-paid',
        'Approved': 'ap-badge ap-badge-approved',
        'Pending': 'ap-badge ap-badge-pending',
        'Pending Approval': 'ap-badge ap-badge-pending',
        'Overdue': 'ap-badge ap-badge-overdue',
        'Overpaid': 'ap-badge ap-badge-overdue',
        'Partial': 'ap-badge ap-badge-pending',
        'Posted': 'ap-badge ap-badge-approved',
        'Unposted': 'ap-badge ap-badge-pending'
    };
    return statusMap[status] || 'ap-badge';
};

// Calculate days until due
export const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Check if overdue
export const isOverdue = (dueDate) => {
    const days = getDaysUntilDue(dueDate);
    return days !== null && days < 0;
};

// Generate voucher number
export const generateVoucherNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PV-${year}-${random}`;
};

// Validate voucher balance
export const validateVoucherBalance = (lineItems) => {
    const total = lineItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    return total > 0;
};
