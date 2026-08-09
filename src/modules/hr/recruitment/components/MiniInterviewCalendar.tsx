import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniInterviewCalendar = ({ interviews = [] }) => {
    // Current date setup
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust for Monday start
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        
        let blanks = [];
        for (let i = 0; i < firstDay; i++) {
            blanks.push(<div key={`blank-${i}`} className="w-8 h-8"></div>);
        }

        let daysInMonthElements = [];
        for (let d = 1; d <= daysInMonth; d++) {
            // Mock logic to show dots on random days for the visual
            const hasInterview = (d === 5 || d === 13 || d === 25);
            const isSelected = d === 13;
            
            daysInMonthElements.push(
                <div key={`day-${d}`} className="relative flex justify-center items-center w-8 h-8">
                    <button 
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors ${
                            isSelected 
                                ? 'bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/50 dark:text-blue-300 ring-2 ring-blue-500/30' 
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        {d}
                    </button>
                    {hasInterview && (
                        <div className="absolute -bottom-1 flex gap-0.5">
                            <div className={`w-1 h-1 rounded-full ${d === 5 ? 'bg-emerald-400' : d === 25 ? 'bg-rose-400' : 'bg-blue-400'}`}></div>
                            {d === 13 && <div className="w-1 h-1 rounded-full bg-purple-400"></div>}
                        </div>
                    )}
                </div>
            );
        }

        return [...blanks, ...daysInMonthElements];
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                    <ChevronLeft size={18} />
                </button>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                    {monthNames[currentMonth]} {currentYear}
                </h3>
                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-1 justify-items-center mb-2">
                {days.map(day => (
                    <div key={day} className="text-[10px] font-bold text-slate-400">
                        {day}
                    </div>
                ))}
                {renderCalendar()}
            </div>
        </div>
    );
};

export default MiniInterviewCalendar;
