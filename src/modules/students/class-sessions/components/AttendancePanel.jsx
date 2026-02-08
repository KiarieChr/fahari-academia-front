import React, { useState } from 'react';
import { Search, Save, CheckCircle, XCircle, Clock } from 'lucide-react';

const AttendancePanel = () => {
    // Mock Data
    const [students, setStudents] = useState([
        { id: 101, name: 'Alice Wambui', admNo: 'ADM-001', status: 'Present', remarks: '' },
        { id: 102, name: 'Brian Njoroge', admNo: 'ADM-002', status: 'Absent', remarks: 'Sick leave' },
        { id: 103, name: 'Charity Mutua', admNo: 'ADM-003', status: 'Present', remarks: '' },
        { id: 104, name: 'David Otieno', admNo: 'ADM-004', status: 'Late', remarks: 'Bus delay' },
        { id: 105, name: 'Esther Kimani', admNo: 'ADM-005', status: 'Present', remarks: '' },
    ]);

    const handleStatusChange = (id, newStatus) => {
        setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    const markAllPresent = () => {
        setStudents(students.map(s => ({ ...s, status: 'Present' })));
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-gray-900">Attendance: Grade 4 East - Mathematics</h3>
                <div className="flex gap-2">
                    <button
                        onClick={markAllPresent}
                        className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 border border-green-200"
                    >
                        Mark All Present
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4">Admission No.</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 font-mono text-xs">{student.admNo}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-1">
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Present')}
                                            className={`p-1.5 rounded-md transition-colors ${student.status === 'Present' ? 'bg-green-100 text-green-700 ring-1 ring-green-400' : 'text-gray-400 hover:bg-gray-100'}`}
                                            title="Present"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Absent')}
                                            className={`p-1.5 rounded-md transition-colors ${student.status === 'Absent' ? 'bg-red-100 text-red-700 ring-1 ring-red-400' : 'text-gray-400 hover:bg-gray-100'}`}
                                            title="Absent"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Late')}
                                            className={`p-1.5 rounded-md transition-colors ${student.status === 'Late' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400' : 'text-gray-400 hover:bg-gray-100'}`}
                                            title="Late"
                                        >
                                            <Clock size={18} />
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium mt-1 block">{student.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        defaultValue={student.remarks}
                                        placeholder="Add remark..."
                                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none text-xs text-gray-600 focus:bg-gray-50 px-2 py-1"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-black rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 font-medium">
                    <Save size={18} /> Save Attendance
                </button>
            </div>
        </div>
    );
};

export default AttendancePanel;
