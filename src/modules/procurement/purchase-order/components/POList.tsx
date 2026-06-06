import React, { useMemo, useState } from 'react';

const POList = ({ data = [], filters = {}, refresh = () => { } }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let out = data;
    if (filters.status) out = out.filter(d => d.status === filters.status);
    if (search) {
      const s = search.toLowerCase();
      out = out.filter(d => (d.poNumber || '').toLowerCase().includes(s) || (d.supplierName || '').toLowerCase().includes(s) || (d.requisitionNumber || '').toLowerCase().includes(s));
    }
    return out;
  }, [data, filters, search]);

  return (
    <div className="dashboard-table-container mt-3">
      <div className="dashboard-table-header">
        <div className="dashboard-search-container">
          <input className="form-control form-control-sm" placeholder="Search PO, supplier, requisition" value={search} onChange={e => setSearch(e.target.value)} />
          <button className="btn btn-sm btn-outline-secondary" onClick={() => refresh()}>Refresh</button>
        </div>
        <div>
          <button className="btn btn-sm btn-outline-primary me-2">Export Excel</button>
          <button className="btn btn-sm btn-outline-secondary">Export PDF</button>
        </div>
      </div>
      <div className="dashboard-table-body p-3">
        <div className="table-responsive">
          <table className="table table-sm table-striped table-compact">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Requisition</th>
                <th>Supplier</th>
                <th>PO Date</th>
                <th>Expected Delivery</th>
                <th>Total Amount</th>
                <th>Delivered</th>
                <th>Outstanding</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(po => (
                <tr key={po.id}>
                  <td>{po.poNumber}</td>
                  <td>{po.requisitionNumber}</td>
                  <td>{po.supplierName}</td>
                  <td>{po.poDate}</td>
                  <td>{po.expectedDelivery}</td>
                  <td>{po.totalAmount?.toFixed?.(2)}</td>
                  <td>{po.amountDelivered?.toFixed?.(2) || 0}</td>
                  <td>{((po.totalAmount || 0) - (po.amountDelivered || 0)).toFixed(2)}</td>
                  <td>{po.paymentStatus || 'Unpaid'}</td>
                  <td><span className={`badge bg-${po.status === 'Issued' ? 'primary' : po.status === 'Completed' ? 'success' : 'secondary'}`}>{po.status}</span></td>
                  <td>
                    <button className="btn btn-sm btn-link">View</button>
                    <button className="btn btn-sm btn-link">Edit</button>
                    <button className="btn btn-sm btn-link">Print</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center">No purchase orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default POList;
