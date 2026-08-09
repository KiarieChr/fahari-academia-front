import React, { useState, useMemo } from 'react';
import { Search, Filter, MoreVertical, Square, Calendar, Users, XCircle, Loader2 } from 'lucide-react';

import SessionFiltersModal from './modals/SessionFiltersModal';
import AttendanceModal from './modals/AttendanceModal';

// Map backend status values → display
const STATUS_DISPLAY = {
    planned: { label: 'Upcoming', css: 'bg-gray-100 text-gray-600 border-gray-200' },
    in_progress: { label: 'Ongoing', css: 'bg-blue-50 text-blue-700 border-blue-200' },
    completed: { label: 'Completed', css: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelled', css: 'bg-red-50 text-red-600 border-red-200' },
    missed: { label: 'Missed', css: 'bg-orange-50 text-orange-600 border-orange-200' },
};

const formatTime = (t) => (t ? t.slice(0, 5) : '—');

const SessionsList = ({ todaySessions = [], onComplete, onCancel }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [search, setSearch] = useState('');
    const [completing, setCompleting] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return todaySessions;
        const q = search.toLowerCase();
        return todaySessions.filter(s =>
            (s.class_session_name ?? '').toLowerCase().includes(q) ||
            (s.subject_name ?? '').toLowerCase().includes(q) ||
            (s.teacher_name ?? '').toLowerCase().includes(q)
        );
    }, [todaySessions, search]);

    const getStatusInfo = (status) => STATUS_DISPLAY[status] ?? { label: status, css: 'bg-gray-50 text-gray-600 border-gray-200' };

    const handleOpenAttendance = (session) => {
        setSelectedSession(session);
        setIsAttendanceModalOpen(true);
    };

    const handleComplete = async (sessionId) => {
        if (!onComplete) return;
        setCompleting(sessionId);
        try { await onComplete(sessionId); } finally { setCompleting(null); }
    };

    const handleCancel = async (sessionId) => {
        if (!onCancel) return;
        setCancelling(sessionId);
        try { await onCancel(sessionId, 'Cancelled by admin'); } finally { setCancelling(null); }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header / Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">
                    Daily Sessions
                    {todaySessions.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-400">({todaySessions.length})</span>
                    )}
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search sessions..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                        <Filter size={16} /> Filter
                    </button>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span>Today</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                    {todaySessions.length === 0 ? 'No sessions recorded today.' : 'No sessions match your search.'}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Class / Stream</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Teacher</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Attendance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((session) => {
                                const { label, css } = getStatusInfo(session.status);
                                const teacher = session.teacher_name ?? session.teacher ?? '—';
                                const initial = teacher !== '—' ? teacher.split(' ').pop()?.[0] ?? '?' : '?';
                                const attRate = session.attendance_summary?.attendance_rate;
                                const attDisplay = attRate != null ? `${Math.round(attRate)}%` : '—';
                                const timeDisplay = (session.start_time && session.end_time)
                                    ? `${formatTime(session.start_time)} – ${formatTime(session.end_time)}`
                                    : (session.actual_start ? formatTime(session.actual_start) : '—');
                                return (
                                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-900 whitespace-nowrap">{timeDisplay}</td>
                                        <td className="px-6 py-4 font-medium">{session.class_session_name ?? '—'}</td>
                                        <td className="px-6 py-4 text-gray-900">{session.subject_name ?? '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center
                                                               justify-center text-xs font-bold text-indigo-700">
                                                    {initial}
                                                </div>
                                                {teacher}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${css}`}>
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800">{attDisplay}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {session.status === 'in_progress' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenAttendance(session)}
                                                            className="text-xs font-medium text-white bg-green-600 px-3 py-1.5
                                                                       rounded-lg hover:bg-green-700 flex items-center gap-1 shadow-sm"
                                                        >
                                                            <Users size={12} /> Attendance
                                                        </button>
                                                        <button
                                                            onClick={() => handleComplete(session.id)}
                                                            disabled={completing === session.id}
                                                            className="text-xs font-medium text-white bg-indigo-600 px-3 py-1.5
                                                                       rounded-lg hover:bg-indigo-700 flex items-center gap-1
                                                                       shadow-sm disabled:opacity-50"
                                                        >
                                                            {completing === session.id
                                                                ? <Loader2 size={12} className="animate-spin" />
                                                                : <Square size={12} />}
                                                            Complete
                                                        </button>
                                                    </>
                                                )}
                                                {(session.status === 'planned' || session.status === 'in_progress') && (
                                                    <button
                                                        onClick={() => handleCancel(session.id)}
                                                        disabled={cancelling === session.id}
                                                        className="text-xs font-medium text-red-600 hover:text-red-800
                                                                   px-2 py-1.5 rounded-lg hover:bg-red-50
                                                                   flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {cancelling === session.id
                                                            ? <Loader2 size={12} className="animate-spin" />
                                                            : <XCircle size={12} />}
                                                        Cancel
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <SessionFiltersModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={(filters) => console.log('Filters applied:', filters)}
            />

            <AttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={() => setIsAttendanceModalOpen(false)}
                session={selectedSession}
            />
        </div>
    );
};

export default SessionsList;
