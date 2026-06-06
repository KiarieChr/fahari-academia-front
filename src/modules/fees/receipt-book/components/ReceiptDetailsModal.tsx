import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Mail, RotateCcw, FileText, Plus, User } from 'lucide-react';
import { formatKES, formatDateTime, getReceiptStatusBadge, getReceiptTypeBadge, getPaymentMethodIcon } from '../utils/receiptUtils';
import { studentManagementService } from '../../../../services/studentManagementService';
import { receiptService } from '../../../../services/receiptService';
import FilterDropdown from '../../../../components/ui/FilterDropdown';
import { toast } from 'react-toastify';

const ReceiptDetailsModal = ({ show, receipt, onClose, onPrint, onReverse, onUpdate, userRole = 'Bursar' }) => {
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [allocationAmount, setAllocationAmount] = useState('');
    const [isAllocating, setIsAllocating] = useState(false);
    const [localReceipt, setLocalReceipt] = useState(null);

    useEffect(() => {
        if (receipt) {
            setLocalReceipt(receipt);
        }
    }, [receipt]);

    useEffect(() => {
        if (show && receipt && (receipt.receiptType === 'SPONSOR' || receipt.receiptType === 'Sponsor')) {
            const loadStudents = async () => {
                setLoadingStudents(true);
                try {
                    const res = await studentManagementService.getAdmissions({ page_size: 1000, status: 'Active' });
                    setStudents(res.results || []);
                } catch (err) {
                    console.error('Failed to load active students for allocation:', err);
                } finally {
                    setLoadingStudents(false);
                }
            };
            loadStudents();
        }
    }, [show, receipt]);

    if (!show || !localReceipt) return null;

    const isSponsorReceipt = localReceipt.receiptType === 'Sponsor' || localReceipt.receiptType === 'SPONSOR';
    const unallocatedAmount = localReceipt.amount - (localReceipt.amountAllocated || 0);

    const canReverse = localReceipt.status !== 'Reversed' && localReceipt.status !== 'Draft' &&
        ['Bursar', 'Accountant'].includes(userRole);

    const handleAllocate = async (e) => {
        e.preventDefault();
        if (!selectedStudentId) {
            toast.error('Please select a student');
            return;
        }
        const amount = parseFloat(allocationAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (amount > unallocatedAmount) {
            toast.error(`Insufficient funds. Only ${formatKES(unallocatedAmount)} remaining.`);
            return;
        }

        setIsAllocating(true);
        try {
            const res = await receiptService.allocateSponsorship(localReceipt.id, {
                studentId: selectedStudentId,
                amount: amount
            });
            toast.success(res.message || 'Funds allocated successfully!');
            setAllocationAmount('');
            setSelectedStudentId('');
            
            // Refetch details
            const updated = await receiptService.getReceiptDetails(localReceipt.id);
            // Transform response to match local format
            const mapped = {
                ...localReceipt,
                amountAllocated: updated.amount_allocated,
                childAllocations: updated.child_allocations || [],
                child_allocations: updated.child_allocations || []
            };
            setLocalReceipt(mapped);
            
            if (onUpdate) {
                onUpdate(mapped);
            }
        } catch (err) {
            console.error('Allocation failed:', err);
            toast.error(err.response?.data?.detail || err.message || 'Failed to allocate funds');
        } finally {
            setIsAllocating(false);
        }
    };

    // Transform students for dropdown
    const studentOptions = students.map(s => ({
        value: s.student,
        label: `${s.student_name} - ${s.admission_number} (${s.class_name || 'N/A'})`,
        icon: User
    }));

    // Allocations list helper
    const childAllocations = localReceipt.childAllocations || localReceipt.child_allocations || [];

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Receipt Details</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Receipt Header */}
                        <div className="card border-0 bg-light mb-4">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h4 className="mb-1">{localReceipt.receiptNumber}</h4>
                                        <p className="text-muted mb-0">{formatDateTime(localReceipt.date)}</p>
                                    </div>
                                    <div className="text-end">
                                        <span className={getReceiptStatusBadge(localReceipt.status)}>
                                            {localReceipt.status}
                                        </span>
                                        <br />
                                        <span className={`${getReceiptTypeBadge(localReceipt.receiptType)} mt-2`}>
                                            {localReceipt.receiptType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payer Information */}
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3">Payer Information</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Payer Name:</strong><br />
                                        {localReceipt.payerName}
                                    </p>
                                </div>
                                {localReceipt.studentName && (
                                    <div className="col-md-6">
                                        <p className="mb-2">
                                            <strong>Student:</strong><br />
                                            {localReceipt.studentName} ({localReceipt.admissionNo})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3">Payment Details</h6>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <td className="fw-semibold" style={{ width: '40%' }}>Amount</td>
                                            <td className="text-end fs-5 fw-bold text-success">{formatKES(localReceipt.amount)}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold">Payment Method</td>
                                            <td>
                                                {getPaymentMethodIcon(localReceipt.paymentMethod)} {localReceipt.paymentMethod}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold">Reference</td>
                                            <td>{localReceipt.reference || '-'}</td>
                                        </tr>
                                        {localReceipt.feeCategory && (
                                            <tr>
                                                <td className="fw-semibold">Fee Category</td>
                                                <td>{localReceipt.feeCategory}</td>
                                            </tr>
                                        )}
                                        {localReceipt.term && (
                                            <tr>
                                                <td className="fw-semibold">Term / Year</td>
                                                <td>{localReceipt.term} {localReceipt.year}</td>
                                            </tr>
                                        )}
                                        {localReceipt.nonFeeCategory && (
                                            <tr>
                                                <td className="fw-semibold">Non-Fee Category</td>
                                                <td>{localReceipt.nonFeeCategory}</td>
                                            </tr>
                                        )}
                                        {localReceipt.description && (
                                            <tr>
                                                <td className="fw-semibold">Description</td>
                                                <td>{localReceipt.description}</td>
                                            </tr>
                                        )}
                                        {isSponsorReceipt && (
                                            <>
                                                <tr>
                                                    <td className="fw-semibold">Sponsor Classification</td>
                                                    <td>
                                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                                            {localReceipt.sponsorshipType || 'Sponsor'}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {localReceipt.sponsorshipName && (
                                                    <tr>
                                                        <td className="fw-semibold">Sponsorship Program</td>
                                                        <td className="fw-medium text-dark">{localReceipt.sponsorshipName}</td>
                                                    </tr>
                                                )}
                                                <tr>
                                                    <td className="fw-semibold">Allocated Amount</td>
                                                    <td className="text-info fw-semibold">{formatKES(localReceipt.amountAllocated || 0)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="fw-semibold">Unallocated Remaining</td>
                                                    <td className="text-warning fw-semibold">{formatKES(unallocatedAmount)}</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sponsor Allocations Section */}
                        {isSponsorReceipt && (
                            <div className="mb-4">
                                <div className="card border-light bg-light-subtle shadow-sm mb-4">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
                                            <span>Sponsor Funds Allocations</span>
                                            <span className="badge bg-secondary">
                                                {childAllocations.length} Student(s)
                                            </span>
                                        </h6>
                                        
                                        {/* Allocations Table */}
                                        <div className="table-responsive mb-3">
                                            <table className="table table-sm table-hover align-middle bg-white border small">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Student</th>
                                                        <th>Adm No.</th>
                                                        <th>Allocation Receipt</th>
                                                        <th>Allocated Date</th>
                                                        <th className="text-end">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {childAllocations.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="text-center py-3 text-muted">
                                                                No student allocations made yet from this receipt.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        childAllocations.map(alloc => (
                                                            <tr key={alloc.id}>
                                                                <td className="fw-medium">{alloc.student_name}</td>
                                                                <td><code>{alloc.admission_no}</code></td>
                                                                <td><span className="text-muted font-monospace">{alloc.receipt_number}</span></td>
                                                                <td>{alloc.date}</td>
                                                                <td className="text-end fw-semibold text-success">{formatKES(alloc.amount)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Allocation Form (Only for official posted sponsor receipts with remaining balance) */}
                                        {unallocatedAmount > 0 && localReceipt.status === 'Posted' && (
                                            <form onSubmit={handleAllocate} className="border-top pt-3">
                                                <h6 className="small fw-bold text-uppercase text-muted mb-3">Allocate Remaining Funds</h6>
                                                <div className="row g-2">
                                                    <div className="col-md-7">
                                                        <FilterDropdown
                                                            placeholder={loadingStudents ? "Loading active students..." : "Search student to fund..."}
                                                            value={selectedStudentId}
                                                            options={studentOptions}
                                                            onChange={setSelectedStudentId}
                                                            searchable={true}
                                                            disabled={loadingStudents || isAllocating}
                                                            className="w-100"
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            value={allocationAmount}
                                                            onChange={(e) => setAllocationAmount(e.target.value)}
                                                            placeholder="Amount (KES)"
                                                            min="0.01"
                                                            max={unallocatedAmount}
                                                            step="0.01"
                                                            required
                                                            disabled={isAllocating}
                                                            style={{ height: '36px' }}
                                                        />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                                                            disabled={isAllocating}
                                                            style={{ height: '36px' }}
                                                        >
                                                            {isAllocating ? (
                                                                <span className="spinner-border spinner-border-sm"></span>
                                                            ) : (
                                                                <><Plus size={14} className="me-1" /> Allocate</>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Audit Trail */}
                        <div className="mb-4">
                            <h6 className="fw-bold mb-3">Audit Information</h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Issued By:</strong><br />
                                        {localReceipt.issuedBy}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-2">
                                        <strong>Print Count:</strong><br />
                                        {localReceipt.printCount} time(s)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reversal Information */}
                        {localReceipt.status === 'Reversed' && localReceipt.reversalReason && (
                            <div className="alert alert-danger">
                                <h6 className="alert-heading">Receipt Reversed</h6>
                                <p className="mb-0"><strong>Reason:</strong> {localReceipt.reversalReason}</p>
                            </div>
                        )}

                        {/* Notes */}
                        {localReceipt.notes && (
                            <div className="mb-4">
                                <h6 className="fw-bold mb-2">Notes</h6>
                                <p className="text-muted">{localReceipt.notes}</p>
                            </div>
                        )}

                        {/* Attachments */}
                        {localReceipt.attachments && localReceipt.attachments.length > 0 && (
                            <div className="mb-4">
                                <h6 className="fw-bold mb-3">Attachments</h6>
                                <div className="list-group">
                                    {localReceipt.attachments.map((attachment, index) => (
                                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <FileText size={18} className="me-2" />
                                                {attachment}
                                            </div>
                                            <button className="btn btn-sm btn-outline-primary">
                                                <Download size={14} className="me-1" />
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                        {localReceipt.status !== 'Reversed' && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-info"
                                    onClick={() => alert('Email functionality coming soon')}
                                >
                                    <Mail size={16} className="me-1" />
                                    Email Receipt
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => onPrint(localReceipt)}
                                >
                                    <Printer size={16} className="me-1" />
                                    {localReceipt.printCount > 0 ? 'Reprint' : 'Print'}
                                </button>
                                {canReverse && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => onReverse(localReceipt)}
                                    >
                                        <RotateCcw size={16} className="me-1" />
                                        Reverse Receipt
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiptDetailsModal;
