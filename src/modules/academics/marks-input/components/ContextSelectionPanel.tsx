import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Edit2, Filter } from 'lucide-react';
import studentSettingsService from '../../../../services/studentSettingsService';
import { curriculumService } from '../../../../services/curriculumService';
import { examService } from '../../../../services/examService';
import { institutionService } from '../../../../services/institutionService';

const ContextSelectionPanel = ({ context, setContext, maxMark = 100 }) => {
    const [academicYears, setAcademicYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [grades, setGrades] = useState([]);
    const [streams, setStreams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assessmentTypes, setAssessmentTypes] = useState([]);
    const [classSessions, setClassSessions] = useState([]);
    const [examinations, setExaminations] = useState([]);
    const [gradingScales, setGradingScales] = useState([]);
    const [institutionProfile, setInstitutionProfile] = useState(null);
    const [loadingExams, setLoadingExams] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load base data on mount
    useEffect(() => {
        const load = async () => {
            try {
                const [years, trms, cls, strms, subjs, ats, scales, instData] = await Promise.all([
                    studentSettingsService.getAcademicYears(),
                    studentSettingsService.getTerms(),
                    studentSettingsService.getClasses(),
                    studentSettingsService.getStreams(),
                    curriculumService.getSubjects(),
                    examService.getAssessmentTypes(),
                    examService.getGradingScales(),
                    institutionService.getProfile(),
                ]);
                const yearsList = years.results || years;
                setAcademicYears(yearsList);
                setTerms(trms.results || trms);
                setGrades(cls.results || cls);
                setStreams(strms.results || strms);
                setSubjects(subjs.results || subjs);
                setAssessmentTypes(ats.results || ats);
                setGradingScales(scales.results || scales);
                setInstitutionProfile(instData.data || instData);

                // Default to current year
                if (!context.academicYear) {
                    const currentYear = new Date().getFullYear().toString();
                    const currentYrObj = yearsList.find(y => y.name === currentYear || y.name?.includes(currentYear));
                    if (currentYrObj) {
                        setContext(prev => ({ ...prev, academicYear: currentYrObj.id }));
                    }
                }
            } catch (err) {
                toast.error('Failed to load dropdown data');
            }
        };
        load();
    }, []);

    // When year+term+grade are set, find the class session
    useEffect(() => {
        if (!context.academicYear || !context.term || !context.grade) {
            setContext(prev => ({ ...prev, classSession: '', examination: '' }));
            return;
        }
        const findSession = async () => {
            try {
                const sessions = await studentSettingsService.getClassSessions({
                    academic_year: context.academicYear,
                    term: context.term,
                    grade: context.grade,
                });
                const list = sessions.results || sessions;
                setClassSessions(list);
                if (list.length === 1) {
                    setContext(prev => ({ ...prev, classSession: list[0].id }));
                } else if (list.length > 1) {
                    setContext(prev => ({ ...prev, classSession: list[0].id }));
                } else {
                    setContext(prev => ({ ...prev, classSession: '', examination: '' }));
                }
            } catch {
                setContext(prev => ({ ...prev, classSession: '', examination: '' }));
            }
        };
        findSession();
    }, [context.academicYear, context.term, context.grade]);

    // When session + subject + assessmentType are set, find or create exam
    useEffect(() => {
        if (!context.classSession || !context.subject || !context.assessmentType) {
            setContext(prev => ({ ...prev, examination: '' }));
            setExaminations([]);
            return;
        }
        const findExam = async () => {
            try {
                setLoadingExams(true);
                const data = await examService.getExaminations({
                    class_session: context.classSession,
                    subject: context.subject,
                    assessment_type: context.assessmentType,
                });
                const list = data.results || data;
                setExaminations(list);
                if (list.length === 1) {
                    setContext(prev => ({ ...prev, examination: list[0].id, _examObj: list[0] }));
                    setIsCollapsed(true);
                } else if (list.length > 1) {
                    setContext(prev => ({ ...prev, examination: list[0].id, _examObj: list[0] }));
                    setIsCollapsed(true);
                } else {
                    // Exam not scheduled/found
                    setContext(prev => ({ ...prev, examination: null, _examObj: null }));
                    toast.warn('No scheduled exam found for this selection.');
                }
            } catch {
                setContext(prev => ({ ...prev, examination: '' }));
            } finally {
                setLoadingExams(false);
            }
        };
        findExam();
    }, [context.classSession, context.subject, context.assessmentType]);

    const handleChange = (key, value) => {
        const newCtx = { ...context, [key]: value };
        // Cascade resets
        if (key === 'academicYear' || key === 'term' || key === 'grade') {
            newCtx.classSession = '';
            newCtx.examination = '';
            // Also reset subject and assessment if class curriculum changes
            // To be safe, we reset them when grade changes
            if (key === 'grade') {
                newCtx.subject = '';
                newCtx.assessmentType = '';
            }
        }
        if (key === 'subject' || key === 'assessmentType') {
            newCtx.examination = '';
        }
        setContext(newCtx);
    };

    const activeCurriculum = grades.find(g => g.id == context.grade)?.curriculum;

    const filteredGrades = grades.filter(g => {
        if (!institutionProfile?.institution_type) return true;
        const type = institutionProfile.institution_type.toLowerCase();
        if (type === 'mixed') return true;
        
        const lvl = (g.level_name || g.name || '').toLowerCase();
        
        if (type.includes('primary')) {
            return lvl.includes('primary') || lvl.includes('lower') || lvl.includes('upper') || lvl.includes('cbc') || lvl.includes('grade') || lvl.includes('pp');
        }
        if (type.includes('secondary')) {
            return lvl.includes('secondary') || lvl.includes('junior') || lvl.includes('senior') || lvl.includes('form') || lvl.includes('jss');
        }
        return true;
    });

    const filteredSubjects = subjects.filter(s => {
        if (!activeCurriculum) return true;
        return s.curriculum == activeCurriculum;
    });

    const filteredAssessments = assessmentTypes.filter(a => {
        if (!activeCurriculum) return true;
        return a.curriculum == activeCurriculum;
    });

    const isReady = !!context.examination;

    const getSummary = () => {
        if (!context.examination) return null;
        const termName = terms.find(t => t.id == context.term)?.name || '';
        const gradeName = grades.find(g => g.id == context.grade)?.name || '';
        const streamName = streams.find(s => s.id == context.stream)?.name || '';
        const subjName = subjects.find(s => s.id == context.subject)?.name || '';
        const assessName = assessmentTypes.find(a => a.id == context.assessmentType)?.name || '';

        return [termName, gradeName, streamName, subjName, assessName].filter(Boolean).join(' • ');
    };

    return (
        <div className="bg-transparent border-b border-slate-200 dark:border-slate-700 relative z-20 transition-all duration-300">
            <div className="max-w-[1600px] mx-auto p-4">
                {isCollapsed && isReady ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                <Filter size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="truncate pr-4">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Active Context</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{getSummary()}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsCollapsed(false)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors shrink-0"
                        >
                            <Edit2 size={14} />
                            <span className="hidden sm:inline">Edit Filters</span>
                            <span className="sm:hidden">Edit</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {/* Academic Year */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Year</label>
                                <select
                                    className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={context.academicYear}
                                    onChange={e => handleChange('academicYear', e.target.value)}
                                >
                                    <option value="">Select Year</option>
                                    {academicYears.map(y => (
                                        <option key={y.id} value={y.id}>{y.name}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Term */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Term</label>
                                <select
                                    className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={context.term}
                                    onChange={e => handleChange('term', e.target.value)}
                                >
                                    <option value="">Select Term</option>
                                    {terms
                                        .filter(t => !context.academicYear || t.academic_year == context.academicYear)
                                        .map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                </select>
                            </div>
    
                            {/* Grade/Class */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Class</label>
                                <select
                                    className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={context.grade}
                                    onChange={e => handleChange('grade', e.target.value)}
                                >
                                    <option value="">Select Class</option>
                                    {filteredGrades.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Stream */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Stream</label>
                                <select
                                    className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={context.stream}
                                    onChange={e => handleChange('stream', e.target.value)}
                                >
                                    <option value="">All Streams</option>
                                    {streams
                                        .filter(s => !context.grade || s.grade == context.grade)
                                        .map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                </select>
                            </div>
    
                            {/* Subject */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
                                <select
                                    className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={context.subject}
                                    onChange={e => handleChange('subject', e.target.value)}
                                    title={!context.grade ? 'Select a Class first' : ''}
                                >
                                    <option value="">Select Subject</option>
                                    {filteredSubjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
    
                            {/* Assessment Type */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Assessment</label>
                                <select
                                    className="w-full pl-2 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={context.assessmentType}
                                    onChange={e => handleChange('assessmentType', e.target.value)}
                                >
                                    <option value="">Type</option>
                                    {filteredAssessments.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.weight}%)</option>
                                    ))}
                                </select>
                            </div>
                        </div>
    
                        {/* Status */}
                        <div className="flex items-center justify-between text-sm mt-1 border-t border-slate-100 dark:border-slate-700 pt-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                                <span className="text-slate-600 dark:text-slate-400">
                                    {loadingExams ? 'Finding exam...' : isReady ? 'Ready for input' : 'Please complete selection'}
                                </span>
                            </div>
                            {isReady && (
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setIsCollapsed(true)} 
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Hide Filters
                                    </button>
                                    <div className="text-xs font-semibold text-slate-500">
                                        Max Marks: {maxMark}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContextSelectionPanel;
