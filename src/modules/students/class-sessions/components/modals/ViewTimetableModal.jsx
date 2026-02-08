import React, { useState } from 'react';
import { X, Calendar, Filter, Download, ChevronRight } from 'lucide-react';

const ViewTimetableModal = ({ isOpen, onClose }) => {
    const [filters, setFilters] = useState({
        classLevel: 'Grade 4',
        stream: 'East',
        term: 'Term 3 2023'
    });

    const mockTimetable = [
        { time: '08:00 - 08:40', mon: 'Maths', tue: 'English', wed: 'Science', thu: 'Maths', fri: 'Social Studies' },
        { time: '08:40 - 09:20', mon: 'English', tue: 'Maths', wed: 'Social Studies', thu: 'English', fri: 'Science' },
        { time: '09:20 - 10:00', mon: 'Science', tue: 'Social Studies', wed: 'Maths', thu: 'Science', fri: 'English' },
        { time: '10:00 - 10:30', mon: 'BREAK', tue: 'BREAK', wed: 'BREAK', thu: 'BREAK', fri: 'BREAK' },
        { time: '10:30 - 11:10', mon: 'Social Studies', tue: 'Science', wed: 'English', thu: 'C.R.E', fri: 'Maths' },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Class Timetable</h2>
                        <p className="text-sm text-gray-500">View weekly schedule for classes.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Filters (The "Form" aspect) */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/30 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Class Level</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={filters.classLevel}
                            onChange={(e) => setFilters({ ...filters, classLevel: e.target.value })}
                        >
                            <option>Grade 4</option>
                            <option>Grade 5</option>
                            <option>Grade 6</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Stream</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={filters.stream}
                            onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
                        >
                            <option>East</option>
                            <option>West</option>
                            <option>North</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Academic Term</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={filters.term}
                            onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                        >
                            <option>Term 3 2023</option>
                            <option>Term 1 2024</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="w-full px-4 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center justify-center gap-2">
                            <Filter size={16} /> Load Timetable
                        </button>
                    </div>
                </div>

                {/* Timetable Grid */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="min-w-[600px] border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 border-b border-r border-gray-200 w-32">Time</th>
                                    <th className="px-4 py-3 border-b border-r border-gray-200 w-1/5">Monday</th>
                                    <th className="px-4 py-3 border-b border-r border-gray-200 w-1/5">Tuesday</th>
                                    <th className="px-4 py-3 border-b border-r border-gray-200 w-1/5">Wednesday</th>
                                    <th className="px-4 py-3 border-b border-r border-gray-200 w-1/5">Thursday</th>
                                    <th className="px-4 py-3 border-b border-gray-200 w-1/5">Friday</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {mockTimetable.map((slot, index) => (
                                    <tr key={index} className={slot.mon === 'BREAK' ? 'bg-orange-50 font-bold text-orange-800' : 'hover:bg-gray-50'}>
                                        <td className="px-4 py-3 border-r border-gray-100 font-mono text-xs font-medium text-gray-500">{slot.time}</td>
                                        <td className="px-4 py-3 border-r border-gray-100">{slot.mon}</td>
                                        <td className="px-4 py-3 border-r border-gray-100">{slot.tue}</td>
                                        <td className="px-4 py-3 border-r border-gray-100">{slot.wed}</td>
                                        <td className="px-4 py-3 border-r border-gray-100">{slot.thu}</td>
                                        <td className="px-4 py-3">{slot.fri}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        Viewing <span className="font-bold">{filters.classLevel} {filters.stream}</span> timetable for <span className="font-bold">{filters.term}</span>.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTimetableModal;
