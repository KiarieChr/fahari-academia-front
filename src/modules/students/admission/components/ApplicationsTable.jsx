import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-toastify';

import ApplicationDetailsModal from './ApplicationDetailsModal';
import ExistingParentDialog from './ExistingParentDialog';
import LazyImage from '../../../../components/common/LazyImage';

import { studentManagementService } from '../../../../services/studentManagementService';

const ApplicationsTable = () => {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApp, setSelectedApp] = useState(null);
    
    // Pagination & Sorting State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

    // Existing-parent dialog state
    const [parentDialogOpen, setParentDialogOpen] = useState(false);
    const [parentInfo, setParentInfo] = useState(null);
    const [pendingAdmitApp, setPendingAdmitApp] = useState(null);
    const [admitting, setAdmitting] = useState(false);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const data = await studentManagementService.getApplications();
            setApps(data.results || data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
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
                `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.id.toString().includes(searchTerm)
            );
            const matchesStatus = statusFilter === 'All' || app.application_status === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
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
                const guardianEmail = app.email || app.guardian_email;
                if (guardianEmail) {
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

    return (
        <div className="space-y-6">
            {/* Table Header / Filters */}
            <div className="p-5 md:px-6 md:py-4 bg-white rounded-[24px] border border-slate-200/60 shadow-xl shadow-slate-200/40">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-8">
                    
                    {/* Quick Search Section */}
                    <div className="w-full lg:max-w-md space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <Search size={14} className="text-indigo-500" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Quick Search</span>
                        </div>
                        <div className="relative group w-full">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner font-bold text-slate-700 text-sm placeholder:text-slate-400 placeholder:font-medium"
                            />
                        </div>
                    </div>

                    {/* Status Filter Section */}
                    <div className="w-full lg:w-auto space-y-3 overflow-hidden">
                        <div className="flex items-center gap-2 px-1">
                            <Filter size={14} className="text-indigo-500" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Status Filter</span>
                        </div>
                        {/* Premium Segmented Control */}
                        <div className="w-full overflow-x-auto hide-scrollbar pb-2 lg:pb-0 -mb-2 lg:mb-0">
                            <div className="inline-flex items-center p-1.5 bg-slate-100 border border-slate-200/60 rounded-2xl">
                                {['All', 'Pending', 'Accepted', 'Rejected'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                                        className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                                            statusFilter === status 
                                            ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50' 
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr className="bg-slate-50/30">
                            <th className="px-4 md:px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                            <th onClick={() => requestSort('id')} className="hidden lg:table-cell px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 group transition-colors">
                                <div className="flex items-center gap-2">ID <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" /></div>
                            </th>
                            <th onClick={() => requestSort('grade_name')} className="hidden md:table-cell px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 group transition-colors">
                                <div className="flex items-center gap-2">Target Class <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" /></div>
                            </th>
                            <th onClick={() => requestSort('created_at')} className="hidden xl:table-cell px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 group transition-colors">
                                <div className="flex items-center gap-2">Applied Date <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100" /></div>
                            </th>
                            <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-4 md:px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Records...</p>
                                </div>
                            </td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-20">
                                <p className="text-sm font-bold text-slate-400">No applicants found matching your criteria</p>
                            </td></tr>
                        ) : currentItems.map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group/row">
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-[14px] overflow-hidden border-2 border-white shadow-md bg-slate-100 shrink-0 group-hover/row:scale-110 transition-transform duration-500">
                                            {app.passport_photo ? (
                                                <LazyImage src={app.passport_photo} alt={app.first_name} aspectRatio="aspect-square" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 font-black text-sm md:text-lg">
                                                    {app.first_name?.[0]}{app.last_name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs md:text-sm font-black text-slate-700">{app.first_name} {app.last_name}</p>
                                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{app.gender || 'Not Specified'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 tabular-nums">#{app.id}</td>
                                <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                    <div className="px-3 py-1 bg-slate-100 rounded-lg inline-block text-[11px] font-bold text-slate-600">
                                        {app.grade_name || '-'}
                                    </div>
                                </td>
                                <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">{new Date(app.created_at).toLocaleDateString()}</td>
                                <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                        app.application_status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' :
                                        app.application_status === 'accepted' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                                        'bg-red-500/10 text-red-600 border border-red-500/20'
                                    }`}>
                                        {app.application_status}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end items-center gap-2 md:gap-3">
                                        <button 
                                            onClick={() => setSelectedApp(app)} 
                                            className="p-2 md:px-4 md:py-2 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl hover:bg-indigo-100 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                                            title="Review Details"
                                        >
                                            <Eye size={14} /> <span className="hidden sm:inline">Review</span>
                                        </button>
                                        {app.application_status === 'pending' && (
                                            <button 
                                                onClick={() => handleAction(app, 'Admit')} 
                                                className="px-3 py-2 md:px-4 md:py-2 bg-emerald-500 text-white rounded-lg md:rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all font-bold text-[10px] uppercase tracking-widest"
                                            >
                                                Admit
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900 font-black">{indexOfFirstItem + 1}</span> to <span className="text-slate-900 font-black">{Math.min(indexOfLastItem, filteredAndSortedApps.length)}</span> of <span className="text-slate-900 font-black">{filteredAndSortedApps.length}</span> applicants
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-50 transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
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
        </div>
    </div>
    );
};

export default ApplicationsTable;

