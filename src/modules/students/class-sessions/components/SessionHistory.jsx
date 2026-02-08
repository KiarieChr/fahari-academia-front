import React, { useState } from 'react';
import { Search, Calendar, Filter, FileText } from 'lucide-react';

const SessionHistory = () => {
    const history = [
        { id: 1, date: 'Oct 24, 2023', class: 'Grade 5 West', subject: 'English', teacher: 'Mrs. Wanjiku', duration: '40m', attendance: '98%', status: 'Completed' },
        { id: 2, date: 'Oct 24, 2023', class: 'Grade 4 East', subject: 'Math', teacher: 'Mr. Omondi', duration: '40m', attendance: '92%', status: 'Completed' },
        { id: 3, date: 'Oct 23, 2023', class: 'Grade 6 North', subject: 'Science', teacher: 'Mr. Kamau', duration: '40m', attendance: '95%', status: 'Completed' },
        { id: 4, date: 'Oct 23, 2023', class: 'Grade 8 South', subject: 'Computer', teacher: 'Mr. Juma', duration: '-', attendance: '-', status: 'Cancelled' },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Session History</h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="date"
                            className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 text-sm">
                        <Filter size={14} /> Filter
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Class</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Teacher</th>
                            <th className="px-6 py-4">Duration</th>
                            <th className="px-6 py-4 text-center">Attendance</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {history.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">{record.date}</td>
                                <td className="px-6 py-4 font-medium">{record.class}</td>
                                <td className="px-6 py-4">{record.subject}</td>
                                <td className="px-6 py-4">{record.teacher}</td>
                                <td className="px-6 py-4">{record.duration}</td>
                                <td className="px-6 py-4 text-center font-bold">{record.attendance}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-indigo-600">
                                        <FileText size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SessionHistory;
