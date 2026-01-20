import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LeaveCalendar = ({ requests }) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    const dates = [...blanks, ...Array.from({ length: totalDays }, (_, i) => i + 1)];

    const getLeaveForDate = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return requests.filter(req => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            const check = new Date(dateStr);
            return check >= start && check <= end && req.status === 'Approved';
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                {days.map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                        {day}
                    </div>
                ))}

                {dates.map((day, index) => {
                    const leaves = getLeaveForDate(day);
                    const isToday = day === currentDate.getDate();

                    return (
                        <div key={index} className="bg-white min-h-[100px] p-2 hover:bg-gray-50 transition-colors">
                            {day && (
                                <>
                                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                                        }`}>
                                        {day}
                                    </span>

                                    <div className="space-y-1">
                                        {leaves.map((leave, idx) => (
                                            <div
                                                key={`${leave.id}-${idx}`}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 truncate font-medium border-l-2 border-blue-500"
                                                title={`${leave.employee} - ${leave.type}`}
                                            >
                                                {leave.employee.split(' ')[0]}
                                            </div>
                                        ))}
                                        {leaves.length > 2 && (
                                            <div className="text-[10px] text-gray-400 pl-1">
                                                + {leaves.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-100 border-l-2 border-blue-500 rounded-sm"></div>
                    <span>Annual Leave</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border-l-2 border-red-500 rounded-sm"></div>
                    <span>Sick Leave</span>
                </div>
            </div>
        </div>
    );
};

export default LeaveCalendar;
