import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { CheckCircle, Upload, RotateCcw, BarChart2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

import ContextSelectionPanel from './components/ContextSelectionPanel';
import StudentMarksTable from './components/StudentMarksTable';
import BulkActionsPanel from './components/BulkActionsPanel';
import GradeInsightsPanel from './components/GradeInsightsPanel';
import ReviewSubmitModal from './components/ReviewSubmitModal';

import { examService } from '../../../services/examService';

const MarksInputDashboard = () => {
    // Context state — IDs from API
    const [context, setContext] = useState({
        academicYear: '',
        term: '',
        grade: '',
        stream: '',
        subject: '',
        assessmentType: '',
        classSession: '',
        examination: '',
    });

    const [gradingScales, setGradingScales] = useState([]);
    const [editingScale, setEditingScale] = useState(false);

    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showInsights, setShowInsights] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved');
    const [examMeta, setExamMeta] = useState({ max_mark: 100, exam_name: '', grading_scale: null, grading_scale_name: '', grading_scale_code: '', curriculum_id: null });
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const autosaveTimer = useRef(null);
    const pendingChanges = useRef(new Set());
    const fileInputRef = useRef(null);

    // Load students when exam is selected
    useEffect(() => {
        // Load grading scales once
        if (gradingScales.length === 0) {
            examService.getGradingScales().then(data => setGradingScales(data.results || data)).catch(() => {});
        }

        if (!context.examination) {
            setStudents([]);
            setAnalysis(null);
            return;
        }
        loadExamStudents(context.examination);
    }, [context.examination]);

    const loadExamStudents = async (examId) => {
        try {
            setLoading(true);
            const data = await examService.getExamStudents(examId);
            setExamMeta({
                max_mark: data.max_mark,
                exam_name: data.exam_name,
                grading_scale: data.grading_scale,
                grading_scale_name: data.grading_scale_name,
                grading_scale_code: data.grading_scale_code,
                curriculum_id: data.curriculum_id
            });
            setStudents(data.students.map(s => ({
                ...s,
                _dirty: false,
            })));
            setSaveStatus('saved');
            pendingChanges.current.clear();
        } catch (err) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    // Autosave: debounce 2s after last change
    useEffect(() => {
        if (pendingChanges.current.size === 0) return;

        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        autosaveTimer.current = setTimeout(() => {
            doAutosave();
        }, 2000);

        return () => {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        };
    }, [students]);

    const doAutosave = async () => {
        if (!context.examination || pendingChanges.current.size === 0) return;

        const dirtyIds = new Set(pendingChanges.current);
        pendingChanges.current.clear();
        setSaveStatus('saving');

        const dirtyStudents = students.filter(s => dirtyIds.has(s.student_id));
        const marks = dirtyStudents.map(s => ({
            student: s.student_id,
            raw_mark: s.is_absent ? null : s.raw_mark,
            is_absent: s.is_absent,
            teacher_remark: s.teacher_remark || '',
            stream: s.stream_id || undefined,
        }));

        try {
            const result = await examService.submitBulkMarks(context.examination, marks);
            setSaveStatus('saved');
            // Reload to get computed grades
            await loadExamStudents(context.examination);
        } catch (err) {
            setSaveStatus('unsaved');
            // Re-add failed changes
            dirtyIds.forEach(id => pendingChanges.current.add(id));
            toast.error('Auto-save failed');
        }
    };

    // Mark a student field as changed
    const handleUpdateStudent = useCallback((studentId, field, value) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id !== studentId) return s;
            const updated = { ...s, [field]: value, _dirty: true };
            if (field === 'is_absent' && value) {
                updated.raw_mark = null;
            }
            return updated;
        }));
        pendingChanges.current.add(studentId);
        setSaveStatus('unsaved');
    }, []);

    const handleSelectStudent = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.student_id));
        }
    };

    const handleBulkAction = (action) => {
        let count = 0;
        setStudents(prev => prev.map(s => {
            if (!selectedStudents.includes(s.student_id)) return s;
            count++;
            if (action === 'markAbsent') {
                pendingChanges.current.add(s.student_id);
                return { ...s, is_absent: true, raw_mark: null, _dirty: true };
            }
            if (action === 'markPresent') {
                pendingChanges.current.add(s.student_id);
                return { ...s, is_absent: false, _dirty: true };
            }
            if (action === 'fillZeros') {
                if (s.raw_mark === null || s.raw_mark === undefined) {
                    pendingChanges.current.add(s.student_id);
                    return { ...s, raw_mark: 0, is_absent: false, _dirty: true };
                }
                return s;
            }
            if (action === 'clear') {
                pendingChanges.current.add(s.student_id);
                return { ...s, raw_mark: null, teacher_remark: '', is_absent: false, _dirty: true };
            }
            return s;
        }));
        setSaveStatus('unsaved');
        toast.success(`Updated ${count} students`);
        setSelectedStudents([]);
    };

    // Excel upload
    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !context.examination) return;

        try {
            setLoading(true);
            const result = await examService.uploadMarksFile(context.examination, file);
            toast.success(`Upload complete: ${result.created} created, ${result.updated} updated${result.errors?.length ? `, ${result.errors.length} errors` : ''}`);
            if (result.errors?.length) {
                result.errors.slice(0, 3).forEach(err => {
                    toast.warn(`Row ${err.row} (${err.admission_number}): ${err.error}`);
                });
            }
            await loadExamStudents(context.examination);
        } catch (err) {
            toast.error('Upload failed: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Submit (publish)
    const handleSubmit = async () => {
        if (!context.examination) return;

        // Save any pending changes first
        if (pendingChanges.current.size > 0) {
            await doAutosave();
        }

        try {
            setSubmitting(true);
            await examService.publishExam(context.examination);
            toast.success('Marks submitted and published!');
            setShowReviewModal(false);
            await loadExamStudents(context.examination);
        } catch (err) {
            toast.error('Failed to submit marks');
        } finally {
            setSubmitting(false);
        }
    };

    // Load analysis when opening insights
    const handleToggleInsights = async () => {
        if (!showInsights && context.examination) {
            try {
                const data = await examService.getExamAnalysis(context.examination);
                setAnalysis(data);
            } catch {
                toast.error('Failed to load analysis');
            }
        }
        setShowInsights(!showInsights);
    };

    // Compute live stats from current student data
    const stats = (() => {
        const scored = students.filter(s => !s.is_absent && s.raw_mark !== null && s.raw_mark !== undefined);
        if (scored.length === 0) return { average: 0, highest: 0, lowest: 0, passRate: 0, entered: 0, total: students.length, absent: students.filter(s => s.is_absent).length };

        const marks = scored.map(s => Number(s.raw_mark));
        const avg = marks.reduce((a, b) => a + b, 0) / marks.length;
        const passed = marks.filter(m => m >= 40).length;
        return {
            average: avg.toFixed(1),
            highest: Math.max(...marks),
            lowest: Math.min(...marks),
            passRate: ((passed / marks.length) * 100).toFixed(1),
            entered: scored.length,
            total: students.length,
            absent: students.filter(s => s.is_absent).length,
        };
    })();

    return (
        <DashboardLayout title="Marks Input">
            <div className="min-h-screen neo-bg pb-20 relative">
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                />

                {/* Context Selection */}
                <ContextSelectionPanel
                    context={context}
                    setContext={setContext}
                    maxMark={examMeta.max_mark}
                />

                <div className="max-w-[1600px] mx-auto p-4 flex gap-4 relative">
                    <div className={`flex-1 transition-all duration-300 ${showInsights ? 'mr-80' : ''}`}>
                        {/* Toolbar */}
                        <div className="mb-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    {examMeta.exam_name || 'Marks Entry'}
                                    {editingScale ? (
                                        <select 
                                            className="text-xs neo-pressed border-none rounded-lg outline-none bg-transparent py-1 px-2 text-indigo-700 font-bold"
                                            value={examMeta.grading_scale || ''}
                                            onChange={async (e) => {
                                                const newScaleId = e.target.value;
                                                setEditingScale(false);
                                                if (newScaleId && newScaleId != examMeta.grading_scale) {
                                                    try {
                                                        setLoading(true);
                                                        await examService.updateExamination(context.examination, {
                                                            grading_scale: newScaleId
                                                        });
                                                        toast.success('Grading scale updated. Grades recalculated.');
                                                        await loadExamStudents(context.examination);
                                                    } catch (err) {
                                                        toast.error('Failed to update grading scale');
                                                        setLoading(false);
                                                    }
                                                }
                                            }}
                                            onBlur={() => setEditingScale(false)}
                                            autoFocus
                                        >
                                            <option value="">Select Scale</option>
                                            {gradingScales.filter(s => s.curriculum == examMeta.curriculum_id).map(s => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                    ) : (
                                        examMeta.grading_scale_name && (
                                            <button 
                                                onClick={() => setEditingScale(true)}
                                                className="!text-[12px] uppercase tracking-normal font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200/50 shadow-sm hover:bg-indigo-200 transition-colors cursor-pointer" 
                                                title={`Code: ${examMeta.grading_scale_code} (Click to change)`}
                                            >
                                                Scale: {examMeta.grading_scale_name}
                                            </button>
                                        )
                                    )}
                                </h1>
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                    {saveStatus === 'saving' && <span className="animate-pulse text-blue-500">Saving...</span>}
                                    {saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-600"><CheckCircle size={10} /> Saved</span>}
                                    {saveStatus === 'unsaved' && <span className="text-amber-500">Unsaved changes</span>}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleToggleInsights}
                                    className="px-4 py-2 neo-btn rounded-xl text-sm font-bold text-slate-600 transition-colors"
                                    title="Performance Insights"
                                >
                                    <BarChart2 size={18} />
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={!context.examination || loading}
                                    className="px-4 py-2 neo-btn rounded-xl text-sm font-bold text-slate-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    title="Upload Excel/CSV"
                                >
                                    <Upload size={18} />
                                    <span className="hidden sm:inline">Upload</span>
                                </button>
                                <button
                                    onClick={() => context.examination && loadExamStudents(context.examination)}
                                    disabled={!context.examination || loading}
                                    className="px-4 py-2 neo-btn rounded-xl text-sm font-bold text-slate-600 transition-colors disabled:opacity-50"
                                    title="Reload"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    disabled={students.length === 0}
                                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-[4px_4px_10px_#c3c8ce,-4px_-4px_10px_#ffffff] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:shadow-none transition-all ml-2"
                                >
                                    Review & Submit
                                </button>
                            </div>
                        </div>

                        {context.examination && context._examObj && (!context._examObj.exam_date && context._examObj.status === 'draft') ? (
                            <div className="neo-card border-none rounded-3xl p-12 text-center mt-8 mx-auto max-w-2xl">
                                <div className="w-20 h-20 neo-card rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Clock size={36} className="text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-700 mb-3">Examination Not Scheduled</h3>
                                <p className="text-slate-500 font-medium">
                                    This examination exists but has not been scheduled yet. Please go to the <strong>Exam Schedules</strong> module to schedule it before entering marks.
                                </p>
                            </div>
                        ) : !context.examination ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center neo-card border-none rounded-3xl mx-4 mt-8 p-12">
                                <div className="w-20 h-20 neo-card rounded-full flex items-center justify-center mb-6">
                                    <BarChart2 size={36} className="text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-700 mb-3">No Exam Selected</h3>
                                <p className="text-slate-500 max-w-md mx-auto font-medium">
                                    Please use the filters above to select a Class, Subject, and Assessment Type.
                                </p>
                            </div>
                        ) : (
                            <StudentMarksTable
                                students={students}
                                onUpdateStudent={handleUpdateStudent}
                                selectedStudents={selectedStudents}
                                onSelectStudent={handleSelectStudent}
                                onSelectAll={handleSelectAll}
                                maxMark={examMeta.max_mark}
                                loading={loading}
                            />
                        )}
                    </div>

                    {/* Insights Panel */}
                    <GradeInsightsPanel
                        stats={stats}
                        analysis={analysis}
                        isOpen={showInsights}
                        togglePanel={handleToggleInsights}
                    />
                </div>

                {/* Bulk Actions */}
                <BulkActionsPanel
                    selectedCount={selectedStudents.length}
                    onAction={handleBulkAction}
                />

                {/* Review Modal */}
                <ReviewSubmitModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    stats={stats}
                    context={context}
                    examMeta={examMeta}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                />
            </div>
        </DashboardLayout>
    );
};

export default MarksInputDashboard;
