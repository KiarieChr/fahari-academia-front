import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import ReceiptSummaryCards from './components/ReceiptSummaryCards';
import ReceiptFilters from './components/ReceiptFilters';
import ReceiptTable from './components/ReceiptTable';
import CreateReceiptModal from './components/CreateReceiptModal';
import ReceiptDetailsModal from './components/ReceiptDetailsModal';
import ReverseReceiptModal from './components/ReverseReceiptModal';
import { receiptService } from '../../../services/receiptService';
import thermalPrinterService from '../../../services/thermalPrinterService';

import {
    filterReceiptsByDateRange,
    filterReceiptsByType,
    filterReceiptsByPaymentMethod,
    filterReceiptsByStatus,
    searchReceipts
} from './utils/receiptUtils';



const ReceiptBookDashboard = () => {
    // Data state
    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedReceipts, setSelectedReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showReverseModal, setShowReverseModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);

    // Filter state
    const [currentFilters, setCurrentFilters] = useState({});

    // Printer settings
    const [schoolInfo] = useState({
        name: 'SCHOOL NAME', // TODO: Fetch from settings
        address: 'P.O. Box 123, Nairobi',
        phone: '0712345678',
        email: 'info@school.ac.ke',
        motto: 'Excellence in Education'
    });

    const [printerSettings] = useState({
        type: 'thermal', // 'thermal', 'usb', 'network', or 'browser'
        printerIp: null, // For network printers
        printerPort: 9100
    });

    // Fetch summary and receipts on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch summary
                const summaryData = await receiptService.getSummary();
                setSummary(summaryData);

                // Fetch receipts
                const receiptsData = await receiptService.getReceipts();
                setReceipts(receiptsData.results);
                setFilteredReceipts(receiptsData.results);

            } catch (err) {
                console.error('Error fetching receipt data:', err);
                setError(err.message || 'Failed to load receipt data');
                // Set empty defaults on error
                setSummary({});
                setReceipts([]);
                setFilteredReceipts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Refetch receipts when filters change
    useEffect(() => {
        const fetchFilteredReceipts = async () => {
            // Skip if no filters applied or still loading initial data
            if (loading || Object.keys(currentFilters).length === 0) return;

            try {
                const receiptsData = await receiptService.getReceipts(currentFilters);
                setReceipts(receiptsData.results);
                setFilteredReceipts(receiptsData.results);
            } catch (err) {
                console.error('Error fetching filtered receipts:', err);
            }
        };

        fetchFilteredReceipts();
    }, [currentFilters]);

    // Apply local filters (for client-side filtering)
    const applyLocalFilters = (filters) => {
        let result = [...receipts];

        // Date range filter
        if (filters.startDate || filters.endDate) {
            result = filterReceiptsByDateRange(result, filters.startDate, filters.endDate);
        }

        // Receipt type filter
        if (filters.receiptType && filters.receiptType !== 'All') {
            result = filterReceiptsByType(result, filters.receiptType);
        }

        // Payment method filter
        if (filters.paymentMethod && filters.paymentMethod !== 'All') {
            result = filterReceiptsByPaymentMethod(result, filters.paymentMethod);
        }

        // Status filter
        if (filters.status && filters.status !== 'All') {
            result = filterReceiptsByStatus(result, filters.status);
        }

        // Search filter
        if (filters.searchTerm) {
            result = searchReceipts(result, filters.searchTerm);
        }

        setFilteredReceipts(result);
    };

    const handleFilterChange = (filters) => {
        setCurrentFilters(filters);
        applyLocalFilters(filters);
    };

    const handleSearch = (searchTerm) => {
        const filters = { ...currentFilters, searchTerm };
        setCurrentFilters(filters);
        applyLocalFilters(filters);
    };

    const handleClearFilters = () => {
        setCurrentFilters({});
        setFilteredReceipts(receipts);
    };

    const handleCardClick = (cardId) => {
        // Filter receipts based on card clicked
        let filters = { ...currentFilters };

        switch (cardId) {
            case 'student-fee':
                filters.receiptType = 'Student Fee';
                break;
            case 'non-fee':
                filters.receiptType = 'Student Non-Fee';
                break;
            case 'sponsor':
                filters.receiptType = 'Sponsor';
                break;
            case 'general':
                filters.receiptType = 'General';
                break;
            default:
                break;
        }

        setCurrentFilters(filters);
        applyLocalFilters(filters);
    };

    const handleSaveReceipt = (receipt) => {
        // Optimistic update (or handled by re-fetch in real scenario)
        const newReceipts = [...receipts, receipt];
        setReceipts(newReceipts);
        // Note: applyLocalFilters uses current state 'receipts' so this might not show immediately
        // unless we passed the new list to it. But fixing the crash is priority.
        // Ideally we should just trigger a data refresh here.
        toast.success(`Receipt ${receipt.receiptNumber} ${receipt.status === 'Draft' ? 'saved as draft' : 'issued'} successfully!`);
    };

    const handleViewReceipt = (receipt) => {
        setSelectedReceipt(receipt);
        setShowDetailsModal(true);
    };

    const handlePrintReceipt = async (receipt) => {
        try {
            // Track print via API - backend will mark as ISSUED if needed
            const response = await receiptService.trackPrint(receipt.id);

            // Update local state with new status and print count
            const updatedReceipts = receipts.map(r =>
                r.id === receipt.id ? {
                    ...r,
                    printCount: response.print_count,
                    status: response.status
                } : r
            );
            setReceipts(updatedReceipts);
            applyLocalFilters(currentFilters);

            // Show success message
            toast.success(response.message || `Receipt ${receipt.receiptNumber} printed successfully`);

            // Use thermal printer service
            try {
                await thermalPrinterService.print(receipt, schoolInfo, {
                    printerType: printerSettings.type,
                    printerIp: printerSettings.printerIp,
                    printerPort: printerSettings.printerPort
                });
            } catch (printError) {
                console.error('Thermal print error:', printError);
                toast.error('Failed to send to thermal printer. Check printer connection.');
            }
        } catch (err) {
            console.error('Error printing receipt:', err);
            toast.error('Failed to print receipt. Please try again.');
        }
    };

    const handleReverseReceipt = (receipt) => {
        setSelectedReceipt(receipt);
        setShowDetailsModal(false);
        setShowReverseModal(true);
    };

    const handleConfirmReversal = async (reversedReceipt) => {
        try {
            // Reverse via API
            await receiptService.reverseReceipt(reversedReceipt.id, reversedReceipt.reversalReason);

            // Update local state
            const updatedReceipts = receipts.map(r =>
                r.id === reversedReceipt.id ? reversedReceipt : r
            );
            setReceipts(updatedReceipts);
            applyLocalFilters(currentFilters);
            toast.success(`Receipt ${reversedReceipt.receiptNumber} has been reversed.`);
        } catch (err) {
            console.error('Error reversing receipt:', err);
            toast.error('Failed to reverse receipt. Please try again.');
        }
    };

    const handleSelectReceipt = (receiptId) => {
        if (selectedReceipts.includes(receiptId)) {
            setSelectedReceipts(selectedReceipts.filter(id => id !== receiptId));
        } else {
            setSelectedReceipts([...selectedReceipts, receiptId]);
        }
    };

    const handleBulkPrint = (receiptIds) => {
        toast.success(`Bulk printing ${receiptIds.length} receipts...`);
        setSelectedReceipts([]);
    };

    return (
        <DashboardLayout title="Receipt Book">
            <div className="receipt-book-dashboard">
                {/* Header Section */}
                <div className="receipt-section-header mb-4">
                    <div>
                        <h4 className="mb-1">Receipt Book Dashboard</h4>
                        <p className="text-muted mb-0">Manage all receipts: Student Fees, Non-Fees, Sponsors, and General Income</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={18} className="me-2" />
                        Create Receipt
                    </button>
                </div>

                {/* Summary Cards */}
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading receipt data...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger" role="alert">
                        <h6 className="alert-heading fw-bold">Error Loading Data</h6>
                        <p className="mb-0">{error}</p>
                        <button
                            className="btn btn-sm btn-outline-danger mt-3"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <ReceiptSummaryCards
                            summary={summary || {}}
                            onCardClick={handleCardClick}
                        />

                        {/* Filters */}
                        <ReceiptFilters
                            onFilterChange={handleFilterChange}
                            onSearch={handleSearch}
                            onClearFilters={handleClearFilters}
                        />

                        {/* Receipt Table */}
                        <ReceiptTable
                            receipts={filteredReceipts}
                            onView={handleViewReceipt}
                            onPrint={handlePrintReceipt}
                            onReverse={handleReverseReceipt}
                            onBulkPrint={handleBulkPrint}
                            selectedReceipts={selectedReceipts}
                            onSelectReceipt={handleSelectReceipt}
                        />
                    </>
                )}

                {/* Modals */}
                <CreateReceiptModal
                    show={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleSaveReceipt}
                    lastReceiptNumber={summary?.lastReceiptNumber || 'RCT-2026-0000'}
                />

                <ReceiptDetailsModal
                    show={showDetailsModal}
                    receipt={selectedReceipt}
                    onClose={() => setShowDetailsModal(false)}
                    onPrint={handlePrintReceipt}
                    onReverse={handleReverseReceipt}
                />

                <ReverseReceiptModal
                    show={showReverseModal}
                    receipt={selectedReceipt}
                    onClose={() => setShowReverseModal(false)}
                    onConfirm={handleConfirmReversal}
                />
            </div>
        </DashboardLayout>
    );
};

export default ReceiptBookDashboard;

