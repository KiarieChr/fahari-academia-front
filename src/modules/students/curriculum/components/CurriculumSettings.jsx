import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, GraduationCap, Layers, Book, AlertCircle, Trash2, Loader2, Plus, Edit2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { curriculumService } from '../../../../services/curriculumService';
import { api } from '../../../../services/api';

const CurriculumSettings = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    // Real data from API
    const [learningAreas, setLearningAreas] = useState([]);
    const [curricula, setCurricula] = useState([]);
    const [departments, setDepartments] = useState([]);

    // General settings (local state for now)
    const [generalSettings, setGeneralSettings] = useState({
        autoAssignSubjects: true,
        defaultCurriculum: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [areasRes, curriculaRes, deptsRes] = await Promise.all([
                curriculumService.getLearningAreas(),
                curriculumService.getCurricula(),
                api.get('/workforce/api/departments/', { params: { department_type: 'academic' } })
            ]);
            setLearningAreas(areasRes.results || areasRes);
            const currList = curriculaRes.results || curriculaRes;
            setCurricula(currList);
            setDepartments(deptsRes.data?.results || deptsRes.data || []);
            if (currList.length > 0 && !generalSettings.defaultCurriculum) {
                setGeneralSettings(prev => ({ ...prev, defaultCurriculum: currList[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch settings data:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    const handleDeleteArea = async (id, name) => {
        if (!confirm(`Delete learning area "${name}"? This cannot be undone.`)) return;
        try {
            await curriculumService.deleteLearningArea(id);
            setLearningAreas(learningAreas.filter(a => a.id !== id));
            toast.success('Learning area deleted');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete. It may have subjects linked.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900">Curriculum Settings</h2>
                    <p className="text-gray-500">Configure learning areas, general preferences, and defaults.</p>
                </div>
                <button onClick={handleSave}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200/50 transition-all">
                    <Save size={18} /> Save Changes
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Settings Sidebar */}
                <div className="w-full lg:w-64 space-y-1">
                    <button onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'general' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100 font-medium' : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}>
                        <Book size={18} /> General
                    </button>
                    <button onClick={() => setActiveTab('areas')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'areas' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100 font-medium' : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}>
                        <Layers size={18} /> Learning Areas
                    </button>
                    <button onClick={() => setActiveTab('departments')}
                        className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'departments' ? 'bg-white text-indigo-700 shadow-sm border border-gray-100 font-medium' : 'text-gray-600 hover:bg-white hover:text-gray-900'}`}>
                        <GraduationCap size={18} /> Departments
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="animate-spin text-gray-400" size={32} />
                            <span className="ml-3 text-gray-500">Loading settings...</span>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'general' && (
                                <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
                                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">General Configuration</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Auto-Assign Subjects</h4>
                                                <p className="text-xs text-gray-500">Automatically assign compulsory subjects when enrolling students</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer"
                                                    checked={generalSettings.autoAssignSubjects}
                                                    onChange={e => setGeneralSettings({ ...generalSettings, autoAssignSubjects: e.target.checked })} />
                                                <div className="w-10 h-[22px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all"></div>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="text-[13px] font-semibold text-gray-600 block mb-2">Default Curriculum</label>
                                            <select
                                                value={generalSettings.defaultCurriculum}
                                                onChange={e => setGeneralSettings({ ...generalSettings, defaultCurriculum: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none text-sm transition-all bg-gray-50/60 hover:bg-white focus:bg-white shadow-inner shadow-gray-100/50">
                                                <option value="">Select Default Curriculum</option>
                                                {curricula.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                                <AlertCircle size={12} /> Applied to new student admissions by default
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'areas' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Learning Areas</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{learningAreas.length} areas configured</p>
                                        </div>
                                    </div>

                                    {learningAreas.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="p-3.5 bg-gray-50 rounded-xl inline-block mb-3">
                                                <Layers className="w-7 h-7 text-gray-300" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-900">No learning areas</h3>
                                            <p className="text-sm text-gray-400 mt-1.5">
                                                Use the Learning Areas tab on the dashboard to add areas.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {learningAreas.map(area => (
                                                <div key={area.id} className="p-4 border border-gray-100 rounded-xl hover:border-indigo-200 transition-all group relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ backgroundColor: area.color_hex || '#6366f1' }} />
                                                    <div className="flex justify-between items-start mb-2 mt-1">
                                                        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: area.color_hex || '#6366f1' }}>
                                                            <Layers size={18} />
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleDeleteArea(area.id, area.name)}
                                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900">{area.name}</h4>
                                                    {area.code && <p className="text-xs text-indigo-600 font-mono mt-0.5">{area.code}</p>}
                                                    <p className="text-xs text-gray-400 capitalize mt-1">{area.category || 'other'}</p>
                                                    <div className="mt-3 pt-2 border-t border-gray-50 text-xs font-medium text-gray-400">
                                                        {area.subject_count ?? 0} Subjects linked
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'departments' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Academic Departments</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{departments.length} tuition departments</p>
                                        </div>
                                    </div>

                                    {departments.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="p-3.5 bg-gray-50 rounded-xl inline-block mb-3">
                                                <GraduationCap className="w-7 h-7 text-gray-300" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-900">No academic departments</h3>
                                            <p className="text-sm text-gray-400 mt-1.5">
                                                Academic departments can be created in the HR module.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {departments.map(dept => (
                                                <div key={dept.id} className="bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all group relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl bg-orange-400" />
                                                    <div className="flex items-center gap-3 mb-3 mt-1">
                                                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
                                                            <GraduationCap size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-sm">{dept.name}</h4>
                                                            {dept.code && <p className="text-[10px] text-orange-600 font-mono uppercase tracking-wide">{dept.code}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-xs bg-gray-50/80 p-2 rounded-lg">
                                                            <span className="text-gray-500">HOD</span>
                                                            <span className="font-medium text-gray-800">{dept.hod_name || 'Unassigned'}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs bg-gray-50/80 p-2 rounded-lg">
                                                            <span className="text-gray-500">Staff</span>
                                                            <span className="font-medium text-gray-800 flex items-center gap-1"><Users size={12} /> {dept.employee_count ?? 0}</span>
                                                        </div>
                                                        {dept.faculty_name && (
                                                            <div className="flex items-center justify-between text-xs bg-gray-50/80 p-2 rounded-lg">
                                                                <span className="text-gray-500">Faculty</span>
                                                                <span className="font-medium text-gray-800">{dept.faculty_name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurriculumSettings;

