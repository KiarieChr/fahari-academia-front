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

// Expense account keyword mappings for auto-suggestion
export const EXPENSE_ACCOUNT_KEYWORDS = {
    'hosting': ['hosting', 'internet', 'web hosting', 'server', 'cloud'],
    'internet': ['hosting', 'internet', 'web hosting', 'bandwidth', 'connectivity'],
    'web': ['hosting', 'internet', 'web hosting'],
    'server': ['hosting', 'internet', 'server', 'cloud'],
    'cloud': ['hosting', 'cloud', 'server', 'aws', 'azure'],
    'electricity': ['electricity', 'power', 'utility', 'utilities'],
    'power': ['electricity', 'power', 'utility'],
    'water': ['water', 'utility', 'utilities'],
    'utility': ['utility', 'utilities', 'electricity', 'water'],
    'phone': ['telephone', 'phone', 'communication', 'airtime'],
    'telephone': ['telephone', 'phone', 'communication'],
    'airtime': ['telephone', 'phone', 'airtime', 'communication'],
    'mobile': ['telephone', 'mobile', 'phone'],
    'transport': ['transport', 'travel', 'fuel', 'vehicle'],
    'travel': ['travel', 'transport', 'accommodation'],
    'fuel': ['fuel', 'transport', 'vehicle', 'petrol', 'diesel'],
    'vehicle': ['vehicle', 'transport', 'fuel', 'motor'],
    'stationery': ['stationery', 'office', 'supplies', 'printing'],
    'office': ['office', 'stationery', 'supplies'],
    'printing': ['printing', 'stationery', 'office'],
    'supplies': ['supplies', 'stationery', 'office'],
    'repair': ['repair', 'maintenance', 'service'],
    'maintenance': ['maintenance', 'repair', 'service'],
    'service': ['service', 'maintenance', 'repair'],
    'food': ['food', 'catering', 'meals', 'kitchen'],
    'catering': ['catering', 'food', 'meals'],
    'meals': ['meals', 'food', 'catering'],
    'kitchen': ['kitchen', 'food', 'catering'],
    'cleaning': ['cleaning', 'sanitation', 'janitorial'],
    'sanitation': ['sanitation', 'cleaning'],
    'security': ['security', 'guard', 'surveillance'],
    'guard': ['security', 'guard'],
    'training': ['training', 'professional development', 'workshop'],
    'workshop': ['workshop', 'training', 'seminar'],
    'seminar': ['seminar', 'training', 'workshop'],
    'insurance': ['insurance', 'premium'],
    'rent': ['rent', 'lease', 'rental'],
    'lease': ['lease', 'rent', 'rental'],
    'bank': ['bank charge', 'bank fee', 'transaction fee'],
    'subscription': ['subscription', 'license', 'software'],
    'license': ['license', 'subscription', 'software'],
    'software': ['software', 'subscription', 'license'],
};

export const VAT_RATES = [
    { value: 0, label: '0% (Exempt)' },
    { value: 8, label: '8% (Reduced)' },
    { value: 16, label: '16% (Standard)' }
];

// Export CSV utility
export const exportToCSV = (data, headers, filename) => {
    const csvRows = [headers.map(h => h.label).join(',')];
    data.forEach(row => {
        csvRows.push(headers.map(h => {
            const val = typeof h.accessor === 'function' ? h.accessor(row) : row[h.accessor];
            const str = String(val ?? '').replace(/"/g, '""');
            return `"${str}"`;
        }).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};
