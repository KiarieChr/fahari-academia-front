import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle, Plus, Loader2, Trash2, X, Save } from 'lucide-react';
import GradingHeader from '../../../academics/grading-system/components/GradingHeader';
import GradingSummaryCards from '../../../academics/grading-system/components/GradingSummaryCards';
import GradingScaleTable from '../../../academics/grading-system/components/GradingScaleTable';
import GradingSimulator from '../../../academics/grading-system/components/GradingSimulator';
import { examService } from '../../../../services/examService';
import studentSettingsService from '../../../../services/studentSettingsService';

const GradingAssessmentSetup = () => {
    const [scales, setScales] = useState([]);
    const [curricula, setCurricula] = useState([]);
    const [allCurricula, setAllCurricula] = useState([]);
    const [activeCurriculum, setActiveCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Initial Level Template
    const newLevelTemplate = { grade: '', label: '', min_mark: 0, max_mark: 100, points: 0, color_hex: '#6366f1' };
    
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        curriculum: '',
        scale_type: 'rubric',
        max_mark: 100,
        pass_mark: 40,
        description: '',
        levels: [{ ...newLevelTemplate, order: 1 }]
    });

    const fetchScalesAndData = async () => {
        try {
            setLoading(true);
            const [scalesData, currData] = await Promise.all([
                examService.getGradingScales(),
                studentSettingsService.getCurricula()
            ]);
            
            const list = scalesData.results || scalesData;
            setScales(list);
            
            const allCurrList = currData.results || currData;
            setAllCurricula(allCurrList);

            // Extract unique curricula that have scales for the header tabs
            const currMap = {};
            list.forEach(s => {
                if (!currMap[s.curriculum]) {
                    currMap[s.curriculum] = { id: s.curriculum, name: s.curriculum_name, code: s.curriculum_code };
                }
            });
            
            // If a curriculum was selected but has no scales, ensure it's still in the tabs
            if (activeCurriculum && !currMap[activeCurriculum]) {
                const ac = allCurrList.find(c => c.id === activeCurriculum);
                if (ac) currMap[ac.id] = { id: ac.id, name: ac.name, code: ac.code };
            }
            
            const currList = Object.values(currMap);
            setCurricula(currList);
            
            if (currList.length > 0 && !activeCurriculum) {
                setActiveCurriculum(currList[0].id);
            }
        } catch (err) {
            toast.error('Failed to load grading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchScalesAndData(); }, []);

    const activeScales = scales.filter(s => s.curriculum === activeCurriculum);
    const activeCurrCode = curricula.find(c => c.id === activeCurriculum)?.code || '';

    // -- Form Handlers --
    const handleAddLevel = () => {
        setFormData(prev => ({
            ...prev,
            levels: [...prev.levels, { ...newLevelTemplate, order: prev.levels.length + 1 }]
        }));
    };

    const handleRemoveLevel = (index) => {
        setFormData(prev => ({
            ...prev,
            levels: prev.levels.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 }))
        }));
    };

    const handleLevelChange = (index, field, value) => {
        setFormData(prev => {
            const newLevels = [...prev.levels];
            newLevels[index] = { ...newLevels[index], [field]: value };
            return { ...prev, levels: newLevels };
        });
    };

    const handleSaveScale = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.code || !formData.curriculum) {
            toast.warn('Please fill all required fields');
            return;
        }
        if (formData.levels.length === 0) {
            toast.warn('Add at least one grading level');
            return;
        }

        setSaving(true);
        try {
            await examService.createGradingScale(formData);
            toast.success('Grading scale created successfully');
            setIsAddModalOpen(false);
            
            // Set the active curriculum to the one we just added to
            setActiveCurriculum(Number(formData.curriculum));
            
            // Reset form
            setFormData({
                name: '', code: '', curriculum: '', scale_type: 'rubric',
                max_mark: 100, pass_mark: 40, description: '',
                levels: [{ ...newLevelTemplate, order: 1 }]
            });
            
            fetchScalesAndData();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to create grading scale');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-[-1rem] relative z-10 mr-4">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 neo-btn-accent rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    <Plus size={18} /> Add Grading Scale
                </button>
            </div>
            
            <GradingHeader
                curricula={curricula}
                activeCurriculum={activeCurriculum}
                setActiveCurriculum={setActiveCurriculum}
            />

            <GradingSummaryCards scales={scales} activeScales={activeScales} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="neo-card border-none p-12 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                            <p className="text-slate-500 font-bold">Loading grading scales...</p>
                        </div>
                    ) : activeScales.length === 0 ? (
                        <div className="neo-card border-none p-12 text-center flex flex-col items-center justify-center">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-slate-700 font-bold text-lg mb-2">No grading scales found for this curriculum.</p>
                            <p className="text-slate-500 text-sm max-w-md mx-auto">
                                Click the "Add Grading Scale" button above to configure rubrics, points, or percentage-based scales.
                            </p>
                        </div>
                    ) : (
                        activeScales.map(scale => (
                            <GradingScaleTable
                                key={scale.id}
                                scale={scale}
                                onUpdate={fetchScalesAndData}
                            />
                        ))
                    )}
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <GradingSimulator
                        scales={activeScales}
                        curriculumCode={activeCurrCode}
                    />
                </div>
            </div>

            {/* --- ADD GRADING SCALE MODAL --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
                    <div className="neo-card border-none w-full max-w-4xl max-h-[90vh] flex flex-col bg-white">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <div>
                                <h2 className="text-xl font-black text-slate-800">Create Grading Scale</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Configure Rubric or Point System</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 neo-btn rounded-xl">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="add-scale-form" onSubmit={handleSaveScale} className="space-y-6">
                                {/* Core Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Scale Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. CBC Lower Primary"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Short Code</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. CBC_LP"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                            value={formData.code}
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Curriculum</label>
                                        <select 
                                            required
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                            value={formData.curriculum}
                                            onChange={e => setFormData({...formData, curriculum: e.target.value})}
                                        >
                                            <option value="">Select Curriculum</option>
                                            {allCurricula.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Scale Type</label>
                                        <select 
                                            required
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                            value={formData.scale_type}
                                            onChange={e => setFormData({...formData, scale_type: e.target.value})}
                                        >
                                            <option value="rubric">Rubric / Competency (e.g. CBC)</option>
                                            <option value="points">Points-based (e.g. 8-4-4)</option>
                                            <option value="percentage">Percentage-based</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Max Mark</label>
                                        <input 
                                            required type="number" step="0.01"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                            value={formData.max_mark}
                                            onChange={e => setFormData({...formData, max_mark: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Pass Mark</label>
                                        <input 
                                            required type="number" step="0.01"
                                            className="w-full px-4 py-3 neo-pressed border-none rounded-xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-blue-100"
                                            value={formData.pass_mark}
                                            onChange={e => setFormData({...formData, pass_mark: parseFloat(e.target.value) || 0})}
                                        />
                                    </div>
                                </div>

                                {/* Levels Builder */}
                                <div className="mt-8 border-t border-slate-100 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg">Grading Levels</h3>
                                            <p className="text-xs font-bold text-slate-400">Define the boundaries (e.g., EE, ME, AE, BE) ordered from highest to lowest.</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={handleAddLevel}
                                            className="px-3 py-1.5 neo-btn rounded-lg text-xs font-bold flex items-center gap-1 text-indigo-600"
                                        >
                                            <Plus size={14} /> Add Row
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Headers */}
                                        <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <div className="col-span-2">Grade (e.g. EE)</div>
                                            <div className="col-span-3">Label / Description</div>
                                            <div className="col-span-2 text-center">Min Score</div>
                                            <div className="col-span-2 text-center">Max Score</div>
                                            <div className="col-span-1 text-center">Points</div>
                                            <div className="col-span-1 text-center">Color</div>
                                            <div className="col-span-1 text-center"></div>
                                        </div>
                                        
                                        {/* Rows */}
                                        {formData.levels.map((level, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-3 items-center neo-pressed p-2 rounded-xl">
                                                <div className="col-span-2">
                                                    <input 
                                                        required type="text" placeholder="EE"
                                                        className="w-full px-3 py-2 bg-white rounded-lg text-sm font-bold border border-slate-100 focus:outline-none"
                                                        value={level.grade} onChange={e => handleLevelChange(index, 'grade', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <input 
                                                        required type="text" placeholder="Exceeding"
                                                        className="w-full px-3 py-2 bg-white rounded-lg text-sm font-medium border border-slate-100 focus:outline-none"
                                                        value={level.label} onChange={e => handleLevelChange(index, 'label', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input 
                                                        required type="number" step="0.01"
                                                        className="w-full px-3 py-2 bg-white rounded-lg text-sm font-mono text-center border border-slate-100 focus:outline-none"
                                                        value={level.min_mark} onChange={e => handleLevelChange(index, 'min_mark', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input 
                                                        required type="number" step="0.01"
                                                        className="w-full px-3 py-2 bg-white rounded-lg text-sm font-mono text-center border border-slate-100 focus:outline-none"
                                                        value={level.max_mark} onChange={e => handleLevelChange(index, 'max_mark', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <input 
                                                        required type="number" step="0.01"
                                                        className="w-full px-2 py-2 bg-white rounded-lg text-sm font-mono text-center border border-slate-100 focus:outline-none"
                                                        value={level.points} onChange={e => handleLevelChange(index, 'points', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <input 
                                                        type="color"
                                                        className="w-8 h-8 rounded cursor-pointer border-none p-0"
                                                        value={level.color_hex} onChange={e => handleLevelChange(index, 'color_hex', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <button 
                                                        type="button" onClick={() => handleRemoveLevel(index)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                            <button 
                                type="button" 
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-6 py-2.5 neo-btn rounded-xl text-slate-600 font-bold"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                form="add-scale-form"
                                disabled={saving}
                                className="px-6 py-2.5 neo-btn-accent rounded-xl text-white font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Grading Scale
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradingAssessmentSetup;
