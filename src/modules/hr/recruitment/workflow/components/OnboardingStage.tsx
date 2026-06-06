import React, { useState, useEffect } from 'react';
import { Briefcase, CheckSquare, Settings, Users, BookOpen, Calendar, ArrowRight } from 'lucide-react';

const OnboardingStage = ({ data, onComplete }) => {
    const [checklist, setChecklist] = useState(data || {
        profileCreated: false,
        systemAccess: false,
        departmentAssigned: false,
        documentsSubmitted: false,
        timetableAssigned: false,
        progress: 0
    });

    const [isSubmitted, setIsSubmitted] = useState(data && data.progress === 100);

    // Calculate progress
    useEffect(() => {
        const total = 5; // Number of items
        const completed = Object.values(checklist).filter(val => val === true && typeof val !== 'number').length;
        const progress = Math.round((completed / total) * 100);

        if (progress !== checklist.progress) {
            setChecklist(prev => ({ ...prev, progress }));
        }
    }, [checklist]);

    const handleToggle = (key) => {
        if (isSubmitted) return;
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleComplete = () => {
        setIsSubmitted(true);
        onComplete(checklist);
    };

    const OnboardingItem = ({ id, label, icon: Icon, description }) => (
        <div
            className={`d-flex align-items-center p-3 border rounded mb-3 bg-white ${isSubmitted ? 'opacity-75' : 'cursor-pointer hover-shadow'}`}
            onClick={() => handleToggle(id)}
            style={{ transition: 'all 0.2s', cursor: isSubmitted ? 'default' : 'pointer' }}
        >
            <div
                className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${checklist[id] ? 'bg-success text-white' : 'bg-light border text-muted'}`}
                style={{ width: '40px', height: '40px', minWidth: '40px' }}
            >
                <Icon size={20} />
            </div>
            <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold text-dark">{label}</h6>
                    {checklist[id] && <CheckSquare size={18} className="text-success" />}
                </div>
                <small className="text-muted">{description}</small>
            </div>
        </div>
    );

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold text-secondary">Onboarding & Deployment</h5>
            </div>
            <div className="card-body">
                {isSubmitted && (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                        <Briefcase size={18} className="me-2" />
                        <div>
                            <strong>Onboarding Complete.</strong> The employee is now fully deployed.
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-md-4 mb-4 mb-md-0">
                        {/* Progress Visual */}
                        <div className="text-center p-4 bg-light rounded h-100 d-flex flex-column justify-content-center align-items-center">
                            <h6 className="text-muted text-uppercase small fw-bold mb-3">Onboarding Progress</h6>
                            <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '150px', height: '150px' }}>
                                <svg width="150" height="150" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e9ecef" strokeWidth="8" />
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke={checklist.progress === 100 ? "#198754" : "#0d6efd"}
                                        strokeWidth="8"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * checklist.progress) / 100}
                                        transform="rotate(-90 50 50)"
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                    />
                                </svg>
                                <div className="position-absolute text-center">
                                    <h2 className={`mb-0 fw-bold ${checklist.progress === 100 ? "text-success" : "text-primary"}`}>{checklist.progress}%</h2>
                                </div>
                            </div>
                            <p className="mt-3 text-muted small px-3">
                                Complete all checklist items to finalize the deployment process.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="mb-2">
                            <OnboardingItem
                                id="profileCreated"
                                label="Staff Profile Created"
                                icon={Users}
                                description="Official record created in HR system with employee ID."
                            />
                            <OnboardingItem
                                id="systemAccess"
                                label="System Access & Email"
                                icon={Settings}
                                description="ERP login credentials and official email address generated."
                            />
                            <OnboardingItem
                                id="departmentAssigned"
                                label="Department Allocation"
                                icon={Briefcase}
                                description="Physically reported to department head."
                            />
                            <OnboardingItem
                                id="timetableAssigned"
                                label="Timetable / Workload"
                                icon={Calendar}
                                description="Teaching timetable or work schedule assigned."
                            />
                            <OnboardingItem
                                id="documentsSubmitted"
                                label="Final Document Submission"
                                icon={BookOpen}
                                description="Signed contract and statutory forms (KRA, NHIF, NSSF) filed."
                            />
                        </div>

                        {!isSubmitted && (
                            <div className="d-flex justify-content-end mt-4">
                                <button
                                    className={`btn ${checklist.progress === 100 ? 'btn-success' : 'btn-secondary'} px-4 py-2 fw-bold`}
                                    onClick={handleComplete}
                                    disabled={checklist.progress !== 100}
                                >
                                    Complete Onboarding <ArrowRight size={18} className="ms-2" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingStage;
