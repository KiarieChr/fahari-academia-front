
import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { Plus, RefreshCcw } from 'lucide-react';
import StatsCards from './components/StatsCards';
import RequisitionList from './components/RequisitionList';
import RequisitionForm from './components/RequisitionForm';
import RequisitionDetails from './components/RequisitionDetails';
import procurementApi from '../../../services/procurementApiService';
import { toast } from 'react-toastify';
import './PurchaseRequisition.css';


const PurchaseRequisitionDashboard = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'view'
    const [loading, setLoading] = useState(true);
    const [requisitions, setRequisitions] = useState([]);
    const [stats, setStats] = useState({});
    const [selectedRequisition, setSelectedRequisition] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                procurementApi.requisitions.list(),
                procurementApi.requisitions.stats(),
            ]);
            const items = listRes.results || listRes || [];
            setRequisitions(items.map(r => ({
                ...r,
                id: r.id,
                title: r.justification || r.requisition_number,
                requestedBy: r.requested_by_name || '',
                requestDate: r.created_at?.split('T')[0],
                requiredDate: r.date_needed,
                totalAmount: Number(r.total_estimated_cost) || 0,
                status: formatStatus(r.status),
                priority: capitalize(r.priority),
                items: [],
                approvals: [],
            })));
            setStats({
                total: statsRes.total || 0,
                pending: statsRes.submitted || 0,
                approved: statsRes.approved || 0,
                rejected: statsRes.rejected || 0,
                poCreated: statsRes.converted || 0,
                totalAmount: items.reduce((s, r) => s + (Number(r.total_estimated_cost) || 0), 0),
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load requisitions");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async (data) => {
        try {
            toast.loading("Submitting requisition...");
            const payload = {
                department: data.department,
                date_needed: data.requiredDate,
                priority: (data.priority || 'MEDIUM').toUpperCase(),
                justification: data.description || data.title,
                notes: data.notes || '',
                lines: (data.items || []).map(item => ({
                    description: item.name || item.description,
                    quantity: item.quantity,
                    unit_of_measure: item.unit || 'Pcs',
                    estimated_unit_cost: item.unitCost || 0,
                })),
            };
            if (selectedRequisition?.id) {
                await procurementApi.requisitions.update(selectedRequisition.id, payload);
                toast.dismiss();
                toast.success("Requisition updated!");
            } else {
                await procurementApi.requisitions.create(payload);
                toast.dismiss();
                toast.success("Requisition created successfully!");
            }
            setViewMode('list');
            fetchData();
        } catch (error) {
            toast.dismiss();
            toast.error(error?.data?.detail || "Failed to save requisition");
        }
    };

    const handleView = async (req) => {
        try {
            const detail = await procurementApi.requisitions.get(req.id);
            setSelectedRequisition({
                ...req,
                ...detail,
                title: detail.justification || detail.requisition_number,
                requestedBy: detail.requested_by_name || '',
                requestDate: detail.created_at?.split('T')[0],
                requiredDate: detail.date_needed,
                totalAmount: Number(detail.total_estimated_cost) || 0,
                status: formatStatus(detail.status),
                priority: capitalize(detail.priority),
                description: detail.justification,
                budgetLine: detail.budget_line || '',
                items: (detail.lines || []).map(l => ({
                    id: l.id,
                    name: l.description,
                    category: '',
                    quantity: Number(l.quantity),
                    unit: l.unit_of_measure,
                    unitCost: Number(l.estimated_unit_cost),
                    total: Number(l.estimated_total),
                })),
                approvals: detail.approved_by_name ? [{
                    stage: 'Approver',
                    status: detail.status === 'REJECTED' ? 'Rejected' : 'Approved',
                    user: detail.approved_by_name,
                    date: detail.approved_at || '',
                    comments: detail.rejection_reason || 'Approved',
                }] : [],
            });
            setViewMode('view');
        } catch {
            toast.error("Failed to load requisition details");
        }
    };

    const handleEdit = (req) => {
        setSelectedRequisition(req);
        setViewMode('create');
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

function formatStatus(s) {
    const map = {
        DRAFT: 'Draft', SUBMITTED: 'Pending Approval', APPROVED: 'Approved',
        REJECTED: 'Rejected', CONVERTED: 'PO Created', CANCELLED: 'Cancelled',
    };
    return map[s] || s;
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

