import React from 'react';
import { MoreHorizontal } from 'lucide-react';

// Maps slotId to the timeSlots array index or id for column mapping
// Assuming timeSlots are passed in order or we can find them

const WeeklyTimetable = ({ timetable, timeSlots }) => {
    // We need to render a grid.
    // Columns: Time Slots
    // Rows: Days

    // Filter out active slots only if needed, but here we assume all slots passed are to be shown

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-w-[100px] sticky left-0 z-10">
                                <span className="text-xs font-bold text-slate-500 uppercase">Day / Period</span>
                            </th>
                            {timeSlots.map(slot => (
                                <th key={slot.id} className="p-3 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-w-[140px] text-center">
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{slot.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{slot.start} - {slot.end}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timetable.map((dayRow) => (
                            <tr key={dayRow.day} className="divide-slate-200 dark:divide-slate-700">
                                <td className="p-4 border-b border-r border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white sticky left-0 bg-white dark:bg-slate-800 z-10">
                                    {dayRow.day}
                                </td>
                                {timeSlots.map(slot => {
                                    // Find if there is an entry for this slot in this day
                                    const entry = dayRow.slots.find(s => s.slotId === slot.id);

                                    // Check if it's a break
                                    if (slot.type === 'Break' || slot.type === 'Lunch') {
                                        return (
                                            <td key={slot.id} className="p-2 border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest writing-mode-vertical rotate-180 block mx-auto">
                                                    {slot.type}
                                                </span>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={slot.id} className="p-2 border-b border-r border-slate-200 dark:border-slate-700 relative group transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            {entry ? (
                                                <div className={`p-2 rounded-lg border border-l-4 shadow-sm cursor-pointer hover:shadow-md transition-all 
                                                    ${entry.color === 'blue' ? 'bg-blue-50 border-blue-200 border-l-blue-500 text-blue-900' :
                                                        entry.color === 'green' ? 'bg-green-50 border-green-200 border-l-green-500 text-green-900' :
                                                            entry.color === 'indigo' ? 'bg-indigo-50 border-indigo-200 border-l-indigo-500 text-indigo-900' :
                                                                entry.color === 'amber' ? 'bg-amber-50 border-amber-200 border-l-amber-500 text-amber-900' :
                                                                    entry.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 border-l-emerald-500 text-emerald-900' :
                                                                        entry.color === 'orange' ? 'bg-orange-50 border-orange-200 border-l-orange-500 text-orange-900' :
                                                                            'bg-slate-50 border-slate-200 border-l-slate-500 text-slate-900'}
                                                `}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-xs font-bold truncate">{entry.subject}</span>
                                                        <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/10 rounded transition-opacity">
                                                            <MoreHorizontal size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-end text-[10px] opacity-80 font-medium">
                                                        <span>{entry.teacher}</span>
                                                        <span className="uppercase bg-white/50 px-1 rounded">{entry.room}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full min-h-[60px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-xs text-slate-400 hover:text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">
                                                        + Assign
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeeklyTimetable;
