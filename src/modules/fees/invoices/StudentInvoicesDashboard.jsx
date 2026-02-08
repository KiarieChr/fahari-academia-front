import React, { useState, useEffect } from 'react';
import { Plus, Sliders } from 'lucide-react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import InvoiceSummaryCards from './components/InvoiceSummaryCards';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceTable from './components/InvoiceTable';
import GenerateInvoiceModal from './components/GenerateInvoiceModal';
import ManualInvoiceModal from './components/ManualInvoiceModal';
import InvoiceDetailsModal from './components/InvoiceDetailsModal';
import { api } from '../../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
    getTermSummary
} from './utils/invoiceUtils';

const StudentInvoicesDashboard = () => {
    // State
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        expectedCollection: 0,
        actualCollection: 0,
        outstanding: 0,
        collectionRate: 0
    });

    const [filters, setFilters] = useState({
        search: '',
        classId: '',
        term: '',
        year: '',
        status: ''
    });

    // Modals
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Initial Data Fetch
    const [academicYears, setAcademicYears] = useState([]);
    const [allTerms, setAllTerms] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [yearsRes, termsRes] = await Promise.all([
                    api.get('/api/settings/academic-years/'),
                    api.get('/api/settings/terms/')
                ]);
                setAcademicYears(Array.isArray(yearsRes) ? yearsRes : (yearsRes.results || []));
                setAllTerms(Array.isArray(termsRes) ? termsRes : (termsRes.results || []));
            } catch (error) {
                console.error("Failed to fetch filter options:", error);
            }
        };
        fetchOptions();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (filters.term) params.append('term', filters.term);
            if (filters.year) params.append('year', filters.year);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const data = await api.get(`/api/fees/billing/invoices/?${params.toString()}`);

            // Handle Pagination (future-proof) or List
            const invoicesData = Array.isArray(data) ? data : (data.results || []);

            // Helper to safely parse amounts
            const parseAmount = (val) => {
                if (val === null || val === undefined) return 0;
                // Handle potential string formatting (e.g. "1,200.00")
                const cleanVal = String(val).replace(/,/g, '');
                const num = Number(cleanVal);
                if (isNaN(num)) {
                    console.warn("Invalid amount value encountered:", val);
                    return 0;
                }
                return num;
            };

            const mappedInvoices = invoicesData.map(inv => ({
                id: inv.id,
                invoiceNumber: inv.invoice_number || inv.invoiceNumber || '',
                studentName: inv.student_name || inv.studentName || 'Unknown Student',
                admissionNumber: inv.admission_number || inv.admissionNumber || '',
                className: inv.class_name || inv.className || '',
                term: inv.term_name || inv.term || '',
                year: inv.year_name || inv.year || '',
                dateIssued: inv.date_issued || inv.dateIssued || '',
                dueDate: inv.due_date || inv.dueDate || '',
                status: inv.status || 'Draft',
                totalAmount: parseAmount(inv.total_amount ?? inv.totalAmount),
                paidAmount: parseAmount(inv.paid_amount ?? inv.paidAmount),
                balance: parseAmount(inv.balance ?? inv.balance),
                items: inv.items || []
            }));


            setInvoices(mappedInvoices);

            // Recalculate summary from fetched data
            const total = mappedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
            const paid = mappedInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

            const pending = total - paid;
            const rate = total > 0 ? (paid / total) * 100 : 0;

            setSummary({
                totalInvoiced: total,
                totalCollected: paid,
                totalOutstanding: pending,
                invoiceCount: mappedInvoices.length,
                collectionRate: rate
            });

        } catch (error) {
            console.error("Failed to fetch invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    // Effects
    useEffect(() => {
        // Debounce search?
        const timeout = setTimeout(() => {
            fetchInvoices();
        }, 500);
        return () => clearTimeout(timeout);
    }, [filters]);

    // Handlers
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = (val) => {
        setFilters(prev => ({ ...prev, search: val }));
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            classId: '',
            term: '',
            year: '',
            status: ''
        });
    };

    const handleGenerateInvoices = ({ structureId, studentIds }) => {
        fetchInvoices();
    };

    const handleCreateManualInvoice = (newInvoice) => {
        fetchInvoices();

        // toast notification
        toast.success('Manual invoice created successfully!');
    };

    return (
        <DashboardLayout title="Student Invoices">
            <div className="invoice-dashboard p-3">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="mb-0 fw-bold">Student Invoices</h4>
                        <p className="text-muted mb-0">Manage term billings and outstanding balances</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowManualModal(true)}
                        >
                            <Plus size={18} className="me-2" />
                            New Invoice
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => setShowGenerateModal(true)}
                        >
                            <Sliders size={18} className="me-2" />
                            Bulk Generate
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <InvoiceSummaryCards summary={summary} />

                {/* Filters */}
                <InvoiceFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={handleSearch}
                    onReset={handleResetFilters}
                    years={academicYears}
                    terms={allTerms}
                />

                {/* Table */}
                {loading ? (
                    <div className="text-center py-5">Loading Invoices...</div>
                ) : (
                    <InvoiceTable
                        invoices={invoices}
                        onView={setSelectedInvoice}
                        onPrint={(inv) => alert(`Printing Invoice ${inv.invoiceNumber}...`)}
                        onEmail={(inv) => alert(`Emailing ${inv.studentName}...`)}
                    />
                )}

                {/* Modals */}
                <GenerateInvoiceModal
                    show={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                    onGenerate={handleGenerateInvoices}
                />

                <ManualInvoiceModal
                    show={showManualModal}
                    onClose={() => setShowManualModal(false)}
                    onCreate={handleCreateManualInvoice}
                />

                <InvoiceDetailsModal
                    show={!!selectedInvoice}
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />

                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </DashboardLayout>
    );
};

export default StudentInvoicesDashboard;
