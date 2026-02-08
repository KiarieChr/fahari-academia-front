import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

// Components
import ContextSelectionPanel from './components/ContextSelectionPanel';
import StudentMarksTable from './components/StudentMarksTable';
import BulkActionsPanel from './components/BulkActionsPanel';
import GradeInsightsPanel from './components/GradeInsightsPanel';
import ReviewSubmitModal from './components/ReviewSubmitModal';

// Data
import { contextData, initialStudents, getClassStats, calculateGrade } from './data/marksData';

const MarksInputDashboard = () => {
    // State
    const [context, setContext] = useState({
        academicYear: '',
        term: '',
        class: '',
        stream: '',
        subject: '',
        assessment: ''
    });
    const [students, setStudents] = useState([]); // Start empty, wait for context
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showInsights, setShowInsights] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, unsaved

    const stats = getClassStats(students);

    // Mock loading data when context changes
    useEffect(() => {
        if (context.class && context.subject) {
            // In a real app, fetch data here. We'll simulate loading.
            setStudents(initialStudents.map(s => ({ ...s }))); // Reset to initial on switch
            toast.success("Loaded class list");
        } else {
            setStudents([]);
        }
    }, [context.class, context.subject]);

    // Autosave Simulation
    useEffect(() => {
        if (saveStatus === 'unsaved') {
            const timer = setTimeout(() => {
                setSaveStatus('saving');
                setTimeout(() => {
                    setSaveStatus('saved');
                }, 800);
            }, 2000); // Save after 2s of inactivity
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    // Handlers
    const handleUpdateStudent = useCallback((id, field, value) => {
        setStudents(prev => prev.map(s => {
            if (s.id === id) {
                const updated = { ...s, [field]: value };
                if (field === 'marks') {
                    updated.grade = calculateGrade(value);
                }
                return updated;
            }
            return s;
        }));
        setSaveStatus('unsaved');
    }, []);

    const handleSelectStudent = (id) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.id));
        }
    };

    const handleBulkAction = (action) => {
        let updatedCount = 0;
        setStudents(prev => prev.map(s => {
            if (!selectedStudents.includes(s.id)) return s;

            updatedCount++;
            if (action === 'markPresent') return { ...s, status: 'Present' };
            if (action === 'fillZeros' && s.marks === '') return { ...s, marks: 0, grade: 'E' };
            if (action === 'clear') return { ...s, marks: '', grade: '-', remarks: '' };
            return s;
        }));

        toast.success(`Updated ${updatedCount} students`);
        setSelectedStudents([]); // Clear selection
        setSaveStatus('unsaved');
    };

    const handleSubmit = () => {
        setStudents(prev => prev.map(s => ({ ...s, locked: true })));
        setShowReviewModal(false);
        toast.success("Marks submitted successfully!");
    };

    return (
        <DashboardLayout title="Marks Input">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20 relative">

                {/* 1. Context Selection (Sticky) */}
                <ContextSelectionPanel
                    context={context}
                    setContext={setContext}
                    data={contextData}
                />

                <div className="max-w-[1600px] mx-auto p-4 flex gap-4 relative">
                    {/* 2. Main Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex-1 transition-all duration-300 ${showInsights ? 'mr-80' : ''}`}
                    >
                        {/* Toolbar */}
                        <div className="mb-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Marks Entry</h1>
                                {/* Autosave Indicator */}
                                <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                    {saveStatus === 'saving' && <span className="animate-pulse">Saving...</span>}
                                    {saveStatus === 'saved' && <span className="flex items-center gap-1 text-green-600"><CheckCircle size={10} /> Saved</span>}
                                    {saveStatus === 'unsaved' && <span className="text-amber-500">Unsaved changes</span>}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => setStudents(initialStudents.map(s => ({ ...s })))}
                                    title="Reset Demo"
                                >
                                    <RotateCcw size={16} />
                                </button>
                                <button
                                    onClick={() => setShowReviewModal(true)}
                                    disabled={students.length === 0}
                                    className="px-4 py-2 bg-blue-600 text-black rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Review & Submit
                                </button>
                            </div>
                        </div>

                        {/* 2. Marks Table */}
                        <StudentMarksTable
                            students={students}
                            onUpdateStudent={handleUpdateStudent}
                            selectedStudents={selectedStudents}
                            onSelectStudent={handleSelectStudent}
                            onSelectAll={handleSelectAll}
                        />
                    </motion.div>

                    {/* 3. Insights Panel */}
                    <GradeInsightsPanel
                        stats={stats}
                        isOpen={showInsights}
                        togglePanel={() => setShowInsights(!showInsights)}
                    />
                </div>

                {/* 4. Bulk Actions (Floating) */}
                <BulkActionsPanel
                    selectedCount={selectedStudents.length}
                    onAction={handleBulkAction}
                />

                {/* 5. Review Modal */}
                <ReviewSubmitModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    stats={stats}
                    context={context}
                    onSubmit={handleSubmit}
                />

            </div>
        </DashboardLayout>
    );
};

export default MarksInputDashboard;

