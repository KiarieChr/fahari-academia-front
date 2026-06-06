import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatKES } from '../utils/receiptUtils';
import { reversalReasons } from '../data/mockReceiptData';

const ReverseReceiptModal = ({ show, receipt, onClose, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    const handleSubmit = () => {
        if (!reason) {
            alert('Please select a reversal reason');
            return;
        }
        if (!confirmed) {
            alert('Please confirm that you want to reverse this receipt');
            return;
        }

        onConfirm({
            ...receipt,
            status: 'Reversed',
            reversalReason: reason + (notes ? `: ${notes}` : '')
        });

        // Reset form
        setReason('');
        setNotes('');
        setConfirmed(false);
        onClose();
    };

    if (!show || !receipt) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">
                            <AlertTriangle size={20} className="me-2" />
                            Reverse Receipt
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Warning Alert */}
                        <div className="alert alert-warning">
                            <strong>Warning:</strong> This action will reverse the receipt and create a reversal entry. This cannot be undone.
                        </div>

                        {/* Receipt Details */}
                        <div className="card border-danger mb-3">
                            <div className="card-body">
                                <h6 className="card-title">Receipt to be Reversed</h6>
                                <table className="table table-sm mb-0">
                                    <tbody>
                                        <tr>
                                            <td className="fw-semibold">Receipt Number:</td>
                                            <td>{receipt.receiptNumber}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold">Payer:</td>
                                            <td>{receipt.payerName}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold">Amount:</td>
                                            <td className="text-danger fw-bold">{formatKES(receipt.amount)}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold">Date:</td>
                                            <td>{receipt.date}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Reversal Reason */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">
                                Reversal Reason <span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-select"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            >
                                <option value="">Select a reason...</option>
                                {reversalReasons.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {/* Additional Notes */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Additional Notes</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Provide additional details about the reversal..."
                            ></textarea>
                        </div>

                        {/* Confirmation Checkbox */}
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="confirmReversal"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="confirmReversal">
                                I confirm that I want to reverse this receipt
                            </label>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleSubmit}
                            disabled={!reason || !confirmed}
                        >
                            <AlertTriangle size={16} className="me-1" />
                            Reverse Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReverseReceiptModal;
