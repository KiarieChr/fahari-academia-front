import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { examService } from '../../../../services/examService';

const GradingScaleTable = ({ scale, onUpdate }) => {
    const [detail, setDetail] = useState(null);
    const [expanded, setExpanded] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editLevels, setEditLevels] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (expanded && !detail) {
            examService.getGradingScale(scale.id).then(setDetail).catch(() => {});
        }
    }, [expanded, scale.id]);

    const levels = detail?.levels || [];

    const startEdit = () => {
        setEditLevels(levels.map(l => ({ ...l })));
        setEditing(true);
    };

    const cancelEdit = () => {
        setEditing(false);
        setEditLevels([]);
    };

    const updateLevel = (idx, field, value) => {
        setEditLevels(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], [field]: value };
            return updated;
        });
    };

    const saveEdit = async () => {
        try {
            setSaving(true);
            const payload = {
                name: scale.name,
                code: scale.code,
                curriculum: scale.curriculum,
                curriculum_level: scale.curriculum_level,
                scale_type: scale.scale_type,
                max_mark: scale.max_mark,
                pass_mark: scale.pass_mark,
                levels: editLevels.map(l => ({
                    id: l.id,
                    grade: l.grade,
                    label: l.label,
                    min_mark: parseFloat(l.min_mark),
                    max_mark: parseFloat(l.max_mark),
                    points: parseFloat(l.points),
                    order: l.order,
                    color_hex: l.color_hex,
                })),
            };
            const updated = await examService.updateGradingScale(scale.id, payload);
            setDetail(updated);
            setEditing(false);
            toast.success('Grading scale updated');
            onUpdate?.();
        } catch (err) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const scaleTypeLabel = scale.scale_type === 'rubric' ? 'Rubric' : scale.scale_type === 'points' ? 'Points' : 'Percentage';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Header */}
            <div
                className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">{scale.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {scaleTypeLabel} &middot; Pass: {scale.pass_mark}% &middot; Max: {scale.max_mark}
                            {scale.level_name && ` · ${scale.level_name}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!editing && expanded && (
                        <button
                            onClick={(e) => { e.stopPropagation(); startEdit(); }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            Edit Boundaries
                        </button>
                    )}
                    {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
            </div>

            {/* Table */}
            {expanded && (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Grade</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Label</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Range (%)</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Points</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {(editing ? editLevels : levels).map((item, idx) => (
                                    <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-flex items-center justify-center w-10 h-8 rounded-lg font-bold text-white text-sm"
                                                style={{ backgroundColor: item.color_hex || '#6366f1' }}
                                            >
                                                {item.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                                            {editing ? (
                                                <input
                                                    value={item.label}
                                                    onChange={e => updateLevel(idx, 'label', e.target.value)}
                                                    className="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700"
                                                />
                                            ) : item.label}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                                            {editing ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={item.min_mark}
                                                        onChange={e => updateLevel(idx, 'min_mark', e.target.value)}
                                                        className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700"
                                                    />
                                                    <span>-</span>
                                                    <input
                                                        type="number"
                                                        value={item.max_mark}
                                                        onChange={e => updateLevel(idx, 'max_mark', e.target.value)}
                                                        className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700"
                                                    />
                                                </div>
                                            ) : (
                                                `${item.min_mark} – ${item.max_mark}`
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                                            {editing ? (
                                                <input
                                                    type="number"
                                                    value={item.points}
                                                    onChange={e => updateLevel(idx, 'points', e.target.value)}
                                                    className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700"
                                                />
                                            ) : item.points}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                parseFloat(item.min_mark) >= (scale.pass_mark || 0)
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {parseFloat(item.min_mark) >= (scale.pass_mark || 0) ? 'Pass' : 'Fail'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {editing && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                            <button
                                onClick={cancelEdit}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                            >
                                <X size={16} /> Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {!editing && (
                        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>{levels.length} levels defined &middot; Code: {scale.code}</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GradingScaleTable;
