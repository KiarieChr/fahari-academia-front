import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { fleetService } from '../../../services/fleetService';
import ContentLoader from '../../../components/common/ContentLoader';
import '../../../dashboard/dashboard.css';

const MaintenancePage = () => {
    const [loading, setLoading] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [maintenanceForm, setMaintenanceForm] = useState({
        vehicle: '',
        maintenance_type: 'preventive',
        scheduled_date: '',
        description: '',
        status: 'scheduled',
        labor_cost: 0,
        parts_cost: 0,
        total_cost: 0,
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [maintenanceRes, vehiclesRes] = await Promise.all([
                fleetService.maintenanceRecords.list(),
                fleetService.vehicles.list(),
            ]);
            setMaintenanceRecords(maintenanceRes.results || maintenanceRes || []);
            setVehicles(vehiclesRes.results || vehiclesRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load maintenance records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitMaintenance = async (e) => {
        e.preventDefault();
        try {
            await fleetService.maintenanceRecords.create(maintenanceForm);
            toast.success('Maintenance record created');
            setMaintenanceForm({ vehicle: '', maintenance_type: 'preventive', scheduled_date: '', description: '', status: 'scheduled', labor_cost: 0, parts_cost: 0, total_cost: 0 });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to log maintenance');
        }
    };

    return (
        <DashboardLayout title="Maintenance Records">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Maintenance Records</h1>
                    <p>Track and schedule fleet maintenance</p>
                </div>
                {loading ? (
                    <div className="chart-container-compact p-8 flex justify-center">
                        <ContentLoader size="lg" message="Loading maintenance records..." />
                    </div>
                ) : (
                    <>
                        <div className="chart-container-compact">
                            <div className="chart-header-compact flex justify-between items-center">
                                <h3>Maintenance Records</h3>
                                <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                    <Plus size={16} /> Add Record
                                </button>
                            </div>
                            <ul className="space-y-2 text-sm mt-3">
                                {maintenanceRecords.map((record) => (
                                    <li key={record.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-slate-800">{record.vehicle_registration}</div>
                                            <div className="text-slate-500 text-xs mt-1 capitalize">{record.maintenance_type} Maintenance</div>
                                        </div>
                                        <span className="font-bold text-slate-700">KES {record.total_cost}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title className="text-lg font-bold">Add Maintenance Record</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <form onSubmit={submitMaintenance} className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Vehicle</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={maintenanceForm.vehicle} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, vehicle: e.target.value })} required>
                                            <option value="">Select vehicle...</option>
                                            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Type</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={maintenanceForm.maintenance_type} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value })}>
                                            <option value="preventive">Preventive</option>
                                            <option value="repair">Repair</option>
                                            <option value="inspection">Inspection</option>
                                            <option value="tyre_change">Tyre Change</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Scheduled Date</label>
                                        <input type="date" className="w-full border rounded-lg px-3 py-2" value={maintenanceForm.scheduled_date} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, scheduled_date: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={maintenanceForm.status} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, status: e.target.value })}>
                                            <option value="scheduled">Scheduled</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
                                        <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Work performed..." value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Labor Cost</label>
                                            <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0.00" value={maintenanceForm.labor_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, labor_cost: Number(e.target.value) || 0, total_cost: (Number(e.target.value) || 0) + maintenanceForm.parts_cost })} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Parts Cost</label>
                                            <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0.00" value={maintenanceForm.parts_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, parts_cost: Number(e.target.value) || 0, total_cost: maintenanceForm.labor_cost + (Number(e.target.value) || 0) })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Total Cost</label>
                                        <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 bg-slate-50 font-bold" placeholder="0.00" value={maintenanceForm.total_cost} readOnly />
                                    </div>
                                    <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Maintenance Record</button>
                                </form>
                            </Offcanvas.Body>
                        </Offcanvas>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MaintenancePage;
