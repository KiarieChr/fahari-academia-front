import React, { useState } from 'react';
import { User, Book, Clock, X, Calendar, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherScheduleView = ({ schedules }) => {
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    if (!schedules) return <div className="p-4 text-center text-gray-500">No teacher schedule data available</div>;

    // Mock schedule data for the view
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Teacher</th>
                                <th className="px-6 py-3 font-semibold">Initials</th>
                                <th className="px-6 py-3 font-semibold">Subjects</th>
                                <th className="px-6 py-3 font-semibold">Total Periods</th>
                                <th className="px-6 py-3 font-semibold">Classes Assigned</th>
                                <th className="px-6 py-3 font-semibold text-green-600">Free Periods</th>
                                <th className="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {schedules.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                            <User size={16} />
                                        </div>
                                        {teacher.name}
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400 font-mono">{teacher.initials}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {teacher.subjects.map((sub, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                                                    {sub}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 font-bold text-slate-700 dark:text-slate-300">{teacher.periods}</td>
                                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{teacher.classes}</td>
                                    <td className="px-6 py-3 text-green-600 font-medium">{teacher.free}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => setSelectedTeacher(teacher)}
                                            className="text-blue-600 hover:underline text-xs font-medium"
                                        >
                                            View Schedule
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Schedule Modal */}
            <AnimatePresence>
                {selectedTeacher && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 flex flex-col"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">{selectedTeacher.name}</h3>
                                        <p className="text-sm text-slate-500">Weekly Schedule • {selectedTeacher.periods} Periods</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedTeacher(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-[100px_repeat(5,1fr)] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-sm">
                                    {/* Header */}
                                    <div className="p-3 font-bold text-slate-400 bg-white dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                        <Clock size={16} />
                                    </div>
                                    {days.map((day) => (
                                        <div key={day} className="p-3 font-bold text-center text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 border-l first:border-l-0">
                                            {day}
                                        </div>
                                    ))}

                                    {/* Rows */}
                                    {periods.map((period) => (
                                        <React.Fragment key={period}>
                                            <div className="p-3 font-semibold text-slate-500 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center border-t">
                                                Period {period}
                                            </div>
                                            {days.map((day, idx) => {
                                                // Randomly assign lessons for demo
                                                const hasLesson = Math.random() > 0.4;
                                                const subject = selectedTeacher.subjects[Math.floor(Math.random() * selectedTeacher.subjects.length)];
                                                const className = ["Grade 1", "Grade 2", "Form 1"][Math.floor(Math.random() * 3)];

                                                return (
                                                    <div key={`${day}-${period}`} className="p-2 border-l border-t border-slate-200 dark:border-slate-700 min-h-[80px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                        {hasLesson ? (
                                                            <div className="h-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded p-2 flex flex-col justify-center items-center text-center">
                                                                <span className="font-bold text-blue-700 dark:text-blue-300 block">{subject}</span>
                                                                <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">{className}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center">
                                                                <span className="text-xs text-slate-300 dark:text-slate-600">Free</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                                <button className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg transition-all flex items-center gap-2">
                                    <Printer size={16} /> Print Schedule
                                </button>
                                <button
                                    onClick={() => setSelectedTeacher(null)}
                                    className="px-6 py-2 bg-blue-600 text-black font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherScheduleView;
