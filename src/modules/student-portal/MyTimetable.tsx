import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, ChevronLeft, ChevronRight,
    Loader2, MapPin, User,
} from 'lucide-react';
import StudentLayout from '../../layouts/StudentLayout';
import { portalService } from './portalService';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const statusColors = {
    pending: 'bg-blue-100 border-blue-300 text-blue-800',
    executed: 'bg-green-100 border-green-300 text-green-800',
    missed: 'bg-red-100 border-red-300 text-red-800',
    cancelled: 'bg-gray-100 border-gray-300 text-gray-600',
    holiday: 'bg-amber-100 border-amber-300 text-amber-800',
};

const formatWeek = (start, end) => {
    const fmt = (d) => new Date(d).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
    return `${fmt(start)} — ${fmt(end)}`;
};

const MyTimetable = () => {
    const [lessons, setLessons] = useState([]);
    const [weekStart, setWeekStart] = useState('');
    const [weekEnd, setWeekEnd] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchWeek = async (start) => {
        setLoading(true);
        try {
            const params = start ? { week_start: start } : {};
            const res = await portalService.getTimetable(params);
            setLessons(res?.lessons || []);
            setWeekStart(res?.week_start || '');
            setWeekEnd(res?.week_end || '');
        } catch {
            toast.error('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWeek(); }, []);

    const changeWeek = (offset) => {
        if (!weekStart) return;
        const d = new Date(weekStart);
        d.setDate(d.getDate() + offset * 7);
        fetchWeek(d.toISOString().split('T')[0]);
    };

    // Group by day
    const byDay = DAYS.reduce((acc, day) => {
        acc[day] = lessons.filter(l => l.day_of_week === day)
            .sort((a, b) => (a.scheduled_start_time || '').localeCompare(b.scheduled_start_time || ''));
        return acc;
    }, {});

    return (
        <StudentLayout title="My Timetable">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-1">
                {/* Week navigation */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <button onClick={() => changeWeek(-1)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 justify-center">
                            <Calendar size={18} className="text-indigo-500" />
                            Weekly Timetable
                        </h3>
                        {weekStart && weekEnd && (
                            <p className="text-xs text-gray-500 mt-0.5">{formatWeek(weekStart, weekEnd)}</p>
                        )}
                    </div>
                    <button onClick={() => changeWeek(1)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                    </div>
                ) : lessons.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                        <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No lessons this week</p>
                        <p className="text-sm mt-1">Your timetable will appear once lessons are scheduled.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {DAYS.map(day => {
                            const dayLessons = byDay[day];
                            if (!dayLessons.length) return null;
                            return (
                                <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-700">{day}</h4>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {dayLessons.map(l => (
                                            <div key={l.id}
                                                className={`flex items-center gap-4 px-5 py-3 border-l-4 ${statusColors[l.status] || 'border-gray-200'}`}>
                                                <div className="text-center min-w-[56px]">
                                                    <p className="text-xs font-bold text-indigo-600">
                                                        {l.scheduled_start_time?.slice(0, 5)}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
                                                        {l.scheduled_end_time?.slice(0, 5)}
                                                    </p>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {l.subject_name || 'TBA'}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                        {l.teacher_name && (
                                                            <span className="flex items-center gap-1">
                                                                <User size={11} /> {l.teacher_name}
                                                            </span>
                                                        )}
                                                        {l.room_name && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin size={11} /> {l.room_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                    statusColors[l.status]?.replace('border-', 'bg-').split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-')).join(' ')
                                                    || 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {l.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </StudentLayout>
    );
};

export default MyTimetable;
