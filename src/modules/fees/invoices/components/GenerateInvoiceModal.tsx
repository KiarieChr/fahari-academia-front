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

            // Try fee template first (template billing), fall back to legacy fee structure
            let billingSource = null;
            let feeItems = [];
            let feePerStudent = 0;
            let structureLabel = '';

            // 1. Check for active Fee Template matching this session's grade
            try {
                const templateRes = await api.get('/api/fees/fee-templates/', {
                    params: {
                        academic_year: session.academic_year,
                        term: session.term,
                        status: 'ACTIVE'
                    }
                });
                const templates = Array.isArray(templateRes) ? templateRes : (templateRes.results || []);
                // Find template that covers this session's grade (via direct grades or grade_band)
                const matchingTemplate = templates.find(t => {
                    const coveredGrades = t.covered_grades || [];
                    return coveredGrades.some(g => g.id === session.grade || g.id == session.grade);
                });

                if (matchingTemplate) {
                    billingSource = 'template';
                    structureLabel = matchingTemplate.name;
                    const lineItems = matchingTemplate.line_items || [];
                    const mandatoryItems = lineItems.filter(li => li.is_mandatory);
                    feeItems = mandatoryItems.map(li => ({
                        name: li.vote_head_name || li.name,
                        amount: li.amount,
                        is_optional: !li.is_mandatory
                    }));
                    feePerStudent = mandatoryItems.reduce((sum, li) => sum + parseFloat(li.amount || 0), 0);
                }
            } catch (e) {
                console.warn('Template lookup failed, trying legacy structure', e);
            }

            // 2. Fall back to legacy FeeStructure if no template
            if (!billingSource) {
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
                        error: `No ACTIVE fee template or fee structure found for ${session.grade_name || session.name}. Please create and activate a fee template or fee structure first.`
                    });
                    return;
                }

                const structure = structures[0];
                billingSource = 'structure';
                structureLabel = `Grade Structure #${structure.id}`;
                const items = (structure.items || []).filter(item => !item.is_optional);
                feeItems = items.map(item => ({
                    name: item.name,
                    amount: item.amount,
                    is_optional: item.is_optional
                }));
                feePerStudent = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
            }

            // Fetch enrollment count for this session
            const enrollmentRes = await api.get(`/api/academics/enrollments/`, {
                params: { session: selectedSessionId, is_active: true }
            });
            const enrollments = Array.isArray(enrollmentRes) ? enrollmentRes : (enrollmentRes.results || []);

            setPreview({
                session,
                billingSource,
                structureLabel,
                studentCount: enrollments.length,
                feePerStudent,
                totalAmount: feePerStudent * enrollments.length,
                feeItems
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="neo-card w-full max-w-3xl my-8">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h5 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                        <Settings size={20} className="text-indigo-500" />
                        Bulk Generate Invoices
                    </h5>
                    <button type="button" className="text-gray-400 hover:text-rose-500 transition-colors" onClick={handleClose}>
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {/* Step 1: Session Selection */}
                    <div className="mb-6">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Select Class Session *</label>
                        <p className="text-sm font-bold text-gray-500 mb-4">
                            Choose a class session to generate invoices for all enrolled students.
                        </p>

                        {loadingSessions ? (
                            <div className="flex items-center text-gray-500 font-bold">
                                <Loader size={16} className="mr-2 animate-spin" />
                                Loading sessions...
                            </div>
                        ) : (
                            <select
                                className="neo-input w-full font-bold"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Due Date *</label>
                            <input
                                type="date"
                                className="neo-input w-full font-bold"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                disabled={generating}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Remarks (Optional)</label>
                            <input
                                type="text"
                                className="neo-input w-full font-bold"
                                placeholder="e.g., Term 1 Fees 2026"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={generating}
                            />
                        </div>
                    </div>

                    {/* Preview Button */}
                    <div className="flex mb-6">
                        <button
                            className="neo-btn w-full py-3 font-black text-gray-600 uppercase tracking-widest"
                            onClick={handlePreview}
                            disabled={!selectedSessionId || loadingPreview || generating}
                        >
                            {loadingPreview ? (
                                <span className="flex items-center justify-center">
                                    <Loader size={16} className="mr-2 animate-spin" />
                                    Loading Preview...
                                </span>
                            ) : (
                                'Preview Generation'
                            )}
                        </button>
                    </div>

                    {/* Preview Display */}
                    {preview && preview.error && (
                        <div className="flex items-start gap-3 p-4 bg-rose-50 text-rose-600 rounded-lg mb-6 border border-rose-100">
                            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                            <div className="font-bold text-sm">{preview.error}</div>
                        </div>
                    )}

                    {preview && !preview.error && !result && (
                        <div className="neo-pressed p-6 mb-6">
                            <h6 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Generation Preview</h6>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
                                <div className="neo-card border-none p-4">
                                    <small className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Students to Invoice</small>
                                    <div className="text-2xl font-black text-indigo-600 flex items-center justify-center gap-2">
                                        <Users size={20} />
                                        {preview.studentCount}
                                    </div>
                                </div>
                                <div className="neo-card border-none p-4">
                                    <small className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Fee Per Student</small>
                                    <div className="text-xl font-black text-gray-700">{formatKES(preview.feePerStudent)}</div>
                                </div>
                                <div className="neo-card border-none p-4">
                                    <small className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Total Invoice Value</small>
                                    <div className="text-2xl font-black text-emerald-500">{formatKES(preview.totalAmount)}</div>
                                </div>
                            </div>

                            <div className="flex items-center text-emerald-500 text-sm font-bold mb-4">
                                <CheckCircle size={16} className="mr-2" />
                                <span>
                                    Billing via: <strong className="font-black">{preview.billingSource === 'template' ? 'Fee Template' : 'Grade Fee Structure'}</strong>
                                    {' — '}{preview.structureLabel}
                                </span>
                            </div>

                            <div className="text-xs font-bold text-gray-500 mb-3">
                                Only mandatory fees will be included ({preview.feeItems.length} items):
                            </div>

                            <ul className="neo-card border-none p-0 overflow-hidden text-sm">
                                {preview.feeItems.slice(0, 4).map((item, idx) => (
                                    <li key={idx} className="flex justify-between py-3 px-4 border-b border-gray-100 last:border-0">
                                        <span className="font-bold text-gray-600">{item.name}</span>
                                        <span className="font-black text-gray-700">{formatKES(parseFloat(item.amount))}</span>
                                    </li>
                                ))}
                                {preview.feeItems.length > 4 && (
                                    <li className="py-3 px-4 text-center text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-50/50">
                                        +{preview.feeItems.length - 4} more items...
                                    </li>
                                )}
                            </ul>

                            {preview.studentCount === 0 && (
                                <div className="flex items-center gap-3 p-4 bg-amber-50 text-amber-600 rounded-lg mt-4 border border-amber-100">
                                    <AlertTriangle size={16} className="flex-shrink-0" />
                                    <span className="font-bold text-sm">No active enrollments found for this session. Make sure students are enrolled.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Result Display */}
                    {result && !result.error && (
                        <div className="neo-pressed p-1 border border-emerald-500/20 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                            <div className="p-6">
                                <div className="flex items-center text-emerald-600 font-bold mb-6">
                                    <CheckCircle size={18} className="mr-2" />
                                    Generation Complete
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
                                    <div className="neo-card border-none p-4">
                                        <div className="text-3xl font-black text-emerald-500">{result.success?.length || 0}</div>
                                        <small className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Invoices Created</small>
                                    </div>
                                    <div className="neo-card border-none p-4">
                                        <div className="text-3xl font-black text-amber-500">{result.skipped?.length || 0}</div>
                                        <small className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Students Skipped</small>
                                    </div>
                                    <div className="neo-card border-none p-4">
                                        <div className="text-3xl font-black text-gray-600">{result.summary?.total_processed || 0}</div>
                                        <small className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Total Processed</small>
                                    </div>
                                </div>

                                {result.skipped && result.skipped.length > 0 && (
                                    <div className="mt-4">
                                        <h6 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Skipped Students:</h6>
                                        <div className="neo-pressed overflow-y-auto max-h-[150px] p-2">
                                            <table className="w-full text-left text-sm">
                                                <thead className="sticky top-0 bg-gray-100 z-10">
                                                    <tr>
                                                        <th className="p-2 text-xs font-black text-gray-500 uppercase tracking-widest">Student</th>
                                                        <th className="p-2 text-xs font-black text-gray-500 uppercase tracking-widest">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.skipped.map((skip, idx) => (
                                                        <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-white/50">
                                                            <td className="p-2 font-bold text-gray-700">{skip.student_name || `ID: ${skip.student_id}`}</td>
                                                            <td className="p-2 text-xs font-bold text-gray-500">{skip.reason}</td>
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
                        <div className="flex items-start gap-3 p-4 bg-rose-50 text-rose-600 rounded-lg mb-6 border border-rose-100">
                            <XCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <div className="font-bold text-sm">{result.error}</div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
                    <button
                        type="button"
                        className="neo-btn px-6 py-2"
                        onClick={handleClose}
                        disabled={generating}
                    >
                        {result ? 'Close' : 'Cancel'}
                    </button>

                    {!result && (
                        <button
                            type="button"
                            className="neo-btn neo-btn-accent px-6 py-2"
                            disabled={!preview || preview.error || generating || preview.studentCount === 0}
                            onClick={handleGenerate}
                        >
                            {generating ? (
                                <span className="flex items-center">
                                    <Loader size={16} className="mr-2 animate-spin" />
                                    Generating...
                                </span>
                            ) : (
                                `Generate ${preview?.studentCount || 0} Invoices`
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenerateInvoiceModal;
