import React, { useState, useEffect } from 'react';
import { 
    Eye, Check, X, Search, Filter, ChevronLeft, ChevronRight, 
    ArrowUpDown, Calendar, ChevronDown, LayoutGrid, List, 
    SlidersHorizontal, User, Phone, Mail, Sparkles, BookOpen, 
    School, ArrowRight, RefreshCw, Grab, Trash2, Plus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

import ApplicationDetailsModal from './ApplicationDetailsModal';
import ExistingParentDialog from './ExistingParentDialog';
import DirectAdmissionModal from './DirectAdmissionModal';
import LazyImage from '../../../../components/common/LazyImage';
import { useAdmission } from '../AdmissionContext';

import { studentManagementService } from '../../../../services/studentManagementService';

const KANBAN_COLUMNS = [
    { id: 'pending', title: 'Pending Review', color: 'indigo', rgb: '99, 102, 241' },
    { id: 'interview', title: 'Interview Scheduled', color: 'amber', rgb: '245, 158, 11' },
    { id: 'waitlist', title: 'Waitlisted', color: 'purple', rgb: '139, 92, 246' },
    { id: 'accepted', title: 'Accepted', color: 'emerald', rgb: '16, 185, 129' },
    { id: 'rejected', title: 'Rejected', color: 'rose', rgb: '244, 63, 94' }
];

const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        if (diffSecs < 60) return 'Just now';
        const diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        return 'N/A';
    }
};

