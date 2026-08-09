import React, { useRef, useState, useEffect } from 'react'; // Fixed import
import { X, Printer, Download, Share2 } from 'lucide-react';
import { formatKES } from '../accountsPayable/utils/formatters';
import { institutionService } from '../../../services/institutionService';

const JournalVoucherModal = ({ show, onClose, entry }) => {
    const [institution, setInstitution] = useState(null);

    const printRef = useRef();

    useEffect(() => {
        if (show) {
            institutionService.getProfile()
                .then(res => setInstitution(res.data || res))
                .catch(err => console.error("Failed to fetch institution profile:", err));
        }
    }, [show]);

    if (!show || !entry) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('journal-voucher-print-area');
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore event listeners
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
                    {/* Header with Actions */}
                    <div className="modal-header border-bottom py-3 px-4 bg-light">
                        <h5 className="modal-title fw-bold text-dark">Journal Voucher Details</h5>
                        <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2" onClick={handlePrint}>
                                <Printer size={16} /> Print Voucher
                            </button>
                            <button className="btn-close text-blue" onClick={onClose}></button>
                        </div>
                    </div>

                    {/* Voucher Content */}
                    <div className="modal-body p-0">
                        <div id="journal-voucher-print-area" className="p-5 bg-white">
                            {/* Institution Header (Print Only mostly) */}
                            <div className="text-center mb-5">
                                <h2 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px' }}>{institution?.name || 'Fahari Institution'}</h2>
                                <p className="text-muted small mb-0">{institution?.address || 'P.O. Box 12345 - 00100, Nairobi, Kenya'}</p>
                                <p className="text-muted small">Tel: {institution?.phone || '+254 700 000 000'} | Email: {institution?.email || 'finance@skylearn.ac.ke'}</p>
                                <hr className="my-4" />
                                <h3 className="fw-bold text-primary mb-0">JOURNAL VOUCHER</h3>
                            </div>

                            {/* Voucher Details */}
                            <div className="row mb-4">
                                <div className="col-6">
                                    <table className="table table-borderless table-sm">
                                        <tbody>
                                            <tr>
                                                <td className="text-muted ps-0" style={{ width: '100px' }}>Voucher No:</td>
                                                <td className="fw-bold">#{entry.id}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted ps-0">Date:</td>
                                                <td className="fw-bold">{entry.date}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted ps-0">Status:</td>
                                                <td>
                                                    <span className={`badge border ${entry.status === 'POSTED' ? 'bg-success-subtle text-success border-success' : 'bg-warning-subtle text-warning border-warning'}`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 text-end">
                                    <table className="table table-borderless table-sm float-end" style={{ width: 'auto' }}>
                                        <tbody>
                                            <tr>
                                                <td className="text-muted text-start pe-3">Reference:</td>
                                                <td className="fw-bold text-start">{entry.reference || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-muted text-start pe-3">Type:</td>
                                                <td className="fw-bold text-start">{entry.journal_type}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-muted small text-uppercase fw-bold mb-1">Description</label>
                                <div className="p-3 bg-light rounded border">
                                    {entry.description}
                                </div>
                            </div>

                            {/* Lines Table */}
                            <div className="table-responsive mb-5">
                                <table className="table table-bordered border-dark align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: '15%' }}>Account Code</th>
                                            <th style={{ width: '45%' }}>Account Name / Description</th>
                                            <th className="text-end" style={{ width: '20%' }}>Debit (KES)</th>
                                            <th className="text-end" style={{ width: '20%' }}>Credit (KES)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entry.lines && entry.lines.map((line, idx) => (
                                            <tr key={idx}>
                                                <td className="fw-bold">{line.account_code || line.account}</td>
                                                <td>
                                                    <div>{line.account_name}</div>
                                                    {line.description && <div className="text-muted small fst-italic">{line.description}</div>}
                                                </td>
                                                <td className="text-end">{Number(line.debit) > 0 ? formatKES(line.debit) : '-'}</td>
                                                <td className="text-end">{Number(line.credit) > 0 ? formatKES(line.credit) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-light fw-bold">
                                        <tr>
                                            <td colSpan="2" className="text-end text-uppercase">Totals</td>
                                            <td className="text-end">{formatKES(entry.total_debit || entry.lines?.reduce((s, l) => s + Number(l.debit), 0))}</td>
                                            <td className="text-end">{formatKES(entry.total_credit || entry.lines?.reduce((s, l) => s + Number(l.credit), 0))}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Signatures */}
                            <div className="row mt-5 pt-4">
                                <div className="col-4">
                                    <div className="border-top border-dark border-1 p-2">
                                        <p className="mb-0 fw-bold small text-uppercase">Prepared By</p>
                                        <p className="text-muted x-small">{entry.created_by_name || 'System User'}</p>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="border-top border-dark border-1 p-2">
                                        <p className="mb-0 fw-bold small text-uppercase">Approved By</p>
                                        <p className="text-muted x-small">Finance Manager</p>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="border-top border-dark border-1 p-2">
                                        <p className="mb-0 fw-bold small text-uppercase">Received By</p>
                                        <p className="text-muted x-small">Date: _________________</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-5 text-center text-muted x-small">
                                <p>Generated on {new Date().toLocaleString()} | Fahari Ecosystem System</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #journal-voucher-print-area, #journal-voucher-print-area * {
                        visibility: visible;
                    }
                    #journal-voucher-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                        margin: 0;
                        padding: 0;
                        overflow: visible!important;
                    }
                }
            `}</style>
        </div>
    );
};

export default JournalVoucherModal;
