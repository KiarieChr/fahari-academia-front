import React, { useRef } from 'react';
import { Lock, AlertCircle, MessageSquare } from 'lucide-react';

const StudentMarksTable = ({ students, onUpdateStudent, selectedStudents, onSelectStudent, onSelectAll }) => {

    // Auto-focus next input on Enter
    const handleKeyDown = (e, currentIndex) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(`mark-input-${currentIndex + 1}`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
    };

    const handleMarkChange = (id, value) => {
        // Validate range 0-100
        let newValue = value;
        if (value > 100) newValue = 100;
        if (value < 0) newValue = 0;

        onUpdateStudent(id, 'marks', newValue);
    };

    const handleStatusChange = (id, status) => {
        onUpdateStudent(id, 'status', status);
        if (status === 'Absent' || status === 'Excused') {
            onUpdateStudent(id, 'marks', ''); // Clear marks if absent
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-semibold w-10">
                                <input
                                    type="checkbox"
                                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                    checked={students.length > 0 && selectedStudents.length === students.length}
                                    onChange={onSelectAll}
                                />
                            </th>
                            <th className="px-6 py-4 font-semibold">Adm No</th>
                            <th className="px-6 py-4 font-semibold">Student Name</th>
                            <th className="px-6 py-4 font-semibold w-32">Status</th>
                            <th className="px-6 py-4 font-semibold w-24 text-center">Marks</th>
                            <th className="px-6 py-4 font-semibold w-16 text-center">Grade</th>
                            <th className="px-6 py-4 font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {students.map((student, index) => {
                            const isSelected = selectedStudents.includes(student.id);
                            const isLocked = student.locked;
                            const isAbsent = student.status === 'Absent' || student.status === 'Excused';
                            const isValid = student.marks === '' || (Number(student.marks) >= 0 && Number(student.marks) <= 100);

                            return (
                                <tr
                                    key={student.id}
                                    className={`group transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' :
                                        !isValid ? 'bg-red-50 dark:bg-red-900/10' :
                                            'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <td className="px-6 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => onSelectStudent(student.id)}
                                            disabled={isLocked}
                                        />
                                    </td>
                                    <td className="px-6 py-3 font-mono text-slate-500">{student.admNo}</td>
                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">
                                        {student.name}
                                        {isLocked && <Lock size={12} className="inline ml-2 text-slate-400" />}
                                    </td>
                                    <td className="px-6 py-3">
                                        <select
                                            className={`px-2 py-1 rounded-lg text-xs font-bold border-none outline-none cursor-pointer ${student.status === 'Present' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                                student.status === 'Absent' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                                    'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                }`}
                                            value={student.status}
                                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
                                            disabled={isLocked}
                                        >
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                            <option value="Excused">Excused</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-3 text-center relative">
                                        {isAbsent ? (
                                            <span className="text-slate-400 text-xs italic">--</span>
                                        ) : (
                                            <>
                                                <input
                                                    id={`mark-input-${index}`}
                                                    type="number"
                                                    className={`w-16 text-center py-1.5 rounded-lg border text-sm font-bold outline-none focus:ring-2 transition-all ${!isValid ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500' :
                                                        student.marks !== '' ? 'border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500' :
                                                            'border-slate-300 bg-white dark:bg-slate-800 focus:ring-blue-500'
                                                        }`}
                                                    placeholder="-"
                                                    value={student.marks}
                                                    onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    disabled={isLocked}
                                                    min="0"
                                                    max="100"
                                                />
                                                {!isValid && (
                                                    <div className="absolute top-1 right-2 text-red-500" title="Invalid Mark">
                                                        <AlertCircle size={14} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-center font-bold text-slate-700 dark:text-slate-300">
                                        {student.grade}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full pl-8 pr-3 py-1.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-sm transition-colors"
                                                placeholder="Add remarks..."
                                                value={student.remarks}
                                                onChange={(e) => onUpdateStudent(student.id, 'remarks', e.target.value)}
                                                disabled={isLocked}
                                            />
                                            <MessageSquare size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {students.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                    <p>Select a class and subject to load student list.</p>
                </div>
            )}
        </div>
    );
};

export default StudentMarksTable;
