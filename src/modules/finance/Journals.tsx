import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Calendar,
    FileText,
    AlertCircle,
    CheckCircle2,
    History,
    Lock,
    Unlock,
    MoreVertical,
    RefreshCw,
    Paperclip,
    ExternalLink
} from 'lucide-react';
import DashboardLayout from '../../dashboard/DashboardLayout';
import { financeService } from '../../services/financeService';
import JournalEntryModal from './components/JournalEntryModal';
import JournalVoucherModal from './components/JournalVoucherModal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Journals.css';



const JournalsDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    // Date filtering - default to current month
    const getDefaultDates = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
    };

    const [dateRange, setDateRange] = useState(getDefaultDates());

    useEffect(() => {
        fetchJournals(1, true); // Reset on mount or date change
    }, [dateRange]);

    const fetchJournals = async (page = 1, reset = false) => {
        if (reset) {
            setLoading(true);
            setCurrentPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = {
                page,
                page_size: 50,
                start_date: dateRange.start,
                end_date: dateRange.end
            };

            const res = await financeService.getJournals(params);

            // Handle paginated response
            const data = res.results || [];
            const count = res.count || 0;
            const next = res.next;

            if (reset) {
                setJournals(data);
            } else {
                setJournals(prev => [...prev, ...data]);
            }

            setTotalCount(count);
            setHasMore(!!next);
            setCurrentPage(page);

        } catch (error) {
            console.error("Failed to fetch journals:", error);
            const msg = error.response?.data?.detail || error.message || "Failed to load journals";
            toast.error(msg);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        fetchJournals(currentPage + 1, false);
    };

    const handlePost = async (id) => {
        if (!window.confirm("Are you sure you want to POST this journal? This action is irreversible.")) return;
        try {
            await financeService.postJournal(id);
            toast.success("Journal Posted Successfully!");
            fetchJournals(); // Refresh to show updated status
        } catch (error) {
            const msg = error.response?.data?.message || error.message || "Failed to post journal";
            toast.error(msg);
        }
    };

    const formatKES = (val) => new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        maximumFractionDigits: 2
    }).format(val || 0);

    // Calculate stats
    const stats = {
        total: journals.length,
        posted: journals.filter(j => j.status === 'POSTED').length,
        draft: journals.filter(j => j.status === 'DRAFT').length,
    };

    const kpis = [
        { label: 'Total Journals', value: stats.total, sub: 'All entries', icon: <FileText className="text-secondary" size={20} />, status: 'info' },
        { label: 'Posted', value: stats.posted, sub: 'Committed to Ledger', icon: <CheckCircle2 className="text-success" size={20} />, status: 'success' },
        { label: 'Drafts', value: stats.draft, sub: 'Pending Review', icon: <History className="text-warning" size={20} />, status: 'warning' },
        // { label: 'Types', value: 3, sub: 'Source Types', icon: <Filter className="text-info" size={20} />, status: 'info' }
    ];

    return (
        <DashboardLayout title="Journal Entries & Adjustments">
            <div className="jr-dashboard">
                {/* Header Container */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Journal Ledger</h2>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                            <span className="d-flex align-items-center gap-1">
                                <Calendar size={14} /> Fiscal Year: **2026**
                            </span>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-primary d-flex align-items-center gap-2 px-3 shadow-sm"
                            onClick={() => setShowEntryModal(true)}
                        >
                            <Plus size={18} /> New Journal Entry
                        </button>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="row g-3 mb-4">
                    {kpis.map((kpi, idx) => (
                        <div key={idx} className="col-12 col-md-3">
                            <div className={`jr-kpi-card border-top border-4 border- ${kpi.status === 'success' ? 'border-success' : kpi.status === 'warning' ? 'border-warning' : kpi.status === 'danger' ? 'border-danger' : 'border-info'}`}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="jr-status-indicator" style={{ fontSize: '0.6rem' }}>{kpi.label}</span>
                                    {kpi.icon}
                                </div>
                                <div className="h4 fw-bold mb-1">{kpi.value}</div>
                                <div className="text-muted x-small" style={{ fontSize: '0.7rem' }}>{kpi.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Filter & Table Container */}
                <div className="jr-table-card">
                    <div className="p-3 border-bottom d-flex flex-column flex-md-row justify-content-between gap-3 bg-white">
                        <div className="d-flex gap-2 flex-wrap flex-grow-1">
                            <div className="input-group input-group-sm" style={{ maxWidth: '350px' }}>
                                <span className="input-group-text bg-light border-end-0">
                                    <Search size={16} className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Search by Ref or Description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Date Range Filter */}
                            <div className="d-flex gap-2 align-items-center">
                                <Calendar size={14} className="text-muted" />
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    style={{ maxWidth: '150px' }}
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                />
                                <span className="text-muted">to</span>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    style={{ maxWidth: '150px' }}
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-light border px-3"
                                onClick={() => fetchJournals(1, true)}
                                disabled={loading}
                            >
                                <RefreshCw size={14} className="me-1" />
                                {loading ? 'Loading...' : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        {loading ? (
                            <div className="p-5 text-center text-muted">Loading Journals...</div>
                        ) : (
                            <table className="table jr-table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Journal ID</th>
                                        <th>Date & Description</th>
                                        <th>Reference</th>
                                        <th className="text-end">Debits / Credits</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journals.filter(j =>
                                        j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        j.reference?.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map((entry) => (
                                        <tr
                                            key={entry.id}
                                            onDoubleClick={() => setSelectedEntry(entry)}
                                            style={{ cursor: 'pointer' }}
                                            className="user-select-none"
                                            title="Double click to view details"
                                        >
                                            <td>
                                                <div className="fw-bold text-primary">#{entry.id}</div>
                                            </td>
                                            <td style={{ maxWidth: '250px' }}>
                                                <div className="fw-medium text-truncate">{entry.description}</div>
                                                <div className="text-muted small">{entry.date}</div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark fw-normal border">{entry.reference}</span>
                                            </td>
                                            <td className="text-end fw-bold">
                                                {formatKES(entry.total_debit)}
                                            </td>
                                            <td>
                                                <span className={`jr-status-indicator jr-status-${(entry.status || 'draft').toLowerCase()}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex justify-content-end gap-1">
                                                    {['DRAFT'].includes(entry.status) && (
                                                        <button
                                                            className="btn btn-sm btn-success p-1 px-2 text-white small"
                                                            title="Post Journal"
                                                            onClick={() => handlePost(entry.id)}
                                                        >
                                                            POST
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {journals.length === 0 && (
                                        <tr><td colSpan="6" className="text-center p-4">No journals found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}

                        {/* Load More Button */}
                        {!loading && hasMore && (
                            <div className="p-3 text-center border-top">
                                <button
                                    className="btn btn-outline-primary btn-sm px-4"
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Load More ({journals.length} of {totalCount})
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Footer Info */}
                        {!loading && !hasMore && journals.length > 0 && (
                            <div className="p-3 text-center border-top text-muted small">
                                Showing all {journals.length} journal {journals.length === 1 ? 'entry' : 'entries'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <JournalEntryModal
                show={showEntryModal}
                onClose={() => setShowEntryModal(false)}
                onSave={() => fetchJournals(1, true)}
            />

            <JournalVoucherModal
                show={!!selectedEntry}
                entry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
            />
            <ToastContainer position="top-right" autoClose={3000} />
        </DashboardLayout>
    );
};

export default JournalsDashboard;

