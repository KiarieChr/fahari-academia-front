import React from 'react';

const DashboardTableContainer = ({
    children,
    title,
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    onRefresh,
    actions
}) => {
    return (
        <div className="dashboard-table-container mt-4">
            <div className="dashboard-table-header">
                <div className="dashboard-search-container">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {onRefresh && (
                        <button className="btn btn-sm btn-outline-secondary" onClick={onRefresh}>
                            Refresh
                        </button>
                    )}
                </div>
                <div className="dashboard-table-actions">
                    {actions}
                </div>
            </div>
            <div className="dashboard-table-body">
                {children}
            </div>
        </div>
    );
};

export default DashboardTableContainer;
