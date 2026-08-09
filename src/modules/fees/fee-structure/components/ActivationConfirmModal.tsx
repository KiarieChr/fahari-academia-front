import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { calculateTotalTermFee } from '../utils/feeStructureUtils';

const ActivationConfirmModal = ({
    show,
    onClose,
    onConfirm,
    structure,
    feeItems
}) => {
    if (!show || !structure) return null;

    const totalFee = calculateTotalTermFee(feeItems);
    const mandatoryTotal = feeItems.filter(i => i.mandatory).reduce((sum, i) => sum + i.amount, 0);
    const optionalTotal = feeItems.filter(i => !i.mandatory).reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title d-flex align-items-center fw-bold">
                            <CheckCircle className="me-2" size={24} />
                            Activate Fee Structure
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="alert alert-warning d-flex align-items-start border-warning-subtle">
                            <AlertTriangle className="text-warning me-3 mt-1 flex-shrink-0" size={20} />
                            <div className="small">
                                <strong>Warning:</strong> Activation makes this structure visible to the Finance Department and potentially to Student Billing.
                                <br />
                                Editing will be restricted after students are billed.
                            </div>
                        </div>

                        <div className="card bg-light border-0 mb-4">
                            <div className="card-body">
                                <h6 className="text-uppercase text-muted small fw-bold mb-3">Structure Summary</h6>

                                <div className="d-flex justify-content-between mb-2">
                                    <span>Class/Grade:</span>
                                    <span className="fw-bold">{structure.className}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Term:</span>
                                    <span className="fw-bold">{structure.term} {structure.academicYear}</span>
                                </div>
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between mb-1">
                                    <span className="text-danger">Mandatory items:</span>
                                    <span>KES {mandatoryTotal.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-info">Optional items:</span>
                                    <span>KES {optionalTotal.toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between fw-bold fs-5 pt-2 border-top border-dark">
                                    <span>Grand Total:</span>
                                    <span>KES {totalFee.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <p className="mb-0 text-center text-muted small">
                            Are you sure you want to proceed?
                        </p>
                    </div>
                    <div className="modal-footer bg-light border-top-0 justify-content-between">
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose}>
                            <X size={16} className="me-2" /> Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-success px-4 fw-bold"
                            onClick={onConfirm}
                        >
                            Confirm & Activate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivationConfirmModal;
