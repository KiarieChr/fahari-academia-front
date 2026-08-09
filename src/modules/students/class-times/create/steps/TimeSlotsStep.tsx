import React, { useState } from 'react';
import { Plus, X, Clock, Coffee, Utensils, Check } from 'lucide-react';

const TimeSlotsStep = ({ data, updateData }) => {
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({
        name: '',
        start: '',
        end: '',
        type: 'Lesson'
    });

    const slots = data.timeSlots || [
        { id: 1, name: "Morning Prep", start: "07:00", end: "08:00", type: "Prep" },
        { id: 2, name: "Period 1", start: "08:00", end: "08:40", type: "Lesson" },
        { id: 3, name: "Period 2", start: "08:40", end: "09:20", type: "Lesson" },
        { id: 4, name: "Short Break", start: "09:20", end: "09:35", type: "Break" },
        { id: 5, name: "Period 3", start: "09:35", end: "10:15", type: "Lesson" },
        { id: 6, name: "Period 4", start: "10:15", end: "10:55", type: "Lesson" },
        { id: 7, name: "Lunch", start: "12:55", end: "14:00", type: "Lunch" },
    ];

    const handleAddSlot = () => {
        setIsAddingSlot(true);
        // Set default start time based on last slot end time if available
        const lastSlot = slots[slots.length - 1];
        if (lastSlot) {
            setNewSlot({
                name: '',
                start: lastSlot.end,
                end: '',
                type: 'Lesson'
            });
        }
    };

    const handleSaveSlot = () => {
        if (!newSlot.name || !newSlot.start || !newSlot.end) return;

        const updatedSlots = [
            ...slots,
            { ...newSlot, id: Date.now() }
        ];

        // Sort slots by start time
        updatedSlots.sort((a, b) => a.start.localeCompare(b.start));

        updateData('timeSlots', updatedSlots);
        setIsAddingSlot(false);
        setNewSlot({ name: '', start: '', end: '', type: 'Lesson' });
    };

    const handleCancelSlot = () => {
        setIsAddingSlot(false);
        setNewSlot({ name: '', start: '', end: '', type: 'Lesson' });
    };

    const handleRemoveSlot = (id) => {
        const updatedSlots = slots.filter(slot => slot.id !== id);
        updateData('timeSlots', updatedSlots);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Time Slots & Breaks</h2>
                <p className="text-slate-500 mt-2">Define the daily schedule structure, including lessons and breaks.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Clock size={18} /> Daily Schedule
                    </h3>
                    {!isAddingSlot && (
                        <button
                            onClick={handleAddSlot}
                            className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <Plus size={16} /> Add Slot
                        </button>
                    )}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {slots.map((slot, index) => (
                        <div key={slot.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                                {index + 1}
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                                <div className="sm:col-span-1">
                                    <input
                                        type="text"
                                        className="w-full px-3 py-1.5 bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 rounded font-medium text-slate-900 dark:text-white outline-none transition-colors"
                                        defaultValue={slot.name}
                                        readOnly // For now, let's treat existing as read-only or update properly via state if needed
                                    />
                                </div>
                                <div className="sm:col-span-1 flex items-center gap-2">
                                    <input
                                        type="time"
                                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 outline-none"
                                        defaultValue={slot.start}
                                        readOnly
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="time"
                                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm text-slate-600 dark:text-slate-400 outline-none"
                                        defaultValue={slot.end}
                                        readOnly
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${slot.type === 'Break' ? 'bg-amber-100 text-amber-700' :
                                            slot.type === 'Lunch' ? 'bg-orange-100 text-orange-700' :
                                                slot.type === 'Prep' ? 'bg-purple-100 text-purple-700' :
                                                    'bg-blue-100 text-blue-700'
                                        }`}>
                                        {slot.type === 'Break' && <Coffee size={12} />}
                                        {slot.type === 'Lunch' && <Utensils size={12} />}
                                        {slot.type}
                                    </span>
                                </div>
                                <div className="sm:col-span-1 flex justify-end">
                                    <button
                                        onClick={() => handleRemoveSlot(slot.id)}
                                        className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Slot Form */}
                    {isAddingSlot && (
                        <div className="p-4 flex items-center gap-4 bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-blue-500 animate-in fade-in slide-in-from-top-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                <Plus size={14} />
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                                <div className="sm:col-span-1">
                                    <input
                                        type="text"
                                        placeholder="Slot Name"
                                        autoFocus
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-blue-500 rounded font-medium text-slate-900 dark:text-white outline-none transition-colors shadow-sm"
                                        value={newSlot.name}
                                        onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                                    />
                                </div>
                                <div className="sm:col-span-1 flex items-center gap-2">
                                    <input
                                        type="time"
                                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white outline-none shadow-sm"
                                        value={newSlot.start}
                                        onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="time"
                                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-white outline-none shadow-sm"
                                        value={newSlot.end}
                                        onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <select
                                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none shadow-sm"
                                        value={newSlot.type}
                                        onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                                    >
                                        <option value="Lesson">Lesson</option>
                                        <option value="Break">Break</option>
                                        <option value="Lunch">Lunch</option>
                                        <option value="Prep">Prep</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-1 flex justify-end gap-2">
                                    <button
                                        onClick={handleSaveSlot}
                                        disabled={!newSlot.name || !newSlot.start || !newSlot.end}
                                        className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={handleCancelSlot}
                                        className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500">
                        Total Duration: <span className="font-bold">7h 30m</span>
                        {/* Note: In a real app we'd calculate these dynamically */}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimeSlotsStep;
