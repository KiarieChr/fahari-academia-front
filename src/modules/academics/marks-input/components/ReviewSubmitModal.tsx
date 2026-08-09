import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, FileText, Send } from 'lucide-react';

const ReviewSubmitModal = ({ isOpen, onClose, stats, examMeta, onSubmit, submitting }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Review Submission</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Context Summary */}
                        <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Submission Details</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {examMeta?.exam_name || 'Exam'} &middot; Max: {examMeta?.max_mark ?? 100}
                                </p>
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-600 dark:text-slate-400">Total Students</span>
                                <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-600 dark:text-slate-400">Marks Entered</span>
                                <span className="font-bold text-slate-900 dark:text-white">{stats.entered}/{stats.total}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-600 dark:text-slate-400">Absent</span>
                                <span className="font-bold text-red-500">{stats.absent}</span>
                            </div>
                            <div className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-slate-600 dark:text-slate-400">Class Average</span>
                                <span className="font-bold text-green-600">{stats.average}%</span>
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="flex gap-3 text-sm text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg">
                            <AlertTriangle size={18} className="shrink-0" />
                            <p>Once submitted, these marks will be locked for editing. You will need admin approval to make changes.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={submitting}
                            className="px-6 py-2 bg-green-600 text-black font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-green-900/30 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting...</>
                            ) : (
                                <><CheckCircle size={18} /> Confirm Submit</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewSubmitModal;
