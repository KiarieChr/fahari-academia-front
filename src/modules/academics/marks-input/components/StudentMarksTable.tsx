import React from 'react';
import { AlertCircle, MessageSquare } from 'lucide-react';

const StudentMarksTable = ({ students, onUpdateStudent, selectedStudents, onSelectStudent, onSelectAll, maxMark = 100, loading }) => {

    const handleKeyDown = (e, currentIndex) => {
        if (e.key === 'Enter' || e.key === 'Tab') {
            if (e.key === 'Enter') e.preventDefault();
            const nextInput = document.getElementById(`mark-input-${currentIndex + 1}`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
        // Arrow keys for grid navigation
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextInput = document.getElementById(`mark-input-${currentIndex + 1}`);
            if (nextInput) { nextInput.focus(); nextInput.select(); }
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevInput = document.getElementById(`mark-input-${currentIndex - 1}`);
            if (prevInput) { prevInput.focus(); prevInput.select(); }
        }
    };

    const handleMarkChange = (studentId, value) => {
        if (value === '') {
            onUpdateStudent(studentId, 'raw_mark', null);
            return;
        }
        let num = parseFloat(value);
        if (isNaN(num)) return;
        if (num > maxMark) num = maxMark;
        if (num < 0) num = 0;
        onUpdateStudent(studentId, 'raw_mark', num);
    };

    const handleAbsentToggle = (studentId, checked) => {
        onUpdateStudent(studentId, 'is_absent', checked);
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-slate-500">Loading students...</p>
            </div>
        );
    }

    return (
        <div className="neo-card border-none overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-transparent border-b border-gray-100 sticky top-0 z-10 font-bold">
                        <tr>
                            <th className="px-4 py-4 font-semibold w-10">
                                <input
                                    type="checkbox"
                                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                    checked={students.length > 0 && selectedStudents.length === students.length}
                                    onChange={onSelectAll}
                                />
                            </th>
                            <th className="px-4 py-4 font-semibold">#</th>
                            <th className="px-4 py-4 font-semibold">Adm No</th>
                            <th className="px-4 py-4 font-semibold">Student Name</th>
                            <th className="px-4 py-4 font-semibold">Stream</th>
                            <th className="px-4 py-4 font-semibold w-20 text-center">Absent</th>
                            <th className="px-4 py-4 font-semibold w-28 text-center">Marks (/{maxMark})</th>
                            <th className="px-4 py-4 font-semibold w-16 text-center">Grade</th>
                            <th className="px-4 py-4 font-semibold w-16 text-center">Pts</th>
                            <th className="px-4 py-4 font-semibold">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {students.map((student, index) => {
                            const isSelected = selectedStudents.includes(student.student_id);
                            const isAbsent = student.is_absent;
                            const hasMarks = student.raw_mark !== null && student.raw_mark !== undefined;
                            const isValid = !hasMarks || (Number(student.raw_mark) >= 0 && Number(student.raw_mark) <= maxMark);

                            return (
                                <tr
                                    key={student.student_id}
                                    className={`group transition-colors ${
                                        isSelected ? 'bg-blue-50 dark:bg-blue-900/10' :
                                        !isValid ? 'bg-red-50 dark:bg-red-900/10' :
                                        isAbsent ? 'bg-slate-50 dark:bg-slate-800/50 opacity-60' :
                                        'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => onSelectStudent(student.student_id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{index + 1}</td>
                                    <td className="px-4 py-3 font-mono text-slate-500 text-xs">{student.admission_number || '—'}</td>
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{student.student_name}</td>
                                    <td className="px-4 py-3 text-slate-500 text-xs">{student.stream_name || '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded text-red-500 focus:ring-red-400 w-4 h-4 cursor-pointer"
                                            
                                            checked={isAbsent}
                                            onChange={e => handleAbsentToggle(student.student_id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-center relative">
                                        {isAbsent ? (
                                            <span className="text-slate-400 text-xs italic">Absent</span>
                                        ) : (
                                            <>
                                                <input
                                                    id={`mark-input-${index}`}
                                                    type="number"
                                                    
                                                    className={`w-20 text-center py-1.5 rounded-xl text-sm font-bold outline-none transition-all ${
                                                        !isValid ? 'bg-red-50 border border-red-200 text-red-700 focus:ring-2 focus:ring-red-500' :
                                                        hasMarks ? 'bg-white shadow-[inset_1px_1px_3px_#c3c8ce,inset_-1px_-1px_3px_#ffffff] text-blue-700' :
                                                        'neo-pressed border-none text-slate-700'
                                                    }`}
                                                    placeholder="—"
                                                    value={student.raw_mark ?? ''}
                                                    onChange={e => handleMarkChange(student.student_id, e.target.value)}
                                                    onKeyDown={e => handleKeyDown(e, index)}
                                                    min="0"
                                                    max={maxMark}
                                                    step="0.5"
                                                />
                                                {!isValid && (
                                                    <div className="absolute top-1 right-2 text-red-500" title="Invalid Mark">
                                                        <AlertCircle size={14} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {student.grade ? (
                                            <span className="inline-flex items-center justify-center w-10 h-7 rounded-xl font-bold text-xs bg-[#e0e5ec] shadow-[2px_2px_4px_#c3c8ce,-2px_-2px_4px_#ffffff] text-indigo-700">
                                                {student.grade}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                                        {student.points ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                style = {{ paddingLeft: '20px'}}
                                                className="w-full pr-3 py-1.5 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none text-sm transition-colors"
                                                placeholder="Add remarks..."
                                                value={student.teacher_remark || ''}
                                                onChange={e => onUpdateStudent(student.student_id, 'teacher_remark', e.target.value)}
                                            />
                                            <MessageSquare size={14} className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {students.length === 0 && !loading && (
                <div className="p-12 text-center text-slate-500">
                    <p>Select Year, Term, Class, Subject and Assessment to load students.</p>
                </div>
            )}

            {students.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 bg-transparent flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>{students.length} students</span>
                    <span>
                        {students.filter(s => s.raw_mark !== null && s.raw_mark !== undefined && !s.is_absent).length} marks entered
                        &middot; {students.filter(s => s.is_absent).length} absent
                    </span>
                </div>
            )}
        </div>
    );
};

export default StudentMarksTable;
