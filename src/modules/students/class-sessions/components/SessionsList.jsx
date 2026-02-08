import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Play, Calendar, Users, CheckCircle } from 'lucide-react';

import SessionFiltersModal from './modals/SessionFiltersModal';
import AttendanceModal from './modals/AttendanceModal';

const SessionsList = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    // Mock Data
    const sessions = [
        { id: 1, time: '08:00 - 08:40', class: 'Grade 4 East', subject: 'Mathematics', teacher: 'Mr. Omondi', status: 'Ongoing', attendance: '92%' },
        { id: 2, time: '08:00 - 08:40', class: 'Grade 5 West', subject: 'English', teacher: 'Mrs. Wanjiku', status: 'Completed', attendance: '98%' },
        { id: 3, time: '08:50 - 09:30', class: 'Grade 6 North', subject: 'Science', teacher: 'Mr. Kamau', status: 'Upcoming', attendance: '-' },
        { id: 4, time: '08:50 - 09:30', class: 'Grade 4 East', subject: 'Social Studies', teacher: 'Ms. Atieno', status: 'Upcoming', attendance: '-' },
        { id: 5, time: '10:00 - 10:40', class: 'Grade 8 South', subject: 'Computer Studies', teacher: 'Mr. Juma', status: 'Cancelled', attendance: '-' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Ongoing': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
            case 'Upcoming': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'Cancelled': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const handleApplyFilters = (filters) => {
        console.log("Filters Applied:", filters);
        // In a real app, you would filter the 'sessions' state here
    };

    const handleOpenAttendance = (session) => {
        setSelectedSession(session);
        setIsAttendanceModalOpen(true);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header / Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Daily Sessions</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Time Slot</th>
                            <th className="px-6 py-4">Class / Stream</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Teacher</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-center">Attendance</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-900">{session.time}</td>
                                <td className="px-6 py-4 font-medium">{session.class}</td>
                                <td className="px-6 py-4 text-gray-900">{session.subject}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                            {session.teacher.split(' ')[1][0]}
                                        </div>
                                        {session.teacher}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(session.status)}`}>
                                        {session.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-gray-800">
                                    {session.attendance}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {session.status === 'Upcoming' && (
                                            <button className="text-xs font-medium text-black bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center gap-1 shadow-sm">
                                                <Play size={12} /> Start
                                            </button>
                                        )}
                                        {session.status === 'Ongoing' && (
                                            <button
                                                onClick={() => handleOpenAttendance(session)}
                                                className="text-xs font-medium text-black bg-green-600 px-3 py-1.5 rounded-lg hover:bg-green-700 flex items-center gap-1 shadow-sm"
                                            >
                                                <Users size={12} /> Attendance
                                            </button>
                                        )}
                                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <SessionFiltersModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={handleApplyFilters}
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
