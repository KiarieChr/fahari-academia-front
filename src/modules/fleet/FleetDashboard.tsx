import React, { useEffect, useMemo, useState } from 'react';
import { Car, Fuel, Wrench, Route, DollarSign, Users, Plus } from 'lucide-react';

import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import DashboardLayout from '../../dashboard/DashboardLayout';
import StatCardMini from '../../dashboard/components/StatCardMini';
import { fleetService } from '../../services/fleetService';
import { api } from '../../services/api';
import '../../dashboard/dashboard.css';

const initialVehicleForm = {
    registration_number: '',
    make: '',
    model: '',
    year: '',
    vehicle_type: 'van',
    fuel_type: 'diesel',
    status: 'active',
    capacity: 0,
    current_odometer_km: 0,
};

const FleetDashboard = ({ noLayout = false }) => {
    const searchString = typeof window !== 'undefined' ? window.location.search : '';
    const [activeTab, setActiveTab] = useState('vehicles');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [fuelLogs, setFuelLogs] = useState([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [vehicleForm, setVehicleForm] = useState(initialVehicleForm);
    const [tripForm, setTripForm] = useState({
        reference_number: '',
        vehicle: '',
        driver: '',
        purpose: '',
        origin: '',
        destination: '',
        departure_time: '',
        status: 'planned',
    });
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
    const [expenseForm, setExpenseForm] = useState({
        vehicle: '',
        expense_type: 'fuel',
        expense_date: '',
        amount: 0,
        description: '',
    });
    const [driverForm, setDriverForm] = useState({
        employee: '',
        license_number: '',
        license_class: '',
        license_expiry: '',
        status: 'active',
    });

    const tabs = useMemo(() => ([
        { key: 'vehicles', label: 'Vehicles' },
        { key: 'drivers', label: 'Drivers' },
        { key: 'trips', label: 'Trips' },
        { key: 'fuel', label: 'Fuel Logs' },
        { key: 'maintenance', label: 'Maintenance' },
        { key: 'expenses', label: 'Expenses' },
    ]), []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [
                summaryRes,
                vehiclesRes,
                driversRes,
                tripsRes,
                fuelRes,
                maintenanceRes,
                expensesRes,
                employeesRes,
                departmentsRes,
            ] = await Promise.all([
                fleetService.getDashboardSummary(),
                fleetService.vehicles.list(),
                fleetService.drivers.list(),
                fleetService.trips.list(),
                fleetService.fuelLogs.list(),
                fleetService.maintenanceRecords.list(),
                fleetService.expenses.list(),
                api.get('/workforce/api/employees/'),
                api.get('/workforce/api/departments/'),
            ]);

            setSummary(summaryRes);
            setVehicles(vehiclesRes.results || vehiclesRes || []);
            setDrivers(driversRes.results || driversRes || []);
            setTrips(tripsRes.results || tripsRes || []);
            setFuelLogs(fuelRes.results || fuelRes || []);
            setMaintenanceRecords(maintenanceRes.results || maintenanceRes || []);
            setExpenses(expensesRes.results || expensesRes || []);
            setEmployees(employeesRes.results || employeesRes || []);
            setDepartments(departmentsRes.results || departmentsRes || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load fleet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['vehicles', 'drivers', 'trips', 'fuel', 'maintenance', 'expenses'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchString]);

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

    const submitDriver = async (e) => {
        e.preventDefault();
        try {
            await fleetService.drivers.create(driverForm);
            toast.success('Driver profile created');
            setDriverForm({ employee: '', license_number: '', license_class: '', license_expiry: '', status: 'active' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to create driver profile');
        }
    };

    const submitTrip = async (e) => {
        e.preventDefault();
        try {
            await fleetService.trips.create(tripForm);
            toast.success('Trip logged');
            setTripForm({ reference_number: '', vehicle: '', driver: '', purpose: '', origin: '', destination: '', departure_time: '', status: 'planned' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to log trip');
        }
    };

    const submitFuel = async (e) => {
        e.preventDefault();
        try {
            await fleetService.fuelLogs.create(fuelForm);
            toast.success('Fuel log saved');
            setFuelForm({ vehicle: '', driver: '', filled_at: '', odometer_km: 0, liters: 0, unit_price: 0, total_cost: 0, payment_method: 'cash', station_name: '' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to save fuel log');
        }
    };

    const submitMaintenance = async (e) => {
        e.preventDefault();
        try {
            await fleetService.maintenanceRecords.create(maintenanceForm);
            toast.success('Maintenance record saved');
            setMaintenanceForm({ vehicle: '', maintenance_type: 'preventive', scheduled_date: '', description: '', status: 'scheduled', labor_cost: 0, parts_cost: 0, total_cost: 0 });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to save maintenance record');
        }
    };

    const submitExpense = async (e) => {
        e.preventDefault();
        try {
            await fleetService.expenses.create(expenseForm);
            toast.success('Expense saved');
            setExpenseForm({ vehicle: '', expense_type: 'fuel', expense_date: '', amount: 0, description: '' });
            setShowOffcanvas(false);
            loadData();
        } catch (error) {
            toast.error(error?.data?.detail || 'Failed to save expense');
        }
    };

    const content = (
            <div className="dashboard-home">
                <div className="dashboard-header">
                    <h1>Fleet Management</h1>
                    <p>Manage vehicles, mileage, services, maintenance, trips, drivers, and expenses.</p>
                </div>

                <div className="stats-grid-dense mb-4">
                    <StatCardMini title="Total Vehicles" value={summary?.total_vehicles || 0} icon={Car} color="#dbeafe" iconColor="#1d4ed8" />
                    <StatCardMini title="Active Vehicles" value={summary?.active_vehicles || 0} icon={Route} color="#dcfce7" iconColor="#15803d" />
                    <StatCardMini title="Monthly Fuel Cost" value={summary?.month_fuel_cost || 0} icon={Fuel} color="#fef3c7" iconColor="#d97706" />
                    <StatCardMini title="Maintenance Cost" value={summary?.month_maintenance_cost || 0} icon={Wrench} color="#fee2e2" iconColor="#dc2626" />
                    <StatCardMini title="Trips This Month" value={summary?.trips_this_month || 0} icon={Route} color="#e0e7ff" iconColor="#4338ca" />
                    <StatCardMini title="Drivers" value={drivers.length} icon={Users} color="#f3e8ff" iconColor="#7e22ce" />
                    <StatCardMini title="Due Service" value={summary?.due_service || 0} icon={Wrench} color="#ffedd5" iconColor="#c2410c" />
                    <StatCardMini title="Total Cost" value={summary?.month_total_cost || 0} icon={DollarSign} color="#d1fae5" iconColor="#065f46" />
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm mb-4">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="chart-container-compact"><p>Loading fleet data...</p></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {activeTab === 'vehicles' && (
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
                                                {vehicles.slice(0, 20).map((vehicle) => (
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

                        {activeTab === 'drivers' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact flex justify-between items-center">
                                        <h3>Driver Profiles</h3>
                                        <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                            <Plus size={16} /> Add Driver
                                        </button>
                                    </div>
                                    <ul className="space-y-2 text-sm mt-3">
                                        {drivers.slice(0, 25).map((driver) => (
                                            <li key={driver.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold">{driver.employee_name}</div>
                                                    <div className="text-slate-500 text-xs">ID: {driver.employee_no}</div>
                                                </div>
                                                <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">{driver.license_number}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title className="text-lg font-bold">Add Driver Profile</Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        <form onSubmit={submitDriver} className="flex flex-col gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Employee</label>
                                                <select className="w-full border rounded-lg px-3 py-2" value={driverForm.employee} onChange={(e) => setDriverForm({ ...driverForm, employee: e.target.value })} required>
                                                    <option value="">Select employee...</option>
                                                    {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.employee_no} - {emp.first_name} {emp.last_name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">License Number</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. DL123456" value={driverForm.license_number} onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">License Class</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. BCE" value={driverForm.license_class} onChange={(e) => setDriverForm({ ...driverForm, license_class: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">License Expiry Date</label>
                                                <input type="date" className="w-full border rounded-lg px-3 py-2" value={driverForm.license_expiry} onChange={(e) => setDriverForm({ ...driverForm, license_expiry: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
                                                <select className="w-full border rounded-lg px-3 py-2" value={driverForm.status} onChange={(e) => setDriverForm({ ...driverForm, status: e.target.value })}>
                                                    <option value="active">Active</option>
                                                    <option value="suspended">Suspended</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                            <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Driver Profile</button>
                                        </form>
                                    </Offcanvas.Body>
                                </Offcanvas>
                            </>
                        )}

                        {activeTab === 'trips' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact flex justify-between items-center">
                                        <h3>Recent Trips</h3>
                                        <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                            <Plus size={16} /> Log Trip
                                        </button>
                                    </div>
                                    <ul className="space-y-2 text-sm mt-3">
                                        {trips.slice(0, 25).map((trip) => (
                                            <li key={trip.id} className="border border-slate-200 rounded-lg p-3">
                                                <div className="font-semibold text-slate-800">{trip.reference_number} - {trip.vehicle_registration}</div>
                                                <div className="text-slate-500 mt-1">{trip.origin} to {trip.destination} | <span className="font-medium text-indigo-600">{trip.status}</span></div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title className="text-lg font-bold">Log Trip</Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        <form onSubmit={submitTrip} className="flex flex-col gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Reference Number</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. TRP-1001" value={tripForm.reference_number} onChange={(e) => setTripForm({ ...tripForm, reference_number: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Departure Time</label>
                                                <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={tripForm.departure_time} onChange={(e) => setTripForm({ ...tripForm, departure_time: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Vehicle</label>
                                                <select className="w-full border rounded-lg px-3 py-2" value={tripForm.vehicle} onChange={(e) => setTripForm({ ...tripForm, vehicle: e.target.value })} required>
                                                    <option value="">Select vehicle...</option>
                                                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Driver</label>
                                                <select className="w-full border rounded-lg px-3 py-2" value={tripForm.driver} onChange={(e) => setTripForm({ ...tripForm, driver: e.target.value })} required>
                                                    <option value="">Select driver...</option>
                                                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.employee_name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Origin</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="Starting Point" value={tripForm.origin} onChange={(e) => setTripForm({ ...tripForm, origin: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Destination</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="Ending Point" value={tripForm.destination} onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Purpose</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="Reason for trip" value={tripForm.purpose} onChange={(e) => setTripForm({ ...tripForm, purpose: e.target.value })} required />
                                            </div>
                                            <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Trip</button>
                                        </form>
                                    </Offcanvas.Body>
                                </Offcanvas>
                            </>
                        )}

                        {activeTab === 'fuel' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact flex justify-between items-center">
                                        <h3>Recent Fuel Logs</h3>
                                        <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                            <Plus size={16} /> Add Fuel Log
                                        </button>
                                    </div>
                                    <ul className="space-y-2 text-sm mt-3">
                                        {fuelLogs.slice(0, 25).map((log) => (
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

                        {activeTab === 'maintenance' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact flex justify-between items-center">
                                        <h3>Maintenance Records</h3>
                                        <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                            <Plus size={16} /> Add Record
                                        </button>
                                    </div>
                                    <ul className="space-y-2 text-sm mt-3">
                                        {maintenanceRecords.slice(0, 25).map((record) => (
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
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Maintenance Type</label>
                                                <select className="w-full border rounded-lg px-3 py-2" value={maintenanceForm.maintenance_type} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value })}>
                                                    <option value="preventive">Preventive</option>
                                                    <option value="corrective">Corrective</option>
                                                    <option value="inspection">Inspection</option>
                                                    <option value="tire">Tire</option>
                                                    <option value="other">Other</option>
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
                                                    <option value="canceled">Canceled</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Oil change and brake inspection" value={maintenanceForm.description} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })} required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Labor Cost</label>
                                                    <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0.00" value={maintenanceForm.labor_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, labor_cost: Number(e.target.value) || 0 })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-500 mb-1 block">Parts Cost</label>
                                                    <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="0.00" value={maintenanceForm.parts_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, parts_cost: Number(e.target.value) || 0 })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Total Cost</label>
                                                <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 bg-slate-50 font-bold" placeholder="0.00" value={maintenanceForm.total_cost} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, total_cost: Number(e.target.value) || 0 })} />
                                            </div>
                                            <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Maintenance</button>
                                        </form>
                                    </Offcanvas.Body>
                                </Offcanvas>
                            </>
                        )}

                        {activeTab === 'expenses' && (
                            <>
                                <div className="chart-container-compact">
                                    <div className="chart-header-compact flex justify-between items-center">
                                        <h3>Expense Ledger</h3>
                                        <button onClick={() => setShowOffcanvas(true)} className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold inline-flex items-center gap-2">
                                            <Plus size={16} /> Add Expense
                                        </button>
                                    </div>
                                    <ul className="space-y-2 text-sm mt-3">
                                        {expenses.slice(0, 25).map((expense) => (
                                            <li key={expense.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-slate-800">{expense.vehicle_registration}</div>
                                                    <div className="text-slate-500 text-xs mt-1 capitalize">{expense.expense_type} Expense</div>
                                                </div>
                                                <span className="font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">KES {expense.amount}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title className="text-lg font-bold">Add Expense</Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        <form onSubmit={submitExpense} className="flex flex-col gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Vehicle</label>
                                                <select className="w-full border rounded-lg px-3 py-2" value={expenseForm.vehicle} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })} required>
                                                    <option value="">Select vehicle...</option>
                                                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registration_number}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Expense Type</label>
                                                <select className="w-full border rounded-lg px-3 py-2" value={expenseForm.expense_type} onChange={(e) => setExpenseForm({ ...expenseForm, expense_type: e.target.value })}>
                                                    <option value="fuel">Fuel</option>
                                                    <option value="service">Service</option>
                                                    <option value="repair">Repair</option>
                                                    <option value="tires">Tires</option>
                                                    <option value="insurance">Insurance</option>
                                                    <option value="license">License</option>
                                                    <option value="allowance">Allowance</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Date</label>
                                                <input type="date" className="w-full border rounded-lg px-3 py-2" value={expenseForm.expense_date} onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Amount (KES)</label>
                                                <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 bg-slate-50" placeholder="0.00" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) || 0 })} required />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 mb-1 block">Description</label>
                                                <input className="w-full border rounded-lg px-3 py-2" placeholder="Enter details" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
                                            </div>
                                            <button type="submit" className="w-full mt-4 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold">Save Expense</button>
                                        </form>
                                    </Offcanvas.Body>
                                </Offcanvas>
                            </>
                        )}
                    </div>
                )}
            </div>
    );

    if (noLayout) {
        return content;
    }

    return (
        <DashboardLayout title="Fleet Management">
            {content}
        </DashboardLayout>
    );
};

export default FleetDashboard;
