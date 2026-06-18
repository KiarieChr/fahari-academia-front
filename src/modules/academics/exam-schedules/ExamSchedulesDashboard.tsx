import React, { useState, useEffect } from 'react';
import { Calendar, Wand2, Plus, RefreshCcw, Loader2, Save, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import studentSettingsService from '../../../services/studentSettingsService';
import { curriculumService } from '../../../services/curriculumService';
import { examService } from '../../../services/examService';
import { api } from '../../../services/apiClient';

const ExamSchedulesDashboard = () => {
    const [academicYears, setAcademicYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [grades, setGrades] = useState([]);
    const [classSessions, setClassSessions] = useState([]);
    const [assessmentTypes, setAssessmentTypes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [gradingScales, setGradingScales] = useState([]);

    const [context, setContext] = useState({
        academicYear: '',
        term: '',
        grade: '',
        classSession: '',
        assessmentType: '',
    });

    const [examinations, setExaminations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [editingExamId, setEditingExamId] = useState(null);
    const [editForm, setEditForm] = useState({ exam_date: '', start_time: '', duration_minutes: 120 });

    useEffect(() => {
        const loadBaseData = async () => {
            try {
                const [years, trms, cls, subjs, ats, scales] = await Promise.all([
                    studentSettingsService.getAcademicYears(),
                    studentSettingsService.getTerms(),
                    studentSettingsService.getClasses(),
                    curriculumService.getSubjects(),
                    examService.getAssessmentTypes(),
                    examService.getGradingScales(),
                ]);
                const yearsList = years.results || years;
                setAcademicYears(yearsList);
                setTerms(trms.results || trms);
                setGrades(cls.results || cls);
                setSubjects(subjs.results || subjs);
                setAssessmentTypes(ats.results || ats);
                setGradingScales(scales.results || scales);

                if (!context.academicYear) {
                    const currentYear = new Date().getFullYear().toString();
                    const currentYrObj = yearsList.find(y => y.name === currentYear || y.name?.includes(currentYear));
                    if (currentYrObj) {
                        setContext(prev => ({ ...prev, academicYear: currentYrObj.id }));
                    }
                }
            } catch (err) {
                toast.error('Failed to load initial data');
            }
        };
        loadBaseData();
    }, []);

    // Load class sessions when yr+term+grade change
    useEffect(() => {
        if (!context.academicYear || !context.term || !context.grade) {
            setContext(prev => ({ ...prev, classSession: '' }));
            setClassSessions([]);
            return;
        }
        const loadSessions = async () => {
            try {
                const data = await studentSettingsService.getClassSessions({
                    academic_year: context.academicYear,
                    term: context.term,
                    grade: context.grade,
                });
                const list = data.results || data;
                setClassSessions(list);
                if (list.length > 0) {
                    setContext(prev => ({ ...prev, classSession: list[0].id }));
                }
            } catch {
                toast.error('Failed to load class sessions');
            }
        };
        loadSessions();
    }, [context.academicYear, context.term, context.grade]);

    const loadExaminations = async () => {
        if (!context.classSession || !context.assessmentType) return;
        setLoading(true);
        try {
            const data = await examService.getExaminations({
                class_session: context.classSession,
                assessment_type: context.assessmentType,
            });
            setExaminations(data.results || data);
        } catch (err) {
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (context.classSession && context.assessmentType) {
            loadExaminations();
        } else {
            setExaminations([]);
        }
    }, [context.classSession, context.assessmentType]);

    const handleChange = (key, value) => {
        const newCtx = { ...context, [key]: value };
        if (key === 'academicYear' || key === 'term' || key === 'grade') {
            newCtx.classSession = '';
        }
        setContext(newCtx);
    };

    const handleAutoGenerate = async () => {
        if (!context.classSession || !context.assessmentType) {
            toast.warn('Please select a Class Session and Assessment Type first.');
            return;
        }
        const session = classSessions.find(s => s.id == context.classSession);
        if (!session) return;
        
        const curId = session.curriculum;

        const scale = gradingScales.find(s => s.curriculum == curId && s.is_active);
        if (!scale) {
            toast.error('No active grading scale found for this curriculum.');
            return;
        }

        setGenerating(true);
        let successCount = 0;
        let today = new Date();

        try {
            // Fetch explicitly mapped subjects for this grade
            const mappingsRes = await api.timetable.getGradeSubjects({ grade: context.grade });
            const mappings = mappingsRes.results || mappingsRes || [];
            
            if (mappings.length === 0) {
                toast.error('No subjects have been mapped to this grade level yet. Please go to the Subjects Dashboard to map subjects to this grade.');
                setGenerating(false);
                return;
            }

            const relevantSubjects = mappings.map(m => 
                subjects.find(s => s.id === m.subject) || { id: m.subject }
            );

            // Find existing to update instead of duplicate
            const existingExams = examinations;

            for (let i = 0; i < relevantSubjects.length; i++) {
                const subject = relevantSubjects[i];
                let examDate = new Date(today);
                examDate.setDate(today.getDate() + i + 1); // Spread over consecutive days
                // skip weekends
                if (examDate.getDay() === 0) examDate.setDate(examDate.getDate() + 1);
                if (examDate.getDay() === 6) examDate.setDate(examDate.getDate() + 2);
                
                const dateString = examDate.toISOString().split('T')[0];
                const startTime = "08:00";
                const duration = 120;

                const existing = existingExams.find(e => e.subject === subject.id || e.subject?.id === subject.id);
                
                if (existing) {
                    await examService.updateExamination(existing.id, {
                        ...existing,
                        class_session: context.classSession,
                        assessment_type: context.assessmentType,
                        subject: subject.id,
                        grading_scale: scale.id,
                        exam_date: dateString,
                        start_time: startTime,
                        duration_minutes: duration,
                        status: 'scheduled'
                    });
                } else {
                    await examService.createExamination({
                        class_session: context.classSession,
                        assessment_type: context.assessmentType,
                        subject: subject.id,
                        grading_scale: scale.id,
                        exam_date: dateString,
                        start_time: startTime,
                        duration_minutes: duration,
                        status: 'scheduled'
                    });
                }
                successCount++;
            }
            toast.success(`Successfully generated ${successCount} exam schedules!`);
            loadExaminations();
        } catch (err) {
            toast.error('Auto-generation encountered an error.');
        } finally {
            setGenerating(false);
        }
    };

    const handleEditClick = (exam) => {
        setEditingExamId(exam.id);
        setEditForm({
            exam_date: exam.exam_date || '',
            start_time: exam.start_time || '',
            duration_minutes: exam.duration_minutes || 120,
        });
    };

    const handleSaveEdit = async (exam) => {
        try {
            await examService.updateExamination(exam.id, {
                ...exam,
                class_session: typeof exam.class_session === 'object' ? exam.class_session.id : exam.class_session,
                assessment_type: typeof exam.assessment_type === 'object' ? exam.assessment_type.id : exam.assessment_type,
                subject: typeof exam.subject === 'object' ? exam.subject.id : exam.subject,
                grading_scale: typeof exam.grading_scale === 'object' ? exam.grading_scale.id : exam.grading_scale,
                exam_date: editForm.exam_date,
                start_time: editForm.start_time,
                duration_minutes: editForm.duration_minutes,
                status: 'scheduled'
            });
            toast.success('Exam schedule updated');
            setEditingExamId(null);
            loadExaminations();
        } catch (err) {
            toast.error('Failed to update schedule');
        }
    };

    return (
        <DashboardLayout title="Exam Schedules">
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 pb-20">
                <div className="max-w-[1600px] mx-auto p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar className="text-indigo-600" /> Exam Schedules
                            </h1>
                            <p className="text-slate-500 text-sm mt-1">Generate and manage examination timetables</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={loadExaminations}
                                disabled={loading || !context.classSession}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
                            >
                                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                            </button>
                            <button
                                onClick={handleAutoGenerate}
                                disabled={generating || !context.classSession || !context.assessmentType}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                Auto-Generate Timetable
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-5 md:grid-cols-5 lg:grid-cols-5 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Academic Year</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                value={context.academicYear}
                                onChange={e => handleChange('academicYear', e.target.value)}
                            >
                                <option value="">Select Year</option>
                                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Term</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                value={context.term}
                                onChange={e => handleChange('term', e.target.value)}
                            >
                                <option value="">Select Term</option>
                                {terms.filter(t => !context.academicYear || t.academic_year == context.academicYear).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Grade</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                value={context.grade}
                                onChange={e => handleChange('grade', e.target.value)}
                            >
                                <option value="">Select Grade</option>
                                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Class Session</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                value={context.classSession}
                                onChange={e => handleChange('classSession', e.target.value)}
                                disabled={!context.grade}
                            >
                                <option value="">Select Class Session</option>
                                {classSessions.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Assessment Type</label>
                            <select
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                value={context.assessmentType}
                                onChange={e => handleChange('assessmentType', e.target.value)}
                            >
                                <option value="">Select Assessment</option>
                                {assessmentTypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    {!context.classSession || !context.assessmentType ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Clock size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Select a Class and Assessment</h3>
                            <p className="text-slate-500">Choose the context above to view or generate an exam timetable.</p>
                        </div>
                    ) : examinations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <Calendar size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No Exams Scheduled</h3>
                            <p className="text-slate-500 mb-6">There are no exams found for this selection.</p>
                            <button
                                onClick={handleAutoGenerate}
                                disabled={generating}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
                            >
                                <Wand2 size={18} /> Auto-Generate Timetable
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Subject</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Date</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Start Time</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Duration (min)</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-400">Status</th>
                                        <th className="py-3 px-4 font-semibold text-sm text-slate-600 dark:text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examinations.map(exam => {
                                        const isEditing = editingExamId === exam.id;
                                        const subjectName = typeof exam.subject === 'object' ? exam.subject.name : (subjects.find(s => s.id == exam.subject)?.name || 'Unknown');
                                        
                                        return (
                                            <tr key={exam.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{subjectName}</td>
                                                
                                                <td className="py-3 px-4">
                                                    {isEditing ? (
                                                        <input 
                                                            type="date" 
                                                            className="w-full px-2 py-1 border rounded text-sm dark:bg-slate-900"
                                                            value={editForm.exam_date}
                                                            onChange={e => setEditForm({...editForm, exam_date: e.target.value})}
                                                        />
                                                    ) : (
                                                        <span className={exam.exam_date ? "text-slate-700 dark:text-slate-300" : "text-amber-500 font-medium"}>
                                                            {exam.exam_date || 'Not set'}
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="py-3 px-4">
                                                    {isEditing ? (
                                                        <input 
                                                            type="time" 
                                                            className="w-full px-2 py-1 border rounded text-sm dark:bg-slate-900"
                                                            value={editForm.start_time}
                                                            onChange={e => setEditForm({...editForm, start_time: e.target.value})}
                                                        />
                                                    ) : (
                                                        <span className="text-slate-700 dark:text-slate-300 font-mono text-sm">
                                                            {exam.start_time?.slice(0,5) || '--:--'}
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="py-3 px-4">
                                                    {isEditing ? (
                                                        <input 
                                                            type="number" 
                                                            className="w-20 px-2 py-1 border rounded text-sm dark:bg-slate-900"
                                                            value={editForm.duration_minutes}
                                                            onChange={e => setEditForm({...editForm, duration_minutes: e.target.value})}
                                                        />
                                                    ) : (
                                                        <span className="text-slate-700 dark:text-slate-300">
                                                            {exam.duration_minutes || '--'}
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                                        exam.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                        exam.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {exam.status}
                                                    </span>
                                                </td>
                                                
                                                <td className="py-3 px-4 text-right">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingExamId(null)} className="text-slate-500 hover:text-slate-700 text-sm font-medium">Cancel</button>
                                                            <button onClick={() => handleSaveEdit(exam)} className="text-indigo-600 hover:text-indigo-700 text-sm font-bold flex items-center gap-1">
                                                                <Save size={14} /> Save
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleEditClick(exam)}
                                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExamSchedulesDashboard;
