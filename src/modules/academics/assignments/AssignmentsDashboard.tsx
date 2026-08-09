import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, Plus, Upload, Eye, Trash2, Check, X, Loader2,
    Clock, Users, BarChart3, Send, Lock, ChevronDown, ChevronUp,
    Award, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { api } from '../../../services/apiClient';
import PDFViewer from '../../../components/common/PDFViewer';
import FormField, { Select, Input, TextArea } from '../../../components/ui/FormField';

const TYPE_BADGES = {
    homework: 'bg-blue-100 text-blue-700',
    classwork: 'bg-green-100 text-green-700',
    project: 'bg-purple-100 text-purple-700',
    exam_prep: 'bg-orange-100 text-orange-700',
    revision: 'bg-gray-100 text-gray-700',
};

const STATUS_BADGES = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
};

// ═══════════════════════════════════════════════════════════
//  CREATE/EDIT ASSIGNMENT FORM
// ═══════════════════════════════════════════════════════════
const CreateAssignmentForm = ({ onCreated, onCancel, classSessions, subjects }) => {
    const [form, setForm] = useState({
        title: '', description: '', assignment_type: 'homework',
        class_session: '', subject: '', max_score: '100',
        due_date: '', status: 'draft',
    });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.class_session || !form.subject) {
            toast.warning('Title, class, and subject are required');
            return;
        }
        if (!file) {
            toast.warning('Please upload a file');
            return;
        }

        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([key, val]) => {
                if (val) fd.append(key, val);
            });
            fd.append('file', file);

            await api.assignments.create(fd);
            toast.success('Assignment created');
            onCreated();
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to create assignment');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
        >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Plus size={20} className="text-indigo-600" /> New Assignment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Title *">
                    <Input name="title" value={form.title} onChange={handleChange}
                        placeholder="e.g. Math Worksheet — Chapter 5" />
                </FormField>
                <FormField label="Type">
                    <Select name="assignment_type" value={form.assignment_type} onChange={handleChange}>
                        <option value="homework">Homework</option>
                        <option value="classwork">Classwork</option>
                        <option value="project">Project</option>
                        <option value="exam_prep">Exam Preparation</option>
                        <option value="revision">Revision</option>
                    </Select>
                </FormField>
                <FormField label="Class Session *">
                    <Select name="class_session" value={form.class_session} onChange={handleChange}>
                        <option value="">Select class...</option>
                        {classSessions.map(cs => (
                            <option key={cs.id} value={cs.id}>{cs.name}</option>
                        ))}
                    </Select>
                </FormField>
                <FormField label="Subject *">
                    <Select name="subject" value={form.subject} onChange={handleChange}>
                        <option value="">Select subject...</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </Select>
                </FormField>
                <FormField label="Max Score">
                    <Input type="number" name="max_score" value={form.max_score} onChange={handleChange} min="1" />
                </FormField>
                <FormField label="Due Date">
                    <Input type="datetime-local" name="due_date" value={form.due_date} onChange={handleChange} />
                </FormField>
            </div>

            <FormField label="Description">
                <TextArea name="description" value={form.description} onChange={handleChange}
                    placeholder="Instructions or notes for students..." rows={3} />
            </FormField>

            <FormField label="Upload File (PDF recommended) *">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors font-medium text-sm">
                        <Upload size={16} />
                        {file ? 'Change File' : 'Choose File'}
                        <input type="file" className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                            onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                    {file && (
                        <span className="text-sm text-gray-600 truncate max-w-xs">
                            {file.name} ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                    )}
                </div>
            </FormField>

            <div className="flex gap-3 justify-end">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    Cancel
                </button>
                <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    Create Assignment
                </button>
            </div>
        </motion.form>
    );
};

