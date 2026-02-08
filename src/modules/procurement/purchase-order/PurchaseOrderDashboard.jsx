import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';

import POCards from './components/POCards';
import POList from './components/POList';
import POCreateModal from './components/POCreateModal';
import procurementPOService from '../../../services/procurementPOService';
import './PurchaseOrder.css';

const PurchaseOrderDashboard = () => {
  const [poList, setPoList] = useState([]);
  const [filters, setFilters] = useState({});
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    procurementPOService.list().then(setPoList);
  }, []);

  return (
    <DashboardLayout title="Purchase Orders">
      <div className="dashboard-main-content">
        <div className="dashboard-top-section">
          <POCards data={poList} onFilter={setFilters} />
          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create PO</button>
          </div>
        </div>

        <POList data={poList} filters={filters} refresh={() => procurementPOService.list().then(setPoList)} />

        {showCreate && <POCreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); procurementPOService.list().then(setPoList); }} />}
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrderDashboard;
