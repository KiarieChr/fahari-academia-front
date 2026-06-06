import React from 'react';
import { LayoutTemplate, AlertCircle, Wand2 } from 'lucide-react';

const RoomAllocationStep = ({ data, updateData }) => {
    const allocations = [
        { id: 1, subject: "Mathematics", room: "Home Room (1A)", type: "auto" },
        { id: 2, subject: "English", room: "Home Room (1A)", type: "auto" },
        { id: 3, subject: "Science", room: "Science Lab", type: "manual" },
        { id: 4, subject: "Computing", room: "Comp Lab", type: "manual" },
        { id: 5, subject: "PE", room: "Field", type: "manual" },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Room Allocation</h2>
                <p className="text-slate-500 mt-2">Specify where lessons will take place.</p>
            </div>

            <div className="flex justify-end mb-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors">
                    <Wand2 size={16} /> Auto-Assign Rooms
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Subject</th>
                            <th className="px-6 py-3 font-semibold">Assigned Room</th>
                            <th className="px-6 py-3 font-semibold">Assignment Type</th>
                            <th className="px-6 py-3 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {allocations.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{item.subject}</td>
                                <td className="px-6 py-3">
                                    <select className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-transparent outline-none focus:border-blue-500">
                                        <option>{item.room}</option>
                                        <option>Room 1B</option>
                                        <option>Library</option>
                                    </select>
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'auto' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {item.type === 'auto' ? 'Default' : 'Specialized'}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <span className="text-green-600 text-xs font-bold">Available</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-100 dark:border-amber-800 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>Note: Science Lab has limited availability on Tuesday mornings due to Grade 4 practicals.</p>
            </div>
        </div>
    );
};

export default RoomAllocationStep;
