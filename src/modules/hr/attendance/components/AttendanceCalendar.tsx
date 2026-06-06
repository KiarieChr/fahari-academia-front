
import React from 'react';
import { motion } from 'framer-motion';

const AttendanceCalendar = ({ events }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonthCount = new Date(year, month + 1, 0).getDate();
    const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    
    // 0 is Sunday, 1 is Monday, etc.
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const fillers = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const currentDay = today.getDate();

    const getStatusForDay = (day) => {
        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        // match date or attendance_date and handle lowercase status
        const ev = events.find(e => e.date === dateStr || e.attendance_date === dateStr);
        if (!ev) return null;
        
        // Normalize status to Title Case for the calendar UI colors
        const statusMap = {
            'present': 'Present',
            'late': 'Late',
            'absent': 'Absent',
            'on_leave': 'On Leave',
            'half_day': 'Half Day',
            'holiday': 'Holiday',
            'weekend': 'Weekend'
        };
        return {
            ...ev,
            displayStatus: statusMap[ev.status?.toLowerCase()] || ev.status
        };
    };

    const StatusDot = ({ status }) => {
        const colors = {
            'Present': 'bg-emerald-500',
            'Late': 'bg-amber-500',
            'Absent': 'bg-red-500',
            'On Leave': 'bg-purple-500',
            'Half Day': 'bg-blue-500',
            'Holiday': 'bg-pink-500',
            'Weekend': 'bg-slate-400',
        };
        return <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-300'}`} title={status}></div>;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">{monthNames[month]} {year}</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentDate(new Date())}
                        className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                    >
                        Today
                    </button>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        >
                            &lt;
                        </button>
                        <button 
                            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}

                {/* Fillers for start of month */}
                {fillers.map(f => (
                    <div key={`filler-${f}`} className="bg-white h-32"></div>
                ))}

                {daysInMonth.map(day => {
                    const event = getStatusForDay(day);
                    return (
                        <motion.div
                            key={day}
                            whileHover={{ backgroundColor: '#f8fafc' }}
                            className="bg-white h-32 p-2 flex flex-col justify-between hover:z-10 relative group border-t border-slate-100" // Added border-t manually just in case
                        >
                            <span className={`text-sm font-medium ${isCurrentMonth && day === currentDay ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-slate-700'}`}>
                                {day}
                            </span>

                            {event && (
                                <div className={`mt-1 p-1.5 rounded text-xs font-medium truncate flex items-center gap-1.5
                                ${event.displayStatus === 'Present' ? 'bg-emerald-50 text-emerald-700' : ''}
                                ${event.displayStatus === 'Late' ? 'bg-amber-50 text-amber-700' : ''}
                                ${event.displayStatus === 'Absent' ? 'bg-red-50 text-red-700' : ''}
                                ${event.displayStatus === 'On Leave' ? 'bg-purple-50 text-purple-700' : ''}
                                ${event.displayStatus === 'Half Day' ? 'bg-blue-50 text-blue-700' : ''}
                                ${event.displayStatus === 'Holiday' ? 'bg-pink-50 text-pink-700' : ''}
                                ${event.displayStatus === 'Weekend' ? 'bg-slate-100 text-slate-600' : ''}
                            `}>
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0
                                    ${event.displayStatus === 'Present' ? 'bg-emerald-500' : ''}
                                    ${event.displayStatus === 'Late' ? 'bg-amber-500' : ''}
                                    ${event.displayStatus === 'Absent' ? 'bg-red-500' : ''}
                                    ${event.displayStatus === 'On Leave' ? 'bg-purple-500' : ''}
                                    ${event.displayStatus === 'Half Day' ? 'bg-blue-500' : ''}
                                    ${event.displayStatus === 'Holiday' ? 'bg-pink-500' : ''}
                                    ${event.displayStatus === 'Weekend' ? 'bg-slate-400' : ''}
                                `} />
                                    {event.displayStatus}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600 justify-center">
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
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div> Half Day
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div> On Leave
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div> Holiday
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-400"></div> Weekend
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
