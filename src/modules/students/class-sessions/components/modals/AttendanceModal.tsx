import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, XCircle, Clock, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';
import { api } from '../../../../../services/apiClient';

const AttendanceModal = ({ isOpen, onClose, session }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && session?.id) {
            fetchAttendance();
        }
    }, [isOpen, session]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const data = await api.lessonSessions.getAttendance(session.id);
            // Map the API structure to the UI structure if needed, or use directly
            // Backend provides: { id, student_name, student (student ID), status, notes, ... }
            const formatted = data.map(record => ({
                id: record.id,
                studentId: record.student,
                name: record.student_name || 'Unknown Student',
                admNo: `STU-${record.student}`, // We don't have admNo in the serializer, mock for now
                status: record.status || 'present', // fallback
                remarks: record.notes || ''
            }));
            setStudents(formatted);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load attendance records.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    const handleRemarkChange = (id, remark) => {
        setStudents(students.map(s => s.id === id ? { ...s, remarks: remark } : s));
    };

    const markAllPresent = () => {
        setStudents(students.map(s => ({ ...s, status: 'present' })));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = students.map(s => ({
                student_id: s.studentId, // Backend expects student_id
                status: s.status,
                notes: s.remarks
            }));
            await api.lessonSessions.markAttendance(session.id, payload);
            toast.success(`Attendance saved for ${session?.class_session_name || 'Class'}`);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.data?.detail || "Failed to save attendance.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Mark Attendance"
            subtitle={`${session?.time || 'Session Time'} · ${session?.class || 'Class'} · ${session?.subject || 'Subject'}`}
            icon={<UserCheck size={20} className="text-indigo-600" />}
            size="lg"
            accentColor="bg-indigo-500"
            noPadding
            footer={<>
                <Modal.CancelButton onClick={onClose} />
                <Modal.SubmitButton onClick={handleSave}>
                    <Save size={16} /> Save Attendance
                </Modal.SubmitButton>
            </>}
        >
            {/* Toolbar */}
            <div className="px-6 py-3 border-b border-gray-100 bg-white flex justify-between items-center">
                <div className="text-sm font-medium text-gray-600">
                    {students.filter(s => s.status === 'present').length} Present • {students.filter(s => s.status === 'absent').length} Absent • {students.filter(s => s.status === 'late').length} Late
                </div>
                <button
                    onClick={markAllPresent}
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                >
                    Mark All Present
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-gray-50/30">
                    <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
                    <p className="text-sm font-medium text-gray-500">Loading student list...</p>
                </div>
            ) : students.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 bg-gray-50/30">
                    <UserCheck size={48} className="text-gray-300 mb-4" />
                    <p className="text-sm font-medium text-gray-500">No students enrolled in this class session.</p>
                </div>
            ) : (
            <div className="flex-1 overflow-auto p-0">
                {/* Student List */}
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50/50 text-gray-700 uppercase font-bold text-xs sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="px-6 py-3 border-b border-gray-100">Student Info</th>
                            <th className="px-6 py-3 border-b border-gray-100 text-center">Status</th>
                            <th className="px-6 py-3 border-b border-gray-100">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors bg-white">
                                <td className="px-6 py-3">
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-400 font-mono">{student.admNo}</div>
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <div className="flex justify-center gap-1">
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'present')}
                                            className={`p-2 rounded-lg transition-all ${student.status === 'present'
                                                    ? 'bg-green-100 text-green-700 shadow-sm ring-1 ring-green-200'
                                                    : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                                                }`}
                                            title="Present"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'absent')}
                                            className={`p-2 rounded-lg transition-all ${student.status === 'absent'
                                                    ? 'bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200'
                                                    : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                                                }`}
                                            title="Absent"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'late')}
                                            className={`p-2 rounded-lg transition-all ${student.status === 'late'
                                                    ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200'
                                                    : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                                                }`}
                                            title="Late"
                                        >
                                            <Clock size={20} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <input
                                        type="text"
                                        value={student.remarks}
                                        onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                                        placeholder="Add note..."
                                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none text-xs text-gray-600 focus:bg-gray-50 px-2 py-1 rounded"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </Modal>
    );
};

export default AttendanceModal;

