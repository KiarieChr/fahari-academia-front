import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { fleetService } from '../../../services/fleetService';
import { TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import ContentLoader from '../../../components/common/ContentLoader';
import '../../../dashboard/dashboard.css';

const initialVehicleForm = {
    registration_number: '',
    make: '',
    model: '',
    year: '' as string | number,
    vehicle_type: 'van',
    fuel_type: 'diesel',
    status: 'active',
    capacity: 0,
    current_odometer_km: 0,
};

const VehiclesPage = () => {
    const [loading, setLoading] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);

    const loadData = async () => {
        setLoading(true);
        try {
            const vehiclesRes = await fleetService.vehicles.list();
            setVehicles(vehiclesRes.results || vehiclesRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitVehicle = async (e) => {
        e.preventDefault();
        try {
            await fleetService.vehicles.create(vehicleForm);
            toast.success('Vehicle created');
            setVehicleForm(initialVehicleForm);
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to create vehicle');
        }
    };

    return (
        <DashboardLayout title="Vehicles Register">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Vehicles Register</h1>
                    <p>Manage fleet vehicles</p>
                </div>
                {loading ? (
                    <div className="chart-container-compact p-8 flex justify-center">
                        <ContentLoader size="lg" message="Loading vehicles..." />
                    </div>
                ) : (
                    <>
                        <div className="chart-container-compact">
                            <div className="chart-header-compact flex justify-between items-center">
                                <h3>Vehicle Register</h3>
                                <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                    <Plus size={16} /> Add Vehicle
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left border-b"><th className="py-2">Reg.</th><th>Vehicle</th><th>Status</th><th>Odometer</th></tr></thead>
                                    <tbody>
                                        {vehicles.map((vehicle) => (
                                            <tr key={vehicle.id} className="border-b border-slate-100"><td className="py-2 font-semibold">{vehicle.registration_number}</td><td>{vehicle.make} {vehicle.model}</td><td>{vehicle.status}</td><td>{vehicle.current_odometer_km}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title className="text-lg font-bold">Add Vehicle</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <form onSubmit={submitVehicle} className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Registration Number</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. KAA 123A" value={vehicleForm.registration_number} onChange={(e) => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Make</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Toyota" value={vehicleForm.make} onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Model</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Hiace" value={vehicleForm.model} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Year</label>
                                        <input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 2020" value={vehicleForm.year} onChange={(e) => setVehicleForm({ ...vehicleForm, year: Number(e.target.value) || '' })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Vehicle Type</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={vehicleForm.vehicle_type} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}>
                                            <option value="bus">Bus</option><option value="van">Van</option><option value="pickup">Pickup</option><option value="saloon">Saloon</option><option value="truck">Truck</option><option value="motorbike">Motorbike</option><option value="ambulance">Ambulance</option><option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}>
                                            <option value="active">Active</option><option value="maintenance">Under Maintenance</option><option value="grounded">Grounded</option><option value="disposed">Disposed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Fuel Type</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Diesel" value={vehicleForm.fuel_type} onChange={(e) => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Capacity (Passengers/Tonnes)</label>
                                        <input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="Capacity" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) || 0 })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Current Odometer (km)</label>
                                        <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 150000" value={vehicleForm.current_odometer_km} onChange={(e) => setVehicleForm({ ...vehicleForm, current_odometer_km: Number(e.target.value) || 0 })} />
                                    </div>
                                    <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Vehicle</button>
                                </form>
                            </Offcanvas.Body>
                        </Offcanvas>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VehiclesPage;
