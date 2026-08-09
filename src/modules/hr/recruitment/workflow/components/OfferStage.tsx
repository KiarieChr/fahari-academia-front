import React, { useState } from 'react';
import { Award, Send, CheckCircle, Download, Edit2 } from 'lucide-react';

const OfferStage = ({ data, candidate, onComplete }) => {
    if (!candidate) return <div className="p-4 text-center text-muted">No candidate data available.</div>;

    const [offerDetails, setOfferDetails] = useState(data?.details || {
        position: candidate?.position || '',
        salary: '45,000',
        currency: 'KES',
        startDate: '2024-05-01',
        contractType: 'Permanent',
        probationPeriod: '6 Months'
    });

    // Status tracking: Generated -> Sent -> Accepted
    const [status, setStatus] = useState({
        generated: data?.generated || false,
        sent: data?.sent || false,
        accepted: data?.accepted || false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfferDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = () => {
        setStatus(prev => ({ ...prev, generated: true }));
    };

    const handleSend = () => {
        setStatus(prev => ({ ...prev, sent: true }));
    };

    const handleAcceptance = (isAccepted) => {
        if (isAccepted) {
            const newStatus = { ...status, accepted: true };
            setStatus(newStatus);
            onComplete({ status: newStatus, details: offerDetails });
        } else {
            alert("Offer Declined logic not implemented in mock.");
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold text-success">Offer & Appointment</h5>
            </div>
            <div className="card-body">
                {status.accepted && (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                        <Award size={18} className="me-2" />
                        <div>
                            <strong>Offer Accepted!</strong> The candidate has successfully accepted the offer.
                        </div>
                    </div>
                )}

                <div className="row g-4">
                    {/* Offer Details Form */}
                    <div className="col-md-5">
                        <div className="card bg-light border-0 h-100">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                    <Edit2 size={16} className="me-2" />
                                    Offer Terms
                                </h6>
                                <div className="mb-3">
                                    <label className="form-label small text-muted">Position Title</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm fw-bold"
                                        name="position"
                                        value={offerDetails.position}
                                        onChange={handleChange}
                                        disabled={status.accepted}
                                    />
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label small text-muted">Basic Salary</label>
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text">{offerDetails.currency}</span>
                                            <input
                                                type="text"
                                                className="form-control fw-bold"
                                                name="salary"
                                                value={offerDetails.salary}
                                                onChange={handleChange}
                                                disabled={status.accepted}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted">Contract Type</label>
                                        <select
                                            className="form-select form-select-sm"
                                            name="contractType"
                                            value={offerDetails.contractType}
                                            onChange={handleChange}
                                            disabled={status.accepted}
                                        >
                                            <option>Permanent</option>
                                            <option>Contract</option>
                                            <option>Temporary</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6">
                                        <label className="form-label small text-muted">Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            name="startDate"
                                            value={offerDetails.startDate}
                                            onChange={handleChange}
                                            disabled={status.accepted}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-muted">Probation</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            name="probationPeriod"
                                            value={offerDetails.probationPeriod}
                                            onChange={handleChange}
                                            disabled={status.accepted}
                                        />
                                    </div>
                                </div>

                                {!status.generated && !status.accepted && (
                                    <button className="btn btn-primary w-100 mt-2" onClick={handleGenerate}>
                                        Generate Offer Letter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preview & Actions */}
                    <div className="col-md-7">
                        {/* Preview Placeholder */}
                        <div className="border rounded p-4 bg-white mb-4 position-relative" style={{ minHeight: '300px' }}>
                            {!status.generated ? (
                                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                    <Award size={48} className="mb-3 opacity-25" />
                                    <p>Configure offer terms to generate the letter.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-3">
                                        <div>
                                            <div className="fw-bold fs-5">OFFER OF EMPLOYMENT</div>
                                            <div className="text-muted small">Ref: HR/OFF/2024/001</div>
                                        </div>
                                        <div className="badge bg-light text-dark border">
                                            {status.accepted ? <span className="text-success fw-bold">ACCEPTED</span> : 'DRAFT'}
                                        </div>
                                    </div>

                                    <div className="small text-muted mb-3">
                                        <p className="mb-1">Dear {candidate.name},</p>
                                        <p>We are pleased to offer you the position of <strong className="text-dark">{offerDetails.position}</strong>...</p>
                                        <ul className="list-unstyled bg-light p-3 rounded">
                                            <li>• Salary: {offerDetails.currency} {offerDetails.salary}</li>
                                            <li>• Start Date: {offerDetails.startDate}</li>
                                            <li>• Probation:  {offerDetails.probationPeriod}</li>
                                        </ul>
                                    </div>

                                    <div className="d-flex gap-2 justify-content-end no-print">
                                        <button className="btn btn-sm btn-outline-secondary">
                                            <Download size={14} className="me-1" /> PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        {status.generated && !status.accepted && (
                            <div className="card border-0 bg-light">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">Actions</h6>
                                    <div className="d-flex gap-3">
                                        <button
                                            className={`btn ${status.sent ? 'btn-success disabled' : 'btn-primary'}`}
                                            onClick={handleSend}
                                            disabled={status.sent}
                                        >
                                            <Send size={16} className="me-2" />
                                            {status.sent ? 'Offer Sent' : 'Send Offer to Candidate'}
                                        </button>

                                        {status.sent && (
                                            <div className="vr mx-2"></div>
                                        )}

                                        {status.sent && (
                                            <button className="btn btn-outline-success" onClick={() => handleAcceptance(true)}>
                                                <CheckCircle size={16} className="me-2" />
                                                Mark as Accepted
                                            </button>
                                        )}
                                    </div>
                                    {status.sent && (
                                        <small className="text-muted d-block mt-2">
                                            <i className="bi bi-info-circle"></i> Waiting for candidate response...
                                        </small>
                                    )}
                                </div>
                            </div>
                        )}

                        {status.accepted && (
                            <div className="d-grid">
                                <button className="btn btn-success btn-lg disabled" disabled>
                                    Proceed to Onboarding
                                </button>
                                <small className="text-center text-muted mt-2">
                                    (System automatically advances to next stage)
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfferStage;