const ApplicationsTable = () => {
    const { openNewApplicant } = useAdmission();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApp, setSelectedApp] = useState(null);
    
    // View state: 'table' or 'kanban'
    const [viewMode, setViewMode] = useState('table');
    
    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Existing-parent dialog state
    const [parentDialogOpen, setParentDialogOpen] = useState(false);
    const [parentInfo, setParentInfo] = useState(null);

    // Filter UI States
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [pendingAdmitApp, setPendingAdmitApp] = useState(null);
    const [admitting, setAdmitting] = useState(false);
    const [isDirectAdmitOpen, setIsDirectAdmitOpen] = useState(false);

    // Dynamic Filter State
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [selectedCurriculum, setSelectedCurriculum] = useState('All');
    const [selectedGender, setSelectedGender] = useState('All');

    // Row Selection State for checkboxes
    const [selectedRows, setSelectedRows] = useState([]);

    // Dynamic Filter Data
    const [grades, setGrades] = useState([]);
    const [curriculums, setCurriculums] = useState([]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await studentManagementService.getApplications();
            const rawList = data.results || data || [];
            
            // Normalize data to avoid field mismatch reference errors
            const normalized = rawList.map(app => {
                const student_name = app.student_name || app.full_name || `${app.first_name || ''} ${app.last_name || ''}`.trim() || `Applicant #${app.id}`;
                const status = app.status || (app.application_status ? app.application_status.charAt(0).toUpperCase() + app.application_status.slice(1) : 'Pending');
                const guardian_phone = app.phone_number || app.guardian_phone || 'N/A';
                const guardian_email = app.email || app.guardian_email || 'N/A';
                
                return {
                    ...app,
                    student_name,
                    status,
                    guardian_phone,
                    guardian_email
                };
            });
            setApps(normalized);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const loadFilterData = async () => {
        try {
            const [classesData, curriculumsData] = await Promise.all([
                studentManagementService.getClasses(),
                studentManagementService.getCurriculums()
            ]);
            setGrades(classesData.results || classesData || []);
            setCurriculums(curriculumsData.results || curriculumsData || []);
        } catch (error) {
            console.error('Failed to load filter choices:', error);
        }
    };

    useEffect(() => {
        fetchApplications();
        loadFilterData();
    }, []);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Advanced Filtering & Sorting Logic
    const filteredAndSortedApps = apps
        .filter(app => {
            const matchesSearch = (
                app.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.id.toString().includes(searchTerm) ||
                (app.guardian_phone && app.guardian_phone.includes(searchTerm))
            );
            
            const matchesStatus = statusFilter === 'All' || app.application_status === statusFilter.toLowerCase();
            
            const matchesGrade = selectedGrade === 'All' || 
                (app.applying_for_grade?.toString() === selectedGrade || app.grade_name === selectedGrade);
                
            const matchesCurriculum = selectedCurriculum === 'All' || 
                (app.applying_for_curriculum?.toString() === selectedCurriculum || app.curriculum_name === selectedCurriculum);
                
            const matchesGender = selectedGender === 'All' || app.gender === selectedGender;
            
            let matchesDate = true;
            if (dateRange.start) {
                matchesDate = matchesDate && new Date(app.created_at) >= new Date(dateRange.start);
            }
            if (dateRange.end) {
                matchesDate = matchesDate && new Date(app.created_at) <= new Date(dateRange.end + 'T23:59:59');
            }

            return matchesSearch && matchesStatus && matchesGrade && matchesCurriculum && matchesGender && matchesDate;
        })
        .sort((a, b) => {
            if (!sortConfig.key) return 0;
            const aVal = a[sortConfig.key] || '';
            const bVal = b[sortConfig.key] || '';
            
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAndSortedApps.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAndSortedApps.length / itemsPerPage);

    const proceedWithAdmission = async (applicationId, extraData = {}) => {
        const toastId = toast.loading('Admitting student...');
        try {
            setAdmitting(true);
            await studentManagementService.admitApplicant(applicationId, extraData);
            toast.success('Student Admitted Successfully', { id: toastId });
            setParentDialogOpen(false);
            setPendingAdmitApp(null);
            setParentInfo(null);
            fetchApplications();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Admission failed', { id: toastId });
        } finally {
            setAdmitting(false);
        }
    };

    const handleAction = async (app, action) => {
        try {
            if (action === 'Admit') {
                const guardianEmail = app.guardian_email;
                if (guardianEmail && guardianEmail !== 'N/A') {
                    try {
                        const result = await studentManagementService.checkGuardianEmail(guardianEmail);
                        if (result.exists) {
                            setParentInfo(result);
                            setPendingAdmitApp(app);
                            setParentDialogOpen(true);
                            return;
                        }
                    } catch (checkError) {
                        console.warn('Guardian email check failed:', checkError);
                    }
                }
                await proceedWithAdmission(app.id);
            } else if (action === 'Reject') {
                await studentManagementService.updateApplication(app.id, { application_status: 'rejected' });
                toast.success('Application Rejected');
                fetchApplications();
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Action failed');
        }
    };

    // Drag and Drop handlers for Kanban Board
    const handleDragStart = (e, appId) => {
        e.dataTransfer.setData('text/plain', appId.toString());
        e.currentTarget.classList.add('opacity-40');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('opacity-40');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetStatus) => {
        e.preventDefault();
        const appId = e.dataTransfer.getData('text/plain');
        const app = apps.find(a => a.id.toString() === appId);
        if (!app) return;

        if (app.application_status === targetStatus) return;

        if (targetStatus === 'accepted') {
            handleAction(app, 'Admit');
        } else if (targetStatus === 'rejected') {
            handleAction(app, 'Reject');
        } else {
            const toastId = toast.loading(`Moving to ${targetStatus}...`);
            try {
                await studentManagementService.updateApplication(app.id, { application_status: targetStatus });
                toast.success(`Application updated to ${targetStatus}`, { id: toastId });
                fetchApplications();
            } catch (error) {
                console.error(error);
                toast.error('Failed to change status', { id: toastId });
            }
        }
    };



    return (
        <div className="space-y-6 relative">
            {/* Header & Main Controls Bar */}
            <div 
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                className="p-4 sm:p-5 rounded-[24px] sm:rounded-[32px] border relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" style={{ background: 'var(--primary-light)' }} />
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative">
                    {/* Search Bar */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                            <Search className="text-slate-400 group-focus-within:text-[var(--primary-color)] transition-all duration-300" size={16} style={{ color: 'var(--primary-color)' }} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search applications by name, ID, or guardian phone..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            style={{ 
                                paddingLeft: '3.5rem', 
                                paddingRight: '3rem', 
                                background: 'var(--bg-light)', 
                                borderColor: 'var(--border-color-light)', 
                                color: 'var(--text-main)' 
                            }}
                            className="w-full py-3 border rounded-[20px] focus:ring-[4px] focus:ring-[var(--primary-color)]/15 focus:border-[var(--primary-color)]/40 outline-none transition-all duration-300 font-bold text-[13px] placeholder:text-slate-400"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 inset-y-0 flex items-center text-slate-300 hover:text-rose-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* New Applicant Trigger Button */}
                    <button
                        onClick={openNewApplicant}
                        style={{ 
                            background: 'var(--primary-light)', 
                            color: 'var(--primary-color)',
                            borderColor: 'var(--primary-light)'
                        }}
                        className="whitespace-nowrap px-5 py-3 border font-extrabold rounded-[20px] text-xs shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 self-start sm:self-auto hover:opacity-90"
                    >
                        <Plus size={14} />
                        <span>New Applicant</span>
                    </button>

                    {/* Direct Admission Trigger Button */}
                    <button
                        onClick={() => setIsDirectAdmitOpen(true)}
                        style={{ background: 'var(--primary-color)' }}
                        className="whitespace-nowrap px-5 py-3 text-white font-extrabold rounded-[20px] text-xs shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Sparkles size={14} className="animate-pulse text-indigo-200" />
                        <span>Direct Admission</span>
                    </button>

                    {/* View Switcher Toggle */}
                    <div 
                        style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)' }}
                        className="flex items-center p-2 rounded-[18px] border self-start sm:self-auto"
                    >
                        <button
                            onClick={() => setViewMode('table')}
                            style={viewMode === 'table' ? {
                                background: 'var(--card-bg)',
                                color: 'var(--primary-color)'
                            } : {
                                color: 'var(--text-secondary)'
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                                viewMode === 'table' ? 'shadow-sm' : ''
                            }`}
                            title="Table View"
                         >
                            <List size={15} />
                            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            style={viewMode === 'kanban' ? {
                                background: 'var(--card-bg)',
                                color: 'var(--primary-color)'
                            } : {
                                color: 'var(--text-secondary)'
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                                viewMode === 'kanban' ? 'shadow-sm' : ''
                            }`}
                            title="Kanban Board"
                        >
                            <LayoutGrid size={15} />
                            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Kanban</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Executive Filters Bar */}
            <div 
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                className="p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border relative"
            >
                <div 
                    className="relative"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        alignItems: 'end'
                    }}
                >
                    
                    {/* Status Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Filter size={12} style={{ color: 'var(--primary-color)' }} /> Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-semibold shadow-inner cursor-pointer"
                        >
                            <option value="All" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>All Statuses</option>
                            <option value="Pending" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Pending Review</option>
                            <option value="Interview" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Interview Scheduled</option>
                            <option value="Waitlist" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Waitlisted</option>
                            <option value="Accepted" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Accepted</option>
                            <option value="Rejected" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Rejected</option>
                        </select>
                    </div>

                    {/* Target Grade Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <School size={12} style={{ color: 'var(--primary-color)' }} /> Target Grade
                        </label>
                        <select
                            value={selectedGrade}
                            onChange={(e) => { setSelectedGrade(e.target.value); setCurrentPage(1); }}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-semibold shadow-inner cursor-pointer"
                        >
                            <option value="All" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>All Grades</option>
                            {grades.map(grade => (
                                <option key={grade.id} value={grade.name || grade.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{grade.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Curriculum Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <BookOpen size={12} style={{ color: 'var(--primary-color)' }} /> Target Curriculum
                        </label>
                        <select
                            value={selectedCurriculum}
                            onChange={(e) => { setSelectedCurriculum(e.target.value); setCurrentPage(1); }}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-semibold shadow-inner cursor-pointer"
                        >
                            <option value="All" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>All Curricula</option>
                            {curriculums.map(curr => (
                                <option key={curr.id} value={curr.name || curr.id} style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>{curr.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Gender Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <User size={12} style={{ color: 'var(--primary-color)' }} /> Gender
                        </label>
                        <select
                            value={selectedGender}
                            onChange={(e) => { setSelectedGender(e.target.value); setCurrentPage(1); }}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-semibold shadow-inner cursor-pointer"
                        >
                            <option value="All" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>All Genders</option>
                            <option value="M" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Boys</option>
                            <option value="F" style={{ background: 'var(--card-bg)', color: 'var(--text-main)' }}>Girls</option>
                        </select>
                    </div>

                    {/* Start Date Filter */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Calendar size={12} style={{ color: 'var(--primary-color)' }} /> Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => { setDateRange({ ...dateRange, start: e.target.value }); setCurrentPage(1); }}
                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                            className="w-full px-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-semibold shadow-inner cursor-pointer"
                        />
                    </div>

                    {/* End Date Filter */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <Calendar size={12} style={{ color: 'var(--primary-color)' }} /> End Date
                        </label>
                        <div className="relative flex items-center w-full">
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => { setDateRange({ ...dateRange, end: e.target.value }); setCurrentPage(1); }}
                                style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-main)' }}
                                className="w-full px-4 py-2.5 border rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-semibold shadow-inner cursor-pointer"
                            />
                        </div>
                    </div>

                </div>

                {/* Reset Filters Panel */}
                {(statusFilter !== 'All' || selectedGrade !== 'All' || selectedCurriculum !== 'All' || selectedGender !== 'All' || dateRange.start || dateRange.end) && (
                    <div className="mt-4 pt-4 border-t flex justify-end" style={{ borderColor: 'var(--border-color-light)' }}>
                        <button
                            onClick={() => {
                                setStatusFilter('All');
                                setSelectedGrade('All');
                                setSelectedCurriculum('All');
                                setSelectedGender('All');
                                setDateRange({ start: '', end: '' });
                                setCurrentPage(1);
                            }}
                            style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', borderColor: 'var(--primary-light)' }}
                            className="px-5 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-sm"
                        >
                            <Trash2 size={12} /> Clear Active Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Layout with Quick Filters Sidebar & Main Content */}
            <div className="flex gap-6 items-start relative min-h-[500px]">
                
                {/* Main Content Area */}
                <div className="flex-1 w-full overflow-hidden transition-all duration-300">
                    <AnimatePresence mode="wait">
                        {viewMode === 'table' ? (
                            // Standard Table View
                            <motion.div
                                key="table-view"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                                className="rounded-[28px] border overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                        <thead>
                                            <tr style={{ background: 'transparent', borderBottom: '1px solid var(--border-color-light)' }}>
                                                <th className="px-4 py-4 text-center w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-opacity-20 cursor-pointer"
                                                        checked={currentItems.length > 0 && currentItems.every(app => selectedRows.includes(app.id))}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                const newSelections = [...selectedRows];
                                                                currentItems.forEach(app => {
                                                                    if (!newSelections.includes(app.id)) {
                                                                        newSelections.push(app.id);
                                                                    }
                                                                });
                                                                setSelectedRows(newSelections);
                                                            } else {
                                                                const itemIds = currentItems.map(app => app.id);
                                                                setSelectedRows(selectedRows.filter(id => !itemIds.includes(id)));
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                <th onClick={() => requestSort('student_name')} className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
                                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                                                    onMouseLeave={e => e.currentTarget.style.color = ''}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>APPLICANT</span>
                                                        <ArrowUpDown size={11} className="opacity-60" />
                                                    </div>
                                                </th>
                                                <th onClick={() => requestSort('guardian_email')} className="hidden sm:table-cell px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
                                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                                                    onMouseLeave={e => e.currentTarget.style.color = ''}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>CONTACT</span>
                                                        <ArrowUpDown size={11} className="opacity-60" />
                                                    </div>
                                                </th>
                                                <th onClick={() => requestSort('county')} className="hidden lg:table-cell px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
                                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                                                    onMouseLeave={e => e.currentTarget.style.color = ''}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>CITY</span>
                                                        <ArrowUpDown size={11} className="opacity-60" />
                                                    </div>
                                                </th>
                                                <th onClick={() => requestSort('created_at')} className="hidden md:table-cell px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
                                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                                                    onMouseLeave={e => e.currentTarget.style.color = ''}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>LAST ACTIVE</span>
                                                        <ArrowUpDown size={11} className="opacity-60" />
                                                    </div>
                                                </th>
                                                <th onClick={() => requestSort('grade_name')} className="hidden lg:table-cell px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
                                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--primary-color)'}
                                                    onMouseLeave={e => e.currentTarget.style.color = ''}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <span>TARGET GRADE</span>
                                                        <ArrowUpDown size={11} className="opacity-60" />
                                                    </div>
                                                </th>
                                                <th className="hidden sm:table-cell px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
                                                    <span>STATUS</span>
                                                </th>
                                                <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                    <span>ACTIONS</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="8" className="py-32">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="relative">
                                                                <div className="w-12 h-12 border-4 rounded-full" style={{ borderColor: 'var(--border-color-light)' }} />
                                                                <div className="absolute inset-0 w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary-color)', borderTopColor: 'transparent' }} />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Synchronizing Records...</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : currentItems.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="py-32 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="p-4 rounded-full" style={{ background: 'var(--bg-light)' }}>
                                                                <Search size={24} style={{ color: 'var(--text-muted)' }} />
                                                            </div>
                                                            <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>No applicants found matching your criteria</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : currentItems.map((app) => {
                                                const avatarBorderClass = 
                                                    app.application_status === 'accepted' ? 'border-emerald-500/40 group-hover/avatar:border-emerald-500' :
                                                    app.application_status === 'rejected' ? 'border-rose-500/40 group-hover/avatar:border-rose-500' :
                                                    app.application_status === 'interview' ? 'border-amber-500/40 group-hover/avatar:border-amber-500' :
                                                    app.application_status === 'waitlist' ? 'border-purple-500/40 group-hover/avatar:border-purple-500' :
                                                    'border-slate-300/40 dark:border-slate-700/40 group-hover/avatar:border-[var(--primary-color)]';

                                                return (
                                                    <tr key={app.id} className="group/row transition-all duration-300 hover:bg-slate-50/40 dark:hover:bg-slate-800/15" style={{ borderBottom: '1px solid var(--border-color-light)' }}>
                                                        <td className="px-4 py-5 text-center whitespace-nowrap align-middle">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.includes(app.id)}
                                                                onChange={() => {
                                                                    if (selectedRows.includes(app.id)) {
                                                                        setSelectedRows(selectedRows.filter(id => id !== app.id));
                                                                    } else {
                                                                        setSelectedRows([...selectedRows, app.id]);
                                                                    }
                                                                }}
                                                                className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-opacity-20 cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap relative align-middle">
                                                            {/* Smooth left accent bar */}
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover/row:bg-[var(--primary-color)] transition-all duration-300 rounded-r-md" />
                                                            
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative group/avatar">
                                                                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm transition-transform group-hover/avatar:scale-105">
                                                                        <LazyImage 
                                                                            src={app.student_image} 
                                                                            alt={app.student_name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className={`absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                                                                        app.is_new ? 'bg-emerald-500 border-white dark:border-slate-900' : 'bg-slate-300 dark:bg-slate-600 border-white dark:border-slate-900'
                                                                    }`} />
                                                                </div>
                                                                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 transition-colors">
                                                                    {app.student_name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="hidden sm:table-cell px-6 py-5 whitespace-nowrap align-middle">
                                                            <div className="flex flex-col text-left">
                                                                <a 
                                                                    href={`mailto:${app.guardian_email}`}
                                                                    className="text-[13px] text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium block"
                                                                >
                                                                    {app.guardian_email || 'N/A'}
                                                                </a>
                                                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                                                                    {app.guardian_phone || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="hidden lg:table-cell px-6 py-5 whitespace-nowrap align-middle">
                                                            <span className="text-[13px] text-slate-600 dark:text-slate-300 font-medium">
                                                                {app.county || app.city || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="hidden md:table-cell px-6 py-5 whitespace-nowrap align-middle">
                                                            <span className="text-[13px] text-slate-600 dark:text-slate-300 font-medium">
                                                                {getRelativeTime(app.created_at)}
                                                            </span>
                                                        </td>
                                                        <td className="hidden lg:table-cell px-6 py-5 whitespace-nowrap align-middle">
                                                            <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                                                                {app.grade_name || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="hidden sm:table-cell px-6 py-5 whitespace-nowrap text-center align-middle">
                                                            {(() => {
                                                                const statusStyles = {
                                                                    accepted: { bg: 'rgba(16,185,129,0.1)', color: '#059669', border: 'rgba(16,185,129,0.2)' },
                                                                    rejected: { bg: 'rgba(239,68,68,0.1)',  color: '#dc2626', border: 'rgba(239,68,68,0.2)' },
                                                                    interview: { bg: 'rgba(245,158,11,0.1)', color: '#d97706', border: 'rgba(245,158,11,0.2)' },
                                                                    waitlist: { bg: 'rgba(139,92,246,0.1)', color: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
                                                                };
                                                                const s = statusStyles[app.application_status] || { bg: 'var(--bg-light)', color: 'var(--text-muted)', border: 'var(--border-color-light)' };
                                                                return (
                                                                    <span
                                                                        className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border"
                                                                        style={{ background: s.bg, color: s.color, borderColor: s.border }}
                                                                    >
                                                                        {app.status}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-right align-middle">
                                                            <div className="flex items-center justify-end gap-2 opacity-50 group-hover/row:opacity-100 transition-all duration-300 translate-x-2 group-hover/row:translate-x-0">
                                                                <button 
                                                                    onClick={() => setSelectedApp(app)}
                                                                    style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                                    className="p-2 hover:bg-[var(--primary-light)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)]/30 rounded-xl border shadow-sm transition-all cursor-pointer"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                {app.application_status === 'pending' && (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => handleAction(app, 'Admit')}
                                                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                                            className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30 rounded-xl border shadow-sm transition-all cursor-pointer"
                                                                            title="Accept"
                                                                        >
                                                                            <Check size={16} />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleAction(app, 'Reject')}
                                                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                                            className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/30 rounded-xl border shadow-sm transition-all cursor-pointer"
                                                                            title="Reject"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div
                                    className="p-6 sm:p-8 border-t flex justify-between items-center"
                                    style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)' }}
                                >
                                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                        Showing{' '}
                                        <span className="font-black" style={{ color: 'var(--text-main)' }}>{indexOfFirstItem + 1}</span>{' '}to{' '}
                                        <span className="font-black" style={{ color: 'var(--text-main)' }}>{Math.min(indexOfLastItem, filteredAndSortedApps.length)}</span>{' '}of{' '}
                                        <span className="font-black" style={{ color: 'var(--text-main)' }}>{filteredAndSortedApps.length}</span> applicants
                                    </p>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer disabled:opacity-40"
                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-muted)' }}
                                            onMouseEnter={e => { if (currentPage !== 1) { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer disabled:opacity-40"
                                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-muted)' }}
                                            onMouseEnter={e => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            // Executive Kanban Board View
                            <motion.div
                                key="kanban-view"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.25 }}
                                className="w-full overflow-x-auto pb-4"
                            >
                                <div className="flex gap-5 min-w-[1200px] h-[650px] items-stretch">
                                    {KANBAN_COLUMNS.map(col => {
                                        const columnApps = filteredAndSortedApps.filter(app => app.application_status === col.id);
                                        
                                        return (
                                            <div
                                                key={col.id}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, col.id)}
                                                style={{
                                                    background: `rgba(${col.rgb}, 0.035)`,
                                                    borderColor: `rgba(${col.rgb}, 0.12)`
                                                }}
                                                className="flex-1 flex flex-col rounded-[24px] border p-4 transition-all duration-300"
                                            >
                                                {/* Column Header */}
                                                <div className="flex items-center justify-between mb-4 px-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full" style={{ background: `rgb(${col.rgb})` }} />
                                                        <h4 className="text-[11px] font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>{col.title}</h4>
                                                    </div>
                                                    <span 
                                                        className="px-2 py-0.5 rounded-full text-[10px] font-black"
                                                        style={{
                                                            background: `rgba(${col.rgb}, 0.12)`,
                                                            color: `rgb(${col.rgb})`
                                                        }}
                                                    >
                                                        {columnApps.length}
                                                    </span>
                                                </div>

                                                {/* Column Content */}
                                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                                                    {loading ? (
                                                        <div className="h-full flex items-center justify-center">
                                                            <div className="w-6 h-6 border-2 border-[var(--border-color-light)] border-t-[var(--primary-color)] rounded-full animate-spin" />
                                                        </div>
                                                    ) : columnApps.length === 0 ? (
                                                        <div
                                                            className="h-28 rounded-2xl border border-dashed flex items-center justify-center text-center p-4"
                                                            style={{ borderColor: 'var(--border-color-light)' }}
                                                        >
                                                            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Drop here</p>
                                                        </div>
                                                    ) : (
                                                        columnApps.map(app => (
                                                            <motion.div
                                                                layoutId={`kanban-card-${app.id}`}
                                                                key={app.id}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, app.id)}
                                                                onDragEnd={handleDragEnd}
                                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)' }}
                                                                className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-grab active:cursor-grabbing relative group/card overflow-hidden"
                                                                whileHover={{ y: -3 }}
                                                            >
                                                                {/* Left status accent bar */}
                                                                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `rgb(${col.rgb})` }} />

                                                                {/* Grab handle indicator */}
                                                                <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                                                                    <Grab size={13} />
                                                                </div>

                                                                <div className="space-y-3 pl-1">
                                                                    {/* Grade & Curriculum badge */}
                                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                                        <span 
                                                                            className="inline-block px-2 py-0.5 border rounded-md text-[9px] font-black uppercase tracking-wider"
                                                                            style={{ background: 'var(--bg-light)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                                                                        >
                                                                            {app.grade_name || 'N/A'}
                                                                        </span>
                                                                        <span 
                                                                            className="inline-block px-2 py-0.5 border rounded-md text-[9px] font-black uppercase tracking-wider"
                                                                            style={{
                                                                                background: `rgba(${col.rgb}, 0.08)`,
                                                                                borderColor: `rgba(${col.rgb}, 0.15)`,
                                                                                color: `rgb(${col.rgb})`
                                                                            }}
                                                                        >
                                                                            {app.curriculum_name || 'Standard'}
                                                                        </span>
                                                                    </div>

                                                                    {/* Student Name */}
                                                                    <div>
                                                                        <h5 className="text-[12px] font-black hover:text-[var(--primary-color)] transition-colors" style={{ color: 'var(--text-main)' }}>
                                                                            {app.student_name}
                                                                        </h5>
                                                                        <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>Ref: #{app.id}</p>
                                                                    </div>

                                                                    {/* Guardian Summary */}
                                                                    <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <User size={10} style={{ color: 'var(--text-muted)' }} />
                                                                            <span className="font-bold truncate max-w-[140px]">{app.guardian_name || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Phone size={10} style={{ color: 'var(--text-muted)' }} />
                                                                            <span className="font-medium">{app.guardian_phone}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Interactive Actions footer */}
                                                                    <div className="pt-2.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color-light)' }}>
                                                                        <button
                                                                            onClick={() => setSelectedApp(app)}
                                                                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider hover:opacity-80 cursor-pointer"
                                                                            style={{ color: 'var(--primary-color)' }}
                                                                        >
                                                                            Details <ArrowRight size={10} />
                                                                        </button>
                                                                        
                                                                        {/* Dropdown status update menu for visual control / mobile backup */}
                                                                        <div className="relative group/menu">
                                                                            <button 
                                                                                className="p-1 rounded-md transition-all cursor-pointer hover:bg-[var(--bg-light)]"
                                                                                style={{ color: 'var(--text-muted)' }}
                                                                                title="Change status"
                                                                            >
                                                                                <ChevronDown size={12} />
                                                                            </button>
                                                                            
                                                                            <div 
                                                                                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                                                                                className="absolute right-0 bottom-full mb-1 w-44 rounded-xl border shadow-xl opacity-0 scale-90 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:pointer-events-auto transition-all duration-200 z-20"
                                                                            >
                                                                                <div className="p-1 text-left">
                                                                                    <p className="px-2 py-1 text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Move to:</p>
                                                                                    {KANBAN_COLUMNS.filter(c => c.id !== app.application_status).map(c => (
                                                                                        <button
                                                                                            key={c.id}
                                                                                            onClick={async () => {
                                                                                                if (c.id === 'accepted') handleAction(app, 'Admit');
                                                                                                else if (c.id === 'rejected') handleAction(app, 'Reject');
                                                                                                else {
                                                                                                    try {
                                                                                                        await studentManagementService.updateApplication(app.id, { application_status: c.id });
                                                                                                        toast.success(`Application moved to ${c.title}`);
                                                                                                        fetchApplications();
                                                                                                    } catch {
                                                                                                        toast.error('Failed to move');
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                            style={{ color: 'var(--text-secondary)' }}
                                                                                            className="w-full text-left px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all hover:bg-[var(--bg-light)] cursor-pointer"
                                                                                        >
                                                                                            {c.title}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>


            </div>

            {/* Details Modal */}
            <ApplicationDetailsModal 
                app={selectedApp} 
                onClose={() => setSelectedApp(null)} 
                onAdmit={(app) => {
                    setSelectedApp(null);
                    handleAction(app, 'Admit');
                }}
                onStatusChange={async (app, newStatus) => {
                    try {
                        if (newStatus === 'accepted') {
                            setSelectedApp(null);
                            handleAction(app, 'Admit');
                        } else if (newStatus === 'rejected') {
                            setSelectedApp(null);
                            handleAction(app, 'Reject');
                        } else {
                            await studentManagementService.updateApplication(app.id, { application_status: newStatus });
                            toast.success(`Application status updated to ${newStatus.toUpperCase()}`);
                            fetchApplications();
                            setSelectedApp(null);
                        }
                    } catch (error) {
                        toast.error('Failed to update status');
                    }
                }}
            />

            {/* Existing Parent Dialog */}
            <ExistingParentDialog
                isOpen={parentDialogOpen}
                onClose={() => { setParentDialogOpen(false); setPendingAdmitApp(null); }}
                parentInfo={parentInfo}
                onUseExisting={(id) => proceedWithAdmission(pendingAdmitApp.id, { existing_parent_user_id: id })}
                onCreateNew={() => proceedWithAdmission(pendingAdmitApp.id)}
                loading={admitting}
            />

            {/* Direct Admission Modal */}
            <DirectAdmissionModal
                isOpen={isDirectAdmitOpen}
                onClose={() => {
                    setIsDirectAdmitOpen(false);
                    fetchApplications();
                }}
                apps={apps}
            />
        </div>
    );
};

export default ApplicationsTable;
