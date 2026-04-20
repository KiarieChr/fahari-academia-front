import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, Upload, Eye, Clock, CheckCircle, AlertCircle,
    Loader2, Send, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import StudentLayout from '../../layouts/StudentLayout';
import { api } from '../../services/apiClient';
import PDFViewer from '../../components/common/PDFViewer';

const STATUS_COLORS = {
    submitted: 'bg-blue-100 text-blue-700',
    graded: 'bg-green-100 text-green-700',
    returned: 'bg-purple-100 text-purple-700',
    late: 'bg-red-100 text-red-700',
};

const MyAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingPdf, setViewingPdf] = useState(null);
    const [submittingId, setSubmittingId] = useState(null);
    const [submitForm, setSubmitForm] = useState({ file: null, text_response: '' });
    const [saving, setSaving] = useState(false);

    const loadAssignments = useCallback(async () => {
        try {
            const data = await api.assignments.myAssignments();
            setAssignments((data.results || data) || []);
        } catch {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAssignments(); }, [loadAssignments]);

    const handleSubmit = async (assignmentId) => {
        if (!submitForm.file && !submitForm.text_response) {
            toast.warning('Upload a file or type a response');
            return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            if (submitForm.file) fd.append('file', submitForm.file);
            if (submitForm.text_response) fd.append('text_response', submitForm.text_response);

            await api.assignments.submitAssignment(assignmentId, fd);
            toast.success('Assignment submitted!');
            setSubmittingId(null);
            setSubmitForm({ file: null, text_response: '' });
            loadAssignments();
        } catch (err) {
            toast.error(err?.data?.detail || err?.data?.error || 'Failed to submit');
        } finally {
            setSaving(false);
        }
    };

    return (
        <StudentLayout title="My Assignments">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-indigo-600" size={24} /> My Assignments
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">View assignments and submit your work</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="animate-spin text-indigo-600" size={28} />
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No assignments yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map(a => {
                            const sub = a.my_submission;
                            const isOverdue = a.is_past_due && !sub;

                            return (
                                <motion.div key={a.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                        a.assignment_type === 'homework' ? 'bg-blue-100 text-blue-700' :
                                                        a.assignment_type === 'classwork' ? 'bg-green-100 text-green-700' :
                                                        a.assignment_type === 'project' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {a.assignment_type_display}
                                                    </span>
                                                    {sub && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[sub.status]}`}>
                                                            {sub.status === 'graded' ? `Graded: ${sub.score}/${a.max_score}` : sub.status_display}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {a.subject_name} · {a.class_session_name}
                                                </p>
                                                {a.due_date && (
                                                    <p className={`text-xs mt-1 flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                                                        <Clock size={12} />
                                                        Due: {new Date(a.due_date).toLocaleString()}
                                                        {isOverdue && <AlertCircle size={12} className="ml-1" />}
                                                    </p>
                                                )}
                                                {a.description && (
                                                    <p className="text-sm text-gray-600 mt-2">{a.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                {a.file && (
                                                    <button onClick={() => setViewingPdf(viewingPdf === a.id ? null : a.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium">
                                                        <Eye size={16} /> View
                                                    </button>
                                                )}
                                                {!sub && (
                                                    <button onClick={() => setSubmittingId(submittingId === a.id ? null : a.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium">
                                                        <Send size={16} /> Submit
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Grading feedback */}
                                        {sub && sub.status === 'graded' && sub.teacher_remarks && (
                                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-xs font-medium text-green-700 mb-1">Teacher Feedback</p>
                                                <p className="text-sm text-green-800">{sub.teacher_remarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* PDF viewer */}
                                    <AnimatePresence>
                                        {viewingPdf === a.id && a.file && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-gray-200"
                                            >
                                                <div className="p-4">
                                                    <PDFViewer url={a.file} title={a.title} height="500px"
                                                        onClose={() => setViewingPdf(null)} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Submission form */}
                                    <AnimatePresence>
                                        {submittingId === a.id && !sub && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-gray-200"
                                            >
                                                <div className="p-5 bg-gray-50 space-y-4">
                                                    <h4 className="font-medium text-gray-800 text-sm">Submit Your Work</h4>
                                                    <div>
                                                        <label className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors font-medium text-sm w-fit">
                                                            <Upload size={16} />
                                                            {submitForm.file ? 'Change File' : 'Upload File'}
                                                            <input type="file" className="hidden"
                                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                                                                onChange={(e) => setSubmitForm(p => ({ ...p, file: e.target.files[0] }))} />
                                                        </label>
                                                        {submitForm.file && (
                                                            <p className="text-xs text-gray-500 mt-1">{submitForm.file.name}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                            Text Response (optional)
                                                        </label>
                                                        <textarea
                                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                            rows={3}
                                                            placeholder="Type your answer here..."
                                                            value={submitForm.text_response}
                                                            onChange={(e) => setSubmitForm(p => ({ ...p, text_response: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleSubmit(a.id)} disabled={saving}
                                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50">
                                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                            Submit Assignment
                                                        </button>
                                                        <button onClick={() => { setSubmittingId(null); setSubmitForm({ file: null, text_response: '' }); }}
                                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default MyAssignments;
