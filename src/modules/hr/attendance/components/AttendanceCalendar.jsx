
import React from 'react';
import { motion } from 'framer-motion';

const AttendanceCalendar = ({ events }) => {
    // Generate a simple month view
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    const getStatusForDay = (day) => {
        // Mock date string construction
        const dateStr = `2024-10-${day.toString().padStart(2, '0')}`;
        return events.find(e => e.date === dateStr);
    };

    const StatusDot = ({ status }) => {
        const colors = {
            'Present': 'bg-emerald-500',
            'Late': 'bg-amber-500',
            'Absent': 'bg-red-500',
            'On Leave': 'bg-purple-500',
        };
        return <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-300'}`} title={status}></div>;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">October 2024</h3>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Today</button>
                    <div className="flex gap-1">
                        <button className="p-1 hover:bg-slate-100 rounded text-slate-500">&lt;</button>
                        <button className="p-1 hover:bg-slate-100 rounded text-slate-500">&gt;</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}

                {/* Filler for start of month (assuming starts on Tuesday for example) */}
                <div className="bg-white h-32"></div>
                <div className="bg-white h-32"></div>

                {daysInMonth.map(day => {
                    const event = getStatusForDay(day);
                    return (
                        <motion.div
                            key={day}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            className="bg-white h-32 p-2 flex flex-col justify-between hover:z-10 relative group border-t border-slate-100" // Added border-t manually just in case
                        >
                            <span className={`text-sm font-medium ${day === 24 ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>
                                {day}
                            </span>

                            {event && (
                                <div className={`mt-1 p-1.5 rounded text-xs font-medium truncate flex items-center gap-1.5
                                ${event.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : ''}
                                ${event.status === 'Late' ? 'bg-amber-50 text-amber-700' : ''}
                                ${event.status === 'Absent' ? 'bg-red-50 text-red-700' : ''}
                                ${event.status === 'On Leave' ? 'bg-purple-50 text-purple-700' : ''}
                            `}>
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0
                                    ${event.status === 'Present' ? 'bg-emerald-500' : ''}
                                    ${event.status === 'Late' ? 'bg-amber-500' : ''}
                                    ${event.status === 'Absent' ? 'bg-red-500' : ''}
                                    ${event.status === 'On Leave' ? 'bg-purple-500' : ''}
                                `} />
                                    {event.status}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 flex gap-6 text-sm text-slate-600 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div> Late
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div> Absent
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div> On Leave
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
