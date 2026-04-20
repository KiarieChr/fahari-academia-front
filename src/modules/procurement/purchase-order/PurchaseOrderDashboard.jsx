import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import POCards from './components/POCards';
import POList from './components/POList';
import POCreateModal from './components/POCreateModal';
import procurementApi from '../../../services/procurementApiService';
import { toast } from 'react-toastify';
import './PurchaseOrder.css';

const PurchaseOrderDashboard = () => {
  const [poList, setPoList] = useState([]);
  const [filters, setFilters] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await procurementApi.purchaseOrders.list();
      const items = (res.results || res || []).map(po => ({
        id: po.id,
        poNumber: po.po_number,
        requisitionNumber: po.requisition_number || '-',
        supplierName: po.supplier_name || '',
        poDate: po.order_date,
        expectedDelivery: po.expected_delivery_date || '',
        totalAmount: Number(po.total_amount) || 0,
        amountDelivered: Math.round((Number(po.total_amount) || 0) * ((po.receipt_percentage || 0) / 100)),
        paymentStatus: po.status === 'FULLY_RECEIVED' || po.status === 'CLOSED' ? 'Paid' : po.receipt_percentage > 0 ? 'Partial' : 'Unpaid',
        status: formatPOStatus(po.status),
      }));
      setPoList(items);
    } catch {
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPOs(); }, [fetchPOs]);

  return (
    <DashboardLayout title="Purchase Orders">
      <div className="dashboard-main-content">
        <div className="dashboard-top-section">
          <POCards data={poList} onFilter={setFilters} />
          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create PO</button>
          </div>
        </div>

        <POList data={poList} filters={filters} refresh={fetchPOs} />

        {showCreate && <POCreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchPOs(); }} />}
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrderDashboard;

function formatPOStatus(s) {
  const map = {
    DRAFT: 'Draft', PENDING_APPROVAL: 'Pending Approval', APPROVED: 'Approved',
    SENT: 'Issued', PARTIALLY_RECEIVED: 'Partially Delivered',
    FULLY_RECEIVED: 'Completed', CLOSED: 'Completed', CANCELLED: 'Cancelled',
  };
  return map[s] || s;
}
