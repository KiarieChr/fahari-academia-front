
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { procurementSettingsService } from '../../../services/procurementSettingsService';
import { toast } from 'react-toastify';

const WorkflowSettings = () => {
    const [levels, setLevels] = useState([]);
    const [thresholds, setThresholds] = useState({ rfqLimit: 0, tenderLimit: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await procurementSettingsService.getSettings();
        setLevels(settings.workflows.levels);
        setThresholds(settings.thresholds);
    };

    const handleLevelChange = (index, field, value) => {
        const newLevels = [...levels];
        newLevels[index][field] = value;
        setLevels(newLevels);
    };

    const addLevel = () => {
        setLevels([...levels, { role: '', limit: 0 }]);
    };

    const removeLevel = (index) => {
        if (levels.length <= 1) return toast.error("Must have at least one approval level");
        const newLevels = levels.filter((_, i) => i !== index);
        setLevels(newLevels);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await procurementSettingsService.updateSettings('workflows', { levels });
            await procurementSettingsService.updateSettings('thresholds', thresholds);
            toast.success("Workflow settings updated");
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Approval Matrix */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Approval Workflows</h3>
                    <button onClick={addLevel} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                        <Plus size={16} /> Add Level
                    </button>
                </div>

                <div className="space-y-3">
                    {levels.map((level, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <span className="text-xs font-mono text-gray-400 w-6">{idx + 1}.</span>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Role</label>
                                <input
                                    type="text"
                                    value={level.role}
                                    placeholder="e.g. Finance Manager"
                                    onChange={(e) => handleLevelChange(idx, 'role', e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm"
                                />
                            </div>
                            <div className="w-40">
                                <label className="text-xs text-gray-500 mb-1 block">Approval Limit (KES)</label>
                                <input
                                    type="number"
                                    value={level.limit}
                                    onChange={(e) => handleLevelChange(idx, 'limit', e.target.value)}
                                    className="w-full p-2 border rounded-lg text-sm"
                                />
                            </div>
                            <button onClick={() => removeLevel(idx)} className="mt-5 text-red-500 hover:bg-red-50 p-2 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Threshold Compliance */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-orange-400">
                <div className="flex items-start gap-3 mb-4">
                    <ShieldAlert className="text-orange-500" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Procurement Thresholds</h3>
                        <p className="text-sm text-gray-500">Define monetary limits for different procurement methods to enforce compliance.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Value for Direct Procurement</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">KES</span>
                            <input
                                type="number"
                                value="50000" // Mock binding
                                className="w-full pl-12 pr-4 py-2 border rounded-lg bg-gray-50"
                                disabled // Mock disabled
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RFQ Ceiling (Above this uses Tender)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono">KES</span>
                            <input
                                type="number"
                                value={thresholds.rfqLimit}
                                onChange={(e) => setThresholds({ ...thresholds, rfqLimit: e.target.value })}
                                className="w-full pl-12 pr-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Save size={18} /> Save All Rules
                </button>
            </div>
        </div>
    );
};

export default WorkflowSettings;

