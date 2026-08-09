import React, { useState } from 'react';
import { Clock, Star, AlertTriangle, PlayCircle, CheckCircle } from 'lucide-react';

const ProbationStage = ({ data, onComplete }) => {
    const [probationData, setProbationData] = useState(data || {
        startDate: '2024-05-01',
        reviewDate: '2024-11-01',
        status: 'Active', // Active, Confirmed, Extended, Terminated
        rating: 0,
        remarks: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(data && data.status !== 'Active');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProbationData(prev => ({ ...prev, [name]: value }));
    };

    const handleRating = (stars) => {
        if (isSubmitted) return;
        setProbationData(prev => ({ ...prev, rating: stars }));
    };

    const handleAction = (action) => {
        if (!probationData.rating && action === 'Confirmed') {
            alert("Please provide a performance rating before confirming.");
            return;
        }

        const updatedData = { ...probationData, status: action };
        setProbationData(updatedData);
        setIsSubmitted(true);
        onComplete(updatedData);
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold text-dark">Probation Monitoring</h5>
            </div>
            <div className="card-body">
                {isSubmitted && (
                    <div className={`alert d-flex align-items-center mb-4 ${probationData.status === 'Confirmed' ? 'alert-success' :
                            probationData.status === 'Extended' ? 'alert-warning' :
                                'alert-danger'
                        }`}>
                        <div className="me-2">
                            {probationData.status === 'Confirmed' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        </div>
                        <div>
                            <strong>Status Updated: </strong> Employee has been <span className="fw-bold">{probationData.status}</span>.
                        </div>
                    </div>
                )}

                <div className="row g-4 mb-4">
                    <div className="col-md-5">
                        <div className="card bg-light border-0">
                            <div className="card-body">
                                <h6 className="fw-bold text-uppercase small text-muted mb-3">Probation Details</h6>
                                <div className="mb-3">
                                    <label className="text-muted small">Start Date</label>
                                    <div className="fw-bold fs-5">{probationData.startDate}</div>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small">Review Due Date</label>
                                    <div className="fw-bold fs-5 text-primary">{probationData.reviewDate}</div>
                                </div>
                                <div className="mb-0">
                                    <label className="text-muted small">Current Status</label>
                                    <div>
                                        <span className={`badge ${probationData.status === 'Active' ? 'bg-primary' :
                                                probationData.status === 'Confirmed' ? 'bg-success' :
                                                    probationData.status === 'Extended' ? 'bg-warning text-dark' :
                                                        'bg-danger'
                                            }`}>
                                            {probationData.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-7">
                        <h6 className="fw-bold mb-3">Performance Evaluation</h6>

                        <div className="mb-4">
                            <label className="form-label text-muted small">Overall Performance Rating</label>
                            <div className="d-flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={32}
                                        className={`cursor-pointer transition-all ${star <= probationData.rating ? 'text-warning fill-warning' : 'text-muted opacity-25'}`}
                                        fill={star <= probationData.rating ? "currentColor" : "none"}
                                        onClick={() => handleRating(star)}
                                        style={{ cursor: isSubmitted ? 'default' : 'pointer' }}
                                    />
                                ))}
                            </div>
                            <small className="text-muted">
                                {probationData.rating === 0 ? "Click to rate" :
                                    probationData.rating >= 4 ? "Exceeds Expectations" :
                                        probationData.rating === 3 ? "Meets Expectations" : "Needs Improvement"}
                            </small>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-medium">Supervisor Remarks</label>
                            <textarea
                                className="form-control"
                                name="remarks"
                                rows="3"
                                value={probationData.remarks}
                                onChange={handleChange}
                                disabled={isSubmitted}
                                placeholder="Summary of performance during probation period..."
                            ></textarea>
                        </div>

                        {!isSubmitted && (
                            <div className="d-flex gap-2">
                                <button className="btn btn-success flex-grow-1 py-2" onClick={() => handleAction('Confirmed')}>
                                    <CheckCircle size={18} className="me-2 mb-1" />
                                    Confirm Employment
                                </button>
                                <button className="btn btn-warning flex-grow-1 py-2" onClick={() => handleAction('Extended')}>
                                    <Clock size={18} className="me-2 mb-1" />
                                    Extend Probation
                                </button>
                                <button className="btn btn-outline-danger flex-grow-0 py-2" onClick={() => handleAction('Terminated')}>
                                    Terminate
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProbationStage;
