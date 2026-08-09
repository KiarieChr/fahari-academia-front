import React, { useState } from 'react';
import { Shield, Check, AlertCircle, Upload, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { recruitmentService } from '../../services/recruitmentService';

const ComplianceChecks = ({ applicationId, data, onComplete }) => {
    // Map backend data to frontend state
    const [checks, setChecks] = useState({
        certificates: data?.certificates_verified || false,
        teachingLicense: data?.teaching_license_verified || false,
        references: data?.references_checked || false,
        criminalRecord: data?.criminal_clearance_verified || false,
        medical: data?.medical_clearance_verified || false
    });

    const [isSubmitted, setIsSubmitted] = useState(!!data?.is_complete); // is_complete is from serializer method
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allCleared = Object.values(checks).every(val => val === true);

    const handleCheck = (key) => {
        if (isSubmitted) return;
        setChecks(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleComplete = async () => {
        try {
            setIsSubmitting(true);

            const payload = {
                application: applicationId,
                certificates_verified: checks.certificates,
                teaching_license_verified: checks.teachingLicense,
                references_checked: checks.references,
                criminal_clearance_verified: checks.criminalRecord, // Correct field name
                medical_clearance_verified: checks.medical,
                notes: allCleared ? "All checks passed" : "Proceeded with warnings"
            };

            // Call service (id likely null if first time, but we use updateCompliance which handles create)
            await recruitmentService.updateCompliance(data?.id, payload);

            setIsSubmitted(true);
            toast.success("Compliance checks updated");
            onComplete();

        } catch (error) {
            console.error("Compliance update error:", error);
            toast.error("Failed to update compliance checks");
        } finally {
            setIsSubmitting(false);
        }
    };

    const CheckItem = ({ id, label, description }) => (
        <div className={`d-flex align-items-center justify-content-between p-3 border rounded mb-3 ${checks[id] ? 'bg-success-subtle border-success' : 'bg-white'}`}>
            <div className="d-flex align-items-center">
                <div
                    className={`rounded-circle d-flex align-items-center justify-content-center me-3 cursor-pointer ${checks[id] ? 'bg-success text-white' : 'bg-light border text-muted'}`}
                    style={{ width: '28px', height: '28px', minWidth: '28px' }}
                    onClick={() => handleCheck(id)}
                >
                    {checks[id] && <Check size={16} />}
                </div>
                <div>
                    <h6 className="mb-0 fw-bold text-dark" onClick={() => handleCheck(id)} style={{ cursor: 'pointer' }}>{label}</h6>
                    <small className="text-muted">{description}</small>
                </div>
            </div>

            {/* Mock Upload Button */}
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" disabled={isSubmitted} title="Upload Document">
                <Upload size={14} className="me-1" />
                <span className="d-none d-sm-inline">Upload</span>
            </button>
        </div>
    );

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold text-info">Background & Compliance Checks</h5>
            </div>
            <div className="card-body">
                {isSubmitted && (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                        <Shield size={18} className="me-2" />
                        <div>
                            <strong>Compliance Verified.</strong> All checks have been documented.
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-12">
                        <p className="text-muted mb-4">Verify the following requirements before proceeding to final selection.</p>

                        <CheckItem
                            id="certificates"
                            label="Academic Certificates Verified"
                            description="Original degree certificates and transcripts sighted."
                        />
                        <CheckItem
                            id="teachingLicense"
                            label="Teaching License / Register"
                            description="Valid TSC number and registration status confirmed."
                        />
                        <CheckItem
                            id="references"
                            label="Reference Checks"
                            description="At least two professional referees contacted."
                        />
                        <CheckItem
                            id="criminalRecord"
                            label="Criminal Clearance (Police Clearance)"
                            description="Valid Certificate of Good Conduct verified."
                        />
                        <CheckItem
                            id="medical"
                            label="Medical Clearance (Optional)"
                            description="Fit to work certificate received from designated provider."
                        />
                    </div>
                </div>

                {!isSubmitted && (
                    <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                        <div>
                            {!allCleared && (
                                <span className="text-warning small d-flex align-items-center">
                                    <AlertCircle size={14} className="me-1" />
                                    Warning: Not all checks are cleared.
                                </span>
                            )}
                        </div>
                        <button
                            className={`btn ${allCleared ? 'btn-success' : 'btn-warning'} px-4 py-2 fw-medium`}
                            onClick={handleComplete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Shield size={18} className="me-2 mb-1" />
                                    {allCleared ? 'Mark Compliance Complete' : 'Proceed with Warnings'}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplianceChecks;


