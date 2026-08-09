import React, { useState, useEffect, useCallback } from 'react';
import {
    Shield, Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
    User, Globe, Clock, Activity, AlertTriangle, AlertCircle,
    Info, LogIn, LogOut, Plus, Edit, Trash2, Eye, Download,
    Upload, CheckCircle, XCircle, MoreHorizontal, Calendar,
    ChevronDown, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { institutionService } from '../../../services/institutionService';

const ACTION_CONFIG = {
    CREATE: { icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Create' },
    UPDATE: { icon: Edit, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Update' },
    DELETE: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Delete' },
    LOGIN: { icon: LogIn, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'Login' },
    LOGOUT: { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Logout' },
    LOGIN_FAILED: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Login Failed' },
    VIEW: { icon: Eye, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'View' },
    EXPORT: { icon: Download, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Export' },
    IMPORT: { icon: Upload, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Import' },
    APPROVE: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Approve' },
    REJECT: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Reject' },
    OTHER: { icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Other' },
};

const SEVERITY_CONFIG = {
    INFO: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    WARNING: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    ERROR: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
    CRITICAL: { icon: AlertCircle, color: 'text-red-800', bg: 'bg-red-100', dot: 'bg-red-700' },
};

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        action: '',
        severity: '',
        module: '',
        date_from: '',
        date_to: '',
    });

    const PAGE_SIZE = 25;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, page_size: PAGE_SIZE };
            if (filters.search) params.search = filters.search;
            if (filters.action) params.action = filters.action;
            if (filters.severity) params.severity = filters.severity;
            if (filters.module) params.module = filters.module;
            if (filters.date_from) params.date_from = filters.date_from;
            if (filters.date_to) params.date_to = filters.date_to;

            const data = await institutionService.getAuditLogs(params);
            setLogs(data.results || data || []);
            setTotalCount(data.count || 0);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [page, filters]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({ search: '', action: '', severity: '', module: '', date_from: '', date_to: '' });
        setPage(1);
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatFullDate = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Shield size={20} className="text-indigo-500" /> Audit Trail
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {totalCount.toLocaleString()} events recorded
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Search + Filter Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search by user, description, path..."
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${showFilters
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Filter size={15} />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
                                <select
                                    value={filters.action}
                                    onChange={(e) => handleFilterChange('action', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                                >
                                    <option value="">All Actions</option>
                                    {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
                                        <option key={key} value={key}>{cfg.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Severity</label>
                                <select
                                    value={filters.severity}
                                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                                >
                                    <option value="">All Levels</option>
                                    <option value="INFO">Info</option>
                                    <option value="WARNING">Warning</option>
                                    <option value="ERROR">Error</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Module</label>
                                <input
                                    type="text"
                                    value={filters.module}
                                    onChange={(e) => handleFilterChange('module', e.target.value)}
                                    placeholder="e.g. workforce"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                                <input
                                    type="date"
                                    value={filters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                                <input
                                    type="date"
                                    value={filters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none"
                                />
                            </div>
                        </div>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <X size={12} /> Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Log Entries */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw size={24} className="mx-auto text-indigo-400 animate-spin mb-3" />
                        <p className="text-sm text-gray-500">Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Shield size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">No audit logs found</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map(log => {
                            const actionCfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.OTHER;
                            const severityCfg = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.INFO;
                            const ActionIcon = actionCfg.icon;
                            const isExpanded = expandedId === log.id;

                            return (
                                <div
                                    key={log.id}
                                    className={`group transition-colors ${isExpanded ? 'bg-gray-50/50' : 'hover:bg-gray-50/30'}`}
                                >
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                        className="w-full text-left px-5 py-4 flex items-start gap-4"
                                    >
                                        {/* Action Icon */}
                                        <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${actionCfg.bg} ${actionCfg.border} border flex items-center justify-center mt-0.5`}>
                                            <ActionIcon size={16} className={actionCfg.color} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {log.description || `${actionCfg.label} on ${log.request_path}`}
                                                </span>
                                                {log.response_code && log.response_code >= 400 && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                                        {log.response_code}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                                                <span className="inline-flex items-center gap-1">
                                                    <User size={11} /> {log.username || 'System'}
                                                </span>
                                                {log.module && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Activity size={11} /> {log.module}
                                                    </span>
                                                )}
                                                {log.ip_address && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Globe size={11} /> {log.ip_address}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={11} /> {formatTime(log.timestamp)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right side badges */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`w-2 h-2 rounded-full ${severityCfg.dot}`} title={log.severity} />
                                            <span className={`hidden sm:inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide ${actionCfg.bg} ${actionCfg.color} ${actionCfg.border} border`}>
                                                {actionCfg.label}
                                            </span>
                                            <ChevronDown
                                                size={14}
                                                className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                    </button>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="px-5 pb-4 pl-[4.25rem]">
                                            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-gray-400 block mb-0.5">Timestamp</span>
                                                        <span className="text-gray-800 font-medium">{formatFullDate(log.timestamp)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block mb-0.5">Method</span>
                                                        <span className="text-gray-800 font-medium">{log.request_method || '—'} {log.request_path || ''}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block mb-0.5">Response Code</span>
                                                        <span className={`font-medium ${log.response_code >= 400 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                            {log.response_code || '—'}
                                                        </span>
                                                    </div>
                                                    {log.model_name && (
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">Model</span>
                                                            <span className="text-gray-800 font-medium">{log.model_name} {log.object_id ? `#${log.object_id}` : ''}</span>
                                                        </div>
                                                    )}
                                                    {log.object_repr && (
                                                        <div>
                                                            <span className="text-gray-400 block mb-0.5">Object</span>
                                                            <span className="text-gray-800 font-medium">{log.object_repr}</span>
                                                        </div>
                                                    )}
                                                    {log.user_agent && (
                                                        <div className="col-span-full">
                                                            <span className="text-gray-400 block mb-0.5">User Agent</span>
                                                            <span className="text-gray-600 font-mono text-[10px] break-all">{log.user_agent}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {log.changes && (
                                                    <div>
                                                        <span className="text-gray-400 text-xs block mb-1">Changes</span>
                                                        <pre className="bg-gray-50 rounded-lg p-3 text-[11px] text-gray-700 font-mono overflow-x-auto max-h-40">
                                                            {JSON.stringify(log.changes, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <p className="text-xs text-gray-500">
                            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${page === pageNum
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogViewer;
