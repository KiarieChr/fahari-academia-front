
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, RefreshCcw } from 'lucide-react';
import StatsCards from './components/StatsCards';
import RequisitionList from './components/RequisitionList';
import RequisitionForm from './components/RequisitionForm';
import RequisitionDetails from './components/RequisitionDetails';
import { procurementService } from '../../../services/procurementService';
import { toast } from 'react-toastify';
import './PurchaseRequisition.css';


const PurchaseRequisitionDashboard = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'view'
    const [loading, setLoading] = useState(true);
    const [requisitions, setRequisitions] = useState([]);
    const [stats, setStats] = useState({});
    const [selectedRequisition, setSelectedRequisition] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await procurementService.getRequisitions();
            setRequisitions(res.data);
            setStats(res.stats);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requisitions");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        try {
            toast.loading("Submitting requisition...");
            await procurementService.createRequisition(data);
            toast.dismiss();
            toast.success("Requisition created successfully!");
            setViewMode('list');
            fetchData();
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to create requisition");
        }
    };

    const handleView = (req) => {
        setSelectedRequisition(req);
        setViewMode('view');
    };

    const handleEdit = (req) => {
        setSelectedRequisition(req);
        setViewMode('create'); // Reuse form for edit
    };

    return (
        <DashboardLayout title="Purchase Requisitions">
            <div className="dashboard-main-content">
                <div className="dashboard-top-section">
                    <div className="flex-1">
                        <StatsCards stats={stats} loading={loading} />
                    </div>

                    {viewMode === 'list' && (
                        <div className="dashboard-actions pt-2">
                            <button
                                onClick={fetchData}
                                className="btn btn-sm btn-outline-secondary"
                                title="Refresh Data"
                            >
                                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={() => { setSelectedRequisition(null); setViewMode('create'); }}
                                className="btn btn-primary"
                            >
                                <Plus size={18} /> Create Requisition
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                {viewMode === 'list' ? (
                    <RequisitionList
                        requisitions={requisitions}
                        loading={loading}
                        onView={handleView}
                        onEdit={handleEdit}
                    />
                ) : viewMode === 'create' ? (
                    <RequisitionForm
                        onCancel={() => setViewMode('list')}
                        onSubmit={handleCreate}
                        initialData={selectedRequisition}
                    />
                ) : (
                    <RequisitionDetails
                        requisition={selectedRequisition}
                        onBack={() => setViewMode('list')}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default PurchaseRequisitionDashboard;

