import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    Circle,
    FileText,
    Shield,
    UserCheck,
    Award,
    Briefcase,
    Clock,
    ChevronRight,
    AlertCircle,
    Loader
} from 'lucide-react';
import { toast } from 'react-toastify';
import { recruitmentService } from '../services/recruitmentService';

// Import subcomponents
import InterviewEvaluation from './components/InterviewEvaluation';
import ComplianceChecks from './components/ComplianceChecks';
import FinalApproval from './components/FinalApproval';
import OfferStage from './components/OfferStage';
import OnboardingStage from './components/OnboardingStage';
import ProbationStage from './components/ProbationStage';

const RecruitmentWorkflow = ({ applicationId = 1 }) => {
    // State
    const [loading, setLoading] = useState(true);
    const [candidateData, setCandidateData] = useState(null);
    const [currentStage, setCurrentStage] = useState(4); // Start at Stage 4 (post-interview)
    const [completedStages, setCompletedStages] = useState([]);

    // Fetch Workflow Data
    const fetchWorkflow = async () => {
        try {
            setLoading(true);
            const data = await recruitmentService.getWorkflow(applicationId);
            setCandidateData(data);

            // Determine progress based on data
            const completed = [];
            if (data.evaluation) completed.push(4);
            if (data.compliance?.is_complete) completed.push(5);
            if (data.selection?.decision) completed.push(6);
            if (data.offer?.status === 'accepted') completed.push(7); // Or 'sent' depending on logic
            if (data.onboarding?.is_completed) completed.push(8);
            if (data.probation?.status === 'confirmed') completed.push(9);

            setCompletedStages(completed);

            // Auto-advance logic could go here
            if (completed.includes(4) && currentStage === 4) setCurrentStage(5);
            // ... etc

        } catch (error) {
            console.error("Failed to fetch workflow:", error);
            toast.error("Could not load candidate workflow");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicationId) {
            fetchWorkflow();
        }
    }, [applicationId]);

    // Workflow Stages Config
    const stages = [
        { id: 4, title: "Evaluation", icon: FileText, label: "Interview Evaluation" },
        { id: 5, title: "Compliance", icon: Shield, label: "Compliance Checks" },
        { id: 6, title: "Approval", icon: UserCheck, label: "Final Selection" },
        { id: 7, title: "Offer", icon: Award, label: "Offer & Appointment" },
        { id: 8, title: "Onboarding", icon: Briefcase, label: "Onboarding" },
        { id: 9, title: "Probation", icon: Clock, label: "Probation Details" }
    ];

    const handleStageComplete = () => {
        fetchWorkflow();
        toast.success("Stage updated successfully");
    };

    const handleStageClick = (stageId) => {
        if (completedStages.includes(stageId - 1) || stageId === 4 || completedStages.includes(stageId)) {
            setCurrentStage(stageId);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <Loader size={32} className="animate-spin text-primary mb-3 mx-auto" />
                    <p className="text-muted">Loading workflow data...</p>
                </div>
            </div>
        );
    }

    if (!candidateData) {
        return <div className="p-5 text-center">Candidate not found</div>;
    }

    // Render Stage Content
    const renderStageContent = () => {
        switch (currentStage) {
            case 4:
                return (
                    <InterviewEvaluation
                        applicationId={applicationId}
                        interviewId={candidateData.active_interview_id}
                        data={candidateData.evaluation}
                        onComplete={handleStageComplete}
                    />
                );
            case 5:
                return (
                    <ComplianceChecks
                        applicationId={applicationId}
                        data={candidateData.compliance}
                        onComplete={handleStageComplete}
                    />
                );
            case 6:
                return (
                    <FinalApproval
                        applicationId={applicationId}
                        data={candidateData.selection}
                        candidate={candidateData}
                        onComplete={handleStageComplete}
                    />
                );
            case 7:
                return (
                    <OfferStage
                        applicationId={applicationId}
                        data={candidateData.offer}
                        candidate={candidateData}
                        onComplete={handleStageComplete}
                    />
                );
            case 8:
                return (
                    <OnboardingStage
                        applicationId={applicationId}
                        data={candidateData.onboarding}
                        onComplete={handleStageComplete}
                    />
                );
            case 9:
                return (
                    <ProbationStage
                        applicationId={applicationId} // Probation typically by employeeId, but service can handle mapping if needed
                        data={candidateData.probation}
                        onComplete={handleStageComplete}
                    />
                );
            default:
                return <div className="p-5 text-center">Unknown Stage</div>;
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Candidate Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 text-gray-800">Recruitment Workflow</h1>
                    <p className="text-muted mb-0">Managing detailed stages for: <span className="fw-bold text-dark">{candidateData.full_name}</span></p>
                </div>
                <div className="badge bg-light text-dark border p-2">
                    Position: {candidateData.position}
                </div>
            </div>

            {/* Stepper */}
            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body py-4">
                    <div className="position-relative d-flex justify-content-between">
                        {/* Connecting Line */}
                        <div className="position-absolute top-50 start-0 w-100 translate-middle-y bg-light" style={{ height: '4px', zIndex: 0 }}></div>
                        <div className="position-absolute top-50 start-0 translate-middle-y bg-primary transition-all"
                            style={{
                                height: '4px',
                                zIndex: 0,
                                width: `${((Math.max(4, ...completedStages) - 4) / (stages.length - 1)) * 100}%`, // Estimate progress bar
                                transition: 'width 0.5s ease'
                            }}>
                        </div>

                        {stages.map((stage) => {
                            const isCompleted = completedStages.includes(stage.id);
                            const isActive = currentStage === stage.id;
                            const isClickable = isCompleted || isActive || (completedStages.includes(stage.id - 1)) || stage.id === 4;

                            return (
                                <div
                                    key={stage.id}
                                    className={`position-relative z-1 text-center ${isClickable ? 'cursor-pointer' : 'opacity-50'}`}
                                    onClick={() => isClickable && handleStageClick(stage.id)}
                                    style={{ width: '100px', cursor: isClickable ? 'pointer' : 'default' }}
                                >
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 transition-all ${isCompleted ? 'bg-success text-white' :
                                            isActive ? 'bg-primary text-white ring-4 ring-primary-light' :
                                                'bg-white border text-muted'
                                            }`}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            border: isActive ? 'none' : '2px solid #e5e7eb',
                                            boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
                                        }}
                                    >
                                        {isCompleted ? <CheckCircle size={20} /> : <stage.icon size={18} />}
                                    </div>
                                    <span className={`small fw-bold d-block ${isActive ? 'text-primary' : 'text-muted'}`}>
                                        {stage.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Stage Content */}
            <div className="row">
                <div className="col-12">
                    {renderStageContent()}
                </div>
            </div>
        </div>
    );
};

export default RecruitmentWorkflow;

