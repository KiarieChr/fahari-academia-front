import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText, Eye, Clock, CheckCircle, AlertCircle,
    Loader2, BookOpen, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ParentLayout from '../../layouts/ParentLayout';
import { api } from '../../services/apiClient';
import { portalService } from '../student-portal/portalService';
import PDFViewer from '../../components/common/PDFViewer';

const STATUS_COLORS = {
    submitted: 'bg-blue-100 text-blue-700',
    graded: 'bg-green-100 text-green-700',
    returned: 'bg-purple-100 text-purple-700',
    late: 'bg-red-100 text-red-700',
};

const ChildAssignments = () => {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [viewingPdf, setViewingPdf] = useState(null);

    useEffect(() => {
        const loadChildren = async () => {
            try {
                const data = await portalService.getChildren();
                const list = data.results || data || [];
                setChildren(list);
                if (list.length > 0) {
                    setSelectedChild(list[0]);
                }
            } catch {
                toast.error('Failed to load children');
            } finally {
                setLoading(false);
            }
        };
        loadChildren();
    }, []);

    const loadAssignments = useCallback(async (child) => {
        if (!child) return;
        setLoadingAssignments(true);
        try {
            const data = await api.assignments.parentChildAssignments(child.id);
            setAssignments((data.results || data) || []);
        } catch {
            toast.error('Failed to load assignments');
        } finally {
            setLoadingAssignments(false);
        }
    }, []);

    useEffect(() => {
        if (selectedChild) loadAssignments(selectedChild);
    }, [selectedChild, loadAssignments]);

    return (
        <ParentLayout title="Assignments">
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-indigo-600" size={24} /> Child Assignments
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View your child's assignments, submissions, and grades
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="animate-spin text-indigo-600" size={28} />
                    </div>
                ) : children.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                        <User size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No children found</p>
                    </div>
                ) : (
                    <>
                        {/* Child selector */}
                        {children.length > 1 && (
                            <div className="flex gap-2">
                                {children.map(child => (
                                    <button key={child.id}
                                        onClick={() => setSelectedChild(child)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedChild?.id === child.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}>
                                        <User size={16} />
                                        {child.first_name} {child.last_name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loadingAssignments ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="animate-spin text-indigo-600" size={24} />
                            </div>
                        ) : assignments.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No assignments for {selectedChild?.first_name}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map(a => {
                                    const sub = a.my_submission;

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
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            {a.subject_name} · {a.class_session_name}
                                                        </p>
                                                        {a.due_date && (
                                                            <p className={`text-xs mt-1 flex items-center gap-1 ${a.is_past_due ? 'text-red-600' : 'text-gray-400'}`}>
                                                                <Clock size={12} />
                                                                Due: {new Date(a.due_date).toLocaleString()}
                                                            </p>
                                                        )}
                                                        {a.description && (
                                                            <p className="text-sm text-gray-600 mt-2">{a.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 ml-4">
                                                        {/* Submission status */}
                                                        {sub ? (
                                                            <div className="text-right">
                                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[sub.status]}`}>
                                                                    {sub.status_display}
                                                                </span>
                                                                {sub.score != null && (
                                                                    <p className="text-lg font-bold text-indigo-700 mt-1">
                                                                        {sub.score}/{a.max_score}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                                                                Not Submitted
                                                            </span>
                                                        )}
                                                        {a.file && (
                                                            <button onClick={() => setViewingPdf(viewingPdf === a.id ? null : a.id)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium">
                                                                <Eye size={16} /> View
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Teacher feedback */}
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
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </ParentLayout>
    );
};

export default ChildAssignments;
