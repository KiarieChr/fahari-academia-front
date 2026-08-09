/**
 * Mock Data for Student Invoices
 * Using Kenyan currency (KES) and standard school terms
 */

import { mockStudents } from '../../receipt-book/data/mockReceiptData';
import { incomeAccounts } from '../../fee-structure/data/mockFeeStructureData';

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generating invoice number
const generateInvoiceNo = (index) => `INV-2025-${String(index + 1).padStart(3, '0')}`;

export const invoiceStatuses = ['Draft', 'Unpaid', 'Partial', 'Paid', 'Overdue', 'Cancelled'];

const generateMockInvoices = () => {
    const invoices = [];
    const terms = ['Term 1', 'Term 2', 'Term 3'];
    const years = ['2024', '2025'];

    // Create invoices for a subset of students
    mockStudents.forEach((student, index) => {
        // Generate 1-3 invoices per student
        const numInvoices = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < numInvoices; i++) {
            const totalAmount = Math.floor(Math.random() * 30000) + 15000; // 15k - 45k
            const paidAmount = Math.random() > 0.3 ? Math.floor(Math.random() * totalAmount) : 0;
            const balance = totalAmount - paidAmount;

            let status = 'Unpaid';
            if (balance === 0) status = 'Paid';
            else if (paidAmount > 0) status = 'Partial';
            else if (Math.random() > 0.8) status = 'Overdue';

            const term = terms[i % 3];
            const year = years[Math.floor(Math.random() * years.length)];

            invoices.push({
                id: generateInvoiceNo(invoices.length),
                studentId: student.id,
                studentName: student.name,
                admissionNumber: student.admissionNumber,
                classId: student.classId,
                className: student.className,
                stream: student.stream,
                term: term,
                year: year,
                dateIssued: new Date(2025, i * 3, 1).toISOString(),
                dueDate: new Date(2025, i * 3 + 1, 5).toISOString(),
                totalAmount: totalAmount,
                paidAmount: paidAmount,
                balance: balance,
                status: status,
                items: [
                    {
                        id: `ITEM-${invoices.length}-1`,
                        name: 'Tuition Fee',
                        amount: Math.floor(totalAmount * 0.6),
                        accountId: '4001', // Tuition Income
                        accountName: 'Tuition Fees Income'
                    },
                    {
                        id: `ITEM-${invoices.length}-2`,
                        name: 'Boarding Fee',
                        amount: Math.floor(totalAmount * 0.3),
                        accountId: '4003', // Boarding Income
                        accountName: 'Boarding Fees Income'
                    },
                    {
                        id: `ITEM-${invoices.length}-3`,
                        name: 'Activity Fee',
                        amount: Math.floor(totalAmount * 0.1),
                        accountId: '4006', // Activity Income
                        accountName: 'Activity Fees Income'
                    }
                ],
                generatedBy: 'Auto',
                generatedAt: new Date(2025, i * 3, 1).toISOString(),
                remarks: i === 0 ? 'Standard term fees' : 'Additional charges included'
            });
        }
    });

    return invoices;
};

export const mockInvoices = generateMockInvoices();

export const invoiceSummaryStats = {
    totalInvoiced: mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    totalCollected: mockInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
    totalOutstanding: mockInvoices.reduce((sum, inv) => sum + inv.balance, 0),
    invoiceCount: mockInvoices.length,
    fullyPaidCount: mockInvoices.filter(inv => inv.status === 'Paid').length,
    partialCount: mockInvoices.filter(inv => inv.status === 'Partial').length,
    unpaidCount: mockInvoices.filter(inv => inv.status === 'Unpaid').length,
    overdueCount: mockInvoices.filter(inv => inv.status === 'Overdue').length,
    collectionRate: 0 // Calculated dynamically
};

invoiceSummaryStats.collectionRate = (invoiceSummaryStats.totalCollected / invoiceSummaryStats.totalInvoiced) * 100;
