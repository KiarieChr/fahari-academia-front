import React, { useState, useEffect } from 'react';
import { Settings, Users, AlertTriangle, CheckCircle, Loader, XCircle } from 'lucide-react';
import { api } from '../../../../services/api';
import { formatKES } from '../utils/invoiceUtils';
import { toast } from 'react-toastify';

/**
 * Bulk Invoice Generation Modal
 * 
 * Uses the backend /api/fees/billing/bulk-invoice/ endpoint.
 * Generates invoices for all active students in a ClassSession.
 */
const GenerateInvoiceModal = ({ show, onClose, onGenerate }) => {
    // State for session selection
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [dueDate, setDueDate] = useState(() => {
        // Default to 14 days from now
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString().split('T')[0];
    });
    const [remarks, setRemarks] = useState('');

    // Loading states
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Preview and result states
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);

    // Fetch class sessions on mount
    useEffect(() => {
        if (show) {
            fetchSessions();
            // Reset state when modal opens
            setPreview(null);
            setResult(null);
            setSelectedSessionId('');
        }
    }, [show]);

    const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
            // Fetch active sessions from academics module
            const response = await api.get('/api/academics/sessions/?status=active');
            const data = Array.isArray(response) ? response : (response.results || []);
            setSessions(data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
            toast.error('Failed to load class sessions');
            setSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleSessionChange = (sessionId) => {
        setSelectedSessionId(sessionId);
        setPreview(null);
        setResult(null);
    };

    const handlePreview = async () => {
        if (!selectedSessionId) return;

        setLoadingPreview(true);
        setPreview(null);

        try {
            const session = sessions.find(s => s.id == selectedSessionId);
            if (!session) {
                setPreview({ error: 'Session not found' });
                return;
            }

            // Fetch fee structure for preview
            const structureRes = await api.get('/api/fees/fee-structures/', {
                params: {
                    academic_year: session.academic_year,
                    term: session.term,
                    grade: session.grade,
                    status: 'ACTIVE'
                }
            });
            const structures = Array.isArray(structureRes) ? structureRes : (structureRes.results || []);

            if (structures.length === 0) {
                setPreview({
                    error: `No ACTIVE fee structure found for ${session.grade_name || session.name}. Please create and activate a fee structure first.`
                });
                return;
            }

            const structure = structures[0];

            // Fetch enrollment count for this session
            const enrollmentRes = await api.get(`/api/academics/enrollments/`, {
                params: { session: selectedSessionId, is_active: true }
            });
            const enrollments = Array.isArray(enrollmentRes) ? enrollmentRes : (enrollmentRes.results || []);

            // Calculate totals from fee items (mandatory only for bulk)
            const feeItems = structure.items || [];
            const mandatoryItems = feeItems.filter(item => !item.is_optional);
            const feePerStudent = mandatoryItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

            setPreview({
                session,
                structure,
                studentCount: enrollments.length,
                feePerStudent,
                totalAmount: feePerStudent * enrollments.length,
                feeItems: mandatoryItems
            });

        } catch (err) {
            console.error('Preview error:', err);
            setPreview({ error: 'Failed to generate preview. Please try again.' });
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedSessionId || !preview || preview.error) return;

        setGenerating(true);
        setResult(null);

        try {
            const response = await api.post('/api/fees/billing/bulk-invoice/', {
                session_id: parseInt(selectedSessionId),
                due_date: dueDate,
                remarks: remarks || `Bulk invoice for ${preview.session.name}`
            });

            setResult(response);

            // Notify parent to refresh invoice list
            if (response.success && response.success.length > 0) {
                onGenerate({
                    invoiceCount: response.success.length,
                    sessionId: selectedSessionId
                });
                toast.success(`Successfully generated ${response.success.length} invoices!`);
            }

        } catch (err) {
            console.error('Generation error:', err);
            const errorMsg = err.data?.detail || err.message || 'Failed to generate invoices';
            setResult({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            setGenerating(false);
        }
    };

    const handleClose = () => {
        setPreview(null);
        setResult(null);
        setSelectedSessionId('');
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title d-flex align-items-center">
                            <Settings size={20} className="me-2" />
                            Bulk Generate Invoices
                        </h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>

                    <div className="modal-body">
                        {/* Step 1: Session Selection */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Select Class Session *</label>
                            <p className="text-muted small mb-2">
                                Choose a class session to generate invoices for all enrolled students.
                            </p>

                            {loadingSessions ? (
                                <div className="d-flex align-items-center text-muted">
                                    <Loader size={16} className="me-2 spinner-border spinner-border-sm" />
                                    Loading sessions...
                                </div>
                            ) : (
                                <select
                                    className="form-select"
                                    value={selectedSessionId}
                                    onChange={(e) => handleSessionChange(e.target.value)}
                                    disabled={generating}
                                >
                                    <option value="">Select a session...</option>
                                    {sessions.map(session => (
                                        <option key={session.id} value={session.id}>
                                            {session.name || `${session.grade_name} - ${session.term_name} ${session.year_name}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Step 2: Additional Options */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Due Date *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    disabled={generating}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Remarks (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., Term 1 Fees 2026"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    disabled={generating}
                                />
                            </div>
                        </div>

                        {/* Preview Button */}
                        <div className="d-grid mb-4">
                            <button
                                className="btn btn-outline-primary"
                                onClick={handlePreview}
                                disabled={!selectedSessionId || loadingPreview || generating}
                            >
                                {loadingPreview ? (
                                    <>
                                        <Loader size={16} className="me-2 spinner-border spinner-border-sm" />
                                        Loading Preview...
                                    </>
                                ) : (
                                    'Preview Generation'
                                )}
                            </button>
                        </div>

                        {/* Preview Display */}
                        {preview && preview.error && (
                            <div className="alert alert-warning d-flex align-items-start">
                                <AlertTriangle size={18} className="me-2 mt-1 flex-shrink-0" />
                                <div>{preview.error}</div>
                            </div>
                        )}

                        {preview && !preview.error && !result && (
                            <div className="card bg-light border-0">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">Generation Preview</h6>
                                    <div className="row text-center mb-3">
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Students to Invoice</small>
                                            <div className="fw-bold fs-4 text-primary">
                                                <Users size={20} className="me-1" />
                                                {preview.studentCount}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Fee Per Student</small>
                                            <div className="fw-bold fs-5">{formatKES(preview.feePerStudent)}</div>
                                        </div>
                                        <div className="col-md-4">
                                            <small className="text-muted d-block">Total Invoice Value</small>
                                            <div className="fw-bold fs-4 text-success">{formatKES(preview.totalAmount)}</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center text-success mb-2">
                                        <CheckCircle size={16} className="me-2" />
                                        <small>Using Fee Structure: {preview.structure.id}</small>
                                    </div>

                                    <div className="small text-muted mb-2">
                                        Only mandatory fees will be included ({preview.feeItems.length} items):
                                    </div>

                                    <ul className="list-group list-group-flush small border rounded">
                                        {preview.feeItems.slice(0, 4).map((item, idx) => (
                                            <li key={idx} className="list-group-item bg-transparent d-flex justify-content-between py-2">
                                                <span>{item.name}</span>
                                                <span className="fw-bold">{formatKES(parseFloat(item.amount))}</span>
                                            </li>
                                        ))}
                                        {preview.feeItems.length > 4 && (
                                            <li className="list-group-item bg-transparent text-center text-muted fst-italic py-2">
                                                +{preview.feeItems.length - 4} more items...
                                            </li>
                                        )}
                                    </ul>

                                    {preview.studentCount === 0 && (
                                        <div className="alert alert-warning mt-3 mb-0">
                                            <AlertTriangle size={16} className="me-2" />
                                            No active enrollments found for this session. Make sure students are enrolled.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Result Display */}
                        {result && !result.error && (
                            <div className="card border-success">
                                <div className="card-header bg-success text-white">
                                    <CheckCircle size={18} className="me-2" />
                                    Generation Complete
                                </div>
                                <div className="card-body">
                                    <div className="row text-center mb-3">
                                        <div className="col-md-4">
                                            <div className="fw-bold fs-3 text-success">{result.success?.length || 0}</div>
                                            <small className="text-muted">Invoices Created</small>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="fw-bold fs-3 text-warning">{result.skipped?.length || 0}</div>
                                            <small className="text-muted">Students Skipped</small>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="fw-bold fs-3">{result.summary?.total_processed || 0}</div>
                                            <small className="text-muted">Total Processed</small>
                                        </div>
                                    </div>

                                    {result.skipped && result.skipped.length > 0 && (
                                        <div className="mt-3">
                                            <h6 className="fw-bold text-warning">Skipped Students:</h6>
                                            <div className="border rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                <table className="table table-sm mb-0">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Student</th>
                                                            <th>Reason</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {result.skipped.map((skip, idx) => (
                                                            <tr key={idx}>
                                                                <td>{skip.student_name || `ID: ${skip.student_id}`}</td>
                                                                <td className="text-muted small">{skip.reason}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {result && result.error && (
                            <div className="alert alert-danger d-flex align-items-start">
                                <XCircle size={18} className="me-2 mt-1 flex-shrink-0" />
                                <div>{result.error}</div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={generating}
                        >
                            {result ? 'Close' : 'Cancel'}
                        </button>

                        {!result && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={!preview || preview.error || generating || preview.studentCount === 0}
                                onClick={handleGenerate}
                            >
                                {generating ? (
                                    <>
                                        <Loader size={16} className="me-2 spinner-border spinner-border-sm" />
                                        Generating...
                                    </>
                                ) : (
                                    `Generate ${preview?.studentCount || 0} Invoices`
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateInvoiceModal;
