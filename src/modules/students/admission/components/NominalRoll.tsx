import React, { useState, useEffect } from 'react';
import { 
    Search, MapPin, Calendar, User, Download, Filter, 
    ArrowUpDown, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { api } from '../../../../services/api';

const NominalRoll = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [termFilter, setTermFilter] = useState('');

    // Sorting & Pagination State
    const [sortConfig, setSortConfig] = useState({ key: 'student_name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/settings/enrollments/?is_active=true');
            setEnrollments(Array.isArray(response) ? response : (response.results || []));
        } catch (error) {
            console.error("Failed to fetch nominal roll:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredEnrollments = enrollments.filter(enrollment => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        
        return (
            (enrollment.student_name || '').toLowerCase().includes(query) ||
            (enrollment.student_id_number || '').toLowerCase().includes(query) ||
            (enrollment.grade_name || '').toLowerCase().includes(query) ||
            (enrollment.stream_name || '').toLowerCase().includes(query)
        );
    });

    // Handle Header Sorting Click
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1); // Reset to page 1 on sort change
    };

    // Sorting Execution (using a non-mutating copy)
    const sortedEnrollments = [...filteredEnrollments].sort((a, b) => {
        if (!sortConfig.key) return 0;
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        // Case-insensitive comparisons for strings
        if (typeof aVal === 'string') aVal = aVal.toLowerCase().trim();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase().trim();

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination Computations
    const totalItems = sortedEnrollments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedEnrollments.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="space-y-6">
            <div 
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-[20px] border"
            >
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} style={{ color: 'var(--primary-color)' }} />
                    <input
                        type="text"
                        placeholder="Search student, admission no, or class..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ 
                            background: 'var(--bg-light)', 
                            borderColor: 'var(--border-color-light)', 
                            color: 'var(--text-main)',
                            paddingLeft: '3rem',
                            paddingRight: '3rem'
                        }}
                        className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold"
                    />
                </div>

                <div className="flex gap-2">
                    <button 
                        style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:text-slate-900 transition-colors text-xs font-bold cursor-pointer"
                    >
                        <Filter size={14} style={{ color: 'var(--primary-color)' }} />
                        Filter
                    </button>
                    <button 
                        style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', borderColor: 'var(--primary-light)' }}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-xs font-bold cursor-pointer"
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            <div 
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', boxShadow: 'var(--shadow-card)' }}
                className="rounded-[24px] border overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                        <thead style={{ background: 'var(--bg-light)' }}>
                            <tr>
                                {/* Sortable Student Header */}
                                <th 
                                    onClick={() => requestSort('student_name')}
                                    className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--primary-color)] transition-all select-none"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>Student</span>
                                        <ArrowUpDown size={11} className={`opacity-60 transition-colors ${sortConfig.key === 'student_name' ? 'text-indigo-600 font-black' : ''}`} />
                                    </div>
                                </th>

                                {/* Sortable Class Info Header */}
                                <th 
                                    onClick={() => requestSort('grade_name')}
                                    className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--primary-color)] transition-all select-none"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>Class Info</span>
                                        <ArrowUpDown size={11} className={`opacity-60 transition-colors ${sortConfig.key === 'grade_name' ? 'text-indigo-600 font-black' : ''}`} />
                                    </div>
                                </th>

                                {/* Sortable Stay Status Header */}
                                <th 
                                    onClick={() => requestSort('stay_status')}
                                    className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--primary-color)] transition-all select-none"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>Stay Status</span>
                                        <ArrowUpDown size={11} className={`opacity-60 transition-colors ${sortConfig.key === 'stay_status' ? 'text-indigo-600 font-black' : ''}`} />
                                    </div>
                                </th>

                                {/* Sortable Reporting Date Header */}
                                <th 
                                    onClick={() => requestSort('enrollment_date')}
                                    className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-[var(--primary-color)] transition-all select-none"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span>Reporting Date</span>
                                        <ArrowUpDown size={11} className={`opacity-60 transition-colors ${sortConfig.key === 'enrollment_date' ? 'text-indigo-600 font-black' : ''}`} />
                                    </div>
                                </th>

                                {/* Non-sortable Reason Header */}
                                <th className="px-6 py-4.5 text-left text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                    Reason
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: 'var(--border-color-light)' }}>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Loading nominal roll...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                                        No active enrollments found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div 
                                                    style={{ background: 'var(--primary-light)', color: 'var(--primary-color)' }}
                                                    className="h-8 w-8 rounded-full flex items-center justify-center font-bold mr-3"
                                                >
                                                    {(enrollment.student_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{enrollment.student_name}</div>
                                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{enrollment.student_id_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>{enrollment.grade_name}</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{enrollment.stream_name || 'No Stream'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                enrollment.stay_status === 'boarder'
                                                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                }`}>
                                                {enrollment.stay_status === 'boarder' ? 'Boarder' : 'Day Scholar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-left" style={{ color: 'var(--text-secondary)' }}>
                                            {enrollment.enrollment_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-left" style={{ color: 'var(--text-secondary)' }}>
                                            {enrollment.reporting_reason || enrollment.remarks || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls Footer */}
                <div 
                    style={{ borderColor: 'var(--border-color-light)', background: 'var(--bg-light)', color: 'var(--text-secondary)' }}
                    className="px-6 py-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-wider"
                >
                    {/* Rows per page selector and status bound */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400">Rows per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color-light)', color: 'var(--text-secondary)' }}
                            className="px-3 py-1.5 border rounded-lg outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 text-xs font-extrabold"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-[10px] text-slate-400 ml-1">
                            Showing {totalItems > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                        </span>
                    </div>

                    {/* Pagination page controllers */}
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}
                                className="p-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-45 transition-colors cursor-pointer"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                .map((page, idx, arr) => {
                                    const showEllipsisBefore = page > 2 && arr[idx - 1] !== page - 1;
                                    const showEllipsisAfter = page < totalPages - 1 && arr[idx + 1] !== page + 1;
                                    
                                    return (
                                        <React.Fragment key={page}>
                                            {showEllipsisBefore && <span className="px-2 text-slate-400 font-bold">...</span>}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                style={{
                                                    background: currentPage === page ? 'var(--primary-color)' : 'var(--card-bg)',
                                                    borderColor: currentPage === page ? 'var(--primary-color)' : 'var(--border-color-light)',
                                                    color: currentPage === page ? '#fff' : 'var(--text-secondary)'
                                                }}
                                                className="w-8 h-8 rounded-xl border text-xs font-black flex items-center justify-center transition-colors cursor-pointer"
                                            >
                                                {page}
                                            </button>
                                            {showEllipsisAfter && <span className="px-2 text-slate-400 font-bold">...</span>}
                                        </React.Fragment>
                                    );
                                })
                            }

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                style={{ borderColor: 'var(--border-color-light)', background: 'var(--card-bg)' }}
                                className="p-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-45 transition-colors cursor-pointer"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NominalRoll;
