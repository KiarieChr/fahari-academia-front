/**
 * Utility functions for Student Invoices
 */

import { mockFeeStructures } from '../../fee-structure/data/mockFeeStructureData';
import { mockStudents } from '../../receipt-book/data/mockReceiptData';

/**
 * Format currency in KES
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
 * Calculate invoice status based on payment
 */
export const calculateInvoiceStatus = (total, paid, dueDate) => {
    if (paid >= total) return 'Paid';
    if (paid > 0) return 'Partial';

    // Check overdue
    const today = new Date();
    const due = new Date(dueDate);
    if (today > due) return 'Overdue';

    return 'Unpaid';
};

/**
 * Filter invoices
 */
export const filterInvoices = (invoices, filters) => {
    return invoices.filter(inv => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchName = inv.studentName.toLowerCase().includes(searchLower);
            const matchAdm = inv.admissionNumber.toLowerCase().includes(searchLower);
            const matchInv = inv.id.toLowerCase().includes(searchLower);
            if (!matchName && !matchAdm && !matchInv) return false;
        }

        if (filters.classId && inv.classId !== filters.classId) return false;
        if (filters.term && inv.term !== filters.term) return false;
        if (filters.year && inv.year !== filters.year) return false;
        if (filters.status && inv.status !== filters.status) return false;

        return true;
    });
};

/**
 * Generate invoices from active fee structure
 * @param {string} structureId - ID of fee structure
 * @param {Array} selectedStudentIds - Optional array of student IDs (if empty, generates for all applicable)
 */
export const generateInvoicesFromStructure = (structureId, selectedStudentIds = []) => {
    const structure = mockFeeStructures.find(fs => fs.id === structureId);
    if (!structure) throw new Error('Fee Structure not found');

    const applicableStudents = mockStudents.filter(s => {
        if (s.classId !== structure.classId) return false;
        if (selectedStudentIds.length > 0 && !selectedStudentIds.includes(s.id)) return false;
        return true;
    });

    const newInvoices = applicableStudents.map((student, index) => {
        // Calculate items based on "Applies To"
        const validItems = structure.feeItems.filter(item => {
            if (item.appliesTo === 'All Students') return true;
            if (item.appliesTo === 'Boarders Only' && student.type === 'Boarder') return true;
            if (item.appliesTo === 'Day Scholars Only' && student.type === 'Day Scholar') return true;
            return false;
        });

        const totalAmount = validItems.reduce((sum, item) => sum + item.amount, 0);

        return {
            id: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            studentId: student.id,
            studentName: student.name,
            admissionNumber: student.admissionNumber,
            classId: student.classId,
            className: student.className,
            stream: student.stream,
            term: structure.term,
            year: structure.academicYear,
            dateIssued: new Date().toISOString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            totalAmount: totalAmount,
            paidAmount: 0,
            balance: totalAmount,
            status: 'Unpaid',
            items: validItems.map(item => ({
                id: `ITEM-${Date.now()}-${index}`,
                name: item.name,
                amount: item.amount,
                accountId: item.accountId
            })),
            generatedBy: 'Auto',
            generatedAt: new Date().toISOString(),
            remarks: `Generated from ${structure.id} (${structure.term} ${structure.academicYear})`
        };
    });

    return newInvoices;
};

/**
 * Get Term Summary Statistics
 */
export const getTermSummary = (invoices, term, year) => {
    const filtered = invoices.filter(inv =>
        (!term || inv.term === term) &&
        (!year || inv.year === year)
    );

    const stats = {
        totalInvoiced: 0,
        totalCollected: 0,
        invoiceCount: filtered.length,
        classBreakdown: {}
    };

    filtered.forEach(inv => {
        stats.totalInvoiced += inv.totalAmount;
        stats.totalCollected += inv.paidAmount;

        // Class breakdown
        if (!stats.classBreakdown[inv.className]) {
            stats.classBreakdown[inv.className] = { invoiced: 0, collected: 0, count: 0 };
        }
        stats.classBreakdown[inv.className].invoiced += inv.totalAmount;
        stats.classBreakdown[inv.className].collected += inv.paidAmount;
        stats.classBreakdown[inv.className].count += 1;
    });

    stats.totalOutstanding = stats.totalInvoiced - stats.totalCollected;
    stats.collectionRate = stats.totalInvoiced > 0 ? (stats.totalCollected / stats.totalInvoiced) * 100 : 0;

    return stats;
};

/**
 * Get Status Badge Class
 */
export const getInvoiceStatusBadge = (status) => {
    switch (status) {
        case 'Paid': return 'success';
        case 'Partial': return 'info';
        case 'Unpaid': return 'warning';
        case 'Overdue': return 'danger';
        case 'Draft': return 'secondary';
        case 'Cancelled': return 'dark';
        default: return 'primary';
    }
};
