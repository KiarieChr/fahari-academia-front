import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Loader2, Trash2, Save, BookOpen, ChevronRight, LayoutTemplate } from 'lucide-react';
import { examService } from '../../../../services/examService';
import studentSettingsService from '../../../../services/studentSettingsService';

const GradingAssessmentSetup = () => {
    const [scales, setScales] = useState([]);
    const [allCurricula, setAllCurricula] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
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
        is_active: true,
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

            if (allCurrList.length > 0 && !formData.curriculum) {
                setFormData(prev => ({ ...prev, curriculum: allCurrList[0].id.toString() }));
            }
        } catch (err) {
            toast.error('Failed to load grading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchScalesAndData(); }, []);

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
            if (editingId) {
                await examService.updateGradingScale(editingId, formData);
                toast.success('Grading scale updated successfully');
            } else {
                await examService.createGradingScale(formData);
                toast.success('Grading scale created successfully');
            }
            
            // Reset form but keep curriculum
            setFormData(prev => ({
                name: '', code: '', curriculum: prev.curriculum, scale_type: 'rubric',
                max_mark: 100, pass_mark: 40, description: '', is_active: true,
                levels: [{ ...newLevelTemplate, order: 1 }]
            }));
            setEditingId(null);
            
            fetchScalesAndData();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to save grading scale');
        } finally {
            setSaving(false);
        }
    };

    const handleEditClick = (scale) => {
        setEditingId(scale.id);
        // Copy the properties, ensuring levels are sorted by order and exist
        setFormData({
            name: scale.name || '',
            code: scale.code || '',
            curriculum: scale.curriculum?.toString() || '',
            scale_type: scale.scale_type || 'rubric',
            max_mark: scale.max_mark || 100,
            pass_mark: scale.pass_mark || 40,
            description: scale.description || '',
            is_active: scale.is_active !== undefined ? scale.is_active : true,
            levels: scale.levels?.length ? [...scale.levels].sort((a, b) => a.order - b.order) : [{ ...newLevelTemplate, order: 1 }]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (id) => {
        if (!window.confirm('Are you sure you want to delete this grading rubric?')) return;
        try {
            await examService.deleteGradingScale(id);
            toast.success('Rubric deleted successfully');
            if (editingId === id) {
                setEditingId(null);
                setFormData(prev => ({
                    name: '', code: '', curriculum: prev.curriculum, scale_type: 'rubric',
                    max_mark: 100, pass_mark: 40, description: '', is_active: true,
                    levels: [{ ...newLevelTemplate, order: 1 }]
                }));
            }
            fetchScalesAndData();
        } catch (err) {
            toast.error('Failed to delete rubric');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(prev => ({
            name: '', code: '', curriculum: prev.curriculum, scale_type: 'rubric',
            max_mark: 100, pass_mark: 40, description: '', is_active: true,
            levels: [{ ...newLevelTemplate, order: 1 }]
        }));
    };

    const handleSeedData = async () => {
        if (!window.confirm('This will seed the database with default grading scales (CBC, 8-4-4, etc). Are you sure?')) return;
        try {
            setLoading(true);
            await examService.seedGradingData();
            toast.success('Successfully seeded default grading scales');
            fetchScalesAndData();
        } catch (err) {
            toast.error('Failed to seed grading data');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <LayoutTemplate size={20} className="text-indigo-600" />
                        Grading Rubric Setup
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Create and configure grading rubrics, boundaries, and point systems.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* --- Form Section --- */}
                <div className="xl:col-span-2 rounded-[32px] p-1 bg-[#e0e5ec] shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff]">
                    <div className="bg-white/40 rounded-[28px] p-6 lg:p-8 border border-white/40">
                        <form id="add-scale-form" onSubmit={handleSaveScale} className="space-y-8">
                            
                            {/* Core Details */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <BookOpen size={18} className="text-indigo-500" />
                                    Rubric Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Scale Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. CBC Lower Primary"
                                            className="w-full px-4 py-3 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] border-none rounded-xl text-gray-800 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Short Code</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g. CBC_LP"
                                            className="w-full px-4 py-3 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] border-none rounded-xl text-gray-800 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                            value={formData.code}
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Curriculum</label>
                                        <select 
                                            required
                                            className="w-full px-4 py-3 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] border-none rounded-xl text-gray-800 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
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
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Scale Type</label>
                                        <select 
                                            required
                                            className="w-full px-4 py-3 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#c3c8ce,inset_-4px_-4px_8px_#ffffff] border-none rounded-xl text-gray-800 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                            value={formData.scale_type}
                                            onChange={e => setFormData({...formData, scale_type: e.target.value})}
                                        >
                                            <option value="rubric">Rubric / Competency (e.g. CBC)</option>
                                            <option value="points">Points-based (e.g. 8-4-4)</option>
                                            <option value="percentage">Percentage-based</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3 mt-8">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({...formData, is_active: e.target.checked})}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                        <span className="text-sm font-bold text-gray-700">Active Status</span>
                                    </div>
                                </div>
                            </div>

                            {/* Levels Builder */}
                            <div className="pt-6 border-t border-white/40">
                                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Grading Levels</h3>
                                        <p className="text-xs font-medium text-gray-500">Define the boundaries (e.g., EE, ME, AE, BE) ordered from highest to lowest.</p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleAddLevel}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 uppercase tracking-wider bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center gap-2"
                                    >
                                        <Plus size={14} /> Add Row
                                    </button>
                                </div>

                                <div className="space-y-3 overflow-x-auto pb-4">
                                    <div className="min-w-[700px]">
                                        {/* Headers */}
                                        <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
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
                                            <div key={index} className="grid grid-cols-12 gap-3 items-center bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] p-2 rounded-xl mb-3">
                                                <div className="col-span-2">
                                                    <input 
                                                        required type="text" placeholder="EE"
                                                        className="w-full px-3 py-2 bg-transparent text-sm font-bold border-none focus:outline-none placeholder:text-gray-400"
                                                        value={level.grade} onChange={e => handleLevelChange(index, 'grade', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-3">
                                                    <input 
                                                        required type="text" placeholder="Exceeding"
                                                        className="w-full px-3 py-2 bg-transparent text-sm font-medium border-none focus:outline-none placeholder:text-gray-400"
                                                        value={level.label} onChange={e => handleLevelChange(index, 'label', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-2 relative">
                                                    <input 
                                                        required type="number" step="0.01"
                                                        className="w-full px-3 py-2 bg-white/50 rounded-lg text-sm font-mono text-center border-none focus:outline-none shadow-sm"
                                                        value={level.min_mark} onChange={e => handleLevelChange(index, 'min_mark', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <input 
                                                        required type="number" step="0.01"
                                                        className="w-full px-3 py-2 bg-white/50 rounded-lg text-sm font-mono text-center border-none focus:outline-none shadow-sm"
                                                        value={level.max_mark} onChange={e => handleLevelChange(index, 'max_mark', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-1">
                                                    <input 
                                                        required type="number" step="0.01"
                                                        className="w-full px-2 py-2 bg-white/50 rounded-lg text-sm font-mono text-center border-none focus:outline-none shadow-sm"
                                                        value={level.points} onChange={e => handleLevelChange(index, 'points', parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <input 
                                                        type="color"
                                                        className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                                                        value={level.color_hex} onChange={e => handleLevelChange(index, 'color_hex', e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-center">
                                                    <button 
                                                        type="button" onClick={() => handleRemoveLevel(index)}
                                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                {editingId && (
                                    <button 
                                        type="button" 
                                        onClick={handleCancelEdit}
                                        className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-6 py-3 rounded-xl text-sm font-bold text-white tracking-wider bg-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.4)] hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {editingId ? 'Update Grading Rubric' : 'Save Grading Rubric'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* --- Existing Scales List --- */}
                <div className="xl:col-span-1 rounded-[32px] p-3 bg-[#e0e5ec] shadow-[8px_8px_16px_#c3c8ce,-8px_-8px_16px_#ffffff] flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <BookOpen size={18} className="text-indigo-500" />
                            Existing Rubrics
                        </h3>
                        <button 
                            onClick={handleSeedData}
                            title="Seed Default Scales"
                            className="p-2 rounded-xl text-indigo-600 bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#c3c8ce,inset_-2px_-2px_4px_#ffffff] transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c0-2.3 1.2-4.4 3-5.5L7 5l1 5-5-1-1.5 2C2.2 11.3 2 11.7 2 12"></path><path d="M22 12c0 2.3-1.2 4.4-3 5.5L17 19l-1-5 5 1 1.5-2c.3-.3.5-.7.5-1"></path><path d="M12 2v20"></path><path d="M12 12v-6c0-2.3-1.2-4.4-3-5.5L7 2l-1 5 5 1 1.5-2C11.8 5.7 12 5.3 12 5"></path><path d="M12 12v6c0 2.3 1.2 4.4 3 5.5l2 1.5 1-5-5-1-1.5 2c-.3.3-.5.7-.5 1"></path></svg>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 size={24} className="text-indigo-500 animate-spin" />
                        </div>
                    ) : scales.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-3 bg-white/30 rounded-2xl border border-white/40">
                            <BookOpen size={32} className="text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500 font-medium">No rubrics created yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[600px] hide-scrollbar">
                            {scales.map(scale => (
                                <div key={scale.id} className="p-3 rounded-[20px] bg-[#e0e5ec] shadow-[4px_4px_8px_#c3c8ce,-4px_-4px_8px_#ffffff] flex flex-col gap-1 group transition-all">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 text-sm pr-2">{scale.name}</h4>
                                        <div className="flex gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleEditClick(scale)} 
                                                className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(scale.id)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">{scale.curriculum_name}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{scale.scale_type}</p>
                                        <div className="flex gap-2">
                                            {!scale.is_active && (
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-100 text-red-600 rounded-md shadow-sm">
                                                    Inactive
                                                </span>
                                            )}
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white/50 text-indigo-600 rounded-md shadow-sm">
                                                {scale.code}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default GradingAssessmentSetup;
