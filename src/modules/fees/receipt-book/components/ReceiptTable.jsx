import React, { useState } from 'react';
import { Eye, Printer, RotateCcw, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import {
    formatKES,
    formatDate,
    getReceiptStatusBadge,
    getReceiptTypeBadge,
    getPaymentMethodIcon,
    getPaymentMethodColor
} from '../utils/receiptUtils';

const ReceiptTable = ({ receipts, onView, onPrint, onReverse, onBulkPrint, selectedReceipts, onSelectReceipt }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [sortField, setSortField] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');

    // Sorting
    const sortedReceipts = [...receipts].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'date' || sortField === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        if (sortField === 'amount') {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }

        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReceipts = sortedReceipts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedReceipts.length / itemsPerPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            currentReceipts.forEach(receipt => {
                if (!selectedReceipts.includes(receipt.id)) {
                    onSelectReceipt(receipt.id);
                }
            });
        } else {
            currentReceipts.forEach(receipt => {
                if (selectedReceipts.includes(receipt.id)) {
                    onSelectReceipt(receipt.id);
                }
            });
        }
    };

    const allSelected = currentReceipts.length > 0 &&
        currentReceipts.every(r => selectedReceipts.includes(r.id));

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">
                        Receipt List ({receipts.length} receipts)
                    </h6>
                    <div className="d-flex gap-2">
                        {selectedReceipts.length > 0 && (
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => onBulkPrint(selectedReceipts)}
                            >
                                <Printer size={16} className="me-1" />
                                Print Selected ({selectedReceipts.length})
                            </button>
                        )}
                        <button className="btn btn-sm btn-outline-secondary">
                            <Download size={16} className="me-1" />
                            Export
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() => handleSort('receiptNumber')}
                                >
                                    Receipt # {sortField === 'receiptNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer"
                                    onClick={() => handleSort('date')}
                                >
                                    Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Type</th>
                                <th>Payer Name</th>
                                <th>Student</th>
                                <th
                                    className="cursor-pointer text-end"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Payment</th>
                                <th>Reference</th>
                                <th>Issued By</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReceipts.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-4 text-muted">
                                        No receipts found
                                    </td>
                                </tr>
                            ) : (
                                currentReceipts.map((receipt) => (
                                    <tr
                                        key={receipt.id}
                                        className={receipt.status === 'Reversed' ? 'table-danger' : ''}
                                        onDoubleClick={() => onView(receipt)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={selectedReceipts.includes(receipt.id)}
                                                onChange={() => onSelectReceipt(receipt.id)}
                                                disabled={receipt.status === 'Reversed'}
                                            />
                                        </td>
                                        <td>
                                            <span
                                                className="text-primary cursor-pointer fw-semibold"
                                                onClick={() => onView(receipt)}
                                            >
                                                {receipt.receiptNumber}
                                            </span>
                                        </td>
                                        <td className="small">{formatDate(receipt.date)}</td>
                                        <td>
                                            <span className={getReceiptTypeBadge(receipt.receiptType)}>
                                                {receipt.receiptType}
                                            </span>
                                        </td>
                                        <td>{receipt.payerName}</td>
                                        <td>
                                            {receipt.studentName ? (
                                                <div>
                                                    <div className="small fw-semibold">{receipt.studentName}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                        {receipt.admissionNo}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td className="text-end fw-semibold">{formatKES(receipt.amount)}</td>
                                        <td>
                                            <span className={`badge bg-${getPaymentMethodColor(receipt.paymentMethod)}-subtle text-${getPaymentMethodColor(receipt.paymentMethod)}`}>
                                                {getPaymentMethodIcon(receipt.paymentMethod)} {receipt.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="small">{receipt.reference || '-'}</td>
                                        <td className="small">{receipt.issuedBy}</td>
                                        <td>
                                            <span className={getReceiptStatusBadge(receipt.status)}>
                                                {receipt.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1 justify-content-center">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => onView(receipt)}
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() => onPrint(receipt)}
                                                    title={receipt.printCount > 0 ? 'Reprint' : 'Print'}
                                                    disabled={receipt.status === 'Reversed'}
                                                >
                                                    <Printer size={14} />
                                                </button>
                                                {receipt.status !== 'Reversed' && receipt.status !== 'Draft' && (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => onReverse(receipt)}
                                                        title="Reverse Receipt"
                                                    >
                                                        <RotateCcw size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="card-footer bg-white border-top">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="text-muted small">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, receipts.length)} of {receipts.length} receipts
                            </div>
                            <nav>
                                <ul className="pagination pagination-sm mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                    </li>
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        // Show first, last, current, and adjacent pages
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <li
                                                    key={page}
                                                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            );
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return (
                                                <li key={page} className="page-item disabled">
                                                    <span className="page-link">...</span>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiptTable;
