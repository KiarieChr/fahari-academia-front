import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import ReportsHeader from './components/ReportsHeader';
import ReportsOverview from './components/ReportsOverview';
import StudentReportsTable from './components/StudentReportsTable';
import studentSettingsService from '../../../services/studentSettingsService';
import { examService } from '../../../services/examService';
import { Filter, RefreshCw, Printer, Download, PenTool, FileText } from 'lucide-react';
import ReportBuilderSetupModal from './components/ReportBuilderSetupModal';

const ReportsDashboard = () => {
    const [showBuilderModal, setShowBuilderModal] = useState(false);
    const [academicYears, setAcademicYears] = useState([]);
    const [terms, setTerms] = useState([]);
    const [grades, setGrades] = useState([]);
    const [classSessions, setClassSessions] = useState([]);
    const [curriculaList, setCurriculaList] = useState([]);

    const [context, setContext] = useState({
        academicYear: '',
        term: '',
        grade: '',
        classSession: '',
    });

    const [termResults, setTermResults] = useState([]);
    const [classAnalysis, setClassAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [computing, setComputing] = useState(false);

    // Load initial dropdown data
    useEffect(() => {
        const load = async () => {
            try {
                const [years, trms, cls, currs] = await Promise.all([
                    studentSettingsService.getAcademicYears(),
                    studentSettingsService.getTerms(),
                    studentSettingsService.getClasses(),
                    studentSettingsService.getCurricula(),
                ]);
                const yearsList = years.results || years;
                setAcademicYears(yearsList);
                setTerms(trms.results || trms);
                setGrades(cls.results || cls);
                setCurriculaList(currs.results || currs || []);

                if (!context.academicYear) {
                    const currentYear = new Date().getFullYear().toString();
                    const currentYrObj = yearsList.find(y => y.name === currentYear || y.name?.includes(currentYear));
                    if (currentYrObj) {
                        setContext(prev => ({ ...prev, academicYear: currentYrObj.id }));
                    }
                }
            } catch (err) {
                toast.error('Failed to load filter data');
            }
        };
        load();
    }, []);

    // Resolve class session when year+term+grade changes
    useEffect(() => {
        if (!context.academicYear || !context.term || !context.grade) {
            setContext(prev => ({ ...prev, classSession: '' }));
            setClassSessions([]);
            setTermResults([]);
            setClassAnalysis(null);
            return;
        }
        const findSession = async () => {
            try {
                const sessions = await studentSettingsService.getClassSessions({
                    academic_year: context.academicYear,
                    term: context.term,
                    grade: context.grade,
                });
                const list = sessions.results || sessions || [];
                setClassSessions(list);
                if (list.length > 0) {
                    setContext(prev => ({ ...prev, classSession: list[0].id }));
                } else {
                    setContext(prev => ({ ...prev, classSession: '' }));
                    setTermResults([]);
                    setClassAnalysis(null);
                }
            } catch {
                setClassSessions([]);
                setContext(prev => ({ ...prev, classSession: '' }));
                setTermResults([]);
                setClassAnalysis(null);
            }
        };
        findSession();
    }, [context.academicYear, context.term, context.grade]);

    // Fetch and Compute
    const loadResults = async (sessionId) => {
        try {
            setLoading(true);
            const [data, analysis] = await Promise.all([
                examService.getTermResults({ class_session: sessionId }),
                examService.getClassAnalysis(sessionId)
            ]);
            setTermResults(data.results || data);
            setClassAnalysis(analysis);
        } catch (err) {
            toast.error('Failed to load term results');
        } finally {
            setLoading(false);
        }
    };

    const handleComputeResults = async (sessionId) => {
        try {
            setComputing(true);
            await examService.computeTermResults(sessionId, null);
            await loadResults(sessionId);
            toast.success('Term results computed successfully!');
        } catch (err) {
            console.error('Computation error:', err, err.data);
            const backendError = err.data?.error || err.data?.detail;
            const errorMsg = backendError ? (typeof backendError === 'string' ? backendError : JSON.stringify(backendError)) : (err.message || 'Failed to compute term results');
            toast.error(errorMsg);
        } finally {
            setComputing(false);
        }
    };

    // Auto-compute when session changes
    useEffect(() => {
        if (context.classSession) {
            handleComputeResults(context.classSession);
        }
    }, [context.classSession]);

    // Extract curriculum logic based on the session's grade to pass down to children
    const activeSession = classSessions.find(s => s.id === context.classSession);
    
    // We maintain a local curriculum for UI theme if one isn't resolved from session
    const [uiCurriculum, setUiCurriculum] = useState('CBC');
    const curriculum = activeSession?.curriculum_name || uiCurriculum;

    // Filter terms based on selected academic year
    const filteredTerms = useMemo(() => {
        if (!context.academicYear) return terms;
        return terms.filter(t => String(t.academic_year) === String(context.academicYear));
    }, [terms, context.academicYear]);

    // Filter grades based on selected curriculum
    const filteredGrades = useMemo(() => {
        if (!curriculum) return grades;
        return grades.filter(g => g.curriculum_name === curriculum);
    }, [grades, curriculum]);

    return (
        <DashboardLayout title="Reports">
            <div className={`p-3 space-y-6 max-w-[1200px] mx-auto min-h-[100vh] transition-colors duration-500 ${curriculum === 'CBC' ? 'bg-teal-50/10' : 'bg-indigo-50/10'}`}>
                <ReportsHeader 
                    curriculum={curriculum} 
                    setCurriculum={setUiCurriculum}
                    curriculaList={curriculaList} 
                />

                <div className="flex flex-col gap-6">
                    {/* Top Filters Card */}
                    <div className="w-full neo-card p-3 rounded-2xl relative overflow-hidden shrink-0">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                            <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100 font-bold text-lg">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                                    <Filter size={20} />
                                </div>
                                <span>Report Filters</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                {context.academicYear && context.term && context.grade && (
                                    <div className={`px-4 py-2 rounded-xl text-xs font-bold border text-center ${context.classSession ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                        {context.classSession ? `Active Session: ${activeSession?.name}` : 'No Session Found'}
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => setShowBuilderModal(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                                >
                                    <PenTool size={16} />
                                    <span className="hidden sm:inline">Open Report Builder</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <Printer size={16} />
                                    <span className="hidden sm:inline">Print</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <Download size={16} />
                                    <span className="hidden sm:inline">Export</span>
                                </button>
                            </div>
                        </div>
                        
                        <div 
                            className="grid gap-6 items-end"
                            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</label>
                                <select
                                    value={context.academicYear}
                                    onChange={e => setContext({ ...context, academicYear: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                >
                                    <option value="">-- Select Year --</option>
                                    {academicYears.map(y => (
                                        <option key={y.id} value={y.id}>{y.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term</label>
                                <select
                                    value={context.term}
                                    onChange={e => setContext({ ...context, term: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                >
                                    <option value="">-- Select Term --</option>
                                    {filteredTerms.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class / Grade</label>
                                <select
                                    value={context.grade}
                                    onChange={e => setContext({ ...context, grade: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                >
                                    <option value="">-- Select Class --</option>
                                    {filteredGrades.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="">
                                <button
                                    onClick={() => context.classSession && handleComputeResults(context.classSession)}
                                    disabled={!context.classSession || computing}
                                    className="w-full neo-pressed flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                                >
                                    <RefreshCw size={18} className={computing ? 'animate-spin' : ''} />
                                    Recalculate Results
                                </button>
                            </div>
                        </div>
                        
                        {!context.classSession && context.academicYear && context.term && context.grade && (
                            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                                <strong>Note:</strong> We couldn't find a corresponding Class Session for this combination. To generate reports, the session must exist in the Academics setup.
                            </div>
                        )}
                    </div>

                    {/* Bottom Content Area */}
                    <div className="w-full flex flex-col gap-6">
                        <ReportsOverview curriculum={curriculum} results={termResults} analysis={classAnalysis} loading={loading || computing} />
        
                        <StudentReportsTable 
                            curriculum={curriculum} 
                            results={termResults} 
                            loading={loading || computing} 
                        />
                    </div>
                </div>
            </div>
            
            <ReportBuilderSetupModal
                isOpen={showBuilderModal}
                onClose={() => setShowBuilderModal(false)}
                curriculum={curriculum}
            />
        </DashboardLayout>
    );
};

export default ReportsDashboard;
