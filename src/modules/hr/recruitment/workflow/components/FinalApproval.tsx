import React, { useState } from 'react';
import { UserCheck, CheckCircle, XCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { recruitmentService } from '../../services/recruitmentService';

const FinalApproval = ({ applicationId, data, candidate, onComplete }) => {
    // data is the SelectionDecision object from backend
    const [approvalData, setApprovalData] = useState({
        decision: data?.decision || '', // Selected, Waitlisted, Not Selected
        hrApproved: data?.hr_approved || false,
        principalApproved: data?.principal_approved || false,
        remarks: data?.remarks || ''
    });

    const [isSubmitted, setIsSubmitted] = useState(!!data?.decision && (data?.hr_approved && data?.principal_approved));
    const [loading, setLoading] = useState(false);

    // Derive summary data from previous stages (passed in candidate object)
    // Adjust logic to robustly handle missing data
    const interviewScore = candidate?.evaluation?.overall_score || 0; // Using backend field names if mapped, or checking both

    // Check compliance status
    const complianceStatus = candidate?.compliance?.is_complete ? 'Cleared' : 'Pending';

    const handleApprovalToggle = async (role) => {
        if (isSubmitted) return;

        // Optimistic UI update or wait for API?
        // Better to wait for API to confirm permission
        try {
            // Ensure record exists first
            let currentId = data?.id;
            if (!currentId) {
                // Must create first
                const res = await recruitmentService.updateSelection(null, {
                    application: applicationId,
                    decision: approvalData.decision || 'waitlisted', // Default to waitlist if undetermined
                    remarks: approvalData.remarks
                });
                currentId = res.id;
            }

            toast.loading(`Verifying ${role} approval...`);
            await recruitmentService.approveSelection(currentId, role === 'hrApproved' ? 'hr' : 'principal');
            toast.dismiss();
            toast.success(`${role === 'hrApproved' ? 'HR' : 'Principal'} Approval Recorded`);

            // Update local state
            setApprovalData(prev => ({ ...prev, [role]: true }));

            // Refresh parent to get updated timestamps/approver names
            onComplete();

        } catch (error) {
            console.error("Approval error:", error);
            toast.dismiss();
            toast.error("Approval failed. Are you authorized?");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApprovalData(prev => ({ ...prev, [name]: value }));
    };

    const handleComplete = async () => {
        if (!approvalData.decision) {
            toast.error("Please select a final decision.");
            return;
        }

        try {
            setLoading(true);

            let currentId = data?.id;
            const payload = {
                application: applicationId,
                decision: approvalData.decision, // matches backend choices (selected, waitlisted, not_selected) - Need to ensure case matches
                // Valid choices: 'selected', 'waitlisted', 'not_selected' -> Assuming value matches
                remarks: approvalData.remarks
            };

            await recruitmentService.updateSelection(currentId, payload);

            setIsSubmitted(true);
            toast.success("Selection decision finalized");
            onComplete();

        } catch (error) {
            console.error("Finalization error:", error);
            toast.error("Failed to save decision");
        } finally {
            setLoading(false);
        }
    };

    const isApprovable = approvalData.hrApproved && approvalData.principalApproved;

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold text-warning">Final Selection & Approval</h5>
            </div>
            <div className="card-body">
                {isSubmitted && (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                        <UserCheck size={18} className="me-2" />
                        <div>
                            <strong>Selection Finalized.</strong> Decision: <span className="fw-bold text-uppercase">{approvalData.decision}</span>
                        </div>
                    </div>
                )}

                <div className="row g-4 mb-4">
                    {/* Candidate Summary */}
                    <div className="col-md-5">
                        <div className="card bg-light border-0 h-100">
                            <div className="card-body">
                                <h6 className="fw-bold text-muted text-uppercase small mb-3">Candidate Summary</h6>
                                <div className="mb-3">
                                    <label className="text-muted small">Applicant Name</label>
                                    <div className="fw-bold">{candidate.full_name || candidate.name}</div>
                                </div>
                                <div className="mb-3">
                                    <label className="text-muted small">Position</label>
                                    <div className="fw-bold">{candidate.position}</div>
                                </div>
                                <div className="row">
                                    <div className="col-6 mb-3">
                                        <label className="text-muted small">Interview Score</label>
                                        <div className="h4 mb-0 fw-bold text-primary">{interviewScore}%</div>
                                    </div>
                                    <div className="col-6 mb-3">
                                        <label className="text-muted small">Compliance</label>
                                        <div className={`badge ${complianceStatus === 'Cleared' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                            {complianceStatus}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Approval Form */}
                    <div className="col-md-7">
                        <div className="mb-4">
                            <label className="form-label fw-bold">Selection Decision</label>
                            <select
                                className="form-select form-select-lg"
                                name="decision"
                                value={approvalData.decision}
                                onChange={handleChange}
                                disabled={isSubmitted}
                            >
                                <option value="">-- Select Decision --</option>
                                <option value="selected">Selected for Appointment</option>
                                <option value="waitlisted">Waitlisted / Reserve</option>
                                <option value="not_selected">Not Selected</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-medium">Approval Chain</label>
                            <div className="d-flex flex-column gap-3">
                                {/* HR Approval */}
                                <div
                                    className={`d-flex align-items-center justify-content-between p-3 border rounded ${approvalData.hrApproved ? 'bg-success-subtle border-success' : ''} ${!isSubmitted ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleApprovalToggle('hrApproved')}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${approvalData.hrApproved ? 'bg-success text-white' : 'bg-light border'}`} style={{ width: 32, height: 32 }}>
                                            {approvalData.hrApproved && <CheckCircle size={18} />}
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">HR Manager Approval</h6>
                                            <small className="text-muted">Verifies all checks and processes are complete.</small>
                                        </div>
                                    </div>
                                    {!approvalData.hrApproved && !isSubmitted && <span className="badge bg-secondary">Pending</span>}
                                    {approvalData.hrApproved && <span className="badge bg-success">Approved</span>}
                                </div>

                                {/* Principal Approval */}
                                <div
                                    className={`d-flex align-items-center justify-content-between p-3 border rounded ${approvalData.principalApproved ? 'bg-success-subtle border-success' : ''} ${!isSubmitted ? 'cursor-pointer' : ''}`}
                                    onClick={() => handleApprovalToggle('principalApproved')}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${approvalData.principalApproved ? 'bg-success text-white' : 'bg-light border'}`} style={{ width: 32, height: 32 }}>
                                            {approvalData.principalApproved && <CheckCircle size={18} />}
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">Principal / Director Approval</h6>
                                            <small className="text-muted">Final authorization for appointment.</small>
                                        </div>
                                    </div>
                                    {!approvalData.principalApproved && !isSubmitted && <span className="badge bg-secondary">Pending</span>}
                                    {approvalData.principalApproved && <span className="badge bg-success">Approved</span>}
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-medium">Final Remarks / Conditions</label>
                            <textarea
                                className="form-control"
                                name="remarks"
                                rows="2"
                                value={approvalData.remarks}
                                onChange={handleChange}
                                disabled={isSubmitted}
                                placeholder="Any specific conditions for this appointment (e.g. subject to medical clearance)..."
                            ></textarea>
                        </div>

                        {!isSubmitted && (
                            <div className="d-grid">
                                <button
                                    className={`btn btn-lg ${isApprovable && approvalData.decision ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={handleComplete}
                                    disabled={!isApprovable || !approvalData.decision || loading}
                                >
                                    {loading ? <Loader className="animate-spin" /> : "Finalize & Proceed to Offer"}
                                </button>
                                {(!isApprovable || !approvalData.decision) && (
                                    <small className="text-center text-muted mt-2">
                                        * Select a decision and ensure both approvals are granted to proceed.
                                    </small>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalApproval;


