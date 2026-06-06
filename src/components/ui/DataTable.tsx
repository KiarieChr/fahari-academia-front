// Enterprise DataTable Component
// Features: Search, Filter, Sort, Pagination, Export, Column Visibility

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Download, ChevronLeft, ChevronRight,
    ChevronUp, ChevronDown, MoreHorizontal, Eye, EyeOff,
    RefreshCw, Settings2, FileSpreadsheet, FileText
} from 'lucide-react';
import './styles.css';

const DataTable = ({
    columns = [],
    data = [],
    loading = false,
    pagination = null,
    onPageChange,
    onSearch,
    onSort,
    onFilter,
    onExport,
    onRefresh,
    searchPlaceholder = "Search...",
    emptyMessage = "No data found",
    emptyIcon = null,
    rowActions,
    selectable = false,
    onSelectionChange,
    stickyHeader = true,
    compact = false,
    striped = true,
    hoverable = true,
    bordered = false,
    showColumnToggle = true,
    showExport = true,
    showRefresh = true,
    filters = [],
    className = "",
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [visibleColumns, setVisibleColumns] = useState(
        columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible !== false }), {})
    );
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    // Debounced search
    const handleSearch = useCallback((value) => {
        setSearchTerm(value);
        if (onSearch) {
            const timeoutId = setTimeout(() => onSearch(value), 300);
            return () => clearTimeout(timeoutId);
        }
    }, [onSearch]);

    // Sort handling
    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
        if (onSort) onSort(key, direction);
    };

    // Selection handling
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(data.map(row => row.id));
            setSelectedRows(allIds);
            onSelectionChange?.(Array.from(allIds));
        } else {
            setSelectedRows(new Set());
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (id) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
        onSelectionChange?.(Array.from(newSelected));
    };

    // Column toggle
    const toggleColumn = (key) => {
        setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Filter columns
    const visibleColumnsList = useMemo(() =>
        columns.filter(col => visibleColumns[col.key]),
        [columns, visibleColumns]
    );

    // Export handlers
    const handleExport = (format) => {
        setShowExportMenu(false);
        if (onExport) onExport(format, data, visibleColumnsList);
    };

    const tableClasses = [
        'data-table',
        compact && 'data-table--compact',
        striped && 'data-table--striped',
        hoverable && 'data-table--hoverable',
        bordered && 'data-table--bordered',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="data-table-container">
            {/* Toolbar */}
            <div className="data-table-toolbar">
                <div className="data-table-toolbar-left">
                    {/* Search */}
                    <div className="data-table-search">
                        <Search size={18} className="data-table-search-icon" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="data-table-search-input"
                        />
                    </div>

                    {/* Filters */}
                    {filters.length > 0 && (
                        <div className="data-table-filters">
                            {filters.map((filter) => (
                                <select
                                    key={filter.key}
                                    value={activeFilters[filter.key] || ''}
                                    onChange={(e) => {
                                        const newFilters = { ...activeFilters, [filter.key]: e.target.value };
                                        setActiveFilters(newFilters);
                                        onFilter?.(newFilters);
                                    }}
                                    className="data-table-filter-select"
                                >
                                    <option value="">{filter.label}</option>
                                    {filter.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ))}
                        </div>
                    )}
                </div>

                <div className="data-table-toolbar-right">
                    {/* Refresh */}
                    {showRefresh && onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="data-table-btn data-table-btn--icon"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    )}

                    {/* Column Toggle */}
                    {showColumnToggle && (
                        <div className="data-table-dropdown">
                            <button
                                onClick={() => setShowColumnMenu(!showColumnMenu)}
                                className="data-table-btn data-table-btn--icon"
                                title="Toggle columns"
                            >
                                <Settings2 size={18} />
                            </button>
                            <AnimatePresence>
                                {showColumnMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="data-table-dropdown-menu"
                                    >
                                        <div className="data-table-dropdown-header">Show Columns</div>
                                        {columns.map(col => (
                                            <label key={col.key} className="data-table-dropdown-item">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleColumns[col.key]}
                                                    onChange={() => toggleColumn(col.key)}
                                                />
                                                <span>{col.label}</span>
                                            </label>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Export */}
                    {showExport && (
                        <div className="data-table-dropdown">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="data-table-btn"
                            >
                                <Download size={18} />
                                <span>Export</span>
                            </button>
                            <AnimatePresence>
                                {showExportMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="data-table-dropdown-menu"
                                    >
                                        <button
                                            onClick={() => handleExport('csv')}
                                            className="data-table-dropdown-item"
                                        >
                                            <FileSpreadsheet size={16} />
                                            <span>Export as CSV</span>
                                        </button>
                                        <button
                                            onClick={() => handleExport('excel')}
                                            className="data-table-dropdown-item"
                                        >
                                            <FileSpreadsheet size={16} />
                                            <span>Export as Excel</span>
                                        </button>
                                        <button
                                            onClick={() => handleExport('pdf')}
                                            className="data-table-dropdown-item"
                                        >
                                            <FileText size={16} />
                                            <span>Export as PDF</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Info */}
            {selectable && selectedRows.size > 0 && (
                <div className="data-table-selection-info">
                    <span>{selectedRows.size} row(s) selected</span>
                    <button onClick={() => { setSelectedRows(new Set()); onSelectionChange?.([]); }}>
                        Clear selection
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="data-table-wrapper">
                <table className={tableClasses}>
                    <thead className={stickyHeader ? 'data-table-sticky-header' : ''}>
                        <tr>
                            {selectable && (
                                <th className="data-table-checkbox-cell">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.size === data.length && data.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {visibleColumnsList.map(col => (
                                <th
                                    key={col.key}
                                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                                    className={col.sortable !== false ? 'data-table-sortable' : ''}
                                    style={{ width: col.width, minWidth: col.minWidth }}
                                >
                                    <div className="data-table-header-content">
                                        <span>{col.label}</span>
                                        {col.sortable !== false && sortConfig.key === col.key && (
                                            sortConfig.direction === 'asc'
                                                ? <ChevronUp size={14} />
                                                : <ChevronDown size={14} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {rowActions && <th className="data-table-actions-header">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="data-table-skeleton-row">
                                    {selectable && <td><div className="skeleton skeleton-checkbox" /></td>}
                                    {visibleColumnsList.map(col => (
                                        <td key={col.key}>
                                            <div className="skeleton skeleton-text" />
                                        </td>
                                    ))}
                                    {rowActions && <td><div className="skeleton skeleton-actions" /></td>}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={visibleColumnsList.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}>
                                    <div className="data-table-empty">
                                        {emptyIcon}
                                        <p>{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <motion.tr
                                    key={row.id || rowIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: rowIndex * 0.02 }}
                                    className={selectedRows.has(row.id) ? 'data-table-row-selected' : ''}
                                >
                                    {selectable && (
                                        <td className="data-table-checkbox-cell">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.has(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                            />
                                        </td>
                                    )}
                                    {visibleColumnsList.map(col => (
                                        <td key={col.key}>
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : row[col.key]}
                                        </td>
                                    ))}
                                    {rowActions && (
                                        <td className="data-table-actions-cell">
                                            {rowActions(row)}
                                        </td>
                                    )}
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="data-table-pagination">
                    <div className="data-table-pagination-info">
                        Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                        {pagination.totalItems} entries
                    </div>
                    <div className="data-table-pagination-controls">
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            className="data-table-pagination-btn"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange?.(pageNum)}
                                    className={`data-table-pagination-btn ${pagination.currentPage === pageNum ? 'active' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="data-table-pagination-btn"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
