import React, { useState, useEffect } from 'react';
import { Loader2, Save, BookOpen, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '../../../../services/apiClient';
import studentSettingsService from '../../../../services/studentSettingsService';

const GradeSubjectsMapping = () => {
    const [curricula, setCurricula] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    const [selectedCurriculum, setSelectedCurriculum] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    
    const [mappedSubjectIds, setMappedSubjectIds] = useState(new Set());
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingMappings, setLoadingMappings] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [curriculaRes, gradesRes, subjectsRes] = await Promise.all([
                    studentSettingsService.getCurricula(),
                    studentSettingsService.getClasses(),
                    api.timetable.getSubjects()
                ]);
                setCurricula(curriculaRes.results || curriculaRes || []);
                setGrades(gradesRes.results || gradesRes || []);
                setSubjects(subjectsRes.results || subjectsRes || []);
            } catch (error) {
                toast.error('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchMappings = async () => {
            if (!selectedGrade) {
                setMappedSubjectIds(new Set());
                return;
            }
            setLoadingMappings(true);
            try {
                const mappingsRes = await api.timetable.getGradeSubjects({ grade: selectedGrade });
                const mappings = mappingsRes.results || mappingsRes || [];
                setMappedSubjectIds(new Set(mappings.map(m => m.subject)));
            } catch (error) {
                toast.error('Failed to load mapped subjects');
            } finally {
                setLoadingMappings(false);
            }
        };
        fetchMappings();
    }, [selectedGrade]);

    const handleToggleSubject = (subjectId) => {
        setMappedSubjectIds(prev => {
            const next = new Set(prev);
            if (next.has(subjectId)) next.delete(subjectId);
            else next.add(subjectId);
            return next;
        });
    };

    const handleSave = async () => {
        if (!selectedGrade) return;
        setSaving(true);
        try {
            await api.timetable.bulkUpdateGradeSubjects({
                grade: selectedGrade,
                subjects: Array.from(mappedSubjectIds)
            });
            toast.success('Mappings updated successfully');
        } catch (error) {
            toast.error('Failed to update mappings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    const filteredGrades = selectedCurriculum 
        ? grades.filter(g => g.curriculum === parseInt(selectedCurriculum))
        : grades;

    const filteredSubjects = selectedCurriculum
        ? subjects.filter(s => s.curriculum === parseInt(selectedCurriculum))
        : subjects;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Layers size={20} className="text-blue-600" />
                    Map Subjects to Grades
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Select a curriculum and grade to define which subjects apply to that specific level.
                </p>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Curriculum</label>
                        <select 
                            value={selectedCurriculum}
                            onChange={e => {
                                setSelectedCurriculum(e.target.value);
                                setSelectedGrade('');
                            }}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">Select Curriculum</option>
                            {curricula.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grade Level</label>
                        <select 
                            value={selectedGrade}
                            onChange={e => setSelectedGrade(e.target.value)}
                            disabled={!selectedCurriculum}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        >
                            <option value="">Select Grade</option>
                            {filteredGrades.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedGrade && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-md font-semibold text-slate-800 dark:text-white">
                                Available Subjects for {filteredGrades.find(g => g.id === parseInt(selectedGrade))?.name}
                            </h3>
                            <button
                                onClick={handleSave}
                                disabled={saving || loadingMappings}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/30 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Save Mappings
                            </button>
                        </div>

                        {loadingMappings ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="animate-spin text-blue-600" size={24} />
                            </div>
                        ) : filteredSubjects.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                No subjects found for this curriculum.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSubjects.map(subject => {
                                    const isSelected = mappedSubjectIds.has(subject.id);
                                    return (
                                        <div 
                                            key={subject.id}
                                            onClick={() => handleToggleSubject(subject.id)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                isSelected 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-white'}`}>
                                                            {subject.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {subject.code} • {subject.subject_type_display}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                                                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                    {isSelected && (
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradeSubjectsMapping;
