import React, { useState, useEffect } from 'react';
import { Search, Download, Printer, Loader2 } from 'lucide-react';
import { studentManagementService } from '../../../../services/studentManagementService';
import { toast } from 'react-toastify';
import StudentEditModal from './StudentEditModal';

const AdmittedStudentsTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        fetchAdmissions();
    }, [currentPage, debouncedSearch]);

    const fetchAdmissions = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                page_size: pageSize,
                search: debouncedSearch
            };
            const response = await studentManagementService.getAdmissions(params);
            
            let rawResults = [];
            let total = 0;

            if (response.results) {
                // Paginated response from server
                rawResults = response.results;
                total = response.count;
            } else {
                // Non-paginated array from server
                rawResults = response;
                total = response.length;
            }

            // Ensure we only show 'pageSize' items if server returned more (fallback)
            // If it was non-paginated, we slice based on currentPage.
            // If it was paginated but returned more than requested (e.g. server default 50), we slice to 10.
            if (rawResults.length > pageSize) {
                const startIndex = response.results ? 0 : (currentPage - 1) * pageSize;
                setStudents(rawResults.slice(startIndex, startIndex + pageSize));
            } else {
                setStudents(rawResults);
            }
            
            setTotalCount(total);
        } catch (error) {
            console.error("Error fetching admissions:", error);
            toast.error("Failed to load admission register");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-3 items-center w-full md:w-auto">
                    <h3 className="text-lg font-bold text-gray-900 hidden md:block">Admission Register</h3>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Name or admission number..."
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

            <div className="flex-1 overflow-x-auto min-h-[400px]">
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
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    No admitted students found.
                                </td>
                            </tr>
                        ) : (
                            students.map((s) => (
                                <tr
                                    key={s.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onDoubleClick={() => {
                                        setSelectedStudent(s.id);
                                        setShowEditModal(true);
                                    }}
                                >
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600 font-medium">{s.admission_number || 'Pending'}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{s.student_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.class_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.admission_date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{s.entry_type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wider ${s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            s.status === 'withdrawn' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-700 border border-slate-100'
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

            {/* Pagination Controls */}
            {totalCount > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-semibold text-gray-900">{totalCount}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loading}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        
                        <div className="hidden md:flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Basic logic to show limited numbers
                                if (totalPages > 7) {
                                    if (pageNum > 2 && pageNum < totalPages - 1 && Math.abs(pageNum - currentPage) > 1) {
                                        if (pageNum === 3 || pageNum === totalPages - 2) return <span key={pageNum} className="px-1 text-gray-400">...</span>;
                                        return null;
                                    }
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${currentPage === pageNum 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || loading}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

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

