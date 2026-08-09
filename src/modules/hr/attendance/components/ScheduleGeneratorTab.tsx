import React, { useState, useEffect } from 'react';
import { api } from '../../../../services/apiClient';
import { Calendar, CheckCircle2, ChevronRight, Clock, Info, Play, AlertTriangle, User, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ScheduleGeneratorTab = () => {
    const [viewMode, setViewMode] = useState('generator'); // 'generator' | 'calendar'

    // Generator state
    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [classSessions, setClassSessions] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [generateMode, setGenerateMode] = useState('semi_auto');
    const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
    const [generating, setGenerating] = useState(false);
    const [results, setResults] = useState(null);

    // Calendar state
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedClassForCal, setSelectedClassForCal] = useState('');
    const [calendarData, setCalendarData] = useState(null);
    const [calendarLoading, setCalendarLoading] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const termsData = await api.academics.getTerms();
                setTerms(termsData.results || termsData);
                if ((termsData.results || termsData).length > 0) {
                    setSelectedTerm((termsData.results || termsData)[0].id);
                }

                const teachersData = await api.timetable.getTeachers();
                setTeachers(teachersData.results || teachersData);
            } catch (error) {
                toast.error("Failed to load initial data.");
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedTerm) {
            const loadClasses = async () => {
                try {
                    const data = await api.academics.getActiveSessions({ term: selectedTerm });
                    setClassSessions(data.results || data);
                } catch (error) {
                    toast.error("Failed to load class sessions.");
                }
            };
            loadClasses();
        }
    }, [selectedTerm]);

    useEffect(() => {
        if (viewMode === 'calendar' && (selectedTeacher || selectedClassForCal)) {
            loadCalendarData();
        }
    }, [year, month, selectedTeacher, selectedClassForCal, viewMode]);

    const handleGenerate = async () => {
        if (!selectedTerm) {
            toast.error("Please select a term");
            return;
        }

        const confirm = await Swal.fire({
            title: 'Generate Schedules?',
            text: `This will generate timetables for ${selectedClasses.length === 0 ? 'ALL' : selectedClasses.length} class(es).`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, generate',
            confirmButtonColor: '#4f46e5',
        });

        if (!confirm.isConfirmed) return;

        setGenerating(true);
        setResults(null);

        try {
            const data = {
                term_id: selectedTerm,
                mode: generateMode,
                effective_from: effectiveFrom,
            };
            if (selectedClasses.length > 0) {
                data.class_sessions = selectedClasses;
            }

            const response = await api.timetable.generateForTerm(data);
            setResults(response);
            toast.success("Schedule generation complete.");
        } catch (error) {
            toast.error(error?.data?.error || "Generation failed.");
        } finally {
            setGenerating(false);
        }
    };

    const loadCalendarData = async () => {
        setCalendarLoading(true);
        try {
            const params = { year, month };
            if (selectedTeacher) params.teacher = selectedTeacher;
            if (selectedClassForCal) params.class_session = selectedClassForCal;

            const response = await api.timetable.getMonthlyView(params);
            setCalendarData(response);
        } catch (error) {
            toast.error("Failed to load calendar view.");
            setCalendarData(null);
        } finally {
            setCalendarLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const params = { year, month, export: format };
            if (selectedTeacher) params.teacher = selectedTeacher;
            if (selectedClassForCal) params.class_session = selectedClassForCal;
            
            const response = await api.get('/api/timetable/monthly-view/', { 
                params,
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `timetable_${year}_${month}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error(`Failed to export ${format.toUpperCase()}`);
        }
    };

    const handleClassToggle = (id) => {
        setSelectedClasses(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    // Calendar render helpers
    const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
    const getFirstDayOfMonth = (y, m) => {
        const d = new Date(y, m - 1, 1).getDay();
        return d === 0 ? 6 : d - 1; // 0=Mon, 6=Sun
    };

    const renderCalendar = () => {
        if (!calendarData || !calendarData.days) return null;

        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2 border border-slate-100 bg-slate-50/50"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayData = calendarData.days[dateStr] || { slots: [], exception: null };
            const isWeekend = new Date(year, month - 1, i).getDay() === 0;

            days.push(
                <div key={i} className={`min-h-[120px] p-2 border border-slate-200 ${isWeekend ? 'bg-slate-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-semibold ${isWeekend ? 'text-slate-400' : 'text-slate-700'}`}>{i}</span>
                        {dayData.exception && (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase truncate max-w-[80px]" title={dayData.exception.reason}>
                                {dayData.exception.type}
                            </span>
                        )}
                    </div>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                        {dayData.slots?.map(slot => (
                            <div key={slot.id} className="text-[10px] p-1.5 rounded bg-blue-50 border border-blue-100 leading-tight">
                                <div className="font-semibold text-blue-800 flex justify-between">
                                    <span className="truncate">{slot.subject_name}</span>
                                    <span>{slot.start_time}</span>
                                </div>
                                <div className="text-slate-500 truncate flex justify-between">
                                    <span>{selectedTeacher ? slot.class_session_name : slot.teacher_name}</span>
                                    <span>{slot.room_name}</span>
                                </div>
                            </div>
                        ))}
                        {dayData.slots?.length === 0 && !isWeekend && !dayData.exception && (
                            <div className="text-[10px] text-slate-400 italic text-center py-2">No slots</div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                {DAY_NAMES.map(d => (
                    <div key={d} className="bg-slate-100 p-3 text-center text-xs font-bold text-slate-500 uppercase">
                        {d}
                    </div>
                ))}
                {days}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex justify-center">
                <div className="bg-slate-100 p-1 rounded-xl inline-flex">
                    <button
                        onClick={() => setViewMode('generator')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'generator' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Play size={16} className="inline mr-2 -mt-0.5" />
                        Batch Generator
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Calendar size={16} className="inline mr-2 -mt-0.5" />
                        Monthly Calendar
                    </button>
                </div>
            </div>

            {viewMode === 'generator' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Generator Config */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Configuration</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Academic Term</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        value={selectedTerm || ''}
                                        onChange={(e) => setSelectedTerm(e.target.value)}
                                    >
                                        <option value="">Select Term</option>
                                        {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Effective From</label>
                                    <input
                                        type="date"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        value={effectiveFrom}
                                        onChange={(e) => setEffectiveFrom(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Generation Mode</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        value={generateMode}
                                        onChange={(e) => setGenerateMode(e.target.value)}
                                    >
                                        <option value="semi_auto">Safe Mode (Fill Gaps Only)</option>
                                        <option value="suggestions_only">Suggestions Only (Dry Run)</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        <Info size={12} className="inline mr-1" />
                                        Safe mode will not overwrite existing slots.
                                    </p>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || !selectedTerm}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    {generating ? (
                                        <span className="animate-pulse">Generating...</span>
                                    ) : (
                                        <>
                                            <Play size={18} />
                                            Generate Schedules
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Class Selector */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Target Classes</h3>
                                <button 
                                    onClick={() => setSelectedClasses(selectedClasses.length === classSessions.length ? [] : classSessions.map(c => c.id))}
                                    className="text-xs text-indigo-600 font-semibold hover:underline"
                                >
                                    {selectedClasses.length === classSessions.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            
                            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {classSessions.map(cs => (
                                    <label key={cs.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="rounded text-indigo-600 w-4 h-4"
                                            checked={selectedClasses.includes(cs.id)}
                                            onChange={() => handleClassToggle(cs.id)}
                                        />
                                        <span className="text-sm font-medium text-slate-700">{cs.name}</span>
                                    </label>
                                ))}
                                {classSessions.length === 0 && (
                                    <p className="text-sm text-slate-500 italic text-center py-4">Select a term first</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-2">
                        {results ? (
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="text-emerald-500" />
                                    Generation Results
                                </h3>
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                        <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Slots Placed</div>
                                        <div className="text-2xl font-black text-emerald-700">{results.summary.total_placed}</div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                        <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Allocations</div>
                                        <div className="text-2xl font-black text-blue-700">{results.summary.total_allocations}</div>
                                    </div>
                                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                                        <div className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">Success Rate</div>
                                        <div className="text-2xl font-black text-indigo-700">{results.summary.percentage}%</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-700">Class Details</h4>
                                    {results.class_results.map(cr => (
                                        <div key={cr.class_session_id} className="border border-slate-200 rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                                                <span className="font-bold text-slate-800">{cr.class_session_name}</span>
                                                <span className="text-sm font-semibold text-indigo-600">
                                                    {cr.result.placed_count} / {cr.result.total_allocations} placed
                                                </span>
                                            </div>
                                            {cr.result.unplaced?.length > 0 && (
                                                <div className="p-3 bg-amber-50/50">
                                                    <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                                                        <AlertTriangle size={14} /> Unplaced Allocations
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {cr.result.unplaced.map((u, idx) => (
                                                            <li key={idx} className="text-xs text-amber-800">
                                                                <span className="font-semibold">{u.subject}</span> ({u.teacher}) - {u.reason}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-center text-slate-400">
                                <Play size={48} className="mb-4 text-slate-300" strokeWidth={1.5} />
                                <h3 className="text-lg font-bold text-slate-600 mb-2">Ready to Generate</h3>
                                <p className="max-w-sm">Select a term and target classes on the left, then click generate to bulk-schedule timetables.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                    {/* Calendar Config */}
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Month</label>
                            <select 
                                className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium w-40"
                                value={month}
                                onChange={e => setMonth(Number(e.target.value))}
                            >
                                {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                            <input 
                                type="number" 
                                className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium w-24"
                                value={year}
                                onChange={e => setYear(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter by Teacher</label>
                            <select 
                                className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium w-48"
                                value={selectedTeacher}
                                onChange={e => { setSelectedTeacher(e.target.value); setSelectedClassForCal(''); }}
                            >
                                <option value="">Select Teacher...</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                            </select>
                        </div>
                        <div className="text-slate-400 text-sm font-semibold mb-2">OR</div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Filter by Class</label>
                            <select 
                                className="p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium w-48"
                                value={selectedClassForCal}
                                onChange={e => { setSelectedClassForCal(e.target.value); setSelectedTeacher(''); }}
                            >
                                <option value="">Select Class...</option>
                                {classSessions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex-1"></div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleExport('pdf')}
                                disabled={(!selectedTeacher && !selectedClassForCal) || calendarLoading}
                                className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 border border-rose-200 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <FileText size={16} />
                                PDF
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                disabled={(!selectedTeacher && !selectedClassForCal) || calendarLoading}
                                className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <FileSpreadsheet size={16} />
                                Excel
                            </button>
                        </div>
                    </div>

                    {!selectedTeacher && !selectedClassForCal ? (
                        <div className="py-20 text-center text-slate-400">
                            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="font-medium text-lg text-slate-500">Please select a Teacher or Class</p>
                            <p className="text-sm mt-1">To view the monthly calendar layout</p>
                        </div>
                    ) : calendarLoading ? (
                        <div className="py-20 text-center animate-pulse text-indigo-500 font-bold tracking-widest uppercase text-sm">
                            Loading Calendar...
                        </div>
                    ) : (
                        renderCalendar()
                    )}
                </div>
            )}
        </div>
    );
};

export default ScheduleGeneratorTab;
