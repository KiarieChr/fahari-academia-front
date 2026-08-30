import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import DashboardLayout from '../../../dashboard/DashboardLayout';
import { fleetService } from '../../../services/fleetService';
import ContentLoader from '../../../components/common/ContentLoader';
import '../../../dashboard/dashboard.css';

const FuelLogsPage = () => {
    const [loading, setLoading] = useState(true);
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [fuelLogs, setFuelLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [fuelForm, setFuelForm] = useState({
        vehicle: '',
        driver: '',
        filled_at: '',
        odometer_km: 0,
        liters: 0,
        unit_price: 0,
        total_cost: 0,
        payment_method: 'cash',
        station_name: '',
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [fuelRes, vehiclesRes, driversRes] = await Promise.all([
                fleetService.fuelLogs.list(),
                fleetService.vehicles.list(),
                fleetService.drivers.list(),
            ]);
            setFuelLogs(fuelRes.results || fuelRes || []);
            setVehicles(vehiclesRes.results || vehiclesRes || []);
            setDrivers(driversRes.results || driversRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load fuel logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitFuel = async (e) => {
        e.preventDefault();
        try {
            await fleetService.fuelLogs.create(fuelForm);
            toast.success('Fuel log created');
            setFuelForm({ vehicle: '', driver: '', filled_at: '', odometer_km: 0, liters: 0, unit_price: 0, total_cost: 0, payment_method: 'cash', station_name: '' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to log fuel');
        }
    };

    return (
        <DashboardLayout title="Fuel Logs">
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Fuel Logs</h1>
                    <p>Manage fleet fuel consumption</p>
                </div>
                {loading ? (
                    <div className="chart-container-compact p-8 flex justify-center">
                        <ContentLoader size="lg" message="Loading fuel logs..." />
                    </div>
                ) : (
                    <>
                        <div className="chart-container-compact">
                            <div className="chart-header-compact flex justify-between items-center">
                                <h3>Recent Fuel Logs</h3>
                                <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                    <Plus size={16} /> Add Fuel Log
                                </button>
                            </div>
                            <ul className="space-y-2 text-sm mt-3">
                                {fuelLogs.map((log) => (
                                    <li key={log.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-slate-800">{log.vehicle_registration}</div>
                                            <div className="text-slate-500 text-xs mt-1">{log.liters} Liters @ {log.station_name || 'Station'}</div>
                                        </div>
                                        <span className="font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">KES {log.total_cost}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title className="text-lg font-bold">Add Fuel Log</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <form onSubmit={submitFuel} className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Vehicle</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={fuelForm.vehicle} onChange={(e) => setFuelForm({ ...fuelForm, vehicle: e.target.value })} required>
                                            <option value="">Select vehicle...</option>
                                            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Driver (Optional)</label>
                                        <select className="w-full border rounded-lg px-3 py-2" value={fuelForm.driver} onChange={(e) => setFuelForm({ ...fuelForm, driver: e.target.value })}>
                                            <option value="">Select driver...</option>
                                            {drivers.map((d) => <option key={d.id} value={d.id}>{d.employee_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Date & Time Filled</label>
                                        <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={fuelForm.filled_at} onChange={(e) => setFuelForm({ ...fuelForm, filled_at: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Station Name</label>
                                        <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Shell" value={fuelForm.station_name} onChange={(e) => setFuelForm({ ...fuelForm, station_name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Current Odometer (km)</label>
                                        <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0" value={fuelForm.odometer_km} onChange={(e) => setFuelForm({ ...fuelForm, odometer_km: Number(e.target.value) || 0 })} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Liters</label>
                                            <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0.00" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: Number(e.target.value) || 0 })} required />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 mb-1 block">Unit Price</label>
                                            <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0.00" value={fuelForm.unit_price} onChange={(e) => setFuelForm({ ...fuelForm, unit_price: Number(e.target.value) || 0 })} required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Total Cost</label>
                                        <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 bg-slate-50 font-bold" placeholder="0.00" value={fuelForm.total_cost} onChange={(e) => setFuelForm({ ...fuelForm, total_cost: Number(e.target.value) || 0 })} required />
                                    </div>
                                    <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Fuel Log</button>
                                </form>
                            </Offcanvas.Body>
                        </Offcanvas>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default FuelLogsPage;
