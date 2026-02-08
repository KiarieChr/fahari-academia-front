import React from 'react';

const AttendanceCard = () => {
    return (
        <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex gap-8">
                <div>
                    <div className="text-xs font-bold text-slate-500 uppercase">School Days</div>
                    <div className="text-xl font-bold text-slate-900">65</div>
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Days Attended</div>
                    <div className="text-xl font-bold text-emerald-600">63</div>
                </div>
                <div>
                    <div className="text-xs font-bold text-slate-500 uppercase">Percentage</div>
                    <div className="text-xl font-bold text-slate-900">97%</div>
                </div>
            </div>

            <div className="flex flex-col items-end">
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Excellent Attendance</div>
                <div className="w-32 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[97%]" />
                </div>
            </div>
        </div>
    );
};

export default AttendanceCard;
