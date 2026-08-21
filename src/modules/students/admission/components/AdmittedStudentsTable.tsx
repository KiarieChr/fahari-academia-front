import React, { useState, useEffect } from 'react';
import { 
    Search, Download, Printer, Loader2, X, User, Phone, Mail, 
    Calendar, Globe, Shield, FileText, Edit, BookOpen, School, 
    ChevronRight, ChevronLeft, ExternalLink, Info, CheckCircle, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentManagementService } from '../../../../services/studentManagementService';
import { api } from '../../../../services/api';
import { toast } from 'react-toastify';
import StudentEditModal from './StudentEditModal';
import Modal from '../../../../components/common/Modal';
import LazyImage from '../../../../components/common/LazyImage';

const AdmittedStudentsTable = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    // States for Drawer & Modals
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [drawerStudent, setDrawerStudent] = useState(null);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [showBulkEditModal, setShowBulkEditModal] = useState(false);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudentIds(students.map(s => s.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleEditAcademicEnrollment = async (student) => {
        try {
            const res = await api.get(`/api/settings/enrollments/?student=${student.student || student.id}&is_active=true`);
            const activeEnr = res.results ? res.results[0] : res[0];
            if (activeEnr) {
                setEditingEnrollment(activeEnr);
            } else {
                toast.warning("No active academic enrollment found for this student. They must be reported first.");
            }
        } catch(e) {
            toast.error("Failed to fetch academic enrollment.");
        }
    };

    const handleEditSave = async (id, data) => {
        try {
            if (data.is_active) {
                const studentId = editingEnrollment.student || editingEnrollment.student_id;
                const activeRes = await api.get(`/api/settings/enrollments/?student=${studentId}&is_active=true`);
                const activeEnrs = activeRes.results || activeRes || [];
                const others = activeEnrs.filter(e => e.id !== id);
                await Promise.all(others.map(e => api.patch(`/api/settings/enrollments/${e.id}/`, { is_active: false })));
            }
            await api.patch(`/api/settings/enrollments/${id}/`, data);
            toast.success("Billing context updated successfully");
            setEditingEnrollment(null);
            fetchAdmissions(); // refresh to get updated class name
        } catch (e) {
            toast.error("Failed to update enrollment");
        }
    };

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
                rawResults = response.results;
                total = response.count;
            } else {
                rawResults = response;
                total = response.length;
            }

            if (rawResults.length > pageSize) {
                const startIndex = response.results ? 0 : (currentPage - 1) * pageSize;
                setStudents(rawResults.slice(startIndex, startIndex + pageSize));
            } else {
                setStudents(rawResults);
            }
            
            setTotalCount(total);
            
            // If the drawer student is open, update its record
            if (drawerStudent) {
                const updated = rawResults.find(st => st.id === drawerStudent.id);
                if (updated) setDrawerStudent(updated);
            }
        } catch (error) {
            console.error("Error fetching admissions:", error);
            toast.error("Failed to load admission register");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePrintSingle = (student) => {
        toast.info(`Printing profile for ${student.student_name}...`);
        // Simple print view generator
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Student Profile - ${student.student_name}</title>
                <style>
                    body { font-family: sans-serif; color: #333; padding: 40px; line-height: 1.6; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                    .title { font-size: 24px; font-weight: bold; margin: 0; }
                    .subtitle { font-size: 14px; color: #666; }
                    .section { margin-bottom: 30px; }
                    .section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
                    .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; }
                    .label { font-size: 12px; color: #888; font-weight: bold; }
                    .value { font-size: 14px; font-weight: 500; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1 class="title">${student.student_name}</h1>
                        <p class="subtitle">Admission Number: ${student.admission_number || 'N/A'}</p>
                    </div>
                    <div style="text-align: right;">
                        <p class="value" style="font-weight: bold; color: green; text-transform: uppercase;">Status: ${student.status}</p>
                        <p class="subtitle">Admitted: ${student.admission_date}</p>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="section-title">Academic Profile</h2>
                    <div class="grid">
                        <div>
                            <span class="label">Class / Grade:</span>
                            <p class="value">${student.class_name || 'N/A'}</p>
                        </div>
                        <div>
                            <span class="label">Curriculum:</span>
                            <p class="value">${student.applying_for_curriculum_name || 'Standard'}</p>
                        </div>
                        <div>
                            <span class="label">Admission Type:</span>
                            <p class="value">${student.entry_type || 'New Admission'}</p>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Personal Demographics</h2>
                    <div class="grid">
                        <div>
                            <span class="label">Gender:</span>
                            <p class="value">${student.student_gender === 'M' ? 'Male' : student.student_gender === 'F' ? 'Female' : 'N/A'}</p>
                        </div>
                        <div>
                            <span class="label">Date of Birth:</span>
                            <p class="value">${student.student_dob || 'N/A'}</p>
                        </div>
                        <div>
                            <span class="label">Nationality:</span>
                            <p class="value">${student.student_nationality || 'Kenyan'}</p>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">Emergency / Guardian Contacts</h2>
                    <div class="grid">
                        <div>
                            <span class="label">Primary Parent:</span>
                            <p class="value">${student.guardian_name || 'N/A'} (${student.guardian_relationship || 'Parent'})</p>
                        </div>
                        <div>
                            <span class="label">Phone:</span>
                            <p class="value">${student.guardian_phone || 'N/A'}</p>
                        </div>
                        <div style="grid-column: span 2;">
                            <span class="label">Email Address:</span>
                            <p class="value">${student.guardian_email || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="bg-[#f8f9fa] rounded-[28px] border border-white shadow-[6px_6px_16px_#e5e7eb,-6px_-6px_16px_#ffffff] overflow-hidden flex flex-col h-full relative">
            
            {/* Header controls bar */}
            <div className="p-4 sm:p-5 md:py-6 md:px-6 border-b border-white flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden bg-gray-50/30">
                
                <div className="flex gap-3 items-center w-full md:w-auto">
                    <h3 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-normal hidden md:block drop-shadow-sm">Admission Register</h3>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-4 py-3 bg-gray-50/80 rounded-2xl shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] border border-white/40 focus:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] focus:border-indigo-200 outline-none text-sm transition-all text-slate-700 placeholder-slate-400 font-bold"
                            style={{paddingLeft: '15px'}}
                            placeholder="Search by student name or admission number..."
                        />
                    </div>
                </div>
                
                <div className="flex gap-3 items-center">
                    {selectedStudentIds.length > 0 && (
                        <button 
                            onClick={() => setShowBulkEditModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wider text-white bg-indigo-600 rounded-xl shadow-md hover:bg-indigo-700 transition-all border border-indigo-500"
                        >
                            <Settings size={13} /> Bulk Edit Context ({selectedStudentIds.length})
                        </button>
                    )}
                    <button className="flex items-center gap-2 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-[#f8f9fa] rounded-xl shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all border border-white">
                        <Printer size={13} className="text-slate-500" /> Print List
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-[#f8f9fa] rounded-xl shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] transition-all border border-white">
                        <Download size={13} className="text-indigo-500" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Admissions table */}
            <div className="flex-1 overflow-x-auto min-h-[400px]">
                <table className="min-w-full divide-y divide-white">
                    <thead className="bg-[#f8f9fa] shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff] sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-5 text-left w-10">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                    checked={students.length > 0 && selectedStudentIds.length === students.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Admission No</th>
                            <th className="px-6 py-5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Student Details</th>
                            <th className="hidden md:table-cell px-6 py-5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Class / Stream</th>
                            <th className="hidden lg:table-cell px-6 py-5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Admission Date</th>
                            <th className="hidden xl:table-cell px-6 py-5 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Admission Type</th>
                            <th className="px-6 py-5 text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/50 bg-transparent">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="py-24">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 border-4 border-slate-50 border-t-indigo-600 rounded-full animate-spin" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loading Admissions...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Info className="text-slate-300" size={24} />
                                        <p className="text-sm font-bold text-slate-400">No admitted students found matching criteria.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            students.map((s) => (
                                <tr
                                    key={s.id}
                                    className={`group/row hover:bg-white/40 cursor-pointer transition-colors ${
                                        drawerStudent && drawerStudent.id === s.id ? 'bg-indigo-50/40 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02)]' : ''
                                    }`}
                                    onClick={() => setDrawerStudent(s)}
                                    onDoubleClick={() => {
                                        setSelectedStudent(s.id);
                                        setShowEditModal(true);
                                    }}
                                >
                                    <td className="px-4 py-4.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                                        <input 
                                            type="checkbox"
                                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                            checked={selectedStudentIds.includes(s.id)}
                                            onChange={() => handleSelectRow(s.id)}
                                        />
                                    </td>
                                    {/* Admission Number */}
                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                        <span className="text-[12px] font-black font-mono text-slate-600 group-hover/row:text-indigo-600 transition-colors">
                                            #{s.admission_number || 'Pending'}
                                        </span>
                                    </td>

                                    {/* Student Name */}
                                    <td className="px-6 py-4.5 whitespace-nowrap">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shadow-sm relative shrink-0">
                                                <LazyImage 
                                                    src={s.passport_photo_url} 
                                                    alt={s.student_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-slate-700 group-hover/row:text-indigo-600 transition-colors">
                                                    {s.student_name}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Parent: {s.guardian_name || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Class name */}
                                    <td className="hidden md:table-cell px-6 py-4.5 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-wide">
                                            {s.class_name}
                                        </span>
                                    </td>

                                    {/* Admission Date */}
                                    <td className="hidden lg:table-cell px-6 py-4.5 whitespace-nowrap text-[11px] font-bold text-slate-500">
                                        {new Date(s.admission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>

                                    {/* Admission Type */}
                                    <td className="hidden xl:table-cell px-6 py-4.5 whitespace-nowrap text-[11px] font-bold text-slate-500">
                                        {s.entry_type}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4.5 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                            s.status === 'active' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                            : s.status === 'withdrawn' 
                                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                            : 'bg-slate-50 text-slate-600 border-slate-100'
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
                <div className="p-8 border-t border-white flex flex-col sm:flex-row justify-between items-center gap-4 bg-transparent">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing <span className="text-slate-700 font-black">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to <span className="text-slate-700 font-black">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="text-slate-700 font-black">{totalCount}</span> admitted students
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loading}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f8f9fa] shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] text-slate-500 hover:text-indigo-600 active:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] disabled:opacity-50 disabled:active:shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] transition-all cursor-pointer border border-white"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="hidden md:flex items-center gap-2">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                if (totalPages > 7) {
                                    if (pageNum > 2 && pageNum < totalPages - 1 && Math.abs(pageNum - currentPage) > 1) {
                                        if (pageNum === 3 || pageNum === totalPages - 2) return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                                        return null;
                                    }
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer border border-white ${
                                            currentPage === pageNum 
                                            ? 'bg-white shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] text-indigo-700' 
                                            : 'bg-[#f8f9fa] shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] text-slate-500'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || loading}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f8f9fa] shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] text-slate-500 hover:text-indigo-600 active:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] disabled:opacity-50 disabled:active:shadow-[3px_3px_8px_#e5e7eb,-3px_-3px_8px_#ffffff] transition-all cursor-pointer border border-white"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Slide-Out Details Drawer Panel */}
            <AnimatePresence>
                {drawerStudent && (
                    <>
                        {/* Glass backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerStudent(null)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[7999] transition-all"
                        />

                        {/* Slide-out Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 220 }}
                            className="w-[480px] max-w-full bg-[#f8f9fa] h-screen fixed right-0 top-0 z-[8000] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-white shadow-[0_2px_5px_#e5e7eb] flex items-center justify-between z-10 bg-[#f8f9fa]">
                                <div className="flex items-center gap-2">
                                    <Info size={16} className="text-indigo-600" />
                                    <h4 className="text-[12px] font-extrabold text-slate-700 uppercase tracking-widest drop-shadow-sm">Student Profile Inspect</h4>
                                </div>
                                <button 
                                    onClick={() => setDrawerStudent(null)}
                                    className="w-8 h-8 rounded-full bg-[#f8f9fa] shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] text-slate-400 hover:text-indigo-600 flex items-center justify-center cursor-pointer transition-all border border-white"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Drawer Body (Scrollable content) */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
                                
                                {/* Identity Hero Card */}
                                <div className="flex flex-col items-center text-center p-6 bg-indigo-50/30 rounded-[30px] border border-indigo-100/30 relative">
                                    <div className="absolute top-4 right-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                            drawerStudent.status === 'active' 
                                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100' 
                                            : 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-100'
                                        }`}>
                                            <CheckCircle size={10} /> {drawerStudent.status}
                                        </span>
                                    </div>

                                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg mb-4 shrink-0">
                                        <LazyImage
                                            src={drawerStudent.passport_photo_url}
                                            alt={drawerStudent.student_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h5 className="text-[16px] font-black text-slate-800">{drawerStudent.student_name}</h5>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admission ID: {drawerStudent.admission_number || 'N/A'}</p>
                                </div>

                                {/* Section 1: Academic Intent */}
                                <div className="space-y-4">
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white pb-2 flex items-center justify-between shadow-[0_1px_2px_#e5e7eb]">
                                        <div className="flex items-center gap-1.5">
                                            <School size={12} className="text-indigo-500" /> Academic Information
                                        </div>
                                        <button 
                                            onClick={() => handleEditAcademicEnrollment(drawerStudent)} 
                                            className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[9px] hover:bg-indigo-100 transition-colors flex items-center gap-1 font-bold shadow-sm"
                                            title="Edit Billing Context"
                                        >
                                            <Settings size={10} /> Edit Context
                                        </button>
                                    </h6>
                                    <div className="grid grid-cols-2 gap-5 p-5 bg-[#f8f9fa] shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] rounded-2xl border border-white">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Class / Grade</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">{drawerStudent.class_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Curriculum</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">{drawerStudent.applying_for_curriculum_name || 'Standard'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admission Date</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">
                                                {new Date(drawerStudent.admission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Admission Type</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">{drawerStudent.entry_type}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Demographics */}
                                <div className="space-y-4">
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white pb-2 flex items-center gap-1.5 shadow-[0_1px_2px_#e5e7eb]">
                                        <User size={12} className="text-indigo-500" /> Personal Demographics
                                    </h6>
                                    <div className="grid grid-cols-3 gap-4 p-5 bg-[#f8f9fa] shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] rounded-2xl border border-white">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gender</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">
                                                {drawerStudent.student_gender === 'M' ? 'Male' : drawerStudent.student_gender === 'F' ? 'Female' : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Birth Date</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">{drawerStudent.student_dob || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nationality</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">{drawerStudent.student_nationality || 'Kenyan'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Guardian Contact */}
                                <div className="space-y-4">
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-white pb-2 flex items-center gap-1.5 shadow-[0_1px_2px_#e5e7eb]">
                                        <Shield size={12} className="text-indigo-500" /> Emergency / Guardian Details
                                    </h6>
                                    <div className="p-5 bg-[#f8f9fa] shadow-[inset_3px_3px_8px_#e5e7eb,inset_-3px_-3px_8px_#ffffff] rounded-2xl border border-white space-y-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Primary Parent Name</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">
                                                {drawerStudent.guardian_name || 'N/A'} 
                                                <span className="text-[10px] font-bold text-slate-400 ml-1.5">({drawerStudent.guardian_relationship || 'Parent'})</span>
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2.5 p-3 bg-[#f8f9fa] rounded-xl border border-white shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff]">
                                                <Phone size={13} className="text-indigo-500" />
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                                    <p className="text-[11px] font-bold text-slate-700 mt-0.5">{drawerStudent.guardian_phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 p-3 bg-[#f8f9fa] rounded-xl border border-white shadow-[2px_2px_5px_#e5e7eb,-2px_-2px_5px_#ffffff] overflow-hidden">
                                                <Mail size={13} className="text-indigo-500" />
                                                <div className="overflow-hidden">
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                                    <p className="text-[11px] font-bold text-slate-700 mt-0.5 truncate">{drawerStudent.guardian_email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="p-6 border-t border-white shadow-[0_-2px_5px_#e5e7eb] flex gap-3 z-10 bg-[#f8f9fa]">
                                <button
                                    onClick={() => {
                                        setSelectedStudent(drawerStudent.id);
                                        setShowEditModal(true);
                                    }}
                                    className="flex-1 py-3 bg-[#f8f9fa] text-indigo-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] transition-all border border-white"
                                >
                                    <Edit size={13} /> Edit Profile
                                </button>
                                <button
                                    onClick={() => handlePrintSingle(drawerStudent)}
                                    className="px-6 py-3 bg-[#f8f9fa] text-slate-600 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_10px_#e5e7eb,-4px_-4px_10px_#ffffff] hover:shadow-[inset_2px_2px_5px_#e5e7eb,inset_-2px_-2px_5px_#ffffff] transition-all border border-white"
                                    title="Print Student Record Sheet"
                                >
                                    <Printer size={13} /> Print
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

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

            {editingEnrollment && (
                <EditAcademicEnrollmentModal
                    enrollment={editingEnrollment}
                    onSave={handleEditSave}
                    onClose={() => setEditingEnrollment(null)}
                />
            )}

            {showBulkEditModal && (
                <BulkEditAcademicEnrollmentModal
                    selectedIds={selectedStudentIds}
                    students={students}
                    onClose={() => setShowBulkEditModal(false)}
                    onSuccess={() => {
                        setShowBulkEditModal(false);
                        setSelectedStudentIds([]);
                        fetchAdmissions();
                    }}
                />
            )}
        </div>
    );
};

export default AdmittedStudentsTable;

// --- Bulk Edit Academic Enrollment Modal ---
const BulkEditAcademicEnrollmentModal = ({ selectedIds, students, onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    grade: '',
    term: '',
    academic_year: '',
    status: 'active',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: selectedIds.length });
  const [options, setOptions] = useState({ grades: [], terms: [], years: [] });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [gradesRes, termsRes, yearsRes] = await Promise.all([
          api.get('/api/settings/classes/'),
          api.get('/api/settings/terms/'),
          api.get('/api/settings/academic-years/')
        ]);
        setOptions({
          grades: gradesRes.results || gradesRes || [],
          terms: termsRes.results || termsRes || [],
          years: yearsRes.results || yearsRes || []
        });
      } catch (e) {
        console.error('Failed to load options', e);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.grade || !formData.term || !formData.academic_year) {
        toast.error("Please select Grade, Year, and Term");
        return;
    }
    
    setSaving(true);
    let successCount = 0;
    
    for (let i = 0; i < selectedIds.length; i++) {
        const studentId = selectedIds[i];
        setProgress({ current: i + 1, total: selectedIds.length });
        
        try {
            // Fetch current active enrollment
            const res = await api.get(`/api/settings/enrollments/?student_id=${studentId}&is_active=true`);
            const activeEnrs = res.results || res || [];
            
            if (activeEnrs.length > 0) {
                const targetEnrollment = activeEnrs[0];
                
                // If setting as active, explicitly deactivate others first
                if (formData.is_active) {
                    const others = activeEnrs.filter(enr => enr.id !== targetEnrollment.id);
                    await Promise.all(others.map(enr => api.patch(`/api/settings/enrollments/${enr.id}/`, { is_active: false })));
                }
                
                // Patch the target enrollment
                await api.patch(`/api/settings/enrollments/${targetEnrollment.id}/`, {
                    grade_id: formData.grade,
                    term_id: formData.term,
                    academic_year_id: formData.academic_year,
                    status: formData.status,
                    is_active: formData.is_active
                });
                successCount++;
            } else {
                console.warn(`No active enrollment found for student ID ${studentId} to edit.`);
            }
        } catch (err) {
            console.error(`Failed to update student ${studentId}`, err);
        }
    }
    
    setSaving(false);
    toast.success(`Successfully updated ${successCount} out of ${selectedIds.length} students`);
    onSuccess();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Bulk Edit Billing Context" maxWidth="md" accentColor="bg-indigo-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 text-amber-800 p-3 rounded text-xs border border-amber-200">
          <strong>Warning:</strong> You are about to update the billing context for <strong>{selectedIds.length}</strong> students. Any students without an active enrollment will be skipped.
        </div>

        {saving && (
            <div className="bg-indigo-50 p-3 rounded text-indigo-800 text-sm font-bold flex items-center justify-between border border-indigo-100">
                <span>Updating...</span>
                <span>{progress.current} / {progress.total}</span>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
            <select
              required
              className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
              value={formData.grade}
              onChange={e => setFormData({ ...formData, grade: e.target.value })}
              disabled={saving}
            >
              <option value="">-- Select Grade --</option>
              {options.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
            <select
              required
              className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
              value={formData.academic_year}
              onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
              disabled={saving}
            >
              <option value="">-- Select Year --</option>
              {options.years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Term</label>
          <select
            required
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
            value={formData.term}
            onChange={e => setFormData({ ...formData, term: e.target.value })}
            disabled={saving}
          >
            <option value="">-- Select Term --</option>
            {options.terms
              .filter(t => !formData.academic_year || String(t.academic_year) === String(formData.academic_year))
              .map(t => <option key={t.id} value={t.id}>{t.name} ({t.academic_year_name})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            disabled={saving}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="promoted">Promoted</option>
            <option value="repeated">Repeated</option>
            <option value="transferred_out">Transferred Out</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="bulk_enrollment_is_active_tbl"
            checked={formData.is_active}
            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            disabled={saving}
          />
          <label htmlFor="bulk_enrollment_is_active_tbl" className="text-sm font-medium text-slate-700">
            Is Active (Current Billing Session)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">
            {saving ? 'Processing...' : 'Apply Bulk Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- Edit Academic Enrollment Modal (Admin Override) ---
const EditAcademicEnrollmentModal = ({ enrollment, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    grade: enrollment.grade_id || '',
    term: enrollment.term_id || '',
    academic_year: enrollment.academic_year_id || '',
    status: enrollment.status || 'active',
    is_active: enrollment.is_active !== undefined ? enrollment.is_active : true,
  });
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState({ grades: [], terms: [], years: [] });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [gradesRes, termsRes, yearsRes] = await Promise.all([
          api.get('/api/settings/classes/'),
          api.get('/api/settings/terms/'),
          api.get('/api/settings/academic-years/')
        ]);
        setOptions({
          grades: gradesRes.results || gradesRes || [],
          terms: termsRes.results || termsRes || [],
          years: yearsRes.results || yearsRes || []
        });
      } catch (e) {
        console.error('Failed to load options', e);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(enrollment.id, formData);
    setSaving(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Academic Enrollment" maxWidth="md" accentColor="bg-indigo-600">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 text-amber-800 p-3 rounded text-xs border border-amber-200">
          <strong>Warning:</strong> This directly edits the overarching Academic Session which controls the billing context.
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
            <select
              className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
              value={formData.grade}
              onChange={e => setFormData({ ...formData, grade: e.target.value })}
            >
              <option value="">-- Select Grade --</option>
              {options.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
            <select
              className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
              value={formData.academic_year}
              onChange={e => setFormData({ ...formData, academic_year: e.target.value })}
            >
              <option value="">-- Select Year --</option>
              {options.years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Term</label>
          <select
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
            value={formData.term}
            onChange={e => setFormData({ ...formData, term: e.target.value })}
          >
            <option value="">-- Select Term --</option>
            {options.terms
              .filter(t => !formData.academic_year || String(t.academic_year) === String(formData.academic_year))
              .map(t => <option key={t.id} value={t.id}>{t.name} ({t.academic_year_name})</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select
            className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="promoted">Promoted</option>
            <option value="repeated">Repeated</option>
            <option value="transferred_out">Transferred Out</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="enrollment_is_active_tbl"
            checked={formData.is_active}
            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          />
          <label htmlFor="enrollment_is_active_tbl" className="text-sm font-medium text-slate-700">
            Is Active (Current Billing Session)
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button type="submit" disabled={saving} className="px-5 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
