import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StudentFeeReceiptForm from './forms/StudentFeeReceiptForm';
import StudentNonFeeReceiptForm from './forms/StudentNonFeeReceiptForm';
import GeneralReceiptForm from './forms/GeneralReceiptForm';
import SponsorReceiptForm from './forms/SponsorReceiptForm';
import CustomerImportForm from './forms/CustomerImportForm';
import { receiptService } from '../../../../services/receiptService'; // Import your existing service

const CreateReceiptModal = ({ show, onClose, onSave, lastReceiptNumber }) => {
    const [receiptType, setReceiptType] = useState('Student Fee');
    const [receiptData, setReceiptData] = useState({});
    const [nextReceiptNumber, setNextReceiptNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [summaryData, setSummaryData] = useState(null);

    // Fetch summary to get next receipt number
    useEffect(() => {
        if (show) {
            fetchSummaryData();
        }
    }, [show]);

    const fetchSummaryData = async () => {
        setIsGeneratingNumber(true);
        try {
            const summary = await receiptService.getSummary();
            setSummaryData(summary);
            // Use the next receipt number from summary
            setNextReceiptNumber(summary.nextReceiptNumber || '');
            setError(null);
        } catch (err) {
            console.error('Error fetching summary:', err);
            setError('Failed to generate receipt number. Please try again.');
            // Fallback to last receipt number
            setNextReceiptNumber(lastReceiptNumber || '');
        } finally {
            setIsGeneratingNumber(false);
        }
    };

    // Map UI receipt types to backend values based on your service
    const receiptTypeMap = {
        'Student Fee': 'STUDENT_FEE',
        'Student Non-Fee': 'STUDENT_NON_FEE',
        'General': 'GENERAL',
        'Sponsor': 'SPONSOR',
        'Customer Import': 'IMPORT'
    };

    // Transform form data to match your service's expected format
    const transformToServiceFormat = (formData, type, status) => {
        const baseData = {
            receiptType: receiptTypeMap[type],
            status: status === 'Draft' ? 'DRAFT' : 'ISSUED', // Map to backend choices (ISSUED is standard)
            date: formData.date || new Date().toISOString().split('T')[0],
            amount: parseFloat(formData.amount || 0),
            notes: formData.remarks || formData.notes || '',
            // Default values that should come from your context/auth
            issuedBy: (() => {
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        return user.name || user.first_name + ' ' + user.last_name || user.username || 'Current User';
                    }
                } catch (e) { /* ignore */ }
                return 'Current User';
            })(),
            reference: formData.reference || '',
        };

        // Add type-specific fields based on your receiptService.createReceipt format
        switch (type) {
            case 'Student Fee':
                return {
                    ...baseData,
                    payerName: formData.payerName || formData.studentName || '',
                    studentId: formData.studentId,
                    feeCategory: formData.feeCategory,
                    termId: formData.termId,
                    academicYearId: formData.academicYearId,
                    paymentMethodId: formData.paymentMethodId || 1, // Default payment method ID
                    // Use allocations provided by form
                    allocations: formData.allocations || [],
                };

            case 'Student Non-Fee':
                return {
                    ...baseData,
                    payerName: formData.payerName || formData.studentName || '',
                    studentId: formData.studentId,
                    nonFeeCategory: formData.nonFeeCategory,
                    description: formData.description || '',
                    paymentMethodId: formData.paymentMethodId || 1,
                    incomeAccountId: formData.incomeAccountId,
                };

            case 'General':
                return {
                    ...baseData,
                    payerName: formData.payerName || formData.customerName || '',
                    studentId: null, // General receipts are not linked to a student
                    description: formData.description || '',
                    paymentMethodId: formData.paymentMethodId || 1,
                    incomeAccountId: formData.incomeAccountId,
                };

            case 'Sponsor':
                return {
                    ...baseData,
                    payerName: formData.payerName || formData.sponsorName || '',
                    studentId: formData.studentId,
                    sponsorshipId: formData.sponsorshipId || formData.sponsorId,
                    sponsorshipType: formData.sponsorshipType,
                    description: formData.description || '',
                    paymentMethodId: formData.paymentMethodId || 1,
                    allocationRule: formData.allocationRule || 'SPECIFIC',
                };

            default:
                return baseData;
        }
    };

    // Transform backend response to frontend format
    const transformToFrontendFormat = (backendResponse) => {
        return {
            id: backendResponse.id,
            receiptNumber: backendResponse.receipt_number,
            date: backendResponse.date || backendResponse.received_date,
            receiptType: backendResponse.receipt_type,
            payerName: backendResponse.payer_name,
            studentId: backendResponse.student_id,
            studentName: backendResponse.student_name,
            admissionNo: backendResponse.admission_no,
            amount: backendResponse.amount,
            paymentMethod: backendResponse.payment_method,
            reference: backendResponse.reference,
            issuedBy: backendResponse.issued_by,
            status: backendResponse.status,
            printCount: backendResponse.print_count,
            feeCategory: backendResponse.fee_category,
            term: backendResponse.term,
            year: backendResponse.year,
            nonFeeCategory: backendResponse.non_fee_category,
            description: backendResponse.description,
            sponsorshipType: backendResponse.sponsorship_type,
            allocationRule: backendResponse.allocation_rule,
            incomeAccount: backendResponse.income_account,
            notes: backendResponse.notes,
            createdAt: backendResponse.created_at,
            reversalReason: backendResponse.reversal_reason,
            // Add accounting data if available
            previousBalance: backendResponse.previous_balance,
            currentBalance: backendResponse.current_balance,
            journalId: backendResponse.journal_id,
            allocations: backendResponse.allocations || [],
        };
    };

    const handleSave = async (status = 'Issued') => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            console.log("Current Receipt Data State:", receiptData);
            // Transform data to match your service format
            const serviceData = transformToServiceFormat(receiptData, receiptType, status);
            console.log("Transformed Service Data:", serviceData);

            // Submit to backend using your existing service
            const response = await receiptService.createReceipt(serviceData);

            // If it's a draft and we need to post it immediately (for "Issue Receipt")
            if (status === 'Issued' && response.status === 'DRAFT') {
                // Use the post endpoint to make it official
                const postedResponse = await receiptService.postReceipt(response.id);

                // Transform to frontend format
                const savedReceipt = transformToFrontendFormat(postedResponse);

                // Call parent's onSave with real data
                onSave(savedReceipt);

                // Show success message
                setSuccessMessage(`Receipt ${postedResponse.receipt_number} issued successfully!`);
            } else {
                // For draft receipts
                const savedReceipt = transformToFrontendFormat(response);
                onSave(savedReceipt);

                setSuccessMessage(status === 'Draft'
                    ? `Receipt ${response.receipt_number} saved as draft.`
                    : `Receipt ${response.receipt_number} created successfully!`
                );
            }

            // Refresh receipt number for next receipt
            await fetchSummaryData();

            // Close modal after delay
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (err) {
            console.error('Error saving receipt:', err);

            // Surface the actual backend validation errors
            const data = err.response?.data;
            let errorMessage = 'Failed to save receipt. Please try again.';
            if (data) {
                console.error('Backend validation errors:', data);
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (data.message) {
                    errorMessage = data.message;
                } else if (typeof data === 'object') {
                    // Field-level errors: { field: ["error msg"] }
                    errorMessage = Object.entries(data)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join(' | ');
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (file) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            // Since your receiptService doesn't have import, we'll create a direct API call
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/fees/receipts/import/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust based on your auth
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Import failed');
            }

            // Handle import response
            if (data.success) {
                setSuccessMessage(`Successfully imported ${data.imported_count} receipts. ${data.failed_count} failed.`);

                // Show failed rows if any
                if (data.failed_rows && data.failed_rows.length > 0) {
                    const failedRowsMessage = data.failed_rows
                        .map(row => `Row ${row.row_number}: ${row.error}`)
                        .join('\n');

                    alert(`Some rows failed to import:\n\n${failedRowsMessage}`);
                }

                // Refresh receipt number after import
                await fetchSummaryData();

                // Refresh the parent's receipt list if needed
                if (data.imported_count > 0) {
                    // You might want to trigger a refresh here
                }
            } else {
                setError(data.message || 'Import failed');
            }
        } catch (err) {
            console.error('Error importing receipts:', err);
            const errorMessage = err.message || 'Failed to import receipts. Please check file format.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setReceiptData({});
        setReceiptType('Student Fee');
        setError(null);
        setSuccessMessage('');
        setSummaryData(null);
        onClose();
    };

    if (!show) return null;

    // Receipt type options including new Customer Import
    const receiptTypes = ['Student Fee', 'Student Non-Fee', 'General', 'Sponsor', 'Customer Import'];

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Create New Receipt</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Receipt Number Preview - Now from API */}
                        <div className="alert alert-info mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Receipt Number:</strong>
                                    {isGeneratingNumber ? (
                                        <span className="ms-2">
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Generating...
                                        </span>
                                    ) : (
                                        <span className="ms-2">{nextReceiptNumber}</span>
                                    )}
                                </div>
                                {summaryData?.activeReceiptBook && (
                                    <small className="text-muted">
                                        Book: {summaryData.activeReceiptBook}
                                    </small>
                                )}
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                                <div className="d-flex">
                                    <div className="me-2">❌</div>
                                    <div>{error}</div>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                            </div>
                        )}

                        {successMessage && (
                            <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                                <div className="d-flex">
                                    <div className="me-2">✅</div>
                                    <div>{successMessage}</div>
                                </div>
                                <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                            </div>
                        )}

                        {/* Receipt Type Selector */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Receipt Type</label>
                            <div className="btn-group w-100 flex-wrap" role="group">
                                {receiptTypes.map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`btn ${receiptType === type ? 'btn-primary' : 'btn-outline-primary'} flex-fill`}
                                        onClick={() => {
                                            setReceiptType(type);
                                            setReceiptData({});
                                            setError(null);
                                            setSuccessMessage('');
                                        }}
                                        disabled={isLoading}
                                        style={{ minWidth: '120px' }}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dynamic Form Based on Receipt Type */}
                        {receiptType === 'Student Fee' && (
                            <StudentFeeReceiptForm
                                data={receiptData}
                                onChange={setReceiptData}
                                disabled={isLoading}
                            />
                        )}
                        {receiptType === 'Student Non-Fee' && (
                            <StudentNonFeeReceiptForm
                                data={receiptData}
                                onChange={setReceiptData}
                                disabled={isLoading}
                            />
                        )}
                        {receiptType === 'General' && (
                            <GeneralReceiptForm
                                data={receiptData}
                                onChange={setReceiptData}
                                disabled={isLoading}
                            />
                        )}
                        {receiptType === 'Sponsor' && (
                            <SponsorReceiptForm
                                data={receiptData}
                                onChange={setReceiptData}
                                disabled={isLoading}
                            />
                        )}
                        {receiptType === 'Customer Import' && (
                            <CustomerImportForm
                                onImport={handleImport}
                                disabled={isLoading}
                            />
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>

                        {/* Only show save buttons for non-import types */}
                        {receiptType !== 'Customer Import' && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => handleSave('Draft')}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : null}
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleSave('Issued')}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : null}
                                    Issue Receipt
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateReceiptModal;