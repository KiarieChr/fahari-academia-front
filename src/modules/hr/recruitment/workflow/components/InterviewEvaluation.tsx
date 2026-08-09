import React, { useState } from 'react';
import { Save, Lock, AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { recruitmentService } from '../../services/recruitmentService';

const InterviewEvaluation = ({ applicationId, interviewId, data, onComplete }) => {
    // Initial state based on existing data or defaults
    // Mapping backend fields to frontend state
    const [scores, setScores] = useState({
        subjectKnowledge: data?.technical_skills_score || 0,
        teachingSkills: data?.problem_solving_score || 0, // Mapping to problem_solving
        communication: data?.communication_skills_score || 0,
        classroomManagement: data?.cultural_fit_score || 0, // Mapping to cultural_fit
        strengths: data?.strengths || '',
        areasForImprovement: data?.areas_for_improvement || '',
        additionalComments: data?.additional_comments || '',
        decision: data?.recommendation || 'reserve' // hire, reject, reserve, strong_hire
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(!!data);

    // Calculate total score (max 40)
    const totalScore =
        parseInt(scores.subjectKnowledge) +
        parseInt(scores.teachingSkills) +
        parseInt(scores.communication) +
        parseInt(scores.classroomManagement);

    const maxScore = 40;
    const percentage = ((totalScore / maxScore) * 100).toFixed(1);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setScores(prev => ({
            ...prev,
            [name]: ['strengths', 'areasForImprovement', 'additionalComments', 'decision'].includes(name)
                ? value
                : Math.min(10, Math.max(0, parseInt(value) || 0))
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!interviewId) {
            toast.error("No active interview found for this application.");
            return;
        }

        try {
            setIsSubmitting(true);

            // Map to backend payload
            const payload = {
                interview: interviewId,
                technical_skills_score: scores.subjectKnowledge,
                problem_solving_score: scores.teachingSkills,
                communication_skills_score: scores.communication,
                cultural_fit_score: scores.classroomManagement,
                recommendation: scores.decision, // ensure values match backend choices
                strengths: scores.strengths || "N/A", // Required field
                areas_for_improvement: scores.areasForImprovement || "N/A", // Required field
                additional_comments: scores.additionalComments,
                overall_score: (totalScore / 4).toFixed(2) // Scale to 10 (since max total is 40)
            };

            await recruitmentService.createInterviewEvaluation(payload);

            setIsSubmitted(true);
            toast.success("Evaluation submitted successfully");
            onComplete(); // Refresh parent

        } catch (error) {
            console.error("Evaluation submission error:", error);
            // safe error parsing
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Failed to submit evaluation";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold text-primary">Interview Evaluation & Scoring</h5>
            </div>
            <div className="card-body">
                {isSubmitted && (
                    <div className="alert alert-success d-flex align-items-center mb-4">
                        <Lock size={18} className="me-2" />
                        <div>
                            <strong>Evaluation Submitted.</strong> This stage is now locked.
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="row g-4 mb-4">
                        {/* Scoring Inputs */}
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Subject Knowledge (0-10)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="subjectKnowledge"
                                value={scores.subjectKnowledge}
                                onChange={handleChange}
                                min="0" max="10"
                                disabled={isSubmitted}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Teaching Skills (0-10)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="teachingSkills"
                                value={scores.teachingSkills}
                                onChange={handleChange}
                                min="0" max="10"
                                disabled={isSubmitted}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Communication (0-10)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="communication"
                                value={scores.communication}
                                onChange={handleChange}
                                min="0" max="10"
                                disabled={isSubmitted}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Classroom Management (0-10)</label>
                            <input
                                type="number"
                                className="form-control"
                                name="classroomManagement"
                                value={scores.classroomManagement}
                                onChange={handleChange}
                                min="0" max="10"
                                disabled={isSubmitted}
                                required
                            />
                        </div>
                    </div>

                    {/* Total & Decision */}
                    <div className="row mb-4 align-items-center bg-light p-3 rounded mx-0">
                        <div className="col-md-6 border-end">
                            <div className="d-flex align-items-center justify-content-between">
                                <h5 className="mb-0 text-muted">Total Score</h5>
                                <h2 className="mb-0 fw-bold text-primary">{totalScore} <span className="text-muted small fs-6">/ 40</span></h2>
                            </div>
                            <div className="progress mt-2" style={{ height: '6px' }}>
                                <div
                                    className={`progress-bar ${percentage >= 70 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}
                                    role="progressbar"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Final Decision</label>
                            <select
                                className="form-select fw-bold"
                                name="decision"
                                value={scores.decision}
                                onChange={handleChange}
                                disabled={isSubmitted}
                            >
                                <option value="hire">Hire - Proceed to Next Stage</option>
                                <option value="strong_hire">Strong Hire</option>
                                <option value="reserve">Reserve - Keep for Future</option>
                                <option value="reject">Reject Candidacy</option>
                            </select>
                        </div>
                    </div>

                    {/* Feedback Fields - Matching Backend Requirements */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Key Strengths</label>
                            <textarea
                                className="form-control"
                                name="strengths"
                                rows="3"
                                value={scores.strengths}
                                onChange={handleChange}
                                placeholder="What did the candidate do well?"
                                disabled={isSubmitted}
                                required
                            ></textarea>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Areas for Improvement</label>
                            <textarea
                                className="form-control"
                                name="areasForImprovement"
                                rows="3"
                                value={scores.areasForImprovement}
                                onChange={handleChange}
                                placeholder="Where does the candidate need to improve?"
                                disabled={isSubmitted}
                                required
                            ></textarea>
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-medium">Additional Comments (Optional)</label>
                            <textarea
                                className="form-control"
                                name="additionalComments"
                                rows="2"
                                value={scores.additionalComments}
                                onChange={handleChange}
                                placeholder="Any other observations..."
                                disabled={isSubmitted}
                            ></textarea>
                        </div>
                    </div>

                    {/* Actions */}
                    {!isSubmitted && (
                        <div className="d-flex justify-content-end">
                            <button
                                type="submit"
                                className="btn btn-primary d-flex align-items-center px-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader size={18} className="me-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="me-2" />
                                        Save Evaluation & Complete
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default InterviewEvaluation;



