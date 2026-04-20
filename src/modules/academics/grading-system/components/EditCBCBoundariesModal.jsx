import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../../../components/common/Modal';

const EditCBCBoundariesModal = ({ isOpen, onClose, onSave, initialLevels }) => {
    const [levels, setLevels] = useState(initialLevels);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setLevels(JSON.parse(JSON.stringify(initialLevels)));
            setError(null);
        }
    }, [isOpen, initialLevels]);

    const handleChange = (id, field, value) => {
        const numValue = parseInt(value) || 0;
        setLevels(prev => prev.map(l => l.id === id ? { ...l, [field]: numValue } : l));
        setError(null);
    };

    const validate = () => {
        // Simple overlap check
        for (let i = 0; i < levels.length - 1; i++) {
            if (levels[i].min <= levels[i + 1].max) {
                return `Overlap detected between ${levels[i].code} and ${levels[i + 1].code}. Check boundary ${levels[i].min} vs ${levels[i + 1].max}.`;
            }
        }
        // Gap check could go here
        return null;
    };

    const handleSave = () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        onSave(levels);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Grade Boundaries"
            size="md"
            accentColor="bg-teal-500"
            footer={<>
                <Modal.CancelButton onClick={onClose} />
                <Modal.SubmitButton onClick={handleSave}>Save Changes</Modal.SubmitButton>
            </>}
        >
            <div className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    {levels.map((level) => (
                        <div key={level.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className={`w-10 h-10 rounded-lg bg-${level.color}-100 dark:bg-${level.color}-900/30 text-${level.color}-700 dark:text-${level.color}-400 flex items-center justify-center font-bold text-sm`}>
                                {level.code}
                            </div>

                            <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{level.label}</div>
                                <div className="text-xs text-slate-500">{level.status}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={level.min}
                                        onChange={(e) => handleChange(level.id, 'min', e.target.value)}
                                        className="w-16 px-2 py-1.5 text-sm text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                    <div className="absolute -top-2 left-2 px-1 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400">Min</div>
                                </div>
                                <span className="text-slate-400 font-bold">-</span>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={level.max}
                                        onChange={(e) => handleChange(level.id, 'max', e.target.value)}
                                        className="w-16 px-2 py-1.5 text-sm text-center font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                    />
                                    <div className="absolute -top-2 left-2 px-1 bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400">Max</div>
                                </div>
                                <span className="text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default EditCBCBoundariesModal;
