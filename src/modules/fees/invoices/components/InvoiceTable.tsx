import React from 'react';
import { Eye, Printer, MoreVertical, Mail, AlertCircle } from 'lucide-react';
import { formatKES, getInvoiceStatusBadge } from '../utils/invoiceUtils';

const InvoiceTable = ({ invoices, onView, onPrint, onEmail }) => {

    if (!invoices || invoices.length === 0) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <AlertCircle size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No Invoices Found</h5>
                    <p className="text-muted">Adjust filters or generate new invoices to see data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '4%' }}>
                                    <input type="checkbox" className="form-check-input" />
                                </th>
                                <th style={{ width: '12%' }}>Invoice #</th>
                                <th style={{ width: '20%' }}>Student</th>
                                <th style={{ width: '15%' }}>Class / Term</th>
                                <th style={{ width: '12%' }} className="text-end">Total</th>
                                <th style={{ width: '12%' }} className="text-end">Paid</th>
                                <th style={{ width: '12%' }} className="text-end">Balance</th>
                                <th style={{ width: '8%' }}>Status</th>
                                <th style={{ width: '5%' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>
                                        <input type="checkbox" className="form-check-input" />
                                    </td>
                                    <td>
                                        <span className="fw-medium text-primary cursor-pointer" onClick={() => onView(invoice)}>
                                            {invoice.id}
                                        </span>
                                        <br />
                                        <small className="text-muted">
                                            {new Date(invoice.dateIssued).toLocaleDateString()}
                                        </small>
                                    </td>
                                    <td>
                                        <div className="fw-semibold">{invoice.studentName}</div>
                                        <small className="text-muted">{invoice.admissionNumber}</small>
                                    </td>
                                    <td>
                                        <div>{invoice.className}</div>
                                        <small className="text-muted me-2">{invoice.term}</small>
                                        <small className="badge bg-light text-dark border">{invoice.year}</small>
                                    </td>
                                    <td className="text-end fw-medium">{formatKES(invoice.totalAmount)}</td>
                                    <td className="text-end text-success">{formatKES(invoice.paidAmount)}</td>
                                    <td className="text-end">
                                        <span className={invoice.balance > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                                            {formatKES(invoice.balance)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge bg-${getInvoiceStatusBadge(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="dropdown">
                                            <button
                                                className="btn btn-sm btn-link text-muted p-0"
                                                data-bs-toggle="dropdown"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                <li>
                                                    <button className="dropdown-item" onClick={() => onView(invoice)}>
                                                        <Eye size={14} className="me-2" /> View Details
                                                    </button>
                                                </li>
                                                <li>
                                                    <button className="dropdown-item" onClick={() => onPrint(invoice)}>
                                                        <Printer size={14} className="me-2" /> Print Invoice
                                                    </button>
                                                </li>
                                                <li>
                                                    <button className="dropdown-item" onClick={() => onEmail(invoice)}>
                                                        <Mail size={14} className="me-2" /> Email Parent
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pagination Placeholder */}
            <div className="card-footer bg-white border-top py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Showing {invoices.length} invoices</small>
                    <nav aria-label="Page navigation">
                        <ul className="pagination pagination-sm mb-0">
                            <li className="page-item disabled"><a className="page-link" href="#">Previous</a></li>
                            <li className="page-item active"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item"><a className="page-link" href="#">Next</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;
