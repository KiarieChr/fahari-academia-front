import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EducationLevelsManager = ({ levels, setLevels, isReadOnly }) => {
    const [expandedLevel, setExpandedLevel] = useState(null);

    const toggleExpand = (id) => {
        setExpandedLevel(expandedLevel === id ? null : id);
    };

    const handleAddClass = (levelId) => {
        if (isReadOnly) return;
        const newClass = {
            id: `new-${Date.now()}`,
            name: 'New Class',
            code: 'NC',
            maxStudents: 30
        };

        setLevels(levels.map(l => {
            if (l.id === levelId) {
                return { ...l, classes: [...l.classes, newClass] };
            }
            return l;
        }));
    };

    const handleRemoveClass = (levelId, classId) => {
        if (isReadOnly) return;
        setLevels(levels.map(l => {
            if (l.id === levelId) {
                return { ...l, classes: l.classes.filter(c => c.id !== classId) };
            }
            return l;
        }));
    };

    const [showAddLevel, setShowAddLevel] = useState(false);
    const [newLevel, setNewLevel] = useState({ name: '', code: '', years: 1 });

    const handleCreateLevel = () => {
        if (!newLevel.name || !newLevel.code) return;
        const level = {
            id: `lvl-${Date.now()}`,
            name: newLevel.name,
            code: newLevel.code.toUpperCase(),
            years: Number(newLevel.years),
            classes: []
        };
        setLevels([...levels, level]);
        setShowAddLevel(false);
        setNewLevel({ name: '', code: '', years: 1 });
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers size={20} className="text-purple-600" />
                    Education Levels & Classes
                </h3>
                {!isReadOnly && !showAddLevel && (
                    <button
                        onClick={() => setShowAddLevel(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                    >
                        <Plus size={16} /> Add Level
                    </button>
                )}
            </div>

            {/* Add Level Form */}
            <AnimatePresence>
                {showAddLevel && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800 rounded-xl mb-4"
                    >
                        <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-3">New Education Level</h4>
                        <div className="flex flex-col md:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Level Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="e.g. Senior Secondary"
                                    value={newLevel.name}
                                    onChange={(e) => setNewLevel({ ...newLevel, name: e.target.value })}
                                />
                            </div>
                            <div className="w-full md:w-32">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Code</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                                    placeholder="SS"
                                    value={newLevel.code}
                                    onChange={(e) => setNewLevel({ ...newLevel, code: e.target.value })}
                                />
                            </div>
                            <div className="w-full md:w-24">
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Years</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                    min="1"
                                    max="8"
                                    value={newLevel.years}
                                    onChange={(e) => setNewLevel({ ...newLevel, years: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddLevel(false)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateLevel}
                                    disabled={!newLevel.name || !newLevel.code}
                                    className="px-4 py-2 bg-purple-600 text-black rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Level
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4">
                {levels.map((level, index) => (
                    <div key={level.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all shadow-sm hover:shadow-md">
                        {/* Level Header */}
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => toggleExpand(level.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 cursor-grab active:cursor-grabbing">
                                    <GripVertical size={18} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{level.name}</h4>
                                    <p className="text-xs text-slate-500">{level.classes.length} Classes • {level.years} Years Duration</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                                    {level.code}
                                </div>
                                {expandedLevel === level.id ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                            </div>
                        </div>

                        {/* Classes List */}
                        <AnimatePresence>
                            {expandedLevel === level.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-slate-100 dark:border-slate-700"
                                >
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {level.classes.map((cls) => (
                                                <div key={cls.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-xs ring-1 ring-blue-100 dark:ring-blue-800">
                                                            {cls.code}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm text-slate-900 dark:text-white">{cls.name}</div>
                                                            <div className="text-xs text-slate-400">Max: {cls.maxStudents}</div>
                                                        </div>
                                                    </div>
                                                    {!isReadOnly && (
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveClass(level.id, cls.id)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => handleAddClass(level.id)}
                                                    className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all gap-1 min-h-[64px]"
                                                >
                                                    <Plus size={20} />
                                                    <span className="text-xs font-medium">Add Class</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducationLevelsManager;
