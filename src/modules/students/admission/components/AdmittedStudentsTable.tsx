import React, { useState, useEffect } from 'react';
import { 
    Search, Download, Printer, Loader2, X, User, Phone, Mail, 
    Calendar, Globe, Shield, FileText, Edit, BookOpen, School, 
    ChevronRight, ChevronLeft, ExternalLink, Info, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentManagementService } from '../../../../services/studentManagementService';
import { toast } from 'react-toastify';
import StudentEditModal from './StudentEditModal';
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
        <div 
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
            className="rounded-[28px] border overflow-hidden flex flex-col h-full relative"
        >
            
            {/* Header controls bar */}
            <div 
                style={{ borderColor: 'var(--border-color-light)' }}
                className="p-4 sm:p-5 md:py-5 md:px-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none" style={{ background: 'var(--primary-light)' }} />
                
                <div className="flex gap-3 items-center w-full md:w-auto">
                    <h3 className="text-[12px] font-black uppercase tracking-wider hidden md:block" style={{ color: 'var(--text-main)' }}>Admission Register</h3>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} style={{ color: 'var(--primary-color)' }} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ 
                                paddingLeft: '3.5rem', 
                                paddingRight: '3rem', 
                                background: 'var(--bg-light)', 
                                borderColor: 'var(--border-color-light)', 
                                color: 'var(--text-main)' 
                            }}
                            
                            className="w-full pl-11  py-3 border rounded-[18px] outline-none text-[12px] font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all duration-300"
                            placeholder="Search by student name or admission number..."
                        />
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                        className="flex items-center gap-2 px-4 py-2.5 border hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                    >
                        <Printer size={11} style={{ color: 'var(--primary-color)' }} /> Print List
                    </button>
                    <button 
                        style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                    >
                        <Download size={11} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Admissions table */}
            <div className="flex-1 overflow-x-auto min-h-[400px]">
                <table className="min-w-full divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-light)' }}>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Admission No</th>
                            <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Student Details</th>
                            <th className="hidden md:table-cell px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Class / Stream</th>
                            <th className="hidden lg:table-cell px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Admission Date</th>
                            <th className="hidden xl:table-cell px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Admission Type</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-24">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-10 h-10 border-4 border-slate-50 border-t-indigo-600 rounded-full animate-spin" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loading Admissions...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-24 text-center">
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
                                    className={`group/row hover:bg-slate-50/50 cursor-pointer transition-colors ${
                                        drawerStudent && drawerStudent.id === s.id ? 'bg-indigo-50/20' : ''
                                    }`}
                                    onClick={() => setDrawerStudent(s)}
                                    onDoubleClick={() => {
                                        setSelectedStudent(s.id);
                                        setShowEditModal(true);
                                    }}
                                >
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
                <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing <span className="text-slate-900 font-black">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to <span className="text-slate-900 font-black">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="text-slate-900 font-black">{totalCount}</span> admitted students
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || loading}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="hidden md:flex items-center gap-1">
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
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                            currentPage === pageNum 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
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
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all cursor-pointer"
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
                            className="w-[480px] max-w-full bg-white h-screen fixed right-0 top-0 z-[8000] shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Info size={16} className="text-indigo-600" />
                                    <h4 className="text-[12px] font-black text-slate-700 uppercase tracking-widest">Student Profile Inspect</h4>
                                </div>
                                <button 
                                    onClick={() => setDrawerStudent(null)}
                                    className="w-8 h-8 rounded-full bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-sm cursor-pointer transition-all"
                                >
                                    <X size={16} />
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
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                        <School size={12} className="text-indigo-500" /> Academic Information
                                    </h6>
                                    <div className="grid grid-cols-2 gap-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/60">
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
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                        <User size={12} className="text-indigo-500" /> Personal Demographics
                                    </h6>
                                    <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/60">
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
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                        <Shield size={12} className="text-indigo-500" /> Emergency / Guardian Details
                                    </h6>
                                    <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100/60 space-y-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Primary Parent Name</p>
                                            <p className="text-[12px] font-black text-slate-700 mt-1">
                                                {drawerStudent.guardian_name || 'N/A'} 
                                                <span className="text-[10px] font-bold text-slate-400 ml-1.5">({drawerStudent.guardian_relationship || 'Parent'})</span>
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-100">
                                                <Phone size={13} className="text-indigo-500" />
                                                <div>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                                    <p className="text-[11px] font-bold text-slate-700 mt-0.5">{drawerStudent.guardian_phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-100 overflow-hidden">
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
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedStudent(drawerStudent.id);
                                        setShowEditModal(true);
                                    }}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-100 transition-all"
                                >
                                    <Edit size={13} /> Edit Profile
                                </button>
                                <button
                                    onClick={() => handlePrintSingle(drawerStudent)}
                                    className="px-4 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
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
        </div>
    );
};

export default AdmittedStudentsTable;
