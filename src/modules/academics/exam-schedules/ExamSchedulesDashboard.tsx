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
    const [gradeSubjects, setGradeSubjects] = useState([]);
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
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generateConfig, setGenerateConfig] = useState({
        startDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        durationMinutes: 120,
        skipWeekends: true
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({
        subject: '',
        exam_date: new Date().toISOString().split('T')[0],
        start_time: '08:00',
        duration_minutes: 120
    });

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

                const mappingsRes = await api.timetable.getGradeSubjects({ grade: context.grade });
                const mappings = mappingsRes.results || mappingsRes || [];
                const mappedIds = mappings.map(m => m.subject);
                setGradeSubjects(mappedIds);
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
        let today = new Date(generateConfig.startDate);

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
                examDate.setDate(today.getDate() + i); // Spread over consecutive days starting from startDate
                
                if (generateConfig.skipWeekends) {
                    if (examDate.getDay() === 0) examDate.setDate(examDate.getDate() + 1);
                    if (examDate.getDay() === 6) examDate.setDate(examDate.getDate() + 2);
                }
                
                const dateString = examDate.toISOString().split('T')[0];
                const startTime = generateConfig.startTime;
                const duration = generateConfig.durationMinutes;

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
            setIsGenerateModalOpen(false);
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

    const handleAddExam = async () => {
        if (!addForm.subject) {
            toast.warn('Please select a subject');
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
        try {
            await examService.createExamination({
                class_session: context.classSession,
                assessment_type: context.assessmentType,
                subject: addForm.subject,
                grading_scale: scale.id,
                exam_date: addForm.exam_date,
                start_time: addForm.start_time,
                duration_minutes: addForm.duration_minutes,
                status: 'scheduled'
            });
            toast.success('Exam successfully added');
            setIsAddModalOpen(false);
            setAddForm({ ...addForm, subject: '' });
            loadExaminations();
        } catch (err) {
            toast.error('Failed to add exam');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <DashboardLayout title="Exam Schedules">
            <div className="min-h-screen neo-bg pb-20 relative">
                <div className="max-w-[1600px] mx-auto p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Calendar className="text-blue-600" /> Exam Schedules
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 font-bold">Generate and manage examination timetables</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={loadExaminations}
                                disabled={loading || !context.classSession}
                                className="px-4 py-2 neo-btn rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCcw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                disabled={generating || !context.classSession || !context.assessmentType}
                                className="px-5 py-2 neo-btn rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                <Plus size={16} /> Add Exam
                            </button>
                            <button
                                onClick={() => setIsGenerateModalOpen(true)}
                                disabled={generating || !context.classSession || !context.assessmentType}
                                className="px-5 py-2 neo-btn-accent rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                Auto-Generate
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="neo-card border-none p-6 grid grid-cols-5 md:grid-cols-5 lg:grid-cols-5 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Academic Year</label>
                            <select
                                className="w-full px-4 py-2.5 neo-pressed border-none text-slate-900 focus:outline-none rounded-xl text-sm"
                                value={context.academicYear}
                                onChange={e => handleChange('academicYear', e.target.value)}
                            >
                                <option value="">Select Year</option>
                                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Term</label>
                            <select
                                className="w-full px-4 py-2.5 neo-pressed border-none text-slate-900 focus:outline-none rounded-xl text-sm"
                                value={context.term}
                                onChange={e => handleChange('term', e.target.value)}
                            >
                                <option value="">Select Term</option>
                                {terms.filter(t => !context.academicYear || t.academic_year == context.academicYear).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Grade</label>
                            <select
                                className="w-full px-4 py-2.5 neo-pressed border-none text-slate-900 focus:outline-none rounded-xl text-sm"
                                value={context.grade}
                                onChange={e => handleChange('grade', e.target.value)}
                            >
                                <option value="">Select Grade</option>
                                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Class Session</label>
                            <select
                                className="w-full px-4 py-2.5 neo-pressed border-none text-slate-900 focus:outline-none rounded-xl text-sm disabled:opacity-50"
                                value={context.classSession}
                                onChange={e => handleChange('classSession', e.target.value)}
                                disabled={!context.grade}
                            >
                                <option value="">Select Session</option>
                                {classSessions.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">Assessment Type</label>
                            <select
                                className="w-full px-4 py-2.5 neo-pressed border-none text-slate-900 focus:outline-none rounded-xl text-sm"
                                value={context.assessmentType}
                                onChange={e => handleChange('assessmentType', e.target.value)}
                            >
                                <option value="">Select Assessment</option>
                                {assessmentTypes
                                    .filter(a => {
                                        const activeCurr = grades.find(g => g.id == context.grade)?.curriculum;
                                        return !activeCurr || a.curriculum == activeCurr;
                                    })
                                    .map(a => <option key={a.id} value={a.id}>{a.name}</option>)
                                }
                            </select>
                        </div>
                    </div>

                    {/* Content */}
                    {!context.classSession || !context.assessmentType ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center neo-card border-none">
                            <Clock size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-800">Select a Class and Assessment</h3>
                            <p className="text-slate-500 font-medium">Choose the context above to view or generate an exam timetable.</p>
                        </div>
                    ) : examinations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center neo-card border-none">
                            <Calendar size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-800">No Exams Scheduled</h3>
                            <p className="text-slate-500 font-medium mb-6">There are no exams found for this selection.</p>
                            <button
                                onClick={() => setIsGenerateModalOpen(true)}
                                disabled={generating}
                                className="px-6 py-2.5 neo-btn-accent rounded-xl font-bold flex items-center gap-2"
                            >
                                <Wand2 size={18} /> Auto-Generate Timetable
                            </button>
                        </div>
                    ) : (
                        <div className="neo-card border-none overflow-hidden p-6">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="py-4 px-4 font-bold text-sm text-slate-500 uppercase tracking-wider">Subject</th>
                                        <th className="py-4 px-4 font-bold text-sm text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="py-4 px-4 font-bold text-sm text-slate-500 uppercase tracking-wider">Start Time</th>
                                        <th className="py-4 px-4 font-bold text-sm text-slate-500 uppercase tracking-wider">Duration (min)</th>
                                        <th className="py-4 px-4 font-bold text-sm text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-4 font-bold text-sm text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examinations.map(exam => {
                                        const isEditing = editingExamId === exam.id;
                                        const subjectName = typeof exam.subject === 'object' ? exam.subject.name : (subjects.find(s => s.id == exam.subject)?.name || 'Unknown');
                                        
                                        return (
                                            <tr key={exam.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-4 font-bold text-slate-700">{subjectName}</td>
                                                
                                                <td className="py-4 px-4">
                                                    {isEditing ? (
                                                        <input 
                                                            type="date" 
                                                            className="w-full px-3 py-2 neo-pressed border-none rounded-xl text-sm outline-none"
                                                            value={editForm.exam_date}
                                                            onChange={e => setEditForm({...editForm, exam_date: e.target.value})}
                                                        />
                                                    ) : (
                                                        <span className={exam.exam_date ? "text-slate-600 font-medium" : "text-amber-500 font-bold"}>
                                                            {exam.exam_date || 'Not set'}
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="py-4 px-4">
                                                    {isEditing ? (
                                                        <input 
                                                            type="time" 
                                                            className="w-full px-3 py-2 neo-pressed border-none rounded-xl text-sm outline-none"
                                                            value={editForm.start_time}
                                                            onChange={e => setEditForm({...editForm, start_time: e.target.value})}
                                                        />
                                                    ) : (
                                                        <span className="text-slate-600 font-bold font-mono text-sm bg-slate-100 px-2 py-1 rounded-md">
                                                            {exam.start_time?.slice(0,5) || '--:--'}
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="py-4 px-4">
                                                    {isEditing ? (
                                                        <input 
                                                            type="number" 
                                                            className="w-24 px-3 py-2 neo-pressed border-none rounded-xl text-sm outline-none"
                                                            value={editForm.duration_minutes}
                                                            onChange={e => setEditForm({...editForm, duration_minutes: e.target.value})}
                                                        />
                                                    ) : (
                                                        <span className="text-slate-600 font-medium">
                                                            {exam.duration_minutes || '--'} <span className="text-slate-400 text-xs">min</span>
                                                        </span>
                                                    )}
                                                </td>
                                                
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                        exam.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                                        exam.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {exam.status}
                                                    </span>
                                                </td>
                                                
                                                <td className="py-4 px-4 text-right">
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingExamId(null)} className="neo-btn px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs font-bold">Cancel</button>
                                                            <button onClick={() => handleSaveEdit(exam)} className="neo-btn-accent px-3 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                                                                <Save size={14} /> Save
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleEditClick(exam)}
                                                            className="neo-btn px-4 py-2 rounded-lg text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-2 ml-auto"
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

                {/* Auto-Generate Modal */}
                {isGenerateModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="neo-card p-6 w-full max-w-md border-none">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Wand2 className="text-blue-600" /> Generate Timetable
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Start Date</label>
                                    <input 
                                        type="date"
                                        className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 outline-none"
                                        value={generateConfig.startDate}
                                        onChange={e => setGenerateConfig({...generateConfig, startDate: e.target.value})}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Default Start Time</label>
                                        <input 
                                            type="time"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 outline-none"
                                            value={generateConfig.startTime}
                                            onChange={e => setGenerateConfig({...generateConfig, startTime: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Duration (min)</label>
                                        <input 
                                            type="number"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 outline-none"
                                            value={generateConfig.durationMinutes}
                                            onChange={e => setGenerateConfig({...generateConfig, durationMinutes: parseInt(e.target.value) || 120})}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                            checked={generateConfig.skipWeekends}
                                            onChange={e => setGenerateConfig({...generateConfig, skipWeekends: e.target.checked})}
                                        />
                                        <span className="text-sm font-bold text-slate-700">Skip Weekends (Sat/Sun)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-8">
                                <button 
                                    onClick={() => setIsGenerateModalOpen(false)}
                                    className="px-5 py-2.5 neo-btn rounded-xl font-bold text-slate-600"
                                    disabled={generating}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAutoGenerate}
                                    className="px-5 py-2.5 neo-btn-accent rounded-xl font-bold flex items-center gap-2"
                                    disabled={generating}
                                >
                                    {generating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Manual Exam Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="neo-card p-6 w-full max-w-md border-none">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Plus className="text-blue-600" /> Add Exam manually
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Subject</label>
                                    <select 
                                        className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 outline-none"
                                        value={addForm.subject}
                                        onChange={e => setAddForm({...addForm, subject: e.target.value})}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.filter(s => gradeSubjects.includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">Date</label>
                                    <input 
                                        type="date"
                                        className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 outline-none"
                                        value={addForm.exam_date}
                                        onChange={e => setAddForm({...addForm, exam_date: e.target.value})}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Start Time</label>
                                        <input 
                                            type="time"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 outline-none"
                                            value={addForm.start_time}
                                            onChange={e => setAddForm({...addForm, start_time: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">Duration (min)</label>
                                        <input 
                                            type="number"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 outline-none"
                                            value={addForm.duration_minutes}
                                            onChange={e => setAddForm({...addForm, duration_minutes: parseInt(e.target.value) || 120})}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-8">
                                <button 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 neo-btn rounded-xl font-bold text-slate-600"
                                    disabled={generating}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleAddExam}
                                    className="px-5 py-2.5 neo-btn-accent rounded-xl font-bold flex items-center gap-2"
                                    disabled={generating}
                                >
                                    {generating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Exam
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ExamSchedulesDashboard;
