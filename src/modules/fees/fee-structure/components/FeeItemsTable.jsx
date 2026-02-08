import React, { useState } from 'react';
import { Edit2, Copy, Trash2, AlertCircle, Printer, Download } from 'lucide-react';
import { formatKES, getCategoryBadge, sortFeeItems, checkAccountMapping } from '../utils/feeStructureUtils';

const FeeItemsTable = ({
    feeItems, onEdit, onDuplicate, onDelete, canEdit, onAddItem, onPrint, onDownloadPDF,
    incomeAccounts = [], feeCategories = [],
    selectedItems = [], onSelectItems, onBulkDelete, onBulkStatus, onInlineUpdate
}) => {
    const [editingAmountId, setEditingAmountId] = useState(null);
    const [editAmountValue, setEditAmountValue] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'order', direction: 'asc' });

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectItems(feeItems.map(i => i.id));
        } else {
            onSelectItems([]);
        }
    };

    const handleSelectRow = (id) => {
        if (selectedItems.includes(id)) {
            onSelectItems(selectedItems.filter(i => i !== id));
        } else {
            onSelectItems([...selectedItems, id]);
        }
    };

    // sorting logic application
    const sortedItems = [...feeItems].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const getAccount = (accountId) => {
        return incomeAccounts.find(acc => acc.id === accountId);
    };

    const getCategory = (categoryId) => {
        return feeCategories.find(cat => cat.id === categoryId);
    };

    const calculateTotals = () => {
        const mandatory = feeItems
            .filter(item => item.mandatory && item.status === 'Active')
            .reduce((sum, item) => sum + item.amount, 0);

        const optional = feeItems
            .filter(item => !item.mandatory && item.status === 'Active')
            .reduce((sum, item) => sum + item.amount, 0);

        return { mandatory, optional, total: mandatory + optional };
    };

    const totals = calculateTotals();

    if (!feeItems || feeItems.length === 0) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <AlertCircle size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No Fee Items Configured</h5>
                    <p className="text-muted mb-3">Add fee items to build the fee structure for this class and term.</p>
                    {canEdit && (
                        <button className="btn btn-primary" onClick={onAddItem}>
                            Add First Fee Item
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                {selectedItems.length > 0 ? (
                    <div className="d-flex justify-content-between align-items-center bg-light-subtle p-1 rounded">
                        <span className="fw-bold text-primary">{selectedItems.length} selected</span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-danger" onClick={onBulkDelete}>
                                <Trash2 size={14} className="me-1" /> Delete Selected
                            </button>
                            <button className="btn btn-sm btn-outline-warning" onClick={() => onBulkStatus(true)}>
                                Set Mandatory
                            </button>
                            <button className="btn btn-sm btn-outline-info" onClick={() => onBulkStatus(false)}>
                                Set Optional
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold">Fee Items</h6>
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={onDownloadPDF}
                                title="Download PDF"
                            >
                                <Download size={16} /> PDF
                            </button>
                            <button
                                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
                                onClick={onPrint}
                                title="Print Fee Structure"
                            >
                                <Printer size={16} /> Print
                            </button>
                            {canEdit && (
                                <button className="btn btn-sm btn-primary" onClick={onAddItem}>
                                    + Add Fee Item
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: '4%' }}>
                                    {canEdit && <input type="checkbox" className="form-check-input"
                                        onChange={handleSelectAll}
                                        checked={feeItems.length > 0 && selectedItems.length === feeItems.length}
                                    />}
                                </th>
                                <th style={{ width: '4%' }} onClick={() => handleSort('order')} className="cursor-pointer">#</th>
                                <th style={{ width: '20%' }} onClick={() => handleSort('name')} className="cursor-pointer">Fee Item Name</th>
                                <th style={{ width: '12%' }} onClick={() => handleSort('category')} className="cursor-pointer">Category</th>
                                <th style={{ width: '15%' }}>Chart of Accounts</th>
                                <th style={{ width: '15%' }} className="text-end" onClick={() => handleSort('amount')}>Amount</th>
                                <th style={{ width: '10%' }} onClick={() => handleSort('mandatory')}>Type</th>
                                <th style={{ width: '10%' }} onClick={() => handleSort('frequency')}>Frequency</th>
                                <th style={{ width: '5%' }}>Status</th>
                                {canEdit && <th style={{ width: '5%' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedItems.map((item, index) => {
                                const account = incomeAccounts.find(acc => acc.id === item.accountId);
                                const category = feeCategories.find(cat => cat.id === item.category);
                                const accountValidation = checkAccountMapping(item.accountId, item.category, incomeAccounts, feeCategories);

                                return (
                                    <tr key={item.id} className={item.status === 'Active' ? '' : 'table-secondary'}>
                                        <td>
                                            {canEdit && <input type="checkbox" className="form-check-input"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectRow(item.id)}
                                            />}
                                        </td>
                                        <td className="text-muted">{index + 1}</td>
                                        <td>
                                            <div className="fw-semibold">{item.name}</div>
                                            {item.appliesTo !== 'All Students' && (
                                                <small className="text-muted">{item.appliesTo}</small>
                                            )}
                                        </td>
                                        <td>
                                            <span className={getCategoryBadge(item.category, feeCategories)}>
                                                {category?.name || item.category}
                                            </span>
                                        </td>
                                        <td>
                                            {account ? (
                                                <div>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <span className="font-monospace small">{account.code}</span>
                                                        {accountValidation.warning && (
                                                            <AlertCircle size={14} className="text-warning" title={accountValidation.message} />
                                                        )}
                                                        {!accountValidation.isValid && (
                                                            <AlertCircle size={14} className="text-danger" title={accountValidation.message} />
                                                        )}
                                                    </div>
                                                    <small className="text-muted">{account.name}</small>
                                                </div>
                                            ) : (
                                                <span className="text-danger small">
                                                    <AlertCircle size={14} className="me-1" />
                                                    Not Mapped
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-end fw-bold">
                                            {canEdit && editingAmountId === item.id ? (
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-end"
                                                    value={editAmountValue}
                                                    autoFocus
                                                    onChange={(e) => setEditAmountValue(e.target.value)}
                                                    onBlur={() => {
                                                        onInlineUpdate(item, editAmountValue);
                                                        setEditingAmountId(null);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            onInlineUpdate(item, editAmountValue);
                                                            setEditingAmountId(null);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => {
                                                        if (canEdit) {
                                                            setEditingAmountId(item.id);
                                                            setEditAmountValue(item.amount);
                                                        }
                                                    }}
                                                    className={canEdit ? "cursor-pointer border-bottom border-dashed border-secondary-subtle" : ""}
                                                    title={canEdit ? "Click to edit" : ""}
                                                >
                                                    {formatKES(item.amount)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${item.mandatory ? 'bg-danger' : 'bg-info'}`}>
                                                {item.mandatory ? 'Mandatory' : 'Optional'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="small">{item.frequency}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        {canEdit && (
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => onEdit(item)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => onDuplicate(item)}
                                                        title="Duplicate"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => onDelete(item)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="table-light sticky-footer">
                            <tr className="fw-bold">
                                <td colSpan={canEdit ? 4 : 3} className="text-end">Mandatory Fees:</td>
                                <td className="text-end">{formatKES(totals.mandatory)}</td>
                                <td colSpan={canEdit ? 4 : 3}></td>
                            </tr>
                            <tr className="fw-bold">
                                <td colSpan={canEdit ? 4 : 3} className="text-end">Optional Fees:</td>
                                <td className="text-end">{formatKES(totals.optional)}</td>
                                <td colSpan={canEdit ? 4 : 3}></td>
                            </tr>
                            <tr className="fw-bold table-primary">
                                <td colSpan={canEdit ? 4 : 3} className="text-end">TOTAL TERM FEE:</td>
                                <td className="text-end fs-5">{formatKES(totals.total)}</td>
                                <td colSpan={canEdit ? 4 : 3}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FeeItemsTable;
