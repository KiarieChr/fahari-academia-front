import React, { useState, useEffect } from 'react';
import { Search, Download, Printer, Loader2 } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';
import { toast } from 'react-toastify';
import StudentEditModal from './StudentEditModal';

const AdmittedStudentsTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchAdmissions();
    }, []);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const data = await studentManagementService.getAdmissions();
            setStudents(data.results || data);
        } catch (error) {
            console.error("Error fetching admissions:", error);
            toast.error("Failed to load admission register");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 items-center w-full md:w-auto">
                    <h3 className="text-lg font-bold text-gray-900 hidden md:block">Admission Register</h3>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Search admission number..."
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Printer size={16} /> Print
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="animate-spin text-indigo-600" size={24} />
                                        <p>Loading register...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    No admitted students found.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((s) => (
                                <tr
                                    key={s.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onDoubleClick={() => {
                                        setSelectedStudent(s.id);
                                        setShowEditModal(true);
                                    }}
                                >
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{s.admission_number || 'Pending'}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.student_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.class_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.admission_date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.entry_type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.status === 'active' ? 'bg-green-100 text-green-800' :
                                            s.status === 'withdrawn' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <StudentEditModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedStudent(null);
                    }}
                    studentId={selectedStudent}
                    onSuccess={fetchAdmissions}
                />
            )}
        </div>
    );
};

export default AdmittedStudentsTable;

