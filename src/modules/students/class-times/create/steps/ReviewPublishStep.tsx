import React from 'react';
import { Check, AlertTriangle, Calendar, Download, Eye } from 'lucide-react';
import WeeklyTimetable from '../../components/WeeklyTimetable'; // Reusing the grid component
import * as data from '../../data/classTimesData'; // Reusing mock data for preview

const ReviewPublishStep = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review & Publish</h2>
                <p className="text-slate-500 mt-2">Verify the timetable details before publishing.</p>
            </div>

            {/* Validation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800 flex items-start gap-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600">
                        <Check size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-300">All Steps Complete</h4>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">Academic setup, classes, slots, subjects, and assignments configured.</p>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300">3 Minor Conflicts</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                            Detected 2 room double-bookings and 1 teacher overload.
                            <button className="block font-bold underline mt-1">View Details</button>
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-800 dark:text-blue-300">Ready to Publish</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            Timetable will be effective from <strong>Jan 6, 2026</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">Timetable Preview (Grade 1 East)</h3>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg transition-colors">
                            <Eye size={16} /> full Preview
                        </button>
                    </div>
                </div>

                {/* Reusing the WeeklyTimetable component we built earlier */}
                <WeeklyTimetable
                    timetable={data.weeklyTimetable}
                    timeSlots={data.timeSlots}
                />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500">
                By clicking "Publish Timetable", this schedule will become active for all selected classes and teachers.
                Notifications will be sent to 32 staff members.
            </div>
        </div>
    );
};

export default ReviewPublishStep;
