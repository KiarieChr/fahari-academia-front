import React, { useState } from 'react';
import { Eye, Download, MoreVertical, RefreshCw, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import ReportCardPreview from './ReportCardPreview';

const StudentReportsTable = ({ curriculum }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);

    const students = [
        { id: 1, adm: 'ADM-2024-001', name: 'Alex Johnson', class: 'Grade 4 East', avg: 85, grade: 'EE', status: 'Published', attendance: 98 },
        { id: 2, adm: 'ADM-2024-002', name: 'Sarah Williams', class: 'Grade 4 East', avg: 72, grade: 'ME', status: 'Draft', attendance: 92 },
        { id: 3, adm: 'ADM-2024-003', name: 'Michael Brown', class: 'Grade 4 East', avg: 65, grade: 'ME', status: 'Reviewed', attendance: 88 },
        { id: 4, adm: 'ADM-2024-004', name: 'Emily Davis', class: 'Grade 4 East', avg: 91, grade: 'EE', status: 'Published', attendance: 99 },
        { id: 5, adm: 'ADM-2024-005', name: 'David Wilson', class: 'Grade 4 East', avg: 45, grade: 'BE', status: 'Draft', attendance: 75 },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Draft': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
            case 'Reviewed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Academic Summary</h3>
                        <p className="text-sm text-slate-500">Manage and generate reports for {students.length} students</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Student Info</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Class</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Attendance</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">
                                    {curriculum === 'CBC' ? 'Performance' : 'Avg. Score'}
                                </th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${curriculum === 'CBC' ? 'bg-teal-500' : 'bg-indigo-500'
                                                }`}>
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{student.name}</div>
                                                <div className="text-xs text-slate-500">{student.adm}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{student.class}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full w-24 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${student.attendance < 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${student.attendance}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{student.attendance}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {curriculum === 'CBC' ? student.grade : `${student.avg}%`}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {curriculum === 'CBC' ? 'Performance Level' : `Grade: ${student.grade}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(student.status)}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-${curriculum === 'CBC' ? 'teal' : 'indigo'}-600 transition-colors`}
                                                title="View Report"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors" title="Download PDF">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedStudent && (
                <ReportCardPreview
                    isOpen={!!selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    student={selectedStudent}
                    curriculum={curriculum}
                />
            )}
        </>
    );
};

export default StudentReportsTable;