// ═══════════════════════════════════════════════════════════
//  SUBMISSIONS / GRADING PANEL
// ═══════════════════════════════════════════════════════════
const SubmissionsPanel = ({ assignment, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gradingId, setGradingId] = useState(null);
    const [gradeForm, setGradeForm] = useState({ score: '', teacher_remarks: '' });
    const [viewingFile, setViewingFile] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [subs, statsData] = await Promise.all([
                    api.assignments.getSubmissions(assignment.id),
                    api.assignments.getStats(assignment.id),
                ]);
                setSubmissions(subs || []);
                setStats(statsData);
            } catch {
                toast.error('Failed to load submissions');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [assignment.id]);

    const handleGrade = async (subId) => {
        if (!gradeForm.score) { toast.warning('Enter a score'); return; }
        try {
            const updated = await api.assignments.gradeSubmission(subId, {
                score: parseFloat(gradeForm.score),
                teacher_remarks: gradeForm.teacher_remarks,
                status: 'graded',
            });
            setSubmissions(prev => prev.map(s => s.id === subId ? updated : s));
            setGradingId(null);
            setGradeForm({ score: '', teacher_remarks: '' });
            toast.success('Graded successfully');
        } catch {
            toast.error('Failed to grade submission');
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-500">{assignment.subject_name} · {assignment.class_session_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={18} />
                    </button>
                </div>

                {stats && (
                    <div className="flex gap-4 mt-4">
                        {[
                            { label: 'Total Students', value: stats.total_students, color: 'text-gray-700' },
                            { label: 'Submitted', value: stats.submissions, color: 'text-blue-700' },
                            { label: 'Graded', value: stats.graded, color: 'text-green-700' },
                            { label: 'Pending', value: stats.pending, color: 'text-orange-700' },
                            { label: 'Late', value: stats.late, color: 'text-red-700' },
                        ].map((s, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg px-4 py-2">
                                <span className="text-xs text-gray-500">{s.label}</span>
                                <p className={`text-lg font-bold ${s.color}`}>{s.value ?? 0}</p>
                            </div>
                        ))}
                        {stats.average_score != null && (
                            <div className="bg-indigo-50 rounded-lg px-4 py-2">
                                <span className="text-xs text-indigo-600">Avg Score</span>
                                <p className="text-lg font-bold text-indigo-700">{parseFloat(stats.average_score).toFixed(1)}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {submissions.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No submissions yet</p>
                    ) : submissions.map(sub => (
                        <div key={sub.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{sub.student_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {sub.student_admission_number} · {new Date(sub.submitted_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        sub.status === 'graded' ? 'bg-green-100 text-green-700' :
                                        sub.status === 'late' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>{sub.status_display}</span>
                                    {sub.score != null && (
                                        <span className="text-sm font-bold text-indigo-700">
                                            {sub.score}/{assignment.max_score}
                                        </span>
                                    )}
                                    {sub.file && (
                                        <button onClick={() => setViewingFile(viewingFile === sub.id ? null : sub.id)}
                                            className="flex items-center gap-1 px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded text-xs font-medium">
                                            <Eye size={14} /> View
                                        </button>
                                    )}
                                    {sub.status !== 'graded' && (
                                        <button onClick={() => { setGradingId(gradingId === sub.id ? null : sub.id); setGradeForm({ score: '', teacher_remarks: '' }); }}
                                            className="flex items-center gap-1 px-2 py-1 text-green-600 hover:bg-green-50 rounded text-xs font-medium">
                                            <Award size={14} /> Grade
                                        </button>
                                    )}
                                </div>
                            </div>

                            {sub.text_response && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded p-2">{sub.text_response}</p>
                            )}

                            {/* Inline grading form */}
                            <AnimatePresence>
                                {gradingId === sub.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 space-y-3">
                                            <div className="flex gap-3">
                                                <FormField label={`Score (out of ${assignment.max_score})`}>
                                                    <Input type="number" value={gradeForm.score}
                                                        onChange={(e) => setGradeForm(p => ({ ...p, score: e.target.value }))}
                                                        max={assignment.max_score} min="0" step="0.5" />
                                                </FormField>
                                                <div className="flex-1">
                                                    <FormField label="Remarks">
                                                        <Input value={gradeForm.teacher_remarks}
                                                            onChange={(e) => setGradeForm(p => ({ ...p, teacher_remarks: e.target.value }))}
                                                            placeholder="Feedback..." />
                                                    </FormField>
                                                </div>
                                                <div className="flex items-end gap-1">
                                                    <button onClick={() => handleGrade(sub.id)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                                                        <Check size={16} />
                                                    </button>
                                                    <button onClick={() => setGradingId(null)}
                                                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Inline PDF viewer for submission */}
                            <AnimatePresence>
                                {viewingFile === sub.id && sub.file && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mt-3"
                                    >
                                        <PDFViewer url={sub.file} title={`${sub.student_name}'s submission`} height="400px"
                                            onClose={() => setViewingFile(null)} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
const AssignmentsDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [classSessions, setClassSessions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [viewingAssignment, setViewingAssignment] = useState(null);
    const [viewingSubmissions, setViewingSubmissions] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    // Filters
    const [filterClass, setFilterClass] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterClass) params.class_session = filterClass;
            if (filterStatus) params.status = filterStatus;

            const [assignData, csData, subData] = await Promise.all([
                api.assignments.list(params),
                api.academics.getActiveSessions(),
                api.timetable.getSubjects(),
            ]);
            setAssignments((assignData.results || assignData) || []);
            setClassSessions((csData.results || csData) || []);
            setSubjects((subData.results || subData) || []);
        } catch {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, [filterClass, filterStatus]);

    useEffect(() => { loadData(); }, [loadData]);

    const handlePublish = async (id) => {
        try {
            await api.assignments.publish(id);
            toast.success('Assignment published — students can now view it');
            loadData();
        } catch {
            toast.error('Failed to publish');
        }
    };

    const handleClose = async (id) => {
        try {
            await api.assignments.close(id);
            toast.success('Assignment closed');
            loadData();
        } catch {
            toast.error('Failed to close');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this assignment?')) return;
        try {
            await api.assignments.delete(id);
            toast.success('Assignment deleted');
            loadData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    // Stats
    const totalCount = assignments.length;
    const publishedCount = assignments.filter(a => a.status === 'published').length;
    const draftCount = assignments.filter(a => a.status === 'draft').length;

    return (
        <DashboardLayout title="Student Assignments">
            <div className="min-h-screen bg-slate-50/50">
                <div className="max-w-[1400px] mx-auto p-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Student Assignments</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Upload assignments, track submissions, and grade student work
                            </p>
                        </div>
                        <button onClick={() => setShowCreate(!showCreate)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors shadow-sm">
                            <Plus size={18} /> New Assignment
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total', value: totalCount, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                            { label: 'Published', value: publishedCount, color: 'bg-green-50 text-green-700 border-green-200' },
                            { label: 'Drafts', value: draftCount, color: 'bg-gray-50 text-gray-700 border-gray-200' },
                        ].map((s, i) => (
                            <div key={i} className={`${s.color} border rounded-xl p-4`}>
                                <p className="text-xs font-medium opacity-70">{s.label}</p>
                                <p className="text-2xl font-bold">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Create form */}
                    <AnimatePresence>
                        {showCreate && (
                            <CreateAssignmentForm
                                classSessions={classSessions}
                                subjects={subjects}
                                onCreated={() => { setShowCreate(false); loadData(); }}
                                onCancel={() => setShowCreate(false)}
                            />
                        )}
                    </AnimatePresence>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 items-end">
                        <FormField label="Filter by Class">
                            <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                                <option value="">All Classes</option>
                                {classSessions.map(cs => (
                                    <option key={cs.id} value={cs.id}>{cs.name}</option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Status">
                            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="">All</option>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="closed">Closed</option>
                            </Select>
                        </FormField>
                    </div>

                    {/* Submissions detail panel */}
                    {viewingSubmissions && (
                        <SubmissionsPanel
                            assignment={viewingSubmissions}
                            onClose={() => setViewingSubmissions(null)}
                        />
                    )}

                    {/* Assignments list */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
                        ) : assignments.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No assignments found</p>
                                <p className="text-xs mt-1">Click "New Assignment" to create one</p>
                            </div>
                        ) : assignments.map(a => (
                            <motion.div key={a.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-gray-900">{a.title}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_BADGES[a.status]}`}>
                                                    {a.status_display}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_BADGES[a.assignment_type]}`}>
                                                    {a.assignment_type_display}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {a.subject_name} ({a.subject_code}) · {a.class_session_name}
                                                {a.created_by_name && <> · by {a.created_by_name}</>}
                                            </p>
                                            {a.due_date && (
                                                <p className={`text-xs mt-1 flex items-center gap-1 ${a.is_past_due ? 'text-red-600' : 'text-gray-400'}`}>
                                                    <Clock size={12} />
                                                    Due: {new Date(a.due_date).toLocaleString()}
                                                    {a.is_past_due && <span className="text-red-600 font-medium ml-1">OVERDUE</span>}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <div className="text-right mr-3">
                                                <p className="text-xs text-gray-400">Submissions</p>
                                                <p className="font-bold text-gray-700">{a.submission_count ?? 0}</p>
                                            </div>
                                            <button onClick={() => setViewingSubmissions(viewingSubmissions?.id === a.id ? null : a)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="View Submissions">
                                                <Users size={18} />
                                            </button>
                                            <button onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Preview File">
                                                <Eye size={18} />
                                            </button>
                                            {a.status === 'draft' && (
                                                <button onClick={() => handlePublish(a.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Publish">
                                                    <Send size={18} />
                                                </button>
                                            )}
                                            {a.status === 'published' && (
                                                <button onClick={() => handleClose(a.id)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Close">
                                                    <Lock size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(a.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    {a.description && (
                                        <p className="text-sm text-gray-600 mt-2">{a.description}</p>
                                    )}
                                </div>

                                {/* Expandable PDF preview */}
                                <AnimatePresence>
                                    {expandedId === a.id && a.file && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-gray-200"
                                        >
                                            <div className="p-4">
                                                <PDFViewer url={a.file} title={a.title} height="500px"
                                                    onClose={() => setExpandedId(null)} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default AssignmentsDashboard;
