import React, { useState } from 'react';
import { Save, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../../components/common/Modal';

const AttendanceModal = ({ isOpen, onClose, session }) => {
    // Mock Students Data
    const [students, setStudents] = useState([
        { id: 101, name: 'Alice Wambui', admNo: 'ADM-001', status: 'Present', remarks: '' },
        { id: 102, name: 'Brian Njoroge', admNo: 'ADM-002', status: 'Absent', remarks: 'Sick' },
        { id: 103, name: 'Charity Mutua', admNo: 'ADM-003', status: 'Present', remarks: '' },
        { id: 104, name: 'David Otieno', admNo: 'ADM-004', status: 'Late', remarks: 'Bus delay' },
        { id: 105, name: 'Esther Kimani', admNo: 'ADM-005', status: 'Present', remarks: '' },
        { id: 106, name: 'Francis Ouma', admNo: 'ADM-006', status: 'Present', remarks: '' },
    ]);

    const handleStatusChange = (id, newStatus) => {
        setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
    };

    const handleRemarkChange = (id, remark) => {
        setStudents(students.map(s => s.id === id ? { ...s, remarks: remark } : s));
    };

    const markAllPresent = () => {
        setStudents(students.map(s => ({ ...s, status: 'Present' })));
    };

    const handleSave = () => {
        toast.success(`Attendance saved for ${session?.class || 'Class'}`);
        onClose();
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
                    {students.filter(s => s.status === 'Present').length} Present • {students.filter(s => s.status === 'Absent').length} Absent • {students.filter(s => s.status === 'Late').length} Late
                </div>
                <button
                    onClick={markAllPresent}
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors"
                >
                    Mark All Present
                </button>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-auto p-0">
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
                                            onClick={() => handleStatusChange(student.id, 'Present')}
                                            className={`p-2 rounded-lg transition-all ${student.status === 'Present'
                                                    ? 'bg-green-100 text-green-700 shadow-sm ring-1 ring-green-200'
                                                    : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                                                }`}
                                            title="Present"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Absent')}
                                            className={`p-2 rounded-lg transition-all ${student.status === 'Absent'
                                                    ? 'bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200'
                                                    : 'text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                                                }`}
                                            title="Absent"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(student.id, 'Late')}
                                            className={`p-2 rounded-lg transition-all ${student.status === 'Late'
                                                    ? 'bg-yellow-100 text-yellow-700 shadow-sm ring-1 ring-yellow-200'
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
        </Modal>
    );
};

export default AttendanceModal;

