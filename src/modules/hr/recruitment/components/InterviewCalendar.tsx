
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, Video, User } from 'lucide-react';

const InterviewCalendar = ({ interviews, onEdit, onCancel }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CalendarIcon className="text-blue-600" size={20} />
                    Upcoming Interviews
                </h3>

                <div className="space-y-3">
                    {interviews.map((interview) => (
                        <motion.div
                            key={interview.id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 md:items-center relative overflow-hidden"
                        >
                            {/* Date Badge */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-lg text-blue-700">
                                <span className="text-xs font-bold uppercase">{interview.date}</span>
                                <span className="text-lg font-bold">{interview.time.split(' ')[0]}</span>
                            </div>

                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{interview.candidateName}</h4>
                                        <p className="text-sm text-slate-500 font-medium">{interview.position} • {interview.type}</p>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                                        {interview.status}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {interview.time}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User size={14} />
                                        {interview.interviewers.join(", ")}
                                    </div>
                                </div>
                            </div>

                            <div className="md:ml-4 flex gap-2">
                                <button
                                    onClick={() => onEdit && onEdit(interview)}
                                    className="btn btn-light btn-sm border text-muted"
                                    title="Reschedule / Edit"
                                >
                                    Reschedule
                                </button>
                                <button
                                    onClick={() => onCancel && onCancel(interview.id)}
                                    className="btn btn-light btn-sm border text-red-500 hover:bg-red-50"
                                    title="Cancel"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Left border accent */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mini Calendar Mockup */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800">January 2026</h3>
                    <div className="flex gap-1">
                        <button className="btn btn-light btn-sm py-0 px-2">&lt;</button>
                        <button className="btn btn-light btn-sm py-0 px-2">&gt;</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                        <div key={d} className="text-slate-400 font-medium py-1">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {/* Mock dates */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <button
                            key={d}
                            className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors
                                ${d === 20 ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-600 hover:bg-slate-100'}
                                ${[22, 25].includes(d) ? 'relative after:content-[""] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-blue-400 after:rounded-full' : ''}
                            `}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InterviewCalendar;
